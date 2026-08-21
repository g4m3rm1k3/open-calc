interface Payment {
    fun pay(): String
}

class CreditCard : Payment {
    fun pay(): String {
        return "Paid by credit card"
    }
}

fun main() {
    val creditCard = CreditCard()
    println(creditCard.pay())
}
