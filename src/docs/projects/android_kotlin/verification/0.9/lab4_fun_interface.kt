fun interface Transformer {
    fun transform(value: Int): Int
}

fun main() {
    val doubler: Transformer = Transformer { value -> value * 2 }
    println(doubler.transform(5))
}
