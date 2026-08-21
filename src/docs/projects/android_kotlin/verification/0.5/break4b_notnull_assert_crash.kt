fun add(a: Int, b: Int) = a + b

fun main() {
    val operandB: Int? = null
    println(add(2, operandB!!))
}
