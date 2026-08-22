fun main() {
    val amount = 0
    val result = try {
        (10 / amount).toString()
    } catch (error: ArithmeticException) {
        "Error"
    }
    println("Result: $result")
}
