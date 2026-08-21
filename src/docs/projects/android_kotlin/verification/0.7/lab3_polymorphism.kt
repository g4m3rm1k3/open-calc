interface Payment {
    fun pay(): String
}

class CreditCard : Payment {
    override fun pay(): String {
        return "Paid by credit card"
    }
}

class PayPal : Payment {
    override fun pay(): String {
        return "Paid by PayPal"
    }
}

class Cash : Payment {
    override fun pay(): String {
        return "Paid by cash"
    }
}

fun processPayment(payment: Payment) {
    println(payment.pay())
}

fun main() {
    processPayment(CreditCard())
    processPayment(PayPal())
    processPayment(Cash())
}
