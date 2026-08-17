(defn cheaper-of [a b]
  (if (< a b) a b))

(defn offline-optimal-ski-cost [total-days buy-cost rent-cost]
  (cheaper-of (* total-days rent-cost) buy-cost))

(defn decide-buy? [spent-so-far buy-cost rent-cost]
  (>= (+ spent-so-far rent-cost) buy-cost))

(declare ski-rental-simulate)

(defn ski-rental-day [state buy-cost rent-cost]
  (if (get state 1)
    state
    (if (decide-buy? (get state 0) buy-cost rent-cost)
      [(+ (get state 0) buy-cost) true]
      [(+ (get state 0) rent-cost) false])))

(defn ski-rental-simulate [day total-days state buy-cost rent-cost]
  (if (> day total-days)
    state
    (ski-rental-simulate (+ day 1) total-days (ski-rental-day state buy-cost rent-cost) buy-cost rent-cost)))

(defn ski-rental-cost [total-days buy-cost rent-cost]
  (get (ski-rental-simulate 1 total-days [0 false] buy-cost rent-cost) 0))

(defn competitive-ratio [total-days buy-cost rent-cost]
  (/ (ski-rental-cost total-days buy-cost rent-cost) (offline-optimal-ski-cost total-days buy-cost rent-cost)))

(defn always-rent-cost [total-days rent-cost]
  (* total-days rent-cost))

(println "-- offline-optimal-ski-cost --")
(println "n=5" (offline-optimal-ski-cost 5 10 1))
(println "n=9" (offline-optimal-ski-cost 9 10 1))
(println "n=10" (offline-optimal-ski-cost 10 10 1))
(println "n=100" (offline-optimal-ski-cost 100 10 1))

(println "-- ski-rental-cost (online break-even) --")
(println "n=1" (ski-rental-cost 1 10 1))
(println "n=5" (ski-rental-cost 5 10 1))
(println "n=9" (ski-rental-cost 9 10 1))
(println "n=10" (ski-rental-cost 10 10 1))
(println "n=11" (ski-rental-cost 11 10 1))
(println "n=20" (ski-rental-cost 20 10 1))
(println "n=100" (ski-rental-cost 100 10 1))

(println "-- competitive-ratio table --")
(println "n=1" (competitive-ratio 1 10 1))
(println "n=5" (competitive-ratio 5 10 1))
(println "n=9" (competitive-ratio 9 10 1))
(println "n=10" (competitive-ratio 10 10 1))
(println "n=11" (competitive-ratio 11 10 1))
(println "n=20" (competitive-ratio 20 10 1))
(println "n=1000" (competitive-ratio 1000 10 1))

(println "-- what breaks: always-rent has no bound --")
(println "n=100 always-rent" (always-rent-cost 100 1) "offline" (offline-optimal-ski-cost 100 10 1) "ratio" (/ (always-rent-cost 100 1) (offline-optimal-ski-cost 100 10 1)))
(println "n=1000 always-rent" (always-rent-cost 1000 1) "offline" (offline-optimal-ski-cost 1000 10 1) "ratio" (/ (always-rent-cost 1000 1) (offline-optimal-ski-cost 1000 10 1)))
(println "n=10000 always-rent" (always-rent-cost 10000 1) "offline" (offline-optimal-ski-cost 10000 10 1) "ratio" (/ (always-rent-cost 10000 1) (offline-optimal-ski-cost 10000 10 1)))
