enum class Dimension { LENGTH, TIME, MASS, VELOCITY }

sealed class MeasurementUnit(val symbol: String, val dimension: Dimension, val toBaseFactor: Double) {
    data object Meter : MeasurementUnit("m", Dimension.LENGTH, toBaseFactor = 1.0)
    data object Foot : MeasurementUnit("ft", Dimension.LENGTH, toBaseFactor = 0.3048)
    data object Second : MeasurementUnit("s", Dimension.TIME, toBaseFactor = 1.0)
    data object Kilogram : MeasurementUnit("kg", Dimension.MASS, toBaseFactor = 1.0)
    data object MetersPerSecond : MeasurementUnit("m/s", Dimension.VELOCITY, toBaseFactor = 1.0)
}

data class Quantity(val value: Double, val unit: MeasurementUnit)

fun Quantity.convertTo(target: MeasurementUnit): Quantity {
    require(unit.dimension == target.dimension) {
        "Cannot convert ${unit.symbol} to ${target.symbol}: different dimensions"
    }
    val valueInBase = value * unit.toBaseFactor
    val convertedValue = valueInBase / target.toBaseFactor
    return Quantity(convertedValue, target)
}

fun main() {
    val length = Quantity(5.0, MeasurementUnit.Meter)
    val time = Quantity(5.0, MeasurementUnit.Second)
    val velocity = Quantity(5.0, MeasurementUnit.MetersPerSecond)
    println(length == time)
    println(length)
    println(time)
    println(velocity)

    val trackLength = Quantity(100.0, MeasurementUnit.Meter)
    val trackInFeet = trackLength.convertTo(MeasurementUnit.Foot)
    println(trackInFeet)

    val backToMeters = trackInFeet.convertTo(MeasurementUnit.Meter)
    println(backToMeters)

    // illegal: converting length to time
    val bad = trackLength.convertTo(MeasurementUnit.Second)
    println(bad)
}
