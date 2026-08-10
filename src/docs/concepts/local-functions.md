# Local Functions

**What it is.** A function declared inside another method's body, visible
and callable only from within that enclosing method:

```csharp
int Outer(int x)
{
    int Double(int n) => n * 2; // local function
    return Double(x) + 1;
}
```

`Double` does not exist as far as any code outside `Outer` is concerned —
not as a private member, not as anything reachable through the class at
all.

**Why it exists.** Without it, a small helper only ever meaningful inside
one method has nowhere natural to live: making it a `private` method on
the enclosing class works, but puts something with a scope of "used by
exactly one method" in the same visibility tier as every other member of
the class, discoverable and callable from anywhere else in that class
whether or not that ever makes sense. A local function's scope is
enforced by the compiler, not left to a naming convention or a comment.

**What it really is — another compiler rewrite, not special runtime
support.** In the common case (a local function that doesn't capture any
variable from its enclosing method), the compiler emits it as an
ordinary method, exactly the kind IL (`intermediate-language-il.md`)
already describes — just with a generated name that embeds its enclosing
method, so it can't collide with a real member name and so a stack trace
or a disassembler can still tell you where it came from. A local function
named `Add` inside a `Main` built from top-level statements
(`top-level-statements.md`) compiles down to a method named something
like `<<Main>$>g__Add|0_0` — directly visible in the compiled assembly's
(`dotnet-assembly.md`) metadata, not a hidden runtime feature.

**Local function vs. lambda.** A lambda expression is a *value* — an
object (backed by a delegate type) that can be stored in a variable,
passed as an argument, or returned from a method. A local function is not
a value at all; it's a named, statically-invoked method-shaped piece of
code, closer in spirit to an ordinary method than to an object. In the
non-capturing case shown above, that difference has a real performance
consequence: no delegate object is allocated at all, because there's
nothing needing to be treated as a value in the first place.
