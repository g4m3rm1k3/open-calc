Yes. The curriculum should be built around **actually constructing this application**, not around a sequence of disconnected WPF topics.

The core system you're describing is essentially:

```text
                 ┌─────────────────────┐
                 │       WPF UI        │
                 │                     │
                 │ Folder / Status     │
                 │ Current File        │
                 │ Parsed Data         │
                 │ Generate            │
                 └──────────┬──────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────┐
│                  Application Core                  │
│                                                    │
│ Directory Scanner → Newest File Resolver          │
│        ↓                                           │
│ File Watcher → New File Event                     │
│        ↓                                           │
│ XML Parser → C# Domain Objects                     │
│        ↓                                           │
│ Template Engine → Rendered Text                    │
│        ↓                                           │
│ File Generator → .txt / .html / etc.              │
└────────────────────────────────────────────────────┘
```

And the curriculum should **build that pipeline incrementally**, with every group of lessons producing a working piece of the eventual application.

The BRD explicitly establishes the same separation: typed C# data model, WPF UI, parsing, persistence/export, and template generation, with business logic kept out of UI event handlers.  It also explicitly requires the XML parser to deal with the actual nested Mastercam structure rather than assuming a flat XML hierarchy. 

# WPF Mastercam File Generator Curriculum

## Phase 1 — Build the Smallest WPF Application

### Lesson 1 — Create the WPF Shell

Build:

```text
MainWindow
┌─────────────────────────────┐
│ Mastercam Generator         │
├─────────────────────────────┤
│                             │
│                             │
└─────────────────────────────┘
```

Teach:

* WPF application structure
* `App.xaml`
* `MainWindow.xaml`
* XAML vs C#
* controls
* layout containers
* code-behind
* application startup

The lesson ends with a running WPF application.

---

### Lesson 2 — Build the Folder Selector

Build:

```text
[ Folder: C:\Mastercam\Reports... ] [Browse]
```

When Browse is clicked:

1. Open folder picker.
2. Return selected directory.
3. Display it in the UI.

Teach:

* button events
* event handlers
* dialogs
* `string` state
* connecting UI actions to application behavior

---

### Lesson 3 — Separate UI From Application Logic

Take the folder-selection code out of `MainWindow`.

Build:

```text
MainWindow
    ↓
FileSource
```

For example:

```text
FileSource
    SelectDirectory()
```

Teach:

* why UI shouldn't own business logic
* classes as collaborators
* dependency boundaries
* passing information between WPF and normal C# code

This is the first architectural lesson.

---

# Phase 2 — Finding the Correct XML File

Now build the actual file-discovery system.

### Lesson 4 — Represent a File as Data

Create a small object representing a candidate file:

```text
InputFile
    Path
    FileName
    LastModified
```

Build a screen that displays discovered files.

Teach:

* classes/records
* properties
* `FileInfo`
* filesystem metadata
* converting framework objects into application objects

---

### Lesson 5 — Scan a Directory

Build:

```text
DirectoryScanner
```

It should:

1. Receive a directory.
2. Find XML files.
3. Return them as `InputFile` objects.

UI:

```text
Directory:
C:\Mastercam\Reports

Files Found: 17

file1.xml
file2.xml
file3.xml
...
```

Teach:

* `DirectoryInfo`
* `FileInfo`
* filtering
* collections
* filesystem exceptions

---

### Lesson 6 — Find the Newest File

Build:

```text
NewestFileResolver
```

Input:

```text
IEnumerable<InputFile>
```

Output:

```text
InputFile
```

The UI now says:

```text
Newest file:

SetupSheet_2026-08-26_0512.xml

Modified:
08/26/2026 05:12
```

Teach:

* LINQ
* `OrderByDescending`
* `MaxBy`
* nullable results
* separating "find files" from "decide which file"

This distinction matters enormously later.

---

### Lesson 7 — Parse the Date From the Filename

If the filenames contain dates, don't simply rely on filesystem modification time.

Build a:

```text
FileDateParser
```

that understands the application's naming convention.

Teach:

* parsing strings
* `DateTime`
* `DateTimeOffset`
* explicit filename conventions
* invalid filenames
* why filesystem timestamps and filename timestamps are different concepts

Now the resolver can make a deliberate decision:

```text
filename date
      ↓
valid?
      ↓
candidate
      ↓
newest candidate
```

---

### Lesson 8 — Connect Discovery to WPF

The WPF screen now performs the complete operation:

```text
[Scan Directory]

Found: 17 XML files

Newest:
SetupSheet_2026-08-26_0512.xml
```

Teach:

* updating controls from application results
* `ObservableCollection`
* `ListView`
* `DataGrid`
* basic WPF data binding

At this point you have your **first real vertical slice**.

---

# Phase 3 — Watch the Directory

Now make the application stay alive and react to new files.

### Lesson 9 — Introduce FileSystemWatcher

Build a standalone watcher:

```text
DirectoryWatcher
```

It watches:

```text
C:\Mastercam\Reports
```

and reports:

```text
Created
Changed
Renamed
Deleted
```

Teach:

* `FileSystemWatcher`
* filesystem events
* event-driven programming
* event handlers
* why filesystem events aren't as simple as "a file appeared"

---

### Lesson 10 — Deal With Files That Aren't Ready

This is important.

When Mastercam creates a file, the watcher may tell you:

```text
FILE CREATED
```

before the file is actually finished writing.

Build:

```text
WaitForFileReady()
```

Teach:

* file locks
* retry loops
* transient failures
* polling
* timeouts
* race conditions

The application should not try to parse:

```text
half-written.xml
```

---

### Lesson 11 — Watch for a Newer File

Combine:

```text
DirectoryWatcher
        +
NewestFileResolver
```

Flow:

```text
New file detected
       ↓
Is it XML?
       ↓
Is it newer?
       ↓
Is it complete?
       ↓
Make it current
```

Teach:

* event-driven pipelines
* filtering events
* coordinating multiple services
* state transitions

---

### Lesson 12 — Display Live Status in WPF

Build:

```text
Watcher Status: ● Watching

Current File:
SetupSheet_2026-08-26_0512.xml

Last Event:
New file detected

Last Scan:
05:14:23
```

Teach:

* WPF binding more deeply
* `INotifyPropertyChanged`
* application state
* status models
* UI updates from background work

---

### Lesson 13 — Background Work and the WPF Dispatcher

Now deliberately make scanning asynchronous.

Teach:

* `Task`
* `async`
* `await`
* background filesystem operations
* WPF UI thread
* `Dispatcher`
* why you cannot arbitrarily modify WPF controls from another thread

This lesson prevents a huge class of real WPF problems.

---

# Phase 4 — Understand the XML Before Building the Parser

Now we stop treating XML as "a file" and start treating it as a data source.

### Lesson 14 — Explore the Real XML

Load an actual setup-sheet XML.

Build a tiny XML explorer that displays:

```text
Root
 ├── NCFILE
 │    ├── OPERATION
 │    ├── TOOL
 │    └── ...
 ├── NCFILE
 │    └── ...
```

Teach:

* XML documents
* elements
* attributes
* text values
* namespaces if present
* siblings
* nesting
* repeated elements

---

### Lesson 15 — Query XML With LINQ to XML

Build queries such as:

```text
Find root metadata
Find NCFILE elements
Find operations
Find tools
```

Teach:

* `XDocument`
* `XElement`
* `XAttribute`
* `Elements`
* `Descendants`
* `Element`
* `Attribute`

And critically:

```text
Elements()
```

vs.

```text
Descendants()
```

The BRD specifically calls this out because the real XML contains `NCFILE` siblings and `TOOL` elements at multiple depths. 

---

# Phase 5 — Build the Domain Model

Now we stop passing XML around the application.

### Lesson 16 — Create the Root Part Object

Build:

```text
Part
 ├── PartNumber
 ├── Description
 ├── Customer
 ├── Revision
 └── ...
```

Teach:

* domain models
* properties
* records vs classes
* domain vocabulary
* XML objects vs application objects

---

### Lesson 17 — Build NcFile

```text
Part
 └── NcFiles
      ├── NcFile
      ├── NcFile
      └── NcFile
```

Teach:

* composition
* collections inside domain objects
* object graphs

---

### Lesson 18 — Build Operation

```text
NcFile
 └── Operations
      ├── Operation
      ├── Operation
      └── Operation
```

Teach:

* nested domain models
* parent/child relationships
* IDs and references
* sequence numbers

---

### Lesson 19 — Build Tool and Assembly

Build:

```text
Tool
 ├── Number
 ├── Description
 ├── Comment
 └── Assembly
       └── Holder
```

This directly follows the BRD's intended typed representation of `Part`, `NcFile`, `Operation`, `Tool`, `Assembly`, and `Holder`. 

---

### Lesson 20 — Parse XML Into Part

Now build the actual:

```text
SetupSheetParser
```

Pipeline:

```text
XDocument
     ↓
SetupSheetParser
     ↓
Part
```

The parser is no longer responsible for displaying anything.

That is a major architectural milestone.

---

# Phase 6 — Handle Bad/Placeholder Data

### Lesson 21 — Detect Placeholder Values

Handle values such as:

```xml
<DESCRIPTION>PART NAME</DESCRIPTION>
<CUSTOMER>REV</CUSTOMER>
<DRAWING-NUMBER>PROGRAM NUMBER</DRAWING-NUMBER>
```

The application should recognize:

```text
placeholder
```

rather than treating it as real data.

The BRD explicitly requires this behavior. 

---

### Lesson 22 — Validation Results

Instead of:

```text
Part.Description = "PART NAME"
```

build:

```text
ValidationResult

Field:
Description

Value:
PART NAME

Problem:
Placeholder value
```

Teach:

* validation
* error/warning models
* validation collections
* domain-level validation

---

### Lesson 23 — Show Parsed Data in WPF

Now bind the real `Part` object to the WPF UI.

Build:

```text
PART
────────────────────────
Description    [Widget]
Customer       [Acme]
Revision       [B]

NC PROGRAMS
────────────────────────
Program 1001
Program 1002

OPERATIONS
────────────────────────
10
20
30

TOOLS
────────────────────────
T1
T2
T5
```

Teach:

* binding nested objects
* `DataContext`
* `ItemsControl`
* `ListView`
* `DataGrid`
* selection

---

# Phase 7 — Introduce MVVM Because the Application Now Needs It

Don't start the curriculum with MVVM.

Now you've earned it.

### Lesson 24 — Convert MainWindow to a ViewModel

Build:

```text
MainWindow
    ↓
MainViewModel
    ↓
Application Services
```

Teach:

* MVVM
* commands
* properties
* `INotifyPropertyChanged`
* why ViewModels exist

---

### Lesson 25 — Build Commands

Replace:

```text
Button_Click()
```

with:

```text
ScanCommand
WatchCommand
LoadCommand
GenerateCommand
```

Teach:

* `ICommand`
* command binding
* `CanExecute`
* UI state derived from application state

---

# Phase 8 — Build the Template Engine

This is where your "C# Jinja" requirement comes in.

### Lesson 26 — First Template Without a Library

Start with:

```text
Hello {{PartNumber}}
```

and:

```text
PartNumber = "12345"
```

producing:

```text
Hello 12345
```

Teach:

* templates
* placeholders
* rendering
* separating template from output

Do **not** introduce Scriban immediately.

First understand what a template engine actually does.

---

### Lesson 27 — Template Context

Build:

```text
TemplateContext
    Part
    NcFiles
    Operations
    Tools
```

Template:

```text
Part: {{ Part.PartNumber }}

Customer: {{ Part.Customer }}

{% for operation in Part.Operations %}
Operation: {{ operation.Number }}
{% endfor %}
```

Teach:

* object graphs as template context
* variable lookup
* loops
* conditionals
* rendering semantics

---

### Lesson 28 — Use the Real C# Template Engine

Now introduce the selected library, likely **Scriban or Fluid**, which the BRD already identifies as the intended C# equivalent of the prior Jinja pipeline. 

Build:

```text
Template
      ↓
Template Engine
      ↓
Rendered String
```

---

### Lesson 29 — Load Templates From Disk

Instead of:

```text
template = "..."
```

build:

```text
Templates/
    SetupSheet.txt
    Program.nc
    ColoringBook.html
```

The application loads them dynamically.

Teach:

* template files
* relative paths
* configuration
* template discovery
* template errors

---

# Phase 9 — Generate Actual Files

### Lesson 30 — Build FileGenerator

Input:

```text
Rendered content
Output path
```

Output:

```text
Generated file
```

Teach:

* `File.WriteAllText`
* encodings
* directories
* filenames
* overwrite policies

---

### Lesson 31 — Generate Text Files

Build:

```text
Part
 ↓
Template
 ↓
Rendered text
 ↓
.txt
```

Now you have the first complete generation pipeline.

---

### Lesson 32 — Generate HTML

Use the exact same engine:

```text
Part
 ↓
HTML Template
 ↓
Rendered HTML
 ↓
.html
```

The only thing that changes is the template.

This teaches the important architecture:

```text
DATA
 ↓
TEMPLATE
 ↓
RENDERED CONTENT
 ↓
FILE
```

not:

```text
Part
 ↓
HTML-specific code
```

---

### Lesson 33 — Machine-Specific Templates

Build:

```text
Templates/
    Fanuc/
       Program.nc
    Okuma/
       Program.nc
    Siemens/
       Program.nc
```

Then:

```text
MachineType
      ↓
TemplateResolver
      ↓
Correct template
```

This directly implements the BRD's machine-type-keyed NC template chain. 

---

# Phase 10 — Connect Everything

Now the application becomes the thing you originally described.

### Lesson 34 — Manual Load Pipeline

One button:

```text
[Load Newest]
```

does:

```text
Directory
    ↓
Scan
    ↓
Find newest XML
    ↓
Parse
    ↓
Part
    ↓
Display
```

---

### Lesson 35 — Automatic Watch Pipeline

Now:

```text
New XML
    ↓
Watcher
    ↓
File Ready?
    ↓
Newer?
    ↓
Parser
    ↓
Part
    ↓
UI
```

No button required.

---

### Lesson 36 — Automatic Generation

Extend it:

```text
New XML
    ↓
Watcher
    ↓
Parser
    ↓
Part
    ↓
Template
    ↓
Renderer
    ↓
Generated Files
```

Now you've built the fundamental product.

---

# Phase 11 — Make It a Real WPF Application

### Lesson 37 — Application State

Create an explicit state model:

```text
ApplicationState

SelectedDirectory
CurrentFile
CurrentPart
WatcherState
LastScan
LastGeneration
Errors
```

Teach:

* state modeling
* immutable vs mutable state
* observable state
* keeping the ViewModel manageable

---

### Lesson 38 — Logging and Diagnostics

Build a log panel:

```text
05:12:03  Watching directory
05:13:11  New XML detected
05:13:12  File ready
05:13:12  Parsing XML
05:13:13  Parsed 4 NC files
05:13:13  Parsed 27 operations
05:13:14  Rendering Fanuc template
05:13:14  Generated Program.nc
```

Teach:

* structured logging
* diagnostic messages
* error handling
* exception boundaries

---

### Lesson 39 — Error Pipeline

Handle:

```text
Invalid XML
Missing template
Template syntax error
File locked
Directory unavailable
Invalid output path
Unknown machine type
```

Build a unified application error model rather than letting exceptions randomly reach WPF.

---

### Lesson 40 — Template Preview

Build:

```text
┌──────────────────┬─────────────────────────┐
│ Template         │ Rendered Output         │
│                  │                         │
│ {{ Part.Name }}  │ Part: ABC123            │
│                  │                         │
│ {% for ... %}    │ Operation 10            │
│                  │ Operation 20            │
└──────────────────┴─────────────────────────┘
```

This becomes extremely useful for developing templates.

---

# Phase 12 — Testing the Architecture

### Lesson 41 — Test the File Resolver

Test:

```text
no files
one file
multiple files
invalid filenames
same dates
newer file
```

---

### Lesson 42 — Test the XML Parser

Given:

```text
input.xml
```

assert:

```text
Part.PartNumber
NcFiles.Count
Operations.Count
Tools.Count
```

---

### Lesson 43 — Test Placeholder Detection

Test:

```text
real value → valid
placeholder → warning
blank → warning
```

---

### Lesson 44 — Test Template Rendering

Given:

```text
Part
```

and:

```text
template
```

assert the rendered output.

This is particularly valuable because it lets you develop templates without involving WPF.

---

### Lesson 45 — Test the Complete Pipeline

Test:

```text
XML
 ↓
Parser
 ↓
Part
 ↓
Template
 ↓
Rendered Text
 ↓
Generated File
```

The WPF UI isn't involved.

That's the point.

---

# Phase 13 — Production Architecture

### Lesson 46 — Extract Interfaces

Introduce boundaries such as:

```text
IFileScanner
IFileResolver
IFileWatcher
IXmlParser
ITemplateRenderer
IFileGenerator
```

Teach:

* interfaces
* dependency inversion
* substitutable implementations
* testing seams

---

### Lesson 47 — Dependency Injection

Build:

```text
MainViewModel
      ↓
IFileScanner
IFileWatcher
IXmlParser
ITemplateRenderer
IFileGenerator
```

Teach:

* dependency injection
* composition root
* lifetime management

---

### Lesson 48 — Configuration

Move things like:

```text
Input directory
Template directory
Output directory
Machine type
Filename conventions
```

out of source code.

Build:

```text
appsettings.json
```

and configuration objects.

---

### Lesson 49 — Persistent Application Settings

Teach the difference between:

```text
application configuration
```

and:

```text
user settings
```

Persist things such as:

```text
last selected directory
selected machine
output directory
window state
```

---

### Lesson 50 — Package the Application

Build the actual distributable Windows application.

Teach:

* Release builds
* publish
* deployment
* configuration files
* template deployment
* output directories
* logging in production

---

# Final Architecture

At the end of the curriculum, the application should look roughly like this:

```text
WPF
│
├── Views
│
├── ViewModels
│
└── Commands
        │
        ▼
Application Layer
│
├── File Scanner
├── File Resolver
├── Directory Watcher
├── XML Parser
├── Validation
├── Template Renderer
└── File Generator
        │
        ▼
Domain
│
├── Part
├── NcFile
├── Operation
├── Tool
├── Assembly
└── Holder
        │
        ├───────────────┐
        ▼               ▼
   XML Input        Templates
                        │
                        ▼
                 Rendered Output
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
           .TXT                   .HTML
```

And importantly, **WPF is not the application**.

WPF is the interface sitting on top of the application:

```text
                     WPF
                      │
               MainViewModel
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    Application Core          Domain Model
          │                       │
    ┌─────┼─────┐                 │
    ▼     ▼     ▼                 │
 Files   XML  Templates            │
    │     │     │                 │
    └─────┴─────┴─────────────────┘
                      │
                      ▼
                  Generated
                    Files
```

That is the curriculum I would use for this project: **45–50 build-oriented lessons where each lesson adds a concrete capability to the application**, rather than 50 lessons of "WPF controls," "data binding," "LINQ," "MVVM," etc. in isolation.

The later BRD features—SQLite persistence, audit trails, balloon pairing, Excel export, tool import, and eventually Mastercam API integration—can then become **second curriculum layers on top of this foundation**, rather than contaminating the first pass through the core file → object → template → output pipeline. The BRD explicitly calls for those systems to remain separated architecturally. 
