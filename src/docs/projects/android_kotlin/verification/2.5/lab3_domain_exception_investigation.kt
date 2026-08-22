class DivisionByZeroError(message: String) : Exception(message)

fun main() {
    try {
        throw DivisionByZeroError("Cannot divide by zero")
    } catch (error: DivisionByZeroError) {
        println("Caught: ${error.message}")
    }
}
