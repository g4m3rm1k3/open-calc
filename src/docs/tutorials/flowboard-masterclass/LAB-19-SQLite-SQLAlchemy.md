# FlowBoard Masterclass — LAB 19 — Persistent Data: SQLite + SQLAlchemy ORM

**Prerequisites:** LAB-18 — Backend has create/read/update/delete endpoints. Frontend communicates fully with the API.

**What this lab adds:**
- SQLite — a file-based relational database
- SQLAlchemy ORM — mapping Python classes to database tables
- The ORM concept — what "Object-Relational Mapping" means
- Database sessions — managing connections
- Migrations from in-memory to persistent storage
- Foreign keys and table relationships

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now, stopping and restarting the backend server loses all data. Why? What needs to change to make data survive restarts?
> 2. An ORM maps Python class instances to database rows. When you do `card.title = "New title"` in Python, what does the ORM do?
> 3. SQLite is a "file-based" database. What does this mean compared to databases like PostgreSQL? When is SQLite good enough, and when is it not?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Board data moves from a Python list (lost on restart) to a SQLite file. No frontend changes. The API behaves identically from the frontend's perspective. After this lab, restarting the backend no longer loses data.

---

## Concept: ORM — Object-Relational Mapping

**The problem ORMs solve:**

Databases store data in tables — rows and columns. Python code works with objects and attributes. Without an ORM, you write SQL strings in your Python code:

```python
# Without ORM — raw SQL
cursor.execute(
    "INSERT INTO cards (id, title, description, created_at, list_id) VALUES (?, ?, ?, ?, ?)",
    (card_id, title, description, created_at, list_id)
)
```

This is error-prone (typos in SQL strings are silent until runtime), repetitive, and hard to refactor.

**With an ORM:**

```python
# With SQLAlchemy ORM
card = CardModel(
    id=card_id,
    title=title,
    description=description,
    list_id=list_id
)
db.add(card)
db.commit()
```

You work with Python objects. The ORM translates operations to SQL automatically.

**The ORM model pattern:**

```python
class CardModel(Base):
    __tablename__ = "cards"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    created_at = Column(Integer, nullable=False)
    list_id = Column(String, ForeignKey("lists.id"), nullable=False)
    
    # Relationships allow Python-level navigation:
    list = relationship("ListModel", back_populates="cards")
```

`CardModel.list` lets you do `card.list.title` in Python — SQLAlchemy handles the JOIN query automatically.

**You will see this again in:** Lab 19 to end of course. Every production web backend uses an ORM or query builder. SQLAlchemy is the dominant Python ORM. In JavaScript, equivalents are Prisma (TypeScript), Sequelize, or TypeORM.

---

## Concept: Database Sessions

**What a session is:**

A session is an ongoing conversation with the database. It tracks which objects you have loaded and modified, and batches changes until you commit.

```python
# Pattern: get session from dependency injection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# In a route:
@app.get("/api/boards")
async def get_boards(db: Session = Depends(get_db)):
    return db.query(BoardModel).all()
```

`Depends(get_db)` is FastAPI's dependency injection. It calls `get_db()` before your route runs and passes the session as `db`. The `finally: db.close()` runs after the route completes.

**Why close sessions:**

Database connections are limited resources. If you open connections and never close them, you eventually exhaust the connection pool. The `try/finally` pattern guarantees cleanup even if the route raises an exception.

---

## Step 1 — Install SQLAlchemy

```powershell
# With venv active in backend/:
pip install sqlalchemy
pip freeze > requirements.txt
```

---

## Step 2 — Create the database models

Create `backend/models.py`:

```python
# backend/models.py
# SQLAlchemy ORM models — Python classes that map to database tables.

from sqlalchemy import Column, String, Integer, ForeignKey, create_engine
from sqlalchemy.orm import relationship, declarative_base, sessionmaker

# Base class — all models inherit from this
Base = declarative_base()

# Database URL — SQLite stores in a local file
# The file is created automatically if it doesn't exist
DATABASE_URL = "sqlite:///./flowboard.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # required for SQLite in FastAPI
)

# SessionLocal is a factory that creates database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class BoardModel(Base):
    __tablename__ = "boards"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)

    # relationship: board.lists gives a Python list of ListModel objects
    lists = relationship("ListModel", back_populates="board", cascade="all, delete-orphan", order_by="ListModel.position")


class ListModel(Base):
    __tablename__ = "lists"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    position = Column(Integer, default=0)  # preserve column ordering
    board_id = Column(String, ForeignKey("boards.id"), nullable=False)

    board = relationship("BoardModel", back_populates="lists")
    cards = relationship("CardModel", back_populates="list", cascade="all, delete-orphan", order_by="CardModel.position")


class CardModel(Base):
    __tablename__ = "cards"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    description = Column(String, default="")
    created_at = Column(Integer, nullable=False)
    position = Column(Integer, default=0)  # preserve card ordering
    list_id = Column(String, ForeignKey("lists.id"), nullable=False)

    list = relationship("ListModel", back_populates="cards")


def create_tables():
    """Create all tables. Called once on startup."""
    Base.metadata.create_all(bind=engine)
```

---

## Step 3 — Create the seed data script

Create `backend/seed.py`:

```python
# backend/seed.py
# Populates the database with initial data.
# Run once: python seed.py

from models import Base, engine, SessionLocal, BoardModel, ListModel, CardModel, create_tables
import time

def seed():
    create_tables()
    db = SessionLocal()

    # Check if already seeded
    if db.query(BoardModel).count() > 0:
        print("Database already has data — skipping seed.")
        db.close()
        return

    now = int(time.time() * 1000)

    board1 = BoardModel(id="board-1", title="My Project")
    list_todo = ListModel(id="list-todo", title="To Do", position=0, board_id="board-1")
    list_in_progress = ListModel(id="list-in-progress", title="In Progress", position=1, board_id="board-1")
    list_done = ListModel(id="list-done", title="Done", position=2, board_id="board-1")

    card1 = CardModel(id="card-1", title="Fix login button", description="Does not respond on mobile.", created_at=now, position=0, list_id="list-todo")
    card2 = CardModel(id="card-2", title="Update homepage hero", description="New design in Figma.", created_at=now, position=1, list_id="list-todo")
    card4 = CardModel(id="card-4", title="Design new dashboard", description="Working with design team.", created_at=now, position=0, list_id="list-in-progress")

    board2 = BoardModel(id="board-2", title="Team Work")
    list_backlog = ListModel(id="list-team-todo", title="Backlog", position=0, board_id="board-2")
    list_team_in_progress = ListModel(id="list-team-in-progress", title="In Progress", position=1, board_id="board-2")
    list_team_done = ListModel(id="list-team-done", title="Done", position=2, board_id="board-2")

    card10 = CardModel(id="card-10", title="Define sprint goals", description="Q3 planning.", created_at=now, position=0, list_id="list-team-todo")

    db.add_all([board1, board2, list_todo, list_in_progress, list_done, list_backlog, list_team_in_progress, list_team_done,
                card1, card2, card4, card10])
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed()
```

---

## Step 4 — Rewrite `main.py` with database-backed routes

Replace `backend/main.py` with the database-backed version:

```python
# backend/main.py — database-backed routes

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
import time

from models import BoardModel, ListModel, CardModel, SessionLocal, create_tables
from seed import seed

app = FastAPI(title="FlowBoard API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Database startup ---

@app.on_event("startup")
def startup():
    """Initialize database and seed on first run."""
    create_tables()
    seed()


# --- Dependency: database session ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Pydantic response/request models ---

class CardData(BaseModel):
    id: str
    title: str
    description: str
    createdAt: int

    class Config:
        from_attributes = True  # allow creating from SQLAlchemy model attributes

class ListData(BaseModel):
    id: str
    title: str
    cards: list[CardData]

    class Config:
        from_attributes = True

class BoardData(BaseModel):
    id: str
    title: str
    lists: list[ListData]

    class Config:
        from_attributes = True

class CreateBoardRequest(BaseModel):
    title: str

class CreateCardRequest(BaseModel):
    title: str
    description: str = ""

class UpdateCardRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class MoveCardRequest(BaseModel):
    from_list_id: str
    to_list_id: str


# --- Helper: convert SQLAlchemy model to Pydantic-compatible dict ---

def board_to_dict(board: BoardModel) -> dict:
    """Convert BoardModel to the dict shape expected by BoardData."""
    return {
        "id": board.id,
        "title": board.title,
        "lists": [
            {
                "id": lst.id,
                "title": lst.title,
                "cards": [
                    {
                        "id": card.id,
                        "title": card.title,
                        "description": card.description,
                        "createdAt": card.created_at,
                    }
                    for card in sorted(lst.cards, key=lambda c: c.position)
                ]
            }
            for lst in sorted(board.lists, key=lambda l: l.position)
        ]
    }


# --- Routes ---

@app.get("/api/ping")
async def ping():
    return {"message": "pong", "version": "0.2.0"}


@app.get("/api/boards", response_model=list[BoardData])
async def get_boards(db: Session = Depends(get_db)):
    boards = db.query(BoardModel).all()
    return [board_to_dict(b) for b in boards]


@app.post("/api/boards", response_model=BoardData, status_code=201)
async def create_board(request: CreateBoardRequest, db: Session = Depends(get_db)):
    board_id = f"board-{uuid.uuid4().hex[:8]}"
    board = BoardModel(id=board_id, title=request.title)
    
    list1 = ListModel(id=f"list-{uuid.uuid4().hex[:8]}", title="To Do", position=0, board_id=board_id)
    list2 = ListModel(id=f"list-{uuid.uuid4().hex[:8]}", title="Done", position=1, board_id=board_id)
    
    db.add(board)
    db.add(list1)
    db.add(list2)
    db.commit()
    db.refresh(board)
    
    return board_to_dict(board)


@app.post(
    "/api/boards/{board_id}/lists/{list_id}/cards",
    response_model=CardData,
    status_code=201
)
async def create_card(
    board_id: str,
    list_id: str,
    request: CreateCardRequest,
    db: Session = Depends(get_db)
):
    lst = db.query(ListModel).filter(
        ListModel.id == list_id,
        ListModel.board_id == board_id
    ).first()

    if lst is None:
        raise HTTPException(status_code=404, detail=f"List '{list_id}' not found")

    # Get max position for ordering
    max_position = max((c.position for c in lst.cards), default=-1)

    card = CardModel(
        id=f"card-{uuid.uuid4().hex[:8]}",
        title=request.title,
        description=request.description,
        created_at=int(time.time() * 1000),
        position=max_position + 1,
        list_id=list_id
    )
    db.add(card)
    db.commit()
    db.refresh(card)

    return {
        "id": card.id,
        "title": card.title,
        "description": card.description,
        "createdAt": card.created_at,
    }


@app.patch(
    "/api/boards/{board_id}/lists/{list_id}/cards/{card_id}",
    response_model=CardData
)
async def update_card(
    board_id: str,
    list_id: str,
    card_id: str,
    request: UpdateCardRequest,
    db: Session = Depends(get_db)
):
    card = db.query(CardModel).filter(
        CardModel.id == card_id,
        CardModel.list_id == list_id
    ).first()

    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")

    if request.title is not None:
        if len(request.title.strip()) == 0:
            raise HTTPException(status_code=422, detail="Title cannot be empty")
        card.title = request.title.strip()

    if request.description is not None:
        card.description = request.description

    db.commit()
    db.refresh(card)

    return {
        "id": card.id,
        "title": card.title,
        "description": card.description,
        "createdAt": card.created_at,
    }


@app.delete(
    "/api/boards/{board_id}/lists/{list_id}/cards/{card_id}",
    status_code=204
)
async def delete_card(
    board_id: str,
    list_id: str,
    card_id: str,
    db: Session = Depends(get_db)
):
    card = db.query(CardModel).filter(
        CardModel.id == card_id,
        CardModel.list_id == list_id
    ).first()

    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")

    db.delete(card)
    db.commit()
    return None


@app.post(
    "/api/boards/{board_id}/cards/{card_id}/move",
    response_model=BoardData
)
async def move_card(
    board_id: str,
    card_id: str,
    request: MoveCardRequest,
    db: Session = Depends(get_db)
):
    card = db.query(CardModel).filter(CardModel.id == card_id).first()
    if card is None:
        raise HTTPException(status_code=404, detail=f"Card '{card_id}' not found")

    target_list = db.query(ListModel).filter(
        ListModel.id == request.to_list_id,
        ListModel.board_id == board_id
    ).first()
    if target_list is None:
        raise HTTPException(status_code=404, detail=f"Target list '{request.to_list_id}' not found")

    max_position = max((c.position for c in target_list.cards), default=-1)
    card.list_id = request.to_list_id
    card.position = max_position + 1
    db.commit()

    board = db.query(BoardModel).filter(BoardModel.id == board_id).first()
    return board_to_dict(board)
```

---

## Step 5 — Run the server with the database

```powershell
# In backend/ with venv active:
uvicorn main:app --reload
```

The startup handler creates tables and seeds initial data automatically. A `flowboard.db` file will appear in the `backend/` directory.

### SAVE AND TRY

1. Start the server — check the console for "Database seeded successfully."
2. Visit `http://localhost:8000/api/boards` — see the seeded boards
3. Add a card in the frontend
4. **Stop the server** (Ctrl+C)
5. **Start it again** — the card is still there. Data survived the restart.

---

## Step 6 — Add `flowboard.db` to `.gitignore`

The database file is generated data — it should not be committed to version control. Create or update `backend/.gitignore`:

```
venv/
__pycache__/
*.pyc
flowboard.db
```

---

## 🎯 Challenge: Add a `GET /api/boards/{board_id}` route

**You know:** SQLAlchemy queries, FastAPI routes, dependency injection

**Task:** Add a route that returns a single board by ID. Return 404 if the board doesn't exist.

**Hints:**
- `db.query(BoardModel).filter(BoardModel.id == board_id).first()`
- Return 404: `raise HTTPException(status_code=404, detail="...")`

---

<details>
<summary>▶ Show Solution</summary>

```python
@app.get("/api/boards/{board_id}", response_model=BoardData)
async def get_board(board_id: str, db: Session = Depends(get_db)):
    board = db.query(BoardModel).filter(BoardModel.id == board_id).first()
    if board is None:
        raise HTTPException(status_code=404, detail=f"Board '{board_id}' not found")
    return board_to_dict(board)
```

**Key insight:** Having a single-board endpoint (`GET /api/boards/{id}`) is essential for real applications. Rather than always fetching all boards, the frontend can fetch only the active board when the user switches. This matters when boards are large — loading only what's needed is a performance optimization. In Lab 30, you will use this endpoint to implement "switch boards without waiting for all board data."

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `flowboard.db` file appears in `backend/` | Check directory after first run |
| Initial boards are in the database | `GET /api/boards` shows seeded data |
| Added cards survive server restart | Add card → restart server → card still there |
| Deleted cards are gone after restart | Delete card → restart → card gone |
| `models.py` has Board, List, Card models | Check the file |
| `seed.py` checks for existing data before seeding | Check the `count() > 0` condition |
| `flowboard.db` is in `.gitignore` | Check `backend/.gitignore` |
| No frontend changes required | App works identically |
| `get_db` dependency uses `try/finally` | Check models.py |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Why does in-memory data not survive restarts?**

Python variables (including the `boards: list[dict]` list) live in the process's memory (RAM). When the process exits, the operating system reclaims that memory. There is no file, no disk storage — the data is simply gone. A database is different: it stores data in files on disk. Files persist across process restarts. SQLite stores the entire database in a single `.db` file. When the server starts, SQLAlchemy reads the existing file and the data is available again.

**2. When you do `card.title = "New title"` with an ORM, what happens?**

The ORM's session tracks that `card` has been modified (it has a "dirty" state). When you call `db.commit()`, the session generates the SQL: `UPDATE cards SET title = 'New title' WHERE id = 'card-1'` and sends it to the database. You never write SQL yourself — you just work with Python objects and call commit when you're done. If you forget to call `db.commit()`, the change stays in the session's memory but never reaches the database. If the process crashes before commit, the change is lost (this is intentional — atomicity).

**3. SQLite vs PostgreSQL — when is SQLite good enough?**

SQLite: file-based, no separate server process, single-writer (only one write at a time), perfect for development and small single-user apps. PostgreSQL: runs as a server, handles many concurrent writes, proper user/permission management, needed for production multi-user apps. SQLite is good enough for: development, testing, single-user desktop/mobile apps, read-heavy apps with rare writes. It breaks down when: multiple servers write simultaneously (scaled deployment), you need advanced features (full-text search, JSONB). FlowBoard uses SQLite in development — Lab 49 (production) will discuss switching to PostgreSQL for real deployment.

---

## Next Lab

In **LAB-20**, you will add user authentication. Boards will belong to users — each user sees only their own boards. You will implement user registration and login with hashed passwords, JWT (JSON Web Tokens) for sessions, and the `Authorization` header that all API routes will check.
