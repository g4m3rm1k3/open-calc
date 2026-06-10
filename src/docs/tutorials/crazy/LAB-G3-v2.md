# Card Engine — LAB G3 — Play a Card

**Prerequisites:** Lab G2 complete. Two players connect, cards are dealt,
both screens show the correct hands. The WebSocket connection is open and stable.

**What this lab adds:**
- Click a card in your hand to attempt playing it
- The server validates every play before accepting it
- Legal play: card leaves your hand and appears on the discard pile on BOTH screens
- Illegal play: card shakes left-right and the reason appears in the status bar
- A draw button adds a card to your hand when you have nothing playable
- Turn switching: after a legal play, the opponent's cards become clickable

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you click a card, your browser needs to tell the server which card
>    you played. The server needs enough information to find that specific card
>    in your hand and remove it. What information uniquely identifies one card
>    in a standard 52-card deck?
> 2. The server checks if a play is legal before executing it. In Crazy Eights
>    (ignoring 8s for now), what two conditions make a play legal?
> 3. After a legal play, both screens must update. You already know the server
>    can send messages to both players. What should the update message contain
>    so each screen can render the new state correctly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
BEFORE (Lab G2):              AFTER (Lab G3):
Cards on screen               Click a card → server validates
No interaction                Legal: card moves to discard on both screens
                              Illegal: card shakes, reason shown
                              Draw button adds a card
                              Turn switches after legal play
```

The moment a card moves from one player's hand to the discard pile
and the OTHER player's screen updates without them doing anything —
that is when the game becomes real.

---

## The Message Protocol Extension

Before writing any code, define the new messages this lab adds.
You designed the original protocol in Lab G2. Here are the additions:

**Client → Server: play a card**
```json
{ "type": "play", "rank": "7", "suit": "♥" }
```
Rank + suit together identify one card uniquely. There is exactly one 7♥ in the deck.

**Client → Server: draw a card**
```json
{ "type": "draw" }
```

**Server → Both clients: game state updated**
```json
{
    "type":           "game_update",
    "your_hand":      [...],
    "opponent_name":  "Alice",
    "opponent_count": 4,
    "top_card":       { "rank": "7", "suit": "♥", "color": "red" },
    "whose_turn":     "Bob",
    "last_action":    "Alice played 7♥",
    "deck_count":     40,
    "scores":         { "Alice": 0, "Bob": 0 }
}
```

**Server → One client: illegal play rejected**
```json
{ "type": "illegal", "reason": "Must match suit ♥ or rank Q" }
```

Note that `game_update` goes to BOTH players but `your_hand` contains
different cards for each. The server sends two separate messages — one
personalized for each player.

---

## PART 1 — Server Validation

### Concept: Validating Before Executing

**What it is:** Checking whether an action is allowed BEFORE changing any state.
If the check fails, nothing changes and an error is returned.
If the check passes, the state is updated and success is returned.

**The problem without validation:**
If the server executes every play without checking, a player could cheat by
sending a WebSocket message for a card they do not have, or playing out of turn,
or playing a card that does not match the top card. The client-side UI might
disable illegal plays visually, but a player can bypass the UI entirely by
typing directly into the DevTools console:
```javascript
socket.send(JSON.stringify({ type: 'play', rank: 'A', suit: '♠' }))
```
The server receives this regardless of what the UI shows.

**The solution:**
```python
def is_legal_play(player_id, card):
    if game['whose_turn'] != player_id:
        return False, "It's not your turn"
    if card not in game['hands'][player_id]:
        return False, "You don't have that card"
    top = game['discard'][-1]
    if card['suit'] != top['suit'] and card['rank'] != top['rank']:
        return False, f"Must match suit {top['suit']} or rank {top['rank']}"
    return True, "OK"
```
The server independently checks every rule. The browser's disabled state is
a courtesy to the user, not a security measure.

**Canonical example (General Explanation):**
A bank ATM validates your PIN before dispensing cash. The keypad on the ATM
might grey out the "withdraw" button until you enter a PIN — but the server
behind the ATM also checks the PIN independently before releasing any money.
The UI lock is a convenience. The server check is the actual security.

**Project Application (The "Why" here):**
`is_legal_play()` runs on the server before `execute_play()` is called.
It returns a tuple: `(True, "OK")` or `(False, "reason string")`.
The caller decides what to do: if False, send an `illegal` message back
to just this player. If True, execute the play and send `game_update` to both.
The function only checks — it never changes state. That separation makes it
easy to test in isolation without running the full server.

**Watch for:** The function checks conditions in order and returns immediately
on failure — this is called a "guard clause." The final `return True, "OK"`
is only reached if all checks passed. Adding a new rule is one new `if` block
before the final return. You never need to restructure the function.

---

### Step 1 — Write is_legal_play()

Open `backend/main.py`. Find the `deal_game()` function.
After its closing line (`game['whose_turn'] = player_ids[0]`), add:

```python
    game['whose_turn'] = player_ids[0]


def is_legal_play(player_id: str, card: dict) -> tuple:    # ← add from here
```

**Why return a `tuple`:** A tuple is a pair (or group) of values returned
together. `(True, "OK")` and `(False, "reason")` always come as a pair —
the boolean and the explanation are always needed together. Returning them as
a tuple lets the caller unpack both at once:
`legal, reason = is_legal_play(player_id, card)`.

Add the first guard — turn check:

```python
def is_legal_play(player_id: str, card: dict) -> tuple:

    if game['whose_turn'] != player_id:                    # ← add from here
        return False, "It's not your turn"
        # Return immediately — no point checking anything else
        # The player calling this is not the active player
                                                           # ← add to here
```

**Why check turn first:** If it is not this player's turn, none of the other
checks matter. Returning early avoids unnecessary computation and keeps the
error message accurate — "not your turn" is more helpful than "card doesn't match"
when the real problem is the turn order.

Add the second guard — card possession check:

```python
    if game['whose_turn'] != player_id:
        return False, "It's not your turn"

    hand = game['hands'][player_id]                        # ← add from here
    card_in_hand = any(
        c['rank'] == card['rank'] and c['suit'] == card['suit']
        for c in hand
    )
    # any() returns True if at least one item in the sequence is True
    # The generator expression checks each card c in hand:
    # "does c match the rank AND suit of the played card?"
    # Both must match — rank alone is not enough (four 7s in the deck)

    if not card_in_hand:
        return False, "You don't have that card"
                                                           # ← add to here
```

**Why use `any()` instead of `card in hand`:** Python's `in` operator checks
equality with `==`. For dicts, `==` compares all keys and values. The card dict
from the browser message might not have identical key order or might be missing
the `color` key. `any()` with explicit field comparisons is more robust —
it only checks the fields that matter for identification (rank and suit).

Add the third guard — match check:

```python
    if not card_in_hand:
        return False, "You don't have that card"

    top = game['discard'][-1]                              # ← add from here
    # [-1] gets the last item in the list — the top of the discard pile

    matches_suit = card['suit'] == top['suit']
    matches_rank = card['rank'] == top['rank']
    # Separate variables make the condition below easier to read
    # and easier to extend later (Lab G4 adds active suit logic here)

    if not (matches_suit or matches_rank):
        return False, f"Must match suit {top['suit']} or rank {top['rank']}"
        # f-string: inserts actual suit and rank values into the message
        # e.g. "Must match suit ♥ or rank Q"

    return True, "OK"
                                                           # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game, is_legal_play

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

top = game['discard'][-1]
print('Top card:', top)
print('Whose turn:', game['whose_turn'])

# Test: play out of turn
result = is_legal_play('Bob', game['hands']['Bob'][0])
print('Bob plays out of turn:', result)
# Expected: (False, "It's not your turn") — Alice goes first
```

```python
# Test: play a card not in hand
fake = {'rank': 'Z', 'suit': '★', 'color': 'red'}
result = is_legal_play('Alice', fake)
print('Fake card:', result)
# Expected: (False, "You don't have that card")
```

```python
# Find a card Alice can legally play
alice_hand = game['hands']['Alice']
legal_cards = [
    c for c in alice_hand
    if c['suit'] == top['suit'] or c['rank'] == top['rank']
]
print('Alice legal plays:', legal_cards)

if legal_cards:
    result = is_legal_play('Alice', legal_cards[0])
    print('Legal play result:', result)
    # Expected: (True, 'OK')
```

Type `exit()`.

The validation function works in complete isolation from the server.
If something breaks later, you can come back here and test the logic directly.

---

### Step 2 — Write execute_play()

After `is_legal_play()`, add the execution function:

```python
    return True, "OK"


def execute_play(player_id: str, card: dict):    # ← add from here
```

Add the card removal from hand:

```python
def execute_play(player_id: str, card: dict):

    hand = game['hands'][player_id]              # ← add from here

    for index, c in enumerate(hand):
        # enumerate() gives both the position (index) and the value (c)
        # index 0 = first card, index 1 = second card, etc.
        if c['rank'] == card['rank'] and c['suit'] == card['suit']:
            hand.pop(index)
            # .pop(index) removes the item at that position
            break
            # break exits the loop immediately — no need to check remaining cards
            # without break, the loop would continue scanning after removal
                                                 # ← add to here
```

**Why use `enumerate` and `pop` instead of `hand.remove(card)`:**
`list.remove()` removes the first item that equals the argument using `==`.
For dicts, `==` compares ALL key-value pairs. The card dict from the browser
might have different key ordering or extra/missing keys, causing `==` to return
False even for the right card. Using `enumerate` and comparing only `rank` and
`suit` is explicit about what "same card" means.

Add the discard and turn switch:

```python
        if c['rank'] == card['rank'] and c['suit'] == card['suit']:
            hand.pop(index)
            break

    game['discard'].append(card)                 # ← add from here
    # Add the played card to the top of the discard pile
    # .append() adds to the END of the list — [-1] always gets the top

    player_ids    = list(game['players'].keys())
    current_index = player_ids.index(player_id)
    # .index() finds the position of player_id in the list
    next_index    = (current_index + 1) % len(player_ids)
    # % (modulo) wraps around: with 2 players, (0+1)%2=1, (1+1)%2=0
    # This alternates between 0 and 1 — always the other player
    game['whose_turn'] = player_ids[next_index]
                                                 # ← add to here
```

### Math: Modulo for Turn Switching

**What it computes:** The remainder after division. Used here to wrap an
index back to 0 after it reaches the end of the list.

**The real-world analogy:** A clock. After 12 o'clock, the next hour is
1 — not 13. The clock "wraps around." `13 % 12 = 1`.

**In this project:**
```
2 players at positions [0, 1]
Alice is at index 0. After Alice plays: (0 + 1) % 2 = 1 → Bob's turn.
Bob is at index 1. After Bob plays:   (1 + 1) % 2 = 0 → Alice's turn.
```

If you later add a third player at index 2:
```
(2 + 1) % 3 = 0 → back to the first player.
```
The same formula works for any number of players.

**Watch for:** `%` in Python always returns a non-negative result when the
divisor is positive. `(-1) % 2 = 1` — Python's modulo behaves differently
from some other languages. For turn switching with forward-only incrementing,
this is always safe.

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game, execute_play

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

alice_hand_before = len(game['hands']['Alice'])
discard_before    = len(game['discard'])
top_before        = game['discard'][-1]

# Play Alice's first card (whatever it is)
card_to_play = game['hands']['Alice'][0]
execute_play('Alice', card_to_play)

print('Alice hand before:', alice_hand_before)
print('Alice hand after: ', len(game['hands']['Alice']))
print('Discard before:   ', discard_before)
print('Discard after:    ', len(game['discard']))
print('New top card:     ', game['discard'][-1])
print('Whose turn now:   ', game['whose_turn'])
```

**Expected:**
```
Alice hand before: 5
Alice hand after:  4
Discard before:    1
Discard after:     2
New top card:      {the card Alice just played}
Whose turn now:    Bob
```

Type `exit()`.

---

### Step 3 — Write execute_draw()

After `execute_play()`, add:

```python
    game['whose_turn'] = player_ids[next_index]


def execute_draw(player_id: str) -> dict | None:    # ← add from here
```

**Why `dict | None` as the return type:** The function returns the drawn card
(a dict) if successful, or `None` if the deck is empty. The `|` means "or" —
the return type is either a dict or None. This forces the caller to handle
both cases: a drawn card and an empty deck.

Add the body:

```python
def execute_draw(player_id: str) -> dict | None:

    if not game['deck']:                             # ← add from here
        return None
        # Empty list is falsy in Python — `not []` is True
        # Return None to signal "can't draw — deck is empty"

    drawn_card = game['deck'].pop()
    # .pop() removes and returns the last item — the "top" of the face-down deck

    game['hands'][player_id].append(drawn_card)
    # Add the drawn card to this player's hand

    player_ids    = list(game['players'].keys())
    current_index = player_ids.index(player_id)
    next_index    = (current_index + 1) % len(player_ids)
    game['whose_turn'] = player_ids[next_index]
    # Drawing passes the turn — same modulo formula as execute_play()
    # In full Crazy Eights rules, you draw until you CAN play or choose to pass
    # For simplicity in this lab, one draw always passes the turn

    return drawn_card
                                                     # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game, execute_draw

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

hand_before = len(game['hands']['Alice'])
deck_before = len(game['deck'])

drawn = execute_draw('Alice')

print('Drawn card:       ', drawn)
print('Alice hand before:', hand_before)
print('Alice hand after: ', len(game['hands']['Alice']))
print('Deck before:      ', deck_before)
print('Deck after:       ', len(game['deck']))
print('Whose turn:       ', game['whose_turn'])
```

**Expected:**
```
Drawn card:        {'rank': '...', 'suit': '...', 'color': '...'}
Alice hand before: 5
Alice hand after:  6
Deck before:       41
Deck after:        40
Whose turn:        Bob
```

Type `exit()`.

---

### Step 4 — Write build_update_message()

After `execute_draw()`, add:

```python
    return drawn_card


def build_update_message(player_id: str, last_action: str) -> dict:    # ← add from here
    player_ids  = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]

    return {
        'type':           'game_update',
        'your_hand':      game['hands'][player_id],
        # This player's actual cards — different for each player
        'opponent_name':  opponent_id,
        'opponent_count': len(game['hands'][opponent_id]),
        # Opponent's card COUNT only — never the actual cards
        'top_card':       game['discard'][-1],
        # Both players always see the same top card
        'whose_turn':     game['whose_turn'],
        'last_action':    last_action,
        # Human-readable description: "Alice played 7♥"
        # Shown in the status bar on both screens
        'deck_count':     len(game['deck']),
        'scores':         dict(game.get('scores', {})),
        'active_suit':    game.get('rule_state', {}).get('active_suit', None),
        # None for now — used in Lab G4 when 8s set an active suit
    }
                                                                        # ← add to here
```

**Why `last_action` as a parameter instead of computing it inside:**
The description of what just happened ("Alice played 7♥" vs "Alice drew a card")
differs based on which action was taken. The caller knows which action occurred
and provides the string. The function just includes it in the message.
If the function computed it, it would need to know what just happened —
mixing the concerns of "what happened" and "how to describe both players' views."

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game, execute_play, build_update_message

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

card = game['hands']['Alice'][0]
execute_play('Alice', card)

msg_alice = build_update_message('Alice', f"Alice played {card['rank']}{card['suit']}")
msg_bob   = build_update_message('Bob',   f"Alice played {card['rank']}{card['suit']}")

print('Alice hand in her message:', len(msg_alice['your_hand']))
print('Bob hand in his message:  ', len(msg_bob['your_hand']))
print('Alice sees opp count:     ', msg_alice['opponent_count'])
print('Both see same top card?   ', msg_alice['top_card'] == msg_bob['top_card'])
print('Both see same last_action?', msg_alice['last_action'] == msg_bob['last_action'])
print('Whose turn in message:    ', msg_alice['whose_turn'])
```

**Expected:**
```
Alice hand in her message: 4
Bob hand in his message:   5
Alice sees opp count:      5
Both see same top card?    True
Both see same last_action? True
Whose turn in message:     Bob
```

Alice's message shows her reduced hand (4 cards after playing).
Bob's message shows his unchanged hand (5 cards).
Both see the same top card and the same whose_turn. Type `exit()`.

---

### Step 5 — Handle play and draw in the WebSocket Loop

Open `main.py`. Find the `while True` loop inside `websocket_endpoint`.
It currently contains:

```python
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)
            print(f"Message from {player_name}: {data}")
```

Replace the `print` line with the message handlers:

```python
        while True:
            raw  = await websocket.receive_text()
            data = json.loads(raw)

            if data['type'] == 'play':                          # ← add from here

                card = {
                    'rank':  data['rank'],
                    'suit':  data['suit'],
                    'color': data.get('color', ''),
                }
                # Reconstruct the card dict from the message fields
                # .get('color', '') uses '' if color was not sent — safe default

                legal, reason = is_legal_play(player_name, card)
                # Unpack the tuple: legal is True/False, reason is the string

                if not legal:
                    await websocket.send_text(json.dumps({
                        'type':   'illegal',
                        'reason': reason,
                    }))
                    # Send the rejection to THIS player only — not the opponent
                    # The opponent's game state has not changed

                else:
                    execute_play(player_name, card)
                    action = f"{player_name} played {card['rank']}{card['suit']}"

                    over, winner = check_game_over()
                    # check_game_over() is written in the next step

                    if over:
                        for pid in game['players']:
                            await send_to(pid, {
                                'type':    'game_over',
                                'winner':  winner,
                                'message': f'{winner} wins!',
                                'scores':  dict(game.get('scores', {})),
                            })
                    else:
                        for pid in game['players']:
                            await send_to(pid, build_update_message(pid, action))
                        # Send personalized update to BOTH players
                        # Each receives their own hand data

            elif data['type'] == 'draw':

                drawn = execute_draw(player_name)

                if drawn is None:
                    await websocket.send_text(json.dumps({
                        'type':   'illegal',
                        'reason': 'The draw pile is empty',
                    }))
                else:
                    action = f"{player_name} drew a card"
                    for pid in game['players']:
                        await send_to(pid, build_update_message(pid, action))

            else:
                print(f"Unknown message type from {player_name}: {data['type']}")
                # Log unexpected messages — do not crash on unknown types
                                                                # ← add to here
```

**Why handle unknown message types with `print` instead of an error:**
Crashing on an unknown message type would disconnect the player.
Logging it allows you to see unexpected messages during development without
disrupting the game. In production, you might log to a file and alert
a monitoring system — but never crash.

---

### Step 6 — Write check_game_over()

You referenced `check_game_over()` in Step 5 but it does not exist yet.
Add it after `build_update_message()`:

```python
def build_update_message(player_id: str, last_action: str) -> dict:
    ...


def check_game_over() -> tuple:                               # ← add from here
    for player_id, hand in game['hands'].items():
        # .items() gives (key, value) pairs — (player_id, list_of_cards)
        if len(hand) == 0:
            return True, player_id
            # This player played their last card — they win
            # Return immediately — no need to check other players

    return False, None
    # No empty hands found — the game continues
                                                              # ← add to here
```

**Why check after every play and not just when the hand WOULD be empty:**
You always check after the play is executed — at that point the hand is
already updated. Checking before execution would require predicting whether
the play would empty the hand, which is more complex. Check after, react to
the result.

### SAVE AND TRY

Restart the server:
```
uvicorn main:app --reload
```

Open two browser tabs, join as Alice and Bob.

In Alice's tab, open DevTools Console (F12). Type:

```javascript
socket.send(JSON.stringify({ type: 'play', rank: 'Z', suit: '★' }))
```

**In Alice's console:** Nothing visible yet (frontend does not handle `illegal` yet).
**In the terminal:** The server received the message. It called `is_legal_play`
and found `Z★` not in Alice's hand. It sent back `{ type: 'illegal', reason: '...' }`.

```javascript
socket.send(JSON.stringify({ type: 'draw' }))
```

**In the terminal:** `Alice drew a card` — the draw was processed.
Bob's opponent count should increase by 1 when the frontend is updated.

The server handles both message types correctly. The frontend handling comes next.

---

## PART 2 — Frontend: Click to Play

### Concept: Event Delegation vs Direct Binding

**What it is:** Two different strategies for attaching click handlers to elements
that are created dynamically (by JavaScript, not present in the original HTML).

**The problem with direct binding:**
```javascript
// You generate cards and immediately try to attach handlers:
handEl.innerHTML = cards.map(card => renderCard(card)).join('')
handEl.querySelectorAll('.card').forEach(cardEl => {
    cardEl.addEventListener('click', handler)
})
// This works — but every time you re-render the hand (after a card is played),
// you must re-attach the handlers to the newly created elements.
// The old handlers are on elements that no longer exist in the DOM.
```

**The solution for this project — re-attach after every render:**
Because `renderTable()` is called on every update, you attach handlers
at the end of `renderTable()` every time it runs. The new card elements
get new handlers. Old elements are discarded with the old `innerHTML`.
This is simple and readable for this project size.

**Canonical example (General Explanation):**
Imagine sticky notes on a whiteboard. Each sticky note (card element) has
a label telling you what to do when you touch it (click handler). When you
erase the whiteboard and redraw it (reassign `innerHTML`), all the sticky
notes are gone. You must put new sticky notes on the new drawings.
`querySelectorAll('.card').forEach(...)` is how you put new sticky notes.

**Project Application (The "Why" here):**
At the end of `renderTable()`, after setting `handEl.innerHTML`, you call
`handEl.querySelectorAll('.card').forEach((cardEl, index) => { ... })`.
The `index` links each DOM element back to the corresponding card in
`message.your_hand`, giving you access to the card data when clicked.

**Watch for:** The handlers are attached to elements that exist at the moment
`querySelectorAll` runs. If you call `querySelectorAll` before setting
`innerHTML`, it finds the OLD elements. Always attach handlers AFTER rendering.

---

### Step 7 — Add the Status Bar HTML

In `index.html`, inside `#game-table`, add a status bar after `#player-hand`:

```html
        <div id="your-label">YOUR HAND</div>
        <div id="player-hand"></div>

        <div id="status-bar">Connecting...</div>    <!-- ← add this line -->
```

**Why after `#player-hand`:** The status bar appears below the hand —
it is supplementary information, not the main content. Visual hierarchy
puts primary content (the hand) above secondary content (status text).

### CSS AND SEE

Save. Refresh. Open the join screen in a tab and join — the status bar
should appear below the hand area after the game starts.

Add the status bar CSS. After `#opp-label, #your-label` styles, add:

```css
        #opp-label, #your-label {
            /* ... existing ... */
        }

        #status-bar {                                /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      11px;
            color:          var(--color-muted);
            letter-spacing: 0.12em;
            padding:        10px 0;
            border-top:     1px solid var(--color-muted);
            min-height:     20px;
        }                                            /* ← add to here */
```

**Why `min-height: 20px`:** When the status bar is empty (no message yet),
the element would collapse to zero height, causing the layout to shift when
a message appears. `min-height` reserves the space so the layout stays stable.

### CSS AND SEE

Save. Join the game with two tabs.

**You should see:** A thin line below the hand with "Connecting..." text.
The line and text use the muted accent color.

---

### Step 8 — Add the Draw Button HTML

In `index.html`, inside the `#piles` div, after the draw pile div, add:

```html
            <div>
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
                <button id="drawBtn">DRAW</button>    <!-- ← add this line -->
            </div>
```

### CSS AND SEE

Save. Refresh. Join two tabs.

**You should see:** A plain browser-default button labeled "DRAW" appears
below the draw pile. Unstyled — that comes next.

Add the draw button CSS. After `#status-bar`, add:

```css
        #status-bar {
            /* ... existing ... */
        }

        #drawBtn {                                   /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      10px;
            background:     transparent;
            border:         1px solid var(--color-accent);
            color:          var(--color-accent);
            padding:        6px 14px;
            border-radius:  4px;
            cursor:         pointer;
            letter-spacing: 0.1em;
            margin-top:     8px;
            display:        block;
        }

        #drawBtn:disabled {
            opacity:        0.30;
            cursor:         not-allowed;
        }                                            /* ← add to here */
```

**Why `opacity: 0.30` for disabled state:** The button exists in the DOM
at all times — you want it visually grayed out when it is not the player's
turn, making it clear it is inactive without completely hiding it.
`cursor: not-allowed` reinforces this with a visual cursor change on hover.

### CSS AND SEE

Save. Join two tabs.

**You should see:**
- A styled "DRAW" button with the accent color border below the draw pile
- On load it is fully visible (not yet disabled)

---

### Concept: CSS @keyframes Animation

**What it is:** A named sequence of CSS states that an element moves through
over time. You define the states (called keyframes) at percentages of the
animation duration. Adding a CSS class that references the animation triggers it.

**The problem without it:**
To shake a card with JavaScript, you would:
1. Move it left with `style.transform = 'translateX(-6px)'`
2. Set a timeout for 75ms
3. Move it right with `style.transform = 'translateX(6px)'`
4. Set another timeout
5. Repeat several times
6. Move it back to center

Six steps, fragile, hard to tune, pollutes JavaScript with visual logic.

**The solution:**
```css
@keyframes shake {
    0%   { transform: translateY(-18px); }             /* at rest (hover position) */
    25%  { transform: translateY(-18px) translateX(-6px); } /* left */
    75%  { transform: translateY(-18px) translateX( 6px); } /* right */
    100% { transform: translateY(-18px); }             /* back to rest */
}

.card.illegal {
    animation: shake 0.35s ease;
}
```
Adding the class `illegal` starts the animation. CSS handles all the timing.

**Canonical example (General Explanation):**
A traffic light is a sequence of states: red (30s) → green (25s) → yellow (5s) → red.
`@keyframes` is the definition of that sequence. The duration (60s per cycle)
is separate. Starting the animation is like flipping the power switch —
the sequence runs automatically once started.

**Project Application (The "Why" here):**
When the server sends `{ type: 'illegal' }`, you add the `illegal` class
to the card element the player clicked. The shake animation runs for 0.35 seconds,
then stops. To reset it (so clicking the same card again shows the shake again),
you remove the class, force a reflow, then add it back — the animation restarts.

**Watch for:** `animation:` runs the sequence ONCE by default. After it finishes,
the element returns to its non-animated state (because `animation-fill-mode`
defaults to `none`). If you want the end state to persist, add
`animation-fill-mode: forwards`. For shaking, you want it to return to normal,
so the default is correct.

---

### Step 9 — Add the Shake Animation CSS

In the style block, after `#drawBtn:disabled`, add:

```css
        #drawBtn:disabled {
            /* ... existing ... */
        }

        @keyframes shake {                           /* ← add from here */
            0%   { transform: translateY(-18px); }
            20%  { transform: translateY(-18px) translateX(-7px); }
            40%  { transform: translateY(-18px) translateX( 7px); }
            60%  { transform: translateY(-18px) translateX(-7px); }
            80%  { transform: translateY(-18px) translateX( 7px); }
            100% { transform: translateY(-18px); }
        }
        /* The keyframes start and end at translateY(-18px) because that is
           the hovered position — the card is already lifted when clicked.
           Shaking from that position looks natural. Shaking from 0 would
           show the card jumping back down first, which looks wrong. */

        .card.shaking {
            animation: shake 0.35s ease;
        }                                            /* ← add to here */
```

**Why name the class `shaking` not `illegal`:** `illegal` describes why the
animation was triggered. `shaking` describes what the animation does.
CSS classes should describe appearance, not cause — the shake animation might
be reused for other reasons in future labs.

### CSS AND SEE

Save. Open DevTools Console. Type:

```javascript
const firstCard = document.querySelector('.card')
firstCard.classList.add('shaking')
```

**You should see:** The first card (if any are visible) shakes briefly.
If the game table is not visible, switch to a tab where the game is running.

```javascript
firstCard.classList.remove('shaking')
void firstCard.offsetWidth   // force reflow
firstCard.classList.add('shaking')
```

**You should see:** The card shakes again. The reflow trick allows re-triggering.

---

### Step 10 — Add Element References for New Elements

In the `<script>` block, in the element references section at the top, add:

```javascript
        const handEl       = document.getElementById('player-hand')
        const statusBar    = document.getElementById('status-bar')    // ← add this line
        const drawBtn      = document.getElementById('drawBtn')        // ← add this line
```

**Why add references at the top instead of inside the functions that use them:**
Calling `getElementById` inside a function runs the DOM search every time the
function is called. Storing the result in a variable runs the search once.
Since these elements never change (they are always in the DOM), caching the
reference is both faster and more readable.

### SAVE AND TRY

Save. Open DevTools Console. Type:

```javascript
statusBar
drawBtn
```

**Expected:** Both return the DOM element (not `null`).
If either returns `null`, the `id` attribute in the HTML does not match the
string you passed to `getElementById`.

---

### Step 11 — Write the shakeCard Helper

In the `<script>` block, after `renderCardBack()`, add:

```javascript
        function renderCardBack() { ... }

        function shakeCard(cardEl) {                 // ← add from here
            cardEl.classList.remove('shaking')
            void cardEl.offsetWidth
            // Reading offsetWidth forces the browser to recalculate layout.
            // This "reflow" resets the animation so it plays again even if
            // the class was already present from a previous illegal play.
            // Without this line, clicking an illegal card twice only shakes once.
            cardEl.classList.add('shaking')
        }
                                                     // ← add to here
```

**Why `void cardEl.offsetWidth`:** `void` discards the return value — you only
care about the side effect (the reflow), not the pixel measurement itself.
This is a well-known browser trick. It looks strange but is the standard
solution for resetting CSS animations.

### SAVE AND TRY

Save. Open DevTools Console after joining a game. Type:

```javascript
const card = document.querySelector('#player-hand .card')
shakeCard(card)
```

**Expected:** The first card in your hand shakes. Call it again immediately:
```javascript
shakeCard(card)
```

**Expected:** Shakes again — the reflow trick worked.

---

### Step 12 — Write the playCard Function

After `shakeCard()`, add:

```javascript
        function shakeCard(cardEl) { ... }

        let lastClickedCardEl = null
        // Stores the card element that was most recently clicked
        // Used by the 'illegal' message handler to shake the right card

        function playCard(card, cardEl) {            // ← add from here
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                statusBar.textContent = 'Not connected to server'
                return
                // WebSocket.OPEN equals 1 — the connection is live
                // If not open, the send would fail silently
            }

            lastClickedCardEl = cardEl
            // Remember which card was clicked so the illegal handler
            // can shake it if the server rejects the play

            socket.send(JSON.stringify({
                type: 'play',
                rank: card.rank,
                suit: card.suit,
            }))
            // Send the play request to the server
            // Do NOT remove the card from the DOM here — wait for server confirmation
            // If removed optimistically and the server rejects, you must put it back
            // Waiting for server response keeps the display always accurate
        }
                                                     // ← add to here
```

**Why store `lastClickedCardEl` instead of passing it through the message handler:**
When the server responds with `illegal`, the `onmessage` handler fires.
At that point, there is no reference to which card was clicked — that information
lives in the click event, which is gone. Storing it in `lastClickedCardEl` bridges
the gap between the click event and the delayed server response.

---

### Step 13 — Update renderTable() to Attach Click Handlers

In the `<script>` block, find `renderTable()`. After setting `handEl.innerHTML`,
add the click handler loop:

```javascript
        function renderTable(message) {

            // ... all existing rendering code ...

            handEl.innerHTML = message.your_hand
                .map(card => renderCard(card))
                .join('')

            const isMyTurn = message.whose_turn === myName    // ← add from here
            // Check if it is this player's turn
            // myName was set when the player joined

            const cardEls = handEl.querySelectorAll('.card')
            // querySelectorAll finds all .card elements inside handEl
            // These are the newly created elements from the innerHTML assignment above

            cardEls.forEach((cardEl, index) => {
                const card = message.your_hand[index]
                // index links DOM element to data: cardEls[0] ↔ your_hand[0]

                cardEl.addEventListener('click', () => {
                    if (!isMyTurn) {
                        shakeCard(cardEl)
                        statusBar.textContent = "Wait for your turn"
                        return
                    }
                    playCard(card, cardEl)
                })
            })

            drawBtn.disabled = !isMyTurn
            // Disable draw button when it is not this player's turn
            // !isMyTurn is true when it is the opponent's turn

            const turnText = isMyTurn ? '▸ YOUR TURN' : `▸ ${message.whose_turn}'s TURN`
            statusBar.textContent = (message.last_action ? message.last_action + '  |  ' : '') + turnText
            // Show last action (if any) followed by whose turn it is
            // The '  |  ' separator is a visual divider between the two pieces of information
                                                               // ← add to here
        }
```

**Why `!isMyTurn` instead of `isMyTurn === false`:** `!isMyTurn` is the
standard JavaScript negation. Both expressions are equivalent, but `!isMyTurn`
is more idiomatic and shorter. When `isMyTurn` is `true`, `!isMyTurn` is `false`
(button enabled). When `isMyTurn` is `false`, `!isMyTurn` is `true` (button disabled).

---

### Step 14 — Handle game_update and illegal in handleMessage

In `handleMessage()`, add the new cases. Find the existing switch statement:

```javascript
        function handleMessage(message) {
            switch (message.type) {

                case 'waiting':
                    joinStatus.textContent = message.message
                    break

                case 'dealt':
                    showGameTable(message)
                    break

                case 'opponent_left':          // existing
                    ...
                    break

                case 'game_update':            // ← add from here
                    renderTable(message)
                    break

                case 'illegal':
                    statusBar.textContent = '✗ ' + message.reason
                    if (lastClickedCardEl) {
                        shakeCard(lastClickedCardEl)
                    }
                    break

                case 'game_over':
                    statusBar.textContent = `🏆 ${message.message}`
                    drawBtn.disabled = true
                    handEl.querySelectorAll('.card').forEach(el => {
                        el.style.pointerEvents = 'none'
                        // pointerEvents: none makes the element ignore all mouse events
                        // clicks pass through as if the element is not there
                    })
                    break
                                               // ← add to here

                default:
                    console.log('Unknown message type:', message.type)
            }
        }
```

**Why `el.style.pointerEvents = 'none'` instead of `el.disabled`:**
`disabled` only works on form elements (`<button>`, `<input>`, etc.).
`<div>` elements (which your cards are) do not have a `disabled` property.
`pointerEvents: none` is the CSS/JavaScript equivalent for arbitrary elements —
it makes them transparent to mouse interaction.

### SAVE AND TRY

Restart the server. Open two tabs. Join as Alice and Bob.

**Test a legal play:**
In Alice's tab, look at the top discard card. Find a card in Alice's hand
that matches the suit or rank. Click it.

**You should see:**
- The card disappears from Alice's hand
- It appears as the new top card on the discard pile
- Bob's tab: opponent count decreases by 1, new top card shows
- Status bar on both tabs: "Alice played [rank][suit]  |  ▸ Bob's TURN"
- In Alice's tab: draw button grays out, cards become unresponsive to hover
- In Bob's tab: draw button is active, cards are hoverable

**Test an illegal play:**
In Alice's tab (after clicking legal above, it is now Bob's turn),
click any card in Alice's hand.

**You should see:**
- The card shakes left-right
- Status bar: "Wait for your turn"
- No change to the discard pile or opponent's screen

**Test the draw:**
In Bob's tab (it is Bob's turn), click DRAW.

**You should see:**
- Bob's hand count increases by 1
- Alice's tab: opponent count increases by 1
- Turn switches to Alice

**In DevTools Console (either tab):**
```javascript
socket.readyState
```
**Expected:** `1`

**Change something:** Change `0.35s` in the `@keyframes shake` duration to `1s`.
Save. Click an illegal card. The shake is very slow. Change it back to `0.35s`.

---

## 🎯 Challenge: Highlight Playable Cards

**You know:** `message.top_card` contains the current discard card.
`message.your_hand` contains your cards. CSS classes can be added to elements.
`isMyTurn` tells you whether to highlight.

**Task:** When it is your turn, add CSS class `playable` to cards that match
the top card's suit or rank. Add class `not-playable` to cards that do not match.

- `playable`: a subtle green glow (`box-shadow: 0 0 12px var(--color-accent)`)
- `not-playable`: reduced opacity (`opacity: 0.45`)

These are visual hints only — the server still validates every play.

**Where to add it:** Inside `cardEls.forEach()` in `renderTable()`,
after the click handler is attached.

**Hint:** `card.suit === message.top_card.suit || card.rank === message.top_card.rank`

---

<details>
<summary>▶ Show Solution</summary>

**CSS — add after `.card.shaking`:**
```css
        .card.playable {
            box-shadow: 0 0 14px var(--color-accent),
                        0 0 4px  var(--color-accent);
            /* Double drop-shadow creates a stronger glow effect */
        }

        .card.not-playable {
            opacity: 0.45;
            /* Visually de-emphasize unplayable cards without hiding them */
        }
```

**JavaScript — inside `cardEls.forEach()`, after `cardEl.addEventListener`:**
```javascript
                if (isMyTurn) {
                    const canPlay = (
                        card.suit === message.top_card.suit ||
                        card.rank === message.top_card.rank
                    )
                    cardEl.classList.add(canPlay ? 'playable' : 'not-playable')
                }
```

**Key insight:** Frontend highlighting and server validation solve completely
different problems. Highlighting is user experience — it helps the player
understand what they can do without clicking and failing. Validation is
correctness and security — it ensures the rules are actually enforced
regardless of what the UI shows. A player could disable the frontend
highlighting in DevTools and it would not affect the server's ability to
reject illegal plays. You need both, and they are not redundant.

</details>

---

## 🎯 Challenge: Show the Deck Count on the Draw Pile

**You know:** `message.deck_count` contains the number of remaining cards.
`renderTable()` renders the draw pile. `Array(n).fill(null).map(...)` creates
n face-down cards.

**Task:** Below the draw pile visual, show a small text label with the remaining
card count. Example: "38 CARDS" appears below the stacked face-down cards.
When the deck reaches 0, show "EMPTY" instead and disable the draw button
regardless of whose turn it is.

**Where to add it:** Inside `renderTable()` after setting the draw pile innerHTML.

---

<details>
<summary>▶ Show Solution</summary>

**In `renderTable()`, find where you set the draw pile (it may currently be
a static stack — update it to use `message.deck_count`):**

```javascript
            const drawPileEl    = document.getElementById('draw-pile')
            const drawCountEl   = document.getElementById('draw-count')
            // Add <div id="draw-count"></div> to the HTML below the draw pile

            const deckCount = message.deck_count || 0

            if (deckCount === 0) {
                drawPileEl.innerHTML  = '<div class="pile-empty">EMPTY</div>'
                drawBtn.disabled      = true
                drawCountEl.textContent = ''
            } else {
                const visibleCards = Math.min(3, deckCount)
                // Show at most 3 stacked cards visually — even if 40 remain
                drawPileEl.innerHTML = Array(visibleCards)
                    .fill(null)
                    .map(() => renderCardBack())
                    .join('')
                drawCountEl.textContent = `${deckCount} CARDS`
            }
```

**HTML addition:**
```html
                <div class="pile-label">DRAW</div>
                <div id="draw-pile"></div>
                <div id="draw-count" class="pile-count"></div>    <!-- ← add -->
                <button id="drawBtn">DRAW</button>
```

**CSS:**
```css
        .pile-count {
            font-family:    'Courier New', monospace;
            font-size:      9px;
            color:          var(--color-muted);
            text-align:     center;
            letter-spacing: 0.1em;
            margin-top:     4px;
        }

        .pile-empty {
            width:          80px;
            height:         115px;
            border:         1.5px dashed var(--color-muted);
            border-radius:  8px;
            display:        flex;
            align-items:    center;
            justify-content: center;
            font-family:    'Courier New', monospace;
            font-size:      9px;
            color:          var(--color-muted);
            letter-spacing: 0.15em;
        }
```

**Key insight:** `Math.min(3, deckCount)` prevents trying to render 40 stacked
card elements when only 3 are shown visually. The deck count is real information
(shown as text) but the visual representation is capped at 3 for performance
and aesthetics. Data and display can differ — the display is a representation,
not a literal reproduction.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Legal play removes card from hand | Click matching card — hand shrinks by 1 |
| Legal play updates discard pile | Played card becomes new top card |
| Both screens update on play | Bob's tab shows new top card and Alice's reduced count |
| Turn switches after legal play | After Alice plays, Bob's cards become hoverable |
| Illegal play shakes card | Click non-matching card — shake animation plays |
| Illegal play shows reason | Status bar shows "Must match suit X or rank Y" |
| Out-of-turn click shakes | Click during opponent's turn — shakes with "Wait for your turn" |
| Draw button adds a card | Click DRAW — hand count increases by 1 |
| Draw switches the turn | After drawing, opponent's turn activates |
| Draw button disabled on opponent's turn | Alice's draw button gray when Bob's turn |
| Server rejects DevTools cheating | Send fake card via console — server sends illegal back |
| Game over disables cards | When hand empties, cards become unclickable |

---

## Quick Check Answers

**1. What information uniquely identifies one card?**
Rank AND suit together. There are four 7s (one per suit) and thirteen hearts.
Neither rank alone nor suit alone is unique. The combination 7♥ identifies
exactly one card in the deck. This is why the `play` message sends both:
`{ rank: "7", suit: "♥" }`. The server checks both fields when searching
the player's hand in `is_legal_play()`.

**2. What two conditions make a play legal?**
The played card must match the top discard card's SUIT or RANK.
If the top card is Q♥, you can play any heart (same suit) or any queen
(same rank). Only one condition needs to be true — it is an OR check, not AND.
This is implemented as `card['suit'] == top['suit'] or card['rank'] == top['rank']`
in `is_legal_play()`. The 8 wild card rule is added in Lab G4.

**3. What should the game_update message contain?**
Each player's own hand (different per player), the opponent's card count
(not the actual cards), the current top discard card (same for both),
whose turn it is (same for both), a description of the last action (same
for both), the remaining deck count, and the current scores.
The server calls `build_update_message()` twice — once per player —
with the `player_id` parameter determining which hand goes into `your_hand`.
Every other field is the same in both messages.

---

## What's Next — Lab G4

Cards play. Turns switch. Both screens update in real time.

Lab G4 adds the Crazy Eights wild card rule as a separate plugin file:
- 8s can be played on any card (no suit/rank matching required)
- After playing an 8, a suit picker appears: ♠ ♥ ♦ ♣
- The chosen suit becomes the active suit until someone plays a matching card
- The validation function checks the active suit, not just the top card's suit
- All rule logic lives in `crazy_eights.py` — the engine (`main.py`) does not
  know the rules, it only calls the plugin

---

*Lab G3 complete. Cards play. Turns switch. Both screens update in real time.*
