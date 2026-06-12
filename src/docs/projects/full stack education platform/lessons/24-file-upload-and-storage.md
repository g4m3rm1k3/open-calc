# Lesson 24 — File Upload and Storage

## What You Will Build

Let users upload a profile picture. Store it. Display it on the Profile screen. The
picture persists across sessions and appears next to the user's name everywhere it
is displayed.

---

## What You Need to Know First

- Lesson 11: Express, middleware
- Lesson 13: The `users` table
- Lesson 17: Auth middleware, `req.userId`

---

## The Lesson

### Step 1 — Binary Data and Encoding

Images are **binary data** — a sequence of bytes that is not valid text. A JPEG image
file is a stream of bytes with specific byte patterns indicating image dimensions, colour
data, compression blocks.

**Why you cannot send binary data in JSON:** JSON is a text format. It represents strings,
numbers, booleans, and objects as text. A binary byte sequence may include bytes that are
not valid UTF-8 characters — sending them as a JSON string would corrupt the data.

**Base64 encoding:** A technique for representing binary data as ASCII text using 64
printable characters (A-Z, a-z, 0-9, +, /). Every 3 bytes of binary data become 4
ASCII characters. A 100KB JPEG becomes a 133KB base64 string — 33% size increase.

Base64 is used when binary data must travel through a text channel: embedding images
in HTML (`<img src="data:image/jpeg;base64,...">`), attaching files in email, encoding
binary in JSON APIs.

**Multipart form data:** The standard way for browsers to upload files to servers.
Unlike `application/json`, `multipart/form-data` allows binary data in distinct "parts":

```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

[binary JPEG data here]
------WebKitFormBoundary
Content-Disposition: form-data; name="userId"

42
------WebKitFormBoundary--
```

Each part has its own `Content-Disposition` header and body. The browser constructs this
format when you submit a `<form enctype="multipart/form-data">` or use the `FormData` API.

### Step 2 — Security: File Upload Vulnerabilities

This is a required security section — file uploads are a common attack vector.

**Attack 1: Unrestricted file type upload.**
If your server accepts any file type and stores it in a web-accessible directory, an
attacker can upload a `malicious.php` file and request `https://yourserver.com/uploads/malicious.php`.
The web server executes the PHP, giving the attacker code execution on your server.

**Fix:** Validate file type by both MIME type and magic bytes. Do not rely on the file extension.
- The file extension (`photo.php`) is controlled by the user — useless for security.
- The MIME type (`Content-Type: application/php`) comes from the browser — controllable by the user.
- **Magic bytes** — the first few bytes of the file — are the actual format indicator.
  A JPEG always starts with `FF D8 FF`. A PNG starts with `89 50 4E 47`. Check magic bytes.

```typescript
import { fileTypeFromBuffer } from 'file-type'

async function validateImageFile(buffer: Buffer): Promise<boolean> {
  const fileType = await fileTypeFromBuffer(buffer)
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
  return fileType !== undefined && allowedTypes.has(fileType.mime)
}
```

**Attack 2: File size abuse.**
Without a size limit, an attacker uploads a 10GB file. The server runs out of memory
or disk space. Other users are denied service.

**Fix:** Set a maximum file size before the file is fully read:
```typescript
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  storage: multer.memoryStorage(),
})
```

`multer` reads only up to `fileSize` bytes. If the upload exceeds it, multer rejects it
before the full content is transmitted.

**Attack 3: Stored XSS via SVG.**
SVG files are XML that can contain JavaScript: `<svg><script>alert(document.cookie)</script></svg>`.
If you accept SVG uploads and serve them directly, any user who views the SVG executes the
script — it is stored XSS via a file.

**Fix:** Only accept JPEG, PNG, and WebP for profile pictures. If you must accept SVG,
sanitise it (remove `<script>` tags) or serve it with `Content-Type: text/plain` (prevents
execution).

### Step 3 — Object Storage

**Why not store on the filesystem?** The server's filesystem is tied to that specific
server instance. If you run two server instances (horizontal scaling), uploads to
instance A are not accessible on instance B. If the server is replaced (a deployment),
uploaded files are lost.

**Object storage** (S3, DigitalOcean Spaces, Cloudflare R2) stores files independently
of any server. Files are uploaded to a service and retrieved by URL. Multiple servers can
access the same files.

For development, use **MinIO** — an S3-compatible object storage server you run locally:

```bash
$ docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

**What CDN is:** A **Content Delivery Network** distributes files across servers in many
geographic locations. When a user in Tokyo requests a profile picture, they download it
from a Tokyo server, not from your API server in Virginia. CDNs reduce latency and server
load. Cloudflare, Amazon CloudFront, and Fastly are CDN providers.

Profile pictures, after upload, should be served from a CDN URL — not from your API server.
Every profile picture request to your API server is wasted API capacity.

### Step 4 — The Upload Route

Install dependencies:
```bash
$ npm install multer aws-sdk @aws-sdk/client-s3 file-type
$ npm install --save-dev @types/multer
```

```typescript
import { Router } from 'express'
import multer from 'multer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { fileTypeFromBuffer } from 'file-type'
import { authenticate } from '../middleware/authenticate'
import sharp from 'sharp'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),  // store file in memory (req.file.buffer)
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
})

const s3Client = new S3Client({
  endpoint: process.env['S3_ENDPOINT'] ?? 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env['S3_ACCESS_KEY'] ?? 'minioadmin',
    secretAccessKey: process.env['S3_SECRET_KEY'] ?? 'minioadmin',
  },
  region: 'us-east-1',
  forcePathStyle: true,  // required for MinIO
})

router.post('/avatar', authenticate, upload.single('avatar'), async (req, res, next) => {
  try {
    if (req.file === undefined) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // 1. Validate file type by magic bytes
    const fileType = await fileTypeFromBuffer(req.file.buffer)
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    if (fileType === undefined || !allowedTypes.has(fileType.mime)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are accepted' })
    }

    // 2. Resize to 256×256 (normalize avatar dimensions, reduce storage)
    const resized = await sharp(req.file.buffer)
      .resize(256, 256, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer()

    // 3. Upload to S3/MinIO
    const key = `avatars/${req.userId}-${Date.now()}.jpg`
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env['S3_BUCKET'] ?? 'codex-avatars',
      Key: key,
      Body: resized,
      ContentType: 'image/jpeg',
    }))

    const avatarUrl = `${process.env['S3_PUBLIC_URL']}/${key}`

    // 4. Update the user record
    await prisma.user.update({
      where: { id: req.userId! },
      data: { avatarUrl },
    })

    res.json({ avatarUrl })
  } catch (error) {
    next(error)
  }
})

export { router as uploadRouter }
```

**`multer.memoryStorage()` explained:**
`multer` is Express middleware for handling `multipart/form-data`. `memoryStorage()` stores
the uploaded file in memory as a `Buffer` (`req.file.buffer`). The alternative is disk
storage, but memory storage lets us validate and transform the file before persisting.
The 5MB limit prevents memory exhaustion.

**`sharp` image library:**
`sharp` is a high-performance image processing library. `resize(256, 256, { fit: 'cover' })`
crops and scales the image to 256×256 pixels. `jpeg({ quality: 85 })` converts to JPEG
at 85% quality. This normalises all uploaded images to the same format and size,
reducing storage costs and rendering predictability.

**`upload.single('avatar')`:** Multer middleware that accepts one file with the field
name `avatar`. Populates `req.file` with the uploaded file.

---

## Connect the Pieces

The file type validation with `file-type` (magic bytes) is defence in depth alongside
MIME type checking. Neither alone is sufficient: MIME type comes from the client (controllable);
magic bytes come from the file content (harder to fake but possible for skilled attackers).
Together, they reject the most common attack vectors.

The `sharp` resize step is a transformation in a processing pipeline — the same pattern
as the middleware chain in Lesson 11. The file flows through stages: receive → validate →
transform → store → respond.

Object storage (S3) separates concerns: the API server handles logic; S3 handles storage.
This is the same separation principle applied to infrastructure. If the API server is
replaced, the stored files remain in S3. This is the **stateless server** principle from
the twelve-factor app methodology (Lesson 31).

---

## What Breaks Without This

Without magic bytes validation, an attacker renames `malicious.php` to `photo.jpg` and
uploads it. The MIME type (`image/jpeg`) and extension (`.jpg`) pass checks. The file
is stored. If served from a PHP-enabled web server, requesting the URL executes the code.

Without a size limit, an attacker sends a multipart request with a 1GB body. The server
reads the entire body into memory. The Node.js process runs out of memory and crashes.
All concurrent users lose their sessions.

---

## Definition of Done

- [ ] Uploading a JPEG or PNG profile picture saves it and updates the profile screen
- [ ] The uploaded image is resized to 256×256 before storage
- [ ] Uploading a non-image file (`.txt`, `.pdf`) returns a 400 error
- [ ] Uploading a file over 5MB returns a 413 error
- [ ] The `avatarUrl` column is updated in the database after upload
- [ ] You can answer: what are magic bytes and why are they more trustworthy than file extensions?
- [ ] You can answer: why is object storage better than filesystem storage for uploaded files?
- [ ] You can answer: what is stored XSS via SVG and how do you prevent it?
- [ ] You can answer: what is a CDN and why are profile pictures served from one?
- [ ] `git commit` with a message explaining why — "Add profile picture upload with magic byte validation, 5MB limit, and S3 storage"
