# Lesson 49: Capstone Part 1 — A Mini Data Pipeline in Clojure

What you will build: You will build the FIRST HALF of a real, working Clojure data pipeline: a program that reads a CSV file of sales data, parses it, transforms the records (cleaning, enriching, filtering), and computes summary statistics. This is a real tool a developer would write. The transferable problems this lesson is actually about: (1) reading and parsing structured text data is the most common real-world Clojure task; (2) a data pipeline is a sequence of pure transformations on immutable data — everything from Lessons 39–48 applies directly; (3) grouping and aggregating data with `group-by` and `reduce` is the Clojure equivalent of SQL GROUP BY.

What you need to know first: Lessons 0–48 (all prior concepts through the entire curriculum).

**Terms used in this lesson:**
- **map** — A fundamental functional programming operation that applies a given function to every item in a collection, returning a new collection of the results. It exists to transform data element-by-element without mutating the original collection.
- **keyword** — A symbolic identifier in Clojure, starting with a colon (e.g., `:name`). It exists to provide fast, memory-efficient, self-evaluating names, commonly used as keys in maps.
- **destructuring** — A syntactic feature that allows you to bind names to values inside data structures (like lists or maps) directly in a function parameter list or `let` binding. It exists to eliminate boilerplate code used to extract inner values.
- **->> (threading macro)** — A macro that takes an initial value and threads it through a series of expressions as the *last* argument to each. It exists to make deep, nested function calls readable top-to-bottom.
- **filter** — A functional programming operation that evaluates a predicate function against every item in a collection, returning a new collection containing only the items for which the predicate returned true. It exists to conditionally remove items without side effects.
- **reduce** — A functional programming operation that takes a collection and combines all its elements into a single value by repeatedly applying a combining function. It exists to aggregate data (like summing numbers) functionally.
- **group-by** — A function that partitions a collection into a map, where the keys are the results of applying a function to the items, and the values are vectors of the items that produced that key. It exists to categorize data.
- **pure functions** — Functions that always produce the same output for the same input and have no observable side effects (like printing or modifying state). They exist to make code predictable and testable.
- **regular expression (regex)** — A sequence of characters that specifies a search pattern in text. It exists to allow complex text matching and splitting.

**Objects and methods used:**

- **`clojure.string/split-lines`**
  - *What it is:* A function in the `clojure.string` namespace that takes a string and splits it into a sequence of lines based on newline characters.
  - *Implementation:* `(clojure.string/split-lines s)` returns a vector of strings.
  - *Its use:* To take a single large string representing a whole CSV file and break it into individual row strings.
  - *Type:* Free function.
  - *Responsibility:* Splits a string on `\n` or `\r\n`.
  - *Depends on:* A string input.
  - *Connects to:* Called by your parsing logic; calls Java's underlying string splitting.
  - *Shape:* An internal utility step in the data ingestion pipeline.

- **`clojure.string/split`**
  - *What it is:* A function that splits a string using a regular expression.
  - *Implementation:* `(clojure.string/split s re)` returns a vector of strings.
  - *Its use:* To break a single CSV row string into its constituent comma-separated values.
  - *Type:* Free function.
  - *Responsibility:* Tokenizes a string based on a pattern.
  - *Depends on:* A string input and a regular expression literal (e.g., `#","`).
  - *Connects to:* Called by your parsing logic; uses `java.util.regex`.
  - *Shape:* An internal utility step.

- **`zipmap`**
  - *What it is:* A core Clojure function that returns a map with the keys mapped to the corresponding vals.
  - *Implementation:* `(zipmap keys vals)` returns a map.
  - *Its use:* To pair a sequence of header keywords with a sequence of row values to create a structured record map.
  - *Type:* Free function.
  - *Responsibility:* Combines two sequences into a dictionary map.
  - *Depends on:* A sequence of keys and a sequence of values.
  - *Connects to:* Called by parsing logic.
  - *Shape:* Data structuring boundary.

- **`first`**
  - *What it is:* A core function returning the first item in a collection.
  - *Implementation:* `(first coll)` returns the first element or nil.
  - *Its use:* To extract the header row from the sequence of lines.
  - *Type:* Free function.
  - *Responsibility:* Accesses the head of a sequence.
  - *Depends on:* A collection.
  - *Connects to:* Used on sequences.
  - *Shape:* Data access.

- **`rest`**
  - *What it is:* A core function returning a sequence of the items after the first.
  - *Implementation:* `(rest coll)` returns a sequence.
  - *Its use:* To separate the data rows from the header row.
  - *Type:* Free function.
  - *Responsibility:* Accesses the tail of a sequence.
  - *Depends on:* A collection.
  - *Connects to:* Used on sequences.
  - *Shape:* Data access.

- **`Integer/parseInt`**
  - *What it is:* A static method from the Java `Integer` class, accessed via Clojure's interop.
  - *Implementation:* `(Integer/parseInt s)` returns a primitive integer.
  - *Its use:* To convert string quantity values from the CSV into real numbers for math.
  - *Type:* Static method on `java.lang.Integer`.
  - *Responsibility:* Parses a string into a base-10 integer.
  - *Depends on:* A string representing a number.
  - *Connects to:* Called by record cleaning logic.
  - *Shape:* Type conversion boundary.

- **`Double/parseDouble`**
  - *What it is:* A static method from the Java `Double` class.
  - *Implementation:* `(Double/parseDouble s)` returns a primitive double.
  - *Its use:* To convert string price values into floating-point numbers.
  - *Type:* Static method on `java.lang.Double`.
  - *Responsibility:* Parses a string into a double.
  - *Depends on:* A string representing a decimal number.
  - *Connects to:* Called by record cleaning logic.
  - *Shape:* Type conversion boundary.

- **`select-keys`**
  - *What it is:* A core function that returns a map containing only the specified keys.
  - *Implementation:* `(select-keys map keyseq)` returns a new map.
  - *Its use:* To strip out unneeded fields from our records during projection.
  - *Type:* Free function.
  - *Responsibility:* Filters a map by key.
  - *Depends on:* A map and a sequence of keys.
  - *Connects to:* Data projection pipeline.
  - *Shape:* Data transformation step.

- **`count`**
  - *What it is:* A core function returning the number of items in a collection.
  - *Implementation:* `(count coll)` returns an integer.
  - *Its use:* To find the number of transactions per group.
  - *Type:* Free function.
  - *Responsibility:* Determines collection size.
  - *Depends on:* A collection.
  - *Connects to:* Aggregation logic.
  - *Shape:* Metric computation.

- **`sort-by`**
  - *What it is:* A core function returning a sorted sequence.
  - *Implementation:* `(sort-by keyfn comp coll)` returns a sorted sequence.
  - *Its use:* To order the final report by revenue descending.
  - *Type:* Free function.
  - *Responsibility:* Sorts a collection based on a function's output.
  - *Depends on:* A key extraction function, an optional comparator (like `>`), and a collection.
  - *Connects to:* Report formatting logic.
  - *Shape:* Presentation formatting step.

- **`doseq`**
  - *What it is:* A macro for executing side effects over a sequence.
  - *Implementation:* `(doseq [seq-exprs] body)` returns nil.
  - *Its use:* To print each line of the summary report sequentially.
  - *Type:* Macro.
  - *Responsibility:* Iterates for side-effects, ignoring return values.
  - *Depends on:* A sequence binding and a body of expressions.
  - *Connects to:* Output boundaries (e.g., standard out).
  - *Shape:* Side-effect loop.

- **`println`**
  - *What it is:* A core function to print text.
  - *Implementation:* `(println & args)` prints args with a trailing newline.
  - *Its use:* To output the summary report to the console.
  - *Type:* Free function.
  - *Responsibility:* Writes to standard output.
  - *Depends on:* Arguments to print.
  - *Connects to:* `java.lang.System.out`.
  - *Shape:* I/O boundary.

- **`format`**
  - *What it is:* A core function for formatted strings.
  - *Implementation:* `(format fmt & args)` returns a formatted string.
  - *Its use:* To align text and format currency with exactly two decimal places.
  - *Type:* Free function.
  - *Responsibility:* Formats strings using Java's `String.format` rules.
  - *Depends on:* A format string and arguments.
  - *Connects to:* `java.lang.String/format`.
  - *Shape:* String formatting.


## Concept Unit: Reading and splitting the CSV

### The Problem
We have a single, multi-line string of CSV data. We need to convert this raw text into structured Clojure data: a list of maps, where each map represents one row, and the keys are the column headers. How do we break a single string into lines, separate the header from the data, and pair the header names with the row values?

### Throwaway Lab
Let's see how `clojure.string/split-lines`, `clojure.string/split`, and `zipmap` work in isolation.

```clojure
(require '[clojure.string :as str])

(def sample-lines (str/split-lines "A,B\n1,2"))
(println sample-lines)
;; => ["A,B" "1,2"]

(def headers (map keyword (str/split (first sample-lines) #",")))
(println headers)
;; => (:A :B)

(def values (str/split (second sample-lines) #","))
(println values)
;; => ["1" "2"]

(println (zipmap headers values))
;; => {:A "1", :B "2"}
```
This output proves that `split-lines` correctly isolates rows, `split` with the regex `#","` tokenizes the comma-separated strings, and `zipmap` effectively pairs a sequence of keys (`(:A :B)`) with a sequence of values (`["1" "2"]`) into a single map.

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart — this is a from-scratch addition because we are starting our pipeline.
- **Files affected:** `src/sales_pipeline/core.clj` (Created)
- **Change type:** Add
- **Location:** Brand new file.
- **Dependencies:** `clojure.string`.

### The New Code
```clojure
(ns sales-pipeline.core
  (:require [clojure.string :as str]))

(def raw-csv
  "date,region,product,quantity,unit_price
2024-01-15,North,Widget-A,100,9.99
2024-01-15,South,Widget-B,50,14.99
2024-01-16,North,Widget-A,75,9.99
2024-01-16,East,Widget-C,200,4.99
2024-01-17,South,Widget-A,120,9.99
2024-01-17,East,Widget-B,30,14.99
2024-01-18,North,Widget-C,150,4.99
2024-01-18,South,Widget-C,80,4.99")

(defn parse-csv [csv-string]
  (let [lines (str/split-lines csv-string)
        header (str/split (first lines) #",")
        rows   (rest lines)]
    (map (fn [row]
           (zipmap (map keyword header)
                   (str/split row #",")))
         rows)))

(def raw-records (parse-csv raw-csv))
```

### The Updated Project
```clojure
(ns sales-pipeline.core
  (:require [clojure.string :as str]))

(def raw-csv
  "date,region,product,quantity,unit_price
2024-01-15,North,Widget-A,100,9.99
2024-01-15,South,Widget-B,50,14.99
2024-01-16,North,Widget-A,75,9.99
2024-01-16,East,Widget-C,200,4.99
2024-01-17,South,Widget-A,120,9.99
2024-01-17,East,Widget-B,30,14.99
2024-01-18,North,Widget-C,150,4.99
2024-01-18,South,Widget-C,80,4.99")

;; ← new
(defn parse-csv [csv-string]
  (let [lines (str/split-lines csv-string)
        header (str/split (first lines) #",")
        rows   (rest lines)]
    (map (fn [row]
           (zipmap (map keyword header)
                   (str/split row #",")))
         rows)))

(def raw-records (parse-csv raw-csv))
```
This structure creates a namespace, defines a literal CSV string, provides a function to parse it, and stores the parsed result in `raw-records`.

### Mechanical Walkthrough
- `(ns sales-pipeline.core ...)` declares the namespace and requires the `clojure.string` library, aliasing it as `str`.
- `(def raw-csv "...")` defines a top-level constant holding our string data.
- `(defn parse-csv [csv-string] ...)` defines our parsing function.
- `(let [lines (str/split-lines csv-string) ...)` sets up local bindings. `str/split-lines` breaks the huge string into a list of strings, one per line.
- `header (str/split (first lines) #",")` takes the `first` item from the lines (the header row) and uses `str/split` with the regular expression `#","` to break it into a sequence of column names (`"date"`, `"region"`, etc.).
- `rows (rest lines)` binds all the remaining lines to `rows`, discarding the header.
- `(map (fn [row] ...) rows)` applies an anonymous function to every string in the `rows` list.
- Inside the anonymous function: `(str/split row #",")` splits the current data row into values.
- `(map keyword header)` converts the list of string headers into Clojure keywords (`:date`, `:region`, etc.).
- `(zipmap ... ...)` takes the keywords and the string values and merges them into a single map map for that row. `zipmap` pairs the first keyword with the first value, the second with the second, and so on.

If we run `(first raw-records)` in a REPL:
```clojure
; => {:date "2024-01-15", :region "North", :product "Widget-A", :quantity "100", :unit_price "9.99"}
```


## Concept Unit: Parsing and cleaning records

### The Problem
The output of `parse-csv` gives us maps, but every value is still a string. `quantity` is `"100"` and `unit_price` is `"9.99"`. We cannot do math on strings. We also want to compute the total revenue for each line right away, and we want to normalize the key `:unit_price` to the idiomatic Clojure `:unit-price` (hyphen instead of underscore).

### Throwaway Lab
Let's see Java interop parsing in isolation.

```clojure
(def q (Integer/parseInt "100"))
(def p (Double/parseDouble "9.99"))

(println q)
;; => 100
(println p)
;; => 9.99
(println (* q p))
;; => 999.0
```
This output proves that `Integer/parseInt` and `Double/parseDouble` take strings and return actual numeric primitives that the `*` function can multiply. 

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj`
- **Change type:** Add
- **Location:** Below `raw-records`.
- **Dependencies:** None.

### The New Code
```clojure
(defn parse-record [{:keys [date region product quantity unit_price]}]
  {:date       date
   :region     region
   :product    product
   :quantity   (Integer/parseInt quantity)
   :unit-price (Double/parseDouble unit_price)
   :revenue    (* (Integer/parseInt quantity)
                  (Double/parseDouble unit_price))})

(def records (map parse-record raw-records))
```

### The Updated Project
```clojure
(def raw-records (parse-csv raw-csv))

;; ← new
(defn parse-record [{:keys [date region product quantity unit_price]}]
  {:date       date
   :region     region
   :product    product
   :quantity   (Integer/parseInt quantity)
   :unit-price (Double/parseDouble unit_price)
   :revenue    (* (Integer/parseInt quantity)
                  (Double/parseDouble unit_price))})

(def records (map parse-record raw-records))
```
This creates a single-record cleaning function and applies it to the entire dataset, storing the result in `records`.

### Mechanical Walkthrough
- `(defn parse-record [{:keys [date region product quantity unit_price]}] ...)` defines the function and uses **destructuring**. By passing `{:keys [date ...]}` as the parameter, Clojure automatically extracts the values for those keys from the incoming map and binds them to local variables.
- `{:date date ...}` begins constructing the new return map.
- `:quantity (Integer/parseInt quantity)` calls Java's `Integer.parseInt` to convert the string to a number.
- `:unit-price (Double/parseDouble unit_price)` calls Java's `Double.parseDouble` to convert the string to a floating point number. Notice we are outputting under the key `:unit-price` (with a hyphen), standardizing our map.
- `:revenue (* ... ...)` computes a derived field. We parse the strings again and multiply them together.
- `(def records (map parse-record raw-records))` applies this cleaning function to every row in our raw data, producing a clean collection.

If we run `(first records)` in a REPL:
```clojure
; => {:date "2024-01-15", :region "North", :product "Widget-A", :quantity 100, :unit-price 9.99, :revenue 999.0}
```


## Concept Unit: Filtering and selecting

### The Problem
Sometimes we only want to analyze a subset of the data (e.g., high-value transactions), and we don't need every single column to do so. How do we filter out unwanted records and strip away unwanted fields to make the dataset smaller?

### Throwaway Lab
Let's look at `filter` and `select-keys`.

```clojure
(def sample-maps [{:id 1 :val 10 :extra "A"} {:id 2 :val 50 :extra "B"}])
(println (filter #(>= (:val %) 20) sample-maps))
;; => ({:id 2, :val 50, :extra "B"})

(println (select-keys (first sample-maps) [:id :val]))
;; => {:id 1, :val 10}
```
This proves that `filter` keeps only the items where the predicate function returns true, and `select-keys` takes an existing map and returns a new map containing only the requested keys, discarding the rest.

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj`
- **Change type:** Add
- **Location:** Below `records`.
- **Dependencies:** None.

### The New Code
```clojure
; Filter to high-revenue transactions (>= $500):
(def high-value
  (filter #(>= (:revenue %) 500) records))

; Select only needed fields:
(def projected
  (map #(select-keys % [:date :region :product :revenue]) high-value))

(def pipeline-result
  (->> raw-csv
       parse-csv
       (map parse-record)
       (filter #(>= (:revenue %) 500))
       (map #(select-keys % [:date :region :product :revenue]))))
```

### The Updated Project
```clojure
(def records (map parse-record raw-records))

;; ← new
; Filter to high-revenue transactions (>= $500):
(def high-value
  (filter #(>= (:revenue %) 500) records))

; Select only needed fields:
(def projected
  (map #(select-keys % [:date :region :product :revenue]) high-value))

(def pipeline-result
  (->> raw-csv
       parse-csv
       (map parse-record)
       (filter #(>= (:revenue %) 500))
       (map #(select-keys % [:date :region :product :revenue]))))
```
This shows the isolated operations and then demonstrates how to tie the entire sequence together using the threading macro.

### Mechanical Walkthrough
- `(filter #(>= (:revenue %) 500) records)` uses `filter` to keep only the maps where the value at `:revenue` is 500 or greater. The `#(...)` is an anonymous function, and `%` represents the incoming map.
- `(map #(select-keys % [:date :region :product :revenue]) high-value)` iterates over the filtered list. For each map, `select-keys` creates a new, smaller map containing only those four keys.
- `(def pipeline-result (->> raw-csv ...))` combines our whole pipeline so far. The **->> threading macro** takes `raw-csv`, passes it to `parse-csv`, passes that result as the last argument to `(map parse-record ...)`, passes *that* result to `filter`, and finally passes it to the `select-keys` mapping. It avoids massive nesting like `(map ... (filter ... (map ... (parse-csv raw-csv))))`.

If we run `(count high-value)` and `(first projected)` in a REPL:
```clojure
(count high-value)
; => 5

(first projected)
; => {:date "2024-01-15", :region "North", :product "Widget-A", :revenue 999.0}
```


## Concept Unit: Grouping and aggregating with group-by

### The Problem
We have a flat list of sales. We want to know the total revenue per region. This is the equivalent of SQL's `GROUP BY region, SUM(revenue)`. How do we partition our list of maps into buckets based on the `:region` field, and then sum the revenue inside each bucket?

### Throwaway Lab
Let's see what `group-by` outputs.

```clojure
(def tiny-list [{:k "A" :v 1} {:k "B" :v 2} {:k "A" :v 3}])
(println (group-by :k tiny-list))
;; => {"A" [{:k "A", :v 1} {:k "A", :v 3}], "B" [{:k "B", :v 2}]}
```
This output proves that `group-by` takes a function (or keyword acting as a function) and returns a map. The keys are the group names (`"A"`, `"B"`), and the values are vectors containing the original maps that belong in that group.

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(defn revenue-by-region [records]
  (->> records
       (group-by :region)
       (map (fn [[region recs]]
              {:region region
               :total-revenue (reduce + (map :revenue recs))
               :transaction-count (count recs)}))
       (sort-by :total-revenue >)))
```

### The Updated Project
```clojure
(def pipeline-result ...)

;; ← new
(defn revenue-by-region [records]
  (->> records
       (group-by :region)
       (map (fn [[region recs]]
              {:region region
               :total-revenue (reduce + (map :revenue recs))
               :transaction-count (count recs)}))
       (sort-by :total-revenue >)))
```
This function takes a collection of records and returns a sorted summary of revenue rolled up by region.

### Mechanical Walkthrough
- `(->> records ...)` we use threading to stream the data through transformations.
- `(group-by :region)` groups the maps by their `:region` key. The output at this stage is a map like `{"North" [{...} {...}], "South" [{...}]}`.
- `(map (fn [[region recs]] ...) ...)` iterates over the grouped map. When you map over a map, each item is a key-value pair. `[region recs]` is destructuring: it splits the entry so `region` gets the key (`"North"`) and `recs` gets the list of maps for that region.
- `{:region region ...}` builds our new summary map.
- `:total-revenue (reduce + (map :revenue recs))` is the core aggregation. `(map :revenue recs)` plucks out just the revenue numbers for this region. `(reduce + ...)` sums them all together.
- `:transaction-count (count recs)` counts how many records were in the group.
- `(sort-by :total-revenue >)` takes the resulting sequence of summary maps and sorts them by `:total-revenue` in descending order, utilizing the `>` comparator.

If we run `(revenue-by-region records)` in a REPL:
```clojure
; => ({:region "North", :total-revenue 2447.25, :transaction-count 3}
;     {:region "South", :total-revenue 2146.55, :transaction-count 3}
;     {:region "East",  :total-revenue 1447.5,  :transaction-count 2})
```


## Concept Unit: Revenue by product

### The Problem
We need another aggregation: total revenue, total units sold, and average price, broken down by *product* rather than region. This requires grouping by a different key and computing multiple aggregate metrics.

### Throwaway Lab
Since this relies on the exact same `group-by` pattern established in the previous unit, we only need to look at how we calculate an average from a sequence.

```clojure
(def nums [10 20 30])
(println (/ (reduce + nums) (count nums)))
;; => 20
```
This proves that an average is simply the sum (`reduce +`) divided by the count.

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj`
- **Change type:** Add
- **Location:** Below `revenue-by-region`.
- **Dependencies:** None.

### The New Code
```clojure
(defn revenue-by-product [records]
  (->> records
       (group-by :product)
       (map (fn [[product recs]]
              {:product product
               :total-revenue (reduce + (map :revenue recs))
               :total-units   (reduce + (map :quantity recs))
               :avg-price     (/ (reduce + (map :unit-price recs))
                                 (count recs))}))
       (sort-by :total-revenue >)))
```

### The Updated Project
```clojure
(defn revenue-by-region [records] ...)

;; ← new
(defn revenue-by-product [records]
  (->> records
       (group-by :product)
       (map (fn [[product recs]]
              {:product product
               :total-revenue (reduce + (map :revenue recs))
               :total-units   (reduce + (map :quantity recs))
               :avg-price     (/ (reduce + (map :unit-price recs))
                                 (count recs))}))
       (sort-by :total-revenue >)))
```
This creates a parallel aggregation function, demonstrating that the `group-by` + `map` + `reduce` pattern is reusable for any combination of keys and metrics.

### Mechanical Walkthrough
- `(group-by :product)` partitions the records into groups where the key is the product name (e.g., `"Widget-A"`).
- `(fn [[product recs]] ...)` destructures the map entry into the product name and the list of records.
- `:total-revenue` is computed exactly as before.
- `:total-units (reduce + (map :quantity recs))` maps over the records to extract the `:quantity` and sums them.
- `:avg-price (/ (reduce + (map :unit-price recs)) (count recs))` divides the total sum of all unit prices in the group by the number of transactions to find the average price.
- `(sort-by :total-revenue >)` ensures our most lucrative products appear at the top.

If we run `(revenue-by-product records)` in a REPL:
```clojure
; => ({:product "Widget-A", :total-revenue 2944.05, :total-units 295, :avg-price 9.99}
;     {:product "Widget-C", :total-revenue 2147.3,  :total-units 430, :avg-price 4.99}
;     {:product "Widget-B", :total-revenue 1199.4,  :total-units 80,  :avg-price 14.99})
```


## Concept Unit: Printing a summary report

### The Problem
We have computed our summaries, but they exist as raw Clojure data structures in memory. We need to present this data to a human user in the console using formatted strings, which requires iterating over the summaries purely for the side effect of printing them.

### Throwaway Lab
Let's see how `doseq` and `format` behave.

```clojure
(doseq [x [1 2]]
  (println (format "Val: %02d" x)))
;; Prints:
;; Val: 01
;; Val: 02
```
This proves that `doseq` loops over a sequence, executing the body for every item and returning nil. `format` acts like Java's `String.format`, where `%02d` is replaced by the integer padded to two digits.

### Discard the Throwaway Example
This lab is deleted and will not appear in the project again.

### Project Change
- **Reference Source:** No reference counterpart.
- **Files affected:** `src/sales_pipeline/core.clj`
- **Change type:** Add
- **Location:** At the bottom of the file.
- **Dependencies:** None.

### The New Code
```clojure
(defn print-report [records]
  (println "=== SALES SUMMARY ===")
  (println)
  (println "By Region:")
  (doseq [{:keys [region total-revenue transaction-count]} (revenue-by-region records)]
    (println (format "  %-10s $%9.2f (%d transactions)"
                     region total-revenue transaction-count)))
  (println)
  (println "By Product:")
  (doseq [{:keys [product total-revenue total-units]} (revenue-by-product records)]
    (println (format "  %-12s $%9.2f (%d units)"
                     product total-revenue total-units))))
```

### The Updated Project
```clojure
(defn revenue-by-product [records] ...)

;; ← new
(defn print-report [records]
  (println "=== SALES SUMMARY ===")
  (println)
  (println "By Region:")
  (doseq [{:keys [region total-revenue transaction-count]} (revenue-by-region records)]
    (println (format "  %-10s $%9.2f (%d transactions)"
                     region total-revenue transaction-count)))
  (println)
  (println "By Product:")
  (doseq [{:keys [product total-revenue total-units]} (revenue-by-product records)]
    (println (format "  %-12s $%9.2f (%d units)"
                     product total-revenue total-units))))
```
This defines a side-effecting function that runs our aggregation pipelines and prints a formatted text report.

### Mechanical Walkthrough
- `(println "...")` prints static text to standard output.
- `(doseq [{:keys [region total-revenue transaction-count]} (revenue-by-region records)] ...)` loops over the summary maps returned by `revenue-by-region`. The `{:keys [...]}` parameter uses **destructuring** to unpack the keys from each map directly into local bindings on every iteration.
- `(println (format ...))` formats the output.
- `"  %-10s $%9.2f (%d transactions)"` is the format string. `%-10s` means left-justified string, padded to 10 characters. `%9.2f` means a floating-point number, 9 characters wide, with 2 decimal places. `%d` is an integer.
- The second `doseq` performs the identical side-effect loop, but over the data returned by `revenue-by-product`.

If we run `(print-report records)` in a REPL:
```
=== SALES SUMMARY ===

By Region:
  North      $  2447.25 (3 transactions)
  South      $  2146.55 (3 transactions)
  East       $  1447.50 (2 transactions)

By Product:
  Widget-A   $  2944.05 (295 units)
  Widget-C   $  2147.30 (430 units)
  Widget-B   $  1199.40 (80 units)
```

Closing: Part 1 of the capstone built a complete CSV parsing, transformation, grouping, and reporting pipeline in Clojure. Every concept used (maps, keywords, destructuring, `->>` threading, `map`, `filter`, `reduce`, `group-by`, pure functions) appeared in the prior lessons. Part 2 (Lesson 50) adds writing output files, reading from disk, and a command-line interface.
