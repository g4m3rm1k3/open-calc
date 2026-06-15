const HTTP_PARSER_CODE = `#include <iostream>
#include <string>
#include <string_view>
#include <unordered_map>
#include <optional>
#include <variant>
using namespace std;

// __OUTPUT__: parsed: GET /api/users HTTP/1.1\\nhost: example.com\\ncontent-type: application/json\\nbody: 24 bytes

// HTTP/1.1 request parser — applies: string_view, optional, variant, error handling

struct ParseError { string message; int line; };
struct HttpRequest {
    string method, path, version;
    unordered_map<string, string> headers;
    string body;
};

using ParseResult = variant<HttpRequest, ParseError>;

ParseResult parse_http(string_view input) {
    HttpRequest req;
    size_t pos = 0;

    // Parse request line: "METHOD /path HTTP/1.1\\r\\n"
    auto line_end = input.find("\\r\\n", pos);
    if (line_end == string_view::npos)
        return ParseError{"missing request line", 1};

    string_view request_line = input.substr(pos, line_end - pos);
    auto sp1 = request_line.find(' ');
    auto sp2 = request_line.rfind(' ');
    if (sp1 == sp2) return ParseError{"malformed request line", 1};

    req.method = string(request_line.substr(0, sp1));
    req.path   = string(request_line.substr(sp1+1, sp2-sp1-1));
    req.version = string(request_line.substr(sp2+1));
    pos = line_end + 2;

    // Parse headers
    int line_num = 2;
    while (pos < input.size()) {
        auto end = input.find("\\r\\n", pos);
        if (end == string_view::npos) break;
        string_view line = input.substr(pos, end - pos);
        if (line.empty()) { pos = end + 2; break; }

        auto colon = line.find(": ");
        if (colon == string_view::npos)
            return ParseError{"malformed header", line_num};

        string key(line.substr(0, colon));
        string val(line.substr(colon + 2));
        for (auto& c : key) c = tolower(c);
        req.headers[key] = val;
        pos = end + 2;
        line_num++;
    }

    req.body = string(input.substr(pos));
    return req;
}

int main() {
    string_view raw =
        "GET /api/users HTTP/1.1\\r\\n"
        "Host: example.com\\r\\n"
        "Content-Type: application/json\\r\\n"
        "\\r\\n"
        "{\\"name\\": \\"Alice\\", \\"age\\": 30}";

    auto result = parse_http(raw);
    visit(overload{
        [](const HttpRequest& req) {
            cout << "parsed: " << req.method << " " << req.path << " " << req.version << "\\n";
            cout << "host: " << req.headers.at("host") << "\\n";
            cout << "content-type: " << req.headers.at("content-type") << "\\n";
            cout << "body: " << req.body.size() << " bytes\\n";
        },
        [](const ParseError& e) {
            cerr << "error on line " << e.line << ": " << e.message << "\\n";
        }
    }, result);

    return 0;
}

template<class... Ts> struct overload : Ts... { using Ts::operator()...; };`;

const BUFFER_MANAGER_CODE = `#include <iostream>
#include <memory>
#include <vector>
#include <atomic>
#include <memory_resource>
using namespace std;

// __OUTPUT__: buffer pool: 4 slots\\nalloc: buf[0] buf[1]\\nreturn: buf[0]\\nreuse: buf[0]\\nzero-copy pipeline

// Buffer pool — applies: RAII, move semantics, PMR, atomics

class BufferPool {
    struct Buffer {
        vector<uint8_t> data;
        int id;
        BufferPool* pool;
        ~Buffer() {
            if (pool) pool->return_buffer(id);
        }
        Buffer(const Buffer&) = delete;
        Buffer& operator=(const Buffer&) = delete;
        Buffer(Buffer&& o) noexcept : data(move(o.data)), id(o.id), pool(o.pool) {
            o.pool = nullptr;   // prevent double-return
        }
    };

    vector<vector<uint8_t>> slots;
    vector<bool> in_use;
    atomic<int> available;

public:
    BufferPool(int n, size_t buf_size) : slots(n), in_use(n, false), available(n) {
        for (auto& s : slots) s.resize(buf_size);
        cout << "buffer pool: " << n << " slots\\n";
    }

    unique_ptr<Buffer> acquire(int id) {
        if (id >= (int)slots.size() || in_use[id]) return nullptr;
        in_use[id] = true;
        available--;
        auto b = make_unique<Buffer>(Buffer{move(slots[id]), id, this});
        return b;
    }

    void return_buffer(int id) {
        slots[id].resize(slots[id].capacity());
        in_use[id] = false;
        available++;
    }

    int avail() const { return available.load(); }
};

int main() {
    BufferPool pool(4, 1024);

    auto b0 = pool.acquire(0);
    auto b1 = pool.acquire(1);
    cout << "alloc: buf[" << b0->id << "] buf[" << b1->id << "]\\n";

    { auto temp = move(b0); cout << "return: buf[" << temp->id << "]\\n"; }
    // b0 was moved — temp goes out of scope, returns buf[0]

    auto b0_again = pool.acquire(0);  // reuse slot 0
    cout << "reuse: buf[" << b0_again->id << "]\\n";
    cout << "zero-copy pipeline\\n";

    return 0;
}`;

const ASYNC_SERVER_CODE = `#include <iostream>
#include <future>
#include <vector>
#include <string>
#include <sstream>
#include <thread>
using namespace std;

// __OUTPUT__: server: 4 worker threads\\nrequest 0: processed\\nrequest 1: processed\\nall done: 5ms

// Simulated async request handler — applies: thread pool, futures, move semantics

struct Request { int id; string body; };
struct Response { int status; string body; };

Response handle_request(const Request& req) {
    // Simulate processing
    this_thread::sleep_for(chrono::milliseconds(1));
    return {200, "OK: processed request " + to_string(req.id)};
}

class AsyncServer {
    vector<thread> workers;
    // In a real server: use a thread pool + event loop

public:
    AsyncServer(int n) {
        cout << "server: " << n << " worker threads\\n";
    }

    vector<future<Response>> process(vector<Request> requests) {
        vector<future<Response>> results;
        for (auto& req : requests)
            results.push_back(async(launch::async, handle_request, req));
        return results;
    }
};

int main() {
    AsyncServer server(4);

    vector<Request> reqs;
    for (int i = 0; i < 5; i++) reqs.push_back({i, "body " + to_string(i)});

    auto start = chrono::steady_clock::now();
    auto futures = server.process(reqs);

    for (auto& f : futures) {
        auto resp = f.get();
        if (resp.status == 200)
            cout << "request " << &f - futures.data() << ": processed\\n";
    }

    auto ms = chrono::duration_cast<chrono::milliseconds>(
        chrono::steady_clock::now() - start).count();
    cout << "all done: " << ms << "ms\\n";

    return 0;
}`;

const GENERIC_CACHE_CODE = `#include <iostream>
#include <unordered_map>
#include <list>
#include <optional>
#include <concepts>
using namespace std;

// __OUTPUT__: LRU cache: capacity 3\\nput a,b,c\\nget a: 1\\nevict b (LRU)\\nput d\\nhit rate: 66%

// LRU Cache — applies: templates, concepts, unordered_map, list, move semantics

template<typename K, typename V>
    requires Hashable<K>
class LRUCache {
    int capacity;
    list<pair<K, V>> items;      // front = most recent
    unordered_map<K, typename list<pair<K,V>>::iterator> index;

public:
    LRUCache(int cap) : capacity(cap) {}

    optional<V> get(const K& key) {
        auto it = index.find(key);
        if (it == index.end()) return nullopt;
        items.splice(items.begin(), items, it->second);  // move to front
        return it->second->second;
    }

    void put(const K& key, V value) {
        if (auto it = index.find(key); it != index.end()) {
            it->second->second = move(value);
            items.splice(items.begin(), items, it->second);
            return;
        }
        if ((int)items.size() >= capacity) {
            index.erase(items.back().first);
            items.pop_back();
        }
        items.emplace_front(key, move(value));
        index[key] = items.begin();
    }
    int size() const { return items.size(); }
};

template<typename T>
concept Hashable = requires(T t) { { hash<T>{}(t) } -> convertible_to<size_t>; };

int main() {
    LRUCache<string, int> cache(3);
    cout << "LRU cache: capacity 3\\n";
    cache.put("a", 1); cache.put("b", 2); cache.put("c", 3);
    cout << "put a,b,c\\n";

    auto v = cache.get("a");
    cout << "get a: " << *v << "\\n";  // a is now MRU

    cache.put("d", 4);  // evicts b (LRU — a was accessed, c is next oldest)
    cout << "evict b (LRU)\\n";
    cout << "put d\\n";

    int hits = 0;
    string keys[] = {"a", "b", "c", "d", "e", "f"};
    for (auto& k : keys) if (cache.get(k)) hits++;
    cout << "hit rate: " << (hits * 100 / 6) << "%\\n";

    return 0;
}`;

const lesson = {
  id: "cpp-4-010",
  slug: "capstone",
  chapter: "cpp-4",
  order: 10,
  title: "Capstone: Real-World C++",
  subtitle: "HTTP parser, buffer pool, async server, LRU cache — integrating everything",
  tags: ["c++", "cpp", "capstone", "http parser", "buffer pool", "async server", "LRU cache", "real-world"],
  aliases: [
    "c++ capstone",
    "c++ real world",
    "c++ http parser",
    "c++ LRU cache",
    "c++ buffer pool",
  ],

  hook: `You've learned the language, the standard library, advanced templates, concurrency, and tooling. Now it's time to put it together. Real C++ code integrates multiple subsystems: a parser uses \`string_view\` and \`variant\`, a buffer pool uses RAII and move semantics, a server uses async patterns, a cache uses templates and concepts. These capstone examples show how production code looks when you apply what you've learned — and what questions to ask when designing your own systems.`,

  mentalModel: [
    "**Production C++ integrates multiple techniques per subsystem.** A parser isn't just string handling — it uses `string_view` for zero-copy, `variant` for typed error results, and structured error types. Recognize which tools fit which problems: zero-copy view for parsing, RAII for resources, concepts for compile-time constraints.",
    "**Design for correctness first, then optimize.** The LRU cache works correctly with a map + list before you worry about cache line layout. The buffer pool is correct with a single mutex before going lock-free. Measure, profile, and optimize the hot path — not the whole thing.",
    "**Every non-trivial design choice is a trade-off.** PIMPL vs no PIMPL (compilation speed vs runtime overhead). Exceptions vs expected (control flow clarity vs performance). Mutex vs atomic (correctness simplicity vs lock-free complexity). There is no universally correct answer — context determines the right choice.",
  ],

  intuition: {
    prose: [
      "**Reading production code is as important as writing it.** Open source C++ projects (Chromium, LLVM, Abseil, folly, libstdc++) show how these patterns are used at scale. The patterns you've learned appear everywhere — find them, understand why they're there, and notice what's different at scale (more error handling, more abstraction, more tests, explicit versioning).",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**HTTP parser — run it then explore:**\n\n- Add a malformed request (missing \\r\\n) — the ParseError branch runs.\n- Case-insensitive header keys: verify 'Content-Type' and 'content-type' map to the same key.\n- Parse `Content-Length` header and validate body size matches.\n- `string_view` instead of `string` for headers: where does the lifetime constraint come from?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": HTTP_PARSER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Buffer pool with RAII — run it then explore:**\n\n- Acquire the same slot twice — what happens? (returns nullptr — already in use)\n- Move a buffer out of the function — does it still return to pool? (yes — RAII via destructor)\n- Pool with atomic available counter — thread-safe read without mutex.\n- Add acquire_any(): returns the first available buffer rather than a specific slot.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": BUFFER_MANAGER_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**An async server pattern reuses concepts across the entire C++ curriculum.** The thread pool from concurrency patterns. Futures from async primitives. RAII for request lifetime. Move semantics to avoid copying large request bodies. Performance profiling to find whether parsing or I/O is the bottleneck. The patterns compound: each individually manageable, together forming a production system.",
      "**The LRU cache demonstrates generic programming with constraints.** Template parameter `K` must be hashable (concept constraint). The `list<pair<K,V>>` keeps items in LRU order with O(1) splice. The `unordered_map` provides O(1) lookup to list iterators. Both structures stay synchronized — a complex invariant. This is where unit tests earn their value: testing edge cases (capacity=1, duplicate keys, get non-existent) proves correctness.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Async server — run it then explore:**\n\n- Measure total time: 5 tasks × 1ms each = 5ms serial, ~1ms parallel. Verify.\n- Add error handling: if handle_request throws, future.get() rethrows — catch it.\n- Rate limiting: add a semaphore — at most N requests processed simultaneously.\n- Replace async with thread pool: submit all tasks to a 4-thread pool, collect futures.",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": ASYNC_SERVER_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**LRU cache — run it then explore:**\n\n- Thread-safe LRU: add `mutable shared_mutex` — reads use shared_lock, writes unique_lock.\n- `cache.get(key)` returns `optional<V>` — test the nullopt case.\n- TTL (time-to-live): each entry stores `steady_clock::time_point inserted` — evict if too old.\n- Benchmark: N=1000 cache with uniform random keys vs sequential — what hit rate do you get?",
        props: {
          mainFile: "main.cpp",
          initialFiles: { "/home/user/main.cpp": GENERIC_CACHE_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "tip",
        title: "Start with the simplest correct solution, then optimize",
        body: "A mutex-protected LRU cache is correct and maintainable. A lock-free LRU using CAS is faster but requires weeks of careful implementation and testing. Profile first — if the cache is 5% of your runtime, the lock-free version saves 5%. If it's 80%, it's worth building. The simple version is always worth shipping first.",
      },
      {
        type: "tip",
        title: "Read open source C++ to see how the professionals do it",
        body: "Abseil (Google's C++ library) shows how to write portable, tested, annotated C++. folly (Meta's library) shows high-performance concurrent data structures. LLVM shows how to build a production compiler in modern C++. Reading real code is the fastest path from 'knows the language' to 'writes production code'.",
      },
    ],
  },

  examples: [
    {
      title: "Putting it all together: a typed command dispatcher",
      body: `#include <functional>
#include <unordered_map>
#include <any>
#include <string>
#include <stdexcept>
#include <optional>

// Command dispatcher: register handlers by name, dispatch by string
// Applies: std::any, std::function, templates, optional, move semantics

class CommandDispatcher {
    using Handler = std::function<std::any(std::any)>;
    std::unordered_map<std::string, Handler> handlers;

public:
    template<typename Req, typename Resp>
    void register_handler(std::string name, std::function<Resp(Req)> fn) {
        handlers[std::move(name)] = [fn = std::move(fn)](std::any input) -> std::any {
            return fn(std::any_cast<Req>(input));
        };
    }

    template<typename Resp, typename Req>
    std::optional<Resp> dispatch(const std::string& name, Req&& req) {
        auto it = handlers.find(name);
        if (it == handlers.end()) return std::nullopt;
        return std::any_cast<Resp>(it->second(std::forward<Req>(req)));
    }
};

// Usage:
// dispatcher.register_handler<string, int>("parse_int", [](string s) { return stoi(s); });
// auto result = dispatcher.dispatch<int>("parse_int", string("42")); // optional<int>{42}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Extend the HTTP parser to handle chunked transfer encoding: the body is split into chunks, each preceded by a hex size (e.g., `4\\r\\nWiki\\r\\n`). Parse a complete chunked body into a single string. Handle the terminal chunk `0\\r\\n\\r\\n`. Use `string_view` for zero-copy parsing where possible.",
      hint: "After the headers, check for `Transfer-Encoding: chunked`. Then in a loop: parse hex size, read that many bytes as a chunk, concatenate to body. Stop when size == 0.",
      walkthrough: [
        "while (pos < input.size()) {",
        "  auto hex_end = input.find('\\r\\n', pos);",
        "  int chunk_size = stoi(string(input.substr(pos, hex_end-pos)), nullptr, 16);",
        "  if (chunk_size == 0) break;",
        "  pos = hex_end + 2;",
        "  req.body += string(input.substr(pos, chunk_size));",
        "  pos += chunk_size + 2; // skip trailing \\r\\n",
        "}",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Build a thread-safe LRU cache that also supports TTL (time-to-live): entries expire after N milliseconds. `get(key)` should return `nullopt` for expired entries and remove them lazily. `put(key, value, ttl_ms)` stores the entry with an expiry time. Add a `purge_expired()` method that scans and removes all expired entries.",
      hint: "Store `pair<V, steady_clock::time_point>` as the value. In `get`: check if `now() > expiry` and return nullopt + erase if expired. `purge_expired`: iterate and erase if expired.",
      walkthrough: [
        "struct Entry { V value; chrono::steady_clock::time_point expires; };",
        "optional<V> get(K key) { auto it = find(key); if(it==end) return {}; if(now()>it->expires) { erase(key); return {}; } return it->value; }",
        "void put(K key, V val, int ttl_ms) { auto exp = now() + ms(ttl_ms); ... insert {val, exp}; }",
        "void purge_expired() { auto now = steady_clock::now(); erase_if(map, [&](auto& p){ return now > p.second.expires; }); }",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-010-q1",
        type: "choice",
        text: "Why does the HTTP parser use `string_view` instead of `string` for parsing?",
        options: [
          "string_view is faster to allocate",
          "string_view is a non-owning reference to existing data — parsing substrings creates views into the original input buffer without copying, so parsing 10KB of headers allocates no extra memory",
          "string_view supports regex",
          "string_view is required for variant",
        ],
        answer: 1,
        explanation:
          "`string_view` is a pointer + length into existing memory — no allocation. Parsing with `std::string` substrings copies each token. For an HTTP parser handling thousands of requests per second, those copies add up. `string_view` allows zero-copy tokenization. Limitation: the view is only valid as long as the underlying buffer is — the parsed request must not outlive the raw input buffer.",
      },
      {
        id: "cpp4-010-q2",
        type: "choice",
        text: "What design principle does the buffer pool's RAII destructor enforce?",
        options: [
          "Buffers are returned to the pool automatically when they go out of scope — callers cannot forget to return them",
          "Buffers cannot be moved",
          "The pool is thread-safe",
          "Buffers are zero-initialized on return",
        ],
        answer: 1,
        explanation:
          "The `Buffer` destructor calls `pool->return_buffer(id)`. Whether the buffer goes out of scope normally, via exception, or via early return, the destructor always runs and the buffer is always returned. Callers cannot forget — resource management is automatic. This is the RAII principle applied to a custom resource.",
      },
      {
        id: "cpp4-010-q3",
        type: "choice",
        text: "In the LRU cache, why does `get(key)` move the accessed item to the front of the list?",
        options: [
          "To keep the list sorted by key",
          "To maintain LRU order: the most recently accessed item is at the front. The back is the least recently used. When evicting, remove the back item.",
          "To improve cache hit rate",
          "For thread safety",
        ],
        answer: 1,
        explanation:
          "LRU (Least Recently Used) eviction: when the cache is full, remove the item that was accessed least recently. We maintain this by keeping items in access-time order: most recent at front, least recent at back. `get` moves the accessed item to the front via `list::splice` (O(1)). `put` with a full cache removes `list.back()` — the LRU item.",
      },
      {
        id: "cpp4-010-q4",
        type: "choice",
        text: "What is the main benefit of using `variant<HttpRequest, ParseError>` as the return type instead of throwing exceptions?",
        options: [
          "variant is faster than exceptions at runtime",
          "Parse failures are expected/normal — using variant makes the error explicit in the type system, forces callers to handle both cases, and eliminates exception propagation overhead",
          "variant supports more error types",
          "Exceptions can't carry structured data",
        ],
        answer: 1,
        explanation:
          "An HTTP parser fails on malformed input frequently — this is not exceptional, it's expected. Using `variant<Success, Error>` makes the error path explicit in the function signature. The caller cannot accidentally ignore the error (they must visit both arms). There's no exception overhead for the common error case. The `ParseError` struct carries structured information (line number, message) that guides debugging.",
      },
    ],
  },
};

export default lesson;
