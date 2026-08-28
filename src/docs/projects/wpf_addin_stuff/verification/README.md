# Verification Folder — WPF Mastercam File Generator Curriculum

Per the Verification Rule in `src/docs/reference/LESSON SCHEMA.md`: any code in
a lesson that touches a framework/runtime whose exact output isn't already
confidently known gets actually run, and the real source plus real output is
saved here — not reconstructed from memory in a later session.

**Convention for this curriculum:** one folder per lesson, `lesson-NN/`.
Inside each: the real project source files that were built/run (not `bin`/
`obj` build artifacts, except where the generated code itself is the point
being proven — those live under a `generated/` subfolder), and one or more
`*-output.txt` files holding real, pasted terminal output from the actual
run that produced them. A short note at the top of each lesson folder's own
files (or this README, for anything folder-wide) records what was run and
why, so a later session can reuse the saved output instead of re-running it.

## lesson-01/

Verifies Lesson 1 ("Create the WPF Shell"): a minimal WPF project scaffolded
with `dotnet new wpf`, trimmed to the smallest form the lesson teaches
(`Title="Mastercam Generator"`, empty `Grid` content), built with
`dotnet build`, with the real compiler-generated code inspected to prove
what `InitializeComponent()` and XAML compilation actually produce — not
asserted from memory.
