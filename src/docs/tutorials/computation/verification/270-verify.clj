;; Lesson 270 (Randomized Complexity) verification script
;; Freivalds' algorithm: randomized, one-sided-error matrix-product verification, and error amplification.

;; ---- randomness primitives ----

(defn random-bit
  []
  (rand-int 2))

(defn random-vector3
  []
  [(random-bit) (random-bit) (random-bit)])

;; ---- small, fixed-size 3x3 matrix-vector multiply ----

(defn dot3
  [row v]
  (+ (* (get row 0) (get v 0))
     (* (get row 1) (get v 1))
     (* (get row 2) (get v 2))))

(defn matrix-vector-multiply3
  [matrix v]
  [(dot3 (get matrix 0) v)
   (dot3 (get matrix 1) v)
   (dot3 (get matrix 2) v)])

(defn vectors-equal3?
  [v1 v2]
  (if (= (get v1 0) (get v2 0))
    (if (= (get v1 1) (get v2 1))
      (= (get v1 2) (get v2 2))
      false)
    false))

;; ---- Freivalds' single-trial check (Concept Unit 1) ----

(defn freivalds-check
  [a b c v]
  (vectors-equal3? (matrix-vector-multiply3 a (matrix-vector-multiply3 b v)) (matrix-vector-multiply3 c v)))

(defn freivalds-trial
  [a b c]
  (freivalds-check a b c (random-vector3)))

;; ---- exhaustive enumeration over all 8 possible 0/1 vectors, for an exact error count ----

(def all-vectors3
  [[0 0 0] [0 0 1] [0 1 0] [0 1 1] [1 0 0] [1 0 1] [1 1 0] [1 1 1]])

(defn count-catches
  [a b c vectors index caught]
  (if (= index (count vectors))
    caught
    (count-catches a b c vectors (+ index 1)
      (if (freivalds-check a b c (get vectors index))
        caught
        (+ caught 1)))))

;; ---- error amplification via independent repeated trials (Concept Unit 2) ----

(defn freivalds-repeated
  [a b c trials]
  (if (= trials 0)
    true
    (if (freivalds-trial a b c)
      (freivalds-repeated a b c (- trials 1))
      false)))

(defn count-false-accepts
  [a b c trials experiments-remaining accumulated-count]
  (if (= experiments-remaining 0)
    accumulated-count
    (count-false-accepts a b c trials (- experiments-remaining 1)
      (if (freivalds-repeated a b c trials)
        (+ accumulated-count 1)
        accumulated-count))))

;; ---- broken version for "What Breaks": reuse one fixed vector instead of fresh randomness ----

(defn freivalds-repeated-broken
  [a b c v trials]
  (if (= trials 0)
    true
    (if (freivalds-check a b c v)
      (freivalds-repeated-broken a b c v (- trials 1))
      false)))

;; ---- test matrices ----

(def matrix-a [[2 0 1] [1 1 0] [0 3 1]])
(def matrix-b [[1 2 0] [0 1 1] [3 0 2]])

;; ground truth, computed here only to build the test data, not part of the taught algorithm
(defn matrix-multiply3
  [m1 m2]
  [[(+ (* (get (get m1 0) 0) (get (get m2 0) 0)) (* (get (get m1 0) 1) (get (get m2 1) 0)) (* (get (get m1 0) 2) (get (get m2 2) 0)))
    (+ (* (get (get m1 0) 0) (get (get m2 0) 1)) (* (get (get m1 0) 1) (get (get m2 1) 1)) (* (get (get m1 0) 2) (get (get m2 2) 1)))
    (+ (* (get (get m1 0) 0) (get (get m2 0) 2)) (* (get (get m1 0) 1) (get (get m2 1) 2)) (* (get (get m1 0) 2) (get (get m2 2) 2)))]
   [(+ (* (get (get m1 1) 0) (get (get m2 0) 0)) (* (get (get m1 1) 1) (get (get m2 1) 0)) (* (get (get m1 1) 2) (get (get m2 2) 0)))
    (+ (* (get (get m1 1) 0) (get (get m2 0) 1)) (* (get (get m1 1) 1) (get (get m2 1) 1)) (* (get (get m1 1) 2) (get (get m2 2) 1)))
    (+ (* (get (get m1 1) 0) (get (get m2 0) 2)) (* (get (get m1 1) 1) (get (get m2 1) 2)) (* (get (get m1 1) 2) (get (get m2 2) 2)))]
   [(+ (* (get (get m1 2) 0) (get (get m2 0) 0)) (* (get (get m1 2) 1) (get (get m2 1) 0)) (* (get (get m1 2) 2) (get (get m2 2) 0)))
    (+ (* (get (get m1 2) 0) (get (get m2 0) 1)) (* (get (get m1 2) 1) (get (get m2 1) 1)) (* (get (get m1 2) 2) (get (get m2 2) 1)))
    (+ (* (get (get m1 2) 0) (get (get m2 0) 2)) (* (get (get m1 2) 1) (get (get m2 1) 2)) (* (get (get m1 2) 2) (get (get m2 2) 2)))]])

(println "computed A*B (ground truth):" (matrix-multiply3 matrix-a matrix-b))

(def matrix-c-true [[5 4 2] [1 3 1] [3 3 5]])
(def matrix-c-false [[5 4 2] [1 3 1] [3 3 6]])

;; ---- checks ----

(println "freivalds-check A B C-true [1 0 1]:" (freivalds-check matrix-a matrix-b matrix-c-true [1 0 1]))
(println "freivalds-check A B C-true [0 1 1]:" (freivalds-check matrix-a matrix-b matrix-c-true [0 1 1]))
(println "freivalds-check A B C-true [1 1 1]:" (freivalds-check matrix-a matrix-b matrix-c-true [1 1 1]))

(println "count-catches over all 8 vectors, C-true (should be 8, never wrongly flags a true product):"
  (count-catches matrix-a matrix-b matrix-c-true all-vectors3 0 0))
(println "count-catches over all 8 vectors, C-false (how many of the 8 correctly detect the mismatch):"
  (count-catches matrix-a matrix-b matrix-c-false all-vectors3 0 0))

(println "single freivalds-trial samples against C-false (real randomness, run several times):")
(println (freivalds-trial matrix-a matrix-b matrix-c-false))
(println (freivalds-trial matrix-a matrix-b matrix-c-false))
(println (freivalds-trial matrix-a matrix-b matrix-c-false))
(println (freivalds-trial matrix-a matrix-b matrix-c-false))
(println (freivalds-trial matrix-a matrix-b matrix-c-false))

(println "count-false-accepts, C-false, trials=1, 1000 experiments:"
  (count-false-accepts matrix-a matrix-b matrix-c-false 1 1000 0))
(println "count-false-accepts, C-false, trials=5, 1000 experiments:"
  (count-false-accepts matrix-a matrix-b matrix-c-false 5 1000 0))
(println "count-false-accepts, C-false, trials=20, 1000 experiments:"
  (count-false-accepts matrix-a matrix-b matrix-c-false 20 1000 0))

;; find one of the "bad" vectors (one that wrongly reports equal for the false matrix), for the What Breaks demo
(println "freivalds-check per vector against C-false:")
(println "[0 0 0]" (freivalds-check matrix-a matrix-b matrix-c-false [0 0 0]))
(println "[0 0 1]" (freivalds-check matrix-a matrix-b matrix-c-false [0 0 1]))
(println "[0 1 0]" (freivalds-check matrix-a matrix-b matrix-c-false [0 1 0]))
(println "[0 1 1]" (freivalds-check matrix-a matrix-b matrix-c-false [0 1 1]))
(println "[1 0 0]" (freivalds-check matrix-a matrix-b matrix-c-false [1 0 0]))
(println "[1 0 1]" (freivalds-check matrix-a matrix-b matrix-c-false [1 0 1]))
(println "[1 1 0]" (freivalds-check matrix-a matrix-b matrix-c-false [1 1 0]))
(println "[1 1 1]" (freivalds-check matrix-a matrix-b matrix-c-false [1 1 1]))

(println "What Breaks -- freivalds-repeated-broken with fixed bad vector [1 1 0], trials=1:"
  (freivalds-repeated-broken matrix-a matrix-b matrix-c-false [1 1 0] 1))
(println "What Breaks -- freivalds-repeated-broken with fixed bad vector [1 1 0], trials=5:"
  (freivalds-repeated-broken matrix-a matrix-b matrix-c-false [1 1 0] 5))
(println "What Breaks -- freivalds-repeated-broken with fixed bad vector [1 1 0], trials=20:"
  (freivalds-repeated-broken matrix-a matrix-b matrix-c-false [1 1 0] 20))
