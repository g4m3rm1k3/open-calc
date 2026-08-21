fun main() {
    val contacts = mutableListOf("Alice", "Bob", "Carol")
    contacts.add("Dave")
    println(contacts)
    for (contact in contacts) {
        println(contact)
    }
}
