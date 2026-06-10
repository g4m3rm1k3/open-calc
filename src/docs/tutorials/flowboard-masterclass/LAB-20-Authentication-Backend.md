# FlowBoard Masterclass — LAB 20 — User Authentication: Registration and Login

**Prerequisites:** LAB-19 — SQLite database with Board/List/Card models. Full CRUD API.

**What this lab adds:**
- Password hashing with `bcrypt` — why you never store plain passwords
- JWT (JSON Web Tokens) — stateless authentication sessions
- `/api/auth/register` and `/api/auth/login` endpoints
- A `User` model in the database
- The `Authorization: Bearer <token>` HTTP header pattern
- Associating boards with users

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. If you stored passwords as plain text in the database and the database was compromised, what is the consequence for users? Why is hashing better?
> 2. A JWT is a signed token that contains user data. The server does not store the token anywhere — it just validates the signature. What happens if a user's token is stolen?
> 3. Every protected route must check "is this user logged in?" Currently you have routes for boards, lists, and cards. Where is the right place to put this check — in each route, or somewhere shared?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Users can register (username + password) and log in. The server returns a JWT on login. Protected routes require `Authorization: Bearer <token>`. Boards are associated with users — each user sees only their boards.

```
Registration:
  POST /api/auth/register  { username, password }
  → 201 Created { id, username }

Login:
  POST /api/auth/login  { username, password }
  → 200 OK { access_token, token_type: "bearer" }

Using the token:
  GET /api/boards
  Headers: Authorization: Bearer eyJhbGciOiJIUzI1...
  → 200 OK [boards for the authenticated user]
```

---

## Concept: Password Hashing

**The problem with plain text:**

If you store `password = "hunter2"` in the database, anyone who reads the database — through SQL injection, a compromised backup, an insider threat, or a breach — gets every user's password. Because users reuse passwords, this compromises their accounts on other sites too.

**What hashing does:**

A hash function converts input to a fixed-length output that cannot be reversed:

```
"hunter2"  →  bcrypt  →  "$2b$12$ZVVqm.../..."
```

The original password is not recoverable from the hash. To check a login attempt, you hash the attempt and compare hashes:

```python
bcrypt.checkpw("hunter2".encode(), stored_hash)  # True
bcrypt.checkpw("wrong".encode(), stored_hash)    # False
```

**Why bcrypt specifically:**

bcrypt is intentionally slow (it does many rounds of computation). Fast hash functions (MD5, SHA-256) can be brute-forced — an attacker can try billions of password guesses per second with a GPU. bcrypt's slowness (and adjustable "cost factor") makes brute force impractical. The `$2b$12$` prefix means bcrypt with cost factor 12 — about 250ms to hash, which is imperceptible to users but makes brute force take years.

**You will see this again in:** Any app with user authentication. This is a security requirement, not optional. OWASP explicitly prohibits storing plain or reversibly-encrypted passwords.

---

## Concept: JWT — JSON Web Tokens

**What a JWT is:**

A JWT is a signed string with three parts separated by dots:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEiLCJleHAiOjE3MDB9.signature
    HEADER (base64)                        PAYLOAD (base64)           SIGNATURE
```

- Header: `{"alg": "HS256", "typ": "JWT"}` — the signing algorithm
- Payload: `{"sub": "user-1", "exp": 1700000000}` — the claims (user ID, expiration)
- Signature: HMAC of header+payload using a secret key

**How authentication works:**

1. User logs in with correct credentials
2. Server creates JWT: `{"sub": user_id, "exp": now + 24h}`, signs with secret key
3. Server returns token to client
4. Client stores token (localStorage or memory)
5. Client sends token in every request: `Authorization: Bearer <token>`
6. Server verifies the signature — if valid, the user is authenticated

**The server never stores the token.** It only stores the secret key. Any token with a valid signature is accepted until it expires. This is called "stateless authentication" — the server needs no database lookup for every request.

**The security trade-off:**

Because the server doesn't store tokens, it cannot invalidate one before expiration. If a token is stolen, it works until it expires. Solutions: short expiration (1 hour), refresh tokens, a token blocklist (adds state back). For FlowBoard, we'll use a 24-hour expiration — reasonable for a productivity app.

**You will see this again in:** Every authenticated API in the course. Lab 21 adds the React login UI. Lab 22 adds protected routes.

---

## Step 1 — Install authentication dependencies

```powershell
# With venv active:
pip install python-jose[cryptography] passlib[bcrypt]
pip freeze > requirements.txt
```

- `python-jose` — JWT creation and validation
- `passlib[bcrypt]` — password hashing with bcrypt

---

## Step 2 — Add the User model

Update `backend/models.py` — add the UserModel:

```python
# Add to models.py:

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    boards = relationship("BoardModel", back_populates="owner", cascade="all, delete-orphan")


# Update BoardModel to add owner_id:
class BoardModel(Base):
    __tablename__ = "boards"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=True)  # nullable for migration
    
    owner = relationship("UserModel", back_populates="boards")
    lists = relationship("ListModel", back_populates="board", cascade="all, delete-orphan", order_by="ListModel.position")
```

**Note:** `owner_id` is nullable to allow existing boards (seeded without a user) to remain valid during development. In a production schema, you would require an owner.

---

## Step 3 — Create the auth module

Create `backend/auth.py`:

```python
# backend/auth.py
# Authentication utilities: password hashing, JWT creation and validation.

from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os

# Password hashing context — uses bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Secret key for JWT signing.
# In production, this MUST come from an environment variable — never hardcode it.
# A compromised secret key means all tokens are forgeable.
SECRET_KEY = os.environ.get("FLOWBOARD_SECRET_KEY", "dev-only-insecure-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


def hash_password(plain_password: str) -> str:
    """Hash a plain text password using bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    """Create a signed JWT for a user."""
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": user_id,          # "subject" — who this token represents
        "exp": expire,           # expiration time
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    """
    Decode and validate a JWT. Returns the user_id (sub claim) if valid,
    or None if the token is expired, malformed, or has an invalid signature.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None
```

---

## Step 4 — Add auth routes to `main.py`

Add the following to `backend/main.py`:

```python
# Add imports:
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth import hash_password, verify_password, create_access_token, decode_access_token
from models import UserModel  # (add UserModel to existing import)

# Add Pydantic models:
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    username: str


# Security scheme — parses "Authorization: Bearer <token>"
security = HTTPBearer(auto_error=False)


# Dependency: get current user from JWT
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserModel:
    """
    Extract and validate the Bearer token from the Authorization header.
    Raises 401 if token is missing, invalid, or expired.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")

    return user


# Auth routes:

@app.post("/api/auth/register", response_model=UserResponse, status_code=201)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    # Validate username
    if len(request.username.strip()) < 3:
        raise HTTPException(status_code=422, detail="Username must be at least 3 characters")

    # Validate password
    if len(request.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    # Check username is not taken
    existing = db.query(UserModel).filter(UserModel.username == request.username.strip()).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")

    user = UserModel(
        id=f"user-{uuid.uuid4().hex[:8]}",
        username=request.username.strip(),
        hashed_password=hash_password(request.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"id": user.id, "username": user.username}


@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT."""
    user = db.query(UserModel).filter(UserModel.username == request.username).first()

    # Use the same error message whether username is wrong or password is wrong.
    # Separate messages ("user not found" vs "wrong password") allow username enumeration.
    if user is None or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    """Return the currently authenticated user."""
    return {"id": current_user.id, "username": current_user.username}
```

**Note the security decision:** The login error says "Invalid username or password" — not "User not found" or "Wrong password." Separate messages allow attackers to enumerate valid usernames. A generic message prevents this.

---

## Step 5 — Protect the boards routes

Update the board routes in `main.py` to require authentication:

```python
@app.get("/api/boards", response_model=list[BoardData])
async def get_boards(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Return all boards owned by the current user."""
    boards = db.query(BoardModel).filter(BoardModel.owner_id == current_user.id).all()
    return [board_to_dict(b) for b in boards]


@app.post("/api/boards", response_model=BoardData, status_code=201)
async def create_board(
    request: CreateBoardRequest,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    board_id = f"board-{uuid.uuid4().hex[:8]}"
    board = BoardModel(id=board_id, title=request.title, owner_id=current_user.id)
    
    list1 = ListModel(id=f"list-{uuid.uuid4().hex[:8]}", title="To Do", position=0, board_id=board_id)
    list2 = ListModel(id=f"list-{uuid.uuid4().hex[:8]}", title="Done", position=1, board_id=board_id)
    
    db.add(board)
    db.add(list1)
    db.add(list2)
    db.commit()
    db.refresh(board)
    
    return board_to_dict(board)
```

### SAVE AND TRY

Visit `http://localhost:8000/docs`. Register a user with the `/api/auth/register` endpoint. Log in with `/api/auth/login` — copy the `access_token` from the response. Click "Authorize" in the Swagger UI and enter `Bearer <your-token>`. Now try `GET /api/boards` — it returns an empty array (the new user has no boards yet). Create a board — it belongs to this user.

---

## 🎯 Challenge: The username enumeration test

**You know:** HTTP status codes, the security principle behind generic error messages

**Task:** Write a test (manually, using the `/docs` Swagger UI) to verify that the API is not vulnerable to username enumeration:
1. Register with username "alice"
2. Try to log in with username "alice" and a wrong password — note the response
3. Try to log in with username "bob" (doesn't exist) and any password — note the response
4. Verify both responses have the same status code AND the same error message body

If the responses are different, the API leaks information about which usernames are valid.

---

<details>
<summary>▶ Show Solution</summary>

Both requests should return:
```json
HTTP 401
{"detail": "Invalid username or password"}
```

If one returned `{"detail": "User not found"}` and the other `{"detail": "Wrong password"}`, an attacker could silently enumerate all valid usernames by trying to log in with each one and reading the error message. This is called a username enumeration attack.

The fix in our implementation: the login route checks `if user is None or not verify_password(...)` — a single condition that returns the same error for both cases.

**Key insight:** Security requires thinking about what information error messages leak, not just whether the operation succeeded. Even the HTTP status code matters — returning 404 for "user not found" vs 401 for "wrong password" leaks information through the status code. Generic 401 for all authentication failures is the correct pattern.

A subtle additional security measure: timing attacks. If you return immediately for "user not found" but take 250ms to check the password for valid users, an attacker can measure the response time to determine if a username exists. The fix: always run `verify_password` even when the user is not found. Passlib handles this with `pwd_context.dummy_verify()`. This is advanced — but it illustrates how security considerations appear at every level.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `POST /api/auth/register` creates a user | Try in `/docs` |
| `POST /api/auth/login` returns a JWT | Try in `/docs` — copy the token |
| `GET /api/auth/me` returns user info | Add token in `/docs` Authorize — works |
| `GET /api/boards` returns 401 without token | Try without auth — see 401 |
| `GET /api/boards` returns empty array for new user | Log in as new user — no boards yet |
| Boards are associated with users | Created boards only visible to owner |
| Passwords are stored as bcrypt hashes | Check the database (should not see plain text) |
| Login error is generic (no username enumeration) | Try wrong username and wrong password — same error |
| Short password is rejected | Try registering with 7-char password |
| Short username is rejected | Try registering with 2-char username |
| `auth.py` uses env variable for secret key | Check `os.environ.get(...)` |

---

## Quick Check Answers

**1. Why is password hashing critical for a breach?**

If plain passwords are stored and the database is stolen, attackers immediately have every user's password. Most users reuse passwords across sites, so this compromises their email, banking, and social accounts too. With hashed passwords, attackers get hashes — which require brute force to reverse. bcrypt makes brute force impractically slow (each guess takes 250ms on a good computer; a million common passwords would take 70 hours). Good hashing limits the blast radius of a breach from "all accounts compromised immediately" to "accounts with very weak passwords compromised slowly."

**2. What happens if a JWT is stolen?**

The token is valid until it expires (24 hours in our implementation). The attacker can make any API request the legitimate user could make. Unlike session cookies that the server can invalidate (by deleting the session record), JWTs cannot be invalidated before expiration — the server has no record of issued tokens. Mitigations: (1) short expiration + refresh tokens, (2) a token blocklist (adds database lookups back), (3) rotating secrets (invalidates all tokens). For FlowBoard, 24-hour expiration is a reasonable trade-off. The bigger risk mitigation is HTTPS — tokens should only travel over encrypted connections.

**3. Where is the right place to put the "is logged in" check?**

In a shared dependency, not in each route. FastAPI's `Depends(get_current_user)` injects the authentication check into any route that declares `current_user: UserModel = Depends(get_current_user)`. The check code lives once, in `get_current_user`. Individual routes just declare the dependency. If you put the check in each route, you guarantee someone will forget it on a new route — a security gap. Shared dependencies enforce the check uniformly.

---

## Next Lab

In **LAB-21**, you will build the React login and registration forms. The frontend will call `/api/auth/login`, store the JWT in localStorage, and include it in every API request. When the token is missing or expired, the app redirects to the login screen.
