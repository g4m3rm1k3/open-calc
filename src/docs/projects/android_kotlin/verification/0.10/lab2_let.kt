fun main() {
    val present: Int? = 5
    val missing: Int? = null
    present?.let { println("Have a value: $it") }
    missing?.let { println("Have a value: $it") }
}
