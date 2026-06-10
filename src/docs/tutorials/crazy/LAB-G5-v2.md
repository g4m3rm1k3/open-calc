# Card Engine — LAB G5 — Score and Rematch

**Prerequisites:** Lab G4 complete. 8s are wild, suit picker works,
game ends when a hand is empty, rules live in `crazy_eights.py`.

**What this lab adds:**
- Hand value scoring — loser's remaining cards add points to the winner's total
- Scores persist across rematches — the server remembers between games
- A "Play Again" button appears when the game ends
- Both players must click it before new cards are dealt
- Score display visible during and after each game
- All scoring logic lives in `crazy_eights.py` — the engine never knows point values

**Time:** 90–120 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. After a game ends, the server needs to reset for a new game but keep the scores.
>    Right now `deal_game()` resets everything. What should it reset and what
>    should it preserve?
> 2. The scoring rule: number cards = face value, face cards = 10, 8s = 50.
>    In Python, how would you turn the rank string `"K"` into the number `10`?
>    How would you turn `"7"` into `7`?
> 3. Both players must agree to rematch before new cards are dealt. What is the
>    minimum state the server needs to track to know when BOTH have agreed?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
Game ends — Alice wins:

┌──────────────────────────────────────────┐
│  🏆 ALICE WINS                           │
│                                          │
│  SCORES                                  │
│  Alice    67 pts  (+67)                  │
│  Bob       0 pts                         │
│                                          │
│  Bob had: K♠ 7♥ 8♦  (10 + 7 + 50 = 67) │
│                                          │
│  [ PLAY AGAIN ]                          │
│  Waiting for Bob...                      │
└──────────────────────────────────────────┘
```

Both click Play Again → new cards dealt instantly → scores stay.

---

## PART 1 — Scoring Logic in the Plugin

### Concept: Dictionary Lookup Tables

**What it is:** Using a dictionary to map input values to output values,
replacing a chain of `if/elif` conditions.

**The problem without it:**
```python
def card_value(rank):
    if   rank == 'A':  return 1
    elif rank == '2':  return 2
    elif rank == '3':  return 3
    # ... 10 more conditions ...
    elif rank == '8':  return 50
    elif rank == 'J':  return 10
    elif rank == 'Q':  return 10
    elif rank == 'K':  return 10
```
Fourteen `if/elif` branches. Adding a new rank means adding a new branch.
Finding a specific value means scanning all branches.

**The solution:**
```python
CARD_VALUES = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 50, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10,
}
value = CARD_VALUES.get(rank, 0)
# .get(key, default) returns 0 if rank is not in the dict — safe default
```

**Canonical example (General Explanation):**
A phone book maps names to phone numbers. You look up "Alice" and get her number —
you do not scan every entry asking "is this Alice? is this Alice?"
A dictionary lookup works the same way: given a key (`'K'`), it returns the
stored value (`10`) directly, without scanning any conditions.

**Project Application (The "Why" here):**
`CARD_VALUES` maps each rank string to its point value. The unusual entries
(`'8': 50`) make 8s expensive to be caught with — punishing the player who
could not play their wild card before someone else won.
`'10'` is a string (not the number 10) because all ranks are stored as strings —
consistent types prevent bugs where `10 == '10'` returns `False` in comparisons.

**Watch for:** `.get(key, default)` is safer than `dict[key]` when a key
might not exist. `CARD_VALUES['Z']` raises `KeyError`. `CARD_VALUES.get('Z', 0)`
returns `0`. For a real deck you know all ranks, but defensive defaults
prevent crashes from unexpected data.

---

### Step 1 — Add the CARD_VALUES Constant to the Plugin

Open `backend/crazy_eights.py`. Find the `WILD_RANK` line near the top:

```python
WILD_RANK = '8'
```

After it, add:

```python
WILD_RANK = '8'

CARD_VALUES = {          # ← add from here
    'A':  1,
    '2':  2,
    '3':  3,
    '4':  4,
    '5':  5,
    '6':  6,
    '7':  7,
    '8':  50,
    '9':  9,
    '10': 10,
    'J':  10,
    'Q':  10,
    'K':  10,
}
# Maps each rank string to its point value.
# 8s are worth 50 — the most expensive card to be caught holding.
# Face cards (J, Q, K) are worth 10.
# Ace is worth 1 (low in standard Crazy Eights).
                         # ← add to here
```

**Why 8s are worth 50:** The high penalty reflects their strategic value —
an 8 is the most powerful card in the game (plays on anything AND changes
the required suit). Being caught with one when the opponent goes out costs
you heavily, incentivizing players to play their 8s strategically rather
than hoarding them.

### SAVE AND TRY

```
python
```

```python
from crazy_eights import CARD_VALUES

print(CARD_VALUES['K'])
print(CARD_VALUES['8'])
print(CARD_VALUES['10'])
print(CARD_VALUES.get('Z', 0))
```

**Expected:**
```
10
50
10
0
```

`'Z'` is not a valid rank — `.get` returns the default `0` instead of crashing.
Type `exit()`.

---

### Step 2 — Write hand_value()

After the `CARD_VALUES` dict, add the function signature:

```python
CARD_VALUES = { ... }


def hand_value(hand: list) -> int:    # ← add this line
```

**Why this function belongs in the plugin, not in `main.py`:**
The rule "8s are worth 50 points" is a Crazy Eights rule.
If you added Go Fish, it would have completely different scoring (or no scoring).
The engine should not know point values — it only calls `rules.hand_value(hand)`
and receives a number back. What that number means is the plugin's concern.

Add the function body:

```python
def hand_value(hand: list) -> int:

    total = 0    # ← add from here
    # Start at 0 and accumulate — same pattern as adding up a receipt

    for card in hand:
        value  = CARD_VALUES.get(card['rank'], 0)
        # Look up this card's rank in CARD_VALUES.
        # .get(key, 0) returns 0 if the rank is somehow not in the dict.
        total += value
        # += means "add to the existing total":
        # total = total + value (same result, shorter syntax)

    return total
                 # ← add to here
```

### SAVE AND TRY

```
python
```

```python
from crazy_eights import hand_value

hand = [
    {'rank': 'K', 'suit': '♠', 'color': 'black'},
    {'rank': '7', 'suit': '♥', 'color': 'red'},
    {'rank': '8', 'suit': '♦', 'color': 'red'},
]
print(hand_value(hand))
# Expected: 10 + 7 + 50 = 67
```

```python
empty_hand = []
print(hand_value(empty_hand))
# Expected: 0 — no cards, no points
```

```python
all_faces = [
    {'rank': 'J', 'suit': '♠', 'color': 'black'},
    {'rank': 'Q', 'suit': '♥', 'color': 'red'},
    {'rank': 'K', 'suit': '♦', 'color': 'red'},
]
print(hand_value(all_faces))
# Expected: 10 + 10 + 10 = 30
```

Type `exit()`.

---

### Step 3 — Write calculate_scores()

After `hand_value()`, add:

```python
    return total


def calculate_scores(game_state: dict, winner_id: str) -> dict:    # ← add from here
```

**Why this function returns deltas (changes) rather than absolute totals:**
The engine accumulates scores over multiple games. The plugin's job is to say
"how many points does each player GAIN from this game."
The engine adds those deltas to the running totals.
Separating "what this game contributed" from "total so far" makes both pieces
easier to understand and test independently.

Add the body:

```python
def calculate_scores(game_state: dict, winner_id: str) -> dict:

    deltas = {}    # ← add from here
    # Will hold {player_id: points_gained_this_round}
    # Keys are player IDs, values are the point gains (0 for loser)

    for player_id, hand in game_state['hands'].items():
        if player_id == winner_id:
            other_hands_total = sum(
                hand_value(h)
                for pid, h in game_state['hands'].items()
                if pid != player_id
            )
            # sum() adds up all values from the generator expression.
            # The generator expression computes hand_value(h) for each
            # opponent's hand — then sum() adds those values together.
            # With 2 players: just one opponent's hand value.
            # With 4 players: the sum of all three opponents' hand values.
            deltas[player_id] = other_hands_total
        else:
            deltas[player_id] = 0
            # Loser gains nothing — only the winner scores

    return deltas
                   # ← add to here
```

**Why the loser explicitly gets `0` rather than being omitted from the dict:**
The caller iterates over `deltas` and adds each value to the running score.
If the loser is missing from `deltas`, the caller would need special logic
to handle the missing key. Explicit `0` means the caller can do
`game['scores'][pid] += deltas[pid]` for every player without any special cases.

### SAVE AND TRY

```
python
```

```python
from crazy_eights import calculate_scores

game_state = {
    'hands': {
        'Alice': [],    # Alice won — empty hand
        'Bob': [
            {'rank': 'K', 'suit': '♠', 'color': 'black'},
            {'rank': '7', 'suit': '♥', 'color': 'red'},
            {'rank': '8', 'suit': '♦', 'color': 'red'},
        ],
    }
}

deltas = calculate_scores(game_state, 'Alice')
print(deltas)
# Expected: {'Alice': 67, 'Bob': 0}
# Alice gets 10 + 7 + 50 = 67 from Bob's remaining hand
```

```python
# Test the other direction
deltas = calculate_scores(game_state, 'Bob')
print(deltas)
# Expected: {'Alice': 0, 'Bob': 0}
# Bob wins but Alice's hand is empty — no points to score
```

Type `exit()`.

---

## PART 2 — Server: Persistent Scores and Rematch

### Step 4 — Add scores and rematch_votes to the game Dict

Open `backend/main.py`. Find the `game` dict:

```python
game = {
    'deck':       [],
    'hands':      {},
    'discard':    [],
    'players':    {},
    'whose_turn': None,
    'started':    False,
    'rule_state': {},
}
```

Add two new keys:

```python
game = {
    'deck':          [],
    'hands':         {},
    'discard':       [],
    'players':       {},
    'whose_turn':    None,
    'started':       False,
    'rule_state':    {},
    'scores':        {},     # ← add this line — {player_id: total_score}
    'rematch_votes': set(),  # ← add this line — set of player IDs who clicked Play Again
}
# scores is NOT reset between games — it accumulates across all rematches.
# rematch_votes IS reset at the start of each new game.
# set() stores unique items — clicking Play Again twice counts as one vote.
```

**Why a `set` for `rematch_votes` instead of a list:**
Sets automatically prevent duplicates — if a player clicks Play Again twice,
their ID is only stored once. A list would let duplicates accumulate,
making `len(rematch_votes) == len(players)` false even when both players voted.
Sets are the right data structure when you care about membership and uniqueness,
not order.

### SAVE AND TRY

```
python
```

```python
from main import game

print(type(game['scores']))
print(type(game['rematch_votes']))
print(game['scores'])
print(game['rematch_votes'])
```

**Expected:**
```
<class 'dict'>
<class 'set'>
{}
set()
```

Type `exit()`.

---

### Step 5 — Update deal_game() to Preserve Scores

Open `main.py`. Find `deal_game()`. After `game['rule_state'] = {}`, add:

```python
def deal_game():
    game['deck']          = make_deck()
    game['discard']       = []
    game['started']       = True
    game['rule_state']    = {}
    game['rematch_votes'] = set()    # ← add this line
    # Reset votes for the new game — previous votes should not carry over
    # scores is intentionally NOT reset here — it accumulates across games

    player_ids = list(game['players'].keys())

    for player_id in player_ids:
        if player_id not in game['scores']:    # ← add from here
            game['scores'][player_id] = 0
            # Only initialize to 0 if this player has no score yet.
            # Players returning from a previous game keep their accumulated score.
                                               # ← add to here
```

**Why `if player_id not in game['scores']`:** Without this check, every call
to `deal_game()` would reset scores to 0 — including rematches. The condition
ensures only NEW players (who have never had a score) start at 0.
Returning players keep what they earned in previous rounds.

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()

print('Scores after first deal:', game['scores'])
# Expected: {'Alice': 0, 'Bob': 0}

# Simulate Alice accumulating some points
game['scores']['Alice'] = 67

deal_game()
print('Scores after second deal:', game['scores'])
# Expected: {'Alice': 67, 'Bob': 0} — Alice keeps her 67 points
```

Type `exit()`.

---

### Step 6 — Update the Game-Over Handler to Apply Scores

Open `main.py`. Find the game-over block inside the `play` handler.
It currently looks like:

```python
                    over, winner = check_game_over()

                    if over:
                        for pid in game['players']:
                            await send_to(pid, {
                                'type':    'game_over',
                                'winner':  winner,
                                'message': f'{winner} wins!',
                                'scores':  dict(game.get('scores', {})),
                            })
```

Replace the `if over:` block content:

```python
                    over, winner = check_game_over()

                    if over:
                        deltas = rules.calculate_scores(game, winner)    # ← add from here
                        # Ask the plugin how many points each player earns.
                        # Returns {'Alice': 67, 'Bob': 0} for example.

                        for pid, delta in deltas.items():
                            if pid not in game['scores']:
                                game['scores'][pid] = 0
                                # Safety: initialize if somehow missing
                            game['scores'][pid] += delta
                            # Add this round's earnings to the running total

                        loser_hands = {
                            pid: game['hands'][pid]
                            for pid in game['players']
                            if pid != winner
                        }
                        # Dict comprehension: build a dict of losing players' hands.
                        # { key: value for item in iterable if condition }
                        # Equivalent to a for loop that builds a dict.
                        # With 2 players: just one entry — the loser's cards.

                        game['started'] = False
                        # Mark game as over so rematch flow can begin

                        for pid in game['players']:
                            await send_to(pid, {
                                'type':        'game_over',
                                'winner':      winner,
                                'message':     f'{winner} wins!',
                                'scores':      dict(game['scores']),
                                'score_delta': deltas[pid],
                                # How many points THIS player gained this round
                                'loser_hands': loser_hands,
                                # The losing player's cards — shown on game over screen
                            })
                                                                         # ← add to here
```

**Why send `loser_hands` to both players:** The winner sees what they scored
from (the loser's remaining cards). The loser sees what they were holding
when the game ended. Both perspectives use the same data — you send it once
in the message rather than computing it differently per player.

---

### Step 7 — Add the rematch Message Handler

In the WebSocket `while True` loop, after the `choose_suit` handler, add:

```python
            elif data['type'] == 'choose_suit':
                ...

            elif data['type'] == 'rematch':                    # ← add from here
                game['rematch_votes'].add(player_name)
                # .add() adds to the set — duplicate clicks are ignored automatically

                if len(game['rematch_votes']) == len(game['players']):
                    deal_game()
                    # ALL connected players voted for rematch — deal new cards
                    # deal_game() resets deck/hands/discard/rule_state but keeps scores

                    for pid in game['players']:
                        await send_to(pid, build_dealt_message(pid))
                        # Send each player their new hand — same message as the initial deal
                else:
                    remaining = len(game['players']) - len(game['rematch_votes'])
                    await websocket.send_text(json.dumps({
                        'type':    'waiting_rematch',
                        'message': f'Waiting for {remaining} more player(s)...',
                    }))
                    # Tell this player how many others still need to vote
                                                               # ← add to here
```

**Why `len(game['rematch_votes']) == len(game['players'])`:** This works for any
number of players — not just two. If you later support 3 or 4 players, the same
condition handles it. You never hardcode `== 2`.

### SAVE AND TRY

```
python
```

```python
from main import game, deal_game

game['players']['Alice'] = None
game['players']['Bob']   = None
deal_game()
game['scores']['Alice'] = 67    # simulate Alice winning a round

# Simulate rematch vote flow
game['rematch_votes'].add('Alice')
print('After Alice votes:', len(game['rematch_votes']), 'votes of', len(game['players']))
# Expected: 1 votes of 2

game['rematch_votes'].add('Alice')    # duplicate click
print('After Alice votes again:', len(game['rematch_votes']), 'votes of', len(game['players']))
# Expected: still 1 — set ignores duplicates

game['rematch_votes'].add('Bob')
print('All voted?', len(game['rematch_votes']) == len(game['players']))
# Expected: True

deal_game()    # simulates what the server does when all vote
print('Scores after rematch deal:', game['scores'])
# Expected: {'Alice': 67, 'Bob': 0} — scores preserved
```

Type `exit()`.

---

## PART 3 — Frontend: Game Over Screen

### Step 8 — Add the Game Over HTML

In `index.html`, inside `#game-table`, after `#status-bar`, add:

```html
        <div id="status-bar">Connecting...</div>

        <div id="game-over-screen" style="display:none">    <!-- ← add from here -->
            <div id="go-title">GAME OVER</div>
            <div id="go-scores"></div>
            <div id="go-hands"></div>
            <button id="rematchBtn">PLAY AGAIN</button>
            <div id="go-status"></div>
        </div>                                              <!-- ← add to here -->
```

**Why a separate screen inside `#game-table` instead of replacing the whole table:**
The game table structure stays in place. The game-over screen overlays on top of it
(or appears below it). When a rematch starts, hiding the game-over screen reveals
the table with the new hand — no need to rebuild the table structure.

### CSS AND SEE

Save. Refresh. Join two tabs.

**You should see:** No change — the screen is hidden with `display:none`.
The HTML is valid.

---

### Step 9 — Style the Game Over Screen Container

In the style block, after `#status-bar`, add:

```css
        #status-bar {
            /* ... existing ... */
        }

        #game-over-screen {                          /* ← add from here */
            background:    var(--bg-card);
            border:        1px solid var(--color-accent);
            border-radius: 8px;
            padding:       24px;
            text-align:    center;
            display:       flex;
            flex-direction: column;
            gap:           16px;
        }                                            /* ← add to here */
```

**Why `flex-direction: column` with `gap: 16px`:** The game-over screen
stacks its children vertically (title, scores, hand details, button, status).
Using `gap` instead of `margin` on each child means the spacing is defined
once on the parent — easier to adjust uniformly.

### CSS AND SEE

Save. In DevTools Console (on a tab with the game running), show the screen:

```javascript
document.getElementById('game-over-screen').style.display = 'flex'
```

**Why `'flex'` not `'block'`:** The container uses `display: flex` in CSS,
which only activates when `display` is not `none`. Setting it to `'flex'`
activates the flex layout. Setting it to `'block'` would show the content
but lose the flex column layout and gap spacing.

**You should see:** An outlined box appears below the status bar.
Empty but with the correct background and border. Hide it again:

```javascript
document.getElementById('game-over-screen').style.display = 'none'
```

---

### Step 10 — Style the Game Over Title

After `#game-over-screen`, add:

```css
        #game-over-screen {
            /* ... existing ... */
        }

        #go-title {                                  /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      18px;
            letter-spacing: 0.25em;
            color:          var(--color-accent);
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. Show the screen. The title area is now styled.
**You should see:** "GAME OVER" in large green monospace text.
Hide the screen again.

---

### Step 11 — Style the Score Rows

After `#go-title`, add:

```css
        #go-title {
            /* ... existing ... */
        }

        .go-score-row {                              /* ← add from here */
            display:         flex;
            justify-content: space-between;
            padding:         6px 20px;
            font-family:     'Courier New', monospace;
            font-size:       12px;
            color:           var(--color-text);
        }

        .go-score-row.winner {
            color: var(--color-accent);
            /* Winner row uses the accent color to stand out */
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. In DevTools Console, inject a test score row:

```javascript
document.getElementById('game-over-screen').style.display = 'flex'
document.getElementById('go-scores').innerHTML = `
  <div class="go-score-row winner"><span>Alice</span><span>67 pts (+67)</span></div>
  <div class="go-score-row"><span>Bob</span><span>0 pts</span></div>
`
```

**You should see:** Two rows — Alice's in green (winner), Bob's in normal text.
The flex layout pushes names left and scores right.

```javascript
document.getElementById('game-over-screen').style.display = 'none'
```

---

### Step 12 — Style the Play Again Button

After `.go-score-row.winner`, add:

```css
        .go-score-row.winner {
            /* ... existing ... */
        }

        #rematchBtn {                                /* ← add from here */
            padding:        12px 32px;
            background:     var(--color-accent);
            color:          #000000;
            border:         none;
            border-radius:  4px;
            font-family:    'Courier New', monospace;
            font-size:      12px;
            letter-spacing: 0.15em;
            cursor:         pointer;
            font-weight:    bold;
            align-self:     center;
        }
        /* align-self: center — centers this button horizontally within the
           flex column. Without it, flex items stretch to fill the container width. */

        #rematchBtn:disabled {
            opacity: 0.35;
            cursor:  not-allowed;
        }                                            /* ← add to here */
```

### CSS AND SEE

Save. Show the screen:

```javascript
document.getElementById('game-over-screen').style.display = 'flex'
```

**You should see:** A centered green "PLAY AGAIN" button with black text.

```javascript
document.getElementById('rematchBtn').disabled = true
```

**You should see:** Button grays out to 35% opacity.

```javascript
document.getElementById('rematchBtn').disabled = false
document.getElementById('game-over-screen').style.display = 'none'
```

---

### Step 13 — Style the Go Status Text

After `#rematchBtn:disabled`, add:

```css
        #rematchBtn:disabled {
            /* ... existing ... */
        }

        #go-status {                                 /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      10px;
            color:          var(--color-muted);
            letter-spacing: 0.1em;
            min-height:     16px;
        }
        /* min-height prevents layout shift when the waiting message appears */
                                                     /* ← add to here */
```

### CSS AND SEE

Save. Show the screen. Inject a status message:

```javascript
document.getElementById('game-over-screen').style.display = 'flex'
document.getElementById('go-status').textContent = 'Waiting for Bob...'
```

**You should see:** Small muted text below the button. Hide everything again.

---

## PART 4 — Frontend: JavaScript for Game Over

### Step 14 — Add Element References for Game Over Screen

In the `<script>` block, in the element references section, add:

```javascript
        const suitButtons      = document.querySelectorAll('.suit-btn')
        const gameOverScreen   = document.getElementById('game-over-screen')    // ← add from here
        const goTitle          = document.getElementById('go-title')
        const goScores         = document.getElementById('go-scores')
        const goHands          = document.getElementById('go-hands')
        const rematchBtn       = document.getElementById('rematchBtn')
        const goStatus         = document.getElementById('go-status')
                                                                                // ← add to here
```

### SAVE AND TRY

Save. Open DevTools Console. Type:

```javascript
gameOverScreen
rematchBtn
goTitle
```

**Expected:** All three return DOM elements (not `null`).
If any returns `null`, the `id` in the HTML does not match the string
passed to `getElementById` — check for typos.

---

### Step 15 — Write showGameOver()

In the `<script>` block, after `renderTable()`, add:

```javascript
        function renderTable(message) { ... }

        function showGameOver(message) {             // ← add from here
            gameOverScreen.style.display = 'flex'
            // Show the game-over overlay

            const iWon = message.winner === myName
            // Did this player win? myName was set when they joined.

            goTitle.textContent = iWon ? '🏆 YOU WIN!' : `${message.winner} WINS`
            goTitle.style.color = iWon
                ? 'var(--color-accent)'
                : 'var(--color-red)'
            // Winner sees green title, loser sees red title
        }
                                                     // ← add to here
```

### SAVE AND TRY

Save. Restart the server. Join two tabs. In Alice's DevTools Console, simulate
a game_over message:

```javascript
handleMessage({
    type: 'game_over',
    winner: 'Alice',
    message: 'Alice wins!',
    scores: { Alice: 67, Bob: 0 },
    score_delta: 67,
    loser_hands: { Bob: [
        {rank:'K', suit:'♠', color:'black'},
        {rank:'7', suit:'♥', color:'red'},
    ]}
})
```

**You should see:** The game-over screen appears with "🏆 YOU WIN!" in green.

In Bob's DevTools Console, simulate:

```javascript
handleMessage({
    type: 'game_over',
    winner: 'Alice',
    message: 'Alice wins!',
    scores: { Alice: 67, Bob: 0 },
    score_delta: 0,
    loser_hands: { Bob: [
        {rank:'K', suit:'♠', color:'black'},
        {rank:'7', suit:'♥', color:'red'},
    ]}
})
```

**You should see:** "ALICE WINS" in red on Bob's tab.

---

### Step 16 — Add the Scores Display to showGameOver

Inside `showGameOver()`, after setting `goTitle.style.color`, add:

```javascript
            goTitle.style.color = iWon ? 'var(--color-accent)' : 'var(--color-red)'

            const scoreRows = Object.entries(message.scores)    // ← add from here
            // Object.entries() converts {Alice: 67, Bob: 0}
            // to [['Alice', 67], ['Bob', 0]]
            // This makes it iterable with .map()

            goScores.innerHTML = scoreRows.map(([pid, score]) => {
                // Destructuring: [pid, score] unpacks each ['Alice', 67] pair
                // pid = 'Alice', score = 67
                const isWinner = pid === message.winner
                const delta    = pid === myName ? message.score_delta : null
                // Only show the delta for this player's own row

                const deltaText = delta !== null && delta > 0
                    ? ` <span style="opacity:0.6;font-size:10px">(+${delta})</span>`
                    : ''
                // Show (+67) next to the score if this player gained points

                return `
                    <div class="go-score-row ${isWinner ? 'winner' : ''}">
                        <span>${pid}</span>
                        <span>${score} pts${deltaText}</span>
                    </div>
                `
            }).join('')
                                                                # ← add to here
```

**Why `Object.entries()` instead of a for loop:**
`message.scores` is a plain object. `.map()` works on arrays, not objects.
`Object.entries()` converts the object to an array of `[key, value]` pairs,
making it compatible with `.map()`. The destructuring syntax `([pid, score])`
unpacks each pair into named variables — more readable than `pair[0]` and `pair[1]`.

### SAVE AND TRY

Save. Run the same `handleMessage` simulation from Step 15.

**You should see:** Below the title, score rows appear:
- "Alice    67 pts (+67)" in green (winner row)
- "Bob       0 pts" in normal text

---

### Step 17 — Add the Losing Hand Display to showGameOver

Inside `showGameOver()`, after the scores block, add:

```javascript
            goScores.innerHTML = ...

            if (message.loser_hands) {               // ← add from here
                const handLines = Object.entries(message.loser_hands)
                    .map(([pid, hand]) => {
                        const cardNames = hand
                            .map(c => `${c.rank}${c.suit}`)
                            .join(' ')
                        // e.g. "K♠ 7♥ 8♦"

                        const fromCrazyEights = {
                            A:1, 2:2, 3:3, 4:4, 5:5,
                            6:6, 7:7, 8:50, 9:9, 10:10,
                            J:10, Q:10, K:10
                        }
                        const total = hand.reduce((sum, c) => {
                            return sum + (fromCrazyEights[c.rank] || 0)
                        }, 0)
                        // .reduce() accumulates a value across all items.
                        // Starts at 0, adds each card's value to the running sum.
                        // Initial value (0) is the second argument to reduce().

                        return `${pid}: ${cardNames || '(empty)'} = ${total} pts`
                    })
                    .join('<br>')

                goHands.innerHTML = `
                    <div style="font-family:'Courier New',monospace;font-size:10px;
                                color:var(--color-muted);line-height:1.8">
                        ${handLines}
                    </div>
                `
            }
                                                     // ← add to here
```

**Why duplicate the point values here instead of importing from the plugin:**
The frontend is a browser — it cannot `import` Python modules. The frontend
must either recalculate point values or receive them pre-calculated from the server.
Duplicating the small lookup object is simpler than adding a dedicated endpoint.
In a larger application, you would serve the values from the API.

### SAVE AND TRY

Run the same simulation:

```javascript
handleMessage({
    type: 'game_over',
    winner: 'Alice',
    message: 'Alice wins!',
    scores: { Alice: 67, Bob: 0 },
    score_delta: 67,
    loser_hands: { Bob: [
        {rank:'K', suit:'♠', color:'black'},
        {rank:'7', suit:'♥', color:'red'},
        {rank:'8', suit:'♦', color:'red'},
    ]}
})
```

**You should see:** Below the scores, "Bob: K♠ 7♥ 8♦ = 67 pts" in muted text.

---

### Step 18 — Wire the Play Again Button

After `suitButtons.forEach(...)`, add:

```javascript
        suitButtons.forEach(btn => { ... })

        rematchBtn.addEventListener('click', () => {    // ← add from here
            if (!socket || socket.readyState !== WebSocket.OPEN) return

            socket.send(JSON.stringify({ type: 'rematch' }))
            // Send the rematch vote to the server

            rematchBtn.disabled = true
            goStatus.textContent = 'Waiting for opponent...'
            // Immediate feedback — the button grays out so the player knows their click registered
        })
                                                        // ← add to here
```

**Why disable the button after clicking:** Without disabling, a player could
click multiple times. The server ignores duplicates (set deduplication), but the
visual feedback would flicker. Disabling immediately makes the UX clear:
"your vote is registered, wait for the opponent."

---

### Step 19 — Handle game_over, waiting_rematch, and dealt in handleMessage

In `handleMessage()`, update the existing cases and add new ones:

Find the existing `game_over` case:

```javascript
                case 'game_over':
                    statusBar.textContent = `🏆 ${message.message}`
                    drawBtn.disabled = true
                    handEl.querySelectorAll('.card').forEach(el => {
                        el.style.pointerEvents = 'none'
                    })
                    break
```

Replace it with:

```javascript
                case 'game_over':                     // ← replace from here
                    showGameOver(message)
                    drawBtn.disabled = true
                    handEl.querySelectorAll('.card').forEach(el => {
                        el.style.pointerEvents = 'none'
                    })
                    break
                                                      // ← replace to here
```

After the `game_over` case, add:

```javascript
                case 'game_over':
                    ...
                    break

                case 'waiting_rematch':               // ← add from here
                    goStatus.textContent = message.message
                    break
                                                      // ← add to here
```

Now update the `dealt` case to handle rematches — when both players vote,
the server sends a `dealt` message. The frontend must hide the game-over
screen and show fresh cards:

Find:

```javascript
                case 'dealt':
                    showGameTable(message)
                    break
```

Replace with:

```javascript
                case 'dealt':                         // ← replace from here
                    gameOverScreen.style.display = 'none'
                    // Hide game-over screen if it was showing (rematch)
                    rematchBtn.disabled = false
                    // Re-enable for the next game over
                    goStatus.textContent = ''
                    showGameTable(message)
                    break
                                                      // ← replace to here
```

**Why reset `rematchBtn.disabled` here:** After the rematch deal fires,
the game starts fresh. The next time a game ends, the player needs to click
Play Again again. If the button stays disabled from the previous game over,
they cannot vote for the next rematch.

### SAVE AND TRY

Restart the server. Open two tabs. Join as Alice and Bob.
Play cards until someone wins (play quickly — find matching cards and play them).

**When the game ends:**
- Game over screen appears on both tabs
- Winner sees "🏆 YOU WIN!" in green
- Loser sees "X WINS" in red
- Scores shown with delta
- Loser's remaining cards shown with point total

**Click Play Again on one tab:**
- Button grays out
- "Waiting for opponent..." appears

**Click Play Again on the other tab:**
- Game over screen disappears on both tabs
- New hands dealt — fresh cards
- Scores preserved from previous round (winner keeps their points)

**In DevTools Console:**

```javascript
socket.readyState
```
**Expected:** `1` — connection stayed open through the rematch.

**Change something:** Change `game['scores']` to reset in `deal_game()` by
temporarily adding `game['scores'] = {}` at the start. Restart server, play two
games. Scores reset to 0 after each game. Remove the line — scores persist again.

---

### Step 20 — Add the Score Bar During Play

Scores should be visible during the game too, not just after it ends.
In `index.html`, inside `#game-table`, after `#status-bar`:

```html
        <div id="status-bar">Connecting...</div>

        <div id="score-bar"></div>    <!-- ← add this line -->
```

Add CSS after `#go-status`:

```css
        #go-status {
            /* ... existing ... */
        }

        #score-bar {                                 /* ← add from here */
            font-family:    'Courier New', monospace;
            font-size:      9px;
            color:          var(--color-muted);
            letter-spacing: 0.12em;
            text-align:     right;
            min-height:     14px;
        }                                            /* ← add to here */
```

Add the element reference in the script:

```javascript
        const goStatus    = document.getElementById('go-status')
        const scoreBar    = document.getElementById('score-bar')    // ← add this line
```

In `renderTable()`, at the end, add:

```javascript
            statusBar.textContent = ...

            if (message.scores) {                    // ← add from here
                const scoreText = Object.entries(message.scores)
                    .map(([pid, score]) => `${pid}: ${score}`)
                    .join('  |  ')
                scoreBar.textContent = scoreText
                // e.g. "Alice: 67  |  Bob: 0"
            }
                                                     // ← add to here
```

### SAVE AND TRY

Restart the server. Join two tabs. Play a few cards.

**You should see:** Below the status bar, a small line shows:
"Alice: 0  |  Bob: 0" during the first game.
After a rematch where Alice won 67 points:
"Alice: 67  |  Bob: 0" — visible during the second game.

---

## 🎯 Challenge: Win Counter

**You know:** `game['scores']` persists across games. The server sends
`game_over` with `winner` set. You can add any key to the `game` dict.

**Task:** Track how many games each player has WON (separate from points).
Display it in the game-over screen next to the score.
A player with 2 wins and 67 points should show: "67 pts · 2W".

**Changes needed in two places:**
1. `main.py`: Add `'wins': {}` to the `game` dict. Initialize new players
   to `0` in `deal_game()`. Increment the winner's count in the game-over handler.
   Include `wins` in the `game_over` message.
2. `index.html`: In `showGameOver()`, update the score row template to include
   the win count from `message.wins[pid]`.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, update the `game` dict:**
```python
game = {
    # ... existing keys ...
    'scores': {},
    'wins':   {},    # ← add
}
```

**In `deal_game()`, initialize wins for new players:**
```python
    for player_id in player_ids:
        if player_id not in game['scores']:
            game['scores'][player_id] = 0
        if player_id not in game['wins']:      # ← add from here
            game['wins'][player_id] = 0
                                               # ← add to here
```

**In the game-over handler, after applying score deltas:**
```python
        game['wins'][winner] = game['wins'].get(winner, 0) + 1    # ← add
        # .get(winner, 0) safely handles the case where winner is not yet in wins
```

**In the `game_over` message:**
```python
                        await send_to(pid, {
                            'type':        'game_over',
                            # ... existing keys ...
                            'wins':        dict(game['wins']),    # ← add
                        })
```

**In `showGameOver()`, update the score row template:**
```javascript
                const winsText = message.wins && message.wins[pid] !== undefined
                    ? ` · ${message.wins[pid]}W`
                    : ''
                // "· 2W" if they have wins, empty string if not

                return `
                    <div class="go-score-row ${isWinner ? 'winner' : ''}">
                        <span>${pid}</span>
                        <span>${score} pts${deltaText}${winsText}</span>
                    </div>
                `
```

**Key insight:** Wins and score are different measurements of the same player's
performance. Keeping them in separate dicts (`scores` and `wins`) makes each
one easy to read, reset, and extend independently. If you stored them nested
(`{Alice: {score: 67, wins: 2}}`), every access would require navigating two
levels of dict. Flat structures are simpler until the complexity genuinely
requires nesting.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| hand_value calculates correctly | Python: hand_value([K♠, 7♥, 8♦]) → 67 |
| calculate_scores returns deltas | Python: winner gets loser's total, loser gets 0 |
| Scores start at 0 | Join game, score bar shows "Alice: 0  \|  Bob: 0" |
| Game over screen appears | Win a game — overlay shows on both tabs |
| Winner title is green | "🏆 YOU WIN!" in accent color on winner's tab |
| Loser title is red | "X WINS" in red on loser's tab |
| Score delta shows | "+67" appears next to winner's score in the overlay |
| Loser's hand displayed | Cards and total shown below scores |
| Play Again button centered | Button is not full-width |
| One click shows waiting | Click Play Again — "Waiting for opponent..." appears |
| Both clicks trigger deal | Second player clicks — both screens get new cards |
| Game over screen hides on rematch | Fresh game table visible after both vote |
| Scores persist after rematch | Winner keeps their points in the next game |
| Score bar updates during play | Scores visible below status bar between plays |

---

## Quick Check Answers

**1. What should deal_game() reset and what should it preserve?**
Reset: the deck, both players' hands, the discard pile, the rule state (active suit,
waiting_for_suit), and the rematch_votes set. These belong to "this round."
Preserve: `scores` and `wins` (or any other cross-game statistics). These belong
to "this session." The distinction is whether the data is about one game or
about the relationship between the players across all games. One practical rule:
if it resets when the deck resets, it belongs to the round. If it persists when
the deck resets, it belongs to the session.

**2. How do you turn "K" into 10 and "7" into 7 in Python?**
A dictionary lookup: `CARD_VALUES = {'K': 10, 'J': 10, ..., '7': 7, ...}`.
`CARD_VALUES['K']` returns `10`. `CARD_VALUES['7']` returns `7`.
This is preferable to `int(rank)` because `int('K')` raises a `ValueError` —
you cannot convert 'K' to an integer directly. The dict provides explicit
mappings for every rank, including the non-numeric ones.

**3. What is the minimum state to track for rematch votes?**
A set of player IDs who have voted. A set handles the two constraints automatically:
uniqueness (clicking twice counts once) and membership (checking "has Alice voted?"
is `'Alice' in rematch_votes`). The game starts when
`len(rematch_votes) == len(game['players'])`. No ordering, no timestamps, no extra
fields — just the set of who agreed. This is an example of choosing the right
data structure: the set's properties (uniqueness, O(1) membership check) match
exactly what the problem requires.

---

## What's Next — Lab G6

Scores work. Rematches work. The game is complete on one machine.

Lab G6 makes it playable across your local network — your coworker opens
a browser on their PC and connects to YOUR machine:
- Finding your computer's local IP address
- Running the server so other devices on WiFi can reach it
- CORS configuration for local network access
- Testing from two physical machines
- Optional: a room system so you can host multiple separate games simultaneously

---

*Lab G5 complete. Games end. Scores persist. Rematches work.*
