# Card Engine — LAB G3 — Play a Card

**Prerequisites:** Lab G2 complete. Two players connect, cards are dealt,
both screens show the correct hands. WebSocket connection is open and working.

**What this lab adds:**
- Click a card in your hand to attempt to play it
- The server validates the play (does it match suit or rank?)
- Legal play: card leaves your hand, appears on discard pile — on BOTH screens
- Illegal play: card shakes, stays in your hand, status bar shows why
- Draw a card when you have nothing playable
- Turn switches after a legal play

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you click a card, your browser needs to tell the server which card you played.
>    The server needs enough information to find that card in your hand and remove it.
>    What information would be enough to uniquely identify a card?
> 2. The server must check if a play is legal before accepting it.
>    In Crazy Eights (ignoring 8s for now), what makes a play legal?
> 3. After a legal play, BOTH players' screens must update.
>    You already know how the server sends messages to players.
>    What should the message contain so both screens can update correctly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
BEFORE (Lab G2):        AFTER (Lab G3):
Cards on screen         Click a card → it plays
No interaction          Illegal card shakes
                        Turn switches
                        Draw button works
                        Both screens update in real time
```

The visual update on both screens, triggered by one click in one browser —
this is the moment the game becomes real.

---

## PART 1 — Design the New Messages

Before writing code, extend the protocol you defined in Lab G2.

**New messages you need:**

**Client → Server: play a card**
```json
{ "type": "play", "rank": "7", "suit": "♥" }
```
Rank + suit together uniquely identify a card. (There's only one 7♥ in a deck.)

**Client → Server: draw a card**
```json
{ "type": "draw" }
```

**Server → Both clients: game updated**
```json
{
    "type": "game_update",
    "your_hand": [...],
    "opponent_count": 4,
    "top_card": {"rank": "7", "suit": "♥", "color": "red"},
    "whose_turn": "Bob",
    "last_action": "Alice played 7♥"
}
```

**Server → One client: illegal play**
```json
{
    "type": "illegal",
    "reason": "Must match suit ♥ or rank Q"
}
```

Note that `game_update` goes to BOTH players but contains each player's
own hand (same field name `your_hand`, different values per player).
The server sends two separate `game_update` messages — one to each player,
each containing that player's specific hand data.

---

## PART 2 — Server Changes

### Concept: Validating a Move

**What it means:** The server checks whether a requested action is allowed
before executing it. This is non-negotiable — never trust the client.

**Why the client can't validate itself:**
A player could open DevTools and send:
```javascript
socket.send(JSON.stringify({ type: "play", rank: "A", suit: "♠" }))
```
...even if they don't have the A♠ in their hand. The client-side "disabled"
state on cards is a courtesy to the user, not a security measure.
The server must independently verify every action.

**The two checks for a legal play in Crazy Eights (ignoring 8s for now):**
1. Is it the player's turn?
2. Does the card match the top discard card's suit OR rank?

```
Top card is Q♥.
Legal plays: any ♥ (same suit) OR any Q (same rank)
Illegal plays: A♠, 7♦, J♣ — neither ♥ nor Q
```

**The check in Python:**
```python
top = game['discard'][-1]           # the current top card
card_matches = (
    card['suit'] == top['suit'] or   # same suit
    card['rank'] == top['rank']      # same rank
)
```

### Step 1 — Add the Validation Function

Open `backend/main.py`. Add this function after `deal_game()`:

```python
def is_legal_play(player_id: str, card: dict) -> tuple:
    """
    Check whether a player's attempted card play is legal.

    Returns a tuple: (is_legal: bool, reason: str)
    The reason explains WHY it's illegal — shown to the player.

    tuple means the function returns two values at once:
        legal, reason = is_legal_play(player_id, card)
    """

    # Check 1: Is it this player's turn?
    if game['whose_turn'] != player_id:
        return False, "It's not your turn"
        # return exits immediately — no need for elif

    # Check 2: Does the player actually have this card?
    hand = game['hands'][player_id]
    card_in_hand = any(
        c['rank'] == card['rank'] and c['suit'] == card['suit']
        for c in hand
    )
    # any() returns True if ANY item in the iterable is True
    # The generator expression checks each card c in hand:
    # "does c have the same rank AND suit as the played card?"
    if not card_in_hand:
        return False, "You don't have that card"

    # Check 3: Does it match the top discard card?
    top = game['discard'][-1]
    # [-1] = last item in the list = top of the discard pile

    matches_suit = card['suit'] == top['suit']
    matches_rank = card['rank'] == top['rank']

    if not (matches_suit or matches_rank):
        return False, f"Must match suit {top['suit']} or rank {top['rank']}"
        # f-string: f"Must match suit ♥ or rank Q" — actual values inserted

    return True, "OK"
    # Legal! Reason is "OK" — the server won't use this but it's good practice
    # to always return the same shape from a function.
```

### SAVE AND TRY — Test validation in Python

```
python
```

```python
from main import game, deal_game, is_legal_play

# Set up a test game
game['players']['Alice'] = None
game['players']['Bob'] = None
deal_game()

# See what Alice has and what the top card is
print("Alice's hand:", game['hands']['Alice'])
print("Top of discard:", game['discard'][-1])
print("Whose turn:", game['whose_turn'])
```

Now test the validator:
```python
# Try a card Alice doesn't have (almost certainly)
fake_card = {'rank': 'Z', 'suit': '★', 'color': 'red'}
result = is_legal_play('Alice', fake_card)
print("Fake card:", result)
# Expected: (False, "You don't have that card")

# Try playing out of turn
result = is_legal_play('Bob', game['hands']['Bob'][0])
print("Out of turn:", result)
# Expected: (False, "It's not your turn") — Alice goes first
```

Type `exit()`.

---

### Step 2 — Add the Play and Draw Handlers

Now add the functions that actually execute a legal move.
Add them after `is_legal_play()`:

```python
def execute_play(player_id: str, card: dict):
    """
    Remove the played card from the player's hand and add it to discard.
    Then switch the turn to the other player.
    Assumes the play has already been validated as legal.
    """

    hand = game['hands'][player_id]

    # Remove the card from the player's hand
    # We find the card by matching rank AND suit, then remove it
    for i, c in enumerate(hand):
        # enumerate() gives both the index (i) and the value (c)
        # for i=0, c=first card; for i=1, c=second card; etc.
        if c['rank'] == card['rank'] and c['suit'] == card['suit']:
            hand.pop(i)
            # .pop(i) removes the item at position i
            break
            # break exits the loop immediately — no need to check remaining cards

    # Add to discard pile
    game['discard'].append(card)

    # Switch turn to the other player
    player_ids = list(game['players'].keys())
    current_index = player_ids.index(player_id)
    # .index() finds the position of player_id in the list
    next_index = (current_index + 1) % len(player_ids)
    # % (modulo) wraps around: if current is last player, next is first
    # With 2 players: (0+1)%2=1, (1+1)%2=0 — alternates between 0 and 1
    game['whose_turn'] = player_ids[next_index]


def execute_draw(player_id: str) -> dict | None:
    """
    Give the player the top card from the draw pile.
    Returns the drawn card, or None if the deck is empty.
    """

    if not game['deck']:
        # Empty deck — in a full game you'd reshuffle the discard pile
        # For now, return None to signal "can't draw"
        return None

    drawn_card = game['deck'].pop()
    # .pop() removes and returns the last card — the "top" of the face-down deck

    game['hands'][player_id].append(drawn_card)
    # Add it to the player's hand

    # Drawing does NOT switch the turn — player must then play or draw again
    # (In Crazy Eights you draw until you can play or choose to pass)
    # For simplicity in this lab, drawing passes the turn
    player_ids = list(game['players'].keys())
    current_index = player_ids.index(player_id)
    next_index = (current_index + 1) % len(player_ids)
    game['whose_turn'] = player_ids[next_index]

    return drawn_card


def build_update_message(player_id: str, last_action: str) -> dict:
    """
    Build the game_update message for a specific player.
    Each player gets their own hand — the message is personalized.
    """
    player_ids = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]

    return {
        'type':           'game_update',
        'your_hand':      game['hands'][player_id],
        'opponent_count': len(game['hands'][opponent_id]),
        'top_card':       game['discard'][-1],
        'whose_turn':     game['whose_turn'],
        'last_action':    last_action,
        # last_action is a human-readable string: "Alice played 7♥"
        # displayed in the status bar so both players know what happened
    }
```

### SAVE AND TRY — Test execute_play

```
python
```

```python
from main import game, deal_game, is_legal_play, execute_play

game['players']['Alice'] = None
game['players']['Bob'] = None
deal_game()

print("Before - Alice hand size:", len(game['hands']['Alice']))
print("Before - Discard size:", len(game['discard']))
print("Before - Whose turn:", game['whose_turn'])

# Find a card Alice can legally play
top = game['discard'][-1]
alice_hand = game['hands']['Alice']
playable = [c for c in alice_hand if c['suit'] == top['suit'] or c['rank'] == top['rank']]
print("Playable cards for Alice:", playable)
```

If `playable` is not empty:
```python
card_to_play = playable[0]
execute_play('Alice', card_to_play)

print("After - Alice hand size:", len(game['hands']['Alice']))
print("After - Discard top:", game['discard'][-1])
print("After - Whose turn:", game['whose_turn'])
```

**Expected:**
- Alice's hand: 4 cards (was 5, played 1)
- Discard top: the card Alice just played
- Whose turn: Bob

Type `exit()`.

---

### Step 3 — Handle Messages in the WebSocket Loop

Now wire the validation and execution into the WebSocket message loop.
In `main.py`, find the `while True:` loop inside `websocket_endpoint`.

Replace:
```python
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            print(f"Message from {player_name}: {data}")
```

With:
```python
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            # data is now a Python dict: {"type": "play", "rank": "7", "suit": "♥"}

            if data['type'] == 'play':
                card = {'rank': data['rank'], 'suit': data['suit'], 'color': data.get('color', '')}
                # .get('color', '') — use color if sent, empty string if not
                # The server recalculates color anyway — we store it for completeness

                legal, reason = is_legal_play(player_name, card)
                # Unpack the tuple: legal=True/False, reason=string

                if not legal:
                    # Tell only this player their play was rejected
                    await websocket.send_text(json.dumps({
                        'type':   'illegal',
                        'reason': reason
                    }))

                else:
                    # Execute the play
                    execute_play(player_name, card)
                    action = f"{player_name} played {card['rank']}{card['suit']}"

                    # Send updated state to BOTH players
                    for pid in game['players']:
                        await send_to(pid, build_update_message(pid, action))

            elif data['type'] == 'draw':
                drawn = execute_draw(player_name)

                if drawn is None:
                    await websocket.send_text(json.dumps({
                        'type':    'illegal',
                        'reason': 'Draw pile is empty'
                    }))
                else:
                    action = f"{player_name} drew a card"

                    # Send updated state to BOTH players
                    for pid in game['players']:
                        await send_to(pid, build_update_message(pid, action))

            else:
                print(f"Unknown message type from {player_name}: {data['type']}")
```

### SAVE AND TRY — Server handles messages

Restart the server (it may have auto-reloaded with `--reload`).
Open two browser tabs, join as Alice and Bob.

In Alice's tab, open DevTools Console (F12) and type:
```javascript
socket.send(JSON.stringify({ type: "play", rank: "Z", suit: "★" }))
```

**In the console:** Nothing visual yet (frontend doesn't handle the response yet).
**In the terminal:** Server received the message, called `is_legal_play`,
should have logged or processed it.

The server handles the logic. Now the frontend needs to handle the responses.

---

## PART 3 — Frontend Changes

### Concept: The Card Click → Server Message → Screen Update Loop

The full sequence for a card play:

```
1. Player clicks a card in their hand
   (JavaScript click handler fires)

2. Browser sends message to server:
   { type: "play", rank: "7", suit: "♥" }

3. Server receives message
   Validates: is it their turn? do they have it? does it match?

4a. If ILLEGAL:
    Server sends { type: "illegal", reason: "..." } back to THIS player only
    Frontend: card animates (shake), status bar shows reason

4b. If LEGAL:
    Server executes the play (removes card, adds to discard, switches turn)
    Server sends { type: "game_update", ... } to BOTH players
    Both frontends: re-render hands, discard pile, turn indicator
```

The frontend never directly modifies game state — it only sends requests
and reacts to what the server sends back. This is the pattern from Lab G2's
"single source of truth" concept applied in action.

### Concept: CSS Animation with `@keyframes`

**What it is:** A way to define a multi-step animation in CSS and trigger it
by adding a class to an element.

**The problem without it:**
To shake a card, you'd need JavaScript to manually move it left, then right,
then left, then right — in a loop with `setTimeout`. Fragile and verbose.

**The solution:**

```css
@keyframes shake {
    0%   { transform: translateX(0); }
    25%  { transform: translateX(-6px); }
    50%  { transform: translateX(6px); }
    75%  { transform: translateX(-6px); }
    100% { transform: translateX(0); }
}

.card.illegal {
    animation: shake 0.3s ease;
}
```

`@keyframes` defines what happens at each percentage of the animation's duration.
Adding the `.illegal` class triggers the animation.

**The trick to re-triggering:** If you add the class, remove it, then add it again,
the animation doesn't restart — the browser sees the class is already there.
The fix: remove the class, force a reflow (read a layout property), then add it back.

```javascript
card.classList.remove('illegal')
void card.offsetWidth        // reading offsetWidth forces the browser to recalculate layout
card.classList.add('illegal') // animation starts fresh
```

`void` discards the return value — we only care about the side effect (the reflow).

**Watch for:** Animations defined with `animation:` only play once by default.
Add `animation-fill-mode: forwards` if you want the end state to persist.
Your shake animation returns to the original position, so you don't need this.

---

### Step 4 — Add the Shake Animation and Draw Button

Add to your CSS:

```css
        @keyframes shake {
            0%   { transform: translateY(-18px); }
            /* start from the hovered position so it shakes while lifted */
            20%  { transform: translateY(-18px) translateX(-6px); }
            40%  { transform: translateY(-18px) translateX(6px); }
            60%  { transform: translateY(-18px) translateX(-6px); }
            80%  { transform: translateY(-18px) translateX(6px); }
            100% { transform: translateY(-18px) translateX(0); }
        }

        .card.illegal {
            animation: shake 0.35s ease;
            outline: 2px solid var(--color-red);
            /* red border flashes briefly during the shake */
        }

        .draw-btn {
            padding: 8px 20px;
            background: transparent;
            border: 1px solid var(--color-accent);
            color: var(--color-accent);
            font-family: 'Courier New', monospace;
            font-size: 11px;
            letter-spacing: 0.1em;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 8px;
            display: block;
            width: fit-content;
        }

        .draw-btn:disabled {
            opacity: 0.35;
            cursor: not-allowed;
        }
```

Add the draw button to your HTML, inside the draw pile group:

```html
            <div class="pile-group">
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
                <button class="draw-btn" id="drawBtn">DRAW</button>  <!-- ← ADD -->
            </div>
```

---

### Step 5 — Make Cards Clickable

Update your `<script>`. Find the `showGameTable` function.

After setting `playerHandEl.innerHTML`, add the click handler wiring:

```javascript
        function showGameTable(message) {
            joinScreen.style.display = 'none'
            gameTable.style.display  = 'flex'

            updateTable(message)
            // Pull the rendering into its own function — you'll call it
            // on both 'dealt' and 'game_update' messages
        }


        function updateTable(message) {
            // Renders the current game state into the DOM.
            // Called whenever the server sends 'dealt' or 'game_update'.

            // Opponent hand (face down)
            const oppName = message.opponent_name || 'OPPONENT'
            oppLabel.textContent = `${oppName} — ${message.opponent_count} CARDS`
            oppHandEl.innerHTML = Array(message.opponent_count)
                .fill(null)
                .map(() => renderCardBack())
                .join('')

            // Draw pile visual
            drawEl.innerHTML = `
                <div class="draw-stack">
                    ${Array(Math.min(3, message.deck_count || 3)).fill(null).map(() => renderCardBack()).join('')}
                </div>
            `
            // Math.min(3, ...) — show at most 3 cards in the visual stack
            // even if 41 remain — it's visual shorthand, not a literal count

            // Discard pile
            discardEl.innerHTML = renderCard(message.top_card)

            // Your hand — with click handlers
            yourLabel.textContent = `${myName} — ${message.your_hand.length} CARDS`
            playerHandEl.innerHTML = message.your_hand
                .map(card => renderCard(card))
                .join('')

            // Wire click handlers to each card
            const isMyTurn = message.whose_turn === myName
            const cardEls = playerHandEl.querySelectorAll('.card')

            cardEls.forEach((cardEl, index) => {
                const card = message.your_hand[index]
                // index matches: first card element = first card in hand

                cardEl.addEventListener('click', () => {
                    if (!isMyTurn) {
                        // Not your turn — show shake but don't send to server
                        shakeCard(cardEl)
                        statusBar.textContent = "Wait for your turn"
                        return
                    }
                    playCard(card, cardEl)
                })
            })

            // Draw button — only enabled on your turn
            drawBtn.disabled = !isMyTurn

            // Status bar
            if (message.last_action) {
                statusBar.textContent = message.last_action
            }

            const turnText = isMyTurn ? '▸ YOUR TURN' : `▸ ${message.whose_turn}'s TURN`
            // Append turn indicator to status
            statusBar.textContent = (message.last_action || '') +
                (message.last_action ? '  |  ' : '') + turnText
        }
```

Also add a reference to the draw button at the top of the script with the other element references:
```javascript
        const drawBtn = document.getElementById('drawBtn')
```

And update `handleMessage` to use `updateTable` for `game_update`:

```javascript
        function handleMessage(message) {
            switch (message.type) {

                case 'waiting':
                    joinStatus.textContent = message.message
                    break

                case 'dealt':
                    showGameTable(message)
                    break

                case 'game_update':
                    updateTable(message)          // ← ADD this case
                    break

                case 'illegal':
                    statusBar.textContent = '✗ ' + message.reason
                    break

                case 'opponent_left':
                    statusBar.textContent = "Opponent left the game"
                    break

                default:
                    console.log("Unknown message type:", message.type)
            }
        }
```

---

### Step 6 — Add playCard, shakeCard, and Draw

Add these functions to your script:

```javascript
        // ---- Game action functions ----

        function shakeCard(cardEl) {
            // Trigger the shake animation on a card element
            cardEl.classList.remove('illegal')
            void cardEl.offsetWidth
            // Reading offsetWidth forces a reflow — resets the animation
            // so it plays again even if it was already playing
            cardEl.classList.add('illegal')
        }


        function playCard(card, cardEl) {
            // Send a play request to the server
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                // WebSocket.OPEN = 1 — check the connection is still live
                statusBar.textContent = "Not connected to server"
                return
            }

            socket.send(JSON.stringify({
                type: 'play',
                rank: card.rank,
                suit: card.suit,
            }))
            // The server will respond with either 'illegal' or 'game_update'
            // We don't change the DOM here — we wait for the server's response.
            // This is the "server as source of truth" pattern in action.
        }


        // ---- Draw button ----

        drawBtn.addEventListener('click', () => {
            if (!socket || socket.readyState !== WebSocket.OPEN) return

            socket.send(JSON.stringify({ type: 'draw' }))
        })
```

### SAVE AND TRY — Play a Card

Make sure the server is running. Open two tabs, join as Alice and Bob.

In Alice's tab (it's her turn):
1. Look at the top card of the discard pile
2. Find a card in your hand that matches the suit or rank
3. Click it

**You should see:**
- The card disappears from Alice's hand
- It appears as the new top card on the discard pile
- Alice's hand count decreases by 1
- Bob's tab updates simultaneously — showing 4 face-down cards for Alice
  and the new top card
- Status bar shows "Alice played 7♥  |  ▸ Bob's TURN"
- In Bob's tab, the draw button becomes enabled and cards become clickable

Now in Alice's tab, try clicking a card that DOESN'T match:

**You should see:**
- The card shakes left-right with a red border
- Status bar shows "✗ Must match suit ♥ or rank 7"
- The card stays in the hand, the game state doesn't change

**In DevTools Console:**
```javascript
socket.readyState
```
**Expected:** `1` (open)

**Change something:** Find the `shakeCard` function. Change `0.35s` in the
CSS animation to `1s`. Save. Try an illegal play. Much slower shake.
Change it back to `0.35s`.

---

## 🎯 Challenge: Highlight Playable Cards

**You know:** The `updateTable` function receives `message.your_hand` and
`message.top_card`. You can add a CSS class to card elements.
`is_legal_play` checks suit and rank matching — you can apply that same
logic in the frontend (for visual guidance only — the server still validates).

**Task:** When it's your turn, add a CSS class `playable` to cards that can
legally be played (match suit or rank of the top card). Add a CSS class
`not-playable` to cards that can't. Give `playable` a subtle green glow
and `not-playable` a dimmed appearance.

**Important:** This is visual guidance only. The server still validates every play.
A player could DevTools their way around the frontend highlighting — the server
doesn't care and will reject illegal plays regardless.

**Hints:**
1. Do this inside the `cardEls.forEach()` loop — you have access to `card`
   (the card data) and `cardEl` (the DOM element) and `message.top_card`.
2. A card is playable if `card.suit === message.top_card.suit || card.rank === message.top_card.rank`.

---

<details>
<summary>▶ Show Solution</summary>

**CSS to add:**
```css
        .card.playable {
            box-shadow: 0 0 12px var(--color-accent), 0 0 4px var(--color-accent);
            /* glow effect — the accent color (green in dark, blue in light) */
        }

        .card.not-playable {
            opacity: 0.45;
            /* dimmed — visually de-emphasizes unplayable cards */
        }
```

**In `cardEls.forEach()`, after adding the click listener:**
```javascript
                if (isMyTurn) {
                    const canPlay = (
                        card.suit === message.top_card.suit ||
                        card.rank === message.top_card.rank
                    )
                    cardEl.classList.add(canPlay ? 'playable' : 'not-playable')
                }
```

**Key insight:** Frontend highlighting and server validation solve different problems.
Highlighting is UX — it helps the player know what to do. Validation is security
and correctness — it ensures the game rules are actually enforced. You need both.
Removing the highlighting would make the game confusing. Removing the server
validation would make it cheat-able. They are not redundant — they serve
completely different purposes.

</details>

---

## 🎯 Challenge: Handle an Empty Deck

**You know:** `execute_draw()` returns `None` when `game['deck']` is empty.
The server sends `{ type: 'illegal', reason: 'Draw pile is empty' }`.

**Task:** When the draw pile is empty, visually show this on the table.
The draw stack should show nothing (or an empty slot), and the draw button
should be disabled regardless of whose turn it is.

**To do this you need:**
1. Add `'deck_count': len(game['deck'])` to `build_update_message()` in Python
2. Use `message.deck_count` in `updateTable()` to conditionally render the draw pile

**Hint for the visual:** If `deck_count === 0`, render the draw pile area as an
empty dashed box (similar to how you might show an empty discard slot).
You can check `message.deck_count` before building the draw stack HTML.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, update `build_update_message()`:**
```python
    return {
        'type':           'game_update',
        'your_hand':      game['hands'][player_id],
        'opponent_count': len(game['hands'][opponent_id]),
        'top_card':       game['discard'][-1],
        'whose_turn':     game['whose_turn'],
        'last_action':    last_action,
        'deck_count':     len(game['deck']),    # ← ADD
    }
```

Also add it to `build_dealt_message()`:
```python
        'deck_count':     len(game['deck']),    # ← ADD
```

**In `index.html`, update the draw pile section in `updateTable()`:**
```javascript
            if (message.deck_count === 0) {
                drawEl.innerHTML = `<div class="draw-stack empty-pile">EMPTY</div>`
                drawBtn.disabled = true
            } else {
                drawEl.innerHTML = `
                    <div class="draw-stack">
                        ${Array(Math.min(3, message.deck_count))
                          .fill(null).map(() => renderCardBack()).join('')}
                    </div>
                `
            }
```

**CSS for the empty pile:**
```css
        .empty-pile {
            border: 1.5px dashed var(--color-muted);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
            font-size: 9px;
            color: var(--color-muted);
            letter-spacing: 0.15em;
        }
```

**Key insight:** `deck_count` travels from server to client in every update
message. The client never counts the deck itself — it only knows what the
server tells it. This is the source-of-truth pattern enforced in practice:
even something as simple as "how many cards are left" is the server's answer,
not the client's calculation.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Legal play removes card | Click a matching card — it leaves your hand |
| Legal play updates discard | The played card becomes the new top card |
| Both screens update | Bob's tab shows new top card and Alice's reduced count |
| Turn switches | After Alice plays, Bob's cards become clickable |
| Illegal play shakes | Click a non-matching card — shake animation plays |
| Illegal play shows reason | Status bar shows "Must match suit X or rank Y" |
| Draw button works | Click DRAW — your hand gains a card |
| Draw switches turn | After drawing, opponent's turn activates |
| Draw button disabled on opponent's turn | Bob's draw button grayed when Alice's turn |
| Server validates all moves | Try sending a fake play via DevTools console — server rejects it |

---

## Quick Check Answers

**1. What information uniquely identifies a card?**
Rank + suit together. There is exactly one 7♥ in a standard deck.
Neither alone is enough: there are four 7s (one per suit) and thirteen
hearts. The combination of rank AND suit uniquely identifies any card.
This is why the `play` message sends both: `{ rank: "7", suit: "♥" }`.

**2. What makes a play legal in Crazy Eights (ignoring 8s)?**
The played card must match the top discard card's suit OR rank.
If the top card is Q♥, you can play any heart (same suit) or any queen
(same rank). Both conditions are checked with an OR — either one is
sufficient. This is implemented in `is_legal_play()` as:
`card['suit'] == top['suit'] or card['rank'] == top['rank']`.

**3. What should the game_update message contain?**
Each player needs: their own hand (personalized per player), the opponent's
card count (not the actual cards), the current top card of the discard pile,
whose turn it is, and a human-readable description of what just happened.
The server sends two separate `game_update` messages — one to each player —
with different `your_hand` values. Both players get the same `top_card`,
`whose_turn`, and `last_action`. This is why `build_update_message()` takes
a `player_id` argument — the message content is different for each player.

---

## What's Next — Lab G4

The game plays. Cards move. Turns switch.

Lab G4 adds the Crazy Eights rule system as a proper plugin:
- 8s are wild — play an 8 on anything, then choose the new suit
- A UI appears when you play an 8: "Choose a suit" with four buttons
- The chosen suit becomes the "active suit" until matched or another 8 is played
- The validation function checks the active suit, not just the top card's suit
- This rule is in `crazy_eights.py` — a separate file the engine imports

After G4, adding Go Fish is a new file, not a change to anything you built.

---

*Lab G3 complete. Cards play. Turns switch. Both screens update in real time.*
