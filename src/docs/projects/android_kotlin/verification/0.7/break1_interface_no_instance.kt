interface Payment {
    fun pay(amount: Int): String
}

fun main() {
    val payment = Payment()
    println(payment)
}
