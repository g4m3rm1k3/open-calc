data class Order(val item: String, val quantity: Int, val price: Int)

fun main() {
    val original = Order("Widget", 2, 10)
    val revised = original.copy(quantity = 5)
    println(original)
    println(revised)
    println(original == revised)
}
