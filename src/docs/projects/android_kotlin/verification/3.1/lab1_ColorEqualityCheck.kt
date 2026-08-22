package com.example.calculator

import androidx.compose.ui.graphics.Color
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class ColorEqualityCheck {
    @Test
    fun sameHexProducesEqualColors() {
        assertEquals(Color(0xFF1565C0), Color(0xFF1565C0))
    }

    @Test
    fun differentHexProducesUnequalColors() {
        assertNotEquals(Color(0xFF1565C0), Color(0xFFFF6F00))
    }
}
