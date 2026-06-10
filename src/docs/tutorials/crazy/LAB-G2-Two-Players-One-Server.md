# Card Engine — LAB G2 — Two Players, One Server

**Prerequisites:** Lab G1 complete. You have `index.html` with working card rendering,
CSS variables, light/dark toggle, and `renderCard()` / `renderCardBack()` functions.

**What this lab adds:**
- A Python WebSocket server that manages a real shuffled deck
- Two browser tabs connect to it simultaneously
- Each player is dealt 5 cards from the server
- Your hand shows face-up, opponent's hand shows face-down
- The server is the single source of truth — it decides what cards exist

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. In Lab 01, every time you clicked Analyze, the browser opened a connection,
>    got a response, and the connection closed. Why would that be a problem for a card game?
> 2. If two players are connected to the same server, and Player 1 plays a card,
>    how does Player 2's screen update? Who tells it to?
> 3. The server will keep track of both players' hands. Why can't each browser
>    just keep track of its own hand locally?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Open two browser tabs. Both connect to your Python server.
The server deals cards. Each tab sees its own hand face-up,
the opponent's cards face-down, and the same discard pile.

```
TAB 1 (Player 1)                    TAB 2 (Player 2)
┌────────────────────┐              ┌────────────────────┐
│  CRAZY EIGHTS      │              │  CRAZY EIGHTS      │
│                    │              │                    │
│  ░░░ ░░░ ░░░ ░░░   │              │  ░░░ ░░░ ░░░ ░░░   │
│  (P2's cards)      │              │  (P1's cards)      │
│                    │              │                    │
│  [draw] [Q♥]       │              │  [draw] [Q♥]       │
│                    │              │                    │
│  A♠  7♥  K♦  8♣   │              │  3♦  J♠  2♥  9♣   │
│  (YOUR cards)      │              │  (YOUR cards)      │
└────────────────────┘              └────────────────────┘
        │                                    │
        └──────────── WebSocket ─────────────┘
                          │
                   Python Server
                   (knows ALL cards)
```

---

## The Big Concept Before Any Code

### Concept: HTTP vs WebSockets — Why Games Need Something Different

**What HTTP does (Lab 01):**

```
Browser:  "Hey server, here's a file, analyze it"
Server:   "Here are the results"
          [connection closes]
```

One request, one response, done. The server cannot contact the browser
again unless the browser sends another request first.

**Why that breaks for games:**

Imagine Player 1 plays a card. The server knows. But how does Player 2's
browser find out? With HTTP, Player 2's browser would have to ask
"did anything change?" every second — called **polling**. It's wasteful,
slow, and creates a noticeable delay between the action and the update.

**What WebSockets do:**

```
Browser:  "I want to open a WebSocket connection"
Server:   "Connected"
          [connection STAYS OPEN — both sides can send anytime]

Later...
Server:   "Player 1 just played the 7♥"     ← server pushes this
Browser:  [updates the screen immediately]

Later...
Browser:  "I'm playing the 8♣"              ← browser sends this
Server:   [validates, updates game state, notifies both players]
```

The connection stays open. Either side can send a message at any time.
No polling. No delay. This is how every real-time multiplayer game works.

**The technical difference:**
- HTTP: request → response → closed. Stateless.
- WebSocket: connect → stay open → bidirectional messages → eventually close.
  Stateful — the server remembers who is connected.

**Watch for:** WebSocket messages are just text (usually JSON).
You decide what the messages mean — there's no built-in "deal cards" message.
You invent the message format. This is called a **protocol** — the agreed-upon
language between client and server.

---

### Concept: The Server as Single Source of Truth

**What it means:** The server is the only place where the real game state lives.
Browsers only hold display copies. Browsers cannot trust themselves.

**Why this matters:**

If each browser kept track of its own hand:
- Player 1's browser knows Player 1's hand
- Player 2's browser knows Player 2's hand
- Neither knows what the other has
- When Player 1 plays a card, their browser removes it locally — but
  Player 2's browser doesn't know unless told
- Player 1 could cheat by modifying their browser's JavaScript to say
  they have cards they don't actually have

**The solution — centralized state:**

```
Server holds:
  game.deck        = [remaining 42 cards in shuffled order]
  game.hands       = {player1: [5 cards], player2: [5 cards]}
  game.discard     = [Q♥]
  game.whose_turn  = "player1"

Browser holds:
  Only what the server told it to display.
  Nothing more.
```

When Player 1 plays a card, they send a message to the server.
The server validates it (is it their turn? is the card legal?),
updates its own state, then sends the new state to BOTH players.
Both screens update. The server's version is always authoritative.

**This is why online games have servers — not just for connection,
but to prevent cheating and to be the single agreed-upon truth.**

---

### Mental Model: The Message Protocol

Before writing any code, design the messages your client and server
will exchange. This is the contract between them.

Your protocol for Lab G2:

**Client → Server:**
```json
{ "type": "join", "name": "Alice" }
```
Sent when a browser connects. Tells the server who this player is.

**Server → Client:**
```json
{
  "type": "dealt",
  "your_hand": [
    {"rank": "A", "suit": "♠", "color": "black"},
    {"rank": "7", "suit": "♥", "color": "red"}
  ],
  "opponent_count": 5,
  "top_card": {"rank": "Q", "suit": "♥", "color": "red"},
  "whose_turn": "Alice"
}
```
Sent to each player after both have joined and cards are dealt.

**Server → Client (waiting):**
```json
{ "type": "waiting", "message": "Waiting for opponent..." }
```
Sent to the first player while waiting for the second to connect.

Every message has a `"type"` field. The client reads `type` and
decides what to do. This pattern — a type field that determines
how to handle the message — is used in almost every WebSocket system.

---

## PART 1 — The WebSocket Server

### Setup — Python Backend for the Card Game

Open VS Code terminal (Ctrl+`). Navigate to the card-engine folder:

```
cd card-engine
mkdir backend
cd backend
```

Create and activate a virtual environment:

```
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your prompt.

Install the packages:

```
pip install fastapi uvicorn websockets
```

**What `websockets` adds:** FastAPI supports WebSockets natively, but
the `websockets` package gives us some extra utilities. More importantly,
understanding why it's needed teaches you something real:
HTTP servers and WebSocket servers have different requirements.
FastAPI handles both, but the `websockets` package is the underlying
engine it uses for the persistent connection part.

---

### Step 1 — Create the Deck

Create `backend/main.py`. Type this — exactly this, nothing more:

```python
# main.py — Card Engine WebSocket Server

import json
import random

# ---- The Deck ----

SUITS = ['♠', '♥', '♦', '♣']
# The four suits — stored as Unicode characters, same as the frontend

RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
# All 13 ranks

RED_SUITS = {'♥', '♦'}
# A set for fast lookup — "is this suit red?"
# Sets use {} like dicts but contain only values, no keys
# Checking "if suit in RED_SUITS" is faster than checking a list


def make_deck():
    """
    Create and return a shuffled standard 52-card deck.
    Each card is a dict with rank, suit, and color.
    """
    deck = []

    for suit in SUITS:
        for rank in RANKS:
            card = {
                'rank': rank,
                'suit': suit,
                'color': 'red' if suit in RED_SUITS else 'black'
                # ternary: if suit is ♥ or ♦ → red, otherwise → black
            }
            deck.append(card)
            # After both loops: deck has 4 suits × 13 ranks = 52 cards

    random.shuffle(deck)
    # shuffle() rearranges the list in place — modifies deck directly
    # "in place" means it changes the original list, not a copy

    return deck
```

Save. Now test the deck in Python before adding anything else.

### SAVE AND TRY — Test in Python directly

In your terminal:
```
python
```

At the `>>>` prompt:
```python
from main import make_deck
deck = make_deck()
print(len(deck))
print(deck[0])
print(deck[1])
```

**You should see:**
```
52
{'rank': 'K', 'suit': '♣', 'color': 'black'}   ← random, yours will differ
{'rank': '7', 'suit': '♥', 'color': 'red'}      ← random
```

52 cards. Each is a dict. Colors assigned correctly.
Run it again — different order because it's shuffled.

```python
# Count reds and blacks — should be 26 each
reds = [c for c in deck if c['color'] == 'red']
print(len(reds))
```

**Expected:** `26`

Type `exit()` to leave Python.

**Change something:** In `make_deck()`, remove the `random.shuffle(deck)` line.
Run the test again — deck always starts with A♠, 2♠, 3♠... in order.
Add `shuffle` back. Order is random again.

---

### Step 2 — Add the Game State

Below the `make_deck()` function, add the game state structure:

```python
# ---- Game State ----
# This dictionary is the single source of truth for the entire game.
# Both players' browsers are just displays of this data.

game = {
    'deck':       [],        # remaining cards to draw from
    'hands':      {},        # {player_id: [list of card dicts]}
    'discard':    [],        # list of played cards, top = last item
    'players':    {},        # {player_id: websocket_connection}
    'whose_turn': None,      # player_id of whoever should play next
    'started':    False,     # True once both players have joined
}
# Why a single dict instead of separate variables?
# Because we need to pass the whole state around, reset it cleanly,
# and in future labs, save it to a database — one object is easier.


def deal_game():
    """
    Set up a fresh game: new deck, deal 5 cards to each player.
    Called once both players have connected.
    """
    game['deck'] = make_deck()
    game['discard'] = []
    game['started'] = True

    player_ids = list(game['players'].keys())
    # .keys() returns the player IDs — convert to list so we can index them
    # game['players'] looks like: {"Alice": <websocket>, "Bob": <websocket>}

    # Deal 5 cards to each player
    for player_id in player_ids:
        hand = []
        for _ in range(5):
            # _ is convention for "I don't need this loop variable"
            hand.append(game['deck'].pop())
            # .pop() removes and returns the LAST item from the list
            # This is how you "draw from the top of the deck"
        game['hands'][player_id] = hand

    # Turn the top card of the remaining deck face up to start the discard pile
    top_card = game['deck'].pop()
    game['discard'].append(top_card)

    # First player in the list goes first
    game['whose_turn'] = player_ids[0]
```

### SAVE AND TRY — Test deal_game

```
python
```

```python
from main import game, deal_game

# Fake two players being connected
# (websocket=None because we're just testing the logic)
game['players']['Alice'] = None
game['players']['Bob'] = None

deal_game()

print('Deck remaining:', len(game['deck']))
print('Alice hand:', len(game['hands']['Alice']))
print('Bob hand:', len(game['hands']['Bob']))
print('Discard top:', game['discard'][-1])
print('Whose turn:', game['whose_turn'])
```

**You should see:**
```
Deck remaining: 41
Alice hand: 5
Bob hand: 5
Discard top: {'rank': '...', 'suit': '...', 'color': '...'}
Whose turn: Alice
```

52 cards - 5 (Alice) - 5 (Bob) - 1 (discard) = 41. Math checks out.

Type `exit()`.

---

### Concept: WebSockets in FastAPI

**What it is:** FastAPI handles WebSocket connections with a special route
decorator `@app.websocket()` instead of `@app.get()` or `@app.post()`.

**The key difference from HTTP routes:**
An HTTP route function runs, returns, and is done.
A WebSocket route function runs for as long as the connection is open —
it loops, waiting for messages, sending responses, until the client disconnects.

**The pattern:**

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()        # complete the handshake — connection is open

    try:
        while True:                 # loop forever while connected
            data = await websocket.receive_text()   # wait for a message
            # process data...
            await websocket.send_text("response")   # send something back
    except WebSocketDisconnect:
        pass                        # client disconnected — loop ends naturally
```

**`await websocket.receive_text()`:** Pauses the function until the client
sends a message. While paused, other connections can still be handled —
this is why `async` matters for servers with multiple connected clients.

**`WebSocketDisconnect`:** When a client closes their browser tab or loses
connection, FastAPI raises this exception. Catching it lets you clean up
gracefully (remove the player from the game, notify the opponent, etc.)
instead of crashing.

**Watch for:** WebSocket messages are always strings. To send structured data
(like a card hand), you convert a Python dict to a JSON string first:
`json.dumps(my_dict)`. On the browser side, you parse it back:
`JSON.parse(text)`. You'll see this in every step.

---

### Step 3 — Add the WebSocket Server

Add this to `main.py`, at the top and at the bottom:

**At the very top of the file, add the imports:**

```python
# main.py — Card Engine WebSocket Server

import json                                          # ← already there
import random                                        # ← already there
from fastapi import FastAPI, WebSocket               # ← ADD
from fastapi.websockets import WebSocketDisconnect   # ← ADD
from fastapi.middleware.cors import CORSMiddleware   # ← ADD

app = FastAPI()   # ← ADD

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**At the bottom of the file, after `deal_game()`, add:**

```python
# ---- Helper: send a message to one player ----

async def send_to(player_id: str, message: dict):
    """
    Convert a dict to JSON and send it to one player's WebSocket.

    player_id: str — the player's name/ID
    message: dict  — the data to send (will be converted to JSON)
    """
    websocket = game['players'].get(player_id)
    # .get() returns None if player_id not in dict — safer than direct access

    if websocket:
        await websocket.send_text(json.dumps(message))
        # json.dumps() converts Python dict → JSON string
        # send_text() sends that string over the WebSocket connection


# ---- Helper: build the "dealt" message for one player ----

def build_dealt_message(player_id: str) -> dict:
    """
    Build the message that tells a player what cards they have.
    Each player gets their OWN hand, and only the COUNT of opponent cards.
    Players never receive the opponent's actual card data.
    """
    player_ids = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]
    # list comprehension: build a list of player IDs that are NOT this player
    # [0] gets the first (and only) result — the opponent

    return {
        'type':           'dealt',
        'your_hand':      game['hands'][player_id],
        'opponent_count': len(game['hands'][opponent_id]),
        # Note: opponent COUNT, not opponent CARDS — the browser never sees opponent cards
        'top_card':       game['discard'][-1],
        # [-1] gets the last item — the top of the discard pile
        'whose_turn':     game['whose_turn'],
    }


# ---- The WebSocket Route ----

@app.websocket("/ws/{player_name}")
# {player_name} is a path parameter — like a variable in the URL
# ws://localhost:8000/ws/Alice → player_name = "Alice"
# ws://localhost:8000/ws/Bob  → player_name = "Bob"

async def websocket_endpoint(websocket: WebSocket, player_name: str):
    """
    Handle one player's WebSocket connection for its entire lifetime.
    This function runs from connect to disconnect.
    """

    await websocket.accept()
    # Complete the WebSocket handshake — connection is now open

    # Register this player
    game['players'][player_name] = websocket
    print(f"{player_name} connected. Players: {list(game['players'].keys())}")

    try:

        # Case 1: Only one player connected — make them wait
        if len(game['players']) < 2:
            await websocket.send_text(json.dumps({
                'type':    'waiting',
                'message': 'Waiting for opponent to connect...'
            }))

        # Case 2: Two players now connected — deal cards and start
        elif len(game['players']) == 2 and not game['started']:
            deal_game()

            # Send each player their own hand
            for pid in game['players']:
                await send_to(pid, build_dealt_message(pid))

            print(f"Game started! Deck: {len(game['deck'])} cards remaining")

        # ---- Main message loop ----
        # Keep this connection open, processing messages as they arrive
        while True:
            raw = await websocket.receive_text()
            # Pause here until the client sends something
            # (Game actions will be handled here in Lab G3)

            data = json.loads(raw)
            # json.loads() converts JSON string → Python dict

            print(f"Message from {player_name}: {data}")
            # For now, just log it — we'll handle game actions in G3

    except WebSocketDisconnect:
        # Player closed their tab or lost connection
        print(f"{player_name} disconnected")
        del game['players'][player_name]
        # Remove from the players dict

        # Notify the remaining player if there is one
        for pid in game['players']:
            await send_to(pid, {
                'type':    'opponent_left',
                'message': f'{player_name} disconnected'
            })

        # Reset the game so new players can join
        game['started'] = False
        game['hands'] = {}
        game['deck'] = []
        game['discard'] = []
        game['whose_turn'] = None
```

### SAVE AND TRY — Start the server

```
uvicorn main:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Go to `http://localhost:8000/docs` in your browser.

**You should see** the docs page — but notice there's no WebSocket route listed.
FastAPI's docs page doesn't show WebSocket routes (they're not HTTP).
That's normal — you'll test it differently.

**The server is running and ready to accept WebSocket connections.**

---

## PART 2 — Connect the Frontend

Now update `index.html` to connect to the server and use real card data
instead of the hardcoded `myHand` array.

### Concept: The WebSocket API in the Browser

**What it is:** A browser built-in for opening WebSocket connections.
Similar to `fetch` but for persistent connections.

```javascript
const socket = new WebSocket("ws://localhost:8000/ws/Alice")
// "ws://" instead of "http://" — WebSocket protocol
// Connection opens immediately when you create the WebSocket object
```

**The four events you handle:**

```javascript
socket.onopen = () => {
    // Connection established — safe to send messages now
    console.log("Connected!")
}

socket.onmessage = (event) => {
    // Server sent a message
    // event.data is the raw string
    const message = JSON.parse(event.data)
    // parse it and decide what to do based on message.type
}

socket.onclose = () => {
    // Connection closed (server shut down, network issue, etc.)
    console.log("Disconnected")
}

socket.onerror = (error) => {
    // Something went wrong
    console.error("WebSocket error:", error)
}
```

**Sending a message:**
```javascript
socket.send(JSON.stringify({ type: "join", name: "Alice" }))
// JSON.stringify() converts JS object → JSON string
// .send() transmits it over the connection
```

**Watch for:** You can only send after `onopen` fires. Sending before the
connection is open throws an error. Always put your first `send()` inside
`onopen`.

---

### Step 4 — Add a Name Input Screen

Before the game table, the player needs to enter their name.
This determines which WebSocket URL they connect to.

In `index.html`, update the `<body>` to add a name screen BEFORE the table:

```html
<body>

    <!-- Name entry screen — shown first -->
    <div id="join-screen">
        <h2>CRAZY EIGHTS</h2>
        <p>Enter your name to join:</p>
        <input type="text" id="nameInput" placeholder="Your name" maxlength="12">
        <button id="joinBtn">JOIN GAME</button>
        <div id="join-status"></div>
    </div>

    <!-- Game table — hidden until game starts -->
    <div class="table" id="game-table" style="display:none">

        <div class="table-header">
            <span class="game-title">CRAZY EIGHTS</span>
            <button class="mode-btn" id="modeBtn">☀ LIGHT</button>
        </div>

        <div class="section-label" id="opp-label">OPPONENT</div>
        <div class="hand" id="opponent-hand"></div>

        <div class="piles">
            <div class="pile-group">
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
            </div>
            <div class="pile-group">
                <div class="pile-label">DISCARD</div>
                <div id="discard-pile"></div>
            </div>
        </div>

        <div class="section-label" id="your-label">YOUR HAND</div>
        <div class="hand" id="player-hand"></div>

        <div class="status-bar" id="status-bar">Connecting...</div>

    </div>

</body>
```

Add CSS for the join screen and status bar:

```css
        #join-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding-top: 80px;
            font-family: 'Courier New', monospace;
        }

        #join-screen h2 {
            color: var(--color-accent);
            font-size: 20px;
            letter-spacing: 0.3em;
        }

        #join-screen p {
            color: var(--color-muted);
            font-size: 12px;
            letter-spacing: 0.1em;
        }

        #nameInput {
            background: var(--bg-card);
            border: 1px solid var(--color-accent);
            color: var(--color-text);
            padding: 10px 16px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            border-radius: 4px;
            text-align: center;
            outline: none;
            width: 200px;
        }

        #joinBtn {
            padding: 10px 28px;
            background: var(--color-accent);
            color: #000;
            border: none;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 0.15em;
            cursor: pointer;
            font-weight: bold;
        }

        #join-status {
            color: var(--color-muted);
            font-size: 11px;
            letter-spacing: 0.1em;
            min-height: 20px;
        }

        .status-bar {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: var(--color-muted);
            text-align: center;
            letter-spacing: 0.12em;
            padding: 10px;
            border-top: 1px solid var(--color-muted);
            margin-top: 8px;
        }
```

### CSS AND SEE

Save. Refresh.

**You should see:**
- Dark background
- "CRAZY EIGHTS" title
- A text input labeled "Your name"
- A "JOIN GAME" button
- The game table is hidden (you set `display:none` on it)

---

### Step 5 — Connect to WebSocket on Join

Replace the entire `<script>` block with this new version.
Read every comment — this is where the two halves of the app connect.

```javascript
    <script>

        // ---- Element references ----
        const joinScreen   = document.getElementById('join-screen')
        const gameTable    = document.getElementById('game-table')
        const nameInput    = document.getElementById('nameInput')
        const joinBtn      = document.getElementById('joinBtn')
        const joinStatus   = document.getElementById('join-status')
        const oppLabel     = document.getElementById('opp-label')
        const yourLabel    = document.getElementById('your-label')
        const oppHandEl    = document.getElementById('opponent-hand')
        const playerHandEl = document.getElementById('player-hand')
        const discardEl    = document.getElementById('discard-pile')
        const drawEl       = document.getElementById('draw-pile')
        const statusBar    = document.getElementById('status-bar')
        const modeBtn      = document.getElementById('modeBtn')

        const SERVER = "ws://localhost:8000/ws"
        // "ws://" = WebSocket protocol (not "http://")

        let socket = null
        // Will hold the WebSocket connection once the player joins
        // null means "not connected yet"

        let myName = ""
        // The player's chosen name — used to label their hand


        // ---- Card rendering functions (same as Lab G1) ----

        function renderCard(card) {
            const colorClass = card.color === 'red' ? 'red-suit' : 'black-suit'
            return `
                <div class="card">
                    <span class="rank ${colorClass}">${card.rank}</span>
                    <span class="suit ${colorClass}">${card.suit}</span>
                    <span class="rank bottom-right ${colorClass}">${card.rank}</span>
                </div>
            `
        }

        function renderCardBack() {
            return `
                <div class="card card-back">
                    <div class="back-pattern"></div>
                </div>
            `
        }


        // ---- Join button handler ----

        joinBtn.addEventListener('click', () => {
            const name = nameInput.value.trim()
            // .trim() removes leading/trailing whitespace
            // "  Alice  " becomes "Alice"

            if (!name) {
                joinStatus.textContent = "Please enter a name"
                return
            }

            myName = name
            joinStatus.textContent = "Connecting..."
            joinBtn.disabled = true
            // Prevent double-clicking while connecting

            connectToServer(name)
        })

        // Allow pressing Enter in the name field to join
        nameInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                joinBtn.click()
                // .click() programmatically triggers the button's click event
            }
        })


        // ---- WebSocket connection ----

        function connectToServer(name) {
            socket = new WebSocket(`${SERVER}/${name}`)
            // URL becomes: ws://localhost:8000/ws/Alice

            socket.onopen = () => {
                // Connection established
                // The server handles everything from here —
                // it will send "waiting" or "dealt" automatically
                console.log("WebSocket connected")
            }

            socket.onmessage = (event) => {
                // Server sent us a message
                const message = JSON.parse(event.data)
                // event.data is the raw JSON string — parse it into an object
                handleMessage(message)
            }

            socket.onclose = () => {
                statusBar.textContent = "Disconnected from server"
                console.log("WebSocket closed")
            }

            socket.onerror = () => {
                joinStatus.textContent = "Could not connect to server"
                joinBtn.disabled = false
                console.error("WebSocket error")
            }
        }


        // ---- Message handler — the heart of the client ----

        function handleMessage(message) {
            // message.type tells us what kind of message this is
            // This pattern — switch on a type field — handles all message types

            switch (message.type) {

                case 'waiting':
                    // Still waiting for the second player
                    joinStatus.textContent = message.message
                    // Keep the join screen visible — game hasn't started
                    break

                case 'dealt':
                    // Both players connected — game is starting
                    showGameTable(message)
                    break

                case 'opponent_left':
                    // Opponent disconnected
                    statusBar.textContent = "Opponent left the game"
                    break

                default:
                    console.log("Unknown message type:", message.type)
            }
        }


        // ---- Show the game table after cards are dealt ----

        function showGameTable(message) {
            // Hide the join screen, show the game table
            joinScreen.style.display = 'none'
            gameTable.style.display  = 'flex'
            // The table uses flexbox — 'flex' not 'block'

            // Render opponent's hand (face down — we only know the COUNT)
            oppLabel.textContent = `OPPONENT — ${message.opponent_count} CARDS`
            oppHandEl.innerHTML = Array(message.opponent_count)
                .fill(null)
                .map(() => renderCardBack())
                .join('')

            // Render the draw pile (visual stack of 3 face-down cards)
            drawEl.innerHTML = `
                <div class="draw-stack">
                    ${Array(3).fill(null).map(() => renderCardBack()).join('')}
                </div>
            `

            // Render the top card of the discard pile (face up)
            discardEl.innerHTML = renderCard(message.top_card)

            // Render YOUR hand (face up — these are your actual cards)
            yourLabel.textContent = `${myName} — ${message.your_hand.length} CARDS`
            playerHandEl.innerHTML = message.your_hand
                .map(card => renderCard(card))
                .join('')

            // Show whose turn it is
            const isMyTurn = message.whose_turn === myName
            statusBar.textContent = isMyTurn
                ? '▸ YOUR TURN'
                : `▸ ${message.whose_turn}'s TURN`
        }


        // ---- Light/dark mode toggle (same as Lab G1) ----

        modeBtn.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('light')
            modeBtn.textContent = isLight ? '🌙 DARK' : '☀ LIGHT'
        })

    </script>
```

### SAVE AND TRY — The Full Two-Player Test

Make sure your Python server is still running in the terminal.
If not, go to `card-engine/backend` and run:
```
uvicorn main:app --reload
```

Open `index.html` in your browser by double-clicking it.

**In the browser:** Type "Alice" in the name box. Click JOIN GAME.

**You should see:** "Waiting for opponent to connect..."

**In your terminal:** You should see:
```
Alice connected. Players: ['Alice']
```

Now open a SECOND browser tab. Open the same `index.html` file.
Type "Bob" in the name box. Click JOIN GAME.

**You should see in both tabs:** The game table appears with cards.

**In your terminal:**
```
Bob connected. Players: ['Alice', 'Bob']
Game started! Deck: 41 cards remaining
```

**Alice's tab shows:** Alice's 5 cards face up, 5 face-down cards for opponent.
**Bob's tab shows:** Bob's 5 cards face up, 5 face-down cards for opponent.
**Both tabs show** the same top card on the discard pile.
**One tab shows** "▸ YOUR TURN", the other shows "▸ Alice's TURN".

**In DevTools Console** (F12 in either tab):
```javascript
socket.readyState
```
**Expected:** `1` — WebSocket states are: 0=connecting, 1=open, 2=closing, 3=closed.

**Change something:** Close Bob's tab. Alice's tab should show:
"Opponent left the game" in the status bar.
The terminal shows "Bob disconnected". Reopen the file, rejoin as Bob —
the game resets and both players go back to the waiting/dealing flow.

---

## 🎯 Challenge: Show the Player Names on Both Sides

**You know:** `message.whose_turn` contains a player name. The server sends
`build_dealt_message()` which you control. `showGameTable()` sets label text.

**Task:** The opponent label currently says "OPPONENT — 5 CARDS".
Make it show the opponent's actual name — "BOB — 5 CARDS" or "ALICE — 5 CARDS".

**The problem:** Each player's `dealt` message currently doesn't include
the opponent's name — only their card count. You need to add it.

**Where to change:** Two places:
1. `build_dealt_message()` in `main.py` — add `'opponent_name'` to the dict
2. `showGameTable()` in `index.html` — use `message.opponent_name` in the label

**Hint:** You already know how to get the opponent's ID in `build_dealt_message()` —
you wrote that code in Step 3. The opponent's name IS their ID.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, update `build_dealt_message()`:**

```python
def build_dealt_message(player_id: str) -> dict:
    player_ids = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]

    return {
        'type':           'dealt',
        'your_hand':      game['hands'][player_id],
        'opponent_name':  opponent_id,          # ← ADD this line
        'opponent_count': len(game['hands'][opponent_id]),
        'top_card':       game['discard'][-1],
        'whose_turn':     game['whose_turn'],
    }
```

**In `index.html`, update `showGameTable()`:**

```javascript
oppLabel.textContent = `${message.opponent_name} — ${message.opponent_count} CARDS`
// was: `OPPONENT — ${message.opponent_count} CARDS`
```

**Key insight:** The server controls what data the client receives.
Adding information to the frontend is always a two-step process:
add it to the server's message, then read it in the client's handler.
The message is the contract — change it in both places or it breaks.

</details>

---

## 🎯 Challenge: Prevent the Same Name Twice

**You know:** `game['players']` is a dict. You can check if a key exists with `in`.
WebSocket connections can send a message before the loop starts.

**Task:** If a player tries to join with a name that's already taken
(e.g., two tabs both try to join as "Alice"), the server should reject
the second connection with a message and close it.

**Where to add it:** At the top of `websocket_endpoint()`, right after `accept()`,
before adding the player to `game['players']`.

**Hint:** Send a message of type `'error'` with a reason, then call
`await websocket.close()` to end the connection.
On the frontend, handle `'error'` in `handleMessage()`.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, at the top of `websocket_endpoint()`:**

```python
async def websocket_endpoint(websocket: WebSocket, player_name: str):
    await websocket.accept()

    # ← ADD: check for duplicate names
    if player_name in game['players']:
        await websocket.send_text(json.dumps({
            'type':    'error',
            'message': f'Name "{player_name}" is already taken'
        }))
        await websocket.close()
        return
        # return exits the function — the rest of the handler doesn't run

    # Register this player (only reached if name is unique)
    game['players'][player_name] = websocket
```

**In `index.html`, add to `handleMessage()`:**

```javascript
case 'error':
    joinStatus.textContent = message.message
    joinBtn.disabled = false
    // Re-enable so they can try a different name
    socket.close()
    break
```

**Key insight:** `return` inside an `async def` exits the coroutine immediately —
same as in a regular function. The WebSocket is closed cleanly because you
explicitly called `close()` before returning. Without `close()`, the connection
would hang open in a broken state.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Server starts | `uvicorn main:app --reload` — see "Application startup complete" |
| Deck has 52 cards | Test in Python: `len(make_deck()) == 52` |
| Deck is shuffled | Run `make_deck()` twice — different order each time |
| First player sees "waiting" | Join as Alice — join screen stays, shows waiting message |
| Second player triggers deal | Join as Bob — both tabs switch to game table |
| Each player sees 5 cards | Both hands have 5 cards rendered |
| Hands are different | Alice and Bob have different cards (same deck, different hands) |
| Opponent cards are face down | You see backs, not ranks/suits, for opponent |
| Discard pile shows same card | Both tabs show the same top card |
| Turn indicator correct | One tab says YOUR TURN, the other shows the other player's name |
| Disconnect resets game | Close one tab — other tab shows "opponent left" |
| Server logs connections | Terminal shows connect/disconnect messages |

---

## Quick Check Answers

**1. Why would HTTP be a problem for a card game?**
HTTP closes the connection after every response. The server has no way to
contact the browser again unless the browser asks first. For a card game,
when Player 1 plays a card, Player 2's screen needs to update immediately.
With HTTP, Player 2 would have to ask the server "did anything change?"
every fraction of a second — wasteful, slow, and still not truly instant.
WebSockets keep the connection open so the server can push updates to
both players the moment anything happens.

**2. How does Player 2's screen update when Player 1 plays a card?**
The server tells it to. When Player 1 sends "I'm playing the 7♥," the server
receives that message, validates it, updates `game['hands']` and `game['discard']`,
then sends a new state message to BOTH connected WebSockets — Player 1's and
Player 2's. Both browsers receive the message and update their displays.
The server is the coordinator — it knows all connections and can reach any of them.

**3. Why can't each browser keep track of its own hand locally?**
Two reasons. First, synchronization: if both browsers track state independently,
they can get out of sync. Player 1's browser thinks one thing, Player 2's thinks
another. Who is right? There's no way to know. Second, security: if a browser
holds the authoritative state, a player could open DevTools and modify
`myHand` to give themselves better cards. The server holds the real state.
Browsers are only trusted to display what they're told — never to decide
what's true.

---

## What's Next — Lab G3

The table is live. Two players connected. Cards dealt.

Lab G3 adds the actual gameplay:
- Click a card in your hand to play it
- The server validates whether the play is legal (matching suit or rank)
- If legal: card moves from hand to discard pile on BOTH screens
- If not legal: your card bounces back with a visual shake
- Drawing a card when you can't play
- Turn switching — after you play, it becomes the opponent's turn

The `renderCard()` function you wrote in G1 doesn't change.
The WebSocket message handling you wrote here gets one new message type: `'game_update'`.

---

*Lab G2 complete. Two browsers. One server. Real cards. Real connection.*
