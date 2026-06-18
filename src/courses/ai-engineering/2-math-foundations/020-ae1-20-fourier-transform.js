export default {
  id: 'ae-p1-20-fourier-transform',
  slug: 'fourier-transform',
  chapter: 'ae-p1',
  order: 19,
  title: 'The Fourier Transform',
  subtitle: 'Every signal is a sum of sine waves. The Fourier transform tells you which ones.',
  tags: ['Fourier-transform', 'DFT', 'FFT', 'frequency-domain', 'convolution-theorem', 'spectral-analysis', 'positional-encodings'],

  hook: {
    question: 'A CNN convolution with a large kernel takes O(N·M) operations. The same operation in frequency space takes O(N log N). How does multiplying two arrays replace an entire convolution?',
    realWorldContext:
      'The Fourier transform converts data from the time domain to the frequency domain. Once there, convolution becomes pointwise multiplication — and that is why FFT makes convolution fast. But FFT appears everywhere else in AI too: audio models work on spectrograms (Fourier power spectra), the original Transformer\'s positional encodings are the real and imaginary parts of complex exponentials at different frequencies, and understanding frequency resolution explains why zero-padding a signal does NOT give you more information. This lesson builds the DFT from scratch and shows how the O(N log N) Cooley-Tukey FFT achieves its speedup.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'The Discrete Fourier Transform (DFT): given N samples x[0],...,x[N−1], compute N frequency coefficients X[k] = Σₙ x[n]·e^(−2πikn/N) for k = 0,...,N−1. Each X[k] is a complex number: |X[k]| is the amplitude of frequency k, angle(X[k]) is the phase offset. The key insight: e^(−2πikn/N) is a rotating phasor at frequency k. The DFT computes the correlation between the signal and each of N equally-spaced frequencies from the roots of unity. If the signal contains energy at frequency k, the correlation is large. DC component X[0] = sum of all samples (proportional to the mean). Nyquist X[N/2]: the highest representable frequency. For real signals, X[N−k] = conj(X[k]) — the negative frequencies mirror the positive ones.',
      'Inverse DFT: x[n] = (1/N)·Σₖ X[k]·e^(+2πikn/N). Same formula, opposite sign in exponent, divide by N. The inverse is perfect reconstruction — no information lost. The DFT is a change of basis: re-express the same N values in a different coordinate system (frequency instead of time). Orthogonality: the N DFT basis vectors e^(2πikn/N) are orthogonal — their inner products are zero except when compared to themselves. This is why the DFT is invertible and why each frequency coefficient is independent.',
      'The FFT (Cooley-Tukey algorithm): the direct DFT is O(N²) — N outputs, each summing N inputs. For N = 10⁶, that is 10¹² operations. The FFT computes the same result in O(N log N) by divide and conquer. Key insight: split the N-point DFT into two N/2-point DFTs (even and odd samples), then combine. X[k] = E[k] + e^(−2πik/N)·O[k] for k = 0,...,N/2−1. X[k+N/2] = E[k] − e^(−2πik/N)·O[k]. This symmetry means each level of recursion does O(N) work. With log₂(N) levels: total O(N log N). For N = 10⁶: 20 million operations vs 1 trillion. The FFT requires N to be a power of 2; zero-pad if necessary.',
      'The convolution theorem: convolution in the time domain equals pointwise multiplication in the frequency domain. For signals x and h: (x * h)[n] = Σₖ x[k]·h[n−k]. Computing this directly costs O(N·M). Via FFT: compute FFT(x) and FFT(h) [O(N log N)], multiply pointwise [O(N)], take inverse FFT [O(N log N)]. Total: O(N log N) instead of O(N·M). For large kernels (M >> 1), this is a massive speedup. Note: FFT computes circular convolution (signal wraps around). For linear convolution, zero-pad both signals to length N+M−1.',
      'Spectral analysis and frequency resolution. Power spectrum: P[k] = |X[k]|² (squared magnitude, energy at each frequency). Phase spectrum: φ[k] = atan2(Im(X[k]), Re(X[k])). Frequency of bin k: f_k = k·fs/N where fs is the sampling rate. Frequency resolution: Δf = fs/N. To resolve two nearby frequencies, need more samples (longer observation window). Zero-padding does NOT increase frequency resolution — it interpolates between existing bins (gives smoother plot) but cannot resolve frequencies closer than 1/T Hz (T = observation time). Windowing: before DFT, multiply signal by a window function (Hann, Hamming) that tapers to zero at the edges. Reduces spectral leakage from boundary discontinuities.',
      'Connections to ML. (1) Transformer positional encodings: PE(pos, 2i) = sin(pos/10000^(2i/d)), PE(pos, 2i+1) = cos(pos/10000^(2i/d)). These are the real and imaginary parts of e^(i·pos/10000^(2i/d)) — a family of phasors at geometrically spaced frequencies. High frequencies change rapidly with position (fine resolution), low frequencies change slowly (coarse resolution). Each position gets a unique fingerprint. (2) CNN convolutions: a conv layer computes a convolution between the input and a learned kernel. For small kernels (3×3), direct computation is fast. For large receptive fields or 1D audio with long kernels, FFT convolution (O(N log N)) is used. (3) Spectrograms for audio: short-time Fourier transform (STFT) applies DFT to overlapping windows of the signal, producing a 2D time-frequency representation — the input to speech recognition models.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Why the FFT is O(N log N) and not O(N²)',
        body: 'Each N-point DFT splits into two N/2-point DFTs plus O(N) combining work. This gives T(N) = 2·T(N/2) + O(N) — the recurrence for merge sort. Solving: T(N) = O(N log N).\n\nThe "twiddle factors" e^(−2πik/N) exploit the periodicity of the roots of unity: X[k+N/2] = E[k] − twiddle·O[k] reuses E[k] and O[k] that were already computed for X[k]. Each butterfly operation does O(1) work and handles TWO output bins simultaneously.',
      },
      {
        type: 'insight',
        title: 'Convolution theorem: why CNNs can use FFT for large kernels',
        body: 'Direct convolution of length-N signal with length-M kernel: O(N·M).\nFFT convolution: O((N+M) log(N+M)).\n\nFor 3×3 kernels (M=9): direct is fine.\nFor 1D audio with 512-sample kernels: N=44100, M=512 → direct needs 22M ops; FFT needs ~0.5M ops.\n\nPyTorch uses FFT-based convolution automatically via torch.nn.functional.conv1d when the kernel is large enough. The crossover point depends on hardware.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'The Fourier Transform',
        mathBridge: 'DFT: X[k] = Σx[n]·e^(−2πi·kn/N). FFT: O(N log N) divide-and-conquer. Convolution theorem: conv(a,b) = IDFT(DFT(a)·DFT(b)).',
        caption: 'Implement DFT from scratch, build recursive FFT, and prove the convolution theorem computationally.',
        props: {
          initialCells: [
          {
            id: 1,
            prose: [
              'Implement the DFT from scratch using the definition X[k] = Σₙ x[n]·e^(−2πikn/N). Each output is an inner product between the signal and a complex exponential at frequency k.',
              'Test with a pure sine wave: a signal with only one frequency should produce a DFT with energy concentrated in one (or two, for real signals) bins.',
              'Read off the amplitude from |X[k]| and the phase from angle(X[k]).',
            ],
            code: `import math

def dft(x):
    """Direct DFT: O(N^2) implementation."""
    N = len(x)
    X = []
    for k in range(N):
        real_sum = 0.0
        imag_sum = 0.0
        for n in range(N):
            angle = -2 * math.pi * k * n / N
            real_sum += x[n] * math.cos(angle)
            imag_sum += x[n] * math.sin(angle)
        X.append((real_sum, imag_sum))
    return X

def magnitude(c):
    return math.sqrt(c[0]**2 + c[1]**2)

def phase(c):
    return math.atan2(c[1], c[0])

# Test: pure sine wave at frequency 3, N=16 samples
N = 16
freq = 3    # 3 complete cycles in N samples
x = [math.sin(2 * math.pi * freq * n / N) for n in range(N)]

X = dft(x)

print(f"DFT of sin(2π·3·n/16),  N={N} samples:")
print(f"{'k':>3}  {'|X[k]|':>8}  {'phase(deg)':>11}  note")
print("-" * 45)
for k in range(N // 2 + 1):
    mag = magnitude(X[k])
    phi = phase(X[k]) * 180 / math.pi
    note = "<-- energy here" if k == freq else ""
    print(f"{k:>3}  {mag:>8.3f}  {phi:>11.1f}  {note}")

print(f"\\nAmplitude at k={freq}: |X[{freq}]| = {magnitude(X[freq]):.4f}")
print(f"Expected: N/2 = {N/2:.1f} (real DFT splits energy between +k and -k)")`,
          },
          {
            id: 2,
            prose: [
              'The Cooley-Tukey FFT: divide and conquer. Split the N-point DFT into two N/2-point DFTs of the even and odd samples, then combine with "twiddle factors".',
              'The combining step: X[k] = E[k] + e^(−2πik/N)·O[k] and X[k+N/2] = E[k] − e^(−2πik/N)·O[k]. One computation handles two output bins — this is the "butterfly."',
              'Verify that the FFT gives the same result as the direct DFT but runs faster. Count operations to confirm O(N log N).',
            ],
            code: `import math

def fft(x):
    """Cooley-Tukey FFT (recursive). N must be a power of 2."""
    N = len(x)
    if N == 1:
        return [(x[0], 0.0)]

    # Split into even/odd
    even = fft(x[0::2])    # even-indexed samples
    odd  = fft(x[1::2])    # odd-indexed samples

    X = [(0.0, 0.0)] * N
    for k in range(N // 2):
        # Twiddle factor: e^(-2*pi*i*k/N)
        angle = -2 * math.pi * k / N
        tw = (math.cos(angle), math.sin(angle))
        # Complex multiply tw * odd[k]
        tw_odd_r = tw[0]*odd[k][0] - tw[1]*odd[k][1]
        tw_odd_i = tw[0]*odd[k][1] + tw[1]*odd[k][0]
        X[k]         = (even[k][0] + tw_odd_r, even[k][1] + tw_odd_i)
        X[k + N//2]  = (even[k][0] - tw_odd_r, even[k][1] - tw_odd_i)
    return X

def dft(x):
    N = len(x)
    X = []
    for k in range(N):
        r = sum(x[n] * math.cos(-2*math.pi*k*n/N) for n in range(N))
        i = sum(x[n] * math.sin(-2*math.pi*k*n/N) for n in range(N))
        X.append((r, i))
    return X

def magnitude(c): return math.sqrt(c[0]**2 + c[1]**2)

# Compare DFT and FFT on a mixed-frequency signal
N = 16
x = [math.sin(2*math.pi*2*n/N) + 0.5*math.cos(2*math.pi*5*n/N) for n in range(N)]

X_dft = dft(x)
X_fft = fft(x)

# Verify they match
max_diff = max(abs(magnitude(X_dft[k]) - magnitude(X_fft[k])) for k in range(N))
print(f"Max |DFT| vs |FFT| difference: {max_diff:.2e}  (should be ~machine epsilon)")

print(f"\\nPower spectrum (signal = sin·2Hz + 0.5·cos·5Hz):")
for k in range(N // 2 + 1):
    mag = magnitude(X_fft[k])
    bar = '█' * int(mag * 4 / N)
    print(f"  k={k:>2}: {bar:<15} {mag:.3f}")`,
          },
          {
            id: 3,
            prose: [
              'The convolution theorem: convolution in the time domain = pointwise multiplication in the frequency domain.',
              'Build a 1D convolution (direct O(N·M)) and an FFT-based convolution (O(N log N)). Verify they give the same result, then compare operation counts.',
              'This is the mathematical reason why CNN kernels can be applied efficiently using FFT for large receptive fields.',
            ],
            code: `import math

def fft(x):
    N = len(x)
    if N == 1: return [(x[0], 0.0)]
    even, odd = fft(x[0::2]), fft(x[1::2])
    X = [(0.0, 0.0)] * N
    for k in range(N // 2):
        angle = -2 * math.pi * k / N
        tw = (math.cos(angle), math.sin(angle))
        tw_odd = (tw[0]*odd[k][0]-tw[1]*odd[k][1], tw[0]*odd[k][1]+tw[1]*odd[k][0])
        X[k]        = (even[k][0]+tw_odd[0], even[k][1]+tw_odd[1])
        X[k+N//2]   = (even[k][0]-tw_odd[0], even[k][1]-tw_odd[1])
    return X

def ifft(X):
    """Inverse FFT: conjugate, FFT, conjugate, divide by N."""
    N = len(X)
    X_conj = [(r, -i) for r, i in X]
    x_conj = fft(X_conj)
    return [(r / N, i / N) for r, i in x_conj]

def complex_pointwise_mul(A, B):
    return [(A[k][0]*B[k][0]-A[k][1]*B[k][1], A[k][0]*B[k][1]+A[k][1]*B[k][0])
            for k in range(len(A))]

def linear_convolve_direct(x, h):
    """Direct linear convolution: O(len(x) * len(h))."""
    N, M = len(x), len(h)
    y = [0.0] * (N + M - 1)
    for n in range(N):
        for m in range(M):
            y[n + m] += x[n] * h[m]
    return y

def linear_convolve_fft(x, h):
    """FFT convolution: pad to next power of 2, multiply, IFFT."""
    out_len = len(x) + len(h) - 1
    N = 1
    while N < out_len: N *= 2
    x_pad = x + [0.0] * (N - len(x))
    h_pad = h + [0.0] * (N - len(h))
    X, H = fft(x_pad), fft(h_pad)
    Y = complex_pointwise_mul(X, H)
    y = ifft(Y)
    return [v[0] for v in y[:out_len]]

# Convolve a signal with a smoothing filter
x = [0.0, 0.0, 1.0, 2.0, 3.0, 2.0, 1.0, 0.0, 0.0]
h = [1/3, 1/3, 1/3]   # simple moving average (boxcar filter)

y_direct = linear_convolve_direct(x, h)
y_fft    = linear_convolve_fft(x, h)

print("Direct convolution vs FFT convolution:")
print(f"  Max difference: {max(abs(a-b) for a,b in zip(y_direct, y_fft)):.2e}")
print(f"\\nSignal:      {[round(v,2) for v in x]}")
print(f"Filter:      {h}")
print(f"Convolved:   {[round(v,3) for v in y_direct]}")
print("The filter smooths the spike — each output is the average of 3 neighbors.")`,
          },
          {
            id: 'c1',
            challengeType: 'write',
            prompt: 'Implement the inverse DFT and verify perfect reconstruction: apply DFT then IDFT to a signal and confirm you get the original back. Then demonstrate that zero-padding does NOT add frequency resolution: compute the DFT of a 16-sample signal, then zero-pad to 32 samples and DFT again. Show that the new bins are just interpolations between the original bins, not new information.',
            starterCode: `import math

def dft(x):
    N = len(x)
    X = []
    for k in range(N):
        r = sum(x[n] * math.cos(-2*math.pi*k*n/N) for n in range(N))
        i = sum(x[n] * math.sin(-2*math.pi*k*n/N) for n in range(N))
        X.append((r, i))
    return X

def idft(X):
    """
    Inverse DFT: x[n] = (1/N) * sum_k X[k] * e^(+2*pi*i*k*n/N)
    Note: POSITIVE sign in exponent, divide by N.
    """
    N = len(X)
    x = []
    # TODO: implement the inverse DFT
    return x

def magnitude(c): return math.sqrt(c[0]**2 + c[1]**2)

# Test 1: perfect reconstruction
x = [1.0, 2.0, 1.5, 0.5, -0.5, -1.0, -0.5, 0.0]
X = dft(x)
x_reconstructed = idft(X)
# TODO: print max reconstruction error

# Test 2: zero-padding demo
x16 = [math.sin(2*math.pi*3*n/16) for n in range(16)]
x32 = x16 + [0.0] * 16   # zero-padded to 32
X16 = dft(x16)
X32 = dft(x32)
# TODO: print magnitudes at k=0..8 for both, showing X32[2k] ≈ X16[k]
`,
            hint: 'IDFT: x[n] = (1/N)·Σₖ (X[k].real·cos(2πkn/N) − X[k].imag·sin(2πkn/N)). Note the POSITIVE exponent: cos(+angle) instead of cos(−angle). For zero-padding: the N=32 DFT at k=6 should match the N=16 DFT at k=3 (same physical frequency, just more bins).',
            testCode: `try:
    x = [1.0, 2.0, 1.5, 0.5, -0.5, -1.0, -0.5, 0.0]
    X = dft(x)
    xr = idft(X)
    assert len(xr) == len(x), "Length mismatch"
    max_err = max(abs(xr[i][0]-x[i]) if isinstance(xr[i],tuple) else abs(xr[i]-x[i]) for i in range(len(x)))
    assert max_err < 1e-8, f"Reconstruction error {max_err:.2e}"
    print(f"PASS: IDFT reconstructs signal exactly (max error {max_err:.2e})")
except Exception as e:
    print(f"FAIL: {e}")`,
          },
          ],
        },
      },
    ],
  },

  quiz: [
    {
      type: 'choice',
      question: 'What does the Fourier transform do to a signal?',
      options: [
        'Compresses the signal to use less storage',
        'Decomposes the signal into sine waves of different frequencies, amplitudes, and phases',
        'Removes noise from the signal',
        'Converts the signal from analog to digital',
      ],
      answer: 'Decomposes the signal into sine waves of different frequencies, amplitudes, and phases',
      hints: [
        'Each DFT coefficient X[k] has a magnitude |X[k]| (amplitude of frequency k) and a phase angle',
        'The original signal can be perfectly reconstructed from these coefficients via the inverse DFT',
      ],
      reviewSection: 'DFT Definition',
    },
    {
      type: 'choice',
      question: 'What is the time complexity of the FFT compared to the direct DFT?',
      options: [
        'Both are O(N²)',
        'FFT is O(N log N), DFT is O(N²)',
        'FFT is O(N), DFT is O(N log N)',
        'FFT is O(log N), DFT is O(N)',
      ],
      answer: 'FFT is O(N log N), DFT is O(N²)',
      hints: [
        'Direct DFT: N outputs, each summing N inputs = N² multiplications',
        'FFT divides into two halves recursively — T(N) = 2T(N/2) + O(N) solves to O(N log N)',
      ],
      reviewSection: 'The FFT',
    },
    {
      type: 'choice',
      question: 'What does the convolution theorem state?',
      options: [
        'Convolution in the time domain equals addition in the frequency domain',
        'Convolution in the time domain equals pointwise multiplication in the frequency domain',
        'Convolution always increases the length of a signal',
        'Convolution and correlation are identical operations',
      ],
      answer: 'Convolution in the time domain equals pointwise multiplication in the frequency domain',
      hints: [
        'x * h in time domain = IFFT(FFT(x) · FFT(h)) where · is elementwise multiplication',
        'This reduces O(N·M) convolution to O(N log N) — huge speedup for large kernels',
      ],
      reviewSection: 'Convolution Theorem',
    },
    {
      type: 'choice',
      question: 'Why does zero-padding a signal before FFT NOT increase the true frequency resolution?',
      options: [
        'Zero-padding introduces noise that cancels the improvement',
        'Zero-padding interpolates between existing frequency bins but cannot reveal frequency detail absent from the original samples',
        'Zero-padding only works for power-of-2 signal lengths',
        'The FFT algorithm ignores zero-padded samples',
      ],
      answer: 'Zero-padding interpolates between existing frequency bins but cannot reveal frequency detail absent from the original samples',
      hints: [
        'True resolution = 1/T where T is the observation time. Zero-padding doesn\'t extend T',
        'More bins gives a smoother-looking spectrum, but you cannot resolve two frequencies closer than 1/T Hz apart',
      ],
      reviewSection: 'Frequency Resolution',
    },
    {
      type: 'choice',
      question: 'In the Transformer\'s sinusoidal positional encodings, why are different dimension pairs assigned geometrically spaced frequencies?',
      options: [
        'It reduces the computational cost of attention',
        'Each frequency provides a different resolution — high frequencies encode fine position, low frequencies encode coarse position, giving each position a unique fingerprint',
        'Geometric spacing is required by the FFT algorithm',
        'It ensures all encoding values are between 0 and 1',
      ],
      answer: 'Each frequency provides a different resolution — high frequencies encode fine position, low frequencies encode coarse position, giving each position a unique fingerprint',
      hints: [
        'High-frequency dimensions complete a full cycle in a few positions (fine detail)',
        'Low-frequency dimensions complete a cycle over thousands of positions (coarse structure) — together, each position is uniquely identified',
      ],
      reviewSection: 'Connections to ML',
    },
  ],
}
