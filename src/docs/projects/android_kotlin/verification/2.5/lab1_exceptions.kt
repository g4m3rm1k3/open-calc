fun main() {
    try {
        val result = 5 / 0
        println("Result: $result")
    } catch (error: ArithmeticException) {
        println("Caught: ${error.message}")
    }
}
