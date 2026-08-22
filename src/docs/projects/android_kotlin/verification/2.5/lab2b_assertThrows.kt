import org.junit.Assert.assertThrows

fun divideByZero(): Int = 5 / 0

fun main() {
    assertThrows(ArithmeticException::class.java) {
        divideByZero()
    }
    println("assertThrows caught it - no exception escaped main()")
}
