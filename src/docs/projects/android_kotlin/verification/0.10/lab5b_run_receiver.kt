data class Item(val name: String, val price: Int)

fun main() {
    val item = Item("Widget", 10)
    val summary = item.run {
        "$name costs $price"
    }
    println(summary)
}
