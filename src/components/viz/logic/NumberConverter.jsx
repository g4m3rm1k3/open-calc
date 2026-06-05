import { useState, useMemo } from 'react';

function toBinary(n, bits = 16) {
  if (n < 0) {
    // Two's complement
    const pos = (-n) >>> 0;
    const flipped = (~pos) >>> 0;
    n = (flipped + 1) & ((1 << bits) - 1);
  }
  return (n >>> 0).toString(2).padStart(bits, '0');
}

function toTwosComp(n, bits = 8) {
  if (n >= 0) return toBinary(n, bits);
  const mask = (1 << bits) - 1;
  return ((~(-n) + 1) & mask).toString(2).padStart(bits, '0');
}

function toBCD(n) {
  if (n < 0 || n > 9999) return null;
  const digits = String(n).padStart(4, '0').split('').map(d => parseInt(d, 10).toString(2).padStart(4, '0'));
  return digits.join(' ');
}

export default function NumberConverter() {
  const [input, setInput] = useState('42');
  const [inputBase, setInputBase] = useState('dec');
  const [bits, setBits] = useState(8);

  const parsed = useMemo(() => {
    try {
      const bases = { dec: 10, hex: 16, bin: 2, oct: 8 };
      const base = bases[inputBase];
      const raw = input.replace(/\s+/g, '').replace(/^0[xXbBoO]/, '');
      const n = parseInt(raw, base);
      if (isNaN(n)) return null;
      return n;
    } catch { return null; }
  }, [input, inputBase]);

  const isValid = parsed !== null && parsed >= 0 && parsed < (1 << bits);
  const isSigned = parsed !== null && parsed >= -(1 << (bits - 1)) && parsed < (1 << (bits - 1));

  const bin = isValid ? toBinary(parsed, bits) : null;
  const hex = isValid ? parsed.toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0') : null;
  const dec = isValid ? String(parsed) : null;
  const bcd = isValid && parsed >= 0 && parsed <= 9999 ? toBCD(parsed) : null;
  const signedDec = isValid && bits <= 16 ? (() => {
    const half = 1 << (bits - 1);
    return parsed >= half ? parsed - (1 << bits) : parsed;
  })() : null;

  // Bit groups (nibbles)
  const nibbles = bin ? bin.match(/.{1,4}/g) : null;

  const baseOptions = [
    { id: 'dec', label: 'Decimal', placeholder: '0 – ' + ((1 << bits) - 1) },
    { id: 'hex', label: 'Hex', placeholder: '0 – ' + (((1 << bits) - 1)).toString(16).toUpperCase() },
    { id: 'bin', label: 'Binary', placeholder: '0 – ' + bits + ' bits' },
  ];

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui, sans-serif', userSelect: 'none' }}>
      {/* Header + bit width */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#6366f1' }}>Number System Converter</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {[4, 8, 16].map(b => (
            <button key={b} onClick={() => setBits(b)}
              style={{
                padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                border: '2px solid', borderColor: bits === b ? '#6366f1' : '#e2e8f0',
                background: bits === b ? '#6366f1' : 'transparent',
                color: bits === b ? 'white' : '#64748b',
              }}>{b}-bit</button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {baseOptions.map(opt => (
          <button key={opt.id} onClick={() => setInputBase(opt.id)}
            style={{
              padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '2px solid', borderColor: inputBase === opt.id ? '#6366f1' : '#e2e8f0',
              background: inputBase === opt.id ? '#6366f1' : 'transparent',
              color: inputBase === opt.id ? 'white' : '#64748b',
            }}>{opt.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 10, fontSize: 16, fontWeight: 700,
            border: `2px solid ${isValid ? '#6366f1' : '#ef4444'}`,
            fontFamily: 'monospace', outline: 'none', width: 160,
            color: isValid ? '#1e293b' : '#ef4444',
          }}
          placeholder={baseOptions.find(o => o.id === inputBase)?.placeholder}
        />
        {!isValid && input && <span style={{ color: '#ef4444', fontSize: 12 }}>Invalid for {bits}-bit</span>}
      </div>

      {/* Bit display */}
      {bin && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Bit Display ({bits}-bit unsigned)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {nibbles?.map((nibble, ni) => (
              <div key={ni} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {nibble.split('').map((bit, bi) => {
                    const pos = bits - 1 - (ni * 4 + bi);
                    return (
                      <div key={bi} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: bit === '1' ? '#6366f1' : '#f1f5f9',
                          border: `2px solid ${bit === '1' ? '#4f46e5' : '#e2e8f0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 800, color: bit === '1' ? 'white' : '#94a3b8',
                          fontFamily: 'monospace',
                        }}>{bit}</div>
                        <span style={{ fontSize: 8, color: '#94a3b8' }}>{pos}</span>
                      </div>
                    );
                  })}
                </div>
                <span style={{ fontSize: 9, color: '#94a3b8' }}>0x{parseInt(nibble, 2).toString(16).toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion table */}
      {isValid && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {[
            { label: 'Decimal', value: dec, color: '#10b981', mono: true },
            { label: 'Hexadecimal', value: hex ? '0x' + hex : null, color: '#6366f1', mono: true },
            { label: 'Binary', value: bin, color: '#f59e0b', mono: true },
            bcd && { label: 'BCD (4-bit groups)', value: bcd, color: '#8b5cf6', mono: true },
            bits <= 16 && { label: `Signed (${bits}-bit)`, value: String(signedDec), color: signedDec < 0 ? '#ef4444' : '#64748b', mono: true },
          ].filter(Boolean).map((item, i) => (
            <div key={i} style={{
              background: '#f8fafc', border: `1px solid #e2e8f0`, borderRadius: 10, padding: '10px 14px',
              borderLeft: `4px solid ${item.color}`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontFamily: item.mono ? 'monospace' : 'inherit', fontSize: 13, fontWeight: 700, color: item.color, wordBreak: 'break-all' }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bit weight reference */}
      {bits === 8 && (
        <div style={{ marginTop: 16, background: '#f0f4ff', borderRadius: 10, padding: '10px 14px', border: '1px solid #c7d2fe' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>8-bit Weights</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>
            {[128, 64, 32, 16, 8, 4, 2, 1].map((w, i) => (
              <span key={i} style={{ padding: '2px 6px', borderRadius: 4, background: bin?.[i] === '1' ? '#6366f1' : '#e2e8f0', color: bin?.[i] === '1' ? 'white' : '#94a3b8', fontWeight: 700 }}>
                2<sup>{7-i}</sup>={w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
