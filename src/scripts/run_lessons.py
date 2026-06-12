"""
Runs Claude Code to write math lessons.
If usage is exhausted, waits and retries automatically.
Restarts when context fills up.
Stops when all lessons are done.

Usage:
    python run_lessons.py
"""

import subprocess
import time
import datetime
import sys
import os

WORK_DIR = r"c:\Users\g4m3r\Documents\testing tutorials\open-calc"
START_HERE = os.path.join(WORK_DIR, "src", "docs", "maths", "masterclass", "START_HERE.md")
CLAUDE = r"C:\nvm4w\nodejs\claude.CMD"

PROMPT = (
    "Read src/docs/maths/masterclass/START_HERE.md carefully. "
    "Find the first lesson marked [ ] (not done). "
    "Write that lesson in full at the standard described. "
    "When it is done, mark it [x] in START_HERE.md. "
    "Then write the next [ ] lesson. "
    "Continue until context runs out or all lessons are done."
)

# How long to wait before retrying after a usage limit or error (minutes)
RETRY_WAIT_MINUTES = 30

USAGE_LIMIT_PHRASES = [
    'usage limit',
    'rate limit',
    'quota',
    'too many requests',
    'overloaded',
    'capacity',
]

def log(msg):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}", flush=True)

def all_lessons_done():
    try:
        with open(START_HERE, 'r', encoding='utf-8') as f:
            return '- [ ]' not in f.read()
    except FileNotFoundError:
        return False

def count_remaining():
    try:
        with open(START_HERE, 'r', encoding='utf-8') as f:
            return f.read().count('- [ ]')
    except FileNotFoundError:
        return 0

def wait_minutes(n):
    log(f"Waiting {n} minutes before retrying...")
    try:
        for i in range(n * 60, 0, -1):
            m, s = divmod(i, 60)
            print(f"\r  {m}m {s:02d}s remaining", end='', flush=True)
            time.sleep(1)
        print()
    except KeyboardInterrupt:
        print("\nStopped by user.")
        sys.exit(0)

def run_session(session_num):
    log(f"Session {session_num} — {count_remaining()} lessons remaining")

    result = subprocess.run(
        [CLAUDE, '-p', PROMPT, '--dangerously-skip-permissions'],
        cwd=WORK_DIR,
        capture_output=True,
        text=True
    )

    output = (result.stdout + result.stderr).lower()
    log(f"Session {session_num} ended (exit code {result.returncode})")

    # Print last few lines so we can see what happened
    lines = (result.stdout + result.stderr).strip().splitlines()
    for line in lines[-5:]:
        print(f"  {line}")

    hit_limit = any(phrase in output for phrase in USAGE_LIMIT_PHRASES)
    return hit_limit

def main():
    log(f"Claude: {CLAUDE}")
    log(f"Lessons remaining: {count_remaining()}")

    if all_lessons_done():
        log("All lessons already complete.")
        return

    session = 1
    try:
        while not all_lessons_done():
            hit_limit = run_session(session)
            session += 1

            if all_lessons_done():
                break

            if hit_limit:
                log("Usage limit detected.")
                wait_minutes(RETRY_WAIT_MINUTES)
            else:
                # Context filled up or session ended normally — restart quickly
                log("Restarting in 30 seconds...")
                time.sleep(30)

    except KeyboardInterrupt:
        print("\nStopped by user.")

    if all_lessons_done():
        log("All lessons complete!")
    else:
        log(f"Stopped with {count_remaining()} lessons remaining.")

if __name__ == '__main__':
    main()
