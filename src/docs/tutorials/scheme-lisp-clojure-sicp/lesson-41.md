# Lesson 41: Clojure Maps, Keywords, and Destructuring

**What you will build**
In this lesson, we will build a small employee management module. The working feature is a data pipeline that queries and transforms employee records. The transferable problems we are solving are how to model domain objects using persistent maps (where Java would use objects and Python would use dictionaries), how to access data safely without special syntax by treating keywords as functions, and how to use destructuring as Clojure's equivalent of pattern matching to pull structured data apart cleanly.

**What you need to know first**
- Lessons 0–40 (all prior concepts through Clojure functions, closures, seq abstraction, map/filter/reduce, and threading macros).

**Terms used in this lesson**
- **Hash map** — A data structure that associates keys with values. It exists to let us look up data by a meaningful name rather than a numeric index.
- **Keyword** — A symbolic identifier that evaluates to itself, usually starting with a colon (like `:name`). It exists to serve as a fast, memory-efficient key in maps, and it can act as a function to look itself up.
- **Destructuring** — A syntactic feature that binds names to values inside a larger data structure. It exists to let us pull apart maps or vectors concisely in function parameters or `let` bindings without writing repetitive lookup code.
- **Persistent data structure** — An immutable data structure that always preserves its previous version when modified. It exists so that multiple parts of a program can share data safely without locks.
- **Structural sharing** — A memory-management technique used by immutable data structures where a new version of a structure shares most of its underlying tree with the old version. It exists to make immutable updates fast (O(log n)) without copying the entire structure.
- **Protocol system** — Clojure's mechanism for polymorphic dispatch, similar to interfaces in Java. It exists to let different types (like keywords and maps) implement the same behavior (like acting as a function).

**Objects and methods used**

- **`get`**
  - *What it is:* A core library function to retrieve a value from a map or collection.
  - *Implementation:* `(get map key not-found)`
  - *Its use:* To safely look up a key in a map, optionally providing a default value if the key is missing.
  - *Type:* Core library function.
  - *Responsibility:* Retrieves the value associated with a key, returning `nil` or a default if not found, without throwing an exception.
  - *Depends on:* A map and a key to look up.
  - *Connects to:* Called by user code, queries the internal map implementation.
  - *Shape:* Public API surface of the core library.

- **`get-in`**
  - *What it is:* A core library function to retrieve a value from nested associative structures.
  - *Implementation:* `(get-in m ks)`
  - *Its use:* To look up deep paths in nested maps without chaining multiple `get` calls.
  - *Type:* Core library function.
  - *Responsibility:* Walks down a sequence of keys into nested maps and returns the value at the end of the path.
  - *Depends on:* A map and a vector of keys representing the path.
  - *Connects to:* Calls `get` recursively under the hood.
  - *Shape:* Public API surface of the core library.

- **`assoc`**
  - *What it is:* A core library function to "associate" a new key-value pair in a map.
  - *Implementation:* `(assoc map key val)`
  - *Its use:* To create a new map based on an old one but with a new or updated key.
  - *Type:* Core library function.
  - *Responsibility:* Returns a new map containing all pairs from the original map plus the new pair.
  - *Depends on:* A map, a key, and a value.
  - *Connects to:* Called by user code, returns a new map using structural sharing.
  - *Shape:* Public API surface of the core library.

- **`dissoc`**
  - *What it is:* A core library function to "dissociate" or remove a key from a map.
  - *Implementation:* `(dissoc map key)`
  - *Its use:* To create a new map that lacks a specific key.
  - *Type:* Core library function.
  - *Responsibility:* Returns a new map containing all pairs from the original map except the specified key.
  - *Depends on:* A map and a key.
  - *Connects to:* Called by user code.
  - *Shape:* Public API surface of the core library.

- **`update`**
  - *What it is:* A core library function to update a value in a map by applying a function to the existing value.
  - *Implementation:* `(update map key f & args)`
  - *Its use:* To modify a numeric or structured value inside a map without repeating the lookup.
  - *Type:* Core library function.
  - *Responsibility:* Looks up the current value for a key, calls a function on it, and returns a new map with the result.
  - *Depends on:* A map, a key, and an update function.
  - *Connects to:* Calls the provided function `f` with the old value.
  - *Shape:* Public API surface of the core library.

- **`update-in`**
  - *What it is:* A core library function to update a nested value.
  - *Implementation:* `(update-in m ks f & args)`
  - *Its use:* To apply a function deep inside nested maps.
  - *Type:* Core library function.
  - *Responsibility:* Traverses a key path, applies a function to the nested value, and returns a new top-level map.
  - *Depends on:* A map, a vector of keys, and an update function.
  - *Connects to:* Recursively rebuilds the nested path.
  - *Shape:* Public API surface of the core library.

- **`merge`**
  - *What it is:* A core library function to combine multiple maps.
  - *Implementation:* `(merge & maps)`
  - *Its use:* To combine two or more maps, with rightmost maps overriding keys from leftmost maps.
  - *Type:* Core library function.
  - *Responsibility:* Returns a new map containing the union of all keys and values from the input maps.
  - *Depends on:* One or more maps.
  - *Connects to:* Iterates over maps and folds them together.
  - *Shape:* Public API surface of the core library.

- **`sort-by`**
  - *What it is:* A core library function to sort a collection based on a key function.
  - *Implementation:* `(sort-by keyfn coll)`
  - *Its use:* To sort a sequence of maps by one of their keys (like sorting by salary).
  - *Type:* Core library function.
  - *Responsibility:* Returns a sorted sequence of the items in the collection, using `keyfn` to extract the value to compare.
  - *Depends on:* A key function and a collection.
  - *Connects to:* Calls the `keyfn` on each element.
  - *Shape:* Public API surface of the core library.

- **`select-keys`**
  - *What it is:* A core library function to extract a sub-map with only the requested keys.
  - *Implementation:* `(select-keys map keyseq)`
  - *Its use:* To project or filter down the fields of a map to a smaller subset.
  - *Type:* Core library function.
  - *Responsibility:* Returns a new map containing only the key-value pairs where the key is in the provided sequence.
  - *Depends on:* A map and a sequence of keys.
  - *Connects to:* Queries the map.
  - *Shape:* Public API surface of the core library.

**Everything else in the file, not this lesson's subject but still explained**

- **`filter`**
  - *What it is:* A core library function to select items from a collection that match a predicate.
  - *Implementation:* `(filter pred coll)`
  - *Its use:* To find all items in a list that meet a condition.
  - *Type:* Core library function.
  - *Responsibility:* Returns a lazy sequence of items for which the predicate returns true.
  - *Depends on:* A predicate function and a collection.
  - *Connects to:* Calls the predicate on each element.
  - *Shape:* Public API surface of the core library.

- **`map`**
  - *What it is:* A core library function to apply a function to every item in a collection.
  - *Implementation:* `(map f coll)`
  - *Its use:* To transform each element of a sequence into a new form.
  - *Type:* Core library function.
  - *Responsibility:* Returns a lazy sequence consisting of the result of applying the function to each element.
  - *Depends on:* A mapping function and a collection.
  - *Connects to:* Calls `f` on every element.
  - *Shape:* Public API surface of the core library.

---

## Concept Unit: Maps as Domain Models

### The Problem
We need a way to represent a single entity, like a person or a company, that has multiple properties. Using a raw list or vector is confusing because we have to remember which index corresponds to which field. We need a way to look up values by a meaningful name, much like a dictionary in Python or an object in Java.

### Introduce the concept in isolation
We can use a **hash map** to associate keys with values. Let's create a person and look up their name in three different ways.

```clojure
(def person {:name "Alice" :age 30 :city "Boston"})

(println (get person :name))
(println (:name person))
(println (person :name))
(println (get person :email "unknown"))
```

Output:
```text
Alice
Alice
Alice
unknown
```

This proves that we can create a map and retrieve values from it. It also proves that a keyword like `:name` can act as a function to look itself up in a map, and a map can act as a function to look up a key within itself.

### Discard the throwaway example
We will delete this generic `person` map. We will use a real company structure in our project instead.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our employee management module.
- **Files affected:** `src/company/core.clj` (created)
- **Change type:** Add
- **Location:** At the top of the file.
- **Dependencies:** None.

### The New Code
```clojure
(ns company.core)

(def company {:name "Acme"
              :ceo {:name "Bob" :age 45}
              :employees ["Alice" "Carol" "Dave"]})

(defn get-ceo-name [company-data]
  (get-in company-data [:ceo :name]))
```

### The Updated Project
```clojure
// ← new
(ns company.core)

(def company {:name "Acme"
              :ceo {:name "Bob" :age 45}
              :employees ["Alice" "Carol" "Dave"]})

(defn get-ceo-name [company-data]
  (get-in company-data [:ceo :name]))
```
This new file defines our namespace, establishes a nested map representing a company, and provides a function to cleanly extract a value buried deep within that map.

### Mechanical walkthrough
- `ns` is the namespace declaration that sets up our current file.
- `def` is a special form that binds a name (`company`) to a value in the global namespace.
- `{` and `}` are the literal syntax for creating a hash map.
- `:name`, `:ceo`, `:age`, and `:employees` are keywords. A **keyword** is a self-evaluating value that also implements the `IFn` function interface. They exist to serve as fast, immutable identifiers.
- `"Acme"`, `"Bob"`, `45`, and the vector `["Alice" "Carol" "Dave"]` are the values associated with those keywords in the map.
- `defn` defines a new function named `get-ceo-name` that takes one argument `company-data`.
- `get-in` is a core library function that retrieves a value from a nested associative structure by following a path of keys.
- `[:ceo :name]` is a vector specifying the path to traverse. First it looks up `:ceo`, which returns the nested map, and then it looks up `:name` within that nested map.

**Execution trace of `(:name person)` from our lab:**
Because both keywords and maps implement `IFn` (the function interface) — which is Clojure's **protocol system** in action — they can be placed in the first position of a list to act as a function.
1. `(:name person)` evaluates the keyword `:name` as a function, passing `person` as its argument.
2. The keyword `:name` looks itself up inside the `person` map.
3. The map returns `"Alice"`.
This is exactly equivalent to calling `(get person :name)`.

---

## Concept Unit: Immutable Updates with assoc, dissoc, update, and merge

### The Problem
We need to modify our domain objects as things change — an employee gets older, changes their email, or leaves the company. In an object-oriented language, we would mutate the object in place. In a functional language, data is immutable, so we need a way to return a *new* copy of the data with our changes applied, without manually copying every unaffected field.

### Introduce the concept in isolation
Let's see how we can "change" an immutable map.

```clojure
(def temp-person {:name "Alice" :age 30 :city "Boston"})

(println (assoc temp-person :email "alice@example.com"))
(println temp-person)
(println (dissoc temp-person :city))
(println (update temp-person :age inc))
(println (update temp-person :age + 5))
(println (merge {:a 1 :b 2} {:b 3 :c 4}))
```

Output:
```text
{:name "Alice", :age 30, :city "Boston", :email "alice@example.com"}
{:name "Alice", :age 30, :city "Boston"}
{:name "Alice", :age 30}
{:name "Alice", :age 31, :city "Boston"}
{:name "Alice", :age 35, :city "Boston"}
{:a 1, :b 3, :c 4}
```

This proves that operations like `assoc` and `update` return a brand-new map with the modifications applied, while the original `temp-person` remains completely unchanged. This is called a **persistent data structure**.

### Discard the throwaway example
We delete `temp-person` and these test prints. We will apply these functions to our real company data.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/company/core.clj` (modified)
- **Change type:** Add
- **Location:** Below `get-ceo-name`.
- **Dependencies:** None.

### The New Code
```clojure
(defn celebrate-ceo-birthday [company-data]
  (update-in company-data [:ceo :age] inc))
```

### The Updated Project
```clojure
(defn get-ceo-name [company-data]
  (get-in company-data [:ceo :name]))

// ← new
(defn celebrate-ceo-birthday [company-data]
  (update-in company-data [:ceo :age] inc))
```
This function takes a company map, travels down to the CEO's record, and increments their age, returning a completely new company map.

### Mechanical walkthrough
- `defn` defines the function `celebrate-ceo-birthday` taking `company-data`.
- `update-in` is called with the map `company-data`, the path `[:ceo :age]`, and the function `inc`.
- `[:ceo :age]` directs `update-in` to find the nested map under `:ceo` and then the value under `:age`.
- `inc` is the function that will be applied to the existing age value.
- The result is a new top-level company map. Because of **structural sharing**, the new map shares memory for the `:name` and `:employees` fields with the old map, making this update an O(log n) operation instead of a slow O(n) full copy.

**Execution trace for `(update temp-person :age inc)` from our lab:**
1. `update` receives `temp-person`, the key `:age`, and the function `inc`.
2. It looks up the current value of `:age` in `temp-person`, which is `30`.
3. It calls `(inc 30)`, which evaluates to `31`.
4. It returns a new map containing all original keys, but with `:age` set to `31`.

---

## Concept Unit: Map Destructuring in let Bindings

### The Problem
When working with maps, we often need to extract several fields at once into local variables. Calling `get` repeatedly is verbose and clutters the logic with structural boilerplate. We need a way to declare the shape of the data we expect and bind variables to it simultaneously.

### Introduce the concept in isolation
We can use map destructuring in a `let` binding to pull values out concisely.

```clojure
(def local-person {:name "Alice" :age 30})

(let [{:keys [name age]} local-person]
  (println (str name " is " age)))

(let [[first second & rest] [1 2 3 4 5]]
  (println {:first first :second second :rest rest}))
```

Output:
```text
Alice is 30
{:first 1, :second 2, :rest (3 4 5)}
```

This proves that `{:keys [name age]}` successfully extracts the `:name` and `:age` keys from the map and binds them to local symbols `name` and `age`. It also proves that `[first second & rest]` extracts elements from a vector sequentially. This is called **destructuring**.

### Discard the throwaway example
We will discard `local-person` and apply this technique to a real employee formatter.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/company/core.clj` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(defn format-ceo [company-data]
  (let [{:keys [name age]} (:ceo company-data)]
    (str name " is the CEO and is " age " years old.")))
```

### The Updated Project
```clojure
(defn celebrate-ceo-birthday [company-data]
  (update-in company-data [:ceo :age] inc))

// ← new
(defn format-ceo [company-data]
  (let [{:keys [name age]} (:ceo company-data)]
    (str name " is the CEO and is " age " years old.")))
```
This function isolates the CEO's nested map, destructures its `name` and `age` fields into local variables, and returns a formatted string.

### Mechanical walkthrough
- `defn` defines the function `format-ceo` taking `company-data`.
- `let` establishes a block for local variable bindings.
- `{:keys [name age]}` is the destructuring pattern. It tells Clojure: "Expect a map on the right side. Look up the keyword `:name` and bind its value to the symbol `name`. Look up the keyword `:age` and bind its value to the symbol `age`."
- `(:ceo company-data)` evaluates to the map that will be destructured. We use the keyword `:ceo` as a function to extract it.
- `str` concatenates the newly bound local variables `name` and `age` with string literals.

**Execution trace of the map destructuring:**
1. `(:ceo company-data)` evaluates to `{:name "Bob" :age 45}`.
2. The destructuring mechanism processes `{:keys [name age]}` against this map.
3. It performs `(get map :name)` yielding `"Bob"`, and binds it to `name`.
4. It performs `(get map :age)` yielding `45`, and binds it to `age`.
5. The body of the `let` executes with these bindings active.

---

## Concept Unit: Parameter Destructuring

### The Problem
Destructuring inside a `let` block is useful, but often a function's sole purpose is to process the contents of a map passed as an argument. Writing a `let` block inside every function just to unpack its arguments is repetitive. We need a way to unpack maps directly in the function signature.

### Introduce the concept in isolation
Functions can destructure their arguments exactly the same way `let` does.

```clojure
(defn greet-person [{:keys [name age city]}]
  (println (str "Hello, " name "! You are " age " years old from " city ".")))

(greet-person {:name "Alice" :age 30 :city "Boston"})

(defn greet-with-defaults [{:keys [name age city] :or {city "Unknown"}}]
  (println (str name " from " city)))

(greet-with-defaults {:name "Dave" :age 25})
```

Output:
```text
Hello, Alice! You are 30 years old from Boston.
Dave from Unknown
```

This proves that parameter destructuring acts as syntactic sugar, automatically binding names from the map as if a `let` block were present. It also proves we can supply default values using `:or`.

### Discard the throwaway example
We will delete `greet-person` and `greet-with-defaults` and add a proper formatting function to our namespace.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/company/core.clj` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(defn show-employee [{:keys [name dept salary] :as full-employee}]
  (println "Formatting:" name "in" dept)
  full-employee)
```

### The Updated Project
```clojure
(defn format-ceo [company-data]
  (let [{:keys [name age]} (:ceo company-data)]
    (str name " is the CEO and is " age " years old.")))

// ← new
(defn show-employee [{:keys [name dept salary] :as full-employee}]
  (println "Formatting:" name "in" dept)
  full-employee)
```
This function accepts an employee map, destructures it to print a message, and also binds the entire original map to `full-employee` using the `:as` directive so it can be returned.

### Mechanical walkthrough
- `defn` defines the function `show-employee`.
- `[{:keys [name dept salary] :as full-employee}]` is the parameter list. It specifies that the function takes exactly **one** argument (a map), but it unpacks it immediately.
- `{:keys [name dept salary]}` binds the corresponding keywords to local symbols.
- `:as full-employee` is a destructuring directive that binds the symbol `full-employee` to the original, unmodified argument passed in, before it was broken apart.
- `println` uses the destructured `name` and `dept` symbols.
- The function returns `full-employee`, making it a transparent pass-through useful for debugging in a pipeline.

---

## Concept Unit: Data Pipelines with Maps

### The Problem
Real applications rarely process a single map in isolation. We usually have a large sequence of maps (like a database result set) and we need to filter them, sort them, and reshape them into a new format. We need to combine persistent maps, keywords as functions, and sequence operations into a cohesive data pipeline.

### Introduce the concept in isolation
Let's see how `sort-by` and `select-keys` work on maps.

```clojure
(def test-emps [{:name "Alice" :salary 95000} {:name "Bob" :salary 62000}])
(println (sort-by :salary > test-emps))
(println (select-keys (first test-emps) [:name]))
```

Output:
```text
({:name Alice, :salary 95000} {:name Bob, :salary 62000})
{:name Alice}
```

This proves `sort-by` can use a keyword as the sorting function, and `select-keys` creates a new map keeping only the specified keys.

### Discard the throwaway example
We will delete `test-emps` and implement our real reporting pipeline.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/company/core.clj` (modified)
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(def employees
  [{:name "Alice" :dept :engineering :salary 95000}
   {:name "Bob"   :dept :marketing   :salary 62000}
   {:name "Carol" :dept :engineering :salary 88000}
   {:name "Dave"  :dept :marketing   :salary 71000}
   {:name "Eve"   :dept :engineering :salary 102000}])

(defn top-engineering-salaries [emps]
  (->> emps
       (filter #(= :engineering (:dept %)))
       (sort-by :salary >)
       (map #(select-keys % [:name :salary]))))
```

### The Updated Project
```clojure
(defn show-employee [{:keys [name dept salary] :as full-employee}]
  (println "Formatting:" name "in" dept)
  full-employee)

// ← new
(def employees
  [{:name "Alice" :dept :engineering :salary 95000}
   {:name "Bob"   :dept :marketing   :salary 62000}
   {:name "Carol" :dept :engineering :salary 88000}
   {:name "Dave"  :dept :marketing   :salary 71000}
   {:name "Eve"   :dept :engineering :salary 102000}])

(defn top-engineering-salaries [emps]
  (->> emps
       (filter #(= :engineering (:dept %)))
       (sort-by :salary >)
       (map #(select-keys % [:name :salary]))))
```
This adds a vector of employee maps and a pipeline function that filters for engineers, sorts them by highest salary first, and strips away everything except their names and salaries.

### Mechanical walkthrough
- `def employees` defines a vector containing multiple maps.
- `defn` defines `top-engineering-salaries`, taking the collection `emps`.
- `->>` is the thread-last macro, which takes `emps` and threads it as the last argument through the following forms.
- `(filter #(= :engineering (:dept %)))` keeps only the maps where the `:dept` keyword lookup returns `:engineering`. `#(...)` is an anonymous function, and `%` represents each map passing through.
- `(sort-by :salary >)` takes the filtered sequence and sorts it. It uses the keyword `:salary` as the function to extract the value to compare, and the core function `>` to sort in descending order.
- `(map #(select-keys % [:name :salary]))` applies `select-keys` to every map in the sorted sequence, returning a sequence of new, smaller maps containing only `:name` and `:salary`.
- Because of immutability, every step in this pipeline returns a brand-new lazy sequence; the original `employees` vector is never modified.

**Execution trace of the pipeline:**
1. `filter` receives `emps`. It checks `(:dept {:name "Alice" ...})`, gets `:engineering`, keeps Alice. Bob evaluates to `:marketing` and is dropped. Carol and Eve are kept.
2. `sort-by` receives `({Alice} {Carol} {Eve})`. It extracts `:salary` for each (95000, 88000, 102000) and sorts them descending. Result: `({Eve} {Alice} {Carol})`.
3. `map` receives the sorted sequence. It calls `select-keys` on each, stripping out `:dept`. Result: `({:name "Eve", :salary 102000} {:name "Alice", :salary 95000} {:name "Carol", :salary 88000})`.
