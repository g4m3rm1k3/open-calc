class Counter(var count: Int)

fun main() {
    val counter = Counter(0).apply {
        count = 10
        println("Counter set up with count = $count")
    }
    println(counter.count)
}
