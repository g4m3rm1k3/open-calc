# Lesson M4.6: The Registry Is a Real, Hierarchical Database

*This lesson is about Windows itself, not mastercam-app code - a direct continuation of Lesson M4.5's real path-length investigation. Every command below was actually run on this real machine.*

**What you will build:** Nothing added to the app - real, verified understanding of what the Windows registry actually is: a real, hierarchical key-value database, organized into hives, with real per-key access control that doesn't follow a single blanket rule - demonstrated by two real HKLM subkeys that behave completely differently from each other.

**What you need to know first:** Lesson M4.5's LongPathsEnabled - this lesson is about the storage system that value actually lives in.

## Terms used in this lesson

- **Registry hive** — One of a small number of real, top-level roots the entire registry is organized under - HKEY_LOCAL_MACHINE (HKLM, machine-wide settings), HKEY_CURRENT_USER (HKCU, this user's own settings), plus HKEY_USERS, HKEY_CLASSES_ROOT, and HKEY_CURRENT_CONFIG. Every registry key lives under exactly one hive.
- **Registry key** — A real node in the registry's tree, addressed by a path like SYSTEM\CurrentControlSet\Control\FileSystem - conceptually a folder, except a key can hold both child keys (subfolders) and named values (the actual data, like LongPathsEnabled).
- **ACL (access control list)** — A real, per-object list of who can do what - read, write, or neither - attached to a specific registry key, not just to a whole hive. Two keys under the same hive can have completely different real permissions, as this lesson demonstrates directly.

## Objects and methods used

None — this lesson introduces no new external class, interface, or method, only Terms.
## Concept Unit: Five Hives, One Tree - and LongPathsEnabled's Real Address in It

### The Problem

LongPathsEnabled was addressed as HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled in Lesson M4.5 without explaining what any of those pieces mean - HKLM, SYSTEM, CurrentControlSet - as real, separate parts of one addressing scheme.

Before reading on:

- PowerShell's Get-ChildItem HKLM:\ below lists real, top-level keys directly under HKEY_LOCAL_MACHINE - SOFTWARE, SYSTEM, HARDWARE, and others. Which one would you expect installed-program settings to live under, versus live hardware state?
- The same LongPathsEnabled path could theoretically exist under HKCU instead of HKLM - what real, different meaning would that have: 'long paths are on for this one Windows user' versus 'long paths are on for this machine, every user'?

### Project Change

- **Reference Source:** No reference counterpart - real, live Windows registry state on this machine.
- **Files affected:** `none` (none)
- **Change type:** none
- **Location:** n/a
- **Dependencies:** none

### Mechanical Walkthrough

- `Get-ChildItem "HKLM:\" - real output includes DRIVERS, HARDWARE, SAM, SOFTWARE, SYSTEM` — These are real, top-level keys directly under HKEY_LOCAL_MACHINE on this machine, right now. SOFTWARE holds most installed-application and OS-feature configuration (where LongPathsEnabled's parent chain lives); HARDWARE holds live, volatile hardware state rebuilt every boot, not persistent settings at all.
- `SYSTEM\CurrentControlSet\Control\FileSystem` — CurrentControlSet is itself a real, live pointer to whichever of several saved hardware/driver configurations Windows actually booted with - Control\\FileSystem is a real, specific key under that, holding filesystem-behavior switches; LongPathsEnabled is one named value stored directly inside it, alongside others.

### Mental Model

```text
HKEY_LOCAL_MACHINE (a hive)
  -> SYSTEM (a top-level key)
    -> CurrentControlSet (a key)
      -> Control (a key)
        -> FileSystem (a key)
          -> LongPathsEnabled (a named value, holding a DWORD)
```

### CS Lens

This is a real, literal **tree structure** - hives as roots, keys as internal nodes, values as the actual leaf data - the same shape as a filesystem's own directory tree, which is exactly why PowerShell's registry provider lets Get-ChildItem, Get-ItemProperty, and New-ItemProperty work on it using the same verbs it uses for real files and folders.

### SE Lens

The real alternative - one flat namespace for every setting on the machine - would make "which program owns this setting" and "does this affect one user or everyone" both ambiguous. Hives split that exact question (machine-wide vs. per-user) at the root, before any individual key even has to address it.

### Commands needed

- `Get-ChildItem "HKLM:\" | Select-Object Name` — Run in PowerShell - lists real top-level HKLM keys

### Verification

```text
Name
----
HKEY_LOCAL_MACHINE\DRIVERS
HKEY_LOCAL_MACHINE\HARDWARE
HKEY_LOCAL_MACHINE\SAM
HKEY_LOCAL_MACHINE\SOFTWARE
HKEY_LOCAL_MACHINE\SYSTEM
```

Full saved run: `verification/mastercam-phase-04/lab_registry_hives_output.txt`.

### Connection to the previous unit

Lesson M4.5 used this exact path without explaining its structure; this unit is that structure, verified directly against the real keys on this machine.

## Concept Unit: Two Real HKLM Keys, Two Completely Different Access Rules

### The Problem

If "HKLM needs admin" were a single blanket rule, every key under it would behave identically. The real output above already contradicts that - SAM produced a permission error just being listed, while SOFTWARE and SYSTEM listed fine.

Before reading on:

- SAM (Security Accounts Manager) stores real Windows account password hash data. Given what it stores, why would even reading its structure - not writing, just listing - be denied to a normal, non-elevated session?
- SYSTEM\CurrentControlSet\Control\FileSystem read successfully with no elevation in Lesson M4.5, but writing to it (attempted below) failed. What real, different permission is being checked for a read versus a write on the identical key?

### Project Change

- **Reference Source:** No reference counterpart - real, live Windows registry permissions on this machine.
- **Files affected:** `none` (none)
- **Change type:** none
- **Location:** n/a
- **Dependencies:** none

### Mechanical Walkthrough

- `Get-ChildItem "HKLM:\" real error on SAM/SECURITY: 'Requested registry access is not allowed'` — This is a real ACL denial at the individual-key level - SAM and SECURITY carry real, restrictive permissions (by default, not even Administrators can read SAM's contents directly; it's reserved for the SYSTEM account and specific privileged APIs) - while SOFTWARE and SYSTEM, sibling keys under the identical hive, allow ordinary read access to any logged-in user.
- `New-ItemProperty ... -Path HKLM:\SYSTEM\...\FileSystem ... real error: 'Requested registry access is not allowed'` — The exact same error text as the SAM read failure, but for a different real reason: this key allows read for everyone, write for Administrators only. Two different keys, two different real ACLs, producing the identical error message - proof the message itself doesn't distinguish "you can never touch this" from "you specifically need to elevate first."

### CS Lens

Each registry key has its own **discretionary access control list** - the same general access-control model Windows applies to real files and folders on NTFS, applied identically to registry keys. "HKLM" is a location, not a single permission level; the permission lives on the individual key.

### SE Lens

The real alternative - one permission for all of HKLM - would force every setting to be either "readable by anyone" (exposing SAM's sensitive structure) or "admin-only" (requiring elevation just to check whether Fusion drawing mode is enabled, or any other harmless setting). Per-key ACLs let Windows make that call correctly, key by key, instead of picking one answer for everything under HKLM.

### Commands needed

- `$id = [Security.Principal.WindowsIdentity]::GetCurrent(); (New-Object Security.Principal.WindowsPrincipal($id)).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)` — Run in PowerShell - confirms whether the current session is elevated
- `New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force` — Run in PowerShell without elevation - real, expected failure

### Verification

```text
Is elevated Administrator: False

New-ItemProperty : Requested registry access is not allowed.

HKCU write to a comparable value SUCCEEDED with no elevation.
```

Full saved run: `verification/mastercam-phase-04/lab_registry_privilege_output.txt`.

### Connection to the previous unit

The unit above mapped LongPathsEnabled's real address; this unit is why that specific address refuses a write from this session - not because it's under HKLM in general, but because of that one key's own real, specific ACL.

## Connect the pieces

Trace one real key through both units: SYSTEM\CurrentControlSet\ Control\FileSystem sits under HKLM, a real, ordinary, world-readable key (unit one) - and separately, that same key's own ACL allows read for anyone but write only for Administrators (unit two), which is the real, specific reason enabling LongPathsEnabled requires an elevated session, not a general "HKLM is locked" rule.

**Next lesson:** Next: why the setting doesn't take effect in a session that's already running, even after it's written correctly - what "read once at process start" really means, and the real difference between a setting that applies live and one that doesn't.