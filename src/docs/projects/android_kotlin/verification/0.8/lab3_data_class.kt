class PlainPoint(val x: Int, val y: Int)

data class DataPoint(val x: Int, val y: Int)

fun main() {
    val plainA = PlainPoint(1, 2)
    val plainB = PlainPoint(1, 2)
    println(plainA == plainB)

    val dataA = DataPoint(1, 2)
    val dataB = DataPoint(1, 2)
    println(dataA == dataB)
    println(dataA)
}
