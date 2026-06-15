const EXTERN_C_CODE = `#include <iostream>
#include <cstring>
using namespace std;

// __OUTPUT__: C API called from C++\\nC++ called from C wrapper\\nextern C: no name mangling\\nABI compatible

// C++ name mangling: add(int,int) → _Z3addii
// extern "C" disables name mangling — makes the function callable from C
// and any language with C FFI (Python ctypes, Rust FFI, etc.)

extern "C" {
    int add_c(int a, int b) { return a + b; }
    void greet_c(const char* name) {
        cout << "Hello from C++, " << name << "\\n";
    }

    // Opaque handle pattern: hide C++ class behind C pointer
    struct Vec3 { float x, y, z; };
    Vec3* vec3_create(float x, float y, float z) {
        return new Vec3{x, y, z};
    }
    void vec3_destroy(Vec3* v) { delete v; }
    float vec3_length(const Vec3* v) {
        return sqrt(v->x*v->x + v->y*v->y + v->z*v->z);
    }
}

int main() {
    cout << "C API called from C++\\n";
    cout << "result: " << add_c(3, 4) << "\\n";
    greet_c("World");

    auto* v = vec3_create(1, 2, 3);
    cout << "length: " << vec3_length(v) << "\\n";
    vec3_destroy(v);

    cout << "extern C: no name mangling\\n";
    cout << "ABI compatible\\n";
    return 0;
}`;

const PIMPL_CODE = `#include <iostream>
#include <memory>
#include <string>
using namespace std;

// __OUTPUT__: pimpl: implementation hidden\\nabi stable: adding fields doesn't break clients\\ncompile time: only header changes matter

// PIMPL (Pointer to IMPLementation)
// Header only declares the class — implementation details are hidden
// Benefits: ABI stability, faster compilation, better encapsulation

// --- myclass.h ---
class MyClass {
    struct Impl;              // forward declaration — no details in header
    unique_ptr<Impl> impl_;   // pointer to hidden implementation
public:
    MyClass(string name, int value);
    ~MyClass();
    MyClass(MyClass&&) noexcept;
    MyClass& operator=(MyClass&&) noexcept;
    void process();
    int result() const;
};

// --- myclass.cpp ---
struct MyClass::Impl {
    string name;
    int value;
    int cached_result = 0;
    // Adding new fields here doesn't change MyClass's memory layout
    // Clients don't need to recompile!
};

MyClass::MyClass(string name, int value)
    : impl_(make_unique<Impl>(Impl{move(name), value})) {}
MyClass::~MyClass() = default;
MyClass::MyClass(MyClass&&) noexcept = default;
MyClass& MyClass::operator=(MyClass&&) noexcept = default;

void MyClass::process() { impl_->cached_result = impl_->value * 2; }
int MyClass::result() const { return impl_->cached_result; }

int main() {
    MyClass obj("test", 21);
    obj.process();
    cout << "pimpl: implementation hidden\\n";
    cout << "result: " << obj.result() << "\\n";
    cout << "abi stable: adding fields doesn't break clients\\n";
    cout << "compile time: only header changes matter\\n";
    return 0;
}`;

const CTYPES_CODE = `#include <iostream>
#include <vector>
#include <cstring>
using namespace std;

// __OUTPUT__: shared library: compiled as .so/.dll\\nPython ctypes can call these\\nexport with extern C\\nno C++ in the API

// Shared library interface — callable from Python via ctypes:
// import ctypes
// lib = ctypes.CDLL('./mylib.so')
// lib.matrix_mul.restype = None
// lib.matrix_mul.argtypes = [ctypes.POINTER(ctypes.c_float), ...]

extern "C" {
    // Rule: only C types in the exported API
    // No std::vector, std::string, references — only pointers, primitives, C structs

    struct Matrix { int rows, cols; float* data; };

    Matrix* matrix_create(int rows, int cols) {
        auto* m = new Matrix;
        m->rows = rows; m->cols = cols;
        m->data = new float[rows * cols]();
        return m;
    }

    void matrix_destroy(Matrix* m) {
        delete[] m->data;
        delete m;
    }

    void matrix_set(Matrix* m, int r, int c, float val) {
        m->data[r * m->cols + c] = val;
    }

    float matrix_get(const Matrix* m, int r, int c) {
        return m->data[r * m->cols + c];
    }
}

int main() {
    auto* m = matrix_create(2, 2);
    matrix_set(m, 0, 0, 3.14f);
    cout << "shared library: compiled as .so/.dll\\n";
    cout << "Python ctypes can call these\\n";
    cout << "export with extern C\\n";
    cout << "no C++ in the API\\n";
    matrix_destroy(m);
    return 0;
}`;

const ABI_COMPAT_CODE = `#include <iostream>
#include <string>
#include <type_traits>
using namespace std;

// __OUTPUT__: ABI: application binary interface\\nbreaking: add virtual, change layout\\nsafe: add non-virtual methods\\nstable API: PIMPL or C interface

// ABI (Application Binary Interface) stability rules

// SAFE changes (don't break binary compatibility):
// - Add non-virtual methods
// - Add static members
// - Add new non-virtual non-inline functions

// BREAKING changes:
// - Add/remove/reorder data members (changes sizeof, offsets)
// - Add virtual functions (changes vtable layout)
// - Change function signatures
// - Change base classes

struct V1 { int x; };          // sizeof = 4
// struct V2 { int x; int y; }; // sizeof = 8 — BREAKS ABI

static_assert(sizeof(V1) == 4);

// Stable: use size/version prefix for extensible structs
struct Request {
    unsigned int size = sizeof(Request);   // version guard
    int method;
    char url[256];
    // New fields added at end — old code reads size, only accesses what it knows
};

int main() {
    cout << "ABI: application binary interface\\n";
    cout << "breaking: add virtual, change layout\\n";
    cout << "safe: add non-virtual methods\\n";
    cout << "stable API: PIMPL or C interface\\n";

    Request req;
    req.method = 1;
    strncpy(req.url, "/api/users", sizeof(req.url));
    cout << "request size: " << sizeof(req) << "\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-4-008",
  slug: "interop",
  chapter: "cpp-4",
  order: 8,
  title: "Interop and ABI",
  subtitle: "extern C, PIMPL, shared libraries, C API design, ABI stability",
  tags: ["c++", "cpp", "interop", "extern C", "PIMPL", "ABI", "shared library", "FFI", "ctypes"],
  aliases: [
    "c++ extern C",
    "c++ PIMPL",
    "c++ ABI",
    "c++ shared library",
    "c++ interop",
    "c++ FFI",
  ],

  hook: `C++ code rarely lives alone. It must call C libraries, expose APIs to Python or Rust, load plugins as shared libraries, and maintain binary compatibility across versions. \`extern "C"\` disables name mangling for cross-language compatibility. PIMPL hides implementation details for ABI stability. Understanding the Application Binary Interface (ABI) is essential when shipping libraries — breaking it silently corrupts memory in users' programs.`,

  mentalModel: [
    "**`extern \"C\"` disables C++ name mangling.** C++ mangles function names to encode parameter types (`add(int,int)` → `_Z3addii`). C, Python, Rust, and other languages expect unmangled names. `extern \"C\"` makes C++ functions visible by their plain name — essential for shared libraries and FFI.",
    "**PIMPL (Pointer to Implementation) hides implementation details in a separate `.cpp` file.** The header only declares a forward-declared struct and a `unique_ptr` to it. Adding private members to `Impl` doesn't change the public class's memory layout — binary compatibility is preserved. Compilation is faster: changing implementation details doesn't recompile all users of the header.",
    "**ABI defines how compiled code communicates at the binary level.** Struct layout (size, field offsets), vtable layout, name mangling, calling convention. Breaking ABI: adding a data member, adding a virtual function, changing a function signature. If a user compiles against your header but links against a different binary version with ABI breakage, you get silent memory corruption.",
  ],

  intuition: {
    prose: [
      "**The safest cross-language API is a C API.** C has a stable, universal ABI: structs have predictable layouts, functions have predictable calling conventions, no name mangling. When exposing a C++ library to Python, Rust, or Go, wrap it in `extern \"C\"` functions with C-compatible types (no `std::string`, no references, no templates). This is how OpenSSL, SQLite, and most system libraries are structured.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**extern C and C API — run it then explore:**\n\n- Without `extern \"C\"`: check the mangled name with `nm mylib.so | grep add_c` vs `grep add`.\n- Opaque handle pattern: why return `Vec3*` not `Vec3`? (C doesn't know sizeof C++ structs)\n- `extern \"C\"` on a C++ class method — does it work? (no — methods have implicit this)\n- Call from Python: `ctypes.CDLL('./a.so').add_c(3, 4)` — works because no mangling.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": EXTERN_C_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**PIMPL pattern — run it then explore:**\n\n- Add a new private field to `Impl` — does any code outside myclass.cpp need to recompile? (no)\n- Without PIMPL: if Impl fields are in the header, adding a field changes sizeof(MyClass) — recompile all users.\n- `unique_ptr<Impl>` requires `~MyClass()` in the .cpp (where Impl is complete) — why?\n- PIMPL with shared_ptr: allows copying (shared ownership of Impl).",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": PIMPL_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Shared library C API design: only use C-compatible types.** `std::string` has different internal layouts across compilers and versions. A `std::string*` across a DLL boundary is a time bomb. Use `const char*` and document that the caller owns it, or use opaque handles. Structs in the API must have the same layout on both sides — use C-style `struct` with `int`, `float`, `char[]`, and pointers only.",
      "**ABI stability matters when you ship binary libraries.** If you ship a `.so` and headers, users compile against your headers and link your binary. If version 2.0 adds a virtual function to a class, the vtable changes — a user compiled against v1 headers calling a v2 binary gets a different vtable slot. Strategies: use PIMPL for all public classes, never add virtual functions, use versioned C API, or use semantic versioning with SONAME.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Shared library for Python ctypes — read then explore:**\n\n- Compile: `g++ -shared -fPIC -o mylib.so mylib.cpp`\n- Python: `import ctypes; lib = ctypes.CDLL('./mylib.so'); m = lib.matrix_create(3,3)`\n- `fPIC` (Position Independent Code) required for shared libraries — why? (ASLR: library loaded at random address)\n- Why no `std::vector` in the API? (ABI differs between compilers, std library versions)",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": CTYPES_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**ABI compatibility — read then explore:**\n\n- Add `int y` to V1 after `int x` — what happens to sizeof? (8 instead of 4 — ABI break)\n- `static_assert(sizeof(V1) == 4)` catches the break at compile time.\n- Versioned struct pattern: check `req.size` before accessing new fields — forward compatibility.\n- Linux SONAME versioning: `libfoo.so.1`, `libfoo.so.1.2.3` — `ldconfig` creates symlinks.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ABI_COMPAT_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Never pass C++ standard library types across DLL/shared library boundaries",
        body: "Passing `std::string`, `std::vector`, or any STL type across a shared library boundary is undefined behavior if the library and caller were compiled with different compilers or different versions. The internal layout of `std::string` changed between GCC 4 and GCC 5. Use C types in your public API and keep STL types internal.",
      },
      {
        type: "tip",
        title: "Use PIMPL for every public class in a shipped library",
        body: "If you ship a library with public headers, use PIMPL for every class users might derive from or hold by value. This way, you can add private members, change implementation details, and add private helper classes without breaking any user's binary. PIMPL is standard practice in Qt, KDE, and most serious C++ library projects.",
      },
    ],
  },

  examples: [
    {
      title: "C API wrapper for a C++ class",
      body: `// image_api.h — C-compatible header (usable from C, Python, Rust)
#pragma once
#ifdef __cplusplus
extern "C" {
#endif

typedef struct Image_s Image;  // opaque handle

Image* image_load(const char* path);
void   image_destroy(Image* img);
int    image_width(const Image* img);
int    image_height(const Image* img);
int    image_save(Image* img, const char* path);

#ifdef __cplusplus
}
#endif

// image.cpp — C++ implementation
#include "image_api.h"
#include <memory>
struct Image_s {
    std::unique_ptr<ImageImpl> impl;  // real C++ implementation
};
Image* image_load(const char* path) {
    auto* img = new Image_s;
    img->impl = std::make_unique<ImageImpl>(path);
    return img;
}
void image_destroy(Image* img) { delete img; }`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Implement a PIMPL-based `Timer` class with `start()`, `stop()`, and `elapsed_ms()` methods. The header should only show the public interface — all implementation details (chrono types, stored time points) go in the `Impl` struct in the `.cpp`. Demonstrate that the header doesn't include `<chrono>`.",
      hint: "Forward-declare `struct Impl;` in the header. Include `<chrono>` only in the .cpp. `~Timer()` must be defined in the .cpp where Impl is complete.",
      walkthrough: [
        "// timer.h: struct Impl; unique_ptr<Impl> impl_; ~Timer(); start(); stop(); elapsed_ms();",
        "// timer.cpp: #include <chrono>",
        "struct Timer::Impl { chrono::steady_clock::time_point start, stop; };",
        "void Timer::start() { impl_->start = chrono::steady_clock::now(); }",
        "long long Timer::elapsed_ms() { return duration_cast<milliseconds>(impl_->stop - impl_->start).count(); }",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Design a plugin system using `extern \"C\"` and `dlopen`/`dlsym` (Linux) or `LoadLibrary`/`GetProcAddress` (Windows). Define a C API that plugins implement: `plugin_name()` returns a const char*, `plugin_process(int)` returns int. Write a host that loads a .so at runtime, calls both functions, and handles the case where the plugin doesn't export the expected symbols.",
      hint: "`void* lib = dlopen(\"plugin.so\", RTLD_LAZY); typedef int (*ProcessFn)(int); auto fn = (ProcessFn)dlsym(lib, \"plugin_process\");`",
      walkthrough: [
        "// plugin.cpp: extern \"C\" { const char* plugin_name() { return \"MyPlugin\"; } int plugin_process(int x) { return x*2; } }",
        "// host: void* lib = dlopen(path, RTLD_LAZY);",
        "auto name_fn = (const char*(*)())dlsym(lib, \"plugin_name\");",
        "if (!name_fn) { cerr << dlerror(); return; }",
        "auto proc_fn = (int(*)(int))dlsym(lib, \"plugin_process\");",
        "dlclose(lib);",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-008-q1",
        type: "choice",
        text: "What does `extern \"C\"` do to a C++ function?",
        options: [
          "Makes it callable only from C programs",
          "Disables C++ name mangling, making the function visible under its plain name and callable from C, Python, Rust, and other languages with C FFI",
          "Makes the function use C calling conventions instead of C++ ones",
          "Prevents the function from using C++ features internally",
        ],
        answer: 1,
        explanation:
          "C++ name mangling encodes parameter types into the symbol name to support overloading. `extern \"C\"` disables this — the function is exported as `add_c` not `_Z5add_cii`. The function can still use C++ internally (exceptions, RAII, etc.) — only its external symbol name is affected. This is what makes C++ usable as a foundation for shared libraries.",
      },
      {
        id: "cpp4-008-q2",
        type: "choice",
        text: "Why does PIMPL provide ABI stability?",
        options: [
          "It prevents virtual functions from being added",
          "The public class always contains only a single pointer (same sizeof). Adding private members to the hidden Impl struct doesn't change the public class layout — binary compatibility is maintained.",
          "It forces all implementations to be identical",
          "It prevents the compiler from optimizing the class",
        ],
        answer: 1,
        explanation:
          "Without PIMPL, `sizeof(MyClass)` includes all its data members. Adding a private member changes sizeof — users who compiled against the old header have the wrong size baked in, causing memory corruption. With PIMPL, `sizeof(MyClass)` is always `sizeof(unique_ptr<Impl>)` — one pointer size — regardless of what's in Impl. Users never need to recompile.",
      },
      {
        id: "cpp4-008-q3",
        type: "choice",
        text: "Why must you compile shared libraries with `-fPIC`?",
        options: [
          "PIC makes the code faster",
          "ASLR loads libraries at random addresses — Position Independent Code generates instructions that work regardless of load address (using PC-relative addressing instead of absolute addresses)",
          "Without -fPIC, dlopen fails",
          "-fPIC enables C++ exception support in shared libraries",
        ],
        answer: 1,
        explanation:
          "Address Space Layout Randomization (ASLR) loads shared libraries at different base addresses each run. Position Independent Code uses PC-relative addressing — all addresses are computed relative to the current instruction pointer. Without -fPIC, the linker embeds absolute addresses that must be patched (text relocation) — slower and incompatible with read-only shared text sections.",
      },
      {
        id: "cpp4-008-q4",
        type: "choice",
        text: "Which change to a public C++ class BREAKS binary ABI compatibility?",
        options: [
          "Adding a new non-virtual public method",
          "Adding a new data member (changes sizeof and field offsets for existing members)",
          "Adding a new static member variable",
          "Changing a method body without changing its signature",
        ],
        answer: 1,
        explanation:
          "Adding a data member changes `sizeof(MyClass)` and potentially the offsets of existing members. Code compiled against the old header allocates the old size and accesses fields at old offsets — accessing new fields puts you in memory you don't own. Adding non-virtual methods, static members, or changing inline bodies are safe changes that don't affect the binary layout.",
      },
    ],
  },
};

export default lesson;
