# Lesson 31: Code You Didn't Write, Running Inside Code You Did
### (Project 10 — Package Manager, C++)

**What you will build.** A `PluginRegistry` that lets a completely
independent piece of code — a "third-party" Slack notifier, written
with zero knowledge of `PackageManager`'s internals — hook into every
install, registered at runtime with no changes to `PackageManager`
itself. Then a validation `Chain of Responsibility`: three independent
checks a package must pass before installing, each one able to stop
the process and report exactly which check failed and why. The
transferable problem this lesson is actually about: a real system has
to support behavior its own authors never anticipated, and a sequence
of independent checks should be composable — addable, removable,
reorderable — without ever becoming one large function that knows
about all of them at once.

**What you need to know first.** Lesson 29 — `DependencyGraph`'s
precise, named error messages. Lesson 30 — `resolve`'s precise conflict
diagnosis, the same standard of precision this lesson's validation
chain extends to package validation.

---

## Concept Unit: The Plugin Pattern

### The Problem

A real package manager needs to support behavior its own core code was
never written to know about — a company's internal Slack notifications
on every install, a custom license-compliance check, a corporate audit
log. `PackageManager` itself can't be modified every time someone wants
one more thing to happen on install; something needs to let outside
code hook in without `PackageManager` ever needing to change.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `plugin_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — `<memory>`, for smart pointers (Project 9, Lesson
  24).

### The New Code

```cpp
#include <memory>

class Plugin {
public:
    virtual void onInstall(const std::string& packageName) = 0;
    virtual ~Plugin() = default;
};

class LoggingPlugin : public Plugin {
public:
    void onInstall(const std::string& packageName) override {
        std::cout << "[log] Installed: " << packageName << std::endl;
    }
};

class NotifyPlugin : public Plugin {
public:
    void onInstall(const std::string& packageName) override {
        std::cout << "[notify] Sending install notification for " << packageName << std::endl;
    }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
std::vector<std::unique_ptr<Plugin>> plugins;
plugins.push_back(std::make_unique<LoggingPlugin>());
plugins.push_back(std::make_unique<NotifyPlugin>());

for (auto& plugin : plugins) {
    plugin->onInstall("web-framework");
}
```

Real output:

```
[log] Installed: web-framework
[notify] Sending install notification for web-framework
```

Two completely independent classes, `LoggingPlugin` and `NotifyPlugin`,
each providing their own `onInstall` — held together in one
`std::vector<std::unique_ptr<Plugin>>` and triggered uniformly, neither
one aware the other exists. `virtual void onInstall(...) = 0;` — **(a)
first appearance** of a **pure virtual function**: `= 0` means
`Plugin` itself can never be instantiated directly, only through a
class that actually provides a real `onInstall` — C++'s own version of
the abstract-interface idea Lesson 27's own AST structs never needed,
but Java's `interface` (Project 7, Lesson 15) and C#'s own `interface`
(Project 8, Lesson 21's `IInventoryComponent`) both already
established.

### Discard the throwaway example

`plugin_lab.cpp`'s two plugins are deleted — the interface-plus-list
shape they proved carries forward directly into the real
`PluginRegistry`.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `plugin_registry.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `InstallPlugin` interface, defined in the same
  file.

### The New Code

```cpp
class PluginRegistry {
public:
    void registerPlugin(std::unique_ptr<InstallPlugin> plugin) {
        plugins.push_back(std::move(plugin));
    }

    void notifyInstalled(const std::string& packageName) {
        for (auto& plugin : plugins) {
            plugin->onInstall(packageName);
        }
    }

private:
    std::vector<std::unique_ptr<InstallPlugin>> plugins;
};

class PackageManager {
public:
    PluginRegistry plugins;

    void install(const std::string& packageName) {
        std::cout << "Installing " << packageName << "..." << std::endl;
        plugins.notifyInstalled(packageName);
    }
};
```

### The Updated Project

Brand-new file, shown whole above — `PackageManager` owns a
`PluginRegistry` and calls `notifyInstalled` at exactly one point,
`install`; it never references any specific plugin class by name
anywhere.

### Mechanical walkthrough

- `void registerPlugin(std::unique_ptr<InstallPlugin> plugin) { plugins.push_back(std::move(plugin)); }`
  — **(b) hard concept reappearing**: `std::move` from Project 9,
  Lesson 24 — ownership of the plugin genuinely transfers into the
  registry's own vector; the caller's `unique_ptr` is left empty
  afterward, the same guarantee proven for `Connection` two lessons
  earlier.
- `void notifyInstalled(const std::string& packageName) { for (auto& plugin : plugins) { plugin->onInstall(packageName); } }`
  — **(b) hard concept reappearing**: the exact broadcast loop from the
  isolated lab, now a real method on a real registry.
- `PluginRegistry plugins;` on `PackageManager` — **(a) first
  appearance,** conceptually: `PackageManager` holds a registry, not a
  fixed list of specific plugin types — the actual structural decision
  that makes new plugins addable without ever touching
  `PackageManager`'s own source.

### CS lens

This is the **Plugin pattern**: a host application defines an interface
and a registration mechanism, and independently-developed code —
possibly written by someone who has never seen the host's own source
— can extend its behavior by implementing that interface and
registering an instance. Also recognized in: a browser extension
system, a text editor's plugin ecosystem (VS Code, Vim), Project 3,
Lesson 9's `UserRepositoryAdapter` — a related but distinct idea:
Adapter makes one specific incompatible thing fit an existing
interface; Plugin defines an interface *specifically* so arbitrary,
not-yet-written implementations can be added later.

### SE lens

Proven directly — a plugin registered *after* one install already
happened, with `PackageManager` itself never modified:

```cpp
manager.plugins.registerPlugin(std::make_unique<ChecksumLogPlugin>());
manager.install("web-framework");

std::cout << "--- registering a third-party plugin at runtime ---" << std::endl;
manager.plugins.registerPlugin(std::make_unique<SlackNotifyPlugin>());
manager.install("logger");
```

Real output:

```
Installing web-framework...
[checksum-log] Recorded checksum for web-framework
--- registering a third-party plugin at runtime ---
Installing logger...
[checksum-log] Recorded checksum for logger
[slack] Posting to #builds: logger was installed
```

`SlackNotifyPlugin` fires correctly on the second install, having never
existed at all during the first — proof that `PackageManager`'s own
`install` method required zero changes to support a plugin that didn't
exist when `PackageManager` was written. The real cost: every plugin
must fit the exact shape `InstallPlugin` defines — one method,
`onInstall`, given only a package name; a plugin needing more context
(the package's full metadata, say) would require `InstallPlugin`'s own
interface to grow, a real, shared cost paid by every existing plugin
whenever the interface changes.

### Commands needed

Same `g++ -std=c++17` pattern as Lessons 29–30.

### Run it

Shown above.

### Connecting sentence

Independent code can now hook into installation without
`PackageManager` knowing it exists — the next unit builds a different
kind of extensibility: not "notify everyone," but "run through a
sequence of checks, any one of which can stop everything."

---

## Concept Unit: Chain of Responsibility

### The Problem

Before a package installs, it needs to pass several independent
checks — its name is well-formed, its version string is well-formed
(Lesson 30's own `Version::parse` would need exactly this kind of
check upstream), its checksum matches what was expected. One large
`validate()` function checking all three in sequence would work, but
adding, removing, or reordering checks would mean editing that one
function every time — the same "everything crammed into one place"
problem this curriculum has named and solved differently in nearly
every phase.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `chain_lab.cpp` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```cpp
class Handler {
public:
    void setNext(std::shared_ptr<Handler> next) { nextHandler = next; }

    void handle(int value) {
        if (!process(value)) return;
        if (nextHandler) nextHandler->handle(value);
    }

    virtual ~Handler() = default;

protected:
    virtual bool process(int value) = 0;

private:
    std::shared_ptr<Handler> nextHandler;
};

class PositiveCheck : public Handler {
protected:
    bool process(int value) override {
        std::cout << "Checking positive: " << value << std::endl;
        if (value <= 0) { std::cout << "  FAILED: not positive" << std::endl; return false; }
        return true;
    }
};

class EvenCheck : public Handler {
protected:
    bool process(int value) override {
        std::cout << "Checking even: " << value << std::endl;
        if (value % 2 != 0) { std::cout << "  FAILED: not even" << std::endl; return false; }
        return true;
    }
};
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```cpp
auto positive = std::make_shared<PositiveCheck>();
auto even = std::make_shared<EvenCheck>();
positive->setNext(even);

positive->handle(4);
positive->handle(-3);
```

Real output:

```
--- validating 4 ---
Checking positive: 4
Checking even: 4
--- validating -3 ---
Checking positive: -3
  FAILED: not positive
```

For `4`: both checks ran, in order, and both passed. For `-3`: only
`PositiveCheck` ran — `EvenCheck` never even executed, because
`process` returned `false`, and `handle`'s own `if (!process(value))
return;` stopped the chain immediately, before ever reaching
`nextHandler->handle(value)`. Each handler only knows about *one*
check and *one* reference — `nextHandler` — to whatever comes after
it; nothing anywhere holds a list of "all the checks," the way a
single `validate()` function would need to.

### Discard the throwaway example

`chain_lab.cpp`'s `PositiveCheck`/`EvenCheck` are deleted — the
link-and-short-circuit shape they proved carries forward directly into
real package validation.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `validation_chain.cpp`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `<optional>`.

### The New Code

```cpp
struct PackageInfo {
    std::string name;
    std::string version;
    std::string checksum;
    std::string expectedChecksum;
};

class ValidationHandler {
public:
    void setNext(std::shared_ptr<ValidationHandler> next) { nextHandler = next; }

    std::optional<std::string> validate(const PackageInfo& pkg) {
        auto error = check(pkg);
        if (error) return error;
        if (nextHandler) return nextHandler->validate(pkg);
        return std::nullopt;
    }

    virtual ~ValidationHandler() = default;

protected:
    virtual std::optional<std::string> check(const PackageInfo& pkg) = 0;

private:
    std::shared_ptr<ValidationHandler> nextHandler;
};
```

with three concrete checks — `NameFormatCheck`, `VersionFormatCheck`,
`ChecksumCheck` — each implementing `check` and returning either a real
error message or `std::nullopt`.

### The Updated Project

Brand-new file, shown whole above — the key change from the isolated
lab: instead of a plain `bool`, `check` returns
`std::optional<std::string>`, so a failure carries its own precise
explanation forward, the same standard Lesson 29's cycle message and
Lesson 30's conflict diagnosis both already held to.

### Mechanical walkthrough

- `std::optional<std::string> validate(const PackageInfo& pkg) { auto error = check(pkg); if (error) return error; ... }`
  — **(b) hard concept reappearing**: `std::optional` from Lesson 27,
  here representing "either a specific error message, or nothing
  wrong" — the same safe-miss shape used throughout this project,
  applied to validation results instead of search results.
- `if (nextHandler) return nextHandler->validate(pkg);` — **(b) hard
  concept reappearing**: the same forward-chaining call as the isolated
  lab's `handle`, now propagating a real return value (the first
  failure found, or ultimately `std::nullopt` if every handler in the
  chain passes) back up through the whole chain.
- `int dots = 0; for (char c : pkg.version) if (c == '.') dots++; if (dots != 2) return "..."`
  — **(c) already basic**: a plain counting loop — deliberately simpler
  than Lesson 30's real `Version::parse`, since this check's only job
  is confirming the *shape* is plausible before something else
  attempts real parsing.

### CS lens

This is **Chain of Responsibility**: a request passed along a sequence
of independent handlers, each deciding whether to handle it, pass it
along, or stop it entirely — none of them aware of the full chain, only
of what comes immediately next. Also recognized in: middleware in a web
framework (each layer — authentication, logging, compression — decides
whether to pass a request further down the chain), event bubbling in
the DOM (Project 4, Lesson 10's own `addEventListener`, where an event
can be stopped from propagating further at any level), an exception's
own propagation up a call stack until something catches it.

### SE lens

Proven directly, both outcomes, with every check's own name printed as
it runs:

```
--- validating a good package ---
Checking name format for web-framework
Checking version format for web-framework
Checking checksum for web-framework
All checks passed

--- validating a package with a tampered checksum ---
Checking name format for web-framework
Checking version format for web-framework
Checking checksum for web-framework
Checksum mismatch: expected abc123 but got xyz789
```

The tampered package runs *every* check, in order, and the failure is
reported with the exact expected and actual checksums — not just "this
package failed validation." The real cost of this design: adding a
fourth check means writing one new class and inserting one `setNext`
call into the chain's construction — genuinely less coupled than one
large function, at the cost of needing to trace through several small
classes, rather than one function body, to see the full validation
sequence at a glance.

### Commands needed

Same pattern.

### Run it

Shown above.

### Connecting sentence

A package's validity is now checked by a real sequence of independent,
composable handlers, each contributing a precise diagnosis exactly
where it applies — closing this project the same way it opened,
insisting a failure always names itself specifically rather than
failing silently or vaguely.

---

## Closing

**Connect the pieces.** One package, through the whole lesson: before
`PackageManager::install` ever runs, `nameCheck->validate(pkg)` walks
the full validation chain — name, version, checksum — stopping
immediately and returning a precise error the instant any one check
fails, exactly the way Lesson 29's cycle detector and Lesson 30's
conflict diagnosis both stopped and reported precisely rather than
continuing blindly. Only once validation genuinely passes would
`install` proceed to `plugins.notifyInstalled(...)`, firing every
registered plugin — core, built-in checks (`ChecksumLogPlugin`) and
completely independent, later-added ones (`SlackNotifyPlugin`) alike,
neither `PackageManager` nor the validation chain ever needing to know
the other exists.

**What breaks without this.** Already shown, twice, exactly where each
landed: `EvenCheck` never running for `-3` (proof the chain genuinely
stops), and the precise checksum-mismatch message naming both the
expected and actual values (proof the failure is diagnosable, not just
detected). Deliberately not restaged.

**Exercises.**
1. Add a fourth check, `LicenseCheck`, rejecting any package whose name
   contains a disallowed substring (simulate a denylist), and confirm
   it slots into the chain with one new class and one `setNext` call.
2. Reorder the chain so `ChecksumCheck` runs *before*
   `VersionFormatCheck`, and confirm — with real output — that a
   package failing both checks now reports the checksum failure first,
   proving the chain's order, not just its content, determines what
   gets reported.
3. Combine this lesson's two patterns: write a `ValidationPlugin`
   implementing `InstallPlugin`, wrapping a `ValidationHandler` chain
   internally, so failed validation is reported through the exact same
   plugin mechanism as `SlackNotifyPlugin` — deciding, and justifying,
   whether a failed validation should still allow the rest of the
   plugins to run.

**Definition of done.**
- [ ] A registered plugin correctly fires on install, and a plugin
      registered *after* an earlier install correctly fires only on
      installs after its own registration — confirmed against real
      output.
- [ ] The validation chain correctly runs every check in order for a
      valid package, and stops with a precise, specific error message
      for an invalid one — confirmed against real output.
- [ ] You can state, in one sentence each, what problem Plugin solves
      that Chain of Responsibility doesn't, and vice versa.
- [ ] Commit with a message explaining why — e.g. `"Let install hooks
      register via a PluginRegistry with no changes to PackageManager,
      and validate packages through a Chain of Responsibility that
      stops and reports the exact failing check"` — not `"add plugins
      and validation"`.

**This closes Project 10.** Across Lessons 29–31: a real dependency
graph, resolved and cycle-checked with precision; real semantic version
resolution, fixing a genuine string-comparison bug and reporting
conflicts by name; and two patterns — Plugin and Chain of
Responsibility — both solving real extensibility problems without
architectural entanglement. **Project 11**, Mini Git, is next: content
hashing, Merkle trees, and the real data structure underlying every
commit any real Git repository has ever made.
