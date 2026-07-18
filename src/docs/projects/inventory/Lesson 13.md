# Lesson 13: Serving Static Files and the Unified Origin

**What you will build**
You will embed the frontend directly into the FastAPI server using the `StaticFiles` application, transforming our backend into a full-stack monolith. The actual problem we are solving is the fragmented distribution of our system: right now, a user must open an HTML file from their local filesystem while a separate Python process runs the API. By serving the HTML directly from FastAPI, both the frontend and the backend share a single unified origin, simplifying deployment and drastically increasing security.

**What you need to know first**
From Lesson 9: FastAPI routing and the Uvicorn web server. From Lesson 11: The `nexus/frontend` directory containing `index.html` and `app.js`.

**The Pipeline**
`[ Browser (JS/DOM) ] → [ FastAPI (Static Routing) ] → Client Request → [ FastAPI (API Routing) ]`

This lesson introduces a bypass lane in our routing stage. When the browser requests a web page, FastAPI will intercept the request, bypass the Pydantic/SQLAlchemy layers entirely, and stream raw bytes from the disk back to the browser. Only when the browser executes the JavaScript will it fire a separate request into our established API pipeline.

---

## Concept Unit: Mounting Static Directory Apps

### The Problem

FastAPI endpoints (like `@app.get("/health")`) generate JSON dynamically using Python logic. However, an HTML file and a CSS stylesheet do not need to be calculated; they just need to be read from the hard drive and sent over the network exactly as they are. Writing a custom Python function to read and return every individual file in our `frontend/` folder is tedious and highly inefficient.

### Introduce the concept in isolation

Create `lab_static.py` to see how FastAPI can mount an independent static file application inside the main API router.

```python
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

# Setup a temporary folder and file
os.makedirs("temp_static", exist_ok=True)
with open("temp_static/hello.txt", "w") as f:
    f.write("Static delivery successful.")

app = FastAPI()

# Mount the folder to a specific URL path
app.mount("/assets", StaticFiles(directory="temp_static"), name="static")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8003)

```

Run it:

```bash
python lab_static.py

```

While the server runs, send a network request to the mounted path in a separate terminal:

```bash
curl http://127.0.0.1:8003/assets/hello.txt

```

Output:

```text
Static delivery successful.

```

*What this proves:* We did not write a `@app.get("/assets/hello.txt")` route. By using `app.mount()`, we delegated an entire URL branch (`/assets`) to a specialized sub-application (`StaticFiles`), which automatically mapped the incoming URL directly to the filesystem folder.

### Discard the throwaway example

Stop the server (Ctrl+C). Delete `lab_static.py` and the `temp_static` directory. We will now mount our actual NexusInventory frontend.

### Project Change

We will add `StaticFiles` to our main router. Because API routes are evaluated top-to-bottom, we must place the static mount at the very bottom of the file; otherwise, it will aggressively intercept requests meant for our JSON API.

* **Files affected:** `nexus/main.py`.
* **Change type:** Modify.
* **Location:** At the very end of the route definitions, just before the `if __name__ == "__main__":` block.
* **Dependencies:** Requires importing `StaticFiles` from `fastapi.staticfiles`.

### The New Code

```python
from fastapi.staticfiles import StaticFiles

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

```

### The Updated Project

Because this is an architectural modification to our application registry, here is the entirely reconstructed `nexus/main.py` file, exactly as it must exist to function properly.

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# ← new: Import the static file application
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn

from db import get_db_session
from schemas import SKUCreate, SKURead, ItemMove
import crud

app = FastAPI(title="NexusInventory API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "system": "online"}

@app.post("/skus", response_model=SKURead)
def create_sku_endpoint(sku_in: SKUCreate, db: Session = Depends(get_db_session)):
    try:
        return crud.create_sku(session=db, sku_in=sku_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/skus/{sku_id}", response_model=SKURead)
def read_sku_endpoint(sku_id: str, db: Session = Depends(get_db_session)):
    sku = crud.get_sku(session=db, target_id=sku_id)
    if not sku:
        raise HTTPException(status_code=404, detail="SKU not found")
    return sku

@app.post("/items/{serial}/move")
def move_item_endpoint(
    serial: str, 
    payload: ItemMove, 
    db: Session = Depends(get_db_session)
):
    try:
        crud.move_item(session=db, serial=serial, new_location_id=payload.new_location_id)
        return {"status": "success", "message": f"Item {serial} moved to location {payload.new_location_id}"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ← new: The catch-all static mount placed AT THE BOTTOM
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

```

The FastAPI server will now evaluate any incoming request: if it matches an exact API path like `/health` or `/skus`, it executes the Python logic. If it doesn't match any API path, it falls through to the root mount `/` and attempts to find a matching file inside the `frontend` folder.

### Mechanical walkthrough

1. `from fastapi.staticfiles import StaticFiles`: (First appearance). Imports the standalone ASGI application dedicated to static file delivery.
2. `app.mount(...)`: (First appearance). Attaches a completely independent sub-application to a specific path prefix on our main router.
3. `"/"`: (Already established syntax). The root path. We use the root instead of `/static` because we want users to just visit `[http://127.0.0.1:8000/](http://127.0.0.1:8000/)` and instantly see the application.
4. `StaticFiles(...)`: (First appearance). Instantiates the sub-application.
5. `directory="frontend"`: (First appearance). Instructs `StaticFiles` exactly which folder relative to `main.py` contains the assets.
6. `html=True`: (First appearance). A critical convenience flag. If a user visits the root `/`, this flag tells `StaticFiles` to automatically search for and serve the file named `index.html`.
7. `name="frontend"`: (First appearance). An internal identifier used by FastAPI if we ever need to dynamically generate URLs pointing to this mount in our code.

### CS Lens

**Zero-Copy File Transfer.** While standard Python logic reads data into memory buffers before sending it over a socket, `StaticFiles` leverages an operating system feature known as `sendfile`. This system call commands the OS kernel to pipe data directly from the hard drive's disk cache to the network socket, entirely bypassing the Python application's user-space memory. This makes serving static assets via ASGI incredibly efficient, handling thousands of concurrent file downloads with negligible memory usage.
*Also recognized in:* Nginx, Apache, and Kafka's high-throughput networking.

### SE Lens

Why did we put the API routes *above* the static mount? **Route Resolution Order.** FastAPI processes routing sequentially from top to bottom. If `app.mount("/", ...)` was placed at the very top of `main.py`, the `StaticFiles` application would intercept literally every single request (because everything starts with `/`). If a client requested `GET /skus/TEST-99`, `StaticFiles` would blindly look inside the `frontend` folder for a file named `skus/TEST-99`, fail to find it, and return a 404 error, completely hiding our actual JSON API. By placing the mount at the bottom, the API gets the first chance to answer, acting as a structural priority filter.

### Commands needed to make this unit real

No commands needed; if your FastAPI server is running with `reload=True`, it will restart automatically and mount the directory.

### Run it. Show the real output.

Open your web browser and navigate directly to the API's root address, exactly as if it were a production website:
`[http://127.0.0.1:8000/](http://127.0.0.1:8000/)`

Output in the browser:
You will instantly see the **SKU Activity Dashboard** populated with data, served directly by the Python web server.

### One sentence connecting this unit to what came immediately before.

Our browser just successfully loaded the HTML from port 8000, but our JavaScript file is still hardcoded to request data via an absolute, full-length URL which will break the moment we deploy this server to the cloud.

---

## Concept Unit: Relative Network Paths

### The Problem

In Lesson 12, our `app.js` file defined `const API_BASE = "[http://127.0.0.1:8000](http://127.0.0.1:8000)";`. If we deploy NexusInventory to a cloud server at `[https://nexus.example.com](https://nexus.example.com)`, the user's browser will download the HTML, execute the JavaScript, and attempt to fetch data from `127.0.0.1` (the user's own computer), which will instantly fail. Because the frontend and the backend are now served from the exact same unified origin, we must decouple the frontend from hardcoded IP addresses.

### Introduce the concept in isolation

Create `lab_relative.html` to observe how browsers dynamically resolve URL strings based on their current location context.

```html
<!DOCTYPE html>
<html>
<body>
    <script>
        // An absolute path is rigid
        console.log("Absolute:", "http://127.0.0.1:8000/health");
        
        // A relative path inherits the protocol and domain of the page
        const relativeUrl = new URL("/health", window.location.origin);
        console.log("Resolved Relative:", relativeUrl.href);
    </script>
</body>
</html>

```

Open `lab_relative.html` in your web browser and check the Developer Tools Console.
Output:

```text
Absolute: http://127.0.0.1:8000/health
Resolved Relative: file:///health

```

*What this proves:* A string that starts with a forward slash (`/health`) is interpreted as an absolute path *relative to the root of the current host*. Because we opened it via `file:///`, the browser resolved it against the local file system. If we serve this file from a network host, the browser will perfectly map `/health` to that network host without any hardcoding.

### Discard the throwaway example

Delete `lab_relative.html`. We will now rewrite the networking logic inside our dashboard application.

### Project Change

We will update `nexus/frontend/app.js` to rely entirely on relative URL addressing for its fetch requests.

* **Files affected:** `nexus/frontend/app.js`.
* **Change type:** Modify.
* **Location:** The very first line of the file.
* **Dependencies:** None.

### The New Code

```javascript
const API_BASE = "";

```

### The Updated Project

Because this modifies a global constant that fundamentally changes how the entire file interacts with the network, here is the complete `nexus/frontend/app.js` with no elisions, demonstrating the updated unified logic.

```javascript
// ← new: Relative base path inherits the host domain automatically
const API_BASE = "";

async function fetchAndRenderSKU(skuId) {
    try {
        const response = await fetch(`${API_BASE}/skus/${skuId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sku = await response.json();
        
        const tbody = document.getElementById("sku-table-body");
        const tr = document.createElement("tr");
        
        tr.innerHTML = `
            <td><strong>${sku.sku_id}</strong></td>
            <td>${sku.name}</td>
            <td>${sku.description || "N/A"}</td>
            <td>
                <button class="action-btn" onclick="moveItem('${sku.sku_id}')">
                    Move Stock
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    } catch (error) {
        console.error("Failed to fetch SKU:", error);
    }
}

async function moveItem(serial) {
    const targetId = prompt(`Enter new Location ID for ${serial}:`);
    if (!targetId) return;

    try {
        const response = await fetch(`${API_BASE}/items/${serial}/move`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_location_id: parseInt(targetId) })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `Move failed: ${response.status}`);
        }
        
        alert(`Successfully moved ${serial} to Location ${targetId}!`);
    } catch (error) {
        console.error("Error:", error);
        alert(`Failed to move item: ${error.message}`);
    }
}

fetchAndRenderSKU("TEST-99");

```

When `fetch(`${API_BASE}/skus/${skuId}`)` executes, the template string evaluates to `/skus/TEST-99`. The browser seamlessly prepends the current host domain, ensuring perfect routing regardless of deployment environment.

### Mechanical walkthrough

1. `const API_BASE = "";`: (Already established syntax). By changing the constant to an empty string, the subsequent string interpolations (e.g., `${API_BASE}/skus/...`) will begin directly with a `/`.
2. *(Browser Behavior Note)*: When JavaScript executes `fetch("/skus/...")`, it is performing relative addressing. The browser inspects the `window.location.origin` (which is `[http://127.0.0.1:8000](http://127.0.0.1:8000)` because the page was served by FastAPI), combines it with the relative path, and executes the network request to `[http://127.0.0.1:8000/skus/](http://127.0.0.1:8000/skus/)...`.

### CS Lens

**Location Independence.** Hardcoding absolute network locations into source code violates location independence. Systems designed this way are brittle; moving them to a new subnet, changing a DNS record, or running them on a developer's local laptop requires manually rewriting the source code. Relative addressing delegates the responsibility of network location discovery to the runtime environment (the browser), making the compiled artifact completely portable.
*Also recognized in:* Position Independent Executables (PIE) in C/C++ memory allocation, Docker networking aliases, and relative file system paths (`../`).

### SE Lens

What is the primary tradeoff of this monolith design compared to keeping the frontend separate? **Horizontal Scaling and CDNs.** By coupling the static files to the API server, every time a user downloads `app.js`, they are consuming a TCP connection on the Uvicorn server that could have been used to process a database transaction. In massive enterprise applications, static files are separated from the API and placed on a Content Delivery Network (CDN) like AWS CloudFront, which can serve millions of files a second without ever hitting the Python backend. For small to mid-sized internal enterprise tools like NexusInventory, the simplicity of a single deployable artifact far outweighs the CDN scaling benefit.

### Commands needed to make this unit real

No commands needed.

### Run it. Show the real output.

Refresh your browser tab at `[http://127.0.0.1:8000/](http://127.0.0.1:8000/)`. The table will load perfectly.

In the browser Developer Tools -> Network tab, you will see exactly three requests, all seamlessly sharing the exact same unified origin:

1. `GET localhost:8000/` (Returns HTML)
2. `GET localhost:8000/app.js` (Returns JS)
3. `GET localhost:8000/skus/TEST-99` (Returns JSON)

### One sentence connecting this unit to what came immediately before.

With the frontend and backend fully integrated into a single, location-independent server process, our application is now completely self-contained and ready for deployment.

---

## Closing

**Connect the pieces**
This completes the architectural loop of NexusInventory. A client opens a browser and navigates to the server. FastAPI intercepts the root URL and uses `StaticFiles` (Lesson 13) to stream `index.html` from the disk. The browser parses the HTML and requests `app.js`, which FastAPI also serves statically. The JavaScript executes in the browser and constructs a relative request for `/skus/TEST-99` (Lesson 13). The browser resolves this relative URL against the unified origin, sending the request back to the server. Because `/skus` matches an API route, FastAPI routes it to our `read_sku_endpoint` (Lesson 9), which utilizes dependency injection to open a `Session` (Lesson 9), queries the SQLite engine directly bypassing static files (Lesson 6), and returns the JSON payload back to the browser's DOM (Lesson 11).

**What breaks without this**
If you left `const API_BASE = "[http://127.0.0.1:8000](http://127.0.0.1:8000)";` in the frontend code, and then deployed your FastAPI application to a DigitalOcean droplet at `[http://159.203.44.12:8000](http://159.203.44.12:8000)`, you would load the webpage successfully, but the dashboard table would be completely empty. The JavaScript would execute on your local machine, blindly fire an HTTP request to `127.0.0.1` (your local loopback), fail to find a server, and crash the script, oblivious to the fact that the actual API is sitting right next to the HTML file on the DigitalOcean server.

**Exercises**

1. Because the frontend and backend now share the exact same origin (`[http://127.0.0.1:8000](http://127.0.0.1:8000)`), the browser no longer enforces the Same-Origin Policy for these requests. Go into `nexus/main.py` and completely delete the `CORSMiddleware` configuration block. Restart the server and refresh the browser. Notice that the application continues to function flawlessly!
2. Create a generic `nexus/frontend/favicon.ico` image file. Notice that if you append `<link rel="icon" href="/favicon.ico">` to your `index.html`, FastAPI will automatically serve the image without requiring any additional routing code.

**Definition of Done**

* [x] `StaticFiles` is imported and mounted to the root `/` path in `main.py`.
* [x] The API endpoints are strictly defined *before* the static mount in the code structure to ensure proper routing precedence.
* [x] The `app.js` frontend script is updated to use relative URL strings (`""`) for network requests.
* [x] You can commit these changes with the message: `build: mount frontend as static files application and convert to relative unified origin`.