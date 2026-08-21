interface Payment {
    fun pay(): String
}

class CreditCard : Payment

fun main() {
    val creditCard = CreditCard()
    println(creditCard.pay())
}
