enum class Dimension { LENGTH, TIME, MASS, VELOCITY }

sealed class Unit(val symbol: String, val dimension: Dimension)
data object Meter : Unit("m", Dimension.LENGTH)
data object Second : Unit("s", Dimension.TIME)
data object MetersPerSecond : Unit("m/s", Dimension.VELOCITY)

data class Quantity(val value: Double, val unit: Unit)

fun main() {
    val length = Quantity(5.0, Meter)
    val time = Quantity(5.0, Second)
    val velocity = Quantity(5.0, MetersPerSecond)
    println(length == time)
    println(length)
    println(time)
    println(velocity)
}
