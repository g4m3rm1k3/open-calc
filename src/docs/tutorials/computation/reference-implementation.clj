; Section VI (Lessons 109-138) real, reusable code, extracted in lesson order.
; Generated from each lesson's own fenced `clojure` blocks containing a defn/def form -
; Section VI's own convention is that such blocks are always real/kept, never a discarded
; throwaway (throwaways are shown as bare REPL output, never as a `clojure defn block).
;
; PURPOSE: grep this file to find and copy a prior lesson's real code when a new lesson
; reuses it - instead of opening the old lesson's markdown file. This is what ate real
; session time before this file existed (Lesson 130's dijkstra and Lesson 136's
; assignment-consistent? both had to be hunted down and copied by hand this session).
;
; NOT GUARANTEED TO LOAD STANDALONE END-TO-END: a few early-Section-VI blocks (e.g.
; Lesson 109's worked examples) reference functions from Sections I-V (bst-search,
; Lesson 92) that aren't captured here. When you copy a function out for real reuse,
; also grab its own transitive dependencies the same way this session did - don't
; assume `bb`-ing this whole file will just work.

;; ---- Lesson 109 : 109-what-makes-an-algorithm.md ----
(defn same-output-twice? [tree target]
  (= (bst-search tree target) (bst-search tree target)))

(defn same-output-twice? [tree target]
  (= (bst-search tree target) (bst-search tree target)))

(defn satisfies-search-spec? [tree present-value absent-value]
  (and (= (bst-search tree present-value) present-value)
       (= (bst-search tree absent-value) nil)))

(defn satisfies-search-spec? [tree present-value absent-value]
  (and (= (bst-search tree present-value) present-value)
       (= (bst-search tree absent-value) nil)))

(defn count-new-nodes [old-tree new-tree]
  (if (identical? old-tree new-tree)
    0
    (if (nil? new-tree)
      0
      (+ 1 (count-new-nodes (bst-left old-tree) (bst-left new-tree)) (count-new-nodes (bst-right old-tree) (bst-right new-tree))))))

(defn count-new-nodes [old-tree new-tree]
  (if (identical? old-tree new-tree)
    0
    (if (nil? new-tree)
      0
      (+ 1 (count-new-nodes (bst-left old-tree) (bst-left new-tree)) (count-new-nodes (bst-right old-tree) (bst-right new-tree))))))

(defn incomplete-spec? [tree present-value]
  (= (bst-search tree present-value) present-value))

;; ---- Lesson 110 : 110-specifications-before-algorithms.md ----
(defn valid-input? [values]
  (> (count values) 0))

(defn valid-input? [values]
  (> (count values) 0))

(defn is-member? [values result i]
  (if (>= i (count values))
    false
    (if (= (get values i) result)
      true
      (is-member? values result (+ i 1)))))

(defn all-at-most? [values result i]
  (if (>= i (count values))
    true
    (if (> (get values i) result)
      false
      (all-at-most? values result (+ i 1)))))

(defn is-largest? [values result]
  (and (is-member? values result 0) (all-at-most? values result 0)))

(defn is-largest? [values result]
  (and (is-member? values result 0) (all-at-most? values result 0)))

(defn buggy-find-largest [values]
  (get values 0))

(defn find-largest [values i best]
  (if (>= i (count values))
    best
    (if (> (get values i) best)
      (find-largest values (+ i 1) (get values i))
      (find-largest values (+ i 1) best))))

(defn find-largest-from [values]
  (find-largest values 1 (get values 0)))

(defn find-largest-from [values]
  (find-largest values 1 (get values 0)))

;; ---- Lesson 111 : 111-brute-force.md ----
(defn max-index-from [values i best-i]
  (if (>= i (count values))
    best-i
    (if (> (get values i) (get values best-i))
      (max-index-from values (+ i 1) i)
      (max-index-from values (+ i 1) best-i))))

(defn max-index-from [values i best-i]
  (if (>= i (count values))
    best-i
    (if (> (get values i) (get values best-i))
      (max-index-from values (+ i 1) i)
      (max-index-from values (+ i 1) best-i))))

(defn brute-force-sort-from [values i]
  (if (>= i (count values))
    values
    (brute-force-sort-from (heap-swap values i (max-index-from values i i)) (+ i 1))))

(defn brute-force-sort [values]
  (brute-force-sort-from values 0))

(defn brute-force-sort [values]
  (brute-force-sort-from values 0))

(defn broken-sort-from [values i]
  (if (>= i (count values))
    values
    (broken-sort-from (heap-swap values i (max-index-from values 0 0)) (+ i 1))))

;; ---- Lesson 112 : 112-divide-and-conquer.md ----
(declare dc-max)

(defn dc-max-combine [values low high mid]
  (max (dc-max values low mid) (dc-max values (+ mid 1) high)))

(defn dc-max [values low high]
  (if (= low high)
    (get values low)
    (dc-max-combine values low high (quot (+ low high) 2))))

(defn dc-max [values low high]
  (if (= low high)
    (get values low)
    (dc-max-combine values low high (quot (+ low high) 2))))

;; ---- Lesson 113 : 113-merge-sort.md ----
(defn merge-drain [values src-i src-end k result]
  (if (> src-i src-end)
    result
    (merge-drain values (+ src-i 1) src-end (+ k 1) (assoc result k (get values src-i)))))

(declare merge-from)

(defn merge-take-left [values i mid j high k result]
  (merge-from values (+ i 1) mid j high (+ k 1) (assoc result k (get values i))))

(defn merge-take-right [values i mid j high k result]
  (merge-from values i mid (+ j 1) high (+ k 1) (assoc result k (get values j))))

(defn merge-from [values i mid j high k result]
  (if (> i mid)
    (merge-drain values j high k result)
    (if (> j high)
      (merge-drain values i mid k result)
      (if (<= (get values i) (get values j))
        (merge-take-left values i mid j high k result)
        (merge-take-right values i mid j high k result)))))

(defn merge-ranges [values low mid high]
  (merge-from values low mid (+ mid 1) high low values))

(defn merge-ranges [values low mid high]
  (merge-from values low mid (+ mid 1) high low values))

(declare merge-sort)

(defn merge-sort-combine [values low high mid]
  (merge-ranges (merge-sort (merge-sort values low mid) (+ mid 1) high) low mid high))

(defn merge-sort [values low high]
  (if (>= low high)
    values
    (merge-sort-combine values low high (quot (+ low high) 2))))

(defn merge-sort [values low high]
  (if (>= low high)
    values
    (merge-sort-combine values low high (quot (+ low high) 2))))

(defn broken-combine [values low high mid]
  (merge-ranges values low mid high))

;; ---- Lesson 114 : 114-quick-sort.md ----
(declare partition-from)

(defn partition-step [values pivot-value i j high]
  (if (<= (get values j) pivot-value)
    (partition-from (heap-swap values (+ i 1) j) pivot-value (+ i 1) (+ j 1) high)
    (partition-from values pivot-value i (+ j 1) high)))

(defn partition-from [values pivot-value i j high]
  (if (>= j high)
    [(heap-swap values (+ i 1) high) (+ i 1)]
    (partition-step values pivot-value i j high)))

(defn partition-range [values low high]
  (partition-from values (get values high) (- low 1) low high))

(defn partition-range [values low high]
  (partition-from values (get values high) (- low 1) low high))

(declare quick-sort)

(defn quick-sort-around [partitioned low high]
  (quick-sort (quick-sort (get partitioned 0) low (- (get partitioned 1) 1)) (+ (get partitioned 1) 1) high))

(defn quick-sort [values low high]
  (if (>= low high)
    values
    (quick-sort-around (partition-range values low high) low high)))

(defn quick-sort [values low high]
  (if (>= low high)
    values
    (quick-sort-around (partition-range values low high) low high)))

;; ---- Lesson 115 : 115-selection-algorithms.md ----
(declare quick-select)

(defn quick-select-around [partitioned low high k]
  (if (= (get partitioned 1) k)
    (get (get partitioned 0) k)
    (if (< k (get partitioned 1))
      (quick-select (get partitioned 0) low (- (get partitioned 1) 1) k)
      (quick-select (get partitioned 0) (+ (get partitioned 1) 1) high k))))

(defn quick-select [values low high k]
  (if (= low high)
    (get values low)
    (quick-select-around (partition-range values low high) low high k)))

(defn quick-select [values low high k]
  (if (= low high)
    (get values low)
    (quick-select-around (partition-range values low high) low high k)))

(defn broken-select-around [partitioned low high k]
  (get (quick-sort-around partitioned low high) k))

;; ---- Lesson 117 : 117-greedy-algorithms.md ----
(defn greedy-coins-from [amount denominations i count]
  (if (= amount 0)
    count
    (if (<= (get denominations i) amount)
      (greedy-coins-from (- amount (get denominations i)) denominations i (+ count 1))
      (greedy-coins-from amount denominations (+ i 1) count))))

(defn greedy-coins [amount denominations]
  (greedy-coins-from amount denominations 0 0))

(defn greedy-coins [amount denominations]
  (greedy-coins-from amount denominations 0 0))

;; ---- Lesson 118 : 118-exchange-arguments.md ----
(defn activities-compatible? [prev-end activity]
  (>= (get activity 0) prev-end))

(defn select-activities-from [activities i prev-end selected]
  (if (>= i (count activities))
    selected
    (if (activities-compatible? prev-end (get activities i))
      (select-activities-from activities (+ i 1) (get (get activities i) 1) (+ selected 1))
      (select-activities-from activities (+ i 1) prev-end selected))))

(defn select-activities [activities]
  (select-activities-from activities 1 (get (get activities 0) 1) 1))

(defn select-activities [activities]
  (select-activities-from activities 1 (get (get activities 0) 1) 1))

;; ---- Lesson 119 : 119-dynamic-programming.md ----
(defn min-of-two [a b] (if (< a b) a b))

(defn dp-best-for-amount [dp denominations a i best]
  (if (>= i (count denominations))
    best
    (if (<= (get denominations i) a)
      (dp-best-for-amount dp denominations a (+ i 1) (min-of-two best (+ 1 (get dp (- a (get denominations i))))))
      (dp-best-for-amount dp denominations a (+ i 1) best))))

(defn dp-fill-from [dp denominations a target]
  (if (> a target)
    dp
    (dp-fill-from (assoc dp a (dp-best-for-amount dp denominations a 0 (+ a 1))) denominations (+ a 1) target)))

(defn dp-coins [target denominations]
  (get (dp-fill-from [0] denominations 1 target) target))

(defn dp-coins [target denominations]
  (get (dp-fill-from [0] denominations 1 target) target))

(defn broken-dp-best [dp denominations a]
  (+ 1 (get dp (- a (get denominations 0)))))

;; ---- Lesson 120 : 120-longest-common-subsequence.md ----
(defn zero-row [width j row]
  (if (> j width)
    row
    (zero-row width (+ j 1) (assoc row j 0))))

(defn zero-row [width j row]
  (if (> j width)
    row
    (zero-row width (+ j 1) (assoc row j 0))))

(defn max-of-two [a b] (if (> a b) a b))

(defn lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (max-of-two (get (get dp (- i 1)) j) (get row (- j 1)))))

(defn lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (max-of-two (get (get dp (- i 1)) j) (get row (- j 1)))))

(defn lcs-fill-row [dp x y i j width row]
  (if (> j width)
    (assoc dp i row)
    (lcs-fill-row dp x y i (+ j 1) width (assoc row j (lcs-cell dp row x y i j)))))

(defn lcs-fill-rows [dp x y i height width]
  (if (> i height)
    dp
    (lcs-fill-rows (lcs-fill-row dp x y i 1 width [0]) x y (+ i 1) height width)))

(defn lcs-length [x y]
  (get (get (lcs-fill-rows [(zero-row (count y) 1 [0])] x y 1 (count x) (count y)) (count x)) (count y)))

(defn lcs-length [x y]
  (get (get (lcs-fill-rows [(zero-row (count y) 1 [0])] x y 1 (count x) (count y)) (count x)) (count y)))

(defn broken-lcs-cell [dp row x y i j]
  (if (= (get x (- i 1)) (get y (- j 1)))
    (+ 1 (get (get dp (- i 1)) (- j 1)))
    (get (get dp (- i 1)) j)))

;; ---- Lesson 121 : 121-knapsack.md ----
(defn max-of-two [a b] (if (> a b) a b))

(defn knap-cell [dp weights values i w]
  (if (> (get weights (- i 1)) w)
    (get (get dp (- i 1)) w)
    (max-of-two (get (get dp (- i 1)) w) (+ (get values (- i 1)) (get (get dp (- i 1)) (- w (get weights (- i 1))))))))

(defn knap-cell [dp weights values i w]
  (if (> (get weights (- i 1)) w)
    (get (get dp (- i 1)) w)
    (max-of-two (get (get dp (- i 1)) w) (+ (get values (- i 1)) (get (get dp (- i 1)) (- w (get weights (- i 1))))))))

(defn unbounded-cell [dp weights values w i best]
  (if (>= i (count weights))
    best
    (if (<= (get weights i) w)
      (unbounded-cell dp weights values w (+ i 1) (max-of-two best (+ (get values i) (get dp (- w (get weights i))))))
      (unbounded-cell dp weights values w (+ i 1) best))))

(defn unbounded-fill [dp weights values w capacity]
  (if (> w capacity)
    dp
    (unbounded-fill (assoc dp w (unbounded-cell dp weights values w 0 0)) weights values (+ w 1) capacity)))

(defn unbounded-knapsack [weights values capacity]
  (get (unbounded-fill [0] weights values 1 capacity) capacity))

(defn unbounded-knapsack [weights values capacity]
  (get (unbounded-fill [0] weights values 1 capacity) capacity))

;; ---- Lesson 122 : 122-interval-problems.md ----
(defn intervals-overlap? [current next-interval]
  (<= (get next-interval 0) (get current 1)))

(defn merge-into [current next-interval]
  [(get current 0) (max (get current 1) (get next-interval 1))])

(defn merge-from [intervals i current merged]
  (if (>= i (count intervals))
    (assoc merged (count merged) current)
    (if (intervals-overlap? current (get intervals i))
      (merge-from intervals (+ i 1) (merge-into current (get intervals i)) merged)
      (merge-from intervals (+ i 1) (get intervals i) (assoc merged (count merged) current)))))

(defn merge-intervals [intervals]
  (merge-from intervals 1 (get intervals 0) []))

(defn merge-intervals [intervals]
  (merge-from intervals 1 (get intervals 0) []))

(defn rooms-needed-step [intervals i room-ends max-rooms]
  (if (and (> (count room-ends) 0) (<= (heap-peek room-ends) (get (get intervals i) 0)))
    (rooms-needed-from intervals (+ i 1) (heap-insert (get (heap-extract-min room-ends) 1) (get (get intervals i) 1)) max-rooms)
    (rooms-needed-from intervals (+ i 1) (heap-insert room-ends (get (get intervals i) 1)) (max max-rooms (+ (count room-ends) 1)))))

(defn rooms-needed-from [intervals i room-ends max-rooms]
  (if (>= i (count intervals))
    max-rooms
    (rooms-needed-step intervals i room-ends max-rooms)))

(defn rooms-needed [intervals]
  (rooms-needed-from intervals 0 [] 0))

(defn rooms-needed [intervals]
  (rooms-needed-from intervals 0 [] 0))

(defn broken-rooms-step [intervals i room-ends max-rooms]
  (if (<= (heap-peek room-ends) (get (get intervals i) 0))
    (rooms-needed-from intervals (+ i 1) (heap-insert (get (heap-extract-min room-ends) 1) (get (get intervals i) 1)) max-rooms)
    (rooms-needed-from intervals (+ i 1) (heap-insert room-ends (get (get intervals i) 1)) (max max-rooms (+ (count room-ends) 1)))))

;; ---- Lesson 123 : 123-graphs-as-computational-objects.md ----
(defn empty-adj-at [n i adj]
  (if (>= i n)
    adj
    (empty-adj-at n (+ i 1) (assoc adj i []))))

(defn add-edge-to-adj [adj edge]
  (assoc adj (get edge 0) (assoc (get adj (get edge 0)) (count (get adj (get edge 0))) (get edge 1))))

(defn build-adj-from [adj edges i]
  (if (>= i (count edges))
    adj
    (build-adj-from (add-edge-to-adj adj (get edges i)) edges (+ i 1))))

(defn build-adj [n edges]
  (build-adj-from (empty-adj-at n 0 []) edges 0))

(defn build-adj [n edges]
  (build-adj-from (empty-adj-at n 0 []) edges 0))

(defn empty-matrix-row [n j row]
  (if (>= j n)
    row
    (empty-matrix-row n (+ j 1) (assoc row j 0))))

(defn empty-matrix [n i matrix]
  (if (>= i n)
    matrix
    (empty-matrix n (+ i 1) (assoc matrix i (empty-matrix-row n 0 [])))))

(defn add-weighted-edge [matrix edge]
  (assoc matrix (get edge 0) (assoc (get matrix (get edge 0)) (get edge 1) (get edge 2))))

(defn build-matrix [n edges]
  (build-matrix-from (empty-matrix n 0 []) edges 0))

(defn build-matrix-from [matrix edges i]
  (if (>= i (count edges))
    matrix
    (build-matrix-from (add-weighted-edge matrix (get edges i)) edges (+ i 1))))

(defn build-matrix [n edges]
  (build-matrix-from (empty-matrix n 0 []) edges 0))

(defn broken-build-adj [edges]
  (build-adj-from [] edges 0))

;; ---- Lesson 124 : 124-breadth-first-search.md ----
(defn all-false [n i v]
  (if (>= i n)
    v
    (all-false n (+ i 1) (assoc v i false))))

(defn bfs-continue-step [adj visited q order neighbors i]
  (if (get visited (get neighbors i))
    (bfs-continue adj visited q order neighbors (+ i 1))
    (bfs-continue adj (assoc visited (get neighbors i) true) (enqueue q (get neighbors i)) order neighbors (+ i 1))))

(defn bfs-continue [adj visited q order neighbors i]
  (if (>= i (count neighbors))
    (bfs-loop adj visited q order)
    (bfs-continue-step adj visited q order neighbors i)))

(defn bfs-continue-step [adj visited q order neighbors i]
  (if (get visited (get neighbors i))
    (bfs-continue adj visited q order neighbors (+ i 1))
    (bfs-continue adj (assoc visited (get neighbors i) true) (enqueue q (get neighbors i)) order neighbors (+ i 1))))

(defn bfs-visit [adj visited q order current]
  (bfs-continue adj visited (dequeue q) (assoc order (count order) current) (get adj current) 0))

(defn bfs-loop [adj visited q order]
  (if (and (empty? (queue-in q)) (empty? (queue-out q)))
    order
    (bfs-visit adj visited q order (queue-peek q))))

(defn bfs [adj start n]
  (bfs-loop adj (assoc (all-false n 0 []) start true) (enqueue (make-queue) start) []))

(defn bfs [adj start n]
  (bfs-loop adj (assoc (all-false n 0 []) start true) (enqueue (make-queue) start) []))

(defn broken-continue-step [adj visited q order neighbors i]
  (bfs-continue adj visited (enqueue q (get neighbors i)) order neighbors (+ i 1)))

;; ---- Lesson 125 : 125-depth-first-search.md ----
(defn dfs-visit [adj visited order current]
  (dfs-explore adj (assoc visited current true) (assoc order (count order) current) (get adj current) 0))

(defn dfs-explore [adj visited order neighbors i]
  (if (>= i (count neighbors))
    [visited order]
    (dfs-explore-step adj visited order neighbors i)))

(defn dfs-explore-step [adj visited order neighbors i]
  (if (get visited (get neighbors i))
    (dfs-explore adj visited order neighbors (+ i 1))
    (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i)))

(defn dfs-continue-after [adj visited-and-order neighbors i]
  (dfs-explore adj (get visited-and-order 0) (get visited-and-order 1) neighbors (+ i 1)))

(defn dfs-explore-step [adj visited order neighbors i]
  (if (get visited (get neighbors i))
    (dfs-explore adj visited order neighbors (+ i 1))
    (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i)))

(defn dfs [adj start n]
  (get (dfs-visit adj (all-false n 0 []) [] start) 1))

(defn dfs [adj start n]
  (get (dfs-visit adj (all-false n 0 []) [] start) 1))

(defn broken-explore-step [adj visited order neighbors i]
  (dfs-continue-after adj (dfs-visit adj visited order (get neighbors i)) neighbors i))

;; ---- Lesson 126 : 126-dfs-invariants-and-timestamps.md ----
(declare dfsx-visit)

(defn dfsx-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (dfsx-explore adj state neighbors (+ i 1) current)
    (dfsx-explore adj (dfsx-visit adj state (get neighbors i)) neighbors (+ i 1) current)))

(defn dfsx-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    [(get state 0) (assoc (get state 1) current (get state 2)) (+ (get state 2) 1)]
    (dfsx-explore-step adj state neighbors i current)))

(defn dfsx-visit [adj state current]
  (dfsx-explore adj [(assoc (get state 0) current (get state 2)) (get state 1) (+ (get state 2) 1)] (get adj current) 0 current))

(defn dfsx-visit [adj state current]
  (dfsx-explore adj [(assoc (get state 0) current (get state 2)) (get state 1) (+ (get state 2) 1)] (get adj current) 0 current))

(declare cycle-visit)

(defn cycle-explore-step [adj state neighbors i current]
  (if (get (get state 1) (get neighbors i))
    (cycle-explore adj [(get state 0) (get state 1) true] neighbors (+ i 1) current)
    (if (get (get state 0) (get neighbors i))
      (cycle-explore adj state neighbors (+ i 1) current)
      (cycle-explore adj (cycle-visit adj state (get neighbors i)) neighbors (+ i 1) current))))

(defn cycle-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    state
    (cycle-explore-step adj state neighbors i current)))

(defn cycle-finish [state current]
  [(get state 0) (assoc (get state 1) current false) (get state 2)])

(defn cycle-visit [adj state current]
  (cycle-finish (cycle-explore adj [(assoc (get state 0) current true) (assoc (get state 1) current true) (get state 2)] (get adj current) 0 current) current))

(defn has-cycle? [adj n]
  (get (cycle-visit adj [(all-false n 0 []) (all-false n 0 []) false] 0) 2))

(defn has-cycle? [adj n]
  (get (cycle-visit adj [(all-false n 0 []) (all-false n 0 []) false] 0) 2))

(defn broken-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    [(get state 0) (get state 1) true]
    (cycle-explore adj (cycle-visit adj state (get neighbors i)) neighbors (+ i 1) current)))

;; ---- Lesson 127 : 127-topological-sorting.md ----
(defn reverse-vec-from [v i result]
  (if (< i 0)
    result
    (reverse-vec-from v (- i 1) (assoc result (count result) (get v i)))))

(defn reverse-vec [v]
  (reverse-vec-from v (- (count v) 1) []))

(declare topo-visit)

(defn topo-explore-step [adj state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (topo-explore adj state neighbors (+ i 1) current)
    (topo-explore adj (topo-visit adj state (get neighbors i)) neighbors (+ i 1) current)))

(defn topo-explore [adj state neighbors i current]
  (if (>= i (count neighbors))
    [(get state 0) (assoc (get state 1) (count (get state 1)) current)]
    (topo-explore-step adj state neighbors i current)))

(defn topo-visit [adj state current]
  (topo-explore adj [(assoc (get state 0) current true) (get state 1)] (get adj current) 0 current))

(defn topo-sort [adj n]
  (reverse-vec (get (topo-visit adj [(all-false n 0 []) []] 0) 1)))

(defn topo-sort [adj n]
  (reverse-vec (get (topo-visit adj [(all-false n 0 []) []] 0) 1)))

;; ---- Lesson 128 : 128-connected-components.md ----
(declare comp-visit)

(defn comp-explore-step [adj comp-id state neighbors i current]
  (if (get (get state 0) (get neighbors i))
    (comp-explore adj comp-id state neighbors (+ i 1) current)
    (comp-explore adj comp-id (comp-visit adj comp-id state (get neighbors i)) neighbors (+ i 1) current)))

(defn comp-explore [adj comp-id state neighbors i current]
  (if (>= i (count neighbors))
    state
    (comp-explore-step adj comp-id state neighbors i current)))

(defn comp-visit [adj comp-id state current]
  (comp-explore adj comp-id [(assoc (get state 0) current true) (assoc (get state 1) current comp-id)] (get adj current) 0 current))

(defn comp-find-from [adj state comp-id v n]
  (if (>= v n)
    (get state 1)
    (if (get (get state 0) v)
      (comp-find-from adj state comp-id (+ v 1) n)
      (comp-find-from adj (comp-visit adj comp-id state v) (+ comp-id 1) (+ v 1) n))))

(defn components [adj n]
  (comp-find-from adj [(all-false n 0 []) (all-false n 0 [])] 0 0 n))

(defn components [adj n]
  (comp-find-from adj [(all-false n 0 []) (all-false n 0 [])] 0 0 n))

(defn uf-components-from [parents edges i]
  (if (>= i (count edges))
    parents
    (uf-components-from (uf-union parents (get (get edges i) 0) (get (get edges i) 1)) edges (+ i 1))))

(defn uf-components [n edges]
  (uf-components-from (uf-make n) edges 0))

(defn uf-components [n edges]
  (uf-components-from (uf-make n) edges 0))

;; ---- Lesson 129 : 129-shortest-paths.md ----
(defn path-weight [matrix path i total]
  (if (>= (+ i 1) (count path))
    total
    (path-weight matrix path (+ i 1) (+ total (get (get matrix (get path i)) (get path (+ i 1)))))))

(defn path-weight [matrix path i total]
  (if (>= (+ i 1) (count path))
    total
    (path-weight matrix path (+ i 1) (+ total (get (get matrix (get path i)) (get path (+ i 1)))))))

;; ---- Lesson 130 : 130-dijkstras-algorithm.md ----
(defn min-unvisited [dist finalized v best]
  (if (>= v (count dist))
    best
    (if (get finalized v)
      (min-unvisited dist finalized (+ v 1) best)
      (if (or (= best -1) (< (get dist v) (get dist best)))
        (min-unvisited dist finalized (+ v 1) v)
        (min-unvisited dist finalized (+ v 1) best)))))

(defn relax [matrix dist u v]
  (if (= (get (get matrix u) v) 0)
    dist
    (if (< (+ (get dist u) (get (get matrix u) v)) (get dist v))
      (assoc dist v (+ (get dist u) (get (get matrix u) v)))
      dist)))

(defn relax-all [matrix dist u v n]
  (if (>= v n)
    dist
    (relax-all matrix (relax matrix dist u v) u (+ v 1) n)))

(defn relax [matrix dist u v]
  (if (= (get (get matrix u) v) 0)
    dist
    (if (< (+ (get dist u) (get (get matrix u) v)) (get dist v))
      (assoc dist v (+ (get dist u) (get (get matrix u) v)))
      dist)))

(defn all-infinity [n i v]
  (if (>= i n) v (all-infinity n (+ i 1) (assoc v i 999999))))

(defn dijkstra-extract [matrix dist finalized u n]
  (if (= u -1)
    dist
    (dijkstra-step matrix (relax-all matrix dist u 0 n) (assoc finalized u true) n)))

(defn dijkstra-step [matrix dist finalized n]
  (dijkstra-extract matrix dist finalized (min-unvisited dist finalized 0 -1) n))

(defn dijkstra [matrix source n]
  (dijkstra-step matrix (assoc (all-infinity n 0 []) source 0) (all-false n 0 []) n))

(defn dijkstra [matrix source n]
  (dijkstra-step matrix (assoc (all-infinity n 0 []) source 0) (all-false n 0 []) n))

(defn broken-relax [matrix dist u v discovered)
  (if (or (get discovered v) (= (get (get matrix u) v) 0))
    dist
    (assoc dist v (+ (get dist u) (get (get matrix u) v)))))

;; ---- Lesson 131 : 131-bellman-ford.md ----
(defn bellman-round [matrix dist u n]
  (if (>= u n)
    dist
    (bellman-round matrix (relax-all matrix dist u 0 n) (+ u 1) n)))

(defn bellman-rounds [matrix dist round n]
  (if (>= round (- n 1))
    dist
    (bellman-rounds matrix (bellman-round matrix dist 0 n) (+ round 1) n)))

(defn bellman-ford [matrix source n]
  (bellman-rounds matrix (assoc (all-infinity n 0 []) source 0) 0 n))

(defn bellman-ford [matrix source n]
  (bellman-rounds matrix (assoc (all-infinity n 0 []) source 0) 0 n))

(defn has-negative-cycle? [matrix dist n]
  (not (= dist (bellman-round matrix dist 0 n))))

(defn has-negative-cycle? [matrix dist n]
  (not (= dist (bellman-round matrix dist 0 n))))

;; ---- Lesson 133 : 133-kruskal-and-prim.md ----
(defn kruskal-consider [parents edges i mst]
  (if (uf-connected? parents (get (get edges i) 0) (get (get edges i) 1))
    (kruskal-step parents edges (+ i 1) mst)
    (kruskal-step (uf-union parents (get (get edges i) 0) (get (get edges i) 1)) edges (+ i 1) (assoc mst (count mst) (get edges i)))))

(defn kruskal-step [parents edges i mst]
  (if (>= i (count edges))
    mst
    (kruskal-consider parents edges i mst)))

(defn kruskal [n sorted-edges]
  (kruskal-step (uf-make n) sorted-edges 0 []))

(defn kruskal [n sorted-edges]
  (kruskal-step (uf-make n) sorted-edges 0 []))

(defn prim-min-frontier [key in-tree v best]
  (if (>= v (count key))
    best
    (if (get in-tree v)
      (prim-min-frontier key in-tree (+ v 1) best)
      (if (or (= best -1) (< (get key v) (get key best)))
        (prim-min-frontier key in-tree (+ v 1) v)
        (prim-min-frontier key in-tree (+ v 1) best)))))

(defn prim-update [matrix state in-tree u v]
  (if (= (get (get matrix u) v) 0)
    state
    (if (and (not (get in-tree v)) (< (get (get matrix u) v) (get (get state 0) v)))
      [(assoc (get state 0) v (get (get matrix u) v)) (assoc (get state 1) v u)]
      state)))

(defn prim-update-all [matrix state in-tree u v n]
  (if (>= v n)
    state
    (prim-update-all matrix (prim-update matrix state in-tree u v) in-tree u (+ v 1) n)))

(defn prim [matrix start n]
  (prim-step matrix [(assoc (all-infinity n 0 []) start 0) (all-false n 0 [])] (all-false n 0 []) n))

(defn broken-consider [visited edges i mst]
  (if (and (get visited (get (get edges i) 0)) (get visited (get (get edges i) 1)))
    (kruskal-step visited edges (+ i 1) mst)
    (kruskal-step (assoc (assoc visited (get (get edges i) 0) true) (get (get edges i) 1) true) edges (+ i 1) (assoc mst (count mst) (get edges i)))))

;; ---- Lesson 134 : 134-network-flow.md ----
(defn capacity-ok? [capacity flow u v]
  (<= (get (get flow u) v) (get (get capacity u) v)))

(defn all-capacity-ok? [capacity flow u v n]
  (if (>= u n)
    true
    (if (>= v n)
      (all-capacity-ok? capacity flow (+ u 1) 0 n)
      (if (capacity-ok? capacity flow u v)
        (all-capacity-ok? capacity flow u (+ v 1) n)
        false))))

(defn capacity-ok? [capacity flow u v]
  (<= (get (get flow u) v) (get (get capacity u) v)))

(defn flow-in [flow v u total n]
  (if (>= u n)
    total
    (flow-in flow v (+ u 1) (+ total (get (get flow u) v)) n)))

(defn flow-out [flow v u total n]
  (if (>= u n)
    total
    (flow-out flow v (+ u 1) (+ total (get (get flow v) u)) n)))

(defn conserved? [flow v n]
  (= (flow-in flow v 0 0 n) (flow-out flow v 0 0 n)))

(defn conserved? [flow v n]
  (= (flow-in flow v 0 0 n) (flow-out flow v 0 0 n)))

(defn is-valid-flow? [capacity flow source sink n]
  (and (all-capacity-ok? capacity flow 0 0 n) (all-conserved? flow source sink 0 n)))

;; ---- Lesson 135 : 135-matching.md ----
(def capacity (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [0 4 1] [1 4 1] [2 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))
(def flow (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [1 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))

(def flow (build-matrix 8 [[6 0 1] [6 1 1] [6 2 1] [0 3 1] [1 4 1] [2 5 1] [3 7 1] [4 7 1] [5 7 1]]))

;; ---- Lesson 136 : 136-constraint-satisfaction.md ----
(def domains [["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"]])

(def domains [["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"] ["red" "green" "blue"]])

(def constraints [[0 1] [0 2] [1 2] [1 3] [2 3]])

(defn constraint-satisfied? [assignment pair]
  (not= (get assignment (get pair 0)) (get assignment (get pair 1))))

(defn all-constraints-satisfied? [assignment constraints i]
  (if (>= i (count constraints))
    true
    (if (constraint-satisfied? assignment (get constraints i))
      (all-constraints-satisfied? assignment constraints (+ i 1))
      false)))

(defn constraint-satisfied? [assignment pair]
  (not= (get assignment (get pair 0)) (get assignment (get pair 1))))

(defn pair-consistent? [assignment pair]
  (if (nil? (get assignment (get pair 0)))
    true
    (if (nil? (get assignment (get pair 1)))
      true
      (not= (get assignment (get pair 0)) (get assignment (get pair 1))))))

(defn assignment-consistent? [assignment constraints i]
  (if (>= i (count constraints))
    true
    (if (pair-consistent? assignment (get constraints i))
      (assignment-consistent? assignment constraints (+ i 1))
      false)))

(defn pair-consistent? [assignment pair]
  (if (nil? (get assignment (get pair 0)))
    true
    (if (nil? (get assignment (get pair 1)))
      true
      (not= (get assignment (get pair 0)) (get assignment (get pair 1))))))

;; ---- Lesson 137 : 137-search-pruning-and-heuristics.md ----
(declare solve-from try-candidate try-recursion-result)

(defn try-value [var-index domains constraints assignment value-index]
  (if (>= value-index (count (get domains var-index)))
    nil
    (try-candidate var-index domains constraints assignment value-index
      (assoc assignment var-index (get (get domains var-index) value-index)))))

(defn try-candidate [var-index domains constraints assignment value-index candidate]
  (if (assignment-consistent? candidate constraints 0)
    (try-recursion-result var-index domains constraints assignment value-index
      (solve-from (+ var-index 1) domains constraints candidate))
    (try-value var-index domains constraints assignment (+ value-index 1))))

(defn try-recursion-result [var-index domains constraints assignment value-index result]
  (if (nil? result)
    (try-value var-index domains constraints assignment (+ value-index 1))
    result))

(defn solve-from [var-index domains constraints assignment]
  (if (>= var-index (count domains))
    assignment
    (try-value var-index domains constraints assignment 0)))

(defn solve [domains constraints]
  (solve-from 0 domains constraints [nil nil nil nil]))

(defn solve-from [var-index domains constraints assignment]
  (if (>= var-index (count domains))
    assignment
    (try-value var-index domains constraints assignment 0)))

(declare csolve-from ctry-candidate ctry-recursion-result)

(defn ctry-value [var-index domains constraints assignment value-index visits]
  (if (>= value-index (count (get domains var-index)))
    [nil visits]
    (ctry-candidate var-index domains constraints assignment value-index
      (assoc assignment var-index (get (get domains var-index) value-index)) visits)))

(defn ctry-candidate [var-index domains constraints assignment value-index candidate visits]
  (if (assignment-consistent? candidate constraints 0)
    (ctry-recursion-result var-index domains constraints assignment value-index
      (csolve-from (+ var-index 1) domains constraints candidate (+ visits 1)))
    (ctry-value var-index domains constraints assignment (+ value-index 1) (+ visits 1))))

(defn ctry-recursion-result [var-index domains constraints assignment value-index result-pair]
  (if (nil? (get result-pair 0))
    (ctry-value var-index domains constraints assignment (+ value-index 1) (get result-pair 1))
    result-pair))

(defn csolve-from [var-index domains constraints assignment visits]
  (if (>= var-index (count domains))
    [assignment visits]
    (ctry-value var-index domains constraints assignment 0 visits)))

(defn csolve [domains constraints]
  (csolve-from 0 domains constraints [nil nil nil nil] 0))

(def domains2 [["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"]])

(defn csolve [domains constraints]
  (csolve-from 0 domains constraints [nil nil nil nil] 0))

(def domains5 [["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"] ["red" "blue"]])
(def constraints5 [[0 4] [1 4] [2 4] [3 4] [0 1]])

(declare osolve-from otry-candidate otry-recursion-result)

(defn variable-at-depth [var-order depth] (get var-order depth))

(defn otry-value [depth var-order domains constraints assignment value-index visits]
  (if (>= value-index (count (get domains (variable-at-depth var-order depth))))
    [nil visits]
    (otry-candidate depth var-order domains constraints assignment value-index
      (assoc assignment (variable-at-depth var-order depth)
        (get (get domains (variable-at-depth var-order depth)) value-index)) visits)))

(defn otry-candidate [depth var-order domains constraints assignment value-index candidate visits]
  (if (assignment-consistent? candidate constraints 0)
    (otry-recursion-result depth var-order domains constraints assignment value-index
      (osolve-from (+ depth 1) var-order domains constraints candidate (+ visits 1)))
    (otry-value depth var-order domains constraints assignment (+ value-index 1) (+ visits 1))))

(defn otry-recursion-result [depth var-order domains constraints assignment value-index result-pair]
  (if (nil? (get result-pair 0))
    (otry-value depth var-order domains constraints assignment (+ value-index 1) (get result-pair 1))
    result-pair))

(defn osolve-from [depth var-order domains constraints assignment visits]
  (if (>= depth (count domains))
    [assignment visits]
    (otry-value depth var-order domains constraints assignment 0 visits)))

(defn osolve [var-order domains constraints]
  (osolve-from 0 var-order domains constraints [nil nil nil nil nil] 0))

(defn variable-at-depth [var-order depth] (get var-order depth))

;; ---- Lesson 138 : 138-algorithm-design-workshop.md ----
(defn via-waypoint-cost [matrix source waypoint destination n]
  (+ (get (dijkstra matrix source n) waypoint)
     (get (dijkstra matrix source n) destination)))

(def matrix [[0 1 2 0] [0 0 0 1] [0 0 0 4] [0 0 0 0]])

(defn via-waypoint-cost [matrix source waypoint destination n]
  (+ (get (dijkstra matrix source n) waypoint)
     (get (dijkstra matrix waypoint n) destination)))

;; ---- Section XI backfill (Lessons 231 [partial], 232-235, 238-251) ----
;; Partial, on-demand backfill, not a full re-derivation of 231-239 - added
;; 2026-08-17 while writing Lessons 240-251, which needed matrix-vector-multiply,
;; parallelogram-area, matrix-inverse, and (for 251) point-x/point-y/make-point
;; for real, and they weren't here yet. Only lessons actually opened and read
;; this session are included below. Lesson 231 is PARTIAL - only make-point/
;; point-x/point-y were pulled (251 needed them via vector-from-points);
;; translate-point and the rest of 231 were not copied. Lessons 236, 237 are
;; NOT here at all - not read this session, per this project's zero-old-
;; lesson-file-reads default; don't assume their functions are covered just
;; because neighboring lessons are.

;; ---- Lesson 231 (partial) : 231-coordinate-systems.md ----
(defn make-point [x y] [x y])
(defn point-x [point] (get point 0))
(defn point-y [point] (get point 1))

;; ---- Lesson 232 : 232-vectors.md ----
(defn make-vector [dx dy]
  [dx dy])

(defn vector-dx [v] (get v 0))
(defn vector-dy [v] (get v 1))

(defn vector-from-points [p1 p2]
  (make-vector (- (point-x p2) (point-x p1)) (- (point-y p2) (point-y p1))))

(defn vector-magnitude-squared [v]
  (+ (* (vector-dx v) (vector-dx v)) (* (vector-dy v) (vector-dy v))))

(defn vector-magnitude [v]
  (Math/sqrt (vector-magnitude-squared v)))

;; ---- Lesson 233 : 233-vector-operations.md ----
(defn vector-add [v1 v2]
  (make-vector (+ (vector-dx v1) (vector-dx v2)) (+ (vector-dy v1) (vector-dy v2))))

(defn vector-scale [v k]
  (make-vector (* (vector-dx v) k) (* (vector-dy v) k)))

(defn dot-product [v1 v2]
  (+ (* (vector-dx v1) (vector-dx v2)) (* (vector-dy v1) (vector-dy v2))))

(defn vector-projection [a b]
  (vector-scale b (/ (dot-product a b) (dot-product b b))))

;; ---- Lesson 234 : 234-matrices.md ----
(defn make-matrix [row0 row1]
  [row0 row1])

(defn matrix-row [m index] (get m index))

(defn matrix-vector-multiply [m v]
  (make-vector (dot-product (matrix-row m 0) v) (dot-product (matrix-row m 1) v)))

;; ---- Lesson 235 : 235-matrix-multiplication.md ----
(defn apply-two-transformations [second-matrix first-matrix v]
  (matrix-vector-multiply second-matrix (matrix-vector-multiply first-matrix v)))

(defn matrix-column [m index]
  (make-vector (get (matrix-row m 0) index) (get (matrix-row m 1) index)))

(defn matrix-multiply-row [m2-row m1]
  (make-vector (dot-product m2-row (matrix-column m1 0)) (dot-product m2-row (matrix-column m1 1))))

(defn matrix-multiply [m2 m1]
  (make-matrix (matrix-multiply-row (matrix-row m2 0) m1) (matrix-multiply-row (matrix-row m2 1) m1)))

;; ---- Lesson 238 : 238-determinants.md ----
(defn determinant [m]
  (- (* (get (matrix-row m 0) 0) (get (matrix-row m 1) 1))
     (* (get (matrix-row m 0) 1) (get (matrix-row m 1) 0))))

(defn parallelogram-area [v1 v2]
  (- (* (vector-dx v1) (vector-dy v2)) (* (vector-dx v2) (vector-dy v1))))

;; ---- Lesson 239 : 239-inverses.md ----
(defn matrix-inverse-with-det [m det]
  (make-matrix
    (make-vector (/ (get (matrix-row m 1) 1) det) (/ (- (get (matrix-row m 0) 1)) det))
    (make-vector (/ (- (get (matrix-row m 1) 0)) det) (/ (get (matrix-row m 0) 0) det))))

(defn matrix-inverse [m]
  (matrix-inverse-with-det m (determinant m)))

;; ---- Lesson 240 : 240-eigenvalues-and-eigenvectors.md ----
(defn vectors-parallel? [v1 v2]
  (= (parallelogram-area v1 v2) 0))

(defn zero-vector? [v]
  (= v (make-vector 0 0)))

(defn eigenvector-of? [m v]
  (if (zero-vector? v)
    false
    (vectors-parallel? v (matrix-vector-multiply m v))))

(defn eigenvalue-from-x [v w]
  (/ (vector-dx w) (vector-dx v)))

(defn eigenvalue-from-y [v w]
  (/ (vector-dy w) (vector-dy v)))

(defn eigenvalue-for [m v]
  (if (= (vector-dx v) 0)
    (eigenvalue-from-y v (matrix-vector-multiply m v))
    (eigenvalue-from-x v (matrix-vector-multiply m v))))

;; ---- Lesson 241 : 241-systems-of-linear-equations.md ----
(defn elimination-factor [m]
  (/ (get (matrix-row m 1) 0) (get (matrix-row m 0) 0)))

(defn eliminate [m]
  (make-matrix
    (matrix-row m 0)
    (vector-add (matrix-row m 1) (vector-scale (matrix-row m 0) (- (elimination-factor m))))))

(defn eliminate-b [m b]
  (make-vector
    (vector-dx b)
    (- (vector-dy b) (* (elimination-factor m) (vector-dx b)))))

(defn back-substitute-y [triangular-m eliminated-b]
  (/ (vector-dy eliminated-b) (get (matrix-row triangular-m 1) 1)))

(defn back-substitute-x [m b y]
  (/ (- (vector-dx b) (* (get (matrix-row m 0) 1) y)) (get (matrix-row m 0) 0)))

(defn solve-with-y [m b y]
  (make-vector (back-substitute-x m b y) y))

(defn solve-system [m b]
  (solve-with-y m b (back-substitute-y (eliminate m) (eliminate-b m b))))

;; ---- Lesson 242 : 242-numerical-stability.md ----
(defn relative-error [approx exact]
  (/ (Math/abs (- approx exact)) (Math/abs exact)))

(defn swap-rows [m]
  (make-matrix (matrix-row m 1) (matrix-row m 0)))

(defn swap-b [b]
  (make-vector (vector-dy b) (vector-dx b)))

(defn needs-pivot? [m]
  (> (Math/abs (get (matrix-row m 1) 0)) (Math/abs (get (matrix-row m 0) 0))))

(defn solve-system-pivoted [m b]
  (if (needs-pivot? m)
    (solve-system (swap-rows m) (swap-b b))
    (solve-system m b)))

;; ---- Lesson 243 : 243-affine-geometry.md ----
(defn make-hpoint [x y] [x y 1])
(defn make-hvector [dx dy] [dx dy 0])

(defn hx [h] (get h 0))
(defn hy [h] (get h 1))
(defn hw [h] (get h 2))

(defn make-affine [row0 row1 row2] [row0 row1 row2])
(defn affine-row [a index] (get a index))

(defn dot-product3 [v1 v2]
  (+ (* (get v1 0) (get v2 0)) (* (get v1 1) (get v2 1)) (* (get v1 2) (get v2 2))))

(defn affine-transform [a h]
  [(dot-product3 (affine-row a 0) h) (dot-product3 (affine-row a 1) h) (dot-product3 (affine-row a 2) h)])

(defn translation-matrix [tx ty]
  (make-affine [1 0 tx] [0 1 ty] [0 0 1]))

(defn embed-linear [m]
  (make-affine
    [(get (matrix-row m 0) 0) (get (matrix-row m 0) 1) 0]
    [(get (matrix-row m 1) 0) (get (matrix-row m 1) 1) 0]
    [0 0 1]))

;; ---- Lesson 244 : 244-2d-transformations.md ----
(defn affine-column [a index]
  [(get (affine-row a 0) index) (get (affine-row a 1) index) (get (affine-row a 2) index)])

(defn affine-multiply-row [a2-row a1]
  [(dot-product3 a2-row (affine-column a1 0)) (dot-product3 a2-row (affine-column a1 1)) (dot-product3 a2-row (affine-column a1 2))])

(defn affine-multiply [a2 a1]
  (make-affine
    (affine-multiply-row (affine-row a2 0) a1)
    (affine-multiply-row (affine-row a2 1) a1)
    (affine-multiply-row (affine-row a2 2) a1)))

(defn make-triangle [p1 p2 p3] [p1 p2 p3])
(defn triangle-p1 [tri] (get tri 0))
(defn triangle-p2 [tri] (get tri 1))
(defn triangle-p3 [tri] (get tri 2))

(defn transform-triangle [a tri]
  (make-triangle
    (affine-transform a (triangle-p1 tri))
    (affine-transform a (triangle-p2 tri))
    (affine-transform a (triangle-p3 tri))))

(defn rotate-around-pivot [rotation px py]
  (affine-multiply (translation-matrix px py) (affine-multiply rotation (translation-matrix (- px) (- py)))))

;; ---- Lesson 245 : 245-3d-transformations.md ----
(defn make-hpoint3 [x y z] [x y z 1])
(defn make-hvector3 [dx dy dz] [dx dy dz 0])

(defn hx3 [h] (get h 0))
(defn hy3 [h] (get h 1))
(defn hz3 [h] (get h 2))
(defn hw3 [h] (get h 3))

(defn make-affine3 [row0 row1 row2 row3] [row0 row1 row2 row3])
(defn affine3-row [a index] (get a index))

(defn dot-product4 [v1 v2]
  (+ (* (get v1 0) (get v2 0)) (* (get v1 1) (get v2 1)) (* (get v1 2) (get v2 2)) (* (get v1 3) (get v2 3))))

(defn affine3-transform [a h]
  [(dot-product4 (affine3-row a 0) h) (dot-product4 (affine3-row a 1) h) (dot-product4 (affine3-row a 2) h) (dot-product4 (affine3-row a 3) h)])

(defn translation-matrix3 [tx ty tz]
  (make-affine3 [1 0 0 tx] [0 1 0 ty] [0 0 1 tz] [0 0 0 1]))

(def rotate-z-90 (make-affine3 [0 -1 0 0] [1 0 0 0] [0 0 1 0] [0 0 0 1]))

(defn affine3-column [a index]
  [(get (affine3-row a 0) index) (get (affine3-row a 1) index) (get (affine3-row a 2) index) (get (affine3-row a 3) index)])

(defn affine3-multiply-row [a2-row a1]
  [(dot-product4 a2-row (affine3-column a1 0)) (dot-product4 a2-row (affine3-column a1 1)) (dot-product4 a2-row (affine3-column a1 2)) (dot-product4 a2-row (affine3-column a1 3))])

(defn affine3-multiply [a2 a1]
  (make-affine3
    (affine3-multiply-row (affine3-row a2 0) a1)
    (affine3-multiply-row (affine3-row a2 1) a1)
    (affine3-multiply-row (affine3-row a2 2) a1)
    (affine3-multiply-row (affine3-row a2 3) a1)))

;; ---- Lesson 246 : 246-derivatives.md ----
(defn square [x] (* x x))

(defn average-rate-of-change [f x1 x2]
  (/ (- (f x2) (f x1)) (- x2 x1)))

(defn numerical-derivative [f x h]
  (average-rate-of-change f x (+ x h)))

(defn position [t] (* t t))

;; ---- Lesson 247 : 247-gradients.md ----
(defn bowl [x y] (+ (* x x) (* y y)))

(defn partial-derivative-x [f x y h]
  (/ (- (f (+ x h) y) (f x y)) h))

(defn partial-derivative-y [f x y h]
  (/ (- (f x (+ y h)) (f x y)) h))

(defn gradient [f x y h]
  (make-vector (partial-derivative-x f x y h) (partial-derivative-y f x y h)))

;; ---- Lesson 248 : 248-integrals.md ----
;; riemann-sum-from is real, non-tail recursion: n must stay under ~2000
;; on this machine/bb or it raises a real StackOverflowError (verified
;; 2026-08-17, n=1000 safe, n=2000 crashes). This is documented, not a bug.
(defn identity-fn [x] x)

(declare riemann-sum-from)
(defn riemann-sum [f a b n]
  (riemann-sum-from f a (/ (- b a) n) n 0))

(defn riemann-sum-from [f a dx remaining index]
  (if (= remaining 0)
    0
    (+ (* (f (+ a (* index dx))) dx) (riemann-sum-from f a dx (- remaining 1) (+ index 1)))))

(defn double-x [x] (* 2 x))
(defn velocity [t] (* 2 t))

;; ---- Lesson 249 : 249-optimization.md ----
(defn gradient-descent-step [x y g step-size]
  (make-vector
    (- x (* step-size (vector-dx g)))
    (- y (* step-size (vector-dy g)))))

(defn gradient-descent-step-at [f x y h step-size]
  (gradient-descent-step x y (gradient f x y h) step-size))

(declare gradient-descent-from)
(defn gradient-descent [f x y h step-size iterations]
  (gradient-descent-from f x y h step-size iterations))

(defn gradient-descent-recur [f new-point h step-size remaining]
  (gradient-descent-from f (vector-dx new-point) (vector-dy new-point) h step-size remaining))

(defn gradient-descent-from [f x y h step-size remaining]
  (if (= remaining 0)
    (make-vector x y)
    (gradient-descent-recur f (gradient-descent-step-at f x y h step-size) h step-size (- remaining 1))))

;; ---- Lesson 250 : 250-numerical-optimization.md ----
(defn converged? [f x y h tolerance]
  (< (vector-magnitude (gradient f x y h)) tolerance))

(defn make-descent-result [point did-converge] [point did-converge])
(defn descent-result-point [r] (get r 0))
(defn descent-result-converged? [r] (get r 1))

(declare gradient-descent-until-from)
(defn gradient-descent-until-converged [f x y h step-size tolerance max-iterations]
  (gradient-descent-until-from f x y h step-size tolerance max-iterations))

(defn gradient-descent-until-recur [f new-point h step-size tolerance remaining]
  (gradient-descent-until-from f (vector-dx new-point) (vector-dy new-point) h step-size tolerance remaining))

(defn gradient-descent-until-from [f x y h step-size tolerance remaining]
  (if (converged? f x y h tolerance)
    (make-descent-result (make-vector x y) true)
    (if (= remaining 0)
      (make-descent-result (make-vector x y) false)
      (gradient-descent-until-recur f (gradient-descent-step-at f x y h step-size) h step-size tolerance (- remaining 1)))))

;; ---- Lesson 251 : 251-computational-geometry.md ----
(defn orientation [a b c]
  (parallelogram-area (vector-from-points a b) (vector-from-points a c)))

(defn segments-straddle? [p1 p2 q1 q2]
  (< (* (orientation p1 p2 q1) (orientation p1 p2 q2)) 0))

(defn segments-intersect? [p1 p2 q1 q2]
  (and (segments-straddle? p1 p2 q1 q2) (segments-straddle? q1 q2 p1 p2)))

(defn clamp01 [t]
  (if (< t 0) 0 (if (> t 1) 1 t)))

(defn closest-point-on-segment [a b p]
  (vector-add a (vector-scale (vector-from-points a b) (clamp01 (/ (dot-product (vector-from-points a p) (vector-from-points a b)) (dot-product (vector-from-points a b) (vector-from-points a b)))))))

(defn point-segment-distance [a b p]
  (vector-magnitude (vector-from-points (closest-point-on-segment a b p) p)))

(defn point-in-quad? [q1 q2 q3 q4 p]
  (and
    (>= (orientation q1 q2 p) 0)
    (>= (orientation q2 q3 p) 0)
    (>= (orientation q3 q4 p) 0)
    (>= (orientation q4 q1 p) 0)))

;; ---- Lesson 252 : 252-mathematics-of-simulation.md (Section XI checkpoint) ----
;; [position velocity] state pair, not a spatial vector - Euler-step simulation.
(defn fall-step [state g dt]
  (make-vector
    (+ (vector-dx state) (* (- (vector-dy state) (* g dt)) dt))
    (- (vector-dy state) (* g dt))))

(declare simulate-fall-from)
(defn simulate-fall [height g dt max-steps]
  (simulate-fall-from (make-vector height 0) g dt 0 max-steps))

(defn simulate-fall-from [state g dt elapsed-steps max-steps]
  (if (<= (vector-dx state) 0)
    elapsed-steps
    (if (= max-steps 0)
      elapsed-steps
      (simulate-fall-from (fall-step state g dt) g dt (+ elapsed-steps 1) (- max-steps 1)))))

; ============================================================================
; Section XII (Lessons 253+) VERIFIED CORE - added Lesson 262, 2026-08-17.
;
; DIFFERENT PURPOSE than the rest of this file. Section VI/XI code above is
; cached so a LATER section can reuse it without re-deriving it. This block
; is cached so THIS SAME lesson's own restated core doesn't get re-verified
; via `bb` from scratch every time - because the Repetition Rule requires
; every lesson to restate this interpreter in full in its OWN PROSE, but
; that does not mean the code itself needs a fresh bb run every time it's
; identical to what's already been verified here.
;
; This exact TM interpreter (pad-tape through run-tm) was independently
; built AND independently re-verified via real bb runs in FOUR separate
; sessions - Lessons 259, 260, 261, and 262 - before this cache existed.
; That's real, avoidable session cost the user flagged directly, 2026-08-17:
; "is there a way we can be more efficient verifying? Are you possibly
; verifying the same thing other sessions verified." This block is the fix.
;
; CONVENTION GOING FORWARD: before re-running `bb` on a lesson's restated
; version of this interpreter, diff it against the block below by eye. If
; it's the same logic (function names/internals may legitimately vary
; slightly lesson to lesson), trust the verified outputs recorded below
; instead of re-running bb on the restated portion - spend the real bb run
; on whatever NEW code that lesson actually adds. If the restated version
; is genuinely different (a new field threaded through, different helper
; split), it needs its own fresh bb run - this cache doesn't excuse
; verifying real changes, only re-verifying unchanged code.
;
; Verified test cases (real bb output, Lesson 262 session):
;   Parity machine (states "even"/"odd", start "even", accept ["even"]),
;   transitions [["even" "0" "even" "0" "R"] ["even" "1" "odd" "1" "R"]
;                ["odd" "0" "odd" "0" "R"] ["odd" "1" "even" "1" "R"]],
;   run on tape ["1" "1"], position 0, fuel 20
;     => ["accept" "even" ["1" "1"]]
;
;   Ping-pong machine (states "ping"/"pong", start "ping", accept ["ping"]),
;   transitions [["ping" "_" "pong" "_" "R"] ["pong" "_" "ping" "_" "R"]],
;   run on tape [], position 0, fuel 20
;     => ["exhausted" "ping" [twenty blank cells]]
; ============================================================================

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

(declare run-tm)

(defn run-tm-with-transition [transitions state accept-states tape position fuel transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape]
    (run-tm transitions
            (get transition 2)
            (write-tape tape position (get transition 3))
            (if (= (get transition 4) "R") (inc position) (dec position))
            accept-states
            (dec fuel))))

(defn run-tm [transitions state tape position accept-states fuel]
  (if (= fuel 0)
    ["exhausted" state tape]
    (run-tm-with-transition transitions state accept-states tape position fuel
                             (find-transition transitions state (read-tape tape position)))))

; ---- Lesson 262 ----
; add-print-x-catchall: the reduction's own transformation. Verified this
; session: appended to the parity machine's table, transformed run on
; ["1" "1"] ends ["reject" "PRINTED-X" ["1" "1" "X"]]; appended to the
; ping-pong table, transformed run on [] still exhausts fuel with no "X"
; ever written (append order matters - see Lesson 262's own "What Breaks").

(defn transition-for-state [state]
  [state "_" "PRINTED-X" "X" "R"])

(defn add-print-x-catchall [transitions states]
  (if (empty? states)
    transitions
    (add-print-x-catchall (conj transitions (transition-for-state (first states)))
                           (rest states))))

; ---- Lesson 263 ----
; run-tm-counted/run-tm-spaced: time/space instrumentation on top of the
; cached interpreter above. Verified this session: parity machine, inputs
; of length 2/3/4/6, steps and max tape length both come out equal to
; input length exactly. memo-fib: verified n=10/15/20 -> 11/16/21 real
; computations (n+1 exactly), vs naive fib-counted's 177/1973/21891 calls.

(defn run-tm-counted [transitions state tape position accept-states fuel steps]
  (if (= fuel 0)
    ["exhausted" state tape steps]
    (run-tm-counted-with-transition transitions state accept-states tape position fuel steps
                                     (find-transition transitions state (read-tape tape position)))))

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

(defn max-of [a b] (if (> a b) a b))

(defn run-tm-spaced [transitions state tape position accept-states fuel max-len]
  (if (= fuel 0)
    ["exhausted" state tape max-len]
    (run-tm-spaced-with-transition transitions state accept-states tape position fuel max-len
                                    (find-transition transitions state (read-tape tape position)))))

(defn run-tm-spaced-with-transition [transitions state accept-states tape position fuel max-len transition]
  (if (nil? transition)
    [(verdict-for state accept-states) state tape max-len]
    (run-tm-spaced-step transitions transition state accept-states position fuel max-len
                         (write-tape tape position (get transition 3)))))

(defn run-tm-spaced-step [transitions transition state accept-states position fuel max-len new-tape]
  (run-tm-spaced transitions
                  (get transition 2)
                  new-tape
                  (if (= (get transition 4) "R") (inc position) (dec position))
                  accept-states
                  (dec fuel)
                  (max-of max-len (count new-tape))))

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

