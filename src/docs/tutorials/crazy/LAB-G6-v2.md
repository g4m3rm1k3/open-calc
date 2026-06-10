# Card Engine — LAB G6 — Local Network Play

**Prerequisites:** Lab G5 complete. The game is fully working on one machine —
scoring, rematches, wild 8s, suit picker all working.

**What this lab adds:**
- Your coworker opens a browser on their PC and connects to YOUR machine
- No code changes to the game itself — only server configuration
- Your computer's local IP address replaces `localhost` in the frontend
- The server binds to `0.0.0.0` instead of `127.0.0.1` to accept outside connections
- Optional: a room system so multiple pairs of players can play simultaneously

**Time:** 45–60 minutes (mostly configuration, minimal new code)

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now the frontend connects to `ws://localhost:8000/ws/Alice`.
>    `localhost` is a special name that always means "this computer."
>    Why would `localhost` not work if your coworker types it on their PC?
> 2. When you run `uvicorn main:app --reload`, the server binds to `127.0.0.1`.
>    What is `127.0.0.1` and why can only your own computer reach it?
> 3. Your computer has multiple network addresses. Which one would your coworker use to reach you?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
YOUR COMPUTER (192.168.1.42)        COWORKER'S COMPUTER
┌──────────────────────────┐        ┌──────────────────────────┐
│  uvicorn running on      │        │  Browser opens:           │
│  0.0.0.0:8000            │        │  index.html              │
│  (accepts from anywhere) │        │  Types: Bob              │
│                          │        │  Connects to:             │
│  Terminal:               │◄──────►│  ws://192.168.1.42:8000  │
│  Bob connected!          │        │  /ws/Bob                 │
└──────────────────────────┘        └──────────────────────────┘
        Both on the same WiFi network
```

No internet required. No deployment. Just two PCs on the same WiFi.

---

## PART 1 — Understanding the Network Addresses

### Concept: localhost vs Local Network IP

**What it is:** `localhost` is a special hostname that always resolves to the
loopback address `127.0.0.1` — a virtual network interface that points back
to your own computer. Traffic sent to `127.0.0.1` never leaves your machine.

**The problem:**
When your coworker types `localhost` on their computer, it resolves to
THEIR `127.0.0.1` — their own computer. It does not point to yours.
`localhost` always means "this machine, whoever is reading this."

**The solution:**
Your computer has a local network IP address — something like `192.168.1.42`.
This address is unique on your local network and routable from any other
device on the same WiFi. Your coworker types `192.168.1.42` and reaches YOUR machine.

**The two relevant addresses:**
```
127.0.0.1   — loopback (localhost)
              Only reachable from your own machine.
              No one else can connect to this.

192.168.x.x — local network IP (your WiFi address)
or
10.x.x.x    — also common for local networks
              Reachable from any device on the same WiFi.
              Changes when you connect to a different network.
```

**Canonical example (General Explanation):**
In an office building, every room has two "addresses":
- An internal phone extension (like `127`) — only works within that room,
  dialing it from any other room calls that room's own phone.
- A desk number known to the whole building (like `42`) — anyone in the
  building can reach you by dialing `42`.

`localhost` is the internal extension. Your local IP is your desk number.

**Project Application (The "Why" here):**
You need to know your local IP address so you can tell your coworker what to
type in their browser. You also need to hard-code it (or dynamically determine it)
in the frontend's `SERVER_WS` constant, replacing `localhost`.

**Watch for:** Your local IP address changes when you connect to different
networks (home WiFi vs. work WiFi vs. a coffee shop). If the connection stops
working after changing locations, re-run the IP discovery command and update
the frontend.

---

### Step 1 — Find Your Local IP Address

Open a terminal. Run the appropriate command for your operating system:

**On Windows:**
```
ipconfig
```

Look for a section labeled "Wireless LAN adapter Wi-Fi:" (if on WiFi) or
"Ethernet adapter:" (if wired). Find the line:
```
IPv4 Address. . . . . . . . . . . : 192.168.1.42
```
That number after the colon is your local IP. Write it down.

**What `ipconfig` does:** "IP configuration" — lists all network interfaces
on your computer and their current addresses. Each network adapter (WiFi card,
ethernet port, virtual adapters) has its own section.

**Why "IPv4 Address":** IPv4 is the older, more common format: four groups of
numbers separated by dots. IPv6 (the newer format) looks like `fe80::1a2b:3c4d`.
For local network play, you want the IPv4 address.

### SAVE AND TRY

In the terminal, run:

```
ping 127.0.0.1
```

**You should see:** Replies from `127.0.0.1` with low round-trip times (< 1ms).
This confirms your loopback interface works.

Now ping your own local IP (replace with YOUR actual address):

```
ping 192.168.1.42
```

**You should see:** Replies from your own IP — also with very low times.
This confirms you can reach your own machine by its local IP.

Press **Ctrl+C** to stop the ping.

**Why pinging your own IP matters:** If this fails, your firewall is blocking
ICMP (ping) traffic. It may also block WebSocket traffic. You will need to
add a firewall exception in Part 2.

---

## PART 2 — Server Configuration

### Concept: Binding Address — 127.0.0.1 vs 0.0.0.0

**What it is:** When a server starts, it "binds" to a network address and port —
it tells the operating system "deliver traffic arriving at THIS address:port to me."

**The difference:**
```
127.0.0.1:8000  — only accepts connections from this machine
                  Requests from your coworker's PC are rejected at the OS level
                  before they even reach Python

0.0.0.0:8000    — accepts connections from ANY network interface
                  Local IP (192.168.x.x), loopback (127.0.0.1), everything
                  Your coworker's connection is accepted
```

**Canonical example (General Explanation):**
A restaurant with two doors: a back door only staff can use (127.0.0.1)
and a front door open to everyone (0.0.0.0). Right now your server only
has a back door. You are adding a front door.

`0.0.0.0` does not mean "no address" — it means "all addresses."
It is a wildcard binding: accept on every available interface.

**Project Application (The "Why" here):**
Adding `--host 0.0.0.0` to the uvicorn command changes the binding
from loopback-only to all interfaces. This is the only server change
needed to accept connections from the local network.

**Watch for:** Binding to `0.0.0.0` makes your server reachable from
outside your machine, including from the internet if your router is
configured to forward the port. For local development on a trusted network
(your home or workplace), this is safe. In a public location (coffee shop,
conference), be cautious — only run on `0.0.0.0` when you intend to accept connections.

---

### Step 2 — Restart the Server with Network Binding

Stop the currently running server (Ctrl+C in the terminal).

Start it with the new host flag:

```
uvicorn main:app --reload --host 0.0.0.0
```

**Why `--host 0.0.0.0`:** Tells uvicorn to bind to all network interfaces
instead of only loopback. Your local IP address now points to this server.

### SAVE AND TRY

**You should see:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Note: uvicorn reports `0.0.0.0:8000`, not your specific IP.
This is correct — `0.0.0.0` is the binding address, not a destination you visit.

On YOUR machine, open a browser and go to:
```
http://localhost:8000/docs
```

**You should see:** The FastAPI docs page still works — `localhost` still works
for your own machine because `0.0.0.0` includes `127.0.0.1`.

Now try your actual local IP:
```
http://192.168.1.42:8000/docs
```
(Replace with your actual IP)

**You should see:** The same docs page — now accessible via your network IP.

---

### Step 3 — Allow the Port Through Windows Firewall

Windows Firewall may block incoming connections to port 8000.
Your coworker's connection will be refused unless you add an exception.

Open a NEW terminal as Administrator:
- Press the Windows key
- Type "PowerShell"
- Right-click "Windows PowerShell" → "Run as administrator"

Run this command (all on one line):

```
netsh advfirewall firewall add rule name="Card Engine Dev" dir=in action=allow protocol=TCP localport=8000
```

**Why this command:**
- `advfirewall firewall add rule` — adds a new firewall rule
- `name="Card Engine Dev"` — a label for the rule (you can remove it later)
- `dir=in` — applies to INCOMING connections (traffic coming TO your machine)
- `action=allow` — permit the traffic (not block it)
- `protocol=TCP` — WebSockets use TCP
- `localport=8000` — only allow this specific port

### SAVE AND TRY

**You should see:**
```
Ok.
```

The rule is added. To confirm it exists:

```
netsh advfirewall firewall show rule name="Card Engine Dev"
```

**You should see:** The rule details confirming it was created.

**To remove this rule later** (when you are done developing):
```
netsh advfirewall firewall delete rule name="Card Engine Dev"
```

---

## PART 3 — Update the Frontend

### Step 4 — Create a Config File

Right now `SERVER_WS` is hardcoded as `'ws://localhost:8000/ws'` in `index.html`.
You need to change this to your local IP.

Instead of changing it directly in the HTML (and forgetting to change it back),
create a separate configuration file. In `card-engine/frontend/`, create a new file:

**File → New File → Save as `config.js`** in the `frontend/` folder.

Type:

```javascript
// config.js — Connection configuration
// Change SERVER_HOST when playing across the local network.
// Change it back to 'localhost' when testing with two tabs on one machine.

const SERVER_HOST = 'localhost'    // ← change this to your IP for network play
// Examples:
//   'localhost'      — both players on same machine (two browser tabs)
//   '192.168.1.42'  — coworker connects from their PC on the same WiFi
```

**Why a separate config file instead of an environment variable:**
Environment variables require a build system (Webpack, Vite, etc.) to inject
them at build time. A plain HTML project has no build step. A separate
`config.js` file is the simplest approach — one value to change, clearly labeled,
in its own file so it is easy to find.

**Why `const` at the top level:** This variable will be loaded before `index.html`'s
script block runs. Using `const` prevents accidental reassignment.

### SAVE AND TRY

Save `config.js`. Open it in the browser directly:
```
file:///path/to/card-engine/frontend/config.js
```
Or just verify there are no syntax errors by opening DevTools on `index.html`
after the next step connects it.

---

### Step 5 — Load config.js in index.html

In `index.html`, in the `<head>` section, add a script tag to load the config
BEFORE the main script block:

```html
<head>
    <meta charset="UTF-8">
    <title>Card Engine</title>

    <script src="config.js"></script>    <!-- ← add this line -->
    <!-- Load config.js before the main script so SERVER_HOST is available -->
    <!-- src="config.js" is a relative path — the browser looks in the same folder -->

    <style>
```

**Why in `<head>` before `<style>`:** Script tags in `<head>` load and execute
before `<body>` content is parsed. Since `config.js` defines `SERVER_HOST` and
the main `<script>` block in `<body>` uses it, `config.js` must load first.
If you put it after the main script, `SERVER_HOST` would be undefined when
the main script tries to use it.

**Why `src="config.js"` not `src="./config.js"`:** Both work in browsers.
`src="config.js"` is a relative path — the browser looks for `config.js` in
the same folder as the HTML file. The `./` prefix is optional and redundant here.

---

### Step 6 — Update SERVER_WS to Use the Config

In `index.html`, in the `<script>` block, find the `SERVER_WS` constant:

```javascript
        const SERVER_WS    = 'ws://localhost:8000/ws'
```

Replace it with:

```javascript
        const SERVER_WS = `ws://${SERVER_HOST}:8000/ws`
        // was: 'ws://localhost:8000/ws'
        // now: uses SERVER_HOST from config.js
        // SERVER_HOST = 'localhost'    → ws://localhost:8000/ws   (same machine)
        // SERVER_HOST = '192.168.1.42' → ws://192.168.1.42:8000/ws (network)
```

**Why a template literal here:** The URL is built by inserting `SERVER_HOST`
into a fixed pattern. Template literals (`\`...\``) make this readable —
you can see the full URL structure with the variable clearly marked.

### SAVE AND TRY

Save. Open `index.html` in your browser. Open DevTools Console. Type:

```javascript
SERVER_HOST
SERVER_WS
```

**Expected (with localhost config):**
```
localhost
ws://localhost:8000/ws
```

Open two tabs, join as Alice and Bob — everything works the same as before.
The config change is invisible when `SERVER_HOST` is `'localhost'`.

---

## PART 4 — Test with a Second Machine

### Step 7 — Send index.html to Your Coworker

Your coworker needs a copy of `index.html` and `config.js`.
The simplest way on a local network: share the files directly.

**Option A — USB drive or shared folder:**
Copy both `index.html` and `config.js` to a USB drive or shared network folder.
Your coworker opens `index.html` from there.

**Option B — Serve the files with Python's built-in HTTP server:**
In the `frontend/` folder, run:

```
python -m http.server 9000
```

**Why port 9000 not 8000:** Port 8000 is already used by uvicorn (the game server).
Port 9000 serves the HTML files. Two different servers, two different ports.

**Why `http.server`:** Python includes a simple file server. It serves any files
in the current directory over HTTP. Your coworker opens their browser and goes to:
```
http://192.168.1.42:9000/index.html
```
(Replace with your actual IP.)

If using Option B, also add port 9000 to the firewall:

```
netsh advfirewall firewall add rule name="Card Engine Files" dir=in action=allow protocol=TCP localport=9000
```

### SAVE AND TRY

Before your coworker connects, test it yourself first:

On YOUR machine, try accessing the file server from your local IP:
```
http://192.168.1.42:9000/index.html
```

**You should see:** The same page as when opened via `file://`.
If you see a browser error, check that the Python file server is running
in the correct folder (should be `card-engine/frontend/`).

---

### Step 8 — Update config.js for Network Play

In `config.js`, change `SERVER_HOST` from `'localhost'` to your actual IP:

```javascript
const SERVER_HOST = '192.168.1.42'    // ← change this to YOUR actual IP
// was: 'localhost'
```

**Why this change is necessary:** When your coworker's browser loads `index.html`
and runs the JavaScript, `ws://localhost:8000/ws` would point to THEIR machine —
not yours. It must be `ws://192.168.1.42:8000/ws` so both browsers connect to
YOUR server, regardless of which machine they are running on.

### SAVE AND TRY

On YOUR machine, open two tabs. Join as Alice and Bob.

**You should see:** Both tabs connect successfully. The `config.js` change
did not break same-machine testing — `192.168.1.42` is still YOUR machine,
just accessed by its network IP instead of `localhost`.

---

### Step 9 — The Full Network Test

Your coworker opens their browser and navigates to:
```
http://192.168.1.42:9000/index.html
```
(or opens the file from USB/shared folder)

They type their name and click JOIN GAME.

**You should see in the terminal:**
```
[their name] connected. Players: ['Alice', 'Bob']
```
Or, if they joined first:
```
[their name] connected. Players: ['their name']
Game started! 41 cards remain in deck.
```

**Your coworker should see:** The join screen, then (after you join) the game table
with their hand.

**You should see:** Your hand — different cards from your coworker's.

Both screens show the same top card on the discard pile.

Play a card. Your coworker's screen updates in real time.
Your coworker plays a card. Your screen updates.

**If it does not work, check these things in order:**
1. Are both computers on the same WiFi network? (Not one on WiFi, one on ethernet to a different router)
2. Is the server running with `--host 0.0.0.0`?
3. Did you add the firewall exception for port 8000?
4. Is `config.js` updated with your correct IP?
5. Can you ping your machine from the coworker's machine? (`ping 192.168.1.42`)

---

## PART 5 — Optional: Room System

If more than one pair of coworkers wants to play simultaneously, the current
server only supports one game at a time. This part adds rooms.

### Concept: Rooms — Multiple Independent Game States

**What it is:** Instead of one global `game` dict, a dict of game dicts —
one per room. Players connect to a specific room and only interact with
players in that room.

**The problem without rooms:**
If Alice and Bob are playing, and Carol and Dave try to join, Dave's connection
triggers another `deal_game()` — resetting Alice and Bob's game mid-play.
The single `game` dict cannot handle multiple simultaneous games.

**The solution:**
```python
# Instead of:
game = { 'deck': [], 'hands': {}, ... }

# Use:
rooms = {}   # {'room1': { 'deck': [], 'hands': {}, ... }, 'room2': { ... }}
```

The WebSocket URL includes the room ID:
```
ws://192.168.1.42:8000/ws/room1/Alice
ws://192.168.1.42:8000/ws/room2/Carol
```

Alice and Bob's game is in `rooms['room1']`. Carol and Dave's is in `rooms['room2']`.
They never interfere.

**Canonical example (General Explanation):**
A hotel with multiple conference rooms. Each room runs its own meeting independently.
What happens in Room 101 does not affect Room 102. The hotel manages all rooms
but each is self-contained. `rooms` is the hotel. Each game dict is a conference room.

**Project Application (The "Why" here):**
Each room has its own deck, hands, players, discard pile, and rule state.
`make_room()` creates a fresh game dict for a new room. The WebSocket handler
looks up the right room by ID and operates only on that room's state.
Players joining different rooms never interact.

---

### Step 10 — Add the rooms Dict and make_room()

Open `main.py`. Find the `game` dict. Add BELOW it (do not replace it yet):

```python
game = { ... }    # existing — will be removed after testing

rooms = {}    # ← add this line
# Will hold {room_id: game_state_dict}
# Each room is an independent game with its own players, deck, and state
```

After `rooms = {}`, add the `make_room` function:

```python
rooms = {}


def make_room() -> dict:    # ← add from here
    return {
        'deck':          [],
        'hands':         {},
        'discard':       [],
        'players':       {},
        'whose_turn':    None,
        'started':       False,
        'rule_state':    {},
        'scores':        {},
        'rematch_votes': set(),
    }
    # Returns a fresh game state dict — same structure as the global `game` dict.
    # Called when the first player joins a new room.
    # All rooms start with the same empty state.
                             # ← add to here
```

**Why a function instead of just `dict(game)`:** `dict(game)` would create a
shallow copy — mutable values like `hands: {}` would be shared between rooms.
Modifying `rooms['room1']['hands']` would also change `rooms['room2']['hands']`.
`make_room()` creates completely new, independent dicts every time. No shared state.

### SAVE AND TRY

```
python
```

```python
from main import make_room

room1 = make_room()
room2 = make_room()

# Verify they are independent
room1['scores']['Alice'] = 50
print('room1 scores:', room1['scores'])
print('room2 scores:', room2['scores'])
# Expected:
# room1 scores: {'Alice': 50}
# room2 scores: {}   ← not affected by room1 change
```

Type `exit()`.

---

### Step 11 — Add a Room-Aware WebSocket Route

Add a new WebSocket route below the existing `@app.websocket("/ws/{player_name}")` route.
Keep the old route — you will test both:

```python
@app.websocket("/ws/{player_name}")
async def websocket_endpoint(websocket, player_name):
    ...    # existing route — unchanged


@app.websocket("/ws/{room_id}/{player_name}")    # ← add from here
async def room_websocket_endpoint(
    websocket:   WebSocket,
    room_id:     str,
    player_name: str
):
    """
    Room-aware WebSocket endpoint.
    URL: ws://host:8000/ws/room1/Alice
    room_id:     which game room to join (e.g. 'room1', 'shop-floor', 'break-room')
    player_name: this player's display name
    """

    await websocket.accept()

    # Get or create the room
    if room_id not in rooms:
        rooms[room_id] = make_room()
        print(f"Room '{room_id}' created")
    # If room already exists, the second player joins the existing room

    room = rooms[room_id]
    # All operations below use 'room' instead of 'game'
    # This is the ONLY change needed — the logic is identical to the single-room version

    # Check for duplicate names within this room
    if player_name in room['players']:
        await websocket.send_text(json.dumps({
            'type':    'error',
            'message': f'Name "{player_name}" is already taken in room "{room_id}"'
        }))
        await websocket.close()
        return

    room['players'][player_name] = websocket
    print(f"{player_name} joined room '{room_id}'. Players: {list(room['players'].keys())}")

    if len(room['players']) < 2:
        await websocket.send_text(json.dumps({
            'type':    'waiting',
            'message': f'Waiting for opponent in room "{room_id}"...'
        }))

    elif len(room['players']) == 2 and not room['started']:
        # Deal for this room using the room's state
        room['deck']          = make_deck()
        room['discard']       = []
        room['started']       = True
        room['rule_state']    = {}
        room['rematch_votes'] = set()

        player_ids = list(room['players'].keys())
        for player_id in player_ids:
            if player_id not in room['scores']:
                room['scores'][player_id] = 0
            hand = []
            for _ in range(5):
                hand.append(room['deck'].pop())
            room['hands'][player_id] = hand

        top_card = room['deck'].pop()
        room['discard'].append(top_card)
        room['whose_turn'] = player_ids[0]

        # Send dealt messages
        for pid in room['players']:
            opp_id = [p for p in player_ids if p != pid][0]
            await room['players'][pid].send_text(json.dumps({
                'type':           'dealt',
                'your_hand':      room['hands'][pid],
                'opponent_name':  opp_id,
                'opponent_count': len(room['hands'][opp_id]),
                'top_card':       room['discard'][-1],
                'whose_turn':     room['whose_turn'],
                'deck_count':     len(room['deck']),
                'scores':         dict(room['scores']),
                'active_suit':    None,
            }))

        print(f"Room '{room_id}' game started. Deck: {len(room['deck'])} cards")

    async def send_room(pid, message):
        ws = room['players'].get(pid)
        if ws:
            await ws.send_text(json.dumps(message))
    # Local helper — same as global send_to() but uses 'room' dict

    try:
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)

            # All the same message handlers as the single-room version
            # but using 'room' instead of 'game' throughout

            if data['type'] == 'play':
                card = {'rank': data['rank'], 'suit': data['suit'], 'color': data.get('color', '')}
                legal, reason = rules.is_legal_play(room, player_name, card)

                if not legal:
                    await websocket.send_text(json.dumps({'type': 'illegal', 'reason': reason}))
                else:
                    # Execute play within this room
                    hand = room['hands'][player_name]
                    for i, c in enumerate(hand):
                        if c['rank'] == card['rank'] and c['suit'] == card['suit']:
                            hand.pop(i)
                            break
                    room['discard'].append(card)

                    player_ids    = list(room['players'].keys())
                    current_index = player_ids.index(player_name)
                    next_index    = (current_index + 1) % len(player_ids)

                    side_effects = rules.on_card_played(room, player_name, card)
                    action       = f"{player_name} played {card['rank']}{card['suit']}"

                    # Check game over within this room
                    over, winner = False, None
                    for pid, h in room['hands'].items():
                        if len(h) == 0:
                            over, winner = True, pid
                            break

                    if over:
                        deltas = rules.calculate_scores(room, winner)
                        for pid, delta in deltas.items():
                            room['scores'][pid] = room['scores'].get(pid, 0) + delta
                        room['started'] = False

                        loser_hands = {pid: room['hands'][pid] for pid in room['players'] if pid != winner}
                        for pid in room['players']:
                            await send_room(pid, {
                                'type':        'game_over',
                                'winner':      winner,
                                'message':     f'{winner} wins!',
                                'scores':      dict(room['scores']),
                                'score_delta': deltas[pid],
                                'loser_hands': loser_hands,
                            })

                    elif side_effects.get('requires_suit_choice'):
                        await send_room(player_name, {'type': 'choose_suit', 'last_action': action + ' — choose a suit'})
                        for pid in room['players']:
                            if pid != player_name:
                                opp = [p for p in player_ids if p != pid][0]
                                await send_room(pid, {
                                    'type': 'game_update',
                                    'your_hand': room['hands'][pid],
                                    'opponent_name': opp,
                                    'opponent_count': len(room['hands'][opp]),
                                    'top_card': room['discard'][-1],
                                    'whose_turn': room['whose_turn'],
                                    'last_action': action + ' — choosing suit',
                                    'deck_count': len(room['deck']),
                                    'scores': dict(room['scores']),
                                    'active_suit': room.get('rule_state', {}).get('active_suit'),
                                })
                    else:
                        room['whose_turn'] = player_ids[next_index]
                        for pid in room['players']:
                            opp = [p for p in player_ids if p != pid][0]
                            await send_room(pid, {
                                'type': 'game_update',
                                'your_hand': room['hands'][pid],
                                'opponent_name': opp,
                                'opponent_count': len(room['hands'][opp]),
                                'top_card': room['discard'][-1],
                                'whose_turn': room['whose_turn'],
                                'last_action': action,
                                'deck_count': len(room['deck']),
                                'scores': dict(room['scores']),
                                'active_suit': room.get('rule_state', {}).get('active_suit'),
                            })

            elif data['type'] == 'draw':
                if not room['deck']:
                    await websocket.send_text(json.dumps({'type': 'illegal', 'reason': 'Draw pile is empty'}))
                else:
                    drawn = room['deck'].pop()
                    room['hands'][player_name].append(drawn)
                    player_ids    = list(room['players'].keys())
                    current_index = player_ids.index(player_name)
                    next_index    = (current_index + 1) % len(player_ids)
                    room['whose_turn'] = player_ids[next_index]
                    action = f"{player_name} drew a card"
                    for pid in room['players']:
                        opp = [p for p in player_ids if p != pid][0]
                        await send_room(pid, {
                            'type': 'game_update',
                            'your_hand': room['hands'][pid],
                            'opponent_name': opp,
                            'opponent_count': len(room['hands'][opp]),
                            'top_card': room['discard'][-1],
                            'whose_turn': room['whose_turn'],
                            'last_action': action,
                            'deck_count': len(room['deck']),
                            'scores': dict(room['scores']),
                            'active_suit': room.get('rule_state', {}).get('active_suit'),
                        })

            elif data['type'] == 'choose_suit':
                ok, reason = rules.apply_suit_choice(room, player_name, data.get('suit', ''))
                if not ok:
                    await websocket.send_text(json.dumps({'type': 'illegal', 'reason': reason}))
                else:
                    player_ids    = list(room['players'].keys())
                    current_index = player_ids.index(player_name)
                    next_index    = (current_index + 1) % len(player_ids)
                    room['whose_turn'] = player_ids[next_index]
                    action = f"{player_name} chose {data.get('suit', '')}"
                    for pid in room['players']:
                        opp = [p for p in player_ids if p != pid][0]
                        await send_room(pid, {
                            'type': 'game_update',
                            'your_hand': room['hands'][pid],
                            'opponent_name': opp,
                            'opponent_count': len(room['hands'][opp]),
                            'top_card': room['discard'][-1],
                            'whose_turn': room['whose_turn'],
                            'last_action': action,
                            'deck_count': len(room['deck']),
                            'scores': dict(room['scores']),
                            'active_suit': room.get('rule_state', {}).get('active_suit'),
                        })

            elif data['type'] == 'rematch':
                room['rematch_votes'].add(player_name)
                if len(room['rematch_votes']) == len(room['players']):
                    room['deck']          = make_deck()
                    room['discard']       = []
                    room['started']       = True
                    room['rule_state']    = {}
                    room['rematch_votes'] = set()

                    player_ids = list(room['players'].keys())
                    for pid in player_ids:
                        hand = []
                        for _ in range(5):
                            hand.append(room['deck'].pop())
                        room['hands'][pid] = hand
                    room['discard'].append(room['deck'].pop())
                    room['whose_turn'] = player_ids[0]

                    for pid in room['players']:
                        opp = [p for p in player_ids if p != pid][0]
                        await send_room(pid, {
                            'type': 'dealt',
                            'your_hand': room['hands'][pid],
                            'opponent_name': opp,
                            'opponent_count': len(room['hands'][opp]),
                            'top_card': room['discard'][-1],
                            'whose_turn': room['whose_turn'],
                            'deck_count': len(room['deck']),
                            'scores': dict(room['scores']),
                            'active_suit': None,
                        })
                else:
                    remaining = len(room['players']) - len(room['rematch_votes'])
                    await websocket.send_text(json.dumps({'type': 'waiting_rematch', 'message': f'Waiting for {remaining} more...'}))

    except WebSocketDisconnect:
        print(f"{player_name} left room '{room_id}'")
        del room['players'][player_name]
        for pid in room['players']:
            await send_room(pid, {'type': 'opponent_left', 'message': f'{player_name} disconnected'})
        room['started']    = False
        room['hands']      = {}
        room['deck']       = []
        room['discard']    = []
        room['whose_turn'] = None

        if len(room['players']) == 0:
            del rooms[room_id]
            print(f"Room '{room_id}' removed — no players remaining")
                                                    # ← add to here
```

**Why the room route duplicates logic from the single-room route:**
Refactoring both routes to share helper functions would be cleaner,
but introduces more complexity. For a development server used on a local
network, duplication is acceptable. If you want to refactor, extract
the message-handling logic into functions that take `room` as a parameter —
both routes call the same functions with their respective room dict.

---

### Step 12 — Update config.js for Rooms

In `config.js`, add a room ID constant:

```javascript
const SERVER_HOST = '192.168.1.42'    // existing

const ROOM_ID = 'shop-floor'    // ← add this line
// All players who use this config will join the same room.
// Change to a different name to create a separate game.
// Examples: 'break-room', 'game-1', 'friday-game'
```

**Why a configurable room ID:** You and your coworker need to be in the SAME room.
Putting the room ID in config.js means you both use the same file with the same
room name — they connect to your room automatically.

---

### Step 13 — Update connectToServer() to Use the Room URL

In `index.html`, find `connectToServer()`. Find the WebSocket creation line:

```javascript
            socket = new WebSocket(`${SERVER_WS}/${name}`)
            // was: ws://host:8000/ws/Alice
```

Replace with:

```javascript
            const roomUrl = typeof ROOM_ID !== 'undefined'
                ? `${SERVER_WS}/${ROOM_ID}/${name}`
                : `${SERVER_WS}/${name}`
            // If ROOM_ID is defined in config.js, use the room URL.
            // If ROOM_ID is not defined, fall back to the original single-room URL.
            // typeof check prevents ReferenceError if config.js didn't define ROOM_ID.

            socket = new WebSocket(roomUrl)
            // was: new WebSocket(`${SERVER_WS}/${name}`)
```

**Why `typeof ROOM_ID !== 'undefined'` instead of just `if (ROOM_ID)`:**
If `ROOM_ID` is not defined at all (not in config.js), accessing it directly
throws `ReferenceError: ROOM_ID is not defined`. The `typeof` check is safe
even for completely undefined variables — it returns the string `'undefined'`
rather than throwing. This makes the room feature opt-in without breaking
existing configs that don't define `ROOM_ID`.

### SAVE AND TRY

Restart the server:
```
uvicorn main:app --reload --host 0.0.0.0
```

Open two tabs. Join as Alice and Bob.

**In the terminal you should see:**
```
Room 'shop-floor' created
Alice joined room 'shop-floor'. Players: ['Alice']
Bob joined room 'shop-floor'. Players: ['Alice', 'Bob']
Room 'shop-floor' game started. Deck: 41 cards remaining
```

Play a full game, including a rematch. Everything works as before — but now
inside an isolated room.

Now test multiple rooms:

In `config.js`, change `ROOM_ID = 'shop-floor'` to `ROOM_ID = 'break-room'`.
Open two MORE tabs. Join as Carol and Dave.

**In the terminal:**
```
Room 'break-room' created
Carol joined room 'break-room'. Players: ['Carol']
Dave joined room 'break-room'. Players: ['Carol', 'Dave']
Room 'break-room' game started.
```

Now four players are connected to the same server in two independent games.
Playing a card in the Alice/Bob game does not affect Carol/Dave's game.

---

## 🎯 Challenge: Show the Room ID in the Game Table

**You know:** `ROOM_ID` is defined in `config.js` and available in the
JavaScript. The game table has a header area with the "CRAZY EIGHTS" title.

**Task:** Add a small room indicator to the game table header so players know
which room they are in. Example: the header shows:

```
CRAZY EIGHTS                    [ROOM: shop-floor]     [ ☀ LIGHT ]
```

The room indicator should be styled differently from the main title —
smaller, muted color.

**Where to add it:** In the HTML, add a span inside the table header.
In the script, set its `textContent` to `ROOM_ID` (or "LOCAL" if `ROOM_ID` is undefined).

---

<details>
<summary>▶ Show Solution</summary>

**In the HTML, find the game table header area and add a room label:**
```html
        <!-- Inside #game-table, near the top -->
        <div style="display:flex; justify-content:space-between; align-items:center">
            <span style="font-family:'Courier New',monospace;font-size:12px;
                         color:var(--color-accent);letter-spacing:0.2em">
                CRAZY EIGHTS
            </span>
            <span id="room-label"
                  style="font-family:'Courier New',monospace;font-size:9px;
                         color:var(--color-muted);letter-spacing:0.1em">
            </span>
            <button id="modeBtn">☀ LIGHT</button>
        </div>
```

**In the script, in `showGameTable()`, after hiding the join screen:**
```javascript
        function showGameTable(message) {
            joinScreen.style.display = 'none'
            gameTable.style.display  = 'flex'

            const roomLabel = document.getElementById('room-label')
            if (roomLabel) {
                const roomName = typeof ROOM_ID !== 'undefined' ? ROOM_ID : 'LOCAL'
                roomLabel.textContent = `ROOM: ${roomName}`
            }

            renderTable(message)
        }
```

**Key insight:** `typeof ROOM_ID !== 'undefined'` is used here for the same
reason as in `connectToServer()` — safe access to a variable that might not
exist. Defensive checks like this prevent errors from propagating when config
is incomplete. Better to show "ROOM: LOCAL" than to crash with a ReferenceError.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Local IP found | `ipconfig` shows IPv4 address for Wi-Fi or Ethernet |
| Server binds to all interfaces | `uvicorn ... --host 0.0.0.0` → logs `0.0.0.0:8000` |
| Server reachable by IP | Open `http://192.168.x.x:8000/docs` → FastAPI docs page |
| Firewall exception added | `netsh ... show rule name="Card Engine Dev"` shows the rule |
| config.js loads | DevTools Console: `SERVER_HOST` returns the configured value |
| SERVER_WS uses config | DevTools Console: `SERVER_WS` returns the correct ws:// URL |
| Two-tab test still works | Open two tabs with network IP config — game starts correctly |
| Coworker connects | Coworker opens index.html, joins — terminal shows their connection |
| Cards dealt to both | Both machines see different face-up hands, same discard card |
| Real-time play works | Play a card — coworker's screen updates within 1 second |
| Room system creates rooms | Join with ROOM_ID set — terminal shows room creation |
| Two rooms independent | Alice+Bob in room1, Carol+Dave in room2 — separate games |
| Empty room is cleaned up | Both players in a room disconnect — `del rooms[room_id]` fires |

---

## Quick Check Answers

**1. Why would `localhost` not work on your coworker's PC?**
`localhost` is a special hostname that always resolves to `127.0.0.1` on
whichever machine evaluates it. On your coworker's PC, `localhost` resolves
to their own `127.0.0.1` — their machine's loopback address, not yours.
Their browser would try to connect to a server on THEIR computer, which
does not exist. `localhost` never crosses a network boundary — it always
means "this machine."

**2. What is `127.0.0.1` and why can only your own computer reach it?**
`127.0.0.1` is the loopback address — a virtual network interface that exists
only in software. Traffic sent to `127.0.0.1` is immediately delivered back
to the same machine without leaving the network stack. The operating system
never puts this traffic on the physical network (the WiFi card or ethernet port),
so no other device ever sees it. When uvicorn binds to `127.0.0.1`, it is
telling the OS "only deliver connections that came in on the loopback interface,"
which means only connections from the same machine.

**3. Which address would your coworker use to reach you?**
Your local network IP address — typically in the `192.168.x.x` or `10.x.x.x`
range. This is the address your router assigned to your machine when you
connected to the WiFi. It is routable within the local network — your router
knows how to deliver packets addressed to `192.168.1.42` to your specific
machine. Your coworker uses this address as long as you are both on the same
network. The address changes when you connect to a different network, which
is why `config.js` lets you update it without changing the server code.

---

## What's Next

The complete card engine is built:
- G1: Card rendering, CSS variables, light/dark mode
- G2: WebSocket server, two-player connection, real deck
- G3: Card plays, validation, turn switching
- G4: Crazy Eights rules as a plugin, wild 8s, suit picker
- G5: Scoring, rematches, persistent scores
- G6: Local network play, rooms for multiple games

**Possible expansions from here:**

**Add a new game:** Create `go_fish.py` with the three plugin functions.
Change `import crazy_eights as rules` to `import go_fish as rules` in `main.py`.
The engine, network layer, and frontend all stay the same.

**Add MongoDB:** Store game results and player statistics. Lab 01 taught you
the basics — apply that knowledge to save `game['scores']` to a database
so scores persist even after the server restarts.

**Add TypeScript:** Convert `index.html`'s script block to a proper TypeScript
React app. The `renderCard()` and `renderTable()` functions become React
components. The WebSocket logic becomes a custom hook. This is the React lab
series that follows naturally from here.

**Return to the G-code analyzer:** Everything you learned in this series —
WebSockets, plugin architecture, CSS variables, incremental rendering —
applies directly to building a real-time G-code visualization tool.

---

*Lab G6 complete. The game runs on your local network. Multiple rooms supported.*
*The series is done. Go build something.*
