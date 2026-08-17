; ===== reused from Lesson 264 (verified there, restated here for this scratch run) =====
(defn sum-counted [lst acc steps]
  (if (empty? lst)
    [acc steps]
    (sum-counted (rest lst) (+ acc (first lst)) (inc steps))))

(defn candidate-sum [candidate]
  (get (sum-counted candidate 0 0) 0))

(defn verify-subset-sum [candidate target]
  (= (candidate-sum candidate) target))

(defn append-all [target-vec source-vec]
  (if (empty? source-vec)
    target-vec
    (append-all (conj target-vec (first source-vec)) (rest source-vec))))

(defn all-subsets-with-item [item subsets]
  (if (empty? subsets)
    []
    (conj (all-subsets-with-item item (rest subsets)) (conj (first subsets) item))))

(defn all-subsets-combine [item rest-subsets]
  (append-all rest-subsets (all-subsets-with-item item rest-subsets)))

(defn all-subsets [numbers]
  (if (empty? numbers)
    [[]]
    (all-subsets-combine (first numbers) (all-subsets (rest numbers)))))

(declare try-candidates-check)

(defn try-candidates [candidates target tries]
  (if (empty? candidates)
    [false tries]
    (try-candidates-check (first candidates) (rest candidates) target tries)))

(defn try-candidates-check [candidate remaining target tries]
  (if (= (candidate-sum candidate) target)
    [true (inc tries)]
    (try-candidates remaining target (inc tries))))

(defn brute-force-subset-sum [numbers target]
  (try-candidates (all-subsets numbers) target 0))

; ===== throwaway lab: what makes a reduction's own transform "fast enough" =====
(defn append-one-counted [numbers new-item]
  [(conj numbers new-item) 1])

(println "append-one-counted [1 2 3] 9 =>" (append-one-counted [1 2 3] 9))

; ===== Unit 1: Partition, and the reduction that connects it to Subset-Sum =====
(defn partition? [numbers]
  (get (brute-force-subset-sum numbers (/ (candidate-sum numbers) 2)) 0))

(println "partition? [1 2 3] =>" (partition? [1 2 3]))
(println "partition? [1 2 4] =>" (partition? [1 2 4]))
(println "partition? [3 1 4 1 5] =>" (partition? [3 1 4 1 5]))
(println "sum [3 1 4 1 5] =>" (candidate-sum [3 1 4 1 5]))

(defn abs-of [x] (if (< x 0) (- x) x))

(defn reduction-gap [numbers target]
  (abs-of (- (candidate-sum numbers) (* 2 target))))

(defn reduce-subset-sum-to-partition [numbers target]
  (conj numbers (reduction-gap numbers target)))

; yes-instance check
(println "verify-subset-sum [3 9] 12 =>" (verify-subset-sum [3 9] 12))
(println "brute-force-subset-sum [3 7 2 9] 12 =>" (brute-force-subset-sum [3 7 2 9] 12))
(println "reduction-gap [3 7 2 9] 12 =>" (reduction-gap [3 7 2 9] 12))
(println "reduce-subset-sum-to-partition [3 7 2 9] 12 =>" (reduce-subset-sum-to-partition [3 7 2 9] 12))
(println "partition? (reduce ... 12) =>" (partition? (reduce-subset-sum-to-partition [3 7 2 9] 12)))

; no-instance check: is 13 actually unreachable from [3 7 2 9]?
(println "brute-force-subset-sum [3 7 2 9] 13 =>" (brute-force-subset-sum [3 7 2 9] 13))
(println "reduction-gap [3 7 2 9] 13 =>" (reduction-gap [3 7 2 9] 13))
(println "reduce-subset-sum-to-partition [3 7 2 9] 13 =>" (reduce-subset-sum-to-partition [3 7 2 9] 13))
(println "partition? (reduce ... 13) =>" (partition? (reduce-subset-sum-to-partition [3 7 2 9] 13)))

; a t <= S/2 case too, to confirm both derivation branches
(println "brute-force-subset-sum [3 7 2 9] 9 =>" (brute-force-subset-sum [3 7 2 9] 9))
(println "reduction-gap [3 7 2 9] 9 =>" (reduction-gap [3 7 2 9] 9))
(println "reduce-subset-sum-to-partition [3 7 2 9] 9 =>" (reduce-subset-sum-to-partition [3 7 2 9] 9))
(println "partition? (reduce ... 9) =>" (partition? (reduce-subset-sum-to-partition [3 7 2 9] 9)))

; a no-instance for the t <= S/2 branch too
(println "brute-force-subset-sum [3 7 2 9] 4 =>" (brute-force-subset-sum [3 7 2 9] 4))
(println "reduction-gap [3 7 2 9] 4 =>" (reduction-gap [3 7 2 9] 4))
(println "reduce-subset-sum-to-partition [3 7 2 9] 4 =>" (reduce-subset-sum-to-partition [3 7 2 9] 4))
(println "partition? (reduce ... 4) =>" (partition? (reduce-subset-sum-to-partition [3 7 2 9] 4)))

; ===== what-breaks: forgetting the factor of 2 in the gap formula =====
(defn broken-reduction-gap [numbers target]
  (abs-of (- (candidate-sum numbers) target)))

(defn broken-reduce-subset-sum-to-partition [numbers target]
  (conj numbers (broken-reduction-gap numbers target)))

(println "broken-reduction-gap [3 7 2 9] 12 =>" (broken-reduction-gap [3 7 2 9] 12))
(println "broken-reduce ... 12 =>" (broken-reduce-subset-sum-to-partition [3 7 2 9] 12))
(println "partition? (broken-reduce ... 12) =>" (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 12)))
(println "broken-reduction-gap [3 7 2 9] 13 =>" (broken-reduction-gap [3 7 2 9] 13))
(println "partition? (broken-reduce ... 13) =>" (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 13)))
(println "broken-reduction-gap [3 7 2 9] 9 =>" (broken-reduction-gap [3 7 2 9] 9))
(println "partition? (broken-reduce ... 9) =>" (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 9)))
(println "broken-reduction-gap [3 7 2 9] 4 =>" (broken-reduction-gap [3 7 2 9] 4))
(println "partition? (broken-reduce ... 4) =>" (partition? (broken-reduce-subset-sum-to-partition [3 7 2 9] 4)))
