# Python Tool Database — LAB 76 — Routes for Holders, Assemblies, and Jobs

**Prerequisites:** Lab 75 (CRUD routes for tools, APIRouter). Lab 69 (AssemblyORM, JobORM). You have tool CRUD and the assembly/job models. This lesson adds REST routes for those models.

**What this lab adds:**
- Schemas for `HolderRead`, `AssemblyRead`, `JobRead`, `JobCreate`
- Nested resource routes: `GET /jobs/{job_id}/assemblies`
- `response_model_include` and `response_model_exclude` for controlling which fields serialize
- An `AssemblyUpdate` schema for assigning a tool to an assembly

**Time:** 50–60 minutes

---

## What You Will Build

Three new router files with these routes:

```
GET     /jobs                         list all jobs
GET     /jobs/{id}                    get one job (with its assemblies)
POST    /jobs                         create a job with N empty positions
DELETE  /jobs/{id}                    delete a job and its assemblies

GET     /jobs/{job_id}/assemblies             list assemblies in a job
PATCH   /jobs/{job_id}/assemblies/{asm_id}   assign a tool to an assembly
```

---

> **Quick Check — try to answer before reading:**
>
> 1. `JobRead` should include the list of assemblies — each with its assigned tool. How does SQLAlchemy load the assemblies? You already know the answer from Lab 69.
> 2. Creating a job creates N assemblies at the same time. Should the `POST /jobs` route return 201 or 200?
> 3. `PATCH /jobs/5/assemblies/12` — this URL has two path parameters. How does FastAPI know which is `job_id` and which is `asm_id`?
>
> *(Answers at the end of this lab)*

---

## Step 1 — Job and Assembly Schemas

The desktop app used `JobORM` and `AssemblyORM` directly (Lab 69). The API needs Pydantic schemas — the same three-schema pattern from Lab 52.

Add to `tooldb/schemas/` — create `job_schemas.py`:

```python
from pydantic import BaseModel, model_validator
from typing import Optional


class AssemblyRead(BaseModel):
    model_config = {"from_attributes": True}   # from_attributes from Lab 50

    id       : int
    position : int
    job_id   : int
    tool_id  : Optional[int] = None
    tool_name: Optional[str] = None    # denormalized for convenience — avoids a second API call


class JobCreate(BaseModel):
    name       : str
    description: Optional[str] = None
    positions  : int = 4   # number of empty assembly slots to create

    @model_validator(mode="after")
    def validate_positions(self) -> "JobCreate":
        if self.positions < 1 or self.positions > 100:
            raise ValueError("positions must be between 1 and 100")
        return self


class JobRead(BaseModel):
    model_config = {"from_attributes": True}

    id         : int
    name       : str
    description: Optional[str] = None
    assemblies : list[AssemblyRead] = []
```

`tool_name: Optional[str]` in `AssemblyRead` is denormalized — a tool's name is stored in `tools_orm` but we include it in the assembly response so the client does not need a second `GET /tools/{id}` call. This is a common API design choice: denormalize read models for client convenience.

### SAVE AND TRY

```python
from tooldb.schemas.job_schemas import JobCreate, AssemblyRead, JobRead

job_data = JobCreate(name="Test Job", positions=3)
print(f"Job: {job_data.name}, positions: {job_data.positions}")

try:
    bad = JobCreate(name="Bad", positions=200)
except Exception as error:
    print(f"Validation caught: {error}")
```

**You should see:**
```
Job: Test Job, positions: 3
Validation caught: ...positions must be between 1 and 100...
```

---

## Step 2 — Job Service Methods

Before writing routes, extend `ToolService` or create a `JobService`. The pattern is the same as Lab 52 — typed input, typed output.

Create `tooldb/services/job_service.py` and start with the imports and class skeleton:

```python
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
from tooldb.orm.models import JobORM, AssemblyORM, ToolORM
from tooldb.schemas.job_schemas import JobCreate, JobRead, AssemblyRead


class JobService:

    def __init__(self, session: Session):
        self._session = session
```

Now `create_job`. Creating a job means creating N `AssemblyORM` rows at the same time — a list comprehension assigns them directly to `job.assemblies` before the add:

```python
    def create_job(self, data: JobCreate) -> JobRead:
        job = JobORM(name=data.name, description=data.description)
        job.assemblies = [AssemblyORM(position=i + 1) for i in range(data.positions)]
        self._session.add(job)
        self._session.commit()
        self._session.refresh(job)
        return self._to_job_read(job)
```

`session.refresh(job)` — after `commit()`, SQLAlchemy expires all in-memory attribute values on the object (it assumes the database may have changed them via triggers or defaults). `refresh()` immediately reloads the object from the database so `job.id` and `job.assemblies` are current. Without it, accessing `job.id` after a commit would trigger a new lazy query — or raise a `DetachedInstanceError` if the session was closed. Call `refresh()` whenever you need to use an object's values immediately after a commit.

The read methods both need the assemblies and their tools loaded in a single query. `.joinedload(A).joinedload(B)` chains two eager loads — first join to assemblies, then join from assemblies to tools:

```python
    def get_all_jobs(self) -> list[JobRead]:
        jobs = self._session.scalars(
            select(JobORM).options(
                joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool)
            )
        ).unique().all()
        return [self._to_job_read(job) for job in jobs]

    def get_job(self, job_id: int) -> JobRead | None:
        job = self._session.scalar(
            select(JobORM)
            .where(JobORM.id == job_id)
            .options(joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool))
        )
        return self._to_job_read(job) if job else None
```

`.unique().all()` is required when using `joinedload` on a collection — the JOIN produces duplicate parent rows (one per child), and `.unique()` collapses them back to distinct `JobORM` objects.

For deletes, `session.get(JobORM, job_id)` is a shorthand for `SELECT * FROM job WHERE id = ?` — it goes through SQLAlchemy's identity map cache before hitting the database:

```python
    def delete_job(self, job_id: int) -> bool:
        job = self._session.get(JobORM, job_id)
        if job is None:
            return False
        self._session.delete(job)
        self._session.commit()
        return True
```

The cascade rule on `JobORM.assemblies` (from Step — set `cascade="all, delete-orphan"` on the relationship) means deleting the job automatically deletes all its assemblies. One `session.delete(job)` removes the whole tree.

Assigning a tool requires verifying the assembly belongs to the specified job — both `assembly_id` and `job_id` appear in the WHERE clause:

```python
    def assign_tool(self, job_id: int, assembly_id: int, tool_id: int | None) -> AssemblyRead | None:
        asm = self._session.scalar(
            select(AssemblyORM)
            .where(AssemblyORM.id == assembly_id, AssemblyORM.job_id == job_id)
        )
        if asm is None:
            return None
        asm.tool_id = tool_id
        self._session.commit()
        self._session.refresh(asm)
        return self._to_assembly_read(asm)
```

`session.refresh(asm)` here for the same reason as in `create_job`: after setting `tool_id` and committing, `asm.tool` (the related `ToolORM`) is expired. `refresh()` reloads it so `_to_assembly_read` can access `asm.tool.name`.

Finally, the private helpers that convert ORM objects to Pydantic schemas — the service layer pattern from Lab 52, so the routes never touch ORM objects directly:

```python
    def _to_assembly_read(self, asm: AssemblyORM) -> AssemblyRead:
        return AssemblyRead(
            id       = asm.id,
            position = asm.position,
            job_id   = asm.job_id,
            tool_id  = asm.tool_id,
            tool_name= asm.tool.name if asm.tool else None,
        )

    def _to_job_read(self, job: JobORM) -> JobRead:
        return JobRead(
            id         = job.id,
            name       = job.name,
            description= job.description,
            assemblies = [self._to_assembly_read(asm) for asm in
                          sorted(job.assemblies, key=lambda a: a.position)],
        )
```

`sorted(..., key=lambda a: a.position)` — assembles come back from the database in insertion order, which may not be position order. Sorting here guarantees position 1 is always first in the response.

### SAVE AND TRY

```python
from tooldb.orm.session import SessionLocal
from tooldb.services.job_service import JobService
from tooldb.schemas.job_schemas import JobCreate

with SessionLocal() as session:
    svc = JobService(session)
    job = svc.create_job(JobCreate(name="API Test Job", positions=2))
    print(f"Created: id={job.id}, assemblies={len(job.assemblies)}")

    loaded = svc.get_job(job.id)
    print(f"Loaded: {loaded.name}, {len(loaded.assemblies)} positions")
    for asm in loaded.assemblies:
        print(f"  Position {asm.position}: {asm.tool_name or '[unassigned]'}")
```

**You should see:**
```
Created: id=1, assemblies=2
Loaded: API Test Job, 2 positions
  Position 1: [unassigned]
  Position 2: [unassigned]
```

---

## Step 3 — Job Routes

Create `tooldb_api/routes/jobs.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from tooldb_api.dependencies import get_db
from tooldb.services.job_service import JobService
from tooldb.schemas.job_schemas import JobCreate, JobRead


router = APIRouter()
```

```python
@router.get("/", response_model=list[JobRead])
def list_jobs(session: Session = Depends(get_db)):
    return JobService(session).get_all_jobs()


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: int, session: Session = Depends(get_db)):
    job = JobService(session).get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job


@router.post("/", response_model=JobRead, status_code=status.HTTP_201_CREATED)
def create_job(job_data: JobCreate, session: Session = Depends(get_db)):
    return JobService(session).create_job(job_data)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: int, session: Session = Depends(get_db)):
    if not JobService(session).delete_job(job_id):
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
```

Register in `main.py`:

```python
from tooldb_api.routes.jobs import router as jobs_router
app.include_router(jobs_router, prefix="/jobs", tags=["Jobs"])
```

### SAVE AND TRY

Open `http://127.0.0.1:8000/docs`. Find the "Jobs" section.

**POST `/jobs`** with body:
```json
{"name": "Fixture A Setup", "positions": 3}
```

**You should see** a 201 response with the new job and 3 unassigned assemblies:
```json
{
  "id": 1,
  "name": "Fixture A Setup",
  "assemblies": [
    {"id": 1, "position": 1, "job_id": 1, "tool_id": null, "tool_name": null},
    ...
  ]
}
```

---

## Step 4 — Assembly Assignment Route

```python
# Add to tooldb_api/routes/jobs.py:

from tooldb.schemas.job_schemas import AssemblyRead
from pydantic import BaseModel
from typing import Optional


class AssignToolRequest(BaseModel):
    tool_id: Optional[int] = None   # None = unassign; int = assign this tool


@router.patch("/{job_id}/assemblies/{assembly_id}", response_model=AssemblyRead)
def assign_tool(job_id: int, assembly_id: int,
                body: AssignToolRequest,
                session: Session = Depends(get_db)):
    """
    Assigns (or unassigns) a tool to an assembly position.
    Pass tool_id=null to unassign.
    The assembly must belong to the specified job.
    """
    result = JobService(session).assign_tool(job_id, assembly_id, body.tool_id)
    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"Assembly {assembly_id} not found in job {job_id}"
        )
    return result
```

`job_id` and `assembly_id` are both path parameters — FastAPI matches them by name from `{job_id}` and `{assembly_id}` in the URL. `body: AssignToolRequest` is the request body. FastAPI correctly identifies each parameter by its type: path parameters are simple types (`int`, `str`); request body parameters are Pydantic models.

### SAVE AND TRY

In `/docs`, try `PATCH /jobs/1/assemblies/1` with body:

```json
{"tool_id": 1}
```

**You should see** the assembly updated with the tool:
```json
{"id": 1, "position": 1, "job_id": 1, "tool_id": 1, "tool_name": "EM-0500"}
```

Now try with `{"tool_id": null}`:

**You should see** the tool unassigned: `"tool_id": null, "tool_name": null`.

---

## 🎯 Challenge: Job with Full Tool Details

**You know:** `JobRead.assemblies` contains `AssemblyRead` objects with `tool_id` and `tool_name`. A client might also want the full tool details (diameter, flute_count, etc.) without making a second request.

**Task:** Add a `GET /jobs/{job_id}/full` route that returns the job with full `ToolRead` data embedded in each assembly. Define an `AssemblyFullRead` schema that includes `tool: Optional[ToolRead]` instead of just `tool_name: Optional[str]`.

**Starting code:**

```python
# In job_schemas.py:
from tooldb.schemas.tool_schemas import ToolRead

class AssemblyFullRead(BaseModel):
    model_config = {"from_attributes": True}
    id       : int
    position : int
    job_id   : int
    tool_id  : Optional[int] = None
    tool     : Optional[ToolRead] = None   # ← full tool object, not just name


class JobFullRead(BaseModel):
    model_config = {"from_attributes": True}
    id         : int
    name       : str
    description: Optional[str] = None
    assemblies : list[AssemblyFullRead] = []
```

Add a `get_job_full()` method to `JobService` and a `GET /jobs/{job_id}/full` route.

---

<details>
<summary>▶ Show Solution</summary>

In `JobService`:

```python
def get_job_full(self, job_id: int):
    from tooldb.schemas.job_schemas import JobFullRead, AssemblyFullRead
    from tooldb.schemas.tool_schemas import ToolRead

    job = self._session.scalar(
        select(JobORM)
        .where(JobORM.id == job_id)
        .options(joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool))
    )
    if job is None:
        return None

    assemblies = []
    for asm in sorted(job.assemblies, key=lambda a: a.position):
        tool = ToolRead.model_validate(asm.tool) if asm.tool else None
        assemblies.append(AssemblyFullRead(
            id=asm.id, position=asm.position, job_id=asm.job_id,
            tool_id=asm.tool_id, tool=tool,
        ))

    return JobFullRead(id=job.id, name=job.name,
                       description=job.description, assemblies=assemblies)
```

Route in `jobs.py`:

```python
from tooldb.schemas.job_schemas import JobFullRead

@router.get("/{job_id}/full", response_model=JobFullRead)
def get_job_full(job_id: int, session: Session = Depends(get_db)):
    job = JobService(session).get_job_full(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    return job
```

**Key insight:** Two endpoints serving the same resource with different detail levels is a common API design pattern. `/jobs/{id}` is fast (small response, no extra joins). `/jobs/{id}/full` is thorough (all nested data in one request). Let clients choose based on their needs — the client that just needs to display a job name does not pay the cost of loading full tool records.

</details>

---

## Final Check

| What to verify | How to verify |
|---|---|
| `POST /jobs` creates job with N assemblies | Post `{"name": "Test", "positions": 3}` — response has 3 assemblies |
| `GET /jobs/{id}` includes assemblies | Response includes `"assemblies": [...]` |
| `POST /jobs` with positions=200 returns 422 | Validation fails before hitting the database |
| `PATCH /jobs/{id}/assemblies/{id}` assigns tool | Assign a tool, verify `tool_name` in response |
| `DELETE /jobs/{id}` cascades to assemblies | Delete a job, query assemblies — none remain |

---

## Quick Check Answers

**1. How does SQLAlchemy load the assemblies for `JobRead`?**
`joinedload(JobORM.assemblies).joinedload(AssemblyORM.tool)` — eager loading via a JOIN query. First introduced in Lab 48 and used in Lab 69. Without eager loading, accessing `job.assemblies` after the session closes raises `DetachedInstanceError` because lazy loading requires an open session. In an API, the session is open only during the request — eager loading is required whenever you access related objects after the session-owning `with` block exits.

**2. Should `POST /jobs` return 201 or 200?**
201 Created. `POST` that creates a new resource should return 201. The created job (with its new ID and assemblies) is included in the response body. 200 is for requests that succeed without creating a new resource. The semantic distinction matters: monitoring tools, API gateways, and client libraries interpret 201 as "a new thing was made" and 200 as "the request succeeded but nothing was created."

**3. How does FastAPI know which `{job_id}` and which `{assembly_id}`?**
By name. The URL pattern `/{job_id}/assemblies/{assembly_id}` has two named placeholders. FastAPI matches each placeholder name to the function parameter with the same name: `job_id: int` receives the value from `{job_id}`, `assembly_id: int` receives the value from `{assembly_id}`. The names must match exactly — case-sensitive. If you name the function parameter `asm_id` but the URL says `{assembly_id}`, FastAPI will not find a path parameter for `asm_id` and will try to read it from the query string instead.
