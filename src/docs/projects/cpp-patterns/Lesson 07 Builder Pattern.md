# Lesson 07: The Builder Pattern

What you will build: You will build a fluent `HttpRequestBuilder` that constructs a complex `HttpRequest` object. The transferable problem this solves is the invariant problem: why a half-constructed object is dangerous to expose to the rest of the system, and how the Builder pattern keeps that messy construction phase hidden until the object is fully valid and ready to use.

What you need to know first: C++ From Scratch (classes, move semantics).

### Terms used in this lesson
- **Invariant** — A rule or condition about an object's internal state that must always be true for the object to be valid. Invariants exist so that other code interacting with the object can trust it will not crash or behave unpredictably.
- **Half-Constructed Object** — An object that has been instantiated but hasn't yet had all its necessary fields populated to satisfy its invariants. This is dangerous because exposing it allows other parts of the system to observe or use the object in an invalid state.
- **Fluent Interface** — An API design that relies on method chaining to make the code read like a sentence. It exists to reduce the boilerplate of repeating the object name for every configuration step.
- **Method Chaining** — The practice of calling multiple methods sequentially on the same object in a single statement. It solves the problem of visual clutter when configuring many properties of an object.
- **Move Semantics** — A C++ feature that transfers ownership of resources from one object to another without copying them. It exists to avoid expensive memory allocations when data is being handed off permanently.

### Objects and methods used

- **`HttpRequestBuilder`**
  - *What it is:* The builder object responsible for collecting the configuration.
  - *Implementation:* A custom C++ class that holds partial state and methods returning `HttpRequestBuilder&`.
  - *Its use:* We use this to safely accumulate state step-by-step without exposing a half-constructed object to the broader system.
- **`HttpRequest`**
  - *What it is:* The target domain object representing an outgoing network request.
  - *Implementation:* A custom C++ class containing a URL and HTTP method.
  - *Its use:* This is the complex object we want to build. Its invariant is that an HTTP request must have a URL before it can be instantiated.

**Everything else in the file, not this lesson's subject but still explained:**
- **`std::move`**
  - *What it is:* A standard library function that casts an object to an rvalue reference.
  - *Implementation:* `template<class T> constexpr typename std::remove_reference<T>::type&& move(T&& t) noexcept;` (from `<utility>`).
  - *Its use:* Used inside the builder's final `build()` method to transfer ownership of strings into the final `HttpRequest` without copying them.

## Concept Unit: Method Chaining and the Builder

### The Problem
When building a complex object, we often need to set many optional fields. If we pass them all in the constructor, we end up with a massive parameter list where it is easy to confuse the order of arguments. If we use a default constructor and setter methods, we expose a half-constructed object to the system—one that might be missing required fields. We need a way to build the object step-by-step without exposing it while it is incomplete.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are building our own HTTP Request library.
- **Files affected:** `http_request.cpp` (created).
- **Change type:** Add.
- **Location:** The beginning of the file.
- **Dependencies:** None.

### The New Code
```cpp
class HttpRequestBuilder {
    std::string method_ = "GET";
    std::string url_;
public:
    HttpRequestBuilder& method(std::string m) {
        method_ = std::move(m);
        return *this;
    }
    HttpRequestBuilder& url(std::string u) {
        url_ = std::move(u);
        return *this;
    }
};
```

### The Updated Project
Here is the entirely new file containing our builder class.

```cpp
#include <iostream>
#include <string>
#include <utility>

// ← new
class HttpRequestBuilder {
    std::string method_ = "GET";
    std::string url_;
public:
    HttpRequestBuilder& method(std::string m) {
        method_ = std::move(m);
        return *this;
    }
    HttpRequestBuilder& url(std::string u) {
        url_ = std::move(u);
        return *this;
    }
};
```
The `HttpRequestBuilder` class collects the configuration step-by-step using methods that return a reference to the builder itself, allowing the caller to chain calls.

### The Concept in Isolation
Let's see method chaining in action with throwaway code.

```cpp
#include <iostream>

class ChainExample {
    int value_ = 0;
public:
    ChainExample& add(int v) {
        value_ += v;
        return *this;
    }
    void print() {
        std::cout << "Value: " << value_ << "\n";
    }
};

int main() {
    ChainExample example;
    example.add(5).add(10).print();
    return 0;
}
```
Output:
```text
Value: 15
```
This output proves that returning `*this` allows us to continuously call methods on the same object instance in a single chained statement. This is called **method chaining**.

### Discard the Throwaway Example
The `ChainExample` class is deleted and will not appear in the project again.

### Mechanical Walkthrough
- `class`: The keyword that begins defining a blueprint for an object.
- `HttpRequestBuilder`: The name of our custom builder class.
- `{`: Opens the class definition body.
- `std::string`: The standard library type for a text string.
- `method_`: A private member variable holding the HTTP method.
- `=`: The assignment operator initializing the field.
- `"GET"`: A string literal acting as the default value.
- `;`: Ends the statement.
- `std::string url_;`: A private member variable for the URL. Initially an empty string.
- `public:`: The access modifier exposing the configuration methods to external callers.
- `HttpRequestBuilder&`: The return type of our configuration methods. Returning a reference (`&`) means we don't copy the builder; we return the exact instance being operated on.
- `method`: The name of the configuration function.
- `(std::string m)`: The parameter list, accepting the HTTP method text by value.
- `{`: Opens the method body.
- `method_ =`: Prepares to assign a new value to our member variable.
- `std::move`: Casts the parameter `m` to an rvalue reference. **Move Semantics** exist here to transfer ownership of the string's heap allocation directly from `m` to `method_` without making an expensive copy.
- `(m)`: The variable being moved.
- `;`: Ends the assignment statement.
- `return`: The keyword exiting the method and sending a value back to the caller.
- `*`: The dereference operator.
- `this`: A hidden pointer to the current object instance executing the method. `*this` yields the object itself, satisfying the `HttpRequestBuilder&` return type.
- `;`: Ends the return statement.
- `}`: Closes the method.
- `HttpRequestBuilder& url(std::string u) { url_ = std::move(u); return *this; }`: The exact same pattern applied to the URL property.
- `}`: Closes the class definition.
- `;`: Ends the class declaration.

### CS Lens
This embodies the concept of an accumulator. A mutable structure slowly gathers state over time until a final operation freezes or evaluates it.
Also recognized in: string builders (`StringBuilder` in Java/C#), accumulation passes in compiler AST construction, hash digest algorithms (updating the state repeatedly before a final `digest()` call).

### SE Lens
The design principle here is separating construction from representation. The alternative not chosen is a massive constructor (`HttpRequest("GET", "http://example.com", "", "", 30, 3)`), which forces callers to pass many arguments at once. The tradeoff is that we must maintain two classes—the builder and the target object—which increases the amount of boilerplate code we write.

### Commands Needed
```bash
g++ -std=c++17 http_request.cpp -o http_request
```
Uses the GNU C++ compiler (`g++`), targeting the C++17 standard (`-std=c++17`), compiling the source file (`http_request.cpp`) into an executable named `http_request` (`-o`). Success output is silent (no errors printed).

### Run It
This fragment doesn't run standalone yet because there is no `main` function. It will connect to the `HttpRequest` construction in the next unit.

### Connection Sentence
Now that our builder can fluently collect configuration steps without exposing an invalid target object, we need a way to finalize this state into an immutable, fully constructed `HttpRequest`.

---

## Concept Unit: Finalization and the Invariant

### The Problem
The builder holds the state, but we need an actual `HttpRequest` object to use in our system. Furthermore, an `HttpRequest` must never exist without a URL. If we allow someone to create a blank `HttpRequest` and set the URL later, they might pass that blank request to a networking function before the URL is set, causing a crash. We need to validate the invariant and produce the target object only when it is safe to do so.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition.
- **Files affected:** `http_request.cpp` (modified).
- **Change type:** Add.
- **Location:** At the top of the file (for `HttpRequest`), and at the bottom of `HttpRequestBuilder` (for the finalization method).
- **Dependencies:** The code from the previous unit.

### The New Code
```cpp
class HttpRequest {
    std::string method_;
    std::string url_;
public:
    HttpRequest(std::string m, std::string u) 
        : method_(std::move(m)), url_(std::move(u)) {}
    
    void print() const {
        std::cout << method_ << " " << url_ << "\n";
    }
};

// ... inside HttpRequestBuilder ...
    HttpRequest build() {
        if (url_.empty()) {
            throw std::runtime_error("URL is required");
        }
        return HttpRequest(std::move(method_), std::move(url_));
    }
```

### The Updated Project
Here is the fully combined file, featuring the target object, the finalized builder, and a main function to tie them together.

```cpp
#include <iostream>
#include <string>
#include <utility>
#include <stdexcept>

// ← new
class HttpRequest {
    std::string method_;
    std::string url_;
public:
    HttpRequest(std::string m, std::string u) 
        : method_(std::move(m)), url_(std::move(u)) {}
    
    void print() const {
        std::cout << method_ << " " << url_ << "\n";
    }
};

class HttpRequestBuilder {
    std::string method_ = "GET";
    std::string url_;
public:
    HttpRequestBuilder& method(std::string m) {
        method_ = std::move(m);
        return *this;
    }
    HttpRequestBuilder& url(std::string u) {
        url_ = std::move(u);
        return *this;
    }
    
    // ← new
    HttpRequest build() {
        if (url_.empty()) {
            throw std::runtime_error("URL is required");
        }
        return HttpRequest(std::move(method_), std::move(url_));
    }
};

// ← new
int main() {
    HttpRequest req = HttpRequestBuilder()
                        .method("POST")
                        .url("https://api.example.com/data")
                        .build();
    req.print();
    return 0;
}
```
We define the target `HttpRequest` class. The builder's `build()` method checks the required fields and returns a fully constructed, valid `HttpRequest`.

### The Concept in Isolation
Let's see invariant checking in isolation with throwaway code.

```cpp
#include <iostream>
#include <stdexcept>

void testInvariant(int age) {
    if (age < 0) {
        throw std::runtime_error("Age cannot be negative");
    }
    std::cout << "Valid age: " << age << "\n";
}

int main() {
    try {
        testInvariant(-5);
    } catch (const std::exception& e) {
        std::cout << "Error: " << e.what() << "\n";
    }
    return 0;
}
```
Output:
```text
Error: Age cannot be negative
```
This output proves that by explicitly checking rules before proceeding, we can prevent illegal states from ever continuing into the rest of the program. This is **enforcing an invariant**.

### Discard the Throwaway Example
The `testInvariant` function and isolation code are deleted and will not appear in the project again.

### Mechanical Walkthrough
- `class HttpRequest {`: Declares our target domain class.
- `std::string method_; std::string url_;`: Private fields representing the finalized object state.
- `public:`: The access modifier exposing the constructor and methods.
- `HttpRequest`: The constructor function name.
- `(std::string m, std::string u)`: The constructor parameters.
- `:`: Begins the member initializer list, allowing us to initialize fields before the constructor body runs.
- `method_`: The member variable being initialized.
- `(`: Opens initialization arguments.
- `std::move(m)`: Transfers ownership of `m` directly into the member.
- `)`: Closes initialization arguments.
- `,`: Separates initialization items.
- `url_(std::move(u))`: Initializes the URL field by moving `u` into it.
- `{}`: The empty body of the constructor. No further initialization is needed.
- `void print() const { ... }`: A helper method. `const` guarantees it won't modify the object's internal state.
- `HttpRequest build() {`: The method on `HttpRequestBuilder` that finalizes the construction, returning a fully formed `HttpRequest` by value.
- `if`: The conditional keyword.
- `(`: Opens the condition.
- `url_.empty()`: Calls a standard string method that returns `true` if the string has length zero.
- `)`: Closes the condition.
- `{`: Opens the conditional block.
- `throw`: The keyword used to raise an exception.
- `std::runtime_error`: A standard exception type for runtime failures.
- `("URL is required")`: The error message.
- `;`: Ends the throw statement. This entirely halts execution and prevents a **half-constructed object** from being created.
- `}`: Closes the conditional block.
- `return`: Sends the final object back to the caller.
- `HttpRequest`: Invokes the target object's constructor.
- `(std::move(method_), std::move(url_))`: Transfers the builder's string buffers directly into the new object. The builder becomes empty, but its job is done.
- `;`: Ends the return statement.
- `int main() {`: The program entry point.
- `HttpRequest req`: Declares our target variable.
- `=`: Assignment operator.
- `HttpRequestBuilder()`: Instantiates a temporary, anonymous builder.
- `.method`: Calls the method function on the builder.
- `("POST")`: Passes the new method type.
- `.url`: Chained directly onto the `HttpRequestBuilder&` reference returned by `.method()`.
- `("https://api.example.com/data")`: Passes the URL.
- `.build()`: Chained directly onto the reference returned by `.url()`. Invokes the final validation and construction.
- `;`: Ends the chained statement.
- `req.print();`: Proves the object is populated by outputting its state.
- `return 0;`: Exits the program successfully.

### CS Lens
This embodies a state machine transition from a mutable, unverified "Draft" state to an immutable, verified "Final" state. 
Also recognized in: uncommitted database transactions becoming permanent via `COMMIT`, draft DOM elements before attachment to the document tree, unvalidated forms transforming into strict payload structures.

### SE Lens
The design principle here is "make invalid states unrepresentable" (or at least, unreachable by the broader system). The alternative not chosen is allowing `HttpRequest` to have a default constructor and exposing a `setUrl()` method on it. If we did that, another thread or function could get hold of the `HttpRequest` between its instantiation and the `setUrl()` call, attempting to send a request with no destination. The cost of our builder approach is that the builder instance's internal strings are left empty after `build()` is called, meaning a single builder cannot safely be used twice without explicit resetting.

### Commands Needed
None (reusing the standard compilation command from the previous unit).

### Run It
```bash
g++ -std=c++17 http_request.cpp -o http_request
./http_request
```
Output:
```text
POST https://api.example.com/data
```

### Connection Sentence
Our builder pattern successfully gathered configuration safely and produced a fully-formed object whose invariants are strictly guaranteed.

---

## Closing

### Connect the Pieces
1. `HttpRequestBuilder()` creates an empty, valid builder object.
2. `.method("POST")` modifies the builder's internal state to "POST" and returns a reference to itself.
3. `.url(...)` modifies the builder's internal state to the URL and returns a reference to itself.
4. `.build()` verifies that the accumulated state meets all invariants (URL is not empty).
5. The verified state is moved out of the builder and into the final `HttpRequest` object. The rest of the program now has an object it can trust.

### What Breaks Without This
Delete the `.url("...")` line in `main` so the chain skips straight to `.build()`. Run it.
```bash
terminate called after throwing an instance of 'std::runtime_error'
  what():  URL is required
Aborted (core dumped)
```
The program crashes immediately at the construction phase. This is exactly what we want: failing fast during construction is immensely better than allowing a half-constructed `HttpRequest` to silently exist and fail later deep inside a network dispatch function.

### Exercises
1. Add an optional `headers_` map to the `HttpRequest` and `HttpRequestBuilder`. Write a `header(std::string key, std::string value)` method on the builder that adds to the map and returns `*this`.
2. Modify the builder so that `build()` returns an `std::optional<HttpRequest>` instead of throwing an exception.

### Definition of Done
- [x] A fluent `HttpRequestBuilder` class is created.
- [x] It uses method chaining by returning `*this`.
- [x] It encapsulates the invariant checking in a `build()` method.
- [x] The main program constructs the final object without exposing half-constructed state.

```bash
git add http_request.cpp
git commit -m "Implement HttpRequestBuilder to enforce request invariants"
```
