# Lesson 06: A WPF UserControl for a Host Application

**What this covers:** the real, specific difference between a
standalone `Window` and the `UserControl` a real add-in template hands
you — the exact piece that makes that template look unfamiliar even
once you know WPF.

**What you need first:** [Lesson 05](lesson-05-class-libraries-and-how-a-host-app-loads-your-code.md).

**Same honest note as Lesson 05:** the real, specific way your host
application embeds your control is defined in its own real
documentation. The mechanism below is illustrative, built to show the
real, general shape.

---

## `Window`: a real, standalone top-level surface

```xml
<Window x:Class="MyAddIn.SettingsWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Settings" Height="300" Width="400">
    <Grid>
        <TextBlock Text="Hello" />
    </Grid>
</Window>
```

A `Window` owns its own, real title bar, its own real close/minimize
buttons, its own real position on screen. You create one and call
`.Show()` or `.ShowDialog()` yourself, and *your* code controls its
entire, real lifetime — this is what every WPF app you've built so far
(a standalone `.exe`) has used as its real root.

## `UserControl`: a real, reusable piece, with no window of its own

```xml
<UserControl x:Class="MyAddIn.ToolPanel"
             xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
             xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
    <Grid>
        <TextBlock Text="Hello" />
    </Grid>
</UserControl>
```

Look closely: the real, only difference in this XAML is the root tag —
`UserControl` instead of `Window`. Same real `Grid`, same real
`TextBlock`, same real code-behind pattern
(`InitializeComponent()` in the constructor, identical to every
`Window` you've written). But a `UserControl` has no real title bar, no
real close button, no real position of its own — it has genuinely no
independent, real existence on screen. It only ever becomes visible
once something *else*, some real container, places it somewhere.

This is exactly why an add-in template hands you a `UserControl`
instead of a `Window`: your host application already has its own, real
window, its own real panel or dockable pane, and it wants to put *your*
UI inside a space it already owns — not have you pop up a competing,
independent, real top-level window of your own.

## How the host actually puts it there

Continuing Lesson 05's real, illustrative mechanism — once the host has
a real, live instance of your class:

```csharp
// Illustrative — your real host's actual embedding code is internal to it.
ToolPanel myPanel = new ToolPanel();
hostDockingArea.Content = myPanel;
```

`hostDockingArea.Content = myPanel` is the real, ordinary WPF pattern
for "put this control inside that container" — the identical, real
mechanism you'd use in your own app to swap a `Grid`'s child. Nothing
special happens on the host's side beyond ordinary WPF composition;
the only real, new idea here is that the *container* belongs to
someone else's real, running application, not yours.

## When you still want a real `Window`

A real add-in commonly uses *both*: a `UserControl` for the embedded,
persistent panel the host owns, and a real, independent `Window` for
things that genuinely should pop up on their own — a real Settings
dialog, a real "are you sure" prompt. Nothing stops your own,
real code from calling `new SettingsWindow().ShowDialog()` from inside
a button click on your embedded `UserControl` — the two aren't
exclusive, they're just used for real, different jobs.

## Definition of done

- [ ] You can state, in your own words, the real, structural
      difference between a `Window` and a `UserControl`.
- [ ] You can explain why a real add-in template hands you a
      `UserControl` instead of a `Window`.
- [ ] You identified, in your own real add-in project, which real
      class is the `UserControl` the host will embed.
- [ ] You can state when it's still correct to use a real, independent
      `Window` from inside an add-in.

## Next

[Lesson 07 — NuGet Basics](lesson-07-nuget-basics.md) covers the real
.NET equivalent of `pip` — how to pull in a real, external library
(like the logging library the next two lessons use) instead of writing
everything yourself.
