# Card Engine — LAB G4 — The Rules Plugin

**Prerequisites:** Lab G3 complete. Cards play, turns switch, both screens update.
`is_legal_play()` validates basic suit/rank matching in `main.py`.

**What this lab adds:**
- A separate `crazy_eights.py` file that holds all Crazy Eights rules
- 8s become wild — they can be played on any card
- After playing an 8, a suit-picker UI appears with four buttons
- The chosen suit becomes the active suit for the next play
- `main.py` is refactored to call the plugin instead of its own rule logic
- Adding a new game later requires a new file, zero changes to `main.py`

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `is_legal_play()` lives in `main.py` with the server code.
>    What would happen to `main.py` if you added Go Fish rules, then War rules,
>    then Rummy rules — all in the same file?
> 2. When a player plays an 8 and chooses "hearts," the next player must play
>    a heart or another 8. But the top card on the discard pile is still the 8 —
>    its suit is whatever it was (clubs, spades, etc.). How does the server know
>    the required suit is now hearts?
> 3. A function that always returns the same output for the same input, and
>    never modifies anything outside itself, is called a "pure" function.
>    Is `is_legal_play()` pure? What about `execute_play()`? Why does this matter?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
Player plays an 8:

┌─────────────────────────────────┐
│  CHOOSE A SUIT:                 │
│                                 │
│  [ ♠ SPADES ]  [ ♥ HEARTS ]    │
│  [ ♦ DIAMONDS ][ ♣ CLUBS  ]    │
└─────────────────────────────────┘

Player picks ♥:
- Picker disappears
- Status bar: "Alice played 8♣ → chose ♥"
- Next player must play a ♥ or another 8
- Trying to play ♠ shakes: "Must match chosen suit ♥ or rank 8"
```

---

## PART 1 — The Architecture Decision

### Concept: The Strategy Pattern

**Official name:** Strategy Pattern
**Pattern category:** Behavioral

**The problem right now:**
`main.py` contains `is_legal_play()` with Crazy Eights logic baked in.
If you add Go Fish, you add Go Fish rules to `main.py`.
If you add War, you add War rules to `main.py`.

```python
# What main.py looks like without a plugin system — three games in:
def is_legal_play(player_id, card):
    if current_game == 'crazy_eights':
        # 40 lines of Crazy Eights rules
    elif current_game == 'go_fish':
        # 30 lines of Go Fish rules
    elif current_game == 'war':
        # 20 lines of War rules
    # ...grows forever
```

Every new game makes `main.py` larger and more tangled.
A bug in Go Fish rules could accidentally break Crazy Eights.
Testing one game requires running the entire file.

**The solution — Strategy Pattern:**
Define a fixed set of function names that every rules file must implement.
`main.py` calls those function names without knowing what game it is running.
Each game provides its own implementation in its own file.

```python
# main.py only ever does this:
import crazy_eights as rules      # ← change this one line to switch games

legal, reason = rules.is_legal_play(game, player_id, card)
effects       = rules.on_card_played(game, player_id, card)
over, winner  = rules.is_game_over(game)
```

**The tradeoff:** You must define the interface (the set of function names
and their signatures) upfront. If a new game needs a function the interface
does not include, you must add it to the interface AND to all existing plugins.
Designing a good interface requires thinking about what all games have in common —
which is hard to get right the first time.

**Where you will see this again:** Lab G5 (scoring via `rules.calculate_scores()`),
Lab G6 (adding Go Fish is a new file, zero changes to `main.py`).

**Canonical example (General Explanation):**
A universal TV remote has buttons: POWER, VOLUME UP, VOLUME DOWN, CHANNEL UP,
CHANNEL DOWN. These are the interface. Sony, LG, and Samsung each implement
those buttons differently internally — but the remote does not know or care.
You switch from Sony to Samsung by pointing at a different device.
`import crazy_eights as rules` is pointing the remote at Crazy Eights.
`import go_fish as rules` is pointing it at Go Fish.

**Project Application (The "Why" here):**
The interface for this engine is three functions: `is_legal_play`, `on_card_played`,
and `is_game_over`. Every game plugin implements all three. `main.py` calls
all three without knowing what game is running. `crazy_eights.py` knows the rules.
`main.py` knows the network and state management.

**Watch for:** The pattern only works if `main.py` NEVER imports anything
directly from `crazy_eights.py` by name. If `main.py` ever does
`from crazy_eights import WILD_RANK`, the decoupling is broken —
`main.py` now depends on a detail of the Crazy Eights implementation.
Import only the module: `import crazy_eights as rules`.

---

## PART 2 — Create the Plugin File

### Step 1 — Create crazy_eights.py

In VS Code, create a new file in `card-engine/backend/`.
Save it as `crazy_eights.py`.

Type the module docstring — this is documentation for the interface:

```python
"""
crazy_eights.py — Rules plugin for Crazy Eights

Implements the card engine rules interface:
  is_legal_play(game_state, player_id, card)  → (bool, str)
  on_card_played(game_state, player_id, card) → dict
  is_game_over(game_state)                    → (bool, str | None)

This file knows Crazy Eights rules.
It knows nothing about WebSockets, HTTP, or network connections.
"""
```

**Why a docstring at the top:** The docstring serves as the contract —
it tells anyone reading this file exactly what interface it implements.
When you create `go_fish.py` later, you copy this docstring and replace
the function implementations. The interface definition stays consistent
across all plugins.

---

### Step 2 — Define the Wild Card Constant

After the docstring, add:

```python
"""
...docstring...
"""

WILD_RANK = '8'    # ← add this line
# The rank that can be played on any card regardless of suit or current rank.
# Stored as a named constant so changing the wild card (for a variant game)
# requires changing one line, not hunting through every condition.
```

**Why a named constant instead of the literal `'8'` everywhere:**
If you later want to make 2s wild instead of 8s (a common variant),
you change one line: `WILD_RANK = '2'`. If `'8'` appears in six conditions,
you must find and change all six — and risk missing one.

### SAVE AND TRY

```
python
```

```python
from crazy_eights import WILD_RANK
print(WILD_RANK)
```

**Expected:** `8`

Type `exit()`. The file imports correctly.

---

### Step 3 — Write is_legal_play()

After `WILD_RANK`, add the function signature:

```python
WILD_RANK = '8'


def is_legal_play(game_state: dict, player_id: str, card: dict) -> tuple:    # ← add this line
```

**Why the parameter is `game_state` not `game`:** This function receives the
game dict as a parameter, not as a global variable. It does not import `game`
from `main.py`. This makes the function fully independent — you can pass any
dict and it will work. The separation between the plugin and the engine is clean.

Add the first guard — turn check:

```python
def is_legal_play(game_state: dict, player_id: str, card: dict) -> tuple:

    if game_state['whose_turn'] != player_id:    # ← add from here
        return False, "It's not your turn"
                                                 # ← add to here
```

Add the second guard — card possession check:

```python
    if game_state['whose_turn'] != player_id:
        return False, "It's not your turn"

    hand = game_state['hands'][player_id]        # ← add from here
    card_in_hand = any(
        c['rank'] == card['rank'] and c['suit'] == card['suit']
        for c in hand
    )
    if not card_in_hand:
        return False, "You don't have that card"
                                                 # ← add to here
```

Add the wild card check — 8s are always legal:

```python
    if not card_in_hand:
        return False, "You don't have that card"

    if card['rank'] == WILD_RANK:                # ← add from here
        return True, "OK"
        # 8 is wild — legal on any card, no suit or rank matching required
        # Return immediately — no need to check suit/rank match
                                                 # ← add to here
```

**Why check for wild before checking suit/rank:** If the wild check came after,
you would need to add `or card['rank'] == WILD_RANK` to every condition.
Checking it first and returning early is cleaner — the rest of the function
only runs for non-wild cards.

Add the active suit check:

```python
    if card['rank'] == WILD_RANK:
        return True, "OK"

    rule_state   = game_state.get('rule_state', {})    # ← add from here
    active_suit  = rule_state.get('active_suit', None)
    # rule_state is a sub-dict reserved for rule-specific data.
    # active_suit is set when a player plays an 8 and chooses a suit.
    # None means no override — use the top card's actual suit.

    top           = game_state['discard'][-1]
    effective_suit = active_suit if active_suit else top['suit']
    # If active_suit is set ('♥'), that is the required suit.
    # If active_suit is None, the top card's suit is required.
    # This one line handles both the normal case and the post-8 case.
                                                        # ← add to here
```

**Why store the active suit in `rule_state` instead of as a top-level key:**
`rule_state` is the plugin's private storage space within the shared `game` dict.
By convention, plugins only read and write `game['rule_state']`, never other
top-level keys. This prevents the Crazy Eights plugin from accidentally
overwriting something the engine uses (like `game['whose_turn']`).

Add the final match check:

```python
    effective_suit = active_suit if active_suit else top['suit']

    matches_suit = card['suit'] == effective_suit    # ← add from here
    matches_rank = card['rank'] == top['rank']

    if not (matches_suit or matches_rank):
        if active_suit:
            return False, f"Must match chosen suit {active_suit} or rank {top['rank']}"
        else:
            return False, f"Must match suit {top['suit']} or rank {top['rank']}"
        # Different error messages depending on whether an active suit is in play
        # The player deserves to know WHY their play is illegal

    return True, "OK"
                                                     # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from crazy_eights import is_legal_play

# Build a minimal fake game_state — no server needed
game_state = {
    'whose_turn': 'Alice',
    'discard': [{'rank': 'Q', 'suit': '♥', 'color': 'red'}],
    'hands': {
        'Alice': [
            {'rank': '7', 'suit': '♥', 'color': 'red'},    # legal — same suit
            {'rank': 'Q', 'suit': '♠', 'color': 'black'},  # legal — same rank
            {'rank': '8', 'suit': '♣', 'color': 'black'},  # legal — wild
            {'rank': '3', 'suit': '♦', 'color': 'red'},    # illegal
        ]
    },
    'rule_state': {}
}
```

```python
print(is_legal_play(game_state, 'Alice', {'rank': '7', 'suit': '♥'}))
# Expected: (True, 'OK') — matches suit ♥

print(is_legal_play(game_state, 'Alice', {'rank': '3', 'suit': '♦'}))
# Expected: (False, 'Must match suit ♥ or rank Q')

print(is_legal_play(game_state, 'Alice', {'rank': '8', 'suit': '♣'}))
# Expected: (True, 'OK') — wild card

print(is_legal_play(game_state, 'Bob', {'rank': '7', 'suit': '♥'}))
# Expected: (False, "It's not your turn")
```

Now test with an active suit:

```python
game_state['rule_state']['active_suit'] = '♦'
# Simulates: Alice played an 8 and chose diamonds

print(is_legal_play(game_state, 'Alice', {'rank': '7', 'suit': '♥'}))
# Expected: (False, 'Must match chosen suit ♦ or rank Q')
# ♥ no longer matches — the active suit is now ♦

print(is_legal_play(game_state, 'Alice', {'rank': '3', 'suit': '♦'}))
# Expected: (True, 'OK') — matches active suit ♦
```

Type `exit()`. The function handles all cases correctly.

---

### Step 4 — Write on_card_played()

After `is_legal_play()`, add:

```python
    return True, "OK"


def on_card_played(game_state: dict, player_id: str, card: dict) -> dict:    # ← add from here
```

**Why this function exists:** After a legal play is confirmed and the card
is moved to the discard, some games need additional effects. In Crazy Eights,
playing an 8 requires the player to choose a suit before the turn switches.
The engine needs to know about this side effect to pause the turn switch.
`on_card_played()` communicates side effects to the engine.

Add the rule_state initialization:

```python
def on_card_played(game_state: dict, player_id: str, card: dict) -> dict:

    if 'rule_state' not in game_state:    # ← add from here
        game_state['rule_state'] = {}
        # Initialize rule_state if it does not exist yet.
        # Should already exist from deal_game(), but defensive initialization
        # prevents KeyError if called in an unexpected order.
                                          # ← add to here
```

Add the wild card branch:

```python
    if 'rule_state' not in game_state:
        game_state['rule_state'] = {}

    if card['rank'] == WILD_RANK:                       # ← add from here
        game_state['rule_state']['waiting_for_suit'] = True
        game_state['rule_state']['suit_chooser']     = player_id
        # Mark that THIS player must choose a suit before the turn switches
        # suit_chooser prevents a different player from sending a choose_suit message

        return {'requires_suit_choice': True}
        # Signal to the engine: do not switch turns yet
        # Wait for a choose_suit message from this player
                                                        # ← add to here
```

Add the non-wild branch:

```python
    if card['rank'] == WILD_RANK:
        ...
        return {'requires_suit_choice': True}

    game_state['rule_state']['active_suit']      = None    # ← add from here
    game_state['rule_state']['waiting_for_suit'] = False
    # Non-8 card played — clear any active suit override.
    # The played card "answered" the active suit requirement.

    return {}
    # Empty dict means: no special side effects, proceed normally
                                                           # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from crazy_eights import on_card_played

game_state = {'rule_state': {}}

# Test playing an 8
eight = {'rank': '8', 'suit': '♣', 'color': 'black'}
result = on_card_played(game_state, 'Alice', eight)
print('Playing 8 returns:', result)
print('rule_state after:', game_state['rule_state'])
# Expected:
# Playing 8 returns: {'requires_suit_choice': True}
# rule_state after: {'waiting_for_suit': True, 'suit_chooser': 'Alice'}
```

```python
# Test playing a non-8 with active suit
game_state['rule_state']['active_suit'] = '♦'
seven = {'rank': '7', 'suit': '♦', 'color': 'red'}
result = on_card_played(game_state, 'Alice', seven)
print('Playing non-8 returns:', result)
print('active_suit after:', game_state['rule_state']['active_suit'])
# Expected:
# Playing non-8 returns: {}
# active_suit after: None — cleared by on_card_played
```

Type `exit()`.

---

### Step 5 — Write apply_suit_choice()

After `on_card_played()`, add:

```python
    return {}


def apply_suit_choice(game_state: dict, player_id: str, suit: str) -> tuple:    # ← add from here
```

**Why this is a separate function from `on_card_played`:**
`on_card_played` runs immediately when the 8 is played.
`apply_suit_choice` runs later, when the player sends their suit choice.
They are separate events at separate times — separate functions keep the
timing clear.

Add the validation:

```python
def apply_suit_choice(game_state: dict, player_id: str, suit: str) -> tuple:

    rule_state = game_state.get('rule_state', {})    # ← add from here

    if not rule_state.get('waiting_for_suit'):
        return False, "No suit choice is needed right now"
        # Prevents sending a choose_suit message at an arbitrary time

    if rule_state.get('suit_chooser') != player_id:
        return False, "You did not play the 8"
        # Only the player who played the 8 can choose the suit

    valid_suits = {'♠', '♥', '♦', '♣'}
    if suit not in valid_suits:
        return False, f"Invalid suit: {suit}"
        # Prevents sending an arbitrary string as the chosen suit
                                                     # ← add to here
```

Add the state update:

```python
    if suit not in valid_suits:
        return False, f"Invalid suit: {suit}"

    game_state['rule_state']['active_suit']      = suit    # ← add from here
    game_state['rule_state']['waiting_for_suit'] = False
    game_state['rule_state']['suit_chooser']     = None
    # Apply the chosen suit and clear the waiting state

    return True, "OK"
                                                           # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from crazy_eights import apply_suit_choice

game_state = {
    'rule_state': {
        'waiting_for_suit': True,
        'suit_chooser': 'Alice',
        'active_suit': None,
    }
}

# Test valid choice
result = apply_suit_choice(game_state, 'Alice', '♥')
print('Result:', result)
print('active_suit:', game_state['rule_state']['active_suit'])
# Expected: (True, 'OK') and active_suit is '♥'
```

```python
# Reset and test invalid cases
game_state['rule_state']['waiting_for_suit'] = True
game_state['rule_state']['suit_chooser'] = 'Alice'

print(apply_suit_choice(game_state, 'Bob', '♥'))
# Expected: (False, 'You did not play the 8')

game_state['rule_state']['waiting_for_suit'] = True
print(apply_suit_choice(game_state, 'Alice', '★'))
# Expected: (False, 'Invalid suit: ★')
```

Type `exit()`.

---

### Step 6 — Write is_game_over()

After `apply_suit_choice()`, add:

```python
    return True, "OK"


def is_game_over(game_state: dict) -> tuple:    # ← add from here
    for player_id, hand in game_state['hands'].items():
        # .items() gives (key, value) pairs — (player_id, list_of_cards)
        if len(hand) == 0:
            return True, player_id
            # This player's hand is empty — they played their last card and win.
            # Return immediately — no need to check the other player.

    return False, None
    # No empty hands found — the game continues.
                                                # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from crazy_eights import is_game_over

# Test — game still going
game_state = {
    'hands': {
        'Alice': [{'rank': 'A', 'suit': '♠', 'color': 'black'}],
        'Bob':   [{'rank': '7', 'suit': '♥', 'color': 'red'}],
    }
}
print(is_game_over(game_state))
# Expected: (False, None)

# Test — Alice wins
game_state['hands']['Alice'] = []
print(is_game_over(game_state))
# Expected: (True, 'Alice')
```

Type `exit()`. All four plugin functions are tested and working in isolation.

---

## PART 3 — Wire the Plugin into the Engine

### Step 7 — Import the Plugin in main.py

Open `backend/main.py`. Find the import block at the top:

```python
import json
import random
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
```

Add the plugin import:

```python
import json
import random
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import crazy_eights as rules    # ← add this line
# Import the rules module under the alias 'rules'.
# To switch to a different game, change this one line:
#   import go_fish as rules
# Nothing else in main.py changes.
```

**Why `as rules` instead of `import crazy_eights`:** Using `as rules` means
every call in `main.py` reads `rules.is_legal_play(...)` — not
`crazy_eights.is_legal_play(...)`. This makes `main.py` game-agnostic in its
source code. When you switch games, you change the import line and all the
`rules.` calls still work without modification.

---

### Step 8 — Delete the Old is_legal_play() from main.py

Find `is_legal_play()` in `main.py` — the one you wrote in Lab G3.
Delete the entire function. It is replaced by the plugin.

After deleting, confirm there is no remaining reference to
`is_legal_play` directly (not through `rules.`) in `main.py`.

### SAVE AND TRY

```
python
```

```python
from main import is_legal_play
```

**Expected:** `ImportError: cannot import name 'is_legal_play' from 'main'`

This confirms the function was removed from `main.py`.

```python
from main import app
print('Server imports correctly')
```

**Expected:** `Server imports correctly` — the server still starts without errors.

Type `exit()`.

---

### Step 9 — Add rule_state to the game Dict

Open `main.py`. Find the `game` dict:

```python
game = {
    'deck':       [],
    'hands':      {},
    'discard':    [],
    'players':    {},
    'whose_turn': None,
    'started':    False,
}
```

Add `rule_state`:

```python
game = {
    'deck':       [],
    'hands':      {},
    'discard':    [],
    'players':    {},
    'whose_turn': None,
    'started':    False,
    'rule_state': {},    # ← add this line
    # Reserved for rule-specific data — written only by the plugin (crazy_eights.py)
    # The engine reads it to send active_suit to clients, but never writes to it directly
}
```

**Why add it here rather than only in `deal_game()`:** Defining it in the `game`
dict makes the data structure explicit — anyone reading `main.py` can see all
the fields the game state has. If `rule_state` only appeared after `deal_game()` ran,
the structure would be invisible until the game started.

Also add the reset in `deal_game()`. Find:

```python
def deal_game():
    game['deck']    = make_deck()
    game['discard'] = []
    game['started'] = True
```

Add after `game['started'] = True`:

```python
    game['started']    = True
    game['rule_state'] = {}    # ← add this line
    # Reset rule-specific state for the new game
    # Clears active_suit, waiting_for_suit from the previous round
```

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

print('rule_state:', game['rule_state'])
# Expected: {} — empty dict, no active rules yet
```

Type `exit()`.

---

### Step 10 — Update the play Handler to Use the Plugin

Open `main.py`. Find the `if data['type'] == 'play':` block in the WebSocket loop.

Find this line:

```python
                legal, reason = is_legal_play(player_name, card)
```

Replace it with:

```python
                legal, reason = rules.is_legal_play(game, player_name, card)
                # was: is_legal_play(player_name, card)  (Lab G3 — local function)
                # now: rules.is_legal_play(game, player_name, card)  (plugin)
                # The plugin receives the full game state as first argument
```

Now find the else branch where a legal play is executed:

```python
                else:
                    execute_play(player_name, card)
                    action = f"{player_name} played {card['rank']}{card['suit']}"

                    over, winner = check_game_over()
```

Replace with the plugin-aware version:

```python
                else:
                    execute_play(player_name, card)
                    action = f"{player_name} played {card['rank']}{card['suit']}"

                    side_effects = rules.on_card_played(game, player_name, card)    # ← add from here
                    # Ask the plugin what happened as a result of this play.
                    # Returns {} for normal cards.
                    # Returns {'requires_suit_choice': True} when an 8 is played.
                                                                                    # ← add to here

                    over, winner = check_game_over()    # existing line
```

Now add the branch that handles suit choice requirement. After `check_game_over()`:

```python
                    over, winner = check_game_over()

                    if over:                    # existing branch
                        for pid in game['players']:
                            await send_to(pid, { ... })

                    else:                       # existing branch — replace its contents
                        if side_effects.get('requires_suit_choice'):    # ← add from here
                            # Player played an 8 — must choose a suit before turn switches.
                            # Send choose_suit to this player only.
                            await send_to(player_name, {
                                'type':        'choose_suit',
                                'last_action': action + ' — choose a suit',
                            })
                            # Notify the opponent that a suit choice is happening.
                            for pid in game['players']:
                                if pid != player_name:
                                    await send_to(pid, {
                                        **build_update_message(pid, action + ' — choosing suit'),
                                        'type': 'game_update',
                                    })
                            # ** "unpacks" the dict — merges its keys into this outer dict.
                            # This adds all keys from build_update_message plus 'type'.
                            # Without **: you'd have to write each key individually.
                        else:
                            for pid in game['players']:
                                await send_to(pid, build_update_message(pid, action))
                                                                        # ← add to here
```

**Why notify the opponent even when waiting for suit choice:**
The opponent needs to know something happened — their screen should show
"Alice played 8♣ — choosing suit" rather than being frozen with stale state.
They see the updated discard pile (the 8) and the updated hand count,
but the turn indicator stays as Alice's turn until she chooses.

---

### Step 11 — Add the choose_suit Message Handler

In the WebSocket loop, after the `draw` handler, add:

```python
            elif data['type'] == 'draw':
                ...

            elif data['type'] == 'choose_suit':                      # ← add from here
                suit  = data.get('suit', '')
                ok, reason = rules.apply_suit_choice(game, player_name, suit)
                # Validate and apply the suit choice via the plugin

                if not ok:
                    await websocket.send_text(json.dumps({
                        'type':   'illegal',
                        'reason': reason,
                    }))
                else:
                    player_ids    = list(game['players'].keys())
                    current_index = player_ids.index(player_name)
                    next_index    = (current_index + 1) % len(player_ids)
                    game['whose_turn'] = player_ids[next_index]
                    # NOW switch the turn — after the suit is chosen, not when the 8 was played

                    action = f"{player_name} chose {suit}"
                    for pid in game['players']:
                        await send_to(pid, {
                            **build_update_message(pid, action),
                            'type': 'game_update',
                        })
                        # Both players get the updated state with the new active_suit
                        # build_update_message already includes active_suit from rule_state
                                                                     # ← add to here
```

### SAVE AND TRY

Restart the server:
```
uvicorn main:app --reload
```

Open two tabs. Join as Alice and Bob.
Play cards normally until someone has an 8 in their hand (or wait — it will appear).

**When Alice plays an 8:**
- **In the terminal:** The server calls `rules.on_card_played`, gets
  `{'requires_suit_choice': True}`, sends `choose_suit` to Alice.
- **In Alice's console:** Log the incoming message:
  ```javascript
  socket.onmessage = e => console.log(JSON.parse(e.data))
  ```
  You should see `{type: 'choose_suit', last_action: '...'}`.
- **Bob's tab:** Updated state shows 8 as the top card, "Alice played 8♣ — choosing suit".

The frontend does not handle `choose_suit` yet — Alice's screen will not show
the suit picker. That comes next. But the server logic is correct and testable.

---

## PART 4 — The Suit Picker UI

### Step 12 — Add the Suit Picker HTML

In `index.html`, inside `#game-table`, after `#piles` and before `#your-label`:

```html
        <div id="piles">
            ...
        </div>

        <div id="suit-picker" style="display:none">    <!-- ← add from here -->
            <div class="suit-picker-label">CHOOSE A SUIT:</div>
            <div class="suit-picker-buttons">
                <button class="suit-btn spade"   data-suit="♠">♠ SPADES</button>
                <button class="suit-btn heart"   data-suit="♥">♥ HEARTS</button>
                <button class="suit-btn diamond" data-suit="♦">♦ DIAMONDS</button>
                <button class="suit-btn club"    data-suit="♣">♣ CLUBS</button>
            </div>
        </div>                                         <!-- ← add to here -->

        <div id="your-label">YOUR HAND</div>
```

**Why `data-suit="♠"` on each button:** The `data-*` attribute stores custom
data on an HTML element. JavaScript reads it with `element.dataset.suit`.
This means each button knows which suit it represents without needing a
separate lookup array or a `switch` statement — the data travels with the element.

### CSS AND SEE

Save. Refresh. Join two tabs.

**You should see:** The suit picker is hidden — `style="display:none"`.
The layout is unchanged. This confirms the HTML is valid.

---

### Step 13 — Style the Suit Picker Container

In the style block, after `#drawBtn:disabled`, add:

```css
        #drawBtn:disabled {
            /* ... existing ... */
        }

        #suit-picker {                               /* ← add from here */
            background:    var(--bg-card);
            border:        1px solid var(--color-accent);
            border-radius: 8px;
            padding:       16px 20px;
            text-align:    center;
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. In DevTools Console (on a tab where the game is running), temporarily show the picker:

```javascript
document.getElementById('suit-picker').style.display = 'block'
```

**You should see:** A dark card-colored box with a green border appears between
the pile area and your hand. The buttons inside are unstyled.

```javascript
document.getElementById('suit-picker').style.display = 'none'
```

Hides it again. The container styling is correct.

---

### Step 14 — Style the Suit Picker Label

After `#suit-picker`, add:

```css
        #suit-picker {
            /* ... existing ... */
        }

        .suit-picker-label {                         /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      10px;
            letter-spacing: 0.2em;
            color:          var(--color-muted);
            margin-bottom:  12px;
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. Show the picker in DevTools again:

```javascript
document.getElementById('suit-picker').style.display = 'block'
```

**You should see:** "CHOOSE A SUIT:" appears in muted green above the buttons.
Hide it again.

---

### Step 15 — Style the Suit Picker Buttons Container

After `.suit-picker-label`, add:

```css
        .suit-picker-label {
            /* ... existing ... */
        }

        .suit-picker-buttons {                       /* ← add from here */
            display:         flex;
            gap:             10px;
            justify-content: center;
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. Show the picker:

```javascript
document.getElementById('suit-picker').style.display = 'block'
```

**You should see:** The four buttons are now in a horizontal row with spacing.
Still unstyled browser-default buttons.

---

### Step 16 — Style the Suit Buttons

After `.suit-picker-buttons`, add:

```css
        .suit-picker-buttons {
            /* ... existing ... */
        }

        .suit-btn {                                  /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      13px;
            border-radius:  5px;
            border:         1.5px solid;
            cursor:         pointer;
            padding:        10px 14px;
            letter-spacing: 0.05em;
            background:     transparent;
            transition:     background 0.15s;
        }                                            /* ← add to here */
```

**Why `border: 1.5px solid` with no color:** The color comes from the
suit-specific classes added next. Writing it here without a color means
the suit classes only need to specify the color — not repeat `border-style`
and `border-width`.

### CSS AND SEE

Save. Show the picker. The buttons now have shape, padding, and rounded corners.
Still need color.

Now add the suit-specific colors. After `.suit-btn`, add:

```css
        .suit-btn {
            /* ... existing ... */
        }

        .suit-btn.spade,                             /* ← add from here */
        .suit-btn.club {
            color:        var(--color-black);
            border-color: var(--color-black);
        }

        .suit-btn.heart,
        .suit-btn.diamond {
            color:        var(--color-red);
            border-color: var(--color-red);
        }

        .suit-btn:hover {
            background: rgba(255, 255, 255, 0.06);
            /* Subtle highlight on hover — same in both light and dark mode */
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. Show the picker.

**You should see:**
- ♠ SPADES and ♣ CLUBS in cyan with cyan borders (dark mode) or near-black (light mode)
- ♥ HEARTS and ♦ DIAMONDS in pink-red with matching borders
- Hover over any button — subtle background appears

Toggle to light mode. The colors update automatically via CSS variables.
Toggle back.

Hide the picker:
```javascript
document.getElementById('suit-picker').style.display = 'none'
```

---

### Step 17 — Add the Suit Picker to Element References

In the `<script>` block, in the element references section, add:

```javascript
        const drawBtn     = document.getElementById('drawBtn')
        const suitPicker  = document.getElementById('suit-picker')    // ← add this line
        const suitButtons = document.querySelectorAll('.suit-btn')    // ← add this line
        // suitButtons is a NodeList of all four suit buttons
        // querySelectorAll returns all matches, unlike getElementById which returns one
```

### SAVE AND TRY

Save. Open DevTools Console. Type:

```javascript
suitPicker
suitButtons.length
```

**Expected:**
```
<div id="suit-picker" ...>
4
```

---

### Step 18 — Handle choose_suit in handleMessage

In `handleMessage()`, add the new case. Find the `switch` statement:

```javascript
                case 'game_update':
                    renderTable(message)
                    break

                case 'illegal':           // existing
                    ...
```

Add before the `illegal` case:

```javascript
                case 'game_update':
                    renderTable(message)
                    break

                case 'choose_suit':                         // ← add from here
                    suitPicker.style.display = 'block'
                    // Show the suit picker for this player
                    statusBar.textContent = message.last_action || 'Choose a suit'
                    break
                                                            // ← add to here

                case 'illegal':           // existing
```

**Why only show the suit picker here, not in `renderTable`:**
`renderTable` runs on every `game_update` — including updates sent to the
OPPONENT while a suit is being chosen. The picker should only show for the
player who played the 8. Keeping it in the `choose_suit` case ensures it
only appears for the right player.

---

### Step 19 — Wire the Suit Buttons

After the `connectToServer` function in the script, add:

```javascript
        function connectToServer(name) { ... }

        suitButtons.forEach(btn => {                 // ← add from here
            btn.addEventListener('click', () => {
                const suit = btn.dataset.suit
                // dataset.suit reads the data-suit="♠" attribute
                // Whichever button was clicked, its suit character is in dataset.suit

                socket.send(JSON.stringify({
                    type: 'choose_suit',
                    suit: suit,
                }))
                // Send the chosen suit to the server

                suitPicker.style.display = 'none'
                // Hide the picker immediately — before the server responds
                // The server will send game_update confirming the choice
            })
        })
                                                     // ← add to here
```

**Why hide the picker immediately (before server response):**
The server will either confirm with `game_update` or reject with `illegal`.
If rejected (which should not happen with the UI), the picker can be shown again.
Hiding immediately gives instant visual feedback — the player's click registered.
Waiting for server confirmation before hiding would feel sluggish.

---

### Step 20 — Hide the Suit Picker on game_update

The suit picker should disappear when a `game_update` arrives (either your
suit was applied, or the opponent played something). In `handleMessage`:

```javascript
                case 'game_update':
                    renderTable(message)
                    suitPicker.style.display = 'none'    // ← add this line
                    // Any game_update means the state has moved forward
                    // If a suit choice was pending, it is now resolved
                    break
```

### SAVE AND TRY

Restart the server. Open two tabs. Join as Alice and Bob.
Play cards until someone can play an 8. Play the 8.

**You should see:**
- The suit picker appears for the player who played the 8
- The four buttons are styled with the correct suit colors
- The opponent's tab shows the updated top card (the 8) and "Alice played 8♣ — choosing suit"
- The opponent cannot play — turn indicator still shows "Alice's turn"

Click a suit button in Alice's tab.

**You should see:**
- The picker disappears immediately
- Both tabs update: new active suit shown in status bar
- Turn switches to Bob
- Bob's cards: matching suit cards glow (if you added the highlight challenge in G3)

**In DevTools Console (Alice's tab):**
```javascript
socket.send(JSON.stringify({ type: 'choose_suit', suit: '★' }))
```
**In Alice's console:** `{type: 'illegal', reason: 'Invalid suit: ★'}` — server rejects invalid suits.

---

## 🎯 Challenge: Show the Active Suit on the Discard Pile

**You know:** `message.active_suit` is in every `game_update` message (it comes
from `build_update_message` via `game['rule_state']['active_suit']`).
`renderTable()` renders the discard pile with `discardEl.innerHTML = renderCard(message.top_card)`.

**Task:** When `message.active_suit` is not null, display a small badge on or
near the discard pile showing the required suit. The badge should:
- Show the suit symbol in the correct color (red/cyan or red/black)
- Disappear when `active_suit` is null (a non-8 was played)
- Work in both light and dark mode

**Hint:** After `discardEl.innerHTML = renderCard(message.top_card)`, check
`message.active_suit` and use `discardEl.innerHTML +=` to append the badge HTML.

---

<details>
<summary>▶ Show Solution</summary>

**CSS — add after `.suit-btn:hover`:**
```css
        .active-suit-badge {
            position:        absolute;
            top:             -10px;
            right:           -10px;
            width:           24px;
            height:          24px;
            border-radius:   50%;
            background:      var(--bg-table);
            border:          1.5px solid currentColor;
            display:         flex;
            align-items:     center;
            justify-content: center;
            font-size:       14px;
        }
```

Note: The discard pile's parent container needs `position: relative` for the
badge's `position: absolute` to position relative to it, not the whole page.
Find the div wrapping the discard pile and add `position: relative` to it,
or add it inline: `<div style="position:relative" id="discard-pile"></div>`.

**JavaScript — in `renderTable()`, after setting `discardEl.innerHTML`:**
```javascript
            discardEl.innerHTML = renderCard(message.top_card)

            if (message.active_suit) {
                const isRedSuit = message.active_suit === '♥' || message.active_suit === '♦'
                const colorClass = isRedSuit ? 'red-suit' : 'black-suit'
                discardEl.innerHTML += `
                    <div class="active-suit-badge ${colorClass}">
                        ${message.active_suit}
                    </div>
                `
            }
```

**Key insight:** The badge uses `currentColor` for its border — this CSS keyword
means "use the same color as the element's `color` property." Since `.red-suit`
sets `color: var(--color-red)`, the border automatically matches without repeating
the color value. `currentColor` is the CSS way of saying "inherit the text color
for this border" — one less variable to track.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Plugin imports without errors | `python -c "import crazy_eights"` — no output |
| is_legal_play works standalone | Python: test with fake game_state — all cases pass |
| on_card_played works standalone | Python: test with 8 and non-8 — correct returns |
| apply_suit_choice works standalone | Python: test valid and invalid suits |
| is_game_over works standalone | Python: test empty and non-empty hands |
| main.py no longer has is_legal_play | `python -c "from main import is_legal_play"` → ImportError |
| Normal plays still work | Play a non-8 card — still validates and switches turns correctly |
| 8 shows suit picker | Click an 8 in hand — four suit buttons appear |
| Suit picker styled correctly | Spades/clubs cyan, hearts/diamonds red (dark mode) |
| Choosing a suit sends message | Click ♥ — socket sends `{type:'choose_suit', suit:'♥'}` |
| Active suit enforced | After choosing ♥, try playing ♠ — shakes with "Must match chosen suit ♥" |
| Active suit clears on match | Play a ♥ when ♥ is active — active suit disappears |
| Opponent sees suit change | Bob's tab shows new active suit after Alice chooses |
| Game over still works | Play last card — game_over message arrives, cards disabled |

---

## Quick Check Answers

**1. What would happen if all game rules lived in main.py?**
Every new game would add more code to `main.py`. After three games, `main.py`
would have an `if current_game == '...'` branch in every function. Changing
Crazy Eights rules would require editing a file that also contains Go Fish
and War rules — easy to accidentally break the wrong game. Testing one game
would require loading the entire file. The file would grow without limit.
The Strategy Pattern prevents this by moving each game's rules into its own file.

**2. How does the server know the required suit after a player plays an 8?**
It stores it explicitly in `game['rule_state']['active_suit']`. The top card
on the discard pile is still the 8 with its original suit. `is_legal_play`
checks `rule_state.get('active_suit')` first — if it is set, that overrides
the top card's suit for matching purposes. When a non-8 card is played that
matches the active suit, `on_card_played` clears `active_suit` back to `None`.
The `rule_state` sub-dict is the plugin's private storage area — it exists
within the shared `game` dict but is written only by the plugin.

**3. Is is_legal_play pure? Is execute_play pure? Why does it matter?**
`is_legal_play` IS pure (mostly) — for the same `game_state`, `player_id`, and
`card`, it always returns the same result, and it does not modify anything.
You can call it 100 times and the game state is unchanged. `execute_play` is NOT
pure — it modifies `game['hands']`, `game['discard']`, and `game['whose_turn']`.
This matters because pure functions are safe to call from tests without worrying
about side effects — that is why you could test `is_legal_play` in Python without
running a server. Impure functions (like `execute_play`) must be tested by checking
the STATE after the call, not just the return value.

---

## What's Next — Lab G5

Rules work. 8s are wild. Plugin is separate from engine.

Lab G5 adds scoring and rematch:
- Scoring: loser's remaining hand value is added to winner's total
- Number cards = face value, face cards = 10, 8s = 50 points
- Scores persist across rematches — server remembers the running total
- "Play Again" button — both players must confirm before new cards are dealt
- Score display visible during and after each game
- Scoring logic lives entirely in `crazy_eights.py` — the engine does not know how points work

---

*Lab G4 complete. 8s are wild. Rules live in a plugin. The engine knows nothing about Crazy Eights.*
