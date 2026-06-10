# Card Engine — LAB G5 — Score and Rematch

**Prerequisites:** Lab G4 complete. 8s are wild, suit picker works,
game ends when a hand is empty, rules live in `crazy_eights.py`.

**What this lab adds:**
- Hand value scoring — loser's remaining cards add to winner's total
- Score persists across rematches (server remembers between games)
- "Play Again" button resets the deck, deals fresh hands, keeps score
- Score displayed for both players throughout the game
- Scoring logic lives entirely in the rules plugin

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. After a game ends, the server needs to reset for a new game but keep the scores.
>    Right now `deal_game()` resets everything. What should it reset and what should it keep?
> 2. The scoring rule in Crazy Eights: number cards = face value, face cards = 10, 8s = 50.
>    How would you turn the rank string "K" into the number 10 in Python?
> 3. Both players must agree to rematch before the new game starts.
>    What state does the server need to track to know when both have agreed?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

```
Game ends — Alice wins:

┌─────────────────────────────────────────────┐
│  🏆 ALICE WINS                              │
│                                             │
│  SCORES                                     │
│  Alice    50 pts  (+50 from Bob's hand)     │
│  Bob       0 pts                            │
│                                             │
│  Bob's remaining hand:                      │
│  K♠  7♥  8♦  (value: 10 + 7 + 50 = 67)    │
│                                             │
│  [ PLAY AGAIN ]                             │
└─────────────────────────────────────────────┘

Both click Play Again → new cards dealt → scores persist
```

---

## PART 1 — Scoring Logic in the Plugin

### Concept: Separating Calculation from State

**What it means:** The scoring calculation is pure math — given a hand,
return a number. It doesn't need to know about WebSockets, connections,
or game flow. It belongs in the plugin.

The engine asks the plugin: "how many points is this hand worth?"
The engine then stores the result. The plugin calculates. The engine manages.

### Step 1 — Add Score Calculation to the Plugin

Open `backend/crazy_eights.py`. Add these functions at the bottom:

```python
# ---- Scoring ----

CARD_VALUES = {
    'A':  1,
    '2':  2,
    '3':  3,
    '4':  4,
    '5':  5,
    '6':  6,
    '7':  7,
    '8':  50,   # 8s are worth 50 points — expensive to be caught with one
    '9':  9,
    '10': 10,
    'J':  10,
    'Q':  10,
    'K':  10,
}
# A dictionary that maps rank strings to point values
# Number cards use their face value, face cards are 10, 8 is 50


def hand_value(hand: list) -> int:
    """
    Calculate the total point value of a hand of cards.
    Called on the LOSER's hand at the end of the game —
    those points are awarded to the winner.

    hand: list of card dicts
    returns: int — total point value
    """
    total = 0
    for card in hand:
        value = CARD_VALUES.get(card['rank'], 0)
        # .get(key, default) — returns 0 if the rank isn't in CARD_VALUES
        # (shouldn't happen with a real deck, but safe to handle)
        total += value
    return total


def calculate_scores(game_state: dict, winner_id: str) -> dict:
    """
    Calculate the score update after a game ends.
    Winner receives the total value of the loser's remaining hand.

    Returns a dict of score deltas: {player_id: points_added}
    """
    deltas = {}

    for player_id, hand in game_state['hands'].items():
        if player_id == winner_id:
            # Winner scores the value of all OTHER players' hands
            other_hands_value = sum(
                hand_value(h)
                for pid, h in game_state['hands'].items()
                if pid != player_id
            )
            # sum() adds up all values from the generator expression
            # generator expression: runs hand_value(h) for each opponent's hand
            deltas[player_id] = other_hands_value
        else:
            deltas[player_id] = 0
            # Loser gains nothing

    return deltas
```

### SAVE AND TRY — Test scoring in Python

```
python
```

```python
from crazy_eights import hand_value, calculate_scores

# Test hand_value
hand = [
    {'rank': 'K', 'suit': '♠', 'color': 'black'},
    {'rank': '7', 'suit': '♥', 'color': 'red'},
    {'rank': '8', 'suit': '♦', 'color': 'red'},
]
print(hand_value(hand))
# Expected: 10 + 7 + 50 = 67

# Test calculate_scores
game_state = {
    'hands': {
        'Alice': [],          # Alice won — empty hand
        'Bob':   hand,        # Bob lost — 67 points of cards
    }
}
print(calculate_scores(game_state, 'Alice'))
# Expected: {'Alice': 67, 'Bob': 0}
```

Type `exit()`.

---

## PART 2 — Server: Persistent Scores and Rematch

### Step 2 — Add Scores to the Game State

Open `backend/main.py`. Update the `game` dict to include scores and rematch tracking:

```python
game = {
    'deck':          [],
    'hands':         {},
    'discard':       [],
    'players':       {},
    'whose_turn':    None,
    'started':       False,
    'rule_state':    {},
    'scores':        {},      # ← ADD: {player_id: total_score} — persists across games
    'rematch_votes': set(),   # ← ADD: set of player IDs who clicked "Play Again"
}
# scores is NOT reset between games — it accumulates
# rematch_votes IS reset at the start of each new game
```

Update `deal_game()` to reset ONLY what should reset, keeping scores:

```python
def deal_game():
    game['deck'] = make_deck()
    game['discard'] = []
    game['started'] = True
    game['rule_state'] = {}
    game['rematch_votes'] = set()   # ← ADD: reset votes for new game
    # Note: game['scores'] is NOT reset here — scores persist

    player_ids = list(game['players'].keys())

    # Initialize scores for new players (returning players keep their score)
    for player_id in player_ids:
        if player_id not in game['scores']:
            game['scores'][player_id] = 0
            # Only set to 0 if this player doesn't have a score yet
            # Returning players from a previous game keep their total

    # ... rest of deal_game unchanged (deal hands, flip top card, set turn)
```

### Step 3 — Handle Game Over with Scoring

In `websocket_endpoint`, find the game-over check you added in Lab G4:

```python
                        # Check if the game is over (already there from Lab G4)
                        over, winner = rules.is_game_over(game)
                        if over:
                            for pid in game['players']:
                                await send_to(pid, {
                                    'type':   'game_over',
                                    'winner': winner,
                                    'message': f'{winner} wins!'
                                })
```

Replace it with a version that calculates and applies scores:

```python
                        # Check if the game is over
                        over, winner = rules.is_game_over(game)
                        if over:
                            # Calculate score deltas using the plugin
                            deltas = rules.calculate_scores(game, winner)

                            # Apply deltas to the persistent scores
                            for pid, delta in deltas.items():
                                if pid not in game['scores']:
                                    game['scores'][pid] = 0
                                game['scores'][pid] += delta

                            # Build the losing player's hand details for display
                            # (so the winner can see what they scored from)
                            loser_hands = {
                                pid: game['hands'][pid]
                                for pid in game['hands']
                                if pid != winner
                            }
                            # dict comprehension: same as a for loop that builds a dict
                            # { key: value for item in iterable if condition }

                            # Send game_over to both players
                            for pid in game['players']:
                                await send_to(pid, {
                                    'type':        'game_over',
                                    'winner':      winner,
                                    'message':     f'{winner} wins!',
                                    'scores':      dict(game['scores']),
                                    # dict() converts to a regular dict (scores might be a defaultdict)
                                    'score_delta': deltas[pid],
                                    'loser_hands': loser_hands,
                                    # Each player gets to see the losing hand(s)
                                })

                            game['started'] = False
                            # Mark game as over so a rematch can start
```

### Step 4 — Handle Rematch Votes

Add a new message handler in the `while True` loop:

```python
                elif data['type'] == 'rematch':
                    game['rematch_votes'].add(player_name)
                    # .add() adds to a set — duplicates ignored automatically

                    if len(game['rematch_votes']) == len(game['players']):
                        # ALL connected players voted for rematch
                        deal_game()
                        # deal_game resets the round but keeps scores

                        for pid in game['players']:
                            await send_to(pid, build_dealt_message(pid))
                            # Reuse the same dealt message from Lab G2
                            # Players are shown their new hands

                    else:
                        # Not everyone has voted yet — tell this player to wait
                        other_count = len(game['players']) - len(game['rematch_votes'])
                        await websocket.send_text(json.dumps({
                            'type':    'waiting_rematch',
                            'message': f'Waiting for {other_count} more player(s) to agree...'
                        }))
```

Also update `build_dealt_message` to include current scores:

```python
def build_dealt_message(player_id: str) -> dict:
    player_ids = list(game['players'].keys())
    opponent_id = [p for p in player_ids if p != player_id][0]

    return {
        'type':           'dealt',
        'your_hand':      game['hands'][player_id],
        'opponent_name':  opponent_id,
        'opponent_count': len(game['hands'][opponent_id]),
        'top_card':       game['discard'][-1],
        'whose_turn':     game['whose_turn'],
        'deck_count':     len(game['deck']),
        'active_suit':    None,
        'scores':         dict(game['scores']),    # ← ADD: include scores in deal message
    }
```

### SAVE AND TRY — Test rematch flow in Python

```
python
```

```python
from main import game, deal_game

# Simulate two players
game['players']['Alice'] = None
game['players']['Bob'] = None
deal_game()

print("Scores after deal:", game['scores'])
# Expected: {'Alice': 0, 'Bob': 0}

# Simulate Alice winning — empty her hand
game['hands']['Alice'] = []

from crazy_eights import calculate_scores
deltas = calculate_scores(game, 'Alice')
print("Score deltas:", deltas)
# Alice gets Bob's hand value, Bob gets 0

# Apply deltas
for pid, delta in deltas.items():
    game['scores'][pid] += delta
print("Scores after game:", game['scores'])

# Simulate rematch vote
game['rematch_votes'].add('Alice')
print("Votes:", game['rematch_votes'])
# Only Alice voted — not enough yet

game['rematch_votes'].add('Bob')
print("All voted?", len(game['rematch_votes']) == len(game['players']))
# Expected: True — both voted

deal_game()
print("Scores after rematch deal:", game['scores'])
# Expected: scores KEPT from before — deal_game didn't reset them
```

Type `exit()`.

---

## PART 3 — Frontend: Game Over Screen and Rematch

### Step 5 — Add the Game Over UI

In `index.html`, inside the game table div, add an overlay for game over:

```html
            <!-- Game over overlay — hidden until game ends -->
            <div id="game-over-screen" style="display:none">
                <div class="go-title" id="go-title">GAME OVER</div>
                <div class="go-scores" id="go-scores"></div>
                <div class="go-hands" id="go-hands"></div>
                <button id="rematchBtn" class="rematch-btn">PLAY AGAIN</button>
                <div class="go-status" id="go-status"></div>
            </div>
```

Add CSS:

```css
        #game-over-screen {
            background: var(--bg-card);
            border: 1px solid var(--color-accent);
            border-radius: 8px;
            padding: 24px;
            text-align: center;
        }

        .go-title {
            font-family: 'Courier New', monospace;
            font-size: 16px;
            color: var(--color-accent);
            letter-spacing: 0.3em;
            margin-bottom: 20px;
        }

        .go-scores {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            margin-bottom: 16px;
            line-height: 2;
        }

        .go-score-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 20px;
            color: var(--color-text);
        }

        .go-score-row.winner {
            color: var(--color-accent);
        }

        .go-hands {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: var(--color-muted);
            margin-bottom: 20px;
        }

        .rematch-btn {
            padding: 12px 32px;
            background: var(--color-accent);
            color: #000;
            border: none;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 0.15em;
            cursor: pointer;
            font-weight: bold;
            margin-bottom: 12px;
        }

        .go-status {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: var(--color-muted);
            letter-spacing: 0.1em;
            min-height: 18px;
        }
```

### Step 6 — Handle game_over on the Frontend

Add element references:

```javascript
        const gameOverScreen = document.getElementById('game-over-screen')
        const goTitle        = document.getElementById('go-title')
        const goScores       = document.getElementById('go-scores')
        const goHands        = document.getElementById('go-hands')
        const rematchBtn     = document.getElementById('rematchBtn')
        const goStatus       = document.getElementById('go-status')
```

Update `handleMessage` — replace the existing `game_over` case:

```javascript
                case 'game_over':
                    showGameOver(message)
                    break

                case 'waiting_rematch':
                    goStatus.textContent = message.message
                    rematchBtn.disabled = true
                    break

                case 'dealt':
                    // This also handles rematch deals (new game starting)
                    gameOverScreen.style.display = 'none'
                    rematchBtn.disabled = false
                    showGameTable(message)
                    break
```

Add the `showGameOver` function:

```javascript
        function showGameOver(message) {
            // Show the game over overlay
            gameOverScreen.style.display = 'block'

            // Title
            const iWon = message.winner === myName
            goTitle.textContent = iWon ? '🏆 YOU WIN!' : `${message.winner} WINS`
            goTitle.style.color = iWon
                ? 'var(--color-accent)'
                : 'var(--color-red)'

            // Scores table
            const scoreRows = Object.entries(message.scores)
            // Object.entries() converts {Alice: 50, Bob: 0} to [['Alice', 50], ['Bob', 0]]

            goScores.innerHTML = `
                <div style="font-size:10px;letter-spacing:0.2em;color:var(--color-muted);margin-bottom:8px">
                    SCORES
                </div>
                ${scoreRows.map(([pid, score]) => `
                    <div class="go-score-row ${pid === message.winner ? 'winner' : ''}">
                        <span>${pid}</span>
                        <span>${score} pts
                            ${message.score_delta && pid === message.winner && message.score_delta > 0
                                ? `<span style="font-size:10px;opacity:0.7">(+${message.score_delta})</span>`
                                : ''
                            }
                        </span>
                    </div>
                `).join('')}
            `

            // Losing hand breakdown
            if (message.loser_hands) {
                const handDetails = Object.entries(message.loser_hands)
                    .map(([pid, hand]) => {
                        const cards = hand.map(c => `${c.rank}${c.suit}`).join(' ')
                        const value = hand.reduce((sum, c) => {
                            const vals = {A:1,2:2,3:3,4:4,5:5,6:6,7:7,8:50,9:9,10:10,J:10,Q:10,K:10}
                            return sum + (vals[c.rank] || 0)
                        }, 0)
                        // .reduce() accumulates a value across all items:
                        // starts at 0, adds each card's value to the running sum
                        return `${pid}: ${cards || '(empty)'} = ${value} pts`
                    })
                    .join('<br>')

                goHands.innerHTML = handDetails
            }

            // Disable card interaction during game over
            playerHandEl.querySelectorAll('.card').forEach(el => {
                el.style.pointerEvents = 'none'
            })
        }

        // Rematch button
        rematchBtn.addEventListener('click', () => {
            socket.send(JSON.stringify({ type: 'rematch' }))
            goStatus.textContent = 'Waiting for opponent...'
            rematchBtn.disabled = true
        })
```

Also update `updateTable` to include score display. Add a score bar to the HTML:

```html
            <!-- Score bar — always visible during the game -->
            <div class="score-bar" id="score-bar" style="display:none">
                <span id="score-display"></span>
            </div>
```

CSS:
```css
        .score-bar {
            font-family: 'Courier New', monospace;
            font-size: 10px;
            color: var(--color-muted);
            letter-spacing: 0.12em;
            text-align: right;
        }
```

Add element reference:
```javascript
        const scoreBar     = document.getElementById('score-bar')
        const scoreDisplay = document.getElementById('score-display')
```

In `updateTable()`, add at the end:

```javascript
            // Score display
            if (message.scores) {
                scoreBar.style.display = 'block'
                const scoreText = Object.entries(message.scores)
                    .map(([pid, score]) => `${pid}: ${score}`)
                    .join('  |  ')
                scoreDisplay.textContent = scoreText
            }
```

Also update `showGameTable` (which calls `updateTable`) to pass score data through —
the `dealt` message now includes scores, so `updateTable` will pick it up automatically.

### SAVE AND TRY — Full game flow

Start the server. Join as Alice and Bob. Play a complete game.

The fastest way to test: after cards are dealt, quickly play through
until someone runs out of cards. (Cheat by only playing cards that are
legal — don't waste time on illegal plays during testing.)

**When a player's hand empties:**
- Game over screen appears on both tabs
- Winner title shows correctly on each tab
- Scores show with the delta in parentheses
- Losing hand shown with point values
- "PLAY AGAIN" button appears

**Click Play Again on one tab:**
- That tab shows "Waiting for opponent..."
- Button grays out

**Click Play Again on the other tab:**
- New hands dealt immediately to both
- Game over screen disappears
- Scores remain from before — winner has points now

**In DevTools Console:**
```javascript
// After a game ends:
Object.entries(JSON.parse('{"Alice":67,"Bob":0}'))
```
This is just testing that `Object.entries()` works as expected — returns
`[['Alice', 67], ['Bob', 0]]`.

---

## 🎯 Challenge: Add a Running Score to the Game Table

**You know:** `message.scores` is available in every `game_update` and `dealt`
message (after you added it in Step 4). The score bar is already in the HTML.

**Task:** The score bar currently only appears after a game. Make it visible
during the game too, updating with every card play.

**The scores don't change mid-game** (only at game end), but displaying them
throughout lets players know the stakes. The score bar should show:
`Alice: 0  |  Bob: 0` during play, updating to `Alice: 67  |  Bob: 0` after
the game ends and a rematch is dealt.

This requires `message.scores` to be in every `game_update` message,
not just `dealt` and `game_over`.

**Where to change:** `build_update_message()` in `main.py`.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`, update `build_update_message()`:**

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
        'active_suit':    rule_state.get('active_suit', None),
        'scores':         dict(game['scores']),    # ← ADD
    }
```

The frontend `updateTable()` already handles `message.scores` — it's there
from Step 6. Since `game_update` now includes scores, the bar updates
automatically on every play. No frontend change needed.

**Key insight:** Adding data to every message is cheap — the score dict
is tiny (two numbers). The alternative — only sending scores when they
change — requires tracking "did scores change this update?" and adds
complexity for almost no benefit. When in doubt, include the data and
let the client decide whether to display it.

</details>

---

## 🎯 Challenge: Show Both Players' Score History

**You know:** `game['scores']` is a dict. Python dicts maintain insertion order.
Each `game_over` message includes `scores` and `score_delta`.

**Task:** On the game over screen, show how many total games each player has won.
Track win counts separately from point scores.

**Where to add it:** Add `'wins': {}` to the `game` dict in `main.py`.
Increment the winner's win count in the game-over handling code.
Include `wins` in the `game_over` message.
Display it in `showGameOver()` on the frontend.

---

<details>
<summary>▶ Show Solution</summary>

**In `main.py`:**

```python
# In the game dict:
game = {
    # ... existing keys ...
    'scores': {},
    'wins':   {},    # ← ADD: {player_id: number_of_wins}
}

# In deal_game(), initialize wins for new players:
for player_id in player_ids:
    if player_id not in game['scores']:
        game['scores'][player_id] = 0
    if player_id not in game['wins']:      # ← ADD
        game['wins'][player_id] = 0        # ← ADD

# In the game-over handling, after applying score deltas:
game['wins'][winner] = game['wins'].get(winner, 0) + 1  # ← ADD

# In the game_over message:
await send_to(pid, {
    'type':        'game_over',
    # ... existing fields ...
    'wins':        dict(game['wins']),    # ← ADD
})
```

**In `showGameOver()` on the frontend:**

```javascript
        goScores.innerHTML = `
            <div ...>SCORES</div>
            ${scoreRows.map(([pid, score]) => `
                <div class="go-score-row ${pid === message.winner ? 'winner' : ''}">
                    <span>${pid}</span>
                    <span>
                        ${score} pts
                        ${message.wins ? `· ${message.wins[pid] || 0}W` : ''}
                    </span>
                </div>
            `).join('')}
        `
```

**Key insight:** Wins and scores are different things that happen to track
the same players. Keeping them in separate dicts (`scores` and `wins`)
makes each one easy to read, reset independently, and extend.
If you stored them together as `{Alice: {score: 67, wins: 2}}`, you'd
have to update two nested values every time — more complex for no benefit.
Flat data structures are easier to work with than nested ones, until
the complexity genuinely requires nesting.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Scores start at 0 | Join game, score bar shows `Alice: 0  |  Bob: 0` |
| Winner gets loser's hand value | Win a game, score reflects loser's hand total |
| Loser gets 0 points | Loser's score unchanged after losing |
| Game over screen appears | Win a game — overlay shows on both tabs |
| Winner/loser shown correctly | Each tab shows correct "YOU WIN" or "X WINS" |
| Loser's hand displayed | Cards and point total shown on game over screen |
| Scores shown on game over | Both players' totals visible |
| Score delta shown | "+67" appears next to winner's score |
| Both must click Play Again | One click shows "waiting", second triggers deal |
| New hands dealt on rematch | Fresh cards after both click Play Again |
| Scores persist after rematch | Points from previous game still shown |
| Score bar updates mid-game | After each play, score bar shows current totals |

---

## Quick Check Answers

**1. What should `deal_game()` reset and what should it keep?**
Reset: the deck, both players' hands, the discard pile, the rule state
(active suit, suit chooser), rematch votes, and the `started` flag.
Keep: the `scores` dict and the `wins` dict (and the `players` dict —
the actual WebSocket connections don't change between games).
The separation is about what belongs to "this round" vs. "this session."
Round data resets. Session data persists. Scores are session data.

**2. How do you turn the rank string "K" into the number 10?**
A dictionary lookup. `CARD_VALUES = {'K': 10, 'Q': 10, 'J': 10, ...}`.
Then `CARD_VALUES['K']` returns `10`. This is cleaner than a chain of
`if rank == 'K': return 10` conditions — a dict is essentially a
pre-computed lookup table. Adding or changing a card's value is one
line in the dict, not buried in conditional logic.

**3. What state does the server need to track for rematch votes?**
A set of player IDs who have voted. A set is the right structure
because: order doesn't matter (both clicking counts, regardless of who
clicks first), and duplicates don't matter (clicking twice shouldn't
count as two votes). When `len(rematch_votes) == len(players)`,
everyone has voted and the new game starts. The set is reset at the
start of each `deal_game()` so votes from the previous round don't carry over.

---

## What's Next — Lab G6

The game is complete. Scores work. Rematches work.

Lab G6 makes it playable across your local network:
- Find your computer's local IP address
- Run the server so other devices on the WiFi can reach it
- Your coworker opens a browser on their PC and joins
- Everything works exactly the same — no code changes needed
- Optional: a simple room system so you can host multiple separate games

This is the lab where the app becomes real — not just two browser tabs
on your machine, but two actual computers in the same building.

---

*Lab G5 complete. Games end. Scores persist. Rematches work. The engine is done.*
