"""
Compiles a structured YAML lesson file into the real Markdown format
LESSON AUTHORING CONTRACT.md requires - and validates its structure
first, mechanically, before compiling.

This does not replace human/AI judgment about whether an explanation is
actually good - it replaces the *structural* mistakes that kept slipping
through by hand: missing CRC fields, missing file/status labels, missing
`<- new` markers, placeholder commands, undefined terms.

Usage:
    python lesson_compiler.py <path/to/lesson.yaml>

Validates first. Refuses to compile (no .md written) if any hard error
is found. Writes <same name>.md next to the yaml file on success.
"""
import io
import re
import sys
import tokenize
from pathlib import Path

import yaml

NEW_MARKER = re.compile(r"\s*#\s*(?:<-|←)\s*new\s*$")
PLACEHOLDER = re.compile(r"<[a-zA-Z_][a-zA-Z0-9_]*>")

REQUIRED_OBJECT_FIELDS = [
    "what_it_is", "implementation", "its_use",
    "type", "responsibility", "depends_on", "connects_to", "shape",
]


class ValidationError(Exception):
    pass


def strip_new_marker(line: str) -> str:
    return NEW_MARKER.sub("", line)


def has_new_marker(line: str) -> bool:
    return bool(NEW_MARKER.search(line))


def validate(lesson: dict) -> tuple[list[str], list[str]]:
    """Returns (errors, warnings). Errors block compilation - they're
    the structural rules a program can actually be certain about.
    Warnings print but never block - the vocabulary cross-check is a
    heuristic (a plain local variable name in throwaway example code is
    expected to show up unresolved) and treating it as a hard error
    would contradict its own "review, not automatically wrong" framing."""
    errors = []
    warnings = []

    for key in ("number", "title", "what_you_will_build",
                "what_you_need_to_know_first", "terms",
                "objects_and_methods", "concept_units", "closing"):
        if key not in lesson:
            errors.append(f"missing top-level key: {key}")

    for i, term in enumerate(lesson.get("terms", [])):
        for field in ("name", "definition"):
            if not term.get(field, "").strip():
                errors.append(f"terms[{i}] ({term.get('name', '?')}): missing/empty '{field}'")

    for i, obj in enumerate(lesson.get("objects_and_methods", [])):
        name = obj.get("name", "?")
        for field in REQUIRED_OBJECT_FIELDS:
            if not str(obj.get(field, "")).strip():
                errors.append(f"objects_and_methods[{i}] ({name}): missing/empty '{field}' - all 8 CRC fields are required, never 3 or 5")

    for i, unit in enumerate(lesson.get("concept_units", [])):
        title = unit.get("title", f"unit {i}")
        for key in ("problem", "project_change", "cs_lens", "se_lens", "connection_to_previous"):
            if not unit.get(key):
                errors.append(f"concept_units[{i}] ({title}): missing '{key}'")

        pc = unit.get("project_change", {})
        for field in ("reference_source", "files_affected", "change_type", "location", "dependencies"):
            if field not in pc:
                errors.append(f"concept_units[{i}] ({title}) project_change: missing '{field}'")
        for j, f in enumerate(pc.get("files_affected", [])):
            if "path" not in f or "status" not in f:
                errors.append(f"concept_units[{i}] ({title}) project_change.files_affected[{j}]: needs both 'path' and 'status'")
            elif f["status"] not in ("new", "existing", "modified", "none"):
                errors.append(f"concept_units[{i}] ({title}) files_affected[{j}]: status must be new/existing/modified/none, got '{f['status']}'")

        new_code = unit.get("new_code", {})
        if new_code.get("applicable", True):
            for field in ("file", "status", "code"):
                if not new_code.get(field):
                    errors.append(f"concept_units[{i}] ({title}) new_code: missing '{field}'")

        updated = unit.get("updated_project", {})
        if updated.get("applicable", True):
            for field in ("file", "code"):
                if not updated.get(field):
                    errors.append(f"concept_units[{i}] ({title}) updated_project: missing '{field}'")
            # Mechanical check for the actual bug that kept happening:
            # every line in updated_project not already in new_code must
            # carry a real <- new marker - prose claiming this is
            # impossible to check by hand reliably; a set difference is
            # not.
            new_lines = {
                strip_new_marker(l).strip()
                for l in new_code.get("code", "").splitlines()
                if l.strip()
            }
            for line in updated.get("code", "").splitlines():
                stripped = line.strip()
                if not stripped:
                    continue
                bare = strip_new_marker(line).strip()
                if bare not in new_lines and not has_new_marker(line):
                    errors.append(
                        f"concept_units[{i}] ({title}) updated_project: "
                        f"line not in new_code and not marked '<- new': {stripped!r}"
                    )

        for j, cmd in enumerate(unit.get("commands", [])):
            command_text = cmd.get("command", "")
            if PLACEHOLDER.search(command_text):
                errors.append(
                    f"concept_units[{i}] ({title}) commands[{j}]: contains a "
                    f"placeholder like <path> - use the real, concrete value: {command_text!r}"
                )
            if not cmd.get("explanation", "").strip():
                errors.append(f"concept_units[{i}] ({title}) commands[{j}]: missing explanation")

        walkthrough = unit.get("mechanical_walkthrough", {})
        if walkthrough.get("applicable", True):
            for j, item in enumerate(walkthrough.get("items", [])):
                if not item.get("explanation", "").strip():
                    errors.append(f"concept_units[{i}] ({title}) mechanical_walkthrough[{j}] ({item.get('element', '?')}): missing explanation")

    # Vocabulary cross-check (Python code only): every real NAME token
    # (via the standard library's own tokenizer, not a regex) should
    # trace back to a terms/objects_and_methods name, or be an ordinary
    # builtin/keyword this curriculum treats as assumed prior knowledge.
    # Real tokenization means a word sitting inside a string literal or
    # a comment is never mistaken for a real identifier - a regex over
    # the raw text can't tell the difference; tokenize.NAME can.
    known_names = set()
    for term in lesson.get("terms", []):
        known_names.update(re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", term.get("name", "")))
    for obj in lesson.get("objects_and_methods", []):
        known_names.update(re.findall(r"[a-zA-Z_][a-zA-Z0-9_]*", obj.get("name", "")))
    # A dotted Objects/methods name like "socket.accept" also resolves
    # any bare use of "accept" alone (the method called on some
    # instance, e.g. `connection.accept()`), not only the dotted form.
    for obj in lesson.get("objects_and_methods", []):
        parts = obj.get("name", "").split(".")
        known_names.update(parts)
    # A real field/attribute an entry's own Implementation text names
    # explicitly (e.g. "real fields ('name', 'args', 'decorator_list')")
    # is explained there, in prose, even without its own separate
    # top-level entry - quoted single- or double-quoted bare words in
    # Implementation/Its use/Connects to count as resolved too.
    for obj in lesson.get("objects_and_methods", []):
        for field in ("implementation", "its_use", "connects_to"):
            text = str(obj.get(field, ""))
            known_names.update(re.findall(r"['\"]([a-zA-Z_][a-zA-Z0-9_]*)['\"]", text))
            known_names.update(re.findall(r"`([a-zA-Z_][a-zA-Z0-9_]*)`", text))

    ASSUMED = {
        "def", "return", "import", "from", "as", "if", "else", "elif",
        "for", "while", "in", "not", "and", "or", "is", "None", "True",
        "False", "print", "len", "str", "int", "float", "bool", "list",
        "dict", "self", "with", "try", "except", "finally", "class",
        "pass", "break", "continue", "lambda", "f", "open", "isinstance",
        "type", "range", "enumerate", "sorted", "read",
    }

    unresolved = set()
    for unit in lesson.get("concept_units", []):
        for block_key in ("new_code", "updated_project"):
            block = unit.get(block_key, {})
            if block.get("language", "python") != "python":
                continue
            code = block.get("code", "")
            if not code.strip():
                continue
            try:
                tokens = tokenize.generate_tokens(io.StringIO(code).readline)
                names = [t.string for t in tokens if t.type == tokenize.NAME]
            except (tokenize.TokenError, IndentationError, SyntaxError):
                # A fragment (not a complete, standalone file) can
                # legitimately fail to tokenize - fall back to no check
                # for this block rather than crashing the validator.
                continue
            for token in names:
                if token in ASSUMED or token in known_names:
                    continue
                unresolved.add(token)

    if unresolved:
        warnings.append(
            "possible missing Terms/Objects entries (real tokens, via "
            "Python's own tokenizer - review, not automatically wrong) "
            "not found in any name: " + ", ".join(sorted(unresolved))
        )

    return errors, warnings


def render_objects_and_methods(objects: list[dict]) -> str:
    if not objects:
        return "None — this lesson introduces no new external class, interface, or method, only Terms."
    parts = []
    for obj in objects:
        parts.append(f"- **`{obj['name']}`**")
        parts.append(f"  - *What it is:* {obj['what_it_is']}")
        parts.append(f"  - *Implementation:* {obj['implementation']}")
        parts.append(f"  - *Its use:* {obj['its_use']}")
        parts.append(f"  - *Type:* {obj['type']}")
        parts.append(f"  - *Responsibility:* {obj['responsibility']}")
        parts.append(f"  - *Depends on:* {obj['depends_on']}")
        parts.append(f"  - *Connects to:* {obj['connects_to']}")
        parts.append(f"  - *Shape:* {obj['shape']}")
        parts.append("")
    return "\n".join(parts)


def render_terms(terms: list[dict]) -> str:
    return "\n".join(f"- **{t['name']}** — {t['definition']}" for t in terms)


def render_project_change(pc: dict) -> str:
    lines = [f"- **Reference Source:** {pc['reference_source']}"]
    files = ", ".join(f"`{f['path']}` ({f['status']})" for f in pc.get("files_affected", []))
    lines.append(f"- **Files affected:** {files or 'None'}")
    lines.append(f"- **Change type:** {pc['change_type']}")
    lines.append(f"- **Location:** {pc['location']}")
    lines.append(f"- **Dependencies:** {pc['dependencies']}")
    return "\n".join(lines)


def render_code_block(code: str, language: str = "python") -> str:
    return f"```{language}\n{code.rstrip()}\n```"


def render_concept_unit(unit: dict, index: int) -> str:
    out = [f"## Concept Unit: {unit['title']}", "", "### The Problem", "", unit["problem"], ""]

    if unit.get("socratic_prompt"):
        out.append("Before reading on:")
        out.append("")
        for q in unit["socratic_prompt"]:
            out.append(f"- {q}")
        out.append("")

    out += ["### Project Change", "", render_project_change(unit["project_change"]), ""]

    new_code = unit.get("new_code", {})
    out += ["### The New Code", ""]
    if new_code.get("applicable", True):
        if new_code.get("intro"):
            out += [new_code["intro"], ""]
        out += [render_code_block(new_code["code"], new_code.get("language", "python")), ""]
    else:
        out += [new_code.get("note", "There is no new code in this unit."), ""]

    updated = unit.get("updated_project", {})
    out += ["### The Updated Project", ""]
    if updated.get("applicable", True):
        if updated.get("intro"):
            out += [updated["intro"], ""]
        out += [f"**File:** `{updated['file']}`", ""]
        out += [render_code_block(updated["code"], updated.get("language", "python")), ""]
    else:
        out += [updated.get("note", "Not applicable."), ""]

    walkthrough = unit.get("mechanical_walkthrough", {})
    if walkthrough.get("applicable", True) and walkthrough.get("items"):
        out += ["### Mechanical Walkthrough", ""]
        for item in walkthrough["items"]:
            out.append(f"- `{item['element']}` — {item['explanation']}")
        out.append("")
    elif walkthrough.get("note"):
        out += ["### Mechanical Walkthrough", "", walkthrough["note"], ""]

    trace = unit.get("execution_trace", {})
    if trace.get("applicable"):
        out += ["### Execution Trace", ""]
        if trace.get("shape") == "values":
            out += ["```", *trace["lines"], "```", ""]
        else:
            out += [f"{j+1}. {line}" for j, line in enumerate(trace["lines"])]
            out.append("")

    out += ["### CS Lens", "", unit["cs_lens"], ""]
    out += ["### SE Lens", "", unit["se_lens"], ""]

    out += ["### Commands needed", ""]
    if unit.get("commands"):
        for cmd in unit["commands"]:
            out.append(f"- `{cmd['command']}` — {cmd['explanation']}")
    else:
        out.append("None.")
    out.append("")

    ver = unit.get("verification", {})
    out += ["### Verification", ""]
    if ver.get("applicable", True):
        out += [render_code_block(ver["real_output"], "text")]
        if ver.get("output_file"):
            out.append("")
            out.append(f"Full saved run: `{ver['output_file']}`.")
    else:
        out.append(ver.get("exemption_reason", "Not applicable."))
    out.append("")

    out += ["### Connection to the previous unit", "", unit["connection_to_previous"], ""]
    return "\n".join(out)


def compile_to_markdown(lesson: dict) -> str:
    out = [f"# Lesson {lesson['number']}: {lesson['title']}", ""]
    if lesson.get("path_note"):
        out += [f"*{lesson['path_note']}*", ""]
    out += [f"**What you will build:** {lesson['what_you_will_build']}", ""]
    out += [f"**What you need to know first:** {lesson['what_you_need_to_know_first']}", ""]
    out += ["## Terms used in this lesson", "", render_terms(lesson["terms"]), ""]
    out += ["## Objects and methods used", "", render_objects_and_methods(lesson["objects_and_methods"])]

    for i, unit in enumerate(lesson["concept_units"]):
        out.append(render_concept_unit(unit, i))

    closing = lesson["closing"]
    out += ["## Connect the pieces", "", closing["connect_the_pieces"], ""]
    if closing.get("next_lesson_pointer"):
        out += [f"**Next lesson:** {closing['next_lesson_pointer']}"]

    return "\n".join(out)


def deep_strip(obj):
    """YAML folded/literal scalars (`>`, `|`) carry a trailing newline
    by default - left in, it breaks anything wrapped around the text
    afterward (e.g. `*{text}*` renders with the closing `*` pushed onto
    its own line, silently breaking the italics). Strip every string
    value's outer whitespace once, recursively, right after loading -
    fixing this at the source instead of patching every render call
    that happens to wrap a value in something."""
    if isinstance(obj, str):
        return obj.strip()
    if isinstance(obj, list):
        return [deep_strip(x) for x in obj]
    if isinstance(obj, dict):
        return {k: deep_strip(v) for k, v in obj.items()}
    return obj


def main():
    if len(sys.argv) != 2:
        print("Usage: python lesson_compiler.py <path/to/lesson.yaml>")
        sys.exit(1)

    yaml_path = Path(sys.argv[1])
    lesson = yaml.safe_load(yaml_path.read_text(encoding="utf-8"))
    lesson = deep_strip(lesson)

    errors, warnings = validate(lesson)
    if warnings:
        print(f"{len(warnings)} warning(s) - review, does not block compiling:")
        for w in warnings:
            print(f"  - {w}")
        print()
    if errors:
        print(f"{len(errors)} validation error(s) - not compiled:")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)

    markdown = compile_to_markdown(lesson)
    out_path = yaml_path.with_suffix(".md")
    out_path.write_text(markdown, encoding="utf-8")
    print(f"Validated clean. Wrote {out_path}")


if __name__ == "__main__":
    main()
