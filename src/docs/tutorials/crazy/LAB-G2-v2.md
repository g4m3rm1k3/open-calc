# Card Engine — LAB G2 — Two Players, One Server

**Prerequisites:** Lab G1 complete. You have `index.html` with working card
rendering, CSS variables, light/dark toggle, and a `renderCard()` function
that builds HTML from a card object.

**What this lab adds:**
- A Python WebSocket server that manages a shuffled deck
- Two browser tabs connect to it simultaneously
- Each player is dealt 5 real cards from the server
- Your hand shows face-up, opponent's hand shows face-down
- The server is the single source of truth — it decides what cards exist

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 01, every time you clicked Analyze, the browser opened a connection,
>    got a response, and the connection closed. Why would that model break for a card game?
> 2. Two players are connected to the same server. Player 1 plays a card.
>    How does Player 2's screen know to update — who tells it?
> 3. Right now `myHand` is hardcoded data in the HTML file. When you switch to
>    server data, which part of the code do you predict will NOT need to change?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Open two browser tabs. Both connect to your Python server. The server deals cards.

```
TAB 1 (You — "Alice")           TAB 2 (Opponent — "Bob")
┌──────────────────────┐        ┌──────────────────────┐
│  CRAZY EIGHTS        │        │  CRAZY EIGHTS        │
│                      │        │                      │
│  BOB — 5 CARDS       │        │  ALICE — 5 CARDS     │
│  ░░░ ░░░ ░░░ ░░░ ░░░ │        │  ░░░ ░░░ ░░░ ░░░ ░░░ │
│                      │        │                      │
│  [draw]  [Q♥]        │        │  [draw]  [Q♥]        │
│                      │        │                      │
│  A♠  7♥  K♦  8♣  J♠ │        │  3♦  J♣  2♥  9♠  5♦ │
│  ALICE — 5 CARDS     │        │  BOB — 5 CARDS       │
└──────────────────────┘        └──────────────────────┘
          │                               │
          └─────── WebSocket connection ──┘
                          │
                   Python Server
              (holds the real game state)
```

Same discard pile on both screens. Different hands. Opponent's cards face-down.

---

## The Big Picture Before Any Code

### Concept: HTTP vs WebSockets — Why Games Need a Persistent Connection

**What it is:** HTTP and WebSockets are two different communication protocols —
sets of rules for how a browser and server exchange data. They solve different problems.

**The problem with HTTP for games:**
HTTP works like a vending machine — you press a button (request), something comes out
(response), and the machine goes back to waiting. The machine cannot reach through
the slot and give you something you didn't ask for. In card game terms:
Player 1 plays a card. The server knows. But Player 2's browser has no open
connection — the server cannot contact it. Player 2's screen stays wrong until
Player 2 happens to ask "anything new?" This delay ruins the game experience.

**The solution — WebSockets:**
WebSockets work like a phone call — both sides stay connected after the initial
handshake, and either side can speak at any moment. The server can push a message
to Player 2's browser the instant Player 1 plays a card. No polling, no delay.

**Canonical example (General Explanation):**
Imagine two people sending letters (HTTP) vs. talking on the phone (WebSocket).
Letters: you write, send, wait for a reply. You cannot receive a letter unless
you first send one. Phone: once connected, either person can speak at any moment
without waiting for the other to "request" a turn. Card games need the phone model.

In code, the difference is visible in the URL prefix:
- HTTP: `http://localhost:8000/analyze`
- WebSocket: `ws://localhost:8000/ws/Alice`

And in the JavaScript:
```javascript
// HTTP — opens, transfers, closes:
const response = await fetch('http://localhost:8000/analyze', { method: 'POST' })

// WebSocket — opens and STAYS open:
const socket = new WebSocket('ws://localhost:8000/ws/Alice')
socket.onmessage = (event) => { /* runs every time server sends something */ }
```

**Project Application (The "Why" here):**
Every time a card is played, the server sends an update to BOTH connected sockets
immediately. Neither player has to refresh or ask. This is only possible because
both connections are still open. The WebSocket connection each player opens when
they join stays open for the entire game.

**Watch for:** WebSocket messages are always strings. To send structured data
(like a hand of cards), you convert a Python dict to a JSON string with
`json.dumps()`, send the string, and the browser converts it back with
`JSON.parse()`. You saw JSON in Lab 01 — here it is used again, but over a
persistent connection instead of a one-time response.

---

### Mental Model: The Server as Single Source of Truth

**What it is:** A design principle where one central location holds the
authoritative version of all game data. All other participants hold display
copies only.

**Why it exists:**
If both browsers kept their own copy of the game state, they would diverge
the moment any action happened. Browser A removes a card from its local hand.
Browser B does not know. Now they disagree on the game state. Who is right?
There is no way to know. Additionally, a player could open DevTools and modify
their local JavaScript to give themselves cards they do not have.

**The solution — the server decides everything:**
```
Browser A                Server               Browser B
   │                       │                       │
   │  "I played 7♥"        │                       │
   │──────────────────────>│                       │
   │                       │  validates the play   │
   │                       │  updates game state   │
   │                       │  sends update to A    │
   │<──────────────────────│                       │
   │                       │  sends update to B    │
   │                       │──────────────────────>│
   │                       │                       │
```

Neither browser decides anything. Both browsers only DISPLAY what the server tells them.

**Where you will see this again:** Every lab from here forward. When Player 1
plays a card in Lab G3, their browser does NOT remove the card from the DOM
immediately — it waits for the server's confirmation. The server removes the
card and sends new state. The browser updates from that. Never from its own guess.

---

## PART 1 — Python Backend Setup

### Step 1 — Create the Backend Folder

Open VS Code terminal (Ctrl+`).
You should be in `card-engine/frontend` from Lab G1.
Go up one level:

```
cd ..
```

**Why `cd ..`:** Moves up to `card-engine/`. You need to create `backend/`
as a sibling of `frontend/`, not inside it.

```
pwd
```

**You should see** a path ending in `card-engine` — not `frontend`.

Now create and enter the backend folder:

```
mkdir backend
```

**Why a separate `backend` folder:** The Python server and the HTML frontend
are two completely separate programs. They run in different environments,
use different tools, and have different dependencies. Separating them prevents
confusion about which files belong to which program.

```
cd backend
```

---

### Step 2 — Create and Activate the Virtual Environment

```
python -m venv venv
```

**Why this command:** `-m venv` runs Python's built-in virtual environment
creator. The second `venv` is the folder name for the environment. This creates
an isolated Python installation just for this project — packages installed here
do not affect your system Python or the `gcode-analyzer` project from Lab 01.

Activate the environment:

```
venv\Scripts\activate
```

**Why activation is required:** Creating the virtual environment just builds the
folder structure. Activating it tells your terminal "use THIS Python and pip,
not the system ones." Without activation, `pip install` would install packages
globally and potentially conflict with other projects.

### SAVE AND TRY

Look at your terminal prompt.

**You should see:** `(venv)` at the very beginning of the line, like:
```
(venv) C:\...\card-engine\backend>
```

**If you do NOT see `(venv)`:** The environment is not active. Run the
activation command again. Every time you open a new terminal to work on
this project, you must activate again.

---

### Step 3 — Install the Required Packages

```
pip install fastapi uvicorn websockets
```

**Why `fastapi`:** The web framework that handles HTTP routing AND WebSocket
connections. It turns your Python functions into server endpoints that respond
to browser requests. Without it, you would have to write the HTTP parsing,
header handling, and routing yourself — hundreds of lines of low-level code.

**Why `uvicorn`:** FastAPI is a Python library, not a running server.
Uvicorn is the actual server process — it binds to a network port, listens
for incoming connections, and feeds them into FastAPI. You need both:
FastAPI defines the routes, uvicorn runs the listener.

**Why `websockets`:** The underlying library that FastAPI uses to handle
the WebSocket protocol — the persistent connection upgrade from HTTP.
You will not import it directly, but FastAPI requires it to be installed.

### SAVE AND TRY

```
pip list
```

**You should see** a list that includes `fastapi`, `uvicorn`, and `websockets`.
The exact version numbers will differ — that is fine.

---

### Step 4 — Create main.py

In VS Code, create a new file: **File → New File**.
Save it as `main.py` inside `card-engine/backend/`.

Type this first line only — nothing else yet:

```python
import json
```

**Why `import json`:** Python's built-in JSON module converts between
Python dictionaries and JSON strings. You need it because WebSocket messages
are strings — to send a dict like `{'rank': 'A', 'suit': '♠'}`, you first
convert it to the string `'{"rank": "A", "suit": "\\u2660"}'` with `json.dumps()`,
send that string, and the browser converts it back with `JSON.parse()`.

### SAVE AND TRY

In the terminal, type:

```
python
```

At the `>>>` prompt, type:

```python
import json
print(json.dumps({'rank': 'A', 'suit': '♠', 'color': 'black'}))
```

**Expected:**
```
{"rank": "A", "suit": "\u2660", "color": "black"}
```

**Why the suit becomes `\u2660`:** JSON represents non-ASCII characters
using their Unicode code point with a backslash-u prefix. The browser
reads `\u2660` and renders it as ♠ — the same character, just encoded
differently for safe text transmission.

Type `exit()` to leave Python.

---

### Step 5 — Add the random Import

In `main.py`, after the existing line, add:

```python
import json
import random    # ← add this line
```

**Why `random`:** You need `random.shuffle()` to randomize the deck order.
Without it, every game would deal the same cards in the same order (A♠, 2♠, 3♠...)
because the deck is created in a predictable sequence.

### SAVE AND TRY

```
python
```

```python
import random
deck = list(range(52))
random.shuffle(deck)
print(deck[:5])
```

**Expected:** Five numbers from 0–51 in a random order. Run it again —
different order each time, confirming `shuffle` works.

Type `exit()`.

---

### Step 6 — Add the FastAPI Imports

In `main.py`, after the existing imports, add:

```python
import json
import random
from fastapi import FastAPI, WebSocket              # ← add this line
from fastapi.websockets import WebSocketDisconnect  # ← add this line
from fastapi.middleware.cors import CORSMiddleware  # ← add this line
```

**Why `FastAPI`:** The main application class. You create one instance (`app = FastAPI()`)
and all routes and WebSocket handlers attach to it.

**Why `WebSocket`:** The type annotation FastAPI uses for WebSocket connection objects.
It gives you methods like `.accept()`, `.send_text()`, and `.receive_text()`.

**Why `WebSocketDisconnect`:** An exception that FastAPI raises when a client
closes their connection (closes the browser tab, loses internet, etc.).
Catching it lets you clean up gracefully instead of your server crashing
with an unhandled error.

**Why `CORSMiddleware`:** The same CORS issue from Lab 01. Your HTML file
opens from the filesystem (or a different port), and the browser blocks its
JavaScript from connecting to a different origin. The middleware tells the
server to send headers that give the browser permission.

---

### Step 7 — Create the App Instance

In `main.py`, after the imports, add:

```python
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()    # ← add this line
```

**Why `app = FastAPI()`:** This creates the application object.
Think of it as the hub — every route, every WebSocket handler, and every
middleware rule attaches to `app`. When uvicorn starts, it looks for this
object by name: `uvicorn main:app` means "find `app` in `main.py`."

### SAVE AND TRY

In the terminal:

```
python
```

```python
from main import app
print(type(app))
```

**Expected:**
```
<class 'fastapi.applications.FastAPI'>
```

The app object exists and is the right type. Type `exit()`.

---

### Step 8 — Add CORS Middleware

In `main.py`, after `app = FastAPI()`, add:

```python
app = FastAPI()

app.add_middleware(           # ← add from here
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)                             # ← add to here
```

**Why `allow_origins=["*"]`:** The `*` wildcard means "accept WebSocket
connections from any origin" — any URL, any port. In production you would
list specific allowed origins for security. For local development, `*` means
you do not have to update this setting every time you test from a different
port or file location.

**Why add it now before any routes exist:** Middleware wraps every request
and response — including WebSocket handshakes. If you add it after routes,
the routes are registered first and the middleware might not wrap them
correctly in all FastAPI versions. Adding middleware immediately after
creating `app` is the standard, safe order.

### SAVE AND TRY

```
uvicorn main:app --reload
```

**Why `--reload`:** Tells uvicorn to watch the files in the current directory.
When you save `main.py`, uvicorn automatically restarts — you do not have to
stop and restart it manually after each change.

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Open your browser and go to `http://localhost:8000/docs`.

**You should see:** The FastAPI interactive docs page. No routes are listed
yet — that is correct. The page loading confirms the server starts without errors.

Press **Ctrl+C** in the terminal to stop the server.

---

## PART 2 — The Deck

### Concept: Nested Loops — Building a Grid of Combinations

**What it is:** A loop inside another loop. The outer loop runs once per suit.
The inner loop runs once per rank. Together they visit every combination.

**The problem:**
A deck has 52 cards: every rank paired with every suit.
Writing them out individually would take 52 lines and be impossible to maintain.

**The solution:**
```python
for suit in suits:       # runs 4 times (one per suit)
    for rank in ranks:   # runs 13 times per suit
        deck.append(...)  # runs 4 × 13 = 52 times total
```

**Canonical example (General Explanation):**
A restaurant menu has 3 protein choices and 4 sauce choices.
To list every combination (protein + sauce), you go through each protein,
and for each protein, go through each sauce. 3 × 4 = 12 combinations.
A deck of cards is the same: 4 suits × 13 ranks = 52 cards.

```python
proteins = ['chicken', 'beef', 'fish']
sauces   = ['hot', 'mild', 'sweet', 'plain']

for protein in proteins:
    for sauce in sauces:
        print(f'{protein} with {sauce} sauce')
# prints all 12 combinations
```

**Project Application (The "Why" here):**
`SUITS` has 4 items. `RANKS` has 13 items. The nested loop creates one card dict
for every combination, resulting in exactly 52 card dicts. This is the standard
way to generate a full deck programmatically — far safer than listing 52 cards
by hand, where it is easy to miss one or duplicate another.

**Watch for:** The inner loop runs completely before the outer loop advances.
For the first suit (♠), all 13 ranks are created. Then the outer loop moves
to the next suit (♥), and all 13 ranks are created again. The result is all
13 spades, then all 13 hearts, then all 13 diamonds, then all 13 clubs —
before shuffling.

---

### Step 9 — Define the Suit and Rank Constants

In `main.py`, after the `app.add_middleware(...)` block, add:

```python
)

SUITS = ['♠', '♥', '♦', '♣']    # ← add this line
```

**Why store suits as the Unicode characters directly:** The frontend displays
these exact characters in the HTML. Storing them as-is means no translation
step is needed — the server sends `'♠'` and the browser displays ♠.
Storing them as names (`'spade'`) would require a lookup table on the frontend
to convert back to the symbol.

Now add the ranks constant on the next line:

```python
SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']    # ← add this line
```

**Why `'10'` is a string not a number:** All ranks are stored as strings
because they display as text on the card. Using a number for `10` but strings
for everything else would require special-casing `10` every time you compare
or display ranks. Consistent types make the code simpler.

Now add the red suits set on the next line:

```python
RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
RED_SUITS = {'♥', '♦'}    # ← add this line
```

**Why a set `{}` instead of a list `[]` for `RED_SUITS`:** Sets are optimized
for the question "is this item in this collection?" — which is exactly how
you use `RED_SUITS`: `if suit in RED_SUITS`. Checking membership in a set is
instantaneous regardless of size. Checking membership in a list scans from
the beginning — slow for large lists (not a concern with 2 items, but the
habit of choosing the right data structure is worth building early).

### SAVE AND TRY

```
python
```

```python
from main import SUITS, RANKS, RED_SUITS
print(len(SUITS))
print(len(RANKS))
print('♥' in RED_SUITS)
print('♠' in RED_SUITS)
```

**Expected:**
```
4
13
True
False
```

Type `exit()`.

---

### Step 10 — Write the make_deck Function

In `main.py`, after the `RED_SUITS` line, add the function signature:

```python
RED_SUITS = {'♥', '♦'}

def make_deck():    # ← add this line
```

**Why a function instead of creating the deck directly at module level:**
You need a fresh shuffled deck at the start of every game (including rematches).
A function can be called multiple times — each call produces a new shuffled deck.
A module-level variable is created once when the file loads and stays the same.

Now add the function body. After `def make_deck():`, add:

```python
def make_deck():
    deck = []    # ← add this line
```

**Why start with an empty list:** You will build the deck by appending one
card at a time inside the loop. Starting empty and appending is the standard
Python pattern for building a collection whose final size you know in advance.

Now add the nested loop:

```python
def make_deck():
    deck = []

    for suit in SUITS:        # ← add from here
        for rank in RANKS:
            card = {
                'rank':  rank,
                'suit':  suit,
                'color': 'red' if suit in RED_SUITS else 'black'
            }
            deck.append(card)
    # ← add to here
```

**Why `'red' if suit in RED_SUITS else 'black'`:** This is a Python ternary
expression — the same pattern as JavaScript's `condition ? a : b`, just with
different syntax. It reads: "use `'red'` if the suit is in the red suits set,
otherwise use `'black'`." The color is computed here so the frontend never
has to calculate it — the card object arrives with `color` already set.

Now add the shuffle and return:

```python
def make_deck():
    deck = []

    for suit in SUITS:
        for rank in RANKS:
            card = {
                'rank':  rank,
                'suit':  suit,
                'color': 'red' if suit in RED_SUITS else 'black'
            }
            deck.append(card)

    random.shuffle(deck)    # ← add this line
    return deck             # ← add this line
```

**Why `random.shuffle(deck)` modifies `deck` directly:** Unlike most functions
that return a new value, `shuffle` rearranges the list IN PLACE — it modifies
the list you gave it, rather than returning a new shuffled list. This is why
you call it on its own line and then `return deck`, rather than
`return random.shuffle(deck)` (which would return `None`, because shuffle
returns nothing).

### SAVE AND TRY

```
python
```

```python
from main import make_deck

deck = make_deck()
print(len(deck))
print(deck[0])
print(deck[1])
```

**Expected:**
```
52
{'rank': '...', 'suit': '...', 'color': '...'}   ← random card
{'rank': '...', 'suit': '...', 'color': '...'}   ← different random card
```

Run the test again. The cards are in a different order — confirming the shuffle.

```python
reds = [c for c in deck if c['color'] == 'red']
print(len(reds))
```

**Expected:** `26` — exactly half the deck is red (2 red suits × 13 ranks).

Type `exit()`.

**Change something:** In `make_deck()`, comment out `random.shuffle(deck)` by
putting a `#` before it. Run the test again. The first card is always A♠
(the first rank of the first suit). Uncomment `random.shuffle(deck)`. Random again.

---

## PART 3 — The Game State

### Step 11 — Define the game Dictionary

In `main.py`, after the `make_deck` function, add:

```python
    return deck

game = {                    # ← add from here
    'deck':       [],
    'hands':      {},
    'discard':    [],
    'players':    {},
    'whose_turn': None,
    'started':    False,
}                           # ← add to here
```

**Why a single dictionary instead of separate variables:** All game data
lives in one place. When you need to reset the game, you reset this one dict.
When you need to pass game state to a function, you pass this one dict.
When you add MongoDB in a later lab, you store and retrieve this one dict.
A single container is easier to manage than six independent variables.

**Why `'deck': []` starts empty:** `make_deck()` creates the deck.
`deal_game()` (written next) calls `make_deck()` and puts the result here.
Initializing to `[]` makes the structure clear — this field exists and will
hold a list — without prematurely building a deck that might not be used yet.

**Why `'hands': {}`:** Hands are keyed by player ID (their name).
`game['hands']['Alice']` will be Alice's list of cards.
A dict of lists is the natural structure: one list per player, indexed by name.

**Why `'players': {}`:** This will hold `{'Alice': <WebSocket>, 'Bob': <WebSocket>}`.
Storing WebSocket objects here lets any function send messages to any player
by looking up their connection: `game['players']['Alice'].send_text(...)`.

**Why `'started': False`:** Prevents dealing cards to a third browser that
connects after the game has started, and allows clean rematch detection later.

### SAVE AND TRY

```
python
```

```python
from main import game
print(game)
print(type(game['hands']))
print(game['started'])
```

**Expected:**
```
{'deck': [], 'hands': {}, 'discard': [], 'players': {}, 'whose_turn': None, 'started': False}
<class 'dict'>
False
```

Type `exit()`.

---

### Step 12 — Write deal_game()

In `main.py`, after the `game` dict, add the function:

```python
game = { ... }

def deal_game():    # ← add this line
```

Add the body — first the deck and flags:

```python
def deal_game():
    game['deck']    = make_deck()    # ← add this line
    game['discard'] = []             # ← add this line
    game['started'] = True           # ← add this line
    game['rule_state'] = {}          # ← add this line
```

**Why `game['deck'] = make_deck()`:** Calls the function you wrote in Step 10.
Each call returns a newly shuffled 52-card list. Assigning it to `game['deck']`
replaces any previous deck — important for rematches where the old deck needs
to be discarded.

**Why reset `game['discard']` to `[]`:** The discard pile from the previous
game must be cleared. If you only reset the deck, old discard cards would
still be visible on screen from the last game.

**Why `game['rule_state'] = {}`:** Reserved space for Crazy Eights-specific
rule data (active suit after playing an 8). Resetting it clears any leftover
state from the previous round without needing to know what keys it contains.

Now add the dealing loop:

```python
def deal_game():
    game['deck']       = make_deck()
    game['discard']    = []
    game['started']    = True
    game['rule_state'] = {}

    player_ids = list(game['players'].keys())    # ← add from here
    # .keys() returns a view of the player names ('Alice', 'Bob')
    # list() converts it to a plain list so we can index with [0], [1]

    for player_id in player_ids:
        hand = []
        for _ in range(5):
            hand.append(game['deck'].pop())
            # .pop() removes and returns the LAST item from game['deck']
            # The last item is the "top" of the shuffled deck
            # _ is used as the loop variable when we don't need its value
        game['hands'][player_id] = hand
    # ← add to here
```

**Why `range(5)` not `range(0, 5)`:** `range(5)` and `range(0, 5)` are identical.
`range(n)` always starts at 0 when you give it a single argument.
Using `range(5)` is shorter and conventional for "do this 5 times."

Now add the discard pile setup and turn assignment:

```python
    for player_id in player_ids:
        hand = []
        for _ in range(5):
            hand.append(game['deck'].pop())
        game['hands'][player_id] = hand

    top_card = game['deck'].pop()          # ← add this line
    game['discard'].append(top_card)       # ← add this line
    # Draw one more card to start the discard pile face-up
    # This is the card the first player must match in suit or rank

    game['whose_turn'] = player_ids[0]    # ← add this line
    # The first player to connect goes first
    # player_ids[0] is the first name in the dict — whichever connected first
```

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game

game['players']['Alice'] = None
game['players']['Bob']   = None
# Simulate players connected (None instead of real WebSocket objects)

deal_game()

print('Deck remaining:', len(game['deck']))
print('Alice hand:',     len(game['hands']['Alice']))
print('Bob hand:',       len(game['hands']['Bob']))
print('Discard top:',    game['discard'][-1])
print('Whose turn:',     game['whose_turn'])
```

**Expected:**
```
Deck remaining: 41
Alice hand: 5
Bob hand: 5
Discard top: {'rank': '...', 'suit': '...', 'color': '...'}
Whose turn: Alice
```

**Why 41:** 52 total − 5 for Alice − 5 for Bob − 1 for discard = 41.

Type `exit()`.

---

## PART 4 — The WebSocket Route

### Concept: async def and await — How Servers Handle Many Players at Once

**What it is:** `async def` marks a function as asynchronous — capable of
pausing to wait for slow operations (network reads, file I/O) while letting
other code run. `await` is the pause point.

**The problem without it:**
Imagine a server that handles Player 1's message synchronously — it reads
the message, processes it, and only then is ready for the next one.
While it is processing Player 1's message, Player 2's message sits in a
queue waiting. If processing takes 2 seconds, Player 2 waits 2 seconds.
A busy server with many players grinds to a halt.

**The solution:**
When the server hits `await websocket.receive_text()`, it pauses THAT function
and returns control to the event loop. The event loop can handle other players'
messages during that pause. When the data arrives, the event loop resumes
the paused function right where it left off.

**Canonical example (General Explanation):**
A restaurant with one waiter (sync): the waiter takes Table 1's order,
stands at the kitchen window waiting for the food, delivers it, then walks to Table 2.
Table 2 waited the entire cooking time.

The same restaurant with async: the waiter takes Table 1's order, goes to the
kitchen, then immediately walks to Table 2 while Table 1's food cooks.
When Table 1's food is ready, the waiter delivers it. Both tables get served
without unnecessary waiting.

```python
# Synchronous — blocks until data arrives:
def handle(websocket):
    data = websocket.receive_text()  # nothing else can happen during this wait

# Asynchronous — pauses, lets other handlers run:
async def handle(websocket):
    data = await websocket.receive_text()  # event loop handles other connections here
```

**Project Application (The "Why" here):**
Your server handles two players simultaneously. When waiting for Alice's next
message (`await websocket.receive_text()`), Bob's messages can still be received
and processed. Without `async/await`, Alice's idle time would block Bob's game.

**Watch for:** You can only use `await` inside an `async def` function.
Using `await` in a regular `def` causes a syntax error.
Every function that calls an `async` function must itself be `async`.

---

### Concept: WebSocket Route in FastAPI

**What it is:** A special route that handles WebSocket connections rather than
HTTP requests. The function runs for the ENTIRE lifetime of the connection —
not just for one request-response cycle.

**The key difference from HTTP routes:**
```python
# HTTP route — runs once, returns, done:
@app.get("/analyze")
async def analyze():
    return {"result": "ok"}    # function ends here

# WebSocket route — runs until the client disconnects:
@app.websocket("/ws/{name}")
async def ws_handler(websocket: WebSocket, name: str):
    await websocket.accept()
    while True:                # loops forever while connected
        msg = await websocket.receive_text()
        # processes msg...
        # loops back to wait for the next message
```

**Canonical example (General Explanation):**
An HTTP route is like a hotel front desk that checks you in and hands you
a key — one interaction, then the desk attendant is free. A WebSocket route
is like a hotel concierge who walks with you for your entire stay — present
and available at every moment until you check out.

**Project Application (The "Why" here):**
`@app.websocket("/ws/{player_name}")` matches a URL like `ws://localhost:8000/ws/Alice`.
The `{player_name}` part is a path parameter — FastAPI extracts it from the URL
and passes it to the function as the `player_name` argument. This is how the
server knows which player just connected without the player needing to send
a separate "who am I" message.

**Watch for:** `await websocket.accept()` must be called before any other
WebSocket operation. It completes the protocol handshake — without it,
the connection is not officially open and `send_text()` / `receive_text()` will fail.

---

### Step 13 — Write the Helper Functions

In `main.py`, after `deal_game()`, add the send helper:

```python
    game['whose_turn'] = player_ids[0]


async def send_to(player_id: str, message: dict):    # ← add from here
    websocket = game['players'].get(player_id)
    # .get() returns None if player_id is not in the dict
    # safer than game['players'][player_id] which raises KeyError if missing

    if websocket:
        await websocket.send_text(json.dumps(message))
        # json.dumps() converts the Python dict to a JSON string
        # send_text() transmits that string over the WebSocket connection
                                                     # ← add to here
```

**Why a separate `send_to` helper instead of calling `websocket.send_text` directly:**
You will call this from multiple places — after a legal play, after a draw,
after a suit choice. Every caller would need to look up the WebSocket object
and call `json.dumps`. Extracting that into one function means one place to
fix if the implementation changes, and cleaner call sites everywhere else.

Now add the message builder:

```python
async def send_to(player_id: str, message: dict):
    ...


def build_dealt_message(player_id: str) -> dict:    # ← add from here
    player_ids   = list(game['players'].keys())
    opponent_id  = [p for p in player_ids if p != player_id][0]
    # List comprehension: build a list of all player IDs that are NOT this player
    # [0] gets the first (only) result — the opponent's ID

    return {
        'type':           'dealt',
        'your_hand':      game['hands'][player_id],
        'opponent_name':  opponent_id,
        'opponent_count': len(game['hands'][opponent_id]),
        # Note: opponent_count, not opponent cards — the browser never sees opponent's cards
        'top_card':       game['discard'][-1],
        # [-1] gets the last item of the list — the top of the discard pile
        'whose_turn':     game['whose_turn'],
        'deck_count':     len(game['deck']),
        'scores':         dict(game.get('scores', {})),
    }
                                                    # ← add to here
```

**Why each player gets a DIFFERENT dealt message:** `your_hand` contains
THIS player's actual cards. The opponent never receives another player's cards —
only the count. Two separate calls to `build_dealt_message()` produce two
different dicts from the same game state: Alice gets Alice's hand,
Bob gets Bob's hand. The single source of truth sends each player only
what they are allowed to see.

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game, build_dealt_message

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

msg_alice = build_dealt_message('Alice')
msg_bob   = build_dealt_message('Bob')

print('Alice hand size:',    len(msg_alice['your_hand']))
print('Bob hand size:',      len(msg_bob['your_hand']))
print('Alice sees opponent:', msg_alice['opponent_name'])
print('Bob sees opponent:',   msg_bob['opponent_name'])
print('Same top card?',      msg_alice['top_card'] == msg_bob['top_card'])
```

**Expected:**
```
Alice hand size: 5
Bob hand size: 5
Alice sees opponent: Bob
Bob sees opponent: Alice
Same top card? True
```

Both messages reference the same top card. Both messages show the correct
opponent name. The hands are different objects with different cards.

Type `exit()`.

---

### Step 14 — Write the WebSocket Handler

In `main.py`, after `build_dealt_message()`, add the route decorator and function signature:

```python
def build_dealt_message(player_id: str) -> dict:
    ...


@app.websocket("/ws/{player_name}")                                  # ← add this line
async def websocket_endpoint(websocket: WebSocket, player_name: str):    # ← add this line
```

**Why `/ws/{player_name}` in the URL path:** The `{player_name}` is a path
parameter — a variable part of the URL. `ws://localhost:8000/ws/Alice` sets
`player_name = 'Alice'`. `ws://localhost:8000/ws/Bob` sets `player_name = 'Bob'`.
This is how the server knows who is connecting without requiring a separate
introductory message.

Add the connection setup inside the function:

```python
@app.websocket("/ws/{player_name}")
async def websocket_endpoint(websocket: WebSocket, player_name: str):

    await websocket.accept()    # ← add this line
    # Completes the WebSocket protocol handshake
    # Until accept() is called, the connection exists but cannot send/receive

    game['players'][player_name] = websocket    # ← add this line
    # Register this player: their name → their WebSocket connection
    # Other parts of the code can now send them messages via send_to(player_name, ...)

    print(f"{player_name} connected. Players: {list(game['players'].keys())}")    # ← add this line
    # Terminal logging helps you see connection events while testing
```

Now add the two-player detection logic:

```python
    print(f"{player_name} connected. Players: {list(game['players'].keys())}")

    if len(game['players']) < 2:                    # ← add from here
        await websocket.send_text(json.dumps({
            'type':    'waiting',
            'message': 'Waiting for opponent to connect...'
        }))
        # First player gets a waiting message
        # json.dumps() converts the dict to a JSON string for transmission

    elif len(game['players']) == 2 and not game['started']:
        deal_game()
        # Both players now connected and game not yet started — deal cards

        for pid in game['players']:
            await send_to(pid, build_dealt_message(pid))
            # Send EACH player their own personalized dealt message
            # pid loops through both player IDs — Alice then Bob

        print(f"Game started! {len(game['deck'])} cards remain in deck.")
                                                    # ← add to here
```

**Why `not game['started']` in the condition:** Without this check, if a third
person connects after the game starts, the `elif` would trigger again — dealing
new cards and resetting the game mid-play. `game['started']` becomes `True`
inside `deal_game()`, so this condition only fires once: for the second player
who joins before the game has started.

Now add the message loop and disconnect handler:

```python
        print(f"Game started! {len(game['deck'])} cards remain in deck.")

    try:                                             # ← add from here
        while True:
            raw  = await websocket.receive_text()
            # Pauses here until the client sends a message
            # While paused, other connections (the other player) can still be handled

            data = json.loads(raw)
            # json.loads() converts the received JSON string back to a Python dict

            print(f"Message from {player_name}: {data}")
            # Log every message for now — game action handling comes in Lab G3

    except WebSocketDisconnect:
        print(f"{player_name} disconnected")
        del game['players'][player_name]
        # Remove from the players dict — the WebSocket object is gone

        for pid in game['players']:
            await send_to(pid, {
                'type':    'opponent_left',
                'message': f'{player_name} disconnected'
            })
        # Notify whoever is still connected

        game['started']    = False
        game['hands']      = {}
        game['deck']       = []
        game['discard']    = []
        game['whose_turn'] = None
        # Reset for a fresh game — scores intentionally not reset here
                                                     # ← add to here
```

**Why `try/except WebSocketDisconnect` wraps the while loop:** When a player
closes their browser tab, FastAPI raises `WebSocketDisconnect` inside
`receive_text()`. Without catching it, the exception propagates and the server
logs an ugly traceback. Catching it lets you run cleanup code (removing the
player, notifying the opponent) before the function exits cleanly.

### SAVE AND TRY

Start the server:

```
uvicorn main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Open your browser. Open DevTools (F12). Go to the Console tab. Type:

```javascript
const s = new WebSocket('ws://localhost:8000/ws/TestPlayer')
s.onmessage = e => console.log(JSON.parse(e.data))
```

**In the browser console you should see:**
```javascript
{type: 'waiting', message: 'Waiting for opponent to connect...'}
```

**In the terminal you should see:**
```
TestPlayer connected. Players: ['TestPlayer']
```

Type in the browser console:
```javascript
s.close()
```

**In the terminal:**
```
TestPlayer disconnected
```

The WebSocket connects, receives a waiting message, and disconnects cleanly.
The full server logic is working. Press Ctrl+C to stop the server.

---

## PART 5 — Update the Frontend

The backend is complete. Now update `index.html` to connect to the server
and replace the hardcoded `myHand` with real server data.

### Step 15 — Add the Join Screen HTML

Open `frontend/index.html`. Find the `<body>` tag. The current body contains
the mode button and the `#player-hand` div.

Before the existing content, add a join screen. Find this in your body:

```html
<body>

    <button id="modeBtn">☀ LIGHT</button>
```

Add the join screen BEFORE the mode button:

```html
<body>

    <div id="join-screen">                         <!-- ← add from here -->
        <h2 id="join-title">CRAZY EIGHTS</h2>
        <p id="join-subtitle">Enter your name to join:</p>
        <input type="text" id="nameInput" placeholder="Your name" maxlength="12">
        <button id="joinBtn">JOIN GAME</button>
        <div id="join-status"></div>
    </div>                                         <!-- ← add to here -->

    <button id="modeBtn">☀ LIGHT</button>
```

**Why a name input:** The WebSocket URL includes the player's name
(`ws://localhost:8000/ws/Alice`). The name must come from the player before
the connection can be opened. This screen collects it.

**Why `maxlength="12"`:** Keeps names short enough to fit in the UI.
The server does not enforce this — it is a browser-level hint that prevents
very long names in the input field.

### CSS AND SEE

Save. Refresh the browser.

**You should see:**
- A heading "CRAZY EIGHTS" in the browser's default style
- A paragraph "Enter your name to join:"
- A text input field
- A "JOIN GAME" button
- Then the "☀ LIGHT" mode button
- Then the cards

No styling yet. Just the structure. This is correct.

---

### Step 16 — Hide the Game Table Until the Game Starts

The mode button and card hand should be hidden until the game starts.
Find the mode button in the HTML and wrap it and the hand in a container:

```html
    <div id="join-screen">
        ...
    </div>

    <div id="game-table" style="display:none">    <!-- ← add this opening tag -->

        <button id="modeBtn">☀ LIGHT</button>

        <div id="player-hand"></div>

    </div>                                        <!-- ← add this closing tag -->
```

**Why `style="display:none"` directly on the element:** CSS class toggles
(`.classList.add()`) would also work, but `style="display:none"` in the HTML
guarantees the element is hidden the instant the page loads — before any
JavaScript runs. If the JavaScript that adds a hiding class fails or loads
slowly, the game table might flash briefly. Inline style is immediate.

### CSS AND SEE

Save. Refresh.

**You should see:**
- Only the join screen content (title, input, buttons)
- The mode button and cards are gone — hidden by `display:none`

---

### Step 17 — Style the Join Screen

In the `<style>` block, after the `#modeBtn` rule, add:

```css
        #modeBtn {
            /* ... existing styles ... */
        }

        #join-screen {                             /* ← add from here */
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
            padding-top: 80px;
            font-family: 'Courier New', monospace;
        }
```

**Why `flex-direction: column`:** Stacks the join screen children (title,
subtitle, input, button) vertically instead of the default horizontal row.
`display: flex` alone would place them side by side.

**Why `gap: 14px`:** Adds 14px of space between each child element.
Without it, the items would be flush against each other with no breathing room.
`gap` on a flex container applies between items — it does not add space
outside the container or around individual items.

### CSS AND SEE

Save. Refresh.

**You should see:** The join screen items are now stacked vertically with
spacing between them. Still unstyled (default browser colors).

Now add the title style. After the `#join-screen` closing `}`, add:

```css
        #join-screen {
            ...
        }

        #join-title {                              /* ← add from here */
            font-size: 20px;
            color: var(--color-accent);
            letter-spacing: 0.3em;
            margin: 0;
        }                                          /* ← add to here */
```

**Why `margin: 0`:** `<h2>` elements have browser-default top and bottom margins.
Inside the flexbox column, those default margins add extra space above and below
the title that disrupts the even `gap` spacing. Resetting to 0 lets `gap` control
all spacing consistently.

### CSS AND SEE

Save. Refresh.

**You should see:** "CRAZY EIGHTS" in green (the accent color) with wide letter spacing.

Now add the input style:

```css
        #join-title {
            ...
        }

        #nameInput {                               /* ← add from here */
            background:  var(--bg-card);
            border:      1px solid var(--color-accent);
            color:       var(--color-text);
            padding:     10px 16px;
            font-family: 'Courier New', monospace;
            font-size:   14px;
            border-radius: 4px;
            text-align:  center;
            outline:     none;
            width:       200px;
        }                                          /* ← add to here */
```

**Why `outline: none`:** Browsers add a blue glow outline to focused input
fields by default. This default outline ignores your color scheme and looks
wrong against the dark background. Removing it means the border (styled with
`var(--color-accent)`) is the only visible focus indicator.

### CSS AND SEE

Save. Refresh.

**You should see:** A dark input field with a green border and centered placeholder text.

Now add the join button style:

```css
        #nameInput {
            ...
        }

        #joinBtn {                                 /* ← add from here */
            padding:     10px 28px;
            background:  var(--color-accent);
            color:       #000000;
            border:      none;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size:   12px;
            letter-spacing: 0.15em;
            cursor:      pointer;
            font-weight: bold;
        }                                          /* ← add to here */
```

**Why `color: #000000` (black text) on the join button:** The accent color
(`--color-accent`) is bright green in dark mode — light enough that black text
is readable on it. White text on bright green would have poor contrast.
Black text on green is the standard for high-contrast readable buttons.

### CSS AND SEE

Save. Refresh.

**You should see:**
- "CRAZY EIGHTS" in green with wide spacing
- Subtitle text in default color (you can style this later)
- Dark input field with green border
- Green "JOIN GAME" button with black text
- Clean, styled join screen

---

### Step 18 — Add Element References to the Script

In the `<script>` block, BEFORE the `myHand` array, add the element references:

```javascript
    <script>

        const joinScreen   = document.getElementById('join-screen')    // ← add from here
        const gameTable    = document.getElementById('game-table')
        const nameInput    = document.getElementById('nameInput')
        const joinBtn      = document.getElementById('join-screen').querySelector('#joinBtn')
        const joinStatus   = document.getElementById('join-status')
        const modeBtn      = document.getElementById('modeBtn')
        const handEl       = document.getElementById('player-hand')
        const SERVER_WS    = 'ws://localhost:8000/ws'
        // The WebSocket base URL — player name appended when connecting

        let socket = null
        // Will hold the WebSocket object once the player joins
        // null means "not connected yet"

        let myName = ''
        // Stores this player's name after joining
        // Used to label the hand and identify which messages are for this player
                                                                        // ← add to here

        const myHand = [    // ← this line already exists
```

**Why `let` for `socket` and `myName` instead of `const`:** `const` prevents
reassignment — the variable always points to the same value. `socket` and
`myName` start as `null` and `''` and will be reassigned when the player joins.
`let` allows reassignment. `const` would cause an error when you try to
assign the WebSocket object to `socket` later.

### SAVE AND TRY

Save. Refresh. Open DevTools Console. Type:

```javascript
console.log(socket)
console.log(myName)
console.log(SERVER_WS)
```

**Expected:**
```
null
''
ws://localhost:8000/ws
```

The references exist and have their initial values.

---

### Step 19 — Wire the Join Button

In the script, after the element references and before `const myHand`, add:

```javascript
        let myName = ''

        joinBtn.addEventListener('click', () => {    // ← add from here
            const name = nameInput.value.trim()
            // .value reads the current text in the input field
            // .trim() removes leading and trailing whitespace
            // "  Alice  " becomes "Alice" — prevents names that are just spaces

            if (!name) {
                joinStatus.textContent = 'Please enter a name'
                return
                // return exits the function immediately — nothing below runs
                // !name is true when name is an empty string (falsy in JavaScript)
            }

            myName = name
            joinStatus.textContent = 'Connecting...'
            joinBtn.disabled = true
            // Prevent double-clicking while the connection is being established

            connectToServer(name)
        })

        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                joinBtn.click()
                // Pressing Enter in the name field triggers the join button
                // .click() fires the button's click event programmatically
            }
        })
                                                     // ← add to here

        const myHand = [    // ← this line already exists
```

### SAVE AND TRY

Save. Refresh. Open DevTools Console.

Type your name in the input field. Click JOIN GAME.

**You should see:** "Connecting..." appears below the button.
The button grays out. Then a connection error appears — because
`connectToServer()` does not exist yet. That is expected.

**In the console:** `Uncaught ReferenceError: connectToServer is not defined`

This confirms the button click handler runs correctly up to the point of
calling the missing function. Everything before that call works.

---

### Step 20 — Write connectToServer()

After the `nameInput` keydown listener, add:

```javascript
        nameInput.addEventListener('keydown', (event) => { ... })

        function connectToServer(name) {             // ← add from here
            socket = new WebSocket(`${SERVER_WS}/${name}`)
            // Creates the WebSocket connection immediately
            // URL becomes: ws://localhost:8000/ws/Alice
            // The server's @app.websocket("/ws/{player_name}") route handles it

            socket.onopen = () => {
                console.log('WebSocket connected')
                // The connection is open — the server will now send 'waiting' or 'dealt'
                // We do not need to send anything here — the server reacts to the connection
            }

            socket.onmessage = (event) => {
                const message = JSON.parse(event.data)
                // event.data is the raw JSON string the server sent
                // JSON.parse() converts it back to a JavaScript object
                handleMessage(message)
                // Dispatch to the appropriate handler based on message.type
            }

            socket.onclose = () => {
                console.log('WebSocket closed')
                joinStatus.textContent = 'Disconnected from server'
            }

            socket.onerror = () => {
                joinStatus.textContent = 'Could not connect — is the server running?'
                joinBtn.disabled = false
                // Re-enable so the player can try again
            }
        }
                                                     // ← add to here
```

**Why four separate event handlers instead of one:** Each handler fires at a
different moment in the connection lifecycle: `onopen` when connected,
`onmessage` when a message arrives, `onclose` when disconnected, `onerror`
when something fails. Separating them makes it clear which code runs in which
situation. Combining them into one function with conditionals would be harder to read.

---

### Step 21 — Write handleMessage()

After `connectToServer()`, add:

```javascript
        function connectToServer(name) { ... }

        function handleMessage(message) {            // ← add from here
            switch (message.type) {
            // switch checks message.type against each 'case' and runs the matching block
            // It is equivalent to a chain of if/else if, but cleaner for this pattern

                case 'waiting':
                    joinStatus.textContent = message.message
                    // Show "Waiting for opponent..." on the join screen
                    // The join screen stays visible — game has not started
                    break

                case 'dealt':
                    showGameTable(message)
                    break

                case 'opponent_left':
                    if (gameTable.style.display !== 'none') {
                        // Only show this message if the game table is visible
                        // (ignore if still on join screen)
                        alert(`${message.message}`)
                    }
                    break

                default:
                    console.log('Unknown message type:', message.type)
                    // Log unexpected messages for debugging — do not crash
            }
        }
                                                     // ← add to here
```

**Why `switch` instead of `if/else if`:** Both work identically. `switch` is
conventional for dispatching on a single string value with many possible cases.
It is easier to scan visually — each `case:` label stands out as a clear entry
point. `if/else if` chains for 5+ cases become a vertical wall of conditions.

---

### Step 22 — Write showGameTable()

After `handleMessage()`, add:

```javascript
        function handleMessage(message) { ... }

        function showGameTable(message) {            // ← add from here
            joinScreen.style.display = 'none'
            // Hide the join screen — it is no longer needed
            gameTable.style.display  = 'flex'
            // Show the game table — it was hidden with display:none in the HTML
            // 'flex' not 'block' because the table uses flexbox layout

            renderTable(message)
            // Separate the "show table" action from the "fill table with data" action
            // renderTable() will also be called on every game_update message
            // so it cannot assume the table was just shown for the first time
        }
                                                     // ← add to here
```

**Why separate `showGameTable` and `renderTable`:** `showGameTable` handles
the once-only transition (hiding join screen, showing game table). `renderTable`
handles the data rendering that happens on EVERY update — first deal and every
card play after that. Keeping them separate means you do not accidentally
re-run the "hide join screen" logic on every card play.

---

### Step 23 — Write renderTable()

After `showGameTable()`, add:

```javascript
        function showGameTable(message) { ... }

        function renderTable(message) {              // ← add from here
            const oppName  = message.opponent_name  || 'OPPONENT'
            const oppCount = message.opponent_count || 0

            document.getElementById('opp-label').textContent =
                `${oppName} — ${oppCount} CARDS`
            // Update the opponent label with their name and card count

            const oppHandEl = document.getElementById('opponent-hand')
            oppHandEl.innerHTML = Array(oppCount)
                .fill(null)
                .map(() => renderCardBack())
                .join('')
            // Array(oppCount) creates an array of oppCount slots
            // .fill(null) fills them with null (we need values to map over)
            // .map(() => renderCardBack()) creates one face-down card per slot
            // .join('') turns the array of HTML strings into one string

            const discardEl = document.getElementById('discard-pile')
            discardEl.innerHTML = renderCard(message.top_card)
            // The top card is face-up — use renderCard() not renderCardBack()

            document.getElementById('your-label').textContent =
                `${myName} — ${message.your_hand.length} CARDS`

            handEl.innerHTML = message.your_hand
                .map(card => renderCard(card))
                .join('')
            // Replace myHand with server data: message.your_hand is the array
            // renderCard() is the same function from Lab G1 — unchanged
        }
                                                     // ← add to here
```

**Why `message.your_hand` instead of `myHand`:** This is the key change from
Lab G1. `myHand` was hardcoded. `message.your_hand` comes from the server —
real cards dealt from a real shuffled deck. The `renderCard()` function itself
does not change at all. Only the data source changes. This is why separating
data from rendering matters: the renderer is reusable with any data source.

---

### Step 24 — Add the Missing HTML Elements

`renderTable()` references element IDs that do not yet exist in the HTML.
Find `#game-table` in your HTML and update its contents:

```html
    <div id="game-table" style="display:none">

        <button id="modeBtn">☀ LIGHT</button>    <!-- already exists -->

        <div id="opp-label">OPPONENT</div>       <!-- ← add this line -->
        <div id="opponent-hand"></div>           <!-- ← add this line -->

        <div id="piles">                         <!-- ← add from here -->
            <div>
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
            </div>
            <div>
                <div class="pile-label">DISCARD</div>
                <div id="discard-pile"></div>
            </div>
        </div>                                   <!-- ← add to here -->

        <div id="your-label">YOUR HAND</div>    <!-- ← add this line -->
        <div id="player-hand"></div>             <!-- already exists -->

    </div>
```

Add CSS for the new layout elements. After `#modeBtn` styles, add:

```css
        #modeBtn {
            /* ... existing ... */
        }

        #game-table {                              /* ← add from here */
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 560px;
        }
```

### CSS AND SEE

Save. Refresh.

**You should see:** The join screen still shows. No change visible yet —
`#game-table` is still hidden. This step confirms the HTML is valid.

Now add the pile layout style. After `#game-table`:

```css
        #game-table {
            ...
        }

        #piles {                                   /* ← add from here */
            display: flex;
            gap: 24px;
            justify-content: center;
        }

        .pile-label {
            font-family: 'Courier New', monospace;
            font-size:   9px;
            letter-spacing: 0.15em;
            color:       var(--color-muted);
            text-align:  center;
            margin-bottom: 6px;
        }

        #opp-label, #your-label {
            font-family: 'Courier New', monospace;
            font-size:   10px;
            letter-spacing: 0.2em;
            color:       var(--color-muted);
        }                                          /* ← add to here */
```

### CSS AND SEE

Save. Refresh.

**You should see:** Still only the join screen. The game table CSS is ready
but the table is hidden. You will see it in the next SAVE AND TRY.

---

### Step 25 — Add the renderCardBack Function

In the `<script>` block, after `renderCard()`, add:

```javascript
        function renderCard(card) { ... }

        function renderCardBack() {                 // ← add from here
            return `
                <div class="card card-back">
                    <div class="back-pattern"></div>
                </div>
            `
            // Returns an HTML string for a face-down card
            // The CSS classes card-back and back-pattern provide the visual
        }
                                                    // ← add to here
```

**Why a separate function instead of a special flag on `renderCard()`:**
Face-down and face-up cards are visually and structurally different.
A face-down card has no rank, no suit, and different CSS classes.
Making `renderCard()` handle both with an `if (faceDown)` branch would make
it do two unrelated jobs. Two simple, focused functions are easier to read
and test than one complex function with branching.

Now add the CSS for face-down cards. After `.black-suit` in the style block:

```css
        .black-suit {
            /* ... */
        }

        .card-back {                               /* ← add from here */
            background:   var(--bg-card-back);
            border-color: var(--border-card-back);
        }

        .back-pattern {
            position:     absolute;
            inset:        8px;
            border-radius: 4px;
            border:       1px solid var(--border-card-back);
            background:   repeating-linear-gradient(
                45deg,
                var(--pattern-color) 0px,
                var(--pattern-color) 2px,
                transparent 2px,
                transparent 8px
            );
        }                                          /* ← add to here */
```

**Why `inset: 8px`:** `inset` is shorthand for setting `top`, `right`, `bottom`,
and `left` all to the same value. `inset: 8px` means the pattern div is 8px
from every edge of the card — it never touches the card border.

**Why `repeating-linear-gradient`:** Creates a repeating diagonal stripe pattern —
the classic card back design. The gradient alternates between the pattern color
(slightly transparent) and transparent every 8px, at a 45-degree angle.

Add the new variables to `:root`:

```css
        :root {
            --bg-table:    #0a0f14;
            --bg-card:     #141c24;
            --border-card: rgba(255,255,255,0.10);
            --color-red:   #ff4466;
            --color-black: #00c8ff;
            --color-accent: #00ffb4;
            --color-muted:  rgba(0,255,180,0.30);
            --color-text:  #ffffff;
            --bg-card-back:     #0d1520;          /* ← add this line */
            --border-card-back: rgba(0,255,180,0.20);   /* ← add this line */
            --pattern-color:    rgba(0,255,180,0.08);   /* ← add this line */
        }
```

And to `:root.light`:

```css
        :root.light {
            --bg-table:    #dde8f5;
            --bg-card:     #ffffff;
            --border-card: rgba(0,0,0,0.12);
            --color-red:   #cc0022;
            --color-black: #111111;
            --color-accent: #0055cc;
            --color-muted:  rgba(0,85,204,0.35);
            --color-text:  #111111;
            --bg-card-back:     #1a3a6e;          /* ← add this line */
            --border-card-back: rgba(68,136,255,0.30);  /* ← add this line */
            --pattern-color:    rgba(255,255,255,0.15); /* ← add this line */
        }
```

### SAVE AND TRY — The Full Two-Player Test

Make sure the Python server is still running.
If not, in the terminal go to `card-engine/backend` and run:
```
uvicorn main:app --reload
```

Open `index.html` in your browser. Type "Alice" in the name field. Click JOIN GAME.

**You should see:** "Waiting for opponent to connect..." appears.
**In the terminal:** `Alice connected. Players: ['Alice']`

Open a SECOND browser tab. Open the same `index.html` file. Type "Bob". Click JOIN GAME.

**You should see in both tabs:**
- Join screen disappears
- Game table appears with cards

**Alice's tab:**
- 5 of Alice's cards face-up at the bottom
- "BOB — 5 CARDS" label with 5 face-down cards above
- A face-up discard card in the pile area

**Bob's tab:**
- 5 of Bob's cards face-up at the bottom
- "ALICE — 5 CARDS" label with 5 face-down cards above
- The SAME face-up discard card

**In the terminal:**
```
Bob connected. Players: ['Alice', 'Bob']
Game started! 41 cards remain in deck.
```

**In DevTools Console (either tab):**
```javascript
socket.readyState
```
**Expected:** `1` — WebSocket is open. (0=connecting, 1=open, 2=closing, 3=closed)

**Change something:** Close Bob's tab.
**Alice's tab should show** an alert: "Bob disconnected"
**Terminal:** `Bob disconnected`

Reopen the file in a new tab. Join as Bob again. Both tabs get fresh cards.

---

## 🎯 Challenge: Prevent Duplicate Names

**You know:** `game['players']` is a dict. Python's `in` operator checks
if a key exists: `'Alice' in game['players']`. WebSocket handlers can
send a message and then close the connection.

**Task:** If a player tries to join with a name already in use (two tabs
both try to join as "Alice"), the server should send an error message and
close the second connection. The first player is unaffected.

**Where to add it:** At the top of `websocket_endpoint()`, right after
`await websocket.accept()`, before `game['players'][player_name] = websocket`.

**On the frontend:** Add a `'error'` case to `handleMessage()` that shows
the reason in `joinStatus` and re-enables the join button.

**Hint:** Use `await websocket.close()` to close the connection from the server side.
After closing, use `return` to exit the function so the rest of the handler does not run.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, at the top of `websocket_endpoint()`:**
```python
async def websocket_endpoint(websocket: WebSocket, player_name: str):
    await websocket.accept()

    if player_name in game['players']:              # ← add from here
        await websocket.send_text(json.dumps({
            'type':    'error',
            'message': f'Name "{player_name}" is already taken. Choose a different name.'
        }))
        await websocket.close()
        return
        # return exits the handler immediately — the duplicate connection is rejected
        # and the existing player is completely unaffected
                                                    # ← add to here

    game['players'][player_name] = websocket        # ← only reached if name is unique
```

**In `index.html`, add to `handleMessage()`:**
```javascript
                case 'error':
                    joinStatus.textContent = message.message
                    joinBtn.disabled = false
                    // Re-enable so they can try a different name
                    break
```

**Key insight:** The server rejects the connection BEFORE registering the player.
`game['players'][player_name] = websocket` is below the check, so it only runs
for unique names. This order matters — if you registered first and checked second,
you would have to clean up the registration on rejection, which is more complex.
Validate before committing is a fundamental server-side principle.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Server starts without errors | `uvicorn main:app --reload` → "Application startup complete" |
| Deck has 52 cards | Python: `len(make_deck()) == 52` |
| Deck is shuffled | Run `make_deck()` twice → different orders |
| Color assignment correct | Python: count reds in deck → exactly 26 |
| First player sees "waiting" | Join as Alice → join screen shows waiting message |
| Second player triggers deal | Join as Bob → both tabs switch to game table |
| Alice sees her 5 cards | Alice's tab shows 5 face-up cards at bottom |
| Bob sees his 5 cards | Bob's tab shows 5 different face-up cards |
| Opponent cards are face-down | Opponent hand shows back pattern, no rank or suit |
| Both see same discard card | Compare top card on both tabs → identical |
| Opponent name shows correctly | "BOB — 5 CARDS" above Alice's opponent hand |
| Server logs both connections | Terminal shows both players connecting and game starting |
| Disconnect resets game | Close Bob's tab → Alice sees alert, terminal shows reset |
| Server stays running | After Bob disconnects, Alice can still close and Alice disconnects cleanly |

---

## Quick Check Answers

**1. Why would HTTP break for a card game?**
HTTP closes the connection after every response. The server has no way to
contact a browser unless the browser sends a new request. In a card game,
when Player 1 plays a card, Player 2's browser must be told immediately —
but it has no open connection for the server to use. The only workaround
(polling — asking "anything new?" every second) is wasteful and still
introduces noticeable delay. WebSockets keep the connection open so the
server can push updates to both players the instant anything changes.

**2. How does Player 2's screen know to update?**
The server tells it. When Player 1 sends "I played the 7♥," the server
receives that message, validates it, updates `game['hands']` and `game['discard']`,
then loops through `game['players']` and calls `send_to()` for each player.
Both WebSocket connections receive a message. Both browsers' `socket.onmessage`
handlers fire. Both screens update. The server is the coordinator — it holds
both connections and can reach either player at any moment.

**3. Which part of the code did NOT change when switching to server data?**
`renderCard()` did not change at all. In Lab G1, it received a card object
from `myHand`. In Lab G2, it receives a card object from `message.your_hand`.
The function only cares about the shape of the data (an object with `rank`,
`suit`, and `color` properties) — not where that data came from. This is
the payoff of separating data from rendering: the renderer is reusable with
any data source that matches the expected shape.

---

## What's Next — Lab G3

Two players are connected. Cards are dealt. Screens show the correct hands.

Lab G3 adds the actual gameplay:
- Click a card to attempt playing it
- The server validates: is it your turn? do you have the card? does it match?
- Legal play: card disappears from your hand, appears on discard — on BOTH screens
- Illegal play: card shakes left-right, status bar shows why
- Draw button: adds a card to your hand
- Turn switching: after you play, the opponent's cards become clickable

---

*Lab G2 complete. Two browsers. One server. Real cards. Real connection.*
