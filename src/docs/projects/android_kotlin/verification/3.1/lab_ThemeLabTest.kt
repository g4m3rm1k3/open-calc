package com.example.calculator

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class ThemeLabTest {

    @Test
    fun colorFromHexEqualsColorFromChannels() {
        val fromHex = Color(0xFF1565C0)
        val red = ((0x1565C0 shr 16) and 0xFF) / 255f
        val green = ((0x1565C0 shr 8) and 0xFF) / 255f
        val blue = (0x1565C0 and 0xFF) / 255f
        val fromChannels = Color(red = red, green = green, blue = blue, alpha = 1f)
        assertEquals(fromHex, fromChannels)
    }

    @Test
    fun differentColorsAreNotEqual() {
        assertNotEquals(Color(0xFF1565C0), Color(0xFFFF6F00))
    }

    @Test
    fun textStyleCarriesRealFontSizeAndWeight() {
        val style = TextStyle(fontSize = 48.sp, fontWeight = FontWeight.Light)
        assertEquals(48.sp, style.fontSize)
        assertEquals(FontWeight.Light, style.fontWeight)
    }

    @Test
    fun roundedCornerShapeCarriesRealRadius() {
        val shape = RoundedCornerShape(12.dp)
        // just prove it constructs and is a real, distinct object from a different radius
        val other = RoundedCornerShape(4.dp)
        assertNotEquals(shape, other)
    }
}
