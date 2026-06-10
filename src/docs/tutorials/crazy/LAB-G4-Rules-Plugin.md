# Card Engine — LAB G4 — The Rules Plugin

**Prerequisites:** Lab G3 complete. Cards play, turns switch, both screens
update. `is_legal_play()` validates basic suit/rank matching.

**What this lab adds:**
- 8s become wild — can be played on any card
- After playing an 8, a suit-picker UI appears
- The chosen suit becomes the "active suit" until matched or overridden
- All validation now goes through a separate `crazy_eights.py` rules file
- The engine (`main.py`) doesn't know the rules — it only calls the plugin

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `is_legal_play()` lives inside `main.py`. What's the problem
>    with that when you want to add a second game (Go Fish)?
> 2. When a player plays an 8 and chooses "hearts," the next player must play
>    a heart (or another 8). But the top card on the discard pile is still the 8.
>    The 8's suit is clubs (or whatever). How does the server know the active suit
>    is now hearts?
> 3. What does it mean for a function to be "pure"? Why does it matter for a rules plugin?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
Player plays an 8 → suit picker appears:
┌─────────────────────────────────┐
│  Choose a suit:                 │
│                                 │
│   [♠ SPADES]   [♥ HEARTS]      │
│   [♦ DIAMONDS] [♣ CLUBS]       │
└─────────────────────────────────┘

Player picks ♥ → picker disappears
Status bar: "Alice played 8♣ → chose ♥"
Next player must play a ♥ or another 8
```

---

## PART 1 — The Architecture Problem

### Concept: The Strategy Pattern

**Official name:** Strategy Pattern
**Pattern category:** Behavioral

**The problem right now:**

`main.py` contains `is_legal_play()`. That function has Crazy Eights rules
baked into it. If you want to add Go Fish, you'd have to:
- Add Go Fish rules to `main.py`
- Add `if current_game == 'crazy_eights'` / `elif current_game == 'go_fish'` branches
- Every new game makes `main.py` bigger and more tangled
- Changing one game's rules risks breaking another

This is called **tight coupling** — the engine and the rules are fused together.

**The pain, concretely:**

```python
# What main.py looks like without a plugin system:
def is_legal_play(player_id, card):
    if current_game == 'crazy_eights':
        # 30 lines of Crazy Eights rules
    elif current_game == 'go_fish':
        # 30 lines of Go Fish rules
    elif current_game == 'war':
        # 30 lines of War rules
    # ...forever
```

**The solution — Strategy Pattern:**

Define a common interface (a set of functions every rules plugin must provide).
The engine calls those functions by name — it never looks at their contents.
Each game provides its own implementation.

```python
# main.py only ever calls:
rules.is_legal_play(game_state, player_id, card)
rules.on_card_played(game_state, player_id, card)
rules.is_game_over(game_state)

# crazy_eights.py implements those functions its way
# go_fish.py implements them its own way
# The engine doesn't care — it just calls the functions
```

**The tradeoff:** You have to define the interface upfront. If a new game needs
a function the interface doesn't include, you have to extend the interface —
which means updating all existing plugins too. Designing the right interface
is the hard part of this pattern.

**Where you will see this again:** Lab G5 (win detection uses `rules.is_game_over()`),
Lab G6+ (every new game is a new plugin file, zero engine changes).

**Watch for:** The Strategy Pattern requires discipline — the engine must ONLY
call the interface functions, never reach into the plugin directly. If `main.py`
ever imports a specific rule from `crazy_eights.py` by name, the pattern is broken.

---

### Step 1 — Define the Plugin Interface

Before writing `crazy_eights.py`, decide exactly what functions the engine
will call. This is the contract — write it as a comment block at the top
of a new file. You're designing before coding.

Create `backend/game_rules.py`:

```python
# game_rules.py — The Rules Plugin Interface
#
# Every game rules file must implement ALL of these functions
# with EXACTLY these signatures (parameter names and types).
# The engine (main.py) will call these functions by name.
# The engine never imports any game-specific rules directly.
#
# INTERFACE:
#
# is_legal_play(game_state: dict, player_id: str, card: dict) -> tuple[bool, str]
#   Returns (True, "OK") if the play is legal.
#   Returns (False, "reason") if the play is illegal.
#
# on_card_played(game_state: dict, player_id: str, card: dict) -> dict
#   Called after a legal play is confirmed.
#   May modify game_state (e.g. set active_suit for wild cards).
#   Returns a dict of "side effects" the engine needs to know about:
#     { "requires_suit_choice": True/False }
#   Return {} if no side effects.
#
# get_legal_plays(game_state: dict, player_id: str) -> list[dict]
#   Returns a list of cards in the player's hand that can legally be played.
#   Used by the frontend to highlight playable cards.
#
# is_game_over(game_state: dict) -> tuple[bool, str | None]
#   Returns (True, winner_id) if the game is over.
#   Returns (False, None) if the game continues.
#
# All functions receive game_state — the same dict as game{} in main.py.
# They may READ game_state freely.
# They should only WRITE to game_state['rule_state'] — a sub-dict
# reserved for rule-specific data (like active_suit).
# Writing to other parts of game_state risks breaking the engine.


class RulesInterface:
    """
    Base class documenting the required interface.
    Not used at runtime — only for documentation and type checking.
    Actual rule files don't need to inherit from this.
    """
    def is_legal_play(self, game_state, player_id, card): raise NotImplementedError
    def on_card_played(self, game_state, player_id, card): raise NotImplementedError
    def get_legal_plays(self, game_state, player_id): raise NotImplementedError
    def is_game_over(self, game_state): raise NotImplementedError
```

This file is documentation and a design contract. It doesn't run anything.
It exists so that when you (or someone else) writes a new game plugin,
the interface is written down clearly in one place.

---

### Step 2 — Write the Crazy Eights Rules Plugin

Create `backend/crazy_eights.py`:

```python
# crazy_eights.py — Rules plugin for Crazy Eights
#
# Implements the RulesInterface defined in game_rules.py.
# This file knows Crazy Eights rules. It knows nothing about
# WebSockets, HTTP, or how the engine works internally.


# ---- Crazy Eights Rules ----
#
# Standard rules implemented here:
# 1. A card is legal if it matches the active suit OR the top card's rank
# 2. An 8 is always legal (wild card) — can be played on anything
# 3. After playing an 8, the player chooses the new active suit
# 4. The active suit persists until a non-8 card is played matching it,
#    or another 8 is played (choosing a new suit)
# 5. A player with no legal plays must draw
# 6. The game ends when any player's hand is empty

WILD_RANK = '8'
# The rank that is wild — pulling this out as a constant means
# you could make a different card wild just by changing this one line


def is_legal_play(game_state: dict, player_id: str, card: dict) -> tuple:
    """
    Check if playing this card is legal under Crazy Eights rules.
    Returns (True, "OK") or (False, "reason string").
    """
    # The active suit may differ from the top card's suit (after an 8 is played)
    # It's stored in rule_state, which is reserved for rule-specific data
    rule_state = game_state.get('rule_state', {})
    active_suit = rule_state.get('active_suit', None)
    # None means no override — use the top card's suit

    top_card = game_state['discard'][-1]
    # [-1] = last item = top of pile

    effective_suit = active_suit if active_suit else top_card['suit']
    # If active_suit was set (after an 8), use that.
    # Otherwise, use the top card's actual suit.

    # Rule 1: 8s are wild — always legal
    if card['rank'] == WILD_RANK:
        return True, "OK"

    # Rule 2: Must match effective suit OR top card's rank
    matches_suit = card['suit'] == effective_suit
    matches_rank = card['rank'] == top_card['rank']

    if matches_suit or matches_rank:
        return True, "OK"

    # Neither condition met — illegal
    if active_suit:
        # There's an active suit override — make the reason clear
        return False, f"Must match chosen suit {active_suit} or rank {top_card['rank']}"
    else:
        return False, f"Must match suit {top_card['suit']} or rank {top_card['rank']}"


def on_card_played(game_state: dict, player_id: str, card: dict) -> dict:
    """
    Called after a legal play is confirmed and executed.
    Handles side effects: if an 8 was played, signals that suit choice is needed.
    If a non-8 was played, clears any active suit override.
    Returns a dict of side effects for the engine.
    """

    if 'rule_state' not in game_state:
        game_state['rule_state'] = {}
        # Initialize rule_state if it doesn't exist yet

    if card['rank'] == WILD_RANK:
        # 8 played — the active suit needs to be chosen by the player
        # The engine will wait for a "choose_suit" message before switching turns
        game_state['rule_state']['waiting_for_suit'] = True
        game_state['rule_state']['suit_chooser'] = player_id
        # Remember WHO played the 8 — they're the one who chooses

        return {'requires_suit_choice': True}
        # Signal to the engine: don't switch turns yet, wait for suit choice

    else:
        # Non-8 played — clear any active suit (it's been "answered")
        game_state['rule_state']['active_suit'] = None
        game_state['rule_state']['waiting_for_suit'] = False

        return {}
        # No special side effects


def apply_suit_choice(game_state: dict, player_id: str, suit: str) -> tuple:
    """
    Called when a player chooses a suit after playing an 8.
    NOT part of the standard interface — called specifically for wild card handling.
    Returns (True, "OK") or (False, "reason") if the choice is invalid.
    """
    rule_state = game_state.get('rule_state', {})

    # Validate: is this player the one who played the 8?
    if rule_state.get('suit_chooser') != player_id:
        return False, "You didn't play the 8"

    # Validate: is a suit choice actually expected?
    if not rule_state.get('waiting_for_suit'):
        return False, "No suit choice needed right now"

    # Validate: is the chosen suit one of the four valid suits?
    valid_suits = {'♠', '♥', '♦', '♣'}
    if suit not in valid_suits:
        return False, f"Invalid suit: {suit}"

    # Apply the choice
    game_state['rule_state']['active_suit'] = suit
    game_state['rule_state']['waiting_for_suit'] = False
    game_state['rule_state']['suit_chooser'] = None

    return True, "OK"


def get_legal_plays(game_state: dict, player_id: str) -> list:
    """
    Return all cards in the player's hand that can legally be played.
    Used by the frontend to highlight playable cards.
    """
    hand = game_state['hands'].get(player_id, [])

    return [
        card for card in hand
        if is_legal_play(game_state, player_id, card)[0]
        # is_legal_play returns (bool, str) — [0] gets the bool
    ]


def is_game_over(game_state: dict) -> tuple:
    """
    Check if the game has ended.
    In Crazy Eights, the game ends when any player's hand is empty.
    Returns (True, winner_id) or (False, None).
    """
    for player_id, hand in game_state['hands'].items():
        # .items() gives (key, value) pairs — (player_id, list_of_cards)
        if len(hand) == 0:
            return True, player_id
            # This player played their last card — they win

    return False, None
    # No empty hands — game continues
```

### SAVE AND TRY — Test the rules plugin in isolation

```
python
```

```python
from crazy_eights import is_legal_play, get_legal_plays, is_game_over

# Build a minimal fake game_state
game_state = {
    'discard': [{'rank': 'Q', 'suit': '♥', 'color': 'red'}],
    'hands': {
        'Alice': [
            {'rank': '7', 'suit': '♥', 'color': 'red'},   # legal - same suit
            {'rank': 'Q', 'suit': '♠', 'color': 'black'},  # legal - same rank
            {'rank': '8', 'suit': '♣', 'color': 'black'},  # legal - wild
            {'rank': '3', 'suit': '♦', 'color': 'red'},    # illegal
        ]
    },
    'rule_state': {}
}

# Test individual cards
print(is_legal_play(game_state, 'Alice', {'rank': '7', 'suit': '♥'}))
# Expected: (True, 'OK')

print(is_legal_play(game_state, 'Alice', {'rank': '3', 'suit': '♦'}))
# Expected: (False, 'Must match suit ♥ or rank Q')

print(is_legal_play(game_state, 'Alice', {'rank': '8', 'suit': '♣'}))
# Expected: (True, 'OK') — 8 is always wild

# Test get_legal_plays
legal = get_legal_plays(game_state, 'Alice')
print("Legal plays:", [f"{c['rank']}{c['suit']}" for c in legal])
# Expected: ['7♥', 'Q♠', '8♣'] — the 3♦ is excluded

# Test is_game_over
print(is_game_over(game_state))
# Expected: (False, None) — Alice still has cards
```

Test with active suit:
```python
# Set an active suit (as if Alice played an 8 and chose ♦)
game_state['rule_state']['active_suit'] = '♦'

print(is_legal_play(game_state, 'Alice', {'rank': '7', 'suit': '♥'}))
# Expected: (False, ...) — ♥ doesn't match active suit ♦, 7 doesn't match Q

print(is_legal_play(game_state, 'Alice', {'rank': '3', 'suit': '♦'}))
# Expected: (True, 'OK') — matches active suit ♦
```

Type `exit()`.

The rules file works completely independently of the server.
This is the whole point — you can test, fix, and improve the rules
without running a server or a browser.

---

## PART 2 — Wire the Plugin into the Engine

### Step 3 — Import and Use the Plugin in main.py

Open `backend/main.py`. At the top, add the import:

```python
import json
import random
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import crazy_eights as rules          # ← ADD this line
# "as rules" means we refer to it as `rules` everywhere
# When we switch to Go Fish, this one line changes to:
#   import go_fish as rules
# Nothing else in main.py changes.
```

Add `rule_state` to the `game` dict:

```python
game = {
    'deck':       [],
    'hands':      {},
    'discard':    [],
    'players':    {},
    'whose_turn': None,
    'started':    False,
    'rule_state': {},          # ← ADD — reserved for rule-specific data
}
```

Also reset `rule_state` in `deal_game()`:

```python
def deal_game():
    game['deck'] = make_deck()
    game['discard'] = []
    game['started'] = True
    game['rule_state'] = {}    # ← ADD — reset rule state for a fresh game
    # ... rest of deal_game unchanged
```

Now **replace** the old `is_legal_play()` function in `main.py` with a call
to the plugin. Delete the entire `is_legal_play()` function you wrote in Lab G3.
The plugin provides it now.

Find the place in `websocket_endpoint` where you called `is_legal_play(player_name, card)`.
Replace it with:

```python
                if data['type'] == 'play':
                    card = {'rank': data['rank'], 'suit': data['suit'], 'color': data.get('color', '')}

                    # Check legality via the rules plugin
                    legal, reason = rules.is_legal_play(game, player_name, card)
                    # ↑ was: is_legal_play(player_name, card)
                    # Now: rules.is_legal_play(game, player_name, card)
                    # The plugin receives the full game state, not just parts

                    if not legal:
                        await websocket.send_text(json.dumps({
                            'type':   'illegal',
                            'reason': reason
                        }))

                    else:
                        execute_play(player_name, card)

                        # Ask the plugin if there are side effects
                        side_effects = rules.on_card_played(game, player_name, card)
                        # side_effects is a dict — e.g. {'requires_suit_choice': True}

                        if side_effects.get('requires_suit_choice'):
                            # Player played an 8 — they must choose a suit before
                            # the turn switches. Send a special message to THIS player only.
                            action = f"{player_name} played {card['rank']}{card['suit']} — choose a suit"
                            await send_to(player_name, {
                                'type':        'choose_suit',
                                'last_action': action,
                            })
                            # Also notify the opponent that a suit is being chosen
                            for pid in game['players']:
                                if pid != player_name:
                                    await send_to(pid, {
                                        'type':        'game_update',
                                        **build_update_message(pid, action),
                                        # ** "unpacks" the dict — merges its keys into this dict
                                        # This adds all keys from build_update_message
                                        # plus the 'type' key above
                                    })
                        else:
                            # Normal play — switch turns and update both players
                            action = f"{player_name} played {card['rank']}{card['suit']}"
                            for pid in game['players']:
                                await send_to(pid, build_update_message(pid, action))

                        # Check if the game is over
                        over, winner = rules.is_game_over(game)
                        if over:
                            for pid in game['players']:
                                await send_to(pid, {
                                    'type':   'game_over',
                                    'winner': winner,
                                    'message': f'{winner} wins!'
                                })
```

Add a handler for the `choose_suit` message type in the while loop:

```python
                elif data['type'] == 'choose_suit':
                    suit = data.get('suit', '')
                    ok, reason = rules.apply_suit_choice(game, player_name, suit)

                    if not ok:
                        await websocket.send_text(json.dumps({
                            'type':   'illegal',
                            'reason': reason
                        }))
                    else:
                        # Suit chosen — NOW switch the turn
                        player_ids = list(game['players'].keys())
                        current_index = player_ids.index(player_name)
                        next_index = (current_index + 1) % len(player_ids)
                        game['whose_turn'] = player_ids[next_index]

                        action = f"{player_name} chose {suit}"
                        for pid in game['players']:
                            await send_to(pid, {
                                **build_update_message(pid, action),
                                'type': 'game_update',
                                'active_suit': suit,
                                # Tell the frontend the active suit for display
                            })
```

Also update `build_update_message` to include the active suit:

```python
def build_update_message(player_id: str, last_action: str) -> dict:
    player_ids = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]

    rule_state = game.get('rule_state', {})

    return {
        'type':           'game_update',
        'your_hand':      game['hands'][player_id],
        'opponent_count': len(game['hands'][opponent_id]),
        'top_card':       game['discard'][-1],
        'whose_turn':     game['whose_turn'],
        'last_action':    last_action,
        'deck_count':     len(game['deck']),
        'active_suit':    rule_state.get('active_suit', None),  # ← ADD
        # None means no override — use the top card's suit
        # '♥' means an 8 was played and hearts were chosen
    }
```

### SAVE AND TRY

Restart the server. Join as Alice and Bob. Play cards.

**Everything from Lab G3 should still work** — the plugin gives the
same answers for normal cards. You haven't broken anything.

**In DevTools Console (Alice's tab)**, force-send a message:
```javascript
socket.send(JSON.stringify({type: 'play', rank: '8', suit: '♠'}))
```
(This will only work if Alice actually has the 8♠ — otherwise the server
rejects it as "You don't have that card".)

If Alice has any 8, play it by clicking it.

**You should see:** The server sends `choose_suit` back to Alice.
In the terminal, you'll see the message logged.
The frontend doesn't handle `choose_suit` yet — that's next.

---

## PART 3 — The Suit Picker UI

### Step 4 — Add the Suit Picker to the HTML

Inside the game table div, after the piles and before your hand, add:

```html
            <!-- Suit picker — shown only after playing an 8 -->
            <div id="suit-picker" style="display:none">
                <div class="suit-picker-label">CHOOSE A SUIT:</div>
                <div class="suit-picker-buttons">
                    <button class="suit-btn spade"   data-suit="♠">♠ SPADES</button>
                    <button class="suit-btn heart"   data-suit="♥">♥ HEARTS</button>
                    <button class="suit-btn diamond" data-suit="♦">♦ DIAMONDS</button>
                    <button class="suit-btn club"    data-suit="♣">♣ CLUBS</button>
                </div>
            </div>
```

Add CSS for the picker:

```css
        #suit-picker {
            background: var(--bg-card);
            border: 1px solid var(--color-accent);
            border-radius: 8px;
            padding: 16px 20px;
            text-align: center;
        }

        .suit-picker-label {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 0.2em;
            color: var(--color-muted);
            margin-bottom: 12px;
        }

        .suit-picker-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        .suit-btn {
            padding: 10px 16px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            border-radius: 5px;
            border: 1px solid;
            cursor: pointer;
            letter-spacing: 0.05em;
            background: transparent;
            transition: background 0.15s;
        }

        .suit-btn.spade, .suit-btn.club {
            color: var(--color-black);
            border-color: var(--color-black);
        }

        .suit-btn.heart, .suit-btn.diamond {
            color: var(--color-red);
            border-color: var(--color-red);
        }

        .suit-btn:hover {
            background: var(--bg-table);
        }
```

### Step 5 — Handle choose_suit and Active Suit Display

Add to the element references at the top of your script:

```javascript
        const suitPicker  = document.getElementById('suit-picker')
        const suitButtons = document.querySelectorAll('.suit-btn')
```

Add to `handleMessage`:

```javascript
                case 'choose_suit':
                    // Server says: you played an 8, choose a suit
                    suitPicker.style.display = 'block'
                    statusBar.textContent = message.last_action || 'Choose a suit'
                    break

                case 'game_over':
                    statusBar.textContent = `🏆 ${message.message}`
                    suitPicker.style.display = 'none'
                    // Disable all card interaction
                    playerHandEl.querySelectorAll('.card').forEach(el => {
                        el.style.pointerEvents = 'none'
                        // pointerEvents: none = clicks pass through, card is unclickable
                    })
                    break
```

Wire the suit buttons:

```javascript
        suitButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const suit = btn.dataset.suit
                // dataset.suit reads the data-suit="♠" attribute from the HTML

                socket.send(JSON.stringify({
                    type: 'choose_suit',
                    suit: suit,
                }))

                suitPicker.style.display = 'none'
                // Hide the picker immediately — server response will update the table
            })
        })
```

Update `updateTable` to show the active suit indicator:

```javascript
        function updateTable(message) {
            // ... all existing code ...

            // Active suit indicator
            if (message.active_suit) {
                statusBar.textContent =
                    `Active suit: ${message.active_suit}  |  ` +
                    (isMyTurn ? '▸ YOUR TURN' : `▸ ${message.whose_turn}'s TURN`)
            }

            // Hide suit picker on any table update (it was resolved)
            suitPicker.style.display = 'none'
        }
```

### SAVE AND TRY — The Wild 8

Restart the server. Join as Alice and Bob.

Play cards normally until someone plays an 8.
(If you want to force it: temporarily make Alice's hand contain an 8
that matches the top card, or play until one appears naturally.)

**When an 8 is played:**
- The suit picker appears for the player who played the 8
- The opponent's status bar shows "Alice played 8♣ — choose a suit"
- The opponent cannot play — it's not their turn yet

**After choosing a suit:**
- The picker disappears
- The status bar shows "Active suit: ♥" (or whichever was chosen)
- The opponent must now play a ♥ or an 8
- Trying to play a non-♥ non-8 card shakes and shows the correct reason

---

## 🎯 Challenge: Show the Active Suit Visually on the Discard Pile

**You know:** `message.active_suit` contains the chosen suit (or null).
The discard pile is rendered with `renderCard(message.top_card)`.
You can add extra HTML next to or on top of the card.

**Task:** When there's an active suit, show a small badge on or near the
discard pile indicating the required suit. Example:

```
[8♣]  →  ♥
         (required)
```

The badge should use the suit's color (red for ♥/♦, blue/black for ♠/♣).
It disappears when `active_suit` is null.

**Hint:** In `updateTable()`, after rendering the discard pile with
`discardEl.innerHTML = renderCard(message.top_card)`, you can append
additional HTML with `discardEl.innerHTML +=`.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
            // In updateTable(), after rendering the discard pile:
            discardEl.innerHTML = renderCard(message.top_card)

            if (message.active_suit) {
                const isRed = message.active_suit === '♥' || message.active_suit === '♦'
                const colorClass = isRed ? 'red-suit' : 'black-suit'
                discardEl.innerHTML += `
                    <div class="active-suit-badge ${colorClass}">
                        ${message.active_suit}
                    </div>
                `
            }
```

**CSS:**
```css
        .active-suit-badge {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--bg-table);
            border: 1.5px solid currentColor;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
```

Note: `discardEl` needs `position: relative` for the badge's
`position: absolute` to work correctly. Add that to `.pile-group`:
```css
        .pile-group {
            position: relative;
            /* ... existing styles */
        }
```

**Key insight:** `position: absolute` positions an element relative to its
nearest ancestor with `position: relative` (or `absolute` or `fixed`).
Without setting `position: relative` on a parent, the badge would position
itself relative to the entire page — not the card.

</details>

---

## 🎯 Challenge: Highlight Legal Plays with Active Suit Awareness

**You know:** In Lab G3 you highlighted playable cards based on suit/rank matching.
But that code doesn't know about the active suit — it checks `top_card.suit`,
not `active_suit`.

**Task:** Update the frontend card highlighting to respect the active suit.
When `message.active_suit` is set, a card is playable if:
- It matches `message.active_suit` (not the top card's suit), OR
- Its rank matches the top card's rank, OR
- It's an 8 (wild)

**Where to change:** The `canPlay` calculation inside `cardEls.forEach()` in `updateTable()`.

---

<details>
<summary>▶ Show Solution</summary>

```javascript
                if (isMyTurn) {
                    const effectiveSuit = message.active_suit || message.top_card.suit
                    // Use active_suit if set, otherwise use the top card's suit

                    const canPlay = (
                        card.rank === '8' ||              // wild card — always playable
                        card.suit === effectiveSuit ||    // matches effective suit
                        card.rank === message.top_card.rank  // matches top card rank
                    )
                    cardEl.classList.add(canPlay ? 'playable' : 'not-playable')
                }
```

**Key insight:** The frontend and backend must agree on the rules.
If the frontend highlights a card as playable but the server rejects it,
the player clicks it, sees a shake, and is confused. The frontend
highlighting is derived from the same logic as the server validation —
they should be mirrors of each other. This is why the `get_legal_plays()`
function exists in the plugin: in a future version, the server could
send the list of legal plays directly, and the frontend wouldn't need
to recalculate it at all.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Normal plays still work | Play a matching card — still works as before |
| 8 is always playable | Click an 8 regardless of top card — suit picker appears |
| Suit picker appears | After playing 8 — picker shows for card player only |
| Opponent sees "choosing" | Opponent status shows player is choosing a suit |
| Suit choice applies | After choosing ♥ — next player must play ♥ or 8 |
| Active suit shown | Status bar or badge shows the required suit |
| Active suit clears | Play a ♥ on active ♥ — active suit disappears |
| Wrong suit rejected | Try playing ♠ when ♥ is active — shake + reason |
| Game over message | Empty your hand — "X wins!" appears on both screens |
| Rules in plugin only | main.py contains no Crazy Eights-specific logic |
| Plugin testable alone | `python`, `from crazy_eights import is_legal_play`, test passes |

---

## Quick Check Answers

**1. What's the problem with `is_legal_play()` living in `main.py`?**
When you add a second game, you'd have to add its rules to `main.py` too.
Every new game makes `main.py` bigger and more complex. Changing Crazy Eights
rules risks accidentally breaking Go Fish logic. And you can't test the rules
in isolation — you'd have to run the full server to test a single rule.
The plugin separates concerns: `main.py` manages connections and state,
`crazy_eights.py` knows the rules. Neither needs to know the other's internals.

**2. How does the server know the active suit after an 8 is played?**
`game_state['rule_state']['active_suit']` stores it explicitly.
The top card on the discard pile is still the 8 (with its original suit),
but `is_legal_play()` checks `active_suit` first — if it's set, that's
the suit that must be matched, not the top card's suit. When a non-8 card
is played, `on_card_played()` clears `active_suit` back to `None`.
The rule_state sub-dict is the plugin's private storage area — it can
put anything it needs there without conflicting with the engine's data.

**3. What does it mean for a function to be "pure"? Why does it matter?**
A pure function always returns the same output for the same input,
and has no side effects (doesn't modify anything outside itself).
`is_legal_play(game_state, player_id, card)` should be pure — given the
same game state and card, it always returns the same legal/illegal answer.
This matters for plugins because pure functions are easy to test (no server
needed), easy to reason about (no hidden dependencies), and safe to call
multiple times (no unexpected mutations). `on_card_played()` is NOT pure
(it modifies `game_state['rule_state']`) — that's intentional and
documented. Knowing which functions are pure and which aren't is a key
part of understanding and maintaining a codebase.

---

## What's Next — Lab G5

The game has rules. 8s are wild. The game ends correctly.

Lab G5 adds the scoring and rematch system:
- Scoring: the loser's remaining hand value is added to the winner's score
  (number cards = face value, face cards = 10, 8s = 50)
- Score persists across rematches (stored in the server's `game` dict)
- "Play Again" button resets the deck and deals fresh hands — scores remain
- Score displayed in the UI for both players
- The scoring calculation lives in `crazy_eights.py` — the engine doesn't know how points work

---

*Lab G4 complete. 8s are wild. Rules live in a plugin. The engine knows nothing about Crazy Eights.*
