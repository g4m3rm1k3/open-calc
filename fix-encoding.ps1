# fix-encoding.ps1
# Fixes all UTF-8 mojibake (double-encoded Unicode) in every LA lesson file.
# Run once from the project root: .\fix-encoding.ps1

$dir = "$PSScriptRoot\src\content\linear-algebra"
$files = Get-ChildItem $dir -Filter "la*.js"

function Fix-Moji([string]$text) {

    # ── em-dash — U+2014 (two variants: 0x93 and 0x94 in Win-1252) ──────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x201C)), [string]([char]0x2014))
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x201D)), [string]([char]0x2014))

    # ── en-dash – U+2013 ──────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x2013)), [string]([char]0x2013))

    # ── bullet • U+2022 ───────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x00A2)), [string]([char]0x2022))

    # ── right arrow → U+2192 ─────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2020)+[string]([char]0x2019)), [string]([char]0x2192))

    # ── left arrow ← U+2190 ──────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2020)+[string]([char]0x2DC)), [string]([char]0x2190))

    # ── degree ° U+00B0 ───────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C2)+[string]([char]0x00B0)), [string]([char]0x00B0))

    # ── middle dot · U+00B7 ───────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C2)+[string]([char]0x00B7)), [string]([char]0x00B7))

    # ── × U+00D7 (Ã + em-dash pattern) ──────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C3)+[string]([char]0x2014)), [string]([char]0x00D7))

    # ── squared ² U+00B2 ──────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C2)+[string]([char]0x00B2)), [string]([char]0x00B2))

    # ── cubed ³ U+00B3 ────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C2)+[string]([char]0x00B3)), [string]([char]0x00B3))

    # ── superscript 1 ¹ U+00B9 ────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00C2)+[string]([char]0x00B9)), [string]([char]0x00B9))

    # ── non-breaking space → regular space ───────────────────────────────────
    # (only if it causes display issues; Â followed by U+00A0)
    # skip — NBSP is sometimes intentional

    # ── ≠ U+2260 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2030)+[string]([char]0x00A0)), [string]([char]0x2260))

    # ── ≤ U+2264 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2030)+[string]([char]0x00A4)), [string]([char]0x2264))

    # ── ≥ U+2265 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2030)+[string]([char]0x00A5)), [string]([char]0x2265))

    # ── ≈ U+2248 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x2030)+[string]([char]0x0088)), [string]([char]0x2248))

    # ── √ U+221A ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0088)+[string]([char]0x0161)), [string]([char]0x221A))

    # ── − (minus sign) U+2212 ────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x02C6)+[string]([char]0x2019)), [string]([char]0x2212))

    # ── ∞ U+221E ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0088)+[string]([char]0x009E)), [string]([char]0x221E))

    # ── ∑ U+2211 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0088)+[string]([char]0x2018)), [string]([char]0x2211))

    # ── ∈ U+2208 ──────────────────────────────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0088)+[string]([char]0x0088)), [string]([char]0x2208))

    # ── ‖ (double vertical bar) U+2016 ───────────────────────────────────────
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x201D)+[string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x201D)), [string]([char]0x2016))
    # Single ‖ variant (U+2016 UTF-8: E2 80 96, 0x96 Win = – en-dash U+2013)
    # This collides with en-dash above so skip single form

    # ── ⁻¹ (inverse) ─────────────────────────────────────────────────────────
    $inv_w = [string]([char]0x00E2)+[string]([char]0x0081)+[string]([char]0x00BB)+[string]([char]0x00C2)+[string]([char]0x00B9)
    $text = [regex]::Replace($text, [regex]::Escape($inv_w), [string]([char]0x207B)+[string]([char]0x00B9))

    # ── subscript digits ─────────────────────────────────────────────────────
    # ₀ U+2080
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x201A)+[string]([char]0x20AC)), [string]([char]0x2080))
    # ₁ U+2081
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x201A)+[string]([char]0x201A)), [string]([char]0x2081))
    # Wait - ₁ UTF-8: E2 82 81. 0x82=‚(U+201A), 0x81=ctrl(U+0081)
    # So ₁ = â + ‚(U+201A) + ctrl(U+0081) — but ctrl char might not match cleanly
    # Let me handle ₁ and ₂ via the patterns confirmed working for la1-002:
    # c₁ was fixed as: 'c' + (U+00E2 + U+201A) pattern
    # Actually in la1-002 I used: sub1 = U+00E2 + U+201A (two chars for subscript 1)
    # That seems off. Let me use the known-working patterns from la1-002 (tested):
    # sub1_w = U+00E2 + U+201A  (just two chars, not three)
    # sub2_w = U+00E2 + U+201A + U+201A
    $sub2_w = [string]([char]0x00E2)+[string]([char]0x201A)+[string]([char]0x201A)
    $sub1_w = [string]([char]0x00E2)+[string]([char]0x201A)
    # Replace ₂ prefixed patterns first to avoid partial matches
    foreach ($prefix in @('c','v','u','w','x','a','b','e','i','j','k','n','r','p','q','f','g','h','m','s','t','λ','μ')) {
        $text = [regex]::Replace($text, [regex]::Escape($prefix + $sub2_w), $prefix + [string]([char]0x2082))
        $text = [regex]::Replace($text, [regex]::Escape($prefix + $sub1_w), $prefix + [string]([char]0x2081))
    }
    # Standalone subscripts
    $text = [regex]::Replace($text, [regex]::Escape($sub2_w), [string]([char]0x2082))
    $text = [regex]::Replace($text, [regex]::Escape($sub1_w), [string]([char]0x2081))

    # ── ℝ U+211D ──────────────────────────────────────────────────────────────
    $realR_w = [string]([char]0x00E2)+[string]([char]0x201E)+[string]([char]0x009D)
    $text = [regex]::Replace($text, [regex]::Escape($realR_w), [string]([char]0x211D))

    # ── superscript letters/numbers ──────────────────────────────────────────
    # ⁿ U+207F
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0081)+[string]([char]0x00BF)), [string]([char]0x207F))
    # ⁴ U+2074
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0081)+[string]([char]0x00B4)), [string]([char]0x2074))
    # ⁵ U+2075
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0081)+[string]([char]0x00B5)), [string]([char]0x2075))
    # ⁶ U+2076
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x0081)+[string]([char]0x00B6)), [string]([char]0x2076))
    # ᵢ subscript i U+1D62
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E1)+[string]([char]0x00B5)+[string]([char]0x00A2)), [string]([char]0x1D62))

    # ── Greek letters (theta, sigma, pi, lambda, etc.) ───────────────────────
    # θ U+03B8: Î¸ = U+00CE + U+00B8
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00B8)), [string]([char]0x03B8))
    # Σ U+03A3: Î£ = U+00CE + U+00A3
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00A3)), [string]([char]0x03A3))
    # σ U+03C3: Ïƒ = U+00CF + U+0192
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CF)+[string]([char]0x0192)), [string]([char]0x03C3))
    # λ U+03BB: Î» = U+00CE + U+00BB
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00BB)), [string]([char]0x03BB))
    # μ U+03BC: Î¼ = U+00CE + U+00BC
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00BC)), [string]([char]0x03BC))
    # π U+03C0: Ï€ = U+00CF + U+20AC
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CF)+[string]([char]0x20AC)), [string]([char]0x03C0))
    # α U+03B1: Î± = U+00CE + U+00B1
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00B1)), [string]([char]0x03B1))
    # β U+03B2: Î² = U+00CE + U+00B2
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00B2)), [string]([char]0x03B2))
    # ε U+03B5: Îµ = U+00CE + U+00B5
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CE)+[string]([char]0x00B5)), [string]([char]0x03B5))
    # φ U+03C6: Ï† = U+00CF + U+2020
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CF)+[string]([char]0x2020)), [string]([char]0x03C6))
    # ω U+03C9: Ï‰ = U+00CF + U+2030
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00CF)+[string]([char]0x2030)), [string]([char]0x03C9))

    # ── box-drawing ─ U+2500 in comments ─────────────────────────────────────
    # E2 94 80: â (E2) + " (94=U+201D in Win-1252) + € (80=U+20AC)
    # BUT this collides with em-dash pattern (which is â + € + " order)
    # em-dash: E2 80 94 → â€" (â=E2, €=80, "=94)
    # box:     E2 94 80 → â"€ (â=E2, "=94, €=80)
    # These are different orderings so safe to fix separately:
    $box_w = [string]([char]0x00E2)+[string]([char]0x201D)+[string]([char]0x20AC)
    $text = [regex]::Replace($text, [regex]::Escape($box_w), [string]([char]0x2500))

    # ── left/right quotes that slipped through ────────────────────────────────
    # â€˜ = ' (U+2018 left single quote): E2 80 98 → â€˜ where 0x98=˜(U+02DC)
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x02DC)), [string]([char]0x2018))
    # â€™ = ' (U+2019 right single quote): E2 80 99 → â€™ where 0x99=™(U+2122)
    $text = [regex]::Replace($text, [regex]::Escape([string]([char]0x00E2)+[string]([char]0x20AC)+[string]([char]0x2122)), [string]([char]0x2019))

    return $text
}

$fixed = 0
$skipped = 0

foreach ($f in $files) {
    $original = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
    $patched = Fix-Moji $original
    if ($patched -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $patched, (New-Object System.Text.UTF8Encoding $false))
        Write-Host "  Fixed: $($f.Name)"
        $fixed++
    } else {
        $skipped++
    }
}

Write-Host ""
Write-Host "Done. Files changed: $fixed  |  Already clean: $skipped"
