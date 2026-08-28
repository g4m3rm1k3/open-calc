data class LineItem(val product: String, val quantity: Int)
data class Order(val id: String, val items: List<LineItem>)

fun main() {
    val a = Order("o1", listOf(LineItem("Widget", 2), LineItem("Gadget", 1)))
    val b = Order("o1", listOf(LineItem("Widget", 2), LineItem("Gadget", 1)))
    println(a == b)
    println(a)
    val total = a.items.sumOf { it.quantity }
    println(total)
}
