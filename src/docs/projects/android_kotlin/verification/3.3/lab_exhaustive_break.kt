sealed class LabResult
data class LabSuccess(val value: Int) : LabResult()
object LabFailure : LabResult()

fun describe(result: LabResult): String = when (result) {
    is LabSuccess -> "Got ${result.value}"
}
