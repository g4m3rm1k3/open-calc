fun main() {
    val symbol = "*"
    val description = when (symbol) {
        "+" -> "add"
        "-" -> "subtract"
        "*" -> "multiply"
        else -> "unknown"
    }
    println(description)
}
