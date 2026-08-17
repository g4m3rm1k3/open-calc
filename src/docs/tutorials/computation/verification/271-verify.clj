;; Lesson 271 (Information-Theoretic Limits) verification script
;; The comparison-sort lower bound: counting outcomes (n!), bits needed to distinguish them (ceil(log2(n!))),
;; measured against a real comparison-counting selection sort.

;; ---- Concept Unit 1: counting outcomes ----

(defn factorial
  [n]
  (if (= n 0)
    1
    (* n (factorial (- n 1)))))

;; ---- Concept Unit 2: bits needed to distinguish that many outcomes ----

(defn power-of-two
  [exponent]
  (if (= exponent 0)
    1
    (* 2 (power-of-two (- exponent 1)))))

(defn bits-needed
  [target exponent]
  (if (>= (power-of-two exponent) target)
    exponent
    (bits-needed target (+ exponent 1))))

(defn min-comparisons-needed
  [n]
  (bits-needed (factorial n) 0))

;; ---- Concept Unit 3: a real comparison-counting selection sort ----

(defn find-min-index
  [v index best-index comparisons]
  (if (= index (count v))
    [best-index comparisons]
    (if (< (get v index) (get v best-index))
      (find-min-index v (+ index 1) index (+ comparisons 1))
      (find-min-index v (+ index 1) best-index (+ comparisons 1)))))

(defn swap-positions
  [v i j]
  (assoc (assoc v i (get v j)) j (get v i)))

(defn selection-sort-continue
  [v position result]
  (selection-sort-from (swap-positions v position (get result 0)) (+ position 1) (get result 1)))

(defn selection-sort-step
  [v position comparisons]
  (selection-sort-continue v position (find-min-index v (+ position 1) position comparisons)))

(defn selection-sort-from
  [v position comparisons]
  (if (= position (count v))
    [v comparisons]
    (selection-sort-step v position comparisons)))

(defn selection-sort-count
  [v]
  (selection-sort-from v 0 0))

;; ---- broken version for "What Breaks": wrong branching-factor assumption ----

(defn power-of-three
  [exponent]
  (if (= exponent 0)
    1
    (* 3 (power-of-three (- exponent 1)))))

(defn bits-needed-broken
  [target exponent]
  (if (>= (power-of-three exponent) target)
    exponent
    (bits-needed-broken target (+ exponent 1))))

(defn min-comparisons-needed-broken
  [n]
  (bits-needed-broken (factorial n) 0))

;; ---- checks ----

(println "factorial 3:" (factorial 3))
(println "factorial 4:" (factorial 4))
(println "factorial 5:" (factorial 5))
(println "factorial 6:" (factorial 6))
(println "factorial 8:" (factorial 8))

(println "min-comparisons-needed 3:" (min-comparisons-needed 3))
(println "min-comparisons-needed 4:" (min-comparisons-needed 4))
(println "min-comparisons-needed 5:" (min-comparisons-needed 5))
(println "min-comparisons-needed 6:" (min-comparisons-needed 6))
(println "min-comparisons-needed 8:" (min-comparisons-needed 8))

(println "selection-sort-count [3 1 2]:" (selection-sort-count [3 1 2]))
(println "selection-sort-count [4 3 2 1]:" (selection-sort-count [4 3 2 1]))
(println "selection-sort-count [5 4 3 2 1]:" (selection-sort-count [5 4 3 2 1]))
(println "selection-sort-count [6 5 4 3 2 1]:" (selection-sort-count [6 5 4 3 2 1]))
(println "selection-sort-count [8 7 6 5 4 3 2 1]:" (selection-sort-count [8 7 6 5 4 3 2 1]))

(println "What Breaks -- min-comparisons-needed-broken 5 (wrong base-3 assumption):" (min-comparisons-needed-broken 5))
(println "What Breaks -- min-comparisons-needed 5 (correct base-2):" (min-comparisons-needed 5))
