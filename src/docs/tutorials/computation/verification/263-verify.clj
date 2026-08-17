; ===== throwaway lab 1: step counting =====
(defn countdown-counted [n steps]
  (if (= n 0)
    steps
    (countdown-counted (- n 1) (inc steps))))

(println "countdown-counted 5 0 =>" (countdown-counted 5 0))
(println "countdown-counted 12 0 =>" (countdown-counted 12 0))

; ===== throwaway lab 2: high-water mark =====
(defn max-of [a b] (if (> a b) a b))

(defn depth-tracked [n depth max-depth]
  (if (= n 0)
    max-depth
    (depth-tracked (- n 1) (+ depth 1) (max-of max-depth (+ depth 1)))))

(println "depth-tracked 5 0 0 =>" (depth-tracked 5 0 0))

; ===== cached core (verified, Lesson 262) =====
(defn pad-tape [tape length]
  (if (>= (count tape) length)
    tape
    (pad-tape (conj tape "_") length)))

(defn read-tape [tape position]
  (if (< position (count tape))
    (get tape position)
    "_"))

(defn write-tape [tape position symbol]
  (assoc (pad-tape tape (inc position)) position symbol))

(defn member? [item collection]
  (if (empty? collection)
    false
    (if (= (first collection) item)
      true
      (member? item (rest collection)))))

(defn matches-transition? [transition state symbol]
  (and (= (get transition 0) state)
       (= (get transition 1) symbol)))

(defn find-transition [transitions state symbol]
  (if (empty? transitions)
    nil
    (if (matches-transition? (first transitions) state symbol)
      (first transitions)
      (find-transition (rest transitions) state symbol))))

(defn verdict-for [state accept-states]
  (if (member? state accept-states)
    "accept"
    "reject"))

; ===== Unit 1: run-tm-counted (new this lesson) =====
(declare run-tm-counted)

(defn run-tm-counted-with-transition [transitions state accept-states tape position fuel steps transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape steps]
    (run-tm-counted transitions
                     (get transition 2)
                     (write-tape tape position (get transition 3))
                     (if (= (get transition 4) "R") (inc position) (dec position))
                     accept-states
                     (dec fuel)
                     (inc steps))))

(defn run-tm-counted [transitions state tape position accept-states fuel steps]
  (if (= fuel 0)
    ["exhausted" state tape steps]
    (run-tm-counted-with-transition transitions state accept-states tape position fuel steps
                                     (find-transition transitions state (read-tape tape position)))))

(def parity-transitions
  [["even" "0" "even" "0" "R"] ["even" "1" "odd" "1" "R"]
   ["odd" "0" "odd" "0" "R"] ["odd" "1" "even" "1" "R"]])

(println "len2 [1 1] =>" (run-tm-counted parity-transitions "even" ["1" "1"] 0 ["even"] 20 0))
(println "len3 [1 1 1] =>" (run-tm-counted parity-transitions "even" ["1" "1" "1"] 0 ["even"] 20 0))
(println "len4 [1 1 1 1] =>" (run-tm-counted parity-transitions "even" ["1" "1" "1" "1"] 0 ["even"] 20 0))
(println "len6 [1 1 1 1 1 1] =>" (run-tm-counted parity-transitions "even" ["1" "1" "1" "1" "1" "1"] 0 ["even"] 20 0))

; ===== Unit 2: run-tm-spaced (new this lesson) =====
(declare run-tm-spaced)

(defn run-tm-spaced-step [transitions transition state accept-states position fuel max-len new-tape]
  (run-tm-spaced transitions
                  (get transition 2)
                  new-tape
                  (if (= (get transition 4) "R") (inc position) (dec position))
                  accept-states
                  (dec fuel)
                  (max-of max-len (count new-tape))))

(defn run-tm-spaced-with-transition [transitions state accept-states tape position fuel max-len transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape max-len]
    (run-tm-spaced-step transitions transition state accept-states position fuel max-len
                         (write-tape tape position (get transition 3)))))

(defn run-tm-spaced [transitions state tape position accept-states fuel max-len]
  (if (= fuel 0)
    ["exhausted" state tape max-len]
    (run-tm-spaced-with-transition transitions state accept-states tape position fuel max-len
                                    (find-transition transitions state (read-tape tape position)))))

(println "space len2 =>" (run-tm-spaced parity-transitions "even" ["1" "1"] 0 ["even"] 20 (count ["1" "1"])))
(println "space len4 =>" (run-tm-spaced parity-transitions "even" ["1" "1" "1" "1"] 0 ["even"] 20 (count ["1" "1" "1" "1"])))
(println "space len6 =>" (run-tm-spaced parity-transitions "even" ["1" "1" "1" "1" "1" "1"] 0 ["even"] 20 (count ["1" "1" "1" "1" "1" "1"])))

; ===== Unit 3: naive vs memoized fibonacci =====
(declare fib-counted-combine)

(defn fib-counted [n]
  (if (< n 2)
    [n 1]
    (fib-counted-combine (fib-counted (- n 1)) (fib-counted (- n 2)))))

(defn fib-counted-combine [left right]
  [(+ (get left 0) (get right 0)) (+ (get left 1) (get right 1) 1)])

(println "fib-counted 10 =>" (fib-counted 10))
(println "fib-counted 15 =>" (fib-counted 15))
(println "fib-counted 20 =>" (fib-counted 20))

(defn memo-lookup [memo n]
  (if (empty? memo)
    nil
    (if (= (get (first memo) 0) n)
      (get (first memo) 1)
      (memo-lookup (rest memo) n))))

(defn memo-fib-store [n value memo steps]
  [value (conj memo [n value]) steps])

(defn memo-fib-finish [n left-value right-result]
  (memo-fib-store n (+ left-value (get right-result 0)) (get right-result 1) (get right-result 2)))

(declare memo-fib)

(defn memo-fib-combine [n left-result]
  (memo-fib-finish n (get left-result 0) (memo-fib (- n 2) (get left-result 1) (get left-result 2))))

(defn memo-fib-base [n memo steps]
  [n (conj memo [n n]) steps])

(defn memo-fib-compute-branch [n memo steps]
  (if (< n 2)
    (memo-fib-base n memo steps)
    (memo-fib-combine n (memo-fib (- n 1) memo steps))))

(defn memo-fib-compute [n memo steps]
  (memo-fib-compute-branch n memo (inc steps)))

(defn memo-fib-lookup-or-compute [n memo steps cached]
  (if (nil? cached)
    (memo-fib-compute n memo steps)
    [cached memo steps]))

(defn memo-fib [n memo steps]
  (memo-fib-lookup-or-compute n memo steps (memo-lookup memo n)))

(println "memo-fib 3 [] 0 =>" (memo-fib 3 [] 0))
(println "memo-fib 10 [] 0 =>" (memo-fib 10 [] 0))
(println "memo-fib 15 [] 0 =>" (memo-fib 15 [] 0))
(println "memo-fib 20 [] 0 =>" (memo-fib 20 [] 0))
(println "memo-fib 20 memo count =>" (count (get (memo-fib 20 [] 0) 1)))

; ===== what-breaks: broken threading (original memo reused for n-2, not memo-after-left) =====
(declare memo-fib-broken)

(defn memo-fib-combine-broken [n original-memo left-result]
  (memo-fib-finish n (get left-result 0) (memo-fib-broken (- n 2) original-memo (get left-result 2))))

(defn memo-fib-compute-branch-broken [n memo steps]
  (if (< n 2)
    (memo-fib-base n memo steps)
    (memo-fib-combine-broken n memo (memo-fib-broken (- n 1) memo steps))))

(defn memo-fib-compute-broken [n memo steps]
  (memo-fib-compute-branch-broken n memo (inc steps)))

(defn memo-fib-lookup-or-compute-broken [n memo steps cached]
  (if (nil? cached)
    (memo-fib-compute-broken n memo steps)
    [cached memo steps]))

(defn memo-fib-broken [n memo steps]
  (memo-fib-lookup-or-compute-broken n memo steps (memo-lookup memo n)))

(println "memo-fib-broken 10 [] 0 =>" (memo-fib-broken 10 [] 0))
(println "memo-fib-broken 15 [] 0 =>" (memo-fib-broken 15 [] 0))
(println "memo-fib-broken 20 [] 0 =>" (memo-fib-broken 20 [] 0))
