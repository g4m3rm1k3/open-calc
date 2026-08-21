fun main() {
    val symbol = "x"
    val description = when (symbol) {
        "+" -> "add"
        "-" -> "subtract"
        else -> "unknown"
    }
    println(description)
}
