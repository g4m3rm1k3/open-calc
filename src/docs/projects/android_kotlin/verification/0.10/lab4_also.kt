data class Item(val name: String, val price: Int)

fun main() {
    val item = Item("Widget", 10).also {
        println("Created: $it")
    }
    println(item.name)
}
