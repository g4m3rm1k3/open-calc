fun main() {
    val contacts = mutableListOf("Alice", "Bob", "Carol")
    contacts.add("Dave")
    println(contacts)
    for (contact in contacts) {
        println(contact)
    }
    val phoneBook = mutableMapOf<String, String>()
    phoneBook["Alice"] = "555-0101"
    phoneBook["Bob"] = "555-0102"
    println(phoneBook)
    for (entry in phoneBook) {
        println(entry.key)
        println(entry.value)
    }
}
