fun add(a: Int, b: Int) = a + b

fun main() {
    val operandA = 6
    val operandB: Int? = null
    val safeOperandB = operandB ?: 0
    println(add(operandA, safeOperandB))
}
