# Lesson 27: Dialogs

**What you will build:** You will build a set of isolated examples demonstrating how to prompt the user for confirmation, how to ask them to select files for opening and saving, and how to create a custom secondary window that blocks the main window until the user provides input. This solves the problem of needing immediate, mandatory input or confirmation from the user before the application can proceed with an action.

**What you need to know first:** Lesson 01 (Window basics), Lesson 04 (Events and Event Handlers), Lesson 08 (StackPanel and Buttons).

**Terms introduced in this lesson:**
- **Modal Window** — a window that blocks input to all other windows in the application until it is closed. *Why it exists:* To ensure the user addresses a critical prompt or provides necessary data before continuing the current task.
- **Dialog Result** — a value indicating how a dialog was closed (e.g., accepted, canceled). *Why it exists:* So the code that opened the dialog knows whether to proceed with the action or abort it.

**Objects and methods used:**
- **MessageBox / Show**
  - *What it is:* A static method that displays a standard Windows message box.
  - *Implementation:* `public static MessageBoxResult Show(string messageBoxText, string caption, MessageBoxButton button, MessageBoxImage icon);`
  - *Its use:* To quickly display simple text, warnings, or ask yes/no questions without building a custom window.
- **OpenFileDialog / ShowDialog**
  - *What it is:* A standard Windows dialog for selecting a file to open.
  - *Implementation:* `public bool? ShowDialog();`
  - *Its use:* To let the user browse their file system and pick a file, returning the selected path.
- **SaveFileDialog / ShowDialog**
  - *What it is:* A standard Windows dialog for selecting a location and name to save a file.
  - *Implementation:* `public bool? ShowDialog();`
  - *Its use:* To let the user choose where to save a new file, prompting them if they are about to overwrite an existing one.
- **Window / ShowDialog**
  - *What it is:* A method that opens a window modally.
  - *Implementation:* `public bool? ShowDialog();`
  - *Its use:* To display a custom window that stops the rest of the application until the window is closed.
- **Window / Owner**
  - *What it is:* A property that establishes a parent-child relationship between two windows.
  - *Implementation:* `public Window Owner { get; set; }`
  - *Its use:* To ensure a dialog always stays visually on top of the window that opened it.

---

## Concept Unit: MessageBox

### The Problem
You need to ask the user a simple question, like confirming they want to delete a file, or you need to show them an error message. Creating a brand new custom window with a TextBlock and two Buttons every time you need a simple "Yes/No" confirmation is tedious and visually inconsistent with the rest of the operating system.

### The New Code
```csharp
using System;
using System.Windows;

namespace DialogExamples;

public class Program
{
    [STAThread]
    public static void Main()
    {
        Application app = new Application();
        
        Window window = new Window();
        window.Title = "MessageBox Example";
        window.Width = 300;
        window.Height = 200;
        
        System.Windows.Controls.Button btn = new System.Windows.Controls.Button();
        btn.Content = "Delete File";
        btn.Click += (sender, e) =>
        {
            MessageBoxResult result = MessageBox.Show(
                "Are you sure you want to delete this file?",
                "Confirm Delete",
                MessageBoxButton.YesNo,
                MessageBoxImage.Warning
            );
            
            if (result == MessageBoxResult.Yes)
            {
                btn.Content = "Deleted!";
            }
            else
            {
                btn.Content = "Canceled.";
            }
        };
        
        window.Content = btn;
        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `MessageBox.Show(...)` — This static method halts the execution of the code inside the event handler and displays the system message box on screen. Execution will not resume until the user clicks a button to dismiss the box.
- `"Are you sure you want to delete this file?"` — The main text body of the message box.
- `"Confirm Delete"` — The text displayed in the title bar of the message box.
- `MessageBoxButton.YesNo` — This enum value tells the system exactly which buttons to render. The options are `OK`, `OKCancel`, `YesNo`, and `YesNoCancel`. Omitting this defaults to just an `OK` button.
- `MessageBoxImage.Warning` — This enum value tells the system to draw a standard yellow warning triangle icon. Other options include `Error`, `Information`, and `Question`. This also triggers the corresponding system sound.
- `MessageBoxResult result = ...` — The `Show` method returns an enum value representing which specific button the user clicked.
- `if (result == MessageBoxResult.Yes)` — We inspect the result to decide what to do next. If they clicked Yes, we proceed with the destructive action. If they clicked No (or closed the window via the red X, though the red X is disabled for Yes/No dialogs), we do nothing or abort.

### CS Lens
This is an example of a synchronous blocking call. The function `Show` does not return immediately. It transfers control to the operating system's dialog routine, entering its own internal event loop to wait for mouse clicks on its specific buttons, and only returns control to your application when a terminal state (a button click) is reached.

### SE Lens
The `MessageBox` is rigid. You cannot change the font, you cannot add a third custom button like "Delete All", and you cannot put a checkbox inside it. This rigidity is its engineering tradeoff: it costs zero effort to design and build, but you surrender all control over its layout.

### Run It Yourself
1. Create a new WPF project: `dotnet new wpf -n MessageBoxApp`.
2. Delete `MainWindow.xaml` and `MainWindow.xaml.cs`.
3. Delete `App.xaml` and `App.xaml.cs`.
4. Create a new file `Program.cs` and paste the code above.
5. In `MessageBoxApp.csproj`, add `<StartupObject>DialogExamples.Program</StartupObject>` inside the `<PropertyGroup>`.
6. Run the application: `dotnet run`. Click the button, then click "Yes" or "No" and observe the button text change.

---

## Concept Unit: OpenFileDialog and SaveFileDialog

### The Problem
You are writing a text editor. The user needs to choose a file from their hard drive to open. Writing your own user interface to traverse directories, list files, and handle hidden folders is extremely complex and error-prone. You need the standard Windows file picker.

### The New Code
```csharp
using System;
using System.Windows;
using Microsoft.Win32;

namespace DialogExamples;

public class Program
{
    [STAThread]
    public static void Main()
    {
        Application app = new Application();
        
        Window window = new Window();
        window.Title = "File Dialogs";
        window.Width = 400;
        window.Height = 200;
        
        System.Windows.Controls.StackPanel panel = new System.Windows.Controls.StackPanel();
        
        System.Windows.Controls.Button openBtn = new System.Windows.Controls.Button();
        openBtn.Content = "Open Text File";
        openBtn.Click += (sender, e) =>
        {
            OpenFileDialog dlg = new OpenFileDialog();
            dlg.Filter = "Text files|*.txt|All files|*.*";
            
            bool? result = dlg.ShowDialog();
            
            if (result == true)
            {
                openBtn.Content = $"Opened: {dlg.FileName}";
            }
        };
        
        System.Windows.Controls.Button saveBtn = new System.Windows.Controls.Button();
        saveBtn.Content = "Save Text File";
        saveBtn.Click += (sender, e) =>
        {
            SaveFileDialog dlg = new SaveFileDialog();
            dlg.Filter = "Text files|*.txt|All files|*.*";
            dlg.DefaultExt = ".txt";
            
            bool? result = dlg.ShowDialog();
            
            if (result == true)
            {
                saveBtn.Content = $"Saved to: {dlg.FileName}";
            }
        };
        
        panel.Children.Add(openBtn);
        panel.Children.Add(saveBtn);
        window.Content = panel;
        
        app.Run(window);
    }
}
```

### Mechanical Walkthrough
- `using Microsoft.Win32;` — The file dialog classes in WPF are wrappers around older Windows API components and live in this specific namespace, not `System.Windows`.
- `OpenFileDialog dlg = new OpenFileDialog();` — We instantiate the dialog object. Unlike `MessageBox.Show`, this is an object we configure before showing.
- `dlg.Filter = "Text files|*.txt|All files|*.*";` — This string controls the dropdown menu at the bottom right of the file picker. It is formatted as `Display Name|Pattern`. Multiple pairs are separated by another pipe `|`. This restricts what files the user sees.
- `bool? result = dlg.ShowDialog();` — This opens the window and blocks until the user makes a choice. The return type is `bool?` (a nullable boolean). It can be `true` (user picked a file and clicked Open/Save), `false` (user clicked Cancel), or theoretically `null` (if the dialog was closed in an irregular way, though this rarely happens in practice).
- `if (result == true)` — Because `result` is a `bool?`, we must explicitly compare it to `true`. We cannot just write `if (result)`.
- `dlg.FileName` — If the result is true, this property holds the complete, absolute path to the file the user selected.
- `SaveFileDialog` — This works almost identically to `OpenFileDialog`, but its built-in behavior changes. It will automatically warn the user if they type the name of a file that already exists, asking if they want to overwrite it.

### CS Lens
These dialogs are operating system abstractions. Your program does not have direct access to the user's raw disk sectors. Instead, you ask the OS to negotiate with the user, and the OS hands you back a string representing a verified path.

### SE Lens
Using standard system dialogs ensures consistency. When you use `OpenFileDialog`, the user gets their familiar left-hand navigation pane, their custom quick access folders, and their preferred view settings (list vs icons). Building a custom file picker strips the user of their customized OS environment.

### Run It Yourself
1. Replace the `Program.cs` file in your `MessageBoxApp` project with the code above.
2. Run the application: `dotnet run`.
3. Click "Open Text File", select a file, and observe the button text change to the file path.
4. Click "Save Text File", type a name, and observe the path. Note that no file is actually created or read; the dialog only returns the string path.

---

## Concept Unit: Custom Modal Windows

### The Problem
You need the user to enter their name and age before proceeding. `MessageBox` only has buttons, and `OpenFileDialog` only picks files. You need a custom layout with text boxes, but you still need it to block the main application until the data is provided, exactly like a `MessageBox` does.

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;

namespace DialogExamples;

public class EditDialog : Window
{
    public string EnteredName { get; private set; } = string.Empty;
    private TextBox nameBox;

    public EditDialog()
    {
        Title = "Enter Details";
        Width = 250;
        Height = 150;

        StackPanel panel = new StackPanel();
        
        nameBox = new TextBox();
        nameBox.Margin = new Thickness(10);
        
        Button okBtn = new Button();
        okBtn.Content = "OK";
        okBtn.Margin = new Thickness(10);
        okBtn.Click += (s, e) =>
        {
            EnteredName = nameBox.Text;
            this.DialogResult = true; 
        };

        panel.Children.Add(new TextBlock { Text = "Name:", Margin = new Thickness(10,10,10,0) });
        panel.Children.Add(nameBox);
        panel.Children.Add(okBtn);

        Content = panel;
    }
}

public class Program
{
    [STAThread]
    public static void Main()
    {
        Application app = new Application();
        
        Window mainWindow = new Window();
        mainWindow.Title = "Main Window";
        mainWindow.Width = 400;
        mainWindow.Height = 300;
        
        Button openBtn = new Button();
        openBtn.Content = "Open Custom Dialog";
        openBtn.Click += (sender, e) =>
        {
            EditDialog dialog = new EditDialog();
            bool? result = dialog.ShowDialog();
            
            if (result == true)
            {
                openBtn.Content = $"Hello, {dialog.EnteredName}";
            }
            else
            {
                openBtn.Content = "Dialog Canceled";
            }
        };
        
        mainWindow.Content = openBtn;
        app.Run(mainWindow);
    }
}
```

### Mechanical Walkthrough
- `public class EditDialog : Window` — We define a completely new class that inherits from `Window`. It is a full window, capable of holding any UI elements.
- `public string EnteredName { get; private set; }` — We expose a public property so that the window that opened this dialog can retrieve the data the user typed in, after the dialog closes.
- `this.DialogResult = true;` — This is the critical line inside the dialog. Setting the `DialogResult` property of a `Window` immediately closes the window and causes the `ShowDialog()` call in the parent window to return this value. Setting it to `true` usually means "Accept/OK".
- `EditDialog dialog = new EditDialog();` — In the main window, we instantiate our custom window class.
- `bool? result = dialog.ShowDialog();` — We call `ShowDialog()` instead of `Show()`. `ShowDialog()` halts execution of the event handler here. The user cannot click anything on the main window. If the user closes the dialog with the red X, `ShowDialog()` returns `false`. If the user clicks the OK button, `ShowDialog()` returns `true` (because we set `this.DialogResult = true` in the button handler).
- `dialog.EnteredName` — After `ShowDialog()` returns, the `dialog` object still exists in memory (it just isn't on screen anymore). We can now read its public properties to extract the user's input.

### CS Lens
This demonstrates state extraction from a transient object. The dialog window object serves as a temporary data collection vessel. Once its lifecycle on screen ends, the parent extracts the payload before the dialog object is garbage collected.

### SE Lens
By keeping the controls (TextBox, Button) private and exposing only the parsed, validated data via public properties (like `EnteredName`), you enforce encapsulation. The main window does not need to know *how* the dialog collected the name, only that it did.

### Run It Yourself
1. Replace `Program.cs` with the code above.
2. Run the application.
3. Click "Open Custom Dialog". Notice you cannot click the main window while the dialog is open.
4. Type a name and click "OK". The main window updates.
5. Click the button again, but this time close the dialog with the red X in the top right. The main window registers the cancellation.

---

## Concept Unit: Owner Windows

### The Problem
If a user has multiple monitors, or switches applications while your custom modal dialog is open, the dialog might appear behind the main window, or far away on another screen. The user might think your application has frozen because they cannot click the main window, but they don't see the dialog waiting for their input. 

### The New Code
```csharp
using System;
using System.Windows;
using System.Windows.Controls;

namespace DialogExamples;

public class Program
{
    [STAThread]
    public static void Main()
    {
        Application app = new Application();
        
        Window mainWindow = new Window();
        mainWindow.Title = "Main Window";
        mainWindow.Width = 500;
        mainWindow.Height = 400;
        
        Button openBtn = new Button();
        openBtn.Content = "Open Owned Dialog";
        openBtn.Click += (sender, e) =>
        {
            Window dialog = new Window();
            dialog.Title = "I am a child dialog";
            dialog.Width = 200;
            dialog.Height = 100;
            
            // This is the crucial line:
            dialog.Owner = mainWindow;
            
            dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;
            
            dialog.ShowDialog();
        };
        
        mainWindow.Content = openBtn;
        app.Run(mainWindow);
    }
}
```

### Mechanical Walkthrough
- `dialog.Owner = mainWindow;` — This tells the operating system that `dialog` is a direct subordinate of `mainWindow`. When a window has an owner, it is guaranteed to always draw on top of its owner. If the user minimizes the owner, the owned dialog minimizes with it.
- `dialog.WindowStartupLocation = WindowStartupLocation.CenterOwner;` — Because the dialog knows who its owner is, it can use this setting to automatically calculate its position and appear perfectly centered over the main window, regardless of where the main window is on the screen.

### CS Lens
This is a hierarchical UI relationship managed at the OS compositor level. The window manager enforces z-order (depth) constraints based on the parent-child graph you define, ensuring the child is never occluded by the parent.

### SE Lens
Setting the `Owner` is a crucial usability detail. Without it, you create edge cases where the user becomes completely trapped—the main window ignores input because a dialog is open, but the dialog is hidden behind the main window. 

### Run It Yourself
1. Replace `Program.cs` with the code above.
2. Run the application.
3. Move the main window to the far right of your screen.
4. Click "Open Owned Dialog". Notice the dialog appears exactly centered over the main window.
5. Try to click the main window to bring it to the front. You cannot; the dialog stays stubbornly on top.

---

## Connect the Pieces
Consider the flow of control when asking a user to save a document. You click a button. Control halts as `SaveFileDialog.ShowDialog()` takes over. The user picks a file, and control returns with a `bool?`. If `true`, you extract the `FileName`. But what if saving fails? Control flows directly into `MessageBox.Show()`, halting again to inform the user of the error. Finally, if you need them to attach metadata before saving, you instantiate a custom `MetadataDialog`, set its `Owner` to ensure it stays on top, call `ShowDialog()`, and if `true`, extract properties like `dialog.AuthorName`. Throughout this entire sequence, the main application window is paused, waiting for the modal interactions to finish.

## What Breaks Without This
If you try to read a property from a file dialog before you show it, or if you ignore the return value, you will get incorrect data.
In the File Dialogs code, change the `SaveFileDialog` button click handler to this:
```csharp
SaveFileDialog dlg = new SaveFileDialog();
saveBtn.Content = $"Saved to: {dlg.FileName}";
dlg.ShowDialog();
```
When you click the button, the text changes to "Saved to: " with an empty string, *then* the dialog opens. The code executed instantly instead of waiting. You must call `ShowDialog()` and check its result *before* reading the properties.

## Exercises
1. Modify the `MessageBox` example so that it uses `MessageBoxButton.YesNoCancel`. Handle all three possible `MessageBoxResult` outcomes and update the button text differently for each.
2. Modify the Custom Modal Windows example. Add a second TextBox for "Age". Add an `EnteredAge` property. In the main window, if the dialog returns true, display both the name and the age on the main window button.
3. Create a window and a dialog. Do *not* set the `Owner`. Call `dialog.Show()` instead of `dialog.ShowDialog()`. Click the main window. Notice how the dialog vanishes behind the main window. Now set the `Owner` property and repeat. Notice how the dialog stays on top, even though you used `Show()` instead of `ShowDialog()`.

## Definition of Done
- [ ] You can display a standard Windows message box with Yes and No buttons and execute different code based on the user's choice.
- [ ] You can configure and display an OpenFileDialog to restrict selection to a specific file type.
- [ ] You can build a custom `Window` subclass, show it modally, and retrieve data from it after it closes.
- [ ] You can establish an owner relationship between two windows to control z-ordering.
- [ ] You can explain the concept of a modal window out loud, in your own words, to someone who hasn't read this lesson.
