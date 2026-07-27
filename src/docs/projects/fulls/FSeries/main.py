import functools
import logging
import re
import sqlite3
import time
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db import get_connection, init_db
from repositories import PostRepository
from schemas import (
    AccountCreate,
    CommentCreate,
    CommentRead,
    FeedPost,
    FollowedMember,
    HomepageResponse,
    LoginRequest,
    Member,
    PostCreate,
    PostDetail,
    PostRead,
    PostUpdate,
    Profile,
    TokenResponse,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("social_network")

SECRET_KEY = "dev-secret-change-me"  # NOTE: flagged in Lesson 14 — use real env config before deploying
ALGORITHM = "HS256"

app = FastAPI()

# NOTE: wide-open for local dev only. Before deploying, replace with the
# actual frontend origin(s) — never leave allow_origins=["*"] in production
# once real user data and auth tokens are involved.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ---------------------------------------------------------------------------
# Dependencies
# ---------------------------------------------------------------------------

def get_db_connection():
    """Generator-based dependency (Lesson 16 pattern), applied consistently so
    tests can override it via app.dependency_overrides (Lesson 18)."""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def get_post_repository(conn: sqlite3.Connection = Depends(get_db_connection)) -> PostRepository:
    return PostRepository(conn)


def create_access_token(member_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {"member_id": member_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_member(
    authorization: str = Header(...),
    conn: sqlite3.Connection = Depends(get_db_connection),
) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed token")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    row = conn.execute(
        "SELECT id, username, role FROM members WHERE id = ?", (payload["member_id"],)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Member no longer exists")
    return dict(row)


def require_admin(current_member: dict = Depends(get_current_member)) -> dict:
    if current_member["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_member


def extract_hashtags(content: str) -> list[str]:
    matches = re.findall(r"#(\w+)", content)
    return sorted(set(tag.lower() for tag in matches))


def get_or_create_hashtag_id(conn, name: str) -> int:
    conn.execute("INSERT OR IGNORE INTO hashtags (name) VALUES (?)", (name,))
    row = conn.execute("SELECT id FROM hashtags WHERE name = ?", (name,)).fetchone()
    return row["id"]


SLOW_REQUEST_THRESHOLD_SECONDS = 0.5


def log_slow_requests(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        if elapsed > SLOW_REQUEST_THRESHOLD_SECONDS:
            logger.warning(f"Slow request: {func.__name__} took {elapsed:.3f}s")
        return result
    return wrapper


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})


# ---------------------------------------------------------------------------
# Routes — Phase 1: homepage, members
# ---------------------------------------------------------------------------

@app.get("/", response_model=HomepageResponse)
def homepage():
    return {"message": "Welcome to the Developer Social Network"}


@app.get("/members", response_model=list[Member])
def list_members(conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("SELECT id, username FROM members").fetchall()
    return [dict(row) for row in rows]


@app.get("/members/{member_id}", response_model=Member)
def get_member(member_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    row = conn.execute(
        "SELECT id, username FROM members WHERE id = ?", (member_id,)
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return dict(row)


@app.get("/members/{member_id}/profile", response_model=Profile)
def get_member_profile(member_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    row = conn.execute("""
        SELECT members.id, members.username, bios.text AS bio
        FROM members
        JOIN bios ON members.id = bios.member_id
        WHERE members.id = ?
    """, (member_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return dict(row)


@app.get("/members/search", response_model=list[Member])
def search_members(q: str, conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute(
        "SELECT id, username FROM members WHERE username LIKE ?", (f"%{q}%",)
    ).fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Routes — Phase 2/3: posts, feed, comments, likes, follows, hashtags
# ---------------------------------------------------------------------------

@app.post("/posts", response_model=PostRead, status_code=201)
def create_post(
    post: PostCreate,
    current_member: dict = Depends(get_current_member),
    conn: sqlite3.Connection = Depends(get_db_connection),
):
    cursor = conn.execute(
        "INSERT INTO posts (author_id, content) VALUES (?, ?)",
        (current_member["id"], post.content),
    )
    new_post_id = cursor.lastrowid

    for tag_name in extract_hashtags(post.content):
        hashtag_id = get_or_create_hashtag_id(conn, tag_name)
        conn.execute(
            "INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)",
            (new_post_id, hashtag_id),
        )

    conn.commit()
    return {"id": new_post_id, "author_id": current_member["id"], "content": post.content}


@app.get("/posts/{post_id}", response_model=PostDetail)
def get_post_detail(post_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    post_row = conn.execute(
        "SELECT id, content, like_count FROM posts WHERE id = ?", (post_id,)
    ).fetchone()
    if post_row is None:
        raise HTTPException(status_code=404, detail="Post not found")

    comment_rows = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    """, (post_id,)).fetchall()

    return {
        "id": post_row["id"],
        "content": post_row["content"],
        "like_count": post_row["like_count"],
        "comments": [dict(row) for row in comment_rows],
    }


@app.put("/posts/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    update: PostUpdate,
    current_member: dict = Depends(get_current_member),
    posts: PostRepository = Depends(get_post_repository),
):
    can_modify, reason = posts.can_modify(post_id, current_member["id"], current_member["role"])
    if not can_modify:
        status = 404 if reason == "not_found" else 403
        raise HTTPException(status_code=status, detail=reason)
    posts.update_content(post_id, update.content)
    return {"id": post_id, "author_id": current_member["id"], "content": update.content}


@app.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_member: dict = Depends(get_current_member),
    posts: PostRepository = Depends(get_post_repository),
):
    can_modify, reason = posts.can_modify(post_id, current_member["id"], current_member["role"])
    if not can_modify:
        status = 404 if reason == "not_found" else 403
        raise HTTPException(status_code=status, detail=reason)
    posts.delete(post_id)


@app.get("/feed", response_model=list[FeedPost])
def get_feed(limit: int = 20, offset: int = 0, conn: sqlite3.Connection = Depends(get_db_connection)):
    limit = min(limit, 100)
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        ORDER BY posts.created_at DESC
        LIMIT ? OFFSET ?
    """, (limit, offset)).fetchall()
    return [dict(row) for row in rows]


@app.post("/posts/{post_id}/comments", response_model=CommentRead, status_code=201)
def add_comment(
    post_id: int,
    comment: CommentCreate,
    current_member: dict = Depends(get_current_member),
    conn: sqlite3.Connection = Depends(get_db_connection),
):
    cursor = conn.execute(
        "INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)",
        (post_id, current_member["id"], comment.content),
    )
    conn.commit()
    row = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.id = ?
    """, (cursor.lastrowid,)).fetchone()
    return dict(row)


@app.get("/posts/{post_id}/comments", response_model=list[CommentRead])
def list_comments(post_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("""
        SELECT comments.id, comments.content, comments.created_at, members.username
        FROM comments
        JOIN members ON comments.author_id = members.id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
    """, (post_id,)).fetchall()
    return [dict(row) for row in rows]


@app.post("/posts/{post_id}/likes", status_code=201)
def like_post(
    post_id: int,
    current_member: dict = Depends(get_current_member),
    conn: sqlite3.Connection = Depends(get_db_connection),
):
    try:
        conn.execute("BEGIN")
        conn.execute(
            "INSERT INTO likes (post_id, member_id) VALUES (?, ?)",
            (post_id, current_member["id"]),
        )
        conn.execute(
            "UPDATE posts SET like_count = like_count + 1 WHERE id = ?", (post_id,)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Already liked")
    return {"liked": True}


@app.post("/members/{member_id}/follow", status_code=201)
def follow_member(
    member_id: int,
    current_member: dict = Depends(get_current_member),
    conn: sqlite3.Connection = Depends(get_db_connection),
):
    if current_member["id"] == member_id:
        raise HTTPException(status_code=422, detail="Cannot follow yourself")
    try:
        conn.execute(
            "INSERT INTO follows (follower_id, followed_id) VALUES (?, ?)",
            (current_member["id"], member_id),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="Already following")
    return {"following": True}


@app.get("/members/{member_id}/following", response_model=list[FollowedMember])
def list_following(member_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("""
        SELECT members.id, members.username
        FROM follows
        JOIN members ON follows.followed_id = members.id
        WHERE follows.follower_id = ?
    """, (member_id,)).fetchall()
    return [dict(row) for row in rows]


@app.get("/members/{member_id}/followers", response_model=list[FollowedMember])
def list_followers(member_id: int, conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("""
        SELECT members.id, members.username
        FROM follows
        JOIN members ON follows.follower_id = members.id
        WHERE follows.followed_id = ?
    """, (member_id,)).fetchall()
    return [dict(row) for row in rows]


@app.get("/hashtags/{tag_name}/posts", response_model=list[FeedPost])
def browse_by_hashtag(tag_name: str, conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM hashtags
        JOIN post_hashtags ON hashtags.id = post_hashtags.hashtag_id
        JOIN posts ON post_hashtags.post_id = posts.id
        JOIN members ON posts.author_id = members.id
        WHERE hashtags.name = ?
        ORDER BY posts.created_at DESC
    """, (tag_name,)).fetchall()
    return [dict(row) for row in rows]


# ---------------------------------------------------------------------------
# Routes — Phase 5: accounts, login
# ---------------------------------------------------------------------------

@app.post("/accounts", response_model=Member, status_code=201)
def create_account(account: AccountCreate, conn: sqlite3.Connection = Depends(get_db_connection)):
    password_hash = bcrypt.hashpw(account.password.encode(), bcrypt.gensalt())
    try:
        conn.execute("BEGIN")
        cursor = conn.execute("INSERT INTO members (username) VALUES (?)", (account.username,))
        new_member_id = cursor.lastrowid
        conn.execute(
            "INSERT INTO credentials (member_id, password_hash) VALUES (?, ?)",
            (new_member_id, password_hash),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=409, detail="Username already taken")
    return {"id": new_member_id, "username": account.username}


@app.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, conn: sqlite3.Connection = Depends(get_db_connection)):
    row = conn.execute("""
        SELECT members.id, credentials.password_hash
        FROM members
        JOIN credentials ON members.id = credentials.member_id
        WHERE members.username = ?
    """, (credentials.username,)).fetchone()

    if row is None or not bcrypt.checkpw(credentials.password.encode(), row["password_hash"]):
        logger.warning(f"Failed login attempt for username: {credentials.username}")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    logger.info(f"Successful login for member_id: {row['id']}")
    token = create_access_token(row["id"])
    return {"access_token": token}


# ---------------------------------------------------------------------------
# Routes — Phase 7: trending, recommendations, admin analytics
# ---------------------------------------------------------------------------

_trending_cache = {"data": None, "cached_at": 0}
TRENDING_CACHE_TTL_SECONDS = 30


@app.get("/trending", response_model=list[FeedPost])
@log_slow_requests
def get_trending(conn: sqlite3.Connection = Depends(get_db_connection)):
    now = time.time()
    if _trending_cache["data"] is not None and now - _trending_cache["cached_at"] < TRENDING_CACHE_TTL_SECONDS:
        return _trending_cache["data"]

    rows = conn.execute("""
        WITH comment_counts AS (
            SELECT post_id, COUNT(*) AS comment_count
            FROM comments
            GROUP BY post_id
        )
        SELECT
            posts.id,
            posts.content,
            posts.created_at,
            members.username,
            posts.like_count + COALESCE(comment_counts.comment_count, 0) AS score
        FROM posts
        JOIN members ON posts.author_id = members.id
        LEFT JOIN comment_counts ON posts.id = comment_counts.post_id
        ORDER BY score DESC
    """).fetchall()
    result = [dict(row) for row in rows]

    _trending_cache["data"] = result
    _trending_cache["cached_at"] = now
    return result


@app.get("/recommendations", response_model=list[FeedPost])
def get_recommendations(
    current_member: dict = Depends(get_current_member),
    conn: sqlite3.Connection = Depends(get_db_connection),
):
    rows = conn.execute("""
        SELECT posts.id, posts.content, posts.created_at, members.username
        FROM posts
        JOIN members ON posts.author_id = members.id
        WHERE posts.author_id IN (
            SELECT followed_id FROM follows WHERE follower_id = ?
        )
        AND posts.author_id != ?
        AND NOT EXISTS (
            SELECT 1 FROM likes
            WHERE likes.post_id = posts.id AND likes.member_id = ?
        )
        ORDER BY posts.created_at DESC
    """, (current_member["id"], current_member["id"], current_member["id"])).fetchall()
    return [dict(row) for row in rows]


@app.get("/admin/analytics")
def get_analytics(admin: dict = Depends(require_admin), conn: sqlite3.Connection = Depends(get_db_connection)):
    rows = conn.execute("SELECT * FROM post_rankings").fetchall()
    return [dict(row) for row in rows]
