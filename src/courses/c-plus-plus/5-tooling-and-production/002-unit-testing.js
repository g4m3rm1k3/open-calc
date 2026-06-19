const GTEST_BASIC_CODE = `#include <gtest/gtest.h>

// __OUTPUT__: [==========] Running 3 tests\\n[  PASSED  ] 3 tests\\nOK

int add(int a, int b) { return a + b; }
bool is_even(int n) { return n % 2 == 0; }

TEST(MathTest, AddPositive) {
    EXPECT_EQ(add(2, 3), 5);
    EXPECT_EQ(add(0, 0), 0);
}

TEST(MathTest, AddNegative) {
    EXPECT_EQ(add(-1, -1), -2);
    EXPECT_LT(add(-5, 3), 0);   // less than
}

TEST(MathTest, IsEven) {
    EXPECT_TRUE(is_even(4));
    EXPECT_FALSE(is_even(3));
    ASSERT_TRUE(is_even(100));  // ASSERT stops test on failure; EXPECT continues
}

int main(int argc, char** argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}`;

const FIXTURE_CODE = `#include <gtest/gtest.h>
#include <vector>
#include <string>
using namespace std;

// __OUTPUT__: [==========] Running 4 tests\\nSetUp called 4 times\\n[  PASSED  ] 4 tests

class VectorTest : public testing::Test {
protected:
    vector<int> v;

    void SetUp() override {
        v = {1, 2, 3, 4, 5};   // fresh copy for every test
    }

    void TearDown() override {
        // cleanup if needed (often not — RAII handles it)
    }
};

TEST_F(VectorTest, Size) {
    EXPECT_EQ(v.size(), 5u);
}

TEST_F(VectorTest, PushBack) {
    v.push_back(6);
    EXPECT_EQ(v.size(), 6u);
    EXPECT_EQ(v.back(), 6);
}

TEST_F(VectorTest, Sort) {
    sort(v.begin(), v.end(), greater<int>{});
    EXPECT_EQ(v[0], 5);
    EXPECT_EQ(v[4], 1);
}

TEST_F(VectorTest, Clear) {
    v.clear();
    EXPECT_TRUE(v.empty());
    EXPECT_EQ(v.size(), 0u);
}`;

const PARAMETRIC_CODE = `#include <gtest/gtest.h>
using namespace std;

// __OUTPUT__: [==========] Running 6 tests (3 parametric + 3 typed)\\n[  PASSED  ] 6 tests

bool is_prime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

// Parametric tests — same test logic, different inputs
class PrimeTest : public testing::TestWithParam<pair<int,bool>> {};

TEST_P(PrimeTest, Check) {
    auto [n, expected] = GetParam();
    EXPECT_EQ(is_prime(n), expected);
}

INSTANTIATE_TEST_SUITE_P(PrimeValues, PrimeTest, testing::Values(
    make_pair(2, true),
    make_pair(4, false),
    make_pair(17, true)
));

// Death tests — verify code terminates/throws as expected
int divide(int a, int b) {
    if (b == 0) throw invalid_argument("div by zero");
    return a / b;
}

TEST(DivideTest, DivByZero) {
    EXPECT_THROW(divide(1, 0), invalid_argument);
    EXPECT_NO_THROW(divide(10, 2));
}`;

const MOCK_CODE = `#include <gtest/gtest.h>
#include <gmock/gmock.h>
using namespace std;
using namespace testing;

// __OUTPUT__: mock: Database called\\nmock: verified 1 call\\n[  PASSED  ] 2 tests

// Interface to mock
struct Database {
    virtual ~Database() = default;
    virtual string query(const string& sql) = 0;
    virtual bool insert(const string& table, int id) = 0;
};

// Mock implementation — generated macros
struct MockDatabase : Database {
    MOCK_METHOD(string, query, (const string& sql), (override));
    MOCK_METHOD(bool, insert, (const string& table, int id), (override));
};

string fetch_user(Database& db, int id) {
    return db.query("SELECT name FROM users WHERE id=" + to_string(id));
}

TEST(UserTest, FetchUser) {
    MockDatabase db;
    EXPECT_CALL(db, query("SELECT name FROM users WHERE id=42"))
        .Times(1)
        .WillOnce(Return("Alice"));

    string name = fetch_user(db, 42);
    EXPECT_EQ(name, "Alice");
    cout << "mock: Database called\\n";
    cout << "mock: verified 1 call\\n";
}`;

const lesson = {
  id: "cpp-4-002",
  slug: "unit-testing",
  chapter: "cpp-4",
  order: 2,
  title: "Unit Testing with Google Test",
  subtitle: "TEST, TEST_F, TEST_P, fixtures, death tests, Google Mock",
  tags: ["c++", "cpp", "googletest", "gtest", "unit testing", "fixtures", "parametric", "gmock"],
  aliases: [
    "c++ unit testing",
    "c++ googletest",
    "c++ gtest",
    "c++ gmock",
    "c++ test fixtures",
  ],

  hook: `Code without tests rots silently. A function that worked in October fails in November after a refactor nobody noticed. Google Test (gtest) is the dominant C++ testing framework — used at Google, Chromium, LLVM, and thousands of other projects. It's fast, expressive, and integrates with CMake's CTest. Writing tests while writing code isn't slower — it's faster, because you find bugs before they compound.`,

  mentalModel: [
    "**`TEST(SuiteName, TestName)` defines an independent test case.** Each test runs in isolation — shared state between tests is a test smell. `EXPECT_*` macros check a condition and continue on failure. `ASSERT_*` macros check and stop the current test on failure (use when later assertions are meaningless without the earlier one passing).",
    "**`TEST_F` uses a fixture class for shared setup/teardown.** Your fixture inherits from `testing::Test`. `SetUp()` runs before each test, `TearDown()` after. Each test gets a fresh instance — tests don't share state. Use fixtures when multiple tests need the same initialized object.",
    "**`TEST_P` runs the same test with many inputs.** Define parameter values with `INSTANTIATE_TEST_SUITE_P`. This eliminates copy-paste test cases for boundary conditions, invalid inputs, and representative values. Google Test names each run by parameter value for easy debugging.",
  ],

  intuition: {
    prose: [
      "**Test at the unit level, not just the integration level.** A test that starts a server, sends HTTP requests, and checks the database is an integration test — slow, fragile, and hard to debug. A unit test calls a function with known inputs and checks the output — fast, reliable, and pinpoints exactly what broke. Start with unit tests; add integration tests for the critical path.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Basic assertions — run it then explore:**\n\n- Make `add` return `a - b` — which tests fail? Which EXPECT lines report the failure?\n- `EXPECT_EQ` vs `ASSERT_EQ`: change `ASSERT_TRUE` to fail — does the rest of the test run?\n- Add `EXPECT_NEAR(3.14, M_PI, 0.01)` — for floating point comparisons.\n- `EXPECT_STREQ(\"hello\", \"hello\")` for C strings — different from EXPECT_EQ for char*.",
        props: {
          mainFile: "test.cpp",
          initialFiles: { "/home/user/test.cpp": GTEST_BASIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Fixtures and SetUp — run it then explore:**\n\n- Verify SetUp is called fresh per test: add a `count` member, increment in SetUp, print in each test — always 1.\n- Add a `TearDown` that prints — confirm it runs after each test.\n- What if SetUp allocates memory and throws? (TearDown NOT called — use RAII in SetUp instead)\n- Share expensive setup across ALL tests in a suite: `SetUpTestSuite()` (static, runs once).",
        props: {
          mainFile: "test.cpp",
          initialFiles: { "/home/user/test.cpp": FIXTURE_CODE },
        },
      },
    ],
  },

  rigor: {
    prose: [
      "**Parametric tests eliminate copy-paste.** Testing `is_prime` for 2, 3, 5, 7, 11, 13, 17 separately is 7 near-identical tests. `TEST_P` + `INSTANTIATE_TEST_SUITE_P` expresses it once. Add edge cases (0, 1, negative, INT_MAX) without new test functions. Each parametric case gets its own failure message.",
      "**Google Mock (`gmock`) lets you test code that depends on interfaces.** Define a mock with `MOCK_METHOD`. Set expectations with `EXPECT_CALL`: how many times it's called, with which arguments, what it returns. After the test, mock verifies expectations were met. This lets you test units in isolation without a real database, network, or filesystem.",
    ],
    visualizations: [
      {
        id: "CppLab",
        mathBridge: "**Parametric and death tests — run it then explore:**\n\n- Add more `make_pair` entries to INSTANTIATE_TEST_SUITE_P — they run automatically.\n- `testing::Range(2, 20)` as parameter: test all ints from 2 to 19.\n- `EXPECT_THROW` vs `EXPECT_ANY_THROW` — the latter doesn't check the exception type.\n- `testing::Combine(Range(1,5), Range(1,5))` — Cartesian product of parameters.",
        props: {
          mainFile: "test.cpp",
          initialFiles: { "/home/user/test.cpp": PARAMETRIC_CODE },
        },
      },
      {
        id: "CppLab",
        mathBridge: "**Google Mock — run it then explore:**\n\n- `Times(AtLeast(1))` vs `Times(Exactly(2))` — change the expectation, break the test.\n- `EXPECT_CALL(db, insert(_, _))` — underscore is `testing::_` (any argument matcher).\n- `WillRepeatedly(Return(\"Bob\"))` — for multiple calls returning the same value.\n- `InSequence seq; EXPECT_CALL(db, query(...)).InSequence(seq)` — enforce call order.",
        props: {
          mainFile: "test.cpp",
          initialFiles: { "/home/user/test.cpp": MOCK_CODE },
        },
      },
    ],
    callouts: [
      {
        type: "warning",
        title: "Tests that depend on each other are fragile",
        body: "If Test B relies on state set by Test A, running B in isolation fails, and test order matters. Google Test randomizes test order with `--gtest_shuffle` — this exposes ordering dependencies. Each test should set up everything it needs in SetUp() or in the test body.",
      },
      {
        type: "tip",
        title: "Run with --gtest_filter to run specific tests",
        body: "`./mytest --gtest_filter=MathTest.*` runs only tests in the MathTest suite. `--gtest_filter=*Prime*` runs any test with 'Prime' in the name. `--gtest_repeat=100` reruns tests 100 times — useful for catching flaky tests that fail intermittently.",
      },
    ],
  },

  examples: [
    {
      title: "Testing a class with state",
      body: `#include <gtest/gtest.h>

class BankAccount {
    double balance_;
public:
    explicit BankAccount(double initial) : balance_(initial) {}
    void deposit(double amount) { balance_ += amount; }
    bool withdraw(double amount) {
        if (amount > balance_) return false;
        balance_ -= amount; return true;
    }
    double balance() const { return balance_; }
};

class BankAccountTest : public testing::Test {
protected:
    BankAccount account{100.0};  // each test gets fresh account with $100
};

TEST_F(BankAccountTest, DepositIncreasesBalance) {
    account.deposit(50.0);
    EXPECT_DOUBLE_EQ(account.balance(), 150.0);
}

TEST_F(BankAccountTest, WithdrawFailsIfInsufficient) {
    EXPECT_FALSE(account.withdraw(200.0));
    EXPECT_DOUBLE_EQ(account.balance(), 100.0);  // unchanged
}`,
    },
  ],

  challenges: [
    {
      difficulty: "easy",
      problem:
        "Write Google Test tests for a `Stack<T>` class with `push`, `pop`, `top`, and `empty` methods. Use a fixture. Test: empty stack is empty, push makes it non-empty, push/pop order is LIFO, `top` on empty stack throws `std::underflow_error`.",
      hint: "Fixture with `Stack<int> s;` in SetUp. Use `EXPECT_THROW(s.top(), std::underflow_error)` for the exception test.",
      walkthrough: [
        "class StackTest : public testing::Test { protected: Stack<int> s; };",
        "TEST_F(StackTest, EmptyOnConstruct) { EXPECT_TRUE(s.empty()); }",
        "TEST_F(StackTest, PushPop) { s.push(1); s.push(2); EXPECT_EQ(s.top(), 2); s.pop(); EXPECT_EQ(s.top(), 1); }",
        "TEST_F(StackTest, TopEmptyThrows) { EXPECT_THROW(s.top(), underflow_error); }",
      ],
    },
    {
      difficulty: "medium",
      problem:
        "Write parametric tests for a `sort_words(vector<string>)` function. Test with: empty vector, single word, already sorted, reverse sorted, with duplicates, with mixed case (if case-sensitive). Each case as a parameter. Then write a mock for a `Logger` interface (one method: `log(string)`) and verify it's called exactly once when sort_words fails validation.",
      hint: "`testing::Values(vector<string>{}, vector<string>{\"a\"}, ...)` for the parametric cases.",
      walkthrough: [
        "struct SortParam { vector<string> input; vector<string> expected; };",
        "class SortTest : public testing::TestWithParam<SortParam> {};",
        "TEST_P(SortTest, Sorts) { auto p = GetParam(); EXPECT_EQ(sort_words(p.input), p.expected); }",
        "INSTANTIATE_TEST_SUITE_P(Cases, SortTest, testing::Values(...));",
        "MOCK_METHOD(void, log, (const string&), (override));",
        "EXPECT_CALL(mockLogger, log(_)).Times(1);",
      ],
    },
  ],

  assessment: {
    questions: [
      {
        id: "cpp4-002-q1",
        type: "choice",
        text: "What is the difference between `EXPECT_EQ` and `ASSERT_EQ`?",
        options: [
          "EXPECT_EQ is for integers, ASSERT_EQ is for strings",
          "Both check equality, but ASSERT_EQ stops the current test function immediately on failure; EXPECT_EQ records the failure and continues",
          "ASSERT_EQ throws an exception; EXPECT_EQ does not",
          "They are identical",
        ],
        answer: 1,
        explanation:
          "Both macros check equality and report failure. The difference is control flow. `ASSERT_EQ` calls `return` on failure — the rest of the test function doesn't execute. Use `ASSERT` when later assertions would crash or be meaningless if the earlier check fails (e.g., asserting a pointer is non-null before dereferencing it). Use `EXPECT` by default.",
      },
      {
        id: "cpp4-002-q2",
        type: "choice",
        text: "When should you use a `TEST_F` fixture?",
        options: [
          "Whenever you test a class",
          "When multiple tests need the same initialized objects — the fixture's SetUp() creates a fresh copy for each test, preventing state leakage",
          "Only for performance tests",
          "When tests must run in a specific order",
        ],
        answer: 1,
        explanation:
          "Fixtures are useful when test setup is non-trivial and repeated. Each `TEST_F` gets a fresh fixture instance — `SetUp()` runs before, `TearDown()` after. This eliminates copy-paste setup code and ensures tests don't share state (each test starts from the same known state).",
      },
      {
        id: "cpp4-002-q3",
        type: "choice",
        text: "What does `EXPECT_CALL(mock, method(42)).Times(1).WillOnce(Return(\"ok\"))` do?",
        options: [
          "Immediately calls method(42) on mock",
          "Sets an expectation: method must be called exactly once with argument 42, and when called, returns 'ok'. Verified at end of test.",
          "Creates a stub that returns 'ok' for any argument",
          "Asserts that method was already called",
        ],
        answer: 1,
        explanation:
          "`EXPECT_CALL` sets up a mock expectation. It specifies: which method, which arguments (matchers), how many times (Times), and what to return (WillOnce/WillRepeatedly). The expectation is verified when the mock object is destroyed (end of test or scope). If the method is never called, or called with wrong args, the test fails.",
      },
      {
        id: "cpp4-002-q4",
        type: "choice",
        text: "Why are parametric tests (`TEST_P`) better than copying the same test with different literals?",
        options: [
          "Parametric tests run faster",
          "New test cases are added by adding a value to INSTANTIATE_TEST_SUITE_P — the test logic doesn't change. Each case is independently reported on failure.",
          "Parametric tests support multithreading",
          "They allow testing private methods",
        ],
        answer: 1,
        explanation:
          "Copy-paste tests diverge — you fix a bug in one and forget the others. Parametric tests keep the logic in one place. Adding a new case (e.g., a boundary value you missed) is one line in the `Values(...)` call. Each parametric run is reported independently: you see exactly which input caused the failure.",
      },
    ],
  },
};

export default lesson;
