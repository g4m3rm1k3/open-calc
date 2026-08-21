fun double(n: Int): Int {
    return n * 2
}

fun main() {
    val transform: (Int) -> Int = ::double
    println(transform(5))
}
