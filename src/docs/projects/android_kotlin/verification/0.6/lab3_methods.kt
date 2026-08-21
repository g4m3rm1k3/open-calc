class Counter(var count: Int) {
    fun increment(amount: Int) {
        count = count + amount
    }
    fun reset() {
        count = 0
    }
}

fun main() {
    val counter = Counter(5)
    val action = "increment"
    when (action) {
        "increment" -> counter.increment(3)
        "reset" -> counter.reset()
    }
    println(counter.count)
}
