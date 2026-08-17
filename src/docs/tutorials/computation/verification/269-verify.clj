;; Lesson 269 (Streaming Algorithms) verification script
;; Boyer-Moore majority vote: single-pass, fixed-size state, vs. naive full-storage frequency counting.

;; ---- naive full-storage frequency counting (Concept Unit 1) ----

(defn frequency-of
  [frequencies item]
  (if (get frequencies item)
    (get frequencies item)
    0))

(defn count-into
  [frequencies item]
  (assoc frequencies item (+ (frequency-of frequencies item) 1)))

(defn build-frequencies
  [stream index frequencies]
  (if (= index (count stream))
    frequencies
    (build-frequencies stream (+ index 1) (count-into frequencies (get stream index)))))

;; ---- Boyer-Moore majority-vote candidate finder (Concept Unit 2) ----

(defn majority-apply
  [candidate tally item]
  (if (= tally 0)
    [item 1]
    (if (= item candidate)
      [candidate (+ tally 1)]
      [candidate (- tally 1)])))

(defn majority-step
  [state item]
  (majority-apply (get state 0) (get state 1) item))

(defn stream-majority-candidate
  [stream index state]
  (if (= index (count stream))
    state
    (stream-majority-candidate stream (+ index 1) (majority-step state (get stream index)))))

(defn find-majority-candidate
  [stream]
  (get (stream-majority-candidate stream 0 [nil 0]) 0))

;; ---- certificate / verification pass (Concept Unit 3) ----

(defn matches-step
  [matches candidate item]
  (if (= item candidate)
    (+ matches 1)
    matches))

(defn count-matches
  [stream index candidate matches]
  (if (= index (count stream))
    matches
    (count-matches stream (+ index 1) candidate (matches-step matches candidate (get stream index)))))

(defn is-majority?
  [stream candidate]
  (> (* 2 (count-matches stream 0 candidate 0)) (count stream)))

;; ---- broken version for "What Breaks" ----

(defn majority-apply-broken
  [candidate tally item]
  (if (= tally 0)
    [candidate 1]
    (if (= item candidate)
      [candidate (+ tally 1)]
      [candidate (- tally 1)])))

(defn majority-step-broken
  [state item]
  (majority-apply-broken (get state 0) (get state 1) item))

(defn stream-majority-candidate-broken
  [stream index state]
  (if (= index (count stream))
    state
    (stream-majority-candidate-broken stream (+ index 1) (majority-step-broken state (get stream index)))))

(defn find-majority-candidate-broken
  [stream]
  (get (stream-majority-candidate-broken stream 0 [nil 0]) 0))

;; ---- streams ----

(def majority-stream ["a" "b" "a" "a" "c" "a" "a"])
(def balanced-stream ["a" "a" "b" "b" "c" "c"])
(def all-distinct-stream ["a" "b" "c" "d" "e"])

;; ---- checks ----

(println "Unit 1 -- build-frequencies majority-stream:" (build-frequencies majority-stream 0 {}))
(println "Unit 1 -- count of that map:" (count (build-frequencies majority-stream 0 {})))
(println "Unit 1 -- build-frequencies all-distinct-stream:" (build-frequencies all-distinct-stream 0 {}))
(println "Unit 1 -- count of that map:" (count (build-frequencies all-distinct-stream 0 {})))
(println "Unit 1 -- count of all-distinct-stream itself:" (count all-distinct-stream))

(println "Unit 2 -- find-majority-candidate majority-stream:" (find-majority-candidate majority-stream))
(println "Unit 2 -- stream-majority-candidate majority-stream full state:" (stream-majority-candidate majority-stream 0 [nil 0]))
(println "Unit 2 -- find-majority-candidate balanced-stream:" (find-majority-candidate balanced-stream))
(println "Unit 2 -- stream-majority-candidate balanced-stream full state:" (stream-majority-candidate balanced-stream 0 [nil 0]))

(println "Unit 3 -- is-majority? majority-stream \"a\":" (is-majority? majority-stream "a"))
(println "Unit 3 -- count-matches majority-stream \"a\":" (count-matches majority-stream 0 "a" 0))
(println "Unit 3 -- is-majority? balanced-stream \"c\":" (is-majority? balanced-stream "c"))
(println "Unit 3 -- count-matches balanced-stream \"c\":" (count-matches balanced-stream 0 "c" 0))

(println "What Breaks -- find-majority-candidate-broken majority-stream:" (find-majority-candidate-broken majority-stream))
(println "What Breaks -- stream-majority-candidate-broken majority-stream full state:" (stream-majority-candidate-broken majority-stream 0 [nil 0]))
