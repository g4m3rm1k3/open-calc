;; ---- Concept Unit 1: brute force ----

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

(defn smaller-of
  [a b]
  (cond
    (< a b) a
    true b))

(defn min-cover-size
  [edges vertices]
  (cond
    (empty? edges) 0
    (empty? vertices) 999
    true (smaller-of
          (min-cover-size edges (rest vertices))
          (inc (min-cover-size (remove-covered-edges (first vertices) edges) (rest vertices))))))

(def cycle-edges [["a" "b"] ["b" "c"] ["c" "d"] ["d" "e"] ["e" "a"]])
(def cycle-vertices ["a" "b" "c" "d" "e"])

(println "min-cover-size:" (min-cover-size cycle-edges cycle-vertices))

;; ---- Concept Unit 2: greedy 2-approximation ----

(defn remove-touching-either
  [edge edges]
  (cond
    (empty? edges) []
    (or (touches? (get edge 0) (first edges)) (touches? (get edge 1) (first edges)))
    (remove-touching-either edge (rest edges))
    true (keep-edge (first edges) (remove-touching-either edge (rest edges)))))

(defn append-vertex
  [subset vertex]
  (assoc subset (count subset) vertex))

(defn add-both-endpoints
  [edge cover-so-far]
  (append-vertex (append-vertex cover-so-far (get edge 0)) (get edge 1)))

(defn greedy-vertex-cover
  [edges]
  (cond
    (empty? edges) []
    true (add-both-endpoints (first edges)
                              (greedy-vertex-cover (remove-touching-either (first edges) (rest edges))))))

(def greedy-result (greedy-vertex-cover cycle-edges))
(println "greedy-vertex-cover:" greedy-result)
(println "greedy size:" (count greedy-result))

;; verifier, reusing the certificate-checker framing from Lesson 264

(defn vertex-in-cover?
  [v cover]
  (cond
    (empty? cover) false
    (= v (first cover)) true
    true (vertex-in-cover? v (rest cover))))

(defn edge-covered?
  [edge cover]
  (or (vertex-in-cover? (get edge 0) cover) (vertex-in-cover? (get edge 1) cover)))

(defn all-covered?
  [edges cover]
  (cond
    (empty? edges) true
    (edge-covered? (first edges) cover) (all-covered? (rest edges) cover)
    true false))

(println "greedy cover valid?" (all-covered? cycle-edges greedy-result))

;; matching-disjointness check: which edges did greedy actually pick, in order?
;; picked edge 1 = first cycle-edges entry = ["a" "b"]
;; after removing all edges touching a or b, what's left?
(def after-first-pick (remove-touching-either (first cycle-edges) (rest cycle-edges)))
(println "edges remaining after picking a-b:" after-first-pick)
;; picked edge 2 = first of that remainder
(println "second picked edge:" (first after-first-pick))

(def picked-edge-1 (first cycle-edges))
(def picked-edge-2 (first after-first-pick))
(println "picked edges disjoint?"
         (and (not (touches? (get picked-edge-1 0) picked-edge-2))
              (not (touches? (get picked-edge-1 1) picked-edge-2))))

;; ---- what breaks: only remove the exact picked edge, not all edges touching its endpoints ----

(defn remove-exact-edge
  [edge edges]
  (cond
    (empty? edges) []
    (= edge (first edges)) (remove-exact-edge edge (rest edges))
    true (keep-edge (first edges) (remove-exact-edge edge (rest edges)))))

(defn broken-greedy-vertex-cover
  [edges]
  (cond
    (empty? edges) []
    true (add-both-endpoints (first edges)
                              (broken-greedy-vertex-cover (remove-exact-edge (first edges) (rest edges))))))

(def broken-result (broken-greedy-vertex-cover cycle-edges))
(println "broken greedy cover:" broken-result)
(println "broken greedy size:" (count broken-result))
(println "2 x optimal (bound that should hold):" (* 2 (min-cover-size cycle-edges cycle-vertices)))

;; witness check for the optimal number: does a real 3-vertex set actually cover everything?
(println "witness {a c d} valid cover?" (all-covered? cycle-edges ["a" "c" "d"]))
