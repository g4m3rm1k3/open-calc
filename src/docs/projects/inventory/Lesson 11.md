# Lesson 11: API Boundaries and Client-Side Rendering

**What you will build**
You will build a lightweight, vanilla JavaScript frontend that connects to our FastAPI backend. The problem we are solving is distributed accessibility: a database and API are useless if humans cannot interact with them comfortably. We will design a flat, data-dense activity table to display our inventory, ensuring the interface remains crisp and tactile without obscuring information behind pop-up modal windows.

**What you need to know first**
From Lesson 9: FastAPI routing, endpoints, and the `uvicorn` web server.

**The Pipeline**
`[ Browser (JS/DOM) ] → Client Request → FastAPI (Routing) → Pydantic (Validation) → SQLAlchemy (ORM) → SQLite (Storage)`

This lesson introduces the final, outermost layer: **Browser (JS/DOM)**. The browser will execute JavaScript to fire a network request across a local port, receive the Pydantic-validated JSON from FastAPI, and manipulate the Document Object Model (DOM) to render the data structurally on the screen.

---

## Concept Unit: Cross-Origin Resource Sharing (CORS)

### The Problem

If you open a simple HTML file in your browser (`file:///index.html`) or run a frontend dev server (like `http://localhost:5500`), and that page's JavaScript tries to `fetch()` data from our API at `[http://127.0.0.1:8000](http://127.0.0.1:8000)`, the browser will deliberately block the request and throw a severe error. This is a fundamental security mechanism called the Same-Origin Policy. We must explicitly instruct FastAPI to trust requests coming from different ports.

### Introduce the concept in isolation

Create a temporary `lab_cors.html` file to witness the browser's security blockade.

```html
<!DOCTYPE html>
<html>
<body>
    <script>
        // Attempting to fetch from our running FastAPI server
        fetch("http://127.0.0.1:8000/health")
            .then(response => response.json())
            .then(data => console.log("Success:", data))
            .catch(error => console.error("CORS Blocked This:", error));
    </script>
</body>
</html>

```

Ensure your FastAPI server from Lesson 9 is running in a terminal (`python nexus/main.py`). Then, open `lab_cors.html` directly in your web browser and open the Developer Tools Console (F12).

Output in the Browser Console:

```text
Access to fetch at 'http://127.0.0.1:8000/health' from origin 'null' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
CORS Blocked This: TypeError: Failed to fetch

```

*What this proves:* Even though the backend server successfully received the request (you will see a 200 OK in the Uvicorn terminal), the *browser* intercepted the response and hid it from the JavaScript because the API did not explicitly grant permission for cross-origin access.

### Discard the throwaway example

Delete `lab_cors.html`. We will now configure FastAPI to send the correct security headers.

### Project Change

We will add the CORS Middleware to our FastAPI application registry.

* **Files affected:** `nexus/main.py`.
* **Change type:** Modify.
* **Location:** Immediately after the `app = FastAPI(...)` instantiation.
* **Dependencies:** Requires importing `CORSMiddleware`.

### The New Code

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

```

### The Updated Project

Here is the upper section of `nexus/main.py` showing the middleware injected before any of the route definitions.

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware # ← new: Import the middleware
from sqlalchemy.orm import Session
import uvicorn

from db import get_db_session
from schemas import SKUCreate, SKURead
import crud

app = FastAPI(title="NexusInventory API")

# ← new: Configure the CORS security boundary
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
# ... (rest of the endpoints remain unchanged)

```

The API will now append `Access-Control-Allow-Origin` headers to every outbound response, telling the browser it is safe to hand the JSON to the frontend script.

### Mechanical walkthrough

1. `from fastapi.middleware.cors import CORSMiddleware`: (First appearance). Imports the middleware class. Middleware is code that runs on *every* request before it reaches the router, and on *every* response before it leaves the server.
2. `app.add_middleware(...)`: (First appearance). Registers the middleware with the ASGI engine.
3. `CORSMiddleware`: The class being registered.
4. `allow_origins=["*"]`: (First appearance). A list of domains allowed to talk to this API. `"*"` is a wildcard meaning "allow absolutely anyone."
5. `allow_credentials=True`: (First appearance). Permits the browser to send cookies or authentication headers across the origin boundary.
6. `allow_methods=["*"]`: Permits all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
7. `allow_headers=["*"]`: Permits the client to send custom headers (like `Authorization`).

### CS Lens

**The Confused Deputy Problem.** CORS exists to prevent malicious websites from using your browser's saved authentication. If you are logged into your bank on Tab A, and open `evil.com` on Tab B, Tab B's JavaScript could quietly send a `POST` request to your bank. Because your browser automatically attaches your bank cookies, the bank thinks *you* made the request. By enforcing CORS, the browser asks the bank, "Did you authorize `evil.com` to send this?" The bank says no, and the browser aborts the request.

### SE Lens

Why use `["*"]` for origins? **Development vs. Production.** In local development, you don't know exactly what port your frontend will run on (5500, 3000, 8080), so the wildcard prevents friction. In a production environment, `allow_origins=["*"]` is a critical security vulnerability. Before deploying, this must be changed to the exact domain of the frontend (e.g., `allow_origins=["[https://dashboard.nexusinventory.com](https://dashboard.nexusinventory.com)"]`).

### Commands needed to make this unit real

No commands needed; if your FastAPI server is running with `reload=True`, it will restart automatically.

### One sentence connecting this unit to what came immediately before.

With the security barrier lifted, we can now write the asynchronous JavaScript required to pull data across the network boundary.

---

## Concept Unit: Asynchronous Fetch and DOM Binding

### The Problem

Network requests take time. If JavaScript pauses its execution to wait for the API to respond with the SKU data, the entire web page freezes—scrolling stops, and buttons become unclickable. Furthermore, once we have the data, we must structurally inject it into the page. We want a clear activity table rather than UI modal windows, because modals disrupt the user's context and slow down tactile data entry.

### Introduce the concept in isolation

Create `lab_async.js` to see how JavaScript handles time-delayed data using Promises.

```javascript
// 1. Mark the function as asynchronous so it doesn't block the main thread
async function loadData() {
    console.log("1. Sending request...");
    
    // 2. The await keyword pauses *this function*, not the browser
    const response = await fetch("http://127.0.0.1:8000/health");
    
    // 3. Parse the JSON body asynchronously
    const data = await response.json();
    console.log("3. Data received:", data);
}

loadData();
console.log("2. This logs BEFORE the data arrives because the thread isn't blocked!");

```

Run it via Node.js in your terminal:

```bash
node lab_async.js

```

Output:

```text
1. Sending request...
2. This logs BEFORE the data arrives because the thread isn't blocked!
3. Data received: { status: 'ok', system: 'online' }

```

*What this proves:* The `async/await` syntax allows the program to initiate a network request, instantly move on to other tasks (keeping the UI responsive), and then seamlessly jump back into the function once the network responds.

### Discard the throwaway example

Delete `lab_async.js`. We will now build the real frontend interface for NexusInventory.

### Project Change

We will create a new directory for our frontend and add two files: an HTML structure featuring an activity table, and the JavaScript to populate it.

* **Files affected:** Create `nexus/frontend/index.html` and `nexus/frontend/app.js`.
* **Change type:** Add.
* **Location:** Brand-new files in a brand-new directory.
* **Dependencies:** Requires the FastAPI server to be running.

### The New Code

**1. The Structure (`nexus/frontend/index.html`):**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>NexusInventory Dashboard</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 20px; background: #f4f4f5; }
        /* The Activity Table styling */
        .activity-table { width: 100%; border-collapse: collapse; background: white; }
        .activity-table th, .activity-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e4e4e7; }
        .activity-table th { background: #18181b; color: white; }
        /* Functional bug prevention: ensuring buttons are styled to be visible */
        .action-btn { padding: 6px 12px; background: #2563eb; color: white; border: none; cursor: pointer; }
    </style>
</head>
<body>
    <h2>SKU Activity Dashboard</h2>
    <table class="activity-table">
        <thead>
            <tr>
                <th>SKU ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="sku-table-body">
            <!-- JavaScript will inject rows here -->
        </tbody>
    </table>
    <script src="app.js"></script>
</body>
</html>

```

**2. The Logic (`nexus/frontend/app.js`):**

```javascript
const API_BASE = "http://127.0.0.1:8000";

async function fetchAndRenderSKU(skuId) {
    try {
        const response = await fetch(`${API_BASE}/skus/${skuId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const sku = await response.json();
        
        const tbody = document.getElementById("sku-table-body");
        
        // Construct the row dynamically
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${sku.sku_id}</strong></td>
            <td>${sku.name}</td>
            <td>${sku.description || "N/A"}</td>
            <td>
                <button class="action-btn" onclick="alert('Move initiated for ${sku.sku_id}')">
                    Move Stock
                </button>
            </td>
        `;
        
        tbody.appendChild(tr);
    } catch (error) {
        console.error("Failed to fetch SKU:", error);
    }
}

// Fetch the test SKU we created in Lesson 9
fetchAndRenderSKU("TEST-99");

```

### The Updated Project

Because these are brand-new files, the code blocks above represent their entirety. `index.html` provides a strict, flat table layout, deliberately avoiding hidden modal states. `app.js` fetches the data and dynamically constructs HTML elements to slot into that table.

### Mechanical walkthrough

1. *(In HTML)* `<table class="activity-table">`: (First appearance). Semantic HTML for tabular data. We use a flat table to keep all context visible on screen at once.
2. `<tbody id="sku-table-body">`: (First appearance). An empty container with a unique `id`. This acts as the anchor point for our JavaScript.
3. `.action-btn { padding: 6px... }`: (First appearance). CSS styling. A component button might have a perfect JavaScript event handler attached to it, but if the underlying bug is missing styles (causing it to collapse or turn transparent), it becomes functionally broken to the user.
4. *(In JS)* `async function fetchAndRenderSKU(skuId)`: (Already established syntax). Declares a non-blocking function.
5. `try { ... } catch (error) { ... }`: (Hard concept repeating: Error Handling). Just like Python's `try/except` in our CRUD layer, this catches network failures or JSON parsing errors so the script doesn't crash silently.
6. `const response = await fetch(...)`: (Already established syntax). Initiates the GET request and waits for the headers.
7. `if (!response.ok)`: (First appearance). The `fetch` API does *not* throw an error for HTTP 404 or 500 status codes; it considers the request successful because it got a response. We must manually check the `.ok` boolean (which is `true` for status 200-299) and throw our own error if it failed.
8. `const tbody = document.getElementById("sku-table-body")`: (First appearance). The core DOM API. It scans the HTML document and retrieves a direct memory reference to the `<tbody>` element we defined earlier.
9. `document.createElement("tr")`: (First appearance). Asks the browser to construct a new Table Row element in memory.
10. `tr.innerHTML = \`...``: (First appearance). Uses JS template literals (backticks) to inject raw HTML strings directly into the element. We use `${sku.name}` to interpolate the JSON data directly into the markup.
11. `tbody.appendChild(tr)`: (First appearance). Takes the fully constructed row in memory and physically attaches it to the live webpage, making it instantly visible to the user.

### CS Lens

**The Model-View-Controller (MVC) in the Browser.** The `app.js` script acts as the Controller. The JSON data fetched from the API is the Model. The DOM elements created via `innerHTML` are the View. By manipulating the DOM directly rather than refreshing the whole page from the server, we have built a Single Page Application (SPA) architecture, dramatically reducing server load and network bandwidth.

### SE Lens

Why use an inline Activity Table instead of clicking a row to open a "Move Stock" modal window? **Cognitive Load.** Modals are a notorious UX anti-pattern for data-entry applications. When a modal pops up, it covers the surrounding rows. If a user needs to reference the SKU ID of the row *below* the one they are editing, they have to close the modal, memorize the ID, and reopen the modal. A dense activity table keeps all contextual data visible simultaneously, allowing for rapid, tactile workflow.

### Commands needed to make this unit real

You do not need to run a server for the frontend; you can simply open the HTML file directly.

```bash
# MacOS
open nexus/frontend/index.html
# Linux
xdg-open nexus/frontend/index.html
# Windows
start nexus/frontend/index.html

```

### Run it. Show the real output.

A web page opens displaying:

**SKU Activity Dashboard**

| SKU ID | Name | Description | Actions |
| --- | --- | --- | --- |
| **TEST-99** | API Bolt | N/A | [ Move Stock ] |

Clicking the blue "Move Stock" button triggers a browser alert: `Move initiated for TEST-99`.

### One sentence connecting this unit to what came immediately before.

With the frontend successfully parsing our API and binding it to a clean activity table, the full stack—from the browser DOM down to the SQLite file—is fully connected and operational.

---

## Closing

**Connect the pieces**
To trace the final pipeline: When `index.html` loads, the browser executes `app.js`. The JavaScript `fetch()` fires an HTTP request to port 8000. Uvicorn intercepts it and hands it to FastAPI (`main.py`). The CORS middleware inspects the origin and allows it through. The route `GET /skus/TEST-99` is matched. The dependency injector opens a `Session` (`db.py`). The CRUD layer (`crud.py`) queries SQLAlchemy (`models.py`), which reads the SQLite file. The ORM object is parsed by Pydantic (`schemas.py`), converting it to a safe dictionary. FastAPI returns the JSON response. The browser's `await fetch()` unpauses, receives the JSON, and `app.js` creates a `<tr>` DOM element, injecting it into the Activity Table for the user to see.

**What breaks without this**
If you remove the `.action-btn` CSS class from the HTML file, the JavaScript will still function perfectly, the DOM node will still be created, and the `onclick` handler will still exist. However, the button will default to the browser's generic, low-contrast gray styling, potentially blending into the background. Functional logic is useless if the UI layer prevents the user from confidently interacting with it.

**Exercises**

1. Modify `app.js` to intentionally fetch a SKU that doesn't exist (e.g., `fetchAndRenderSKU("FAKESKU")`). Open the browser console to observe how the `!response.ok` guard clause successfully catches the HTTP 404 error thrown by FastAPI.
2. In `app.js`, duplicate the `fetchAndRenderSKU("TEST-99");` call on the last line, but change the argument to a different SKU ID if you created one in previous lessons. Refresh the browser and watch the table dynamically populate multiple rows.

**Definition of Done**

* [x] CORS middleware is configured in FastAPI to bridge the port boundary.
* [x] An activity table structure is designed in HTML/CSS to prioritize data density.
* [x] Asynchronous JavaScript uses `fetch` to retrieve data without blocking the UI.
* [x] JSON payloads are bound to the DOM dynamically using `document.createElement`.
* [x] You can commit these changes with the message: `feat: add vanilla js frontend with async fetch and activity table dashboard`.