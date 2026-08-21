fun main() {
    val numbers = listOf(1, 2, 3, 4, 5, 6)
    val doubled = numbers.map { n -> n * 2 }
    println(doubled)
    val large = numbers.filter { n -> n > 3 }
    println(large)
}
