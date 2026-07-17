---
concept: 087-adapter-pattern
name: Adapter Pattern
---

## Definition

The Adapter pattern wraps an object with an incompatible interface,
translating calls into whatever the surrounding code actually expects —
letting two pieces of code work together without either one being modified.

## Problem

An existing class or third-party library does exactly what's needed, but
its method names or signatures don't match what the rest of the code
expects to call — rewriting either the library or all the calling code is
often impractical. An adapter sits between them, translating one interface
into the other.

## Execution

Calling code expects an object with a .fetch() method
↓
The available library only has a .request() method (different name, maybe different arguments)
↓
Wrap the library object in an Adapter whose .fetch() method internally calls the library's .request()
↓
Calling code calls adapter.fetch() exactly as it always would — the
adapter forwards the call, translated, to the real library underneath

## Computer Science

An adapter is a thin translation layer — its own logic is minimal, just
reshaping one interface into another. It holds a reference to the wrapped
object and forwards work to it, adding no real business behavior of its
own.

Tags: Interface translation, Composition, Wrapper, Delegation

## Software Engineering

This is the standard way to integrate a third-party library whose API
doesn't match the rest of the codebase's conventions, or to keep old client
code working unchanged while swapping out what's underneath it — the
adapter absorbs the incompatibility in one place instead of scattering
translation logic throughout the calling code.

Tags: Legacy integration, Third-party libraries, Backward compatibility

## Common Mistakes

- Putting real business logic inside the adapter instead of just translation — an adapter should only reshape calls, not make decisions; extra logic belongs in the code on either side of it.
- Writing a new adapter for every place a library is called, instead of one shared adapter used everywhere that library is needed — this duplicates the same translation logic repeatedly.

## Exercises

- Write an adapter around an "OldLogger" with a `writeLog(msg)` method so it can be used anywhere a `log(msg)` method is expected.
- Identify one place in a real project where two pieces of code with mismatched method names had to be bridged — was an adapter used, or was one side modified directly instead?

## javascript

```javascript
class OldPrinter {
  oldPrint(text) { console.log('[old] ' + text) }
}

class PrinterAdapter {
  #oldPrinter
  constructor(oldPrinter) { this.#oldPrinter = oldPrinter }
  print(text) { this.#oldPrinter.oldPrint(text) }   // translates print() -> oldPrint()
}

function runReport(printer) {
  printer.print('Report ready')   // calling code only knows about print()
}

const adapter = new PrinterAdapter(new OldPrinter())
runReport(adapter)   // '[old] Report ready'
```
Walkthrough: `runReport` only ever calls `.print(...)`, with no idea an
`OldPrinter` (which only has `.oldPrint(...)`) is involved at all.
`PrinterAdapter` is the only piece of code that knows about both method
names, translating one call into the other.

## python

```python
class OldPrinter:
    def old_print(self, text):
        print('[old] ' + text)


class PrinterAdapter:
    def __init__(self, old_printer):
        self._old_printer = old_printer

    def print_text(self, text):
        self._old_printer.old_print(text)   # translates print_text() -> old_print()


def run_report(printer):
    printer.print_text('Report ready')   # calling code only knows about print_text()


adapter = PrinterAdapter(OldPrinter())
run_report(adapter)   # '[old] Report ready'
```
Walkthrough: identical translation role as the JavaScript version —
`run_report` never touches `OldPrinter` directly, only the adapter, which
is the sole piece of code aware of both interfaces.
