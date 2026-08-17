;; restated from Lesson 266, unchanged
(defn touches?
  [vertex edge]
  (or (= vertex (get edge 0)) (= vertex (get edge 1))))

(defn keep-edge
  [edge rest-result]
  (assoc rest-result (count rest-result) edge))

(defn remove-covered-edges
  [vertex edges]
  (cond
    (empty? edges) []
    (touches? vertex (first edges)) (remove-covered-edges vertex (rest edges))
    true (keep-edge (first edges) (remove-covered-edges vertex (rest edges)))))

(def cycle-edges [["a" "b"] ["b" "c"] ["c" "d"] ["d" "e"] ["e" "a"]])

;; ---- Concept Unit 1: bounded search tree, parameterized by k ----

(defn vertex-cover-exists?
  [edges k]
  (cond
    (empty? edges) true
    (= k 0) false
    true (or (vertex-cover-exists? (remove-covered-edges (get (first edges) 0) edges) (dec k))
             (vertex-cover-exists? (remove-covered-edges (get (first edges) 1) edges) (dec k)))))

(println "cover of size <= 3 exists?" (vertex-cover-exists? cycle-edges 3))
(println "cover of size <= 2 exists?" (vertex-cover-exists? cycle-edges 2))
(println "cover of size <= 4 exists?" (vertex-cover-exists? cycle-edges 4))
(println "cover of size <= 0 exists? (no edges case sanity)" (vertex-cover-exists? [] 0))

;; ---- Concept Unit 2: parameter vs input size, real numbers ----

(defn power-of-two
  [n]
  (cond
    (= n 0) 1
    true (* 2 (power-of-two (dec n)))))

(println "2^3 =" (power-of-two 3))
(println "2^10 =" (power-of-two 10))
(println "2^40 =" (power-of-two 40))
(println "2^60 =" (power-of-two 60))

;; what breaks: flip the k=0 base case to true instead of false
(defn broken-vertex-cover-exists?
  [edges k]
  (cond
    (empty? edges) true
    (= k 0) true
    true (or (broken-vertex-cover-exists? (remove-covered-edges (get (first edges) 0) edges) (dec k))
             (broken-vertex-cover-exists? (remove-covered-edges (get (first edges) 1) edges) (dec k)))))

(println "BROKEN: cover of size <= 2 exists?" (broken-vertex-cover-exists? cycle-edges 2))
