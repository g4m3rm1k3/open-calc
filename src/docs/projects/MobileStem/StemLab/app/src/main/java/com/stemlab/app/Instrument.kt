package com.stemlab.app

data class Instrument(
    val id: String,
    val label: String,
    val description: String,
    val requiredFeature: String
)

object InstrumentCatalog {
    val all = listOf(
        Instrument(
            id = "accelerometer",
            label = "Accelerometer",
            description = "Measures acceleration along three axes.",
            requiredFeature = "android.hardware.sensor.accelerometer"
        ),
        Instrument(
            id = "gyroscope",
            label = "Gyroscope",
            description = "Measures rotation rate along three axes.",
            requiredFeature = "android.hardware.sensor.gyroscope"
        ),
        Instrument(
            id = "microphone",
            label = "Microphone",
            description = "Captures audio for signal analysis.",
            requiredFeature = "android.hardware.microphone"
        ),
        Instrument(
            id = "gps",
            label = "GPS",
            description = "Reports geographic position.",
            requiredFeature = "android.hardware.location.gps"
        ),
        Instrument(
            id = "camera",
            label = "Camera",
            description = "Captures images for computer vision.",
            requiredFeature = "android.hardware.camera.any"
        )
    )
}
