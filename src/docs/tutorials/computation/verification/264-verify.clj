; ===== throwaway lab: candidate vs search cost =====
(defn sum-throwaway [lst acc]
  (if (empty? lst)
    acc
    (sum-throwaway (rest lst) (+ acc (first lst)))))

(println "sum-throwaway [3 2] 0 =>" (sum-throwaway [3 2] 0))
(println "sum-throwaway [3 7 2 9] 0 =>" (sum-throwaway [3 7 2 9] 0))

; ===== Unit 1: P — the fast verifier =====
(defn sum-counted [lst acc steps]
  (if (empty? lst)
    [acc steps]
    (sum-counted (rest lst) (+ acc (first lst)) (inc steps))))

(defn candidate-sum [candidate]
  (get (sum-counted candidate 0 0) 0))

(defn verify-subset-sum [candidate target]
  (= (candidate-sum candidate) target))

(println "verify-subset-sum [3 9] 12 =>" (verify-subset-sum [3 9] 12))
(println "verify-subset-sum [3 2] 12 =>" (verify-subset-sum [3 2] 12))
(println "sum-counted [3 9] 0 0 =>" (sum-counted [3 9] 0 0))
(println "sum-counted [3 7 2 9 5 1 8 4] 0 0 =>" (sum-counted [3 7 2 9 5 1 8 4] 0 0))

; ===== Unit 2: NP — brute-force search reusing the same verifier =====
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

(println "all-subsets [1 2] =>" (all-subsets [1 2]))
(println "all-subsets [1 2 3] =>" (all-subsets [1 2 3]))
(println "count all-subsets [1 2 3] =>" (count (all-subsets [1 2 3])))

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

; solvable case
(println "brute-force-subset-sum [3 7 2 9] 12 =>" (brute-force-subset-sum [3 7 2 9] 12))

; unreachable-target cases: force full exhaustive search
(println "sum [3 7 2 9] =>" (sum-throwaway [3 7 2 9] 0))
(println "brute-force-subset-sum [3 7 2 9] 22 =>" (brute-force-subset-sum [3 7 2 9] 22))

(println "sum [3 7 2 9 5 1 8 4] =>" (sum-throwaway [3 7 2 9 5 1 8 4] 0))
(println "brute-force-subset-sum [3 7 2 9 5 1 8 4] 40 =>" (brute-force-subset-sum [3 7 2 9 5 1 8 4] 40))

(println "sum [3 7 2 9 5 1] =>" (sum-throwaway [3 7 2 9 5 1] 0))
(println "brute-force-subset-sum [3 7 2 9 5 1] 30 =>" (brute-force-subset-sum [3 7 2 9 5 1] 30))

; ===== what-breaks: incomplete enumeration (drops the "don't include" branch) =====
(defn broken-all-subsets-combine [item rest-subsets]
  (all-subsets-with-item item rest-subsets))

(declare broken-all-subsets)

(defn broken-all-subsets-step [item numbers]
  (broken-all-subsets-combine item (broken-all-subsets (rest numbers))))

(defn broken-all-subsets [numbers]
  (if (empty? numbers)
    [[]]
    (broken-all-subsets-step (first numbers) numbers)))

(println "broken-all-subsets [1 2] =>" (broken-all-subsets [1 2]))

(defn broken-brute-force-subset-sum [numbers target]
  (try-candidates (broken-all-subsets numbers) target 0))

(println "broken-brute-force-subset-sum [3 7 2 9] 12 =>" (broken-brute-force-subset-sum [3 7 2 9] 12))
