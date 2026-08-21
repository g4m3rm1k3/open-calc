class Counter(var count: Int)

fun main() {
    val counterA = Counter(5)
    val counterB = Counter(100)
    println(counterA.count)
    println(counterB.count)
    counterA.count = 6
    println(counterA.count)
    println(counterB.count)
}
