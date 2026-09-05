# Lesson M4.4: Editing Directly in a Table's Own Cells

*File paths under mastercam-app/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder. This lesson extends ta_search_panel.py in verification/mastercam-app-copy/mastercam-app/, not the real mastercam-app/, per this phase's rule.*

**What you will build:** A second, different way to edit the same underlying data: making specific columns of results_table directly editable in place, with a Save Table Edits button that writes every edited row back through update_ta. The real point of this lesson isn't the code that does that - it's the state lifecycle it creates: the table can now hold real, unsaved edits that disagree with the database until Save is clicked, and can lose them entirely if it isn't.

**What you need to know first:** Lesson M4.2's separate-form editing and Lesson M3.3's atomic update_ta - this lesson is a different UI shape calling the same database method, with a real consequence M4.2's single-record form never had to face: more than one row can be dirty at once.

## Terms used in this lesson

- **Qt.ItemFlag** — A real, combinable set of bit flags on a QTableWidgetItem controlling what a user can do with that specific cell - Qt.ItemIsEditable is one flag among several (selectable, enabled, checkable); removing just that one flag leaves the cell visible and selectable, only not directly typeable-into.
- **Dirty state** — Data that has been changed in the UI but not yet persisted - real, visible, and real to the user looking at it, but invisible to anything reading the database directly, including this same panel's own next search.
- **Atomic operation vs. transaction** — Atomic means one operation either fully happens or fully doesn't - update_ta (Lesson M3.3) is atomic per call. A transaction wrapping several operations together means either ALL of them happen or NONE do - three atomic calls in a loop is not the same guarantee as one transaction around all three, and this lesson's Save Table Edits is the first case, not the second.

## Objects and methods used

- **`TASearchPanel._save_table_edits`**
  - *What it is:* Writes every visible row's editable columns back to the database
  - *Implementation:* mastercam_app/ui/ta_search_panel.py (new this lesson)
  - *Its use:* Connected to a Save Table Edits button
  - *Type:* method (slot)
  - *Responsibility:* Read each row's current cell text, call update_ta once per row
  - *Depends on:* Database.update_ta
  - *Connects to:* _populate, which is what makes cells editable or not in the first place
  - *Shape:* a loop over rows, one update_ta call each - not one transaction around all of them

## Concept Unit: The Table Now Has State the Database Doesn't Know About

### The Problem

Before this lesson, results_table was a read-only mirror of the last search - it could go stale, but nothing depended on that. Making cells editable changes what the table means: it can now hold real information (an edit) that exists nowhere else yet.

Before reading on:

- Trace this exact sequence: search for T0101, type a new holder name into a cell, then search again WITHOUT clicking Save. Before running it below, predict what the cell shows afterward, and what the database still has.
- Why does the database staying unchanged in that sequence count as correct behavior, not a bug - given that update_ta was never called?

### Project Change

- **Reference Source:** No reference counterpart - this unit is the conceptual foundation the rest of the lesson builds on, not new code by itself; the actual editable-cell code appears in the next unit.
- **Files affected:** `none` (none)
- **Change type:** none
- **Location:** n/a
- **Dependencies:** none

### Mechanical Walkthrough

- `database state -> _populate() -> table state -> user edits -> unsaved table state -> Save Table Edits -> database state` — Five real, distinct states, not two. _populate() is a one-way copy, taken once, at search time - nothing keeps the table and the database in sync afterward except a user explicitly clicking Save. Between a search and a save, "what's in the table" and "what's in the database" are two separate, independently-true facts that can legitimately disagree.

### Mental Model

```text
Database state
      |
      | _populate() (one-way copy, at search time)
      v
Table widget state  <-- can be edited directly, independent of the DB
      |
      | user edits a cell
      v
Table now DISAGREES with the database (real, unsaved state)
      |
      | Save Table Edits
      v
Database state (updated) -- but the table isn't re-read from it
```

### CS Lens

This is a real, concrete case of **derived state that can go stale in a new way** - Lesson M4.3 already found the table could be an outdated read of the database; this lesson adds the opposite direction too - the table can now be AHEAD of the database, holding a real edit the database hasn't received yet.

### SE Lens

The real alternative - writing to the database on every keystroke, so the table is never allowed to disagree with it - would mean a real database write per character typed, for a value the user might still be in the middle of correcting. Batching edits into an explicit Save is a real, deliberate tradeoff: it allows disagreement on purpose, in exchange for not writing on every keystroke.

### Verification

This unit states the model the rest of the lesson verifies directly - the next three units are where that verification actually happens.

### Connection to the previous unit

Lessons M4.1-M4.3 built one QDialog with one editing shape (a separate form, which only ever tracked one TA's state at a time); this unit is the conceptual shift that makes the rest of this lesson necessary - now more than one row's worth of state can be dirty simultaneously.

## Concept Unit: Making Cells Editable, and Verifying the Whole Policy, Not Half of It

### The Problem

Not every column should be typeable into - the TA Number and Part columns are identity, not data to edit here. This is a real, deliberate policy across all five columns, and it needs to be checked as one policy, not spot-checked on two of them.

Before reading on:

- item.setFlags(item.flags() & ~Qt.ItemIsEditable) uses & and ~ together rather than just assigning a new value - why not just item.setFlags(Qt.ItemIsEnabled)?
- READ_ONLY_COLUMNS = {0, 4} and TABLE_UPDATE_FIELDS = {1: ..., 2: ..., 3: ...} are two separate structures that happen to agree right now. If a sixth column were added and only one of these two was updated to include it, what real, wrong behavior would result - and would it fail loudly or silently?

### Project Change

- **Reference Source:** mastercam_app/ui/dialogs.py:170-185 (ToolEditorDialog's real QTableWidget, populated the same way but leaving every column editable) - this unit is the same shape with one real refinement: some columns should stay read-only.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (modified)
- **Change type:** add
- **Location:** _populate
- **Dependencies:** Qt.ItemIsEditable

### The New Code

The updated _populate, marking two columns read-only.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (already exists — modified)

```python
READ_ONLY_COLUMNS = {0, 4}

def _populate(self, rows):
    self.results_table.setRowCount(len(rows))
    for row_index, row in enumerate(rows):
        values = [
            row.get("ta_number", ""),
            row.get("holder_name", ""),
            row.get("tool_code", ""),
            row.get("tool_diameter", ""),
            row.get("partnumber", ""),
        ]
        for col_index, value in enumerate(values):
            item = QTableWidgetItem(str(value))
            if col_index in READ_ONLY_COLUMNS:
                item.setFlags(item.flags() & ~Qt.ItemIsEditable)
            self.results_table.setItem(row_index, col_index, item)
```

### Mechanical Walkthrough

- `item.setFlags(item.flags() & ~Qt.ItemIsEditable)` — item.flags() already includes several real, separate flags (selectable, enabled) that need to stay on - ~Qt.ItemIsEditable flips only that one bit off, and & keeps every other existing flag exactly as it was.
- `READ_ONLY_COLUMNS = {0, 4} and TABLE_UPDATE_FIELDS = {1: ..., 2: ..., 3: ...} (next unit) are two independent representations of one real policy` — Nothing in the code enforces that these agree - they're separate dicts/sets, checked by hand, by whoever edits this file. A sixth column added to only one of them wouldn't raise an error: it would either silently become editable with no way to save it, or silently save-able through a column meant to display something else entirely. This is a real, unresolved design gap this lesson names rather than fixes - a single, authoritative "column schema" structure (one dict per column: {label, db_field_or_None, editable}) would remove the possibility of the two facts disagreeing, at the cost of one more layer of indirection than this panel currently has.

### CS Lens

This is a real, minimal instance of **access control at the object level**, and separately, a real instance of **duplicated knowledge** (the same "which columns matter" fact, expressed twice, required to agree by convention rather than by construction).

### SE Lens

The real alternative - leaving every column editable and just ignoring whatever the user typed into TA Number when saving - would let a user believe they'd renamed a TA, only to have that edit silently discarded. Disabling the flag tells the truth about what's actually editable, at the UI layer, instead of relying on backend logic to quietly ignore bad input.

### Commands needed

- `python -m pytest tests/test_ta_search_panel.py::test_every_column_matches_its_declared_read_only_or_editable_policy -v` — Run from verification/mastercam-app-copy/mastercam-app/ - checks all five columns, not two

### Verification

```text
collected 1 item

tests/test_ta_search_panel.py::test_every_column_matches_its_declared_read_only_or_editable_policy PASSED [100%]
```

Full saved run: `verification/mastercam-phase-04/lab_test_ta_search_panel_output.txt`.

### Connection to the previous unit

The unit above named the table/database split conceptually; this unit is the first real code making cells editable at all, and the first place two independently-maintained structures have to agree by hand.

## Concept Unit: Multiple Rows, One Button, One update_ta Call Each

### The Problem

The whole reason this lesson exists instead of just reusing Lesson M4.2's form is that more than one row can be edited before saving. That claim needs its own real test - editing one cell and saving it doesn't prove multiple rows actually work.

Before reading on:

- The test below edits three different cells across three different rows, then calls _save_table_edits() once - predict, before running it, whether all three reach the database or only the last one edited.
- _save_table_edits() calls db.update_ta once per row, unconditionally - even rows nobody touched. Given Lesson M3.2's finding that update_ta always writes whatever fields it's given, what real cost does re-saving an unchanged row actually have, beyond the wasted call itself?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:795-840 (update_ta, as fixed in Lesson M3.3) - called here in a loop instead of once, the same method, a different real caller.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (modified)
- **Change type:** add
- **Location:** new _save_table_edits method, plus a Save Table Edits button
- **Dependencies:** Database.update_ta

### The New Code

The new button and the method that saves every row.

**File:** `verification/mastercam-app-copy/mastercam-app/mastercam_app/ui/ta_search_panel.py` (new)

```python
TABLE_UPDATE_FIELDS = {1: "holder_name", 2: "tool_code", 3: "tool_diameter"}

# in __init__, after export_button:
self.save_table_button = QPushButton("Save Table Edits")
self.save_table_button.clicked.connect(self._save_table_edits)
layout.addWidget(self.save_table_button)

def _save_table_edits(self):
    db = get_db()
    for row in range(self.results_table.rowCount()):
        ta_number = self.results_table.item(row, 0).text()
        updates = {
            field_key: self.results_table.item(row, col).text()
            for col, field_key in TABLE_UPDATE_FIELDS.items()
        }
        db.update_ta(ta_number, updates)
    QMessageBox.information(self, "Saved", f"{self.results_table.rowCount()} row(s) saved.")
```

### Mechanical Walkthrough

- `for col, field_key in TABLE_UPDATE_FIELDS.items()` — {1: "holder_name", ...} deliberately excludes 0 and 4, the same two columns marked read-only in the unit above - the two facts have to agree by hand, exactly as named there.
- `for row in range(self.results_table.rowCount()): ... db.update_ta(ta_number, updates)` — Every row, every time - not just rows that were actually edited. Real, measured cost for a 50-row search: 50 real database writes even if one cell changed. Each individual call is atomic (Lesson M3.3); nothing here wraps all of them in one shared transaction, which the next unit makes concrete.

### CS Lens

This is the same **read state, write it back** shape as Lesson M4.2's form-based save, iterated - proof the underlying database operation doesn't care which UI shape produced the values it's given, whether that's one form or many table rows.

### SE Lens

The real alternative - tracking exactly which cells actually changed (Qt's itemChanged signal could do this) and only writing those - would avoid the wasted writes named above, at real added complexity. Unconditional save-everything is simpler and, at this panel's real scale, an acceptable tradeoff.

### Commands needed

- `python -m pytest tests/test_ta_search_panel.py::test_save_table_edits_writes_every_edited_row_not_just_one -v` — Run from verification/mastercam-app-copy/mastercam-app/ - edits three different rows, saves once, checks all three

### Verification

```text
collected 1 item

tests/test_ta_search_panel.py::test_save_table_edits_writes_every_edited_row_not_just_one PASSED [100%]
```

Full saved run: `verification/mastercam-phase-04/lab_test_ta_search_panel_output.txt`.

### Connection to the previous unit

The unit above decided which cells are editable; this unit proves the actual multi-row claim this lesson is named for, not just a single edited cell.

## Concept Unit: One Failure Mid-Save Stops Every Row After It - Silently

### The Problem

_save_table_edits loops over rows calling one atomic update_ta each. Atomic-per-call is not the same guarantee as one transaction around the whole loop - the real, concrete difference is what happens if row 2 of 3 fails.

Before reading on:

- Before running the test below, predict all three outcomes: does row 1 (edited before the failure) end up saved? Does row 2 (the one that fails) end up saved? Does row 3 (edited, but after the failure point) ever get attempted at all?
- QMessageBox.information is the last line of _save_table_edits - if an exception is raised partway through the loop, does the user ever see any confirmation or error message at all?

### Project Change

- **Reference Source:** mastercam_app/db/database.py:795 (update_ta) - this unit doesn't change update_ta itself; it demonstrates a real consequence of calling it in an un-transactioned loop, which _save_table_edits already does.
- **Files affected:** `verification/mastercam-app-copy/mastercam-app/tests/test_ta_search_panel.py` (modified)
- **Change type:** add
- **Location:** new test, simulating a mid-loop failure
- **Dependencies:** Database.update_ta, monkeypatched to fail on one specific TA

### The New Code

The real test, forcing row 2 of 3 to fail.

**File:** `verification/mastercam-app-copy/mastercam-app/tests/test_ta_search_panel.py` (new)

```python
def test_a_failure_partway_through_save_table_edits_stops_the_remaining_rows(qapp):
    db = make_db_with_three_tools()

    with patch.object(panel_mod, "get_db", return_value=db), \
         patch.object(panel_mod.QMessageBox, "information") as mock_info:
        dlg = panel_mod.TASearchPanel()
        dlg.query_field.setText("T0101")
        dlg._run_search()
        dlg.results_table.item(0, 1).setText("ROW1-SAVED")
        dlg.results_table.item(2, 1).setText("ROW3-SAVED")

        real_update_ta = db.update_ta

        def flaky_update_ta(ta_number, fields, changed_by=None):
            if ta_number == "TA0061":
                raise RuntimeError("simulated failure on row 2")
            return real_update_ta(ta_number, fields, changed_by)

        db.update_ta = flaky_update_ta

        with pytest.raises(RuntimeError):
            dlg._save_table_edits()

    assert db.get_ta("TA0060")["holder_name"] == "ROW1-SAVED"
    assert db.get_ta("TA0061")["holder_name"] == "ER32"
    assert db.get_ta("TA0062")["holder_name"] == "ER32"
    assert not mock_info.called
```

### Mechanical Walkthrough

- `db.get_ta("TA0060")["holder_name"] == "ROW1-SAVED"` — Real, measured: row 1's edit is genuinely persisted, because its own update_ta call already completed (and Lesson M3.3's fix made it atomic and committed) before row 2's call raised. Atomic-per-row means row 1's success is real and permanent, independent of what happens to rows after it.
- `db.get_ta("TA0062")["holder_name"] == "ER32"  # ROW3-SAVED never reached the database` — This is the real, silent cost: row 3's edit still exists in the table (nobody cleared it), the user typed it, but the for loop never got there - the RuntimeError from row 2 propagated straight out, skipping every row after it. Row 3 looks edited in the UI and is completely unsaved.
- `assert not mock_info.called` — No confirmation, no error dialog - nothing tells the user any of this happened. From their perspective, they clicked Save and the app didn't respond, correctly or otherwise.

### Mental Model

```text
_save_table_edits(), 3 rows, row 2 raises:

  row 0 (TA0060): update_ta() succeeds -> committed for real
  row 1 (TA0061): update_ta() raises   -> loop stops here
  row 2 (TA0062): never attempted       -> edit silently lost

Result: partial persistence, no user-visible confirmation or error.
This is NOT what a real transaction (BEGIN...COMMIT around all
three) would produce - a transaction would leave either all three
rows unchanged or all three changed, never a mix.
```

### CS Lens

This is the real, concrete difference between **atomic** and **transactional**: three atomic operations in a loop give you "each one individually all-or-nothing," not "all three together all-or-nothing." Confusing the two is a real, common source of partial-failure bugs in exactly this shape - a loop of otherwise- safe calls.

### SE Lens

The real fix - wrapping the whole loop in one transaction (a single with self._conn: around all the update_ta calls, or a batch method on Database designed for this) - would make row 3 never get silently skipped: either all three save or none do, and the user would see one clear error naming which row failed. That's real, additional work this lesson doesn't implement, named here as the actual next step this panel would need before being trusted with a real multi-row edit on a shop floor. A second, independent gap worth naming alongside it: nothing here validates tool_diameter as a real number before it reaches the database - "banana" would save exactly as readily as "1.25", for the same reason this lesson doesn't implement a fix for it: naming a real boundary is not the same as being required to close it in every lesson that finds one.

### Commands needed

- `python -m pytest tests/test_ta_search_panel.py -v` — Run from verification/mastercam-app-copy/mastercam-app/, all twelve tests

### Verification

```text
collected 12 items

tests/test_ta_search_panel.py::test_search_populates_the_table_with_a_real_match PASSED [  8%]
tests/test_ta_search_panel.py::test_search_with_no_match_clears_the_table PASSED [ 16%]
tests/test_ta_search_panel.py::test_double_clicking_a_row_populates_the_edit_fields_and_enables_save PASSED [ 25%]
tests/test_ta_search_panel.py::test_save_edits_writes_the_change_through_the_real_atomic_update_ta PASSED [ 33%]
tests/test_ta_search_panel.py::test_save_edits_shows_a_confirmation_message PASSED [ 41%]
tests/test_ta_search_panel.py::test_export_with_no_results_warns_instead_of_opening_a_file_dialog PASSED [ 50%]
tests/test_ta_search_panel.py::test_export_writes_a_real_csv_matching_the_displayed_table PASSED [ 58%]
tests/test_ta_search_panel.py::test_every_column_matches_its_declared_read_only_or_editable_policy PASSED [ 66%]
tests/test_ta_search_panel.py::test_save_table_edits_writes_every_edited_row_not_just_one PASSED [ 75%]
tests/test_ta_search_panel.py::test_an_unsaved_table_edit_is_lost_on_the_next_search PASSED [ 83%]
tests/test_ta_search_panel.py::test_a_failure_partway_through_save_table_edits_stops_the_remaining_rows PASSED [ 91%]
tests/test_ta_search_panel.py::test_save_table_edits_writes_a_direct_cell_edit_through_update_ta PASSED [100%]

============================== 12 passed in 0.29s ==============================
```

Full saved run: `verification/mastercam-phase-04/lab_test_ta_search_panel_output.txt`.

### Connection to the previous unit

The unit above proved the multi-row happy path; this unit proves the real, unhappy path the happy-path test can't reveal on its own - what a loop of atomic calls does when one of them fails.

## Connect the pieces

Trace three TAs through all four units: TA0060/TA0061/TA0062 load into a table whose Holder/Tool Code/Diameter columns are editable and TA Number/Part are not (units one and two); editing all three and clicking Save writes every one of them (unit three) - but editing them and having row 2's write fail leaves row 1 saved, row 2 unsaved, and row 3's real edit silently discarded, with no message shown at all (unit four). The same button produces either outcome depending only on whether every row's update_ta call happens to succeed.
M4.2's form and this lesson's table are the same underlying operation, two different shapes:
| | M4.2 (form) | M4.4 (table) | |---|---|---| | Rows visible at once | one (loaded on double-click) | many | | Where dirty state lives | the form's own fields | the table's own cells | | update_ta calls per Save | exactly one | one per row | | Effect of a mid-save failure | that one save fails, cleanly | later rows are silently skipped |

**Next lesson:** The embedded-browser lesson (QWebEngineView, replacing app.py's real shell-out to the system browser) is the real next step once Lesson M4.8's test passes for real on this machine.