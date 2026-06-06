/**
 * PLCLadderSim — Full-featured PLC ladder logic simulator
 *
 * Supported instructions:
 *   Contacts: XIC, XIO
 *   Coils:    OTE, OTL, OTU, ONS (one-shot)
 *   Timers:   TON, TOF, RTO
 *   Counters: CTU, CTD
 *   Compare:  EQU, NEQ, GRT, GEQ, LES, LEQ
 *   Data/Math: MOV, ADD, SUB, MUL, DIV
 *   Special:  BRANCH (parallel contacts)
 *
 * Program format (passed via initialProps.program):
 *   Array of rungs, each rung is array of elements.
 *   Each element: { type, tag, tagA, tagB, dst, preset, label }
 *
 * Tags format (passed via initialProps.tags):
 *   { TAG_NAME: { type: 'BOOL'|'INT'|'DINT'|'TIMER'|'COUNTER', value, PRE } }
 *
 * Inputs (passed via initialProps.inputs):
 *   Array of { tag, label } shown as toggle switches.
 *
 * Outputs (passed via initialProps.outputs):
 *   Array of { tag, label } shown as indicator lights.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Tag utilities ─────────────────────────────────────────────────────────

function getTagValue(tags, ref) {
  if (ref === null || ref === undefined) return 0;
  if (typeof ref === 'number' || typeof ref === 'boolean') return ref ? 1 : 0;
  const str = String(ref);

  // Dot notation: TIMER1.DN, CTR1.ACC, etc.
  if (str.includes('.')) {
    const [base, prop] = str.split('.');
    const t = tags[base];
    if (!t) return 0;
    if (t.type === 'TIMER') {
      if (prop === 'DN') return t.DN ? 1 : 0;
      if (prop === 'EN') return t.EN ? 1 : 0;
      if (prop === 'TT') return t.TT ? 1 : 0;
      if (prop === 'ACC') return t.ACC ?? 0;
    }
    if (t.type === 'COUNTER') {
      if (prop === 'DN') return t.DN ? 1 : 0;
      if (prop === 'CU') return t.CU ? 1 : 0;
      if (prop === 'CD') return t.CD ? 1 : 0;
      if (prop === 'ACC') return t.ACC ?? 0;
    }
    return 0;
  }

  const tag = tags[str];
  if (!tag) return 0;
  if (tag.type === 'BOOL') return tag.value ? 1 : 0;
  if (tag.type === 'INT' || tag.type === 'DINT') return tag.value ?? 0;
  return 0;
}

function resolveValue(tags, ref) {
  if (typeof ref === 'number') return ref;
  if (typeof ref === 'boolean') return ref ? 1 : 0;
  const str = String(ref);
  if (!isNaN(Number(str))) return Number(str);
  return getTagValue(tags, str);
}

function initTags(defs) {
  const tags = {};
  for (const [name, def] of Object.entries(defs ?? {})) {
    if (def.type === 'TIMER') {
      tags[name] = { type: 'TIMER', EN: false, DN: false, TT: false, ACC: 0, PRE: def.PRE ?? def.preset ?? 1000 };
    } else if (def.type === 'COUNTER') {
      tags[name] = { type: 'COUNTER', CU: false, CD: false, DN: false, OV: false, UN: false, ACC: 0, PRE: def.PRE ?? def.preset ?? 10 };
    } else if (def.type === 'INT' || def.type === 'DINT') {
      tags[name] = { type: def.type, value: def.value ?? 0 };
    } else {
      tags[name] = { type: 'BOOL', value: def.value ?? false };
    }
  }
  return tags;
}

// ─── Scan execution ────────────────────────────────────────────────────────

function evalElements(elements, tags, outputs) {
  if (!elements || !elements.length) return true;

  let power = true;

  for (const el of elements) {
    if (!power && el.type !== 'OTE' && el.type !== 'OTL' && el.type !== 'OTU'
        && el.type !== 'TON' && el.type !== 'TOF' && el.type !== 'RTO'
        && el.type !== 'CTU' && el.type !== 'CTD') {
      // Short-circuit: don't evaluate non-output contacts when no power
      continue;
    }

    switch (el.type) {
      case 'XIC':
        power = power && getTagValue(tags, el.tag) !== 0;
        break;
      case 'XIO':
        power = power && getTagValue(tags, el.tag) === 0;
        break;

      case 'BRANCH': {
        // OR: any branch passes
        const branchPower = (el.branches ?? []).some(branch =>
          evalElements(branch, tags, outputs)
        );
        power = power && branchPower;
        break;
      }

      // Compare (input instructions - act as contacts)
      case 'EQU': power = power && resolveValue(tags, el.tagA) === resolveValue(tags, el.tagB); break;
      case 'NEQ': power = power && resolveValue(tags, el.tagA) !== resolveValue(tags, el.tagB); break;
      case 'GRT': power = power && resolveValue(tags, el.tagA) > resolveValue(tags, el.tagB); break;
      case 'GEQ': power = power && resolveValue(tags, el.tagA) >= resolveValue(tags, el.tagB); break;
      case 'LES': power = power && resolveValue(tags, el.tagA) < resolveValue(tags, el.tagB); break;
      case 'LEQ': power = power && resolveValue(tags, el.tagA) <= resolveValue(tags, el.tagB); break;

      // Output coils
      case 'OTE':
        outputs[el.tag] = { type: 'BOOL', value: power };
        break;
      case 'OTL':
        if (power) outputs[el.tag] = { type: 'BOOL', value: true };
        break;
      case 'OTU':
        if (power) outputs[el.tag] = { type: 'BOOL', value: false };
        break;

      // Timers (handled separately in updateTimers — just record EN here)
      case 'TON':
      case 'RTO':
        outputs[`${el.tag}.__EN`] = power;
        outputs[`${el.tag}.__type`] = el.type;
        outputs[`${el.tag}.__PRE`] = el.preset ?? tags[el.tag]?.PRE ?? 1000;
        break;
      case 'TOF':
        outputs[`${el.tag}.__EN`] = power;
        outputs[`${el.tag}.__type`] = 'TOF';
        outputs[`${el.tag}.__PRE`] = el.preset ?? tags[el.tag]?.PRE ?? 1000;
        break;

      // Counters
      case 'CTU':
      case 'CTD': {
        const prevEN = tags[el.tag]?.CU ?? false;
        outputs[`${el.tag}.__rungPower`] = power;
        outputs[`${el.tag}.__prevEN`] = prevEN;
        outputs[`${el.tag}.__type`] = el.type;
        outputs[`${el.tag}.__PRE`] = el.preset ?? tags[el.tag]?.PRE ?? 10;
        break;
      }

      // Math / data
      case 'MOV':
        if (power) {
          const srcVal = resolveValue(tags, el.src ?? el.tagA);
          const dst = el.dst ?? el.tag;
          outputs[dst] = { ...tags[dst], value: srcVal };
        }
        break;
      case 'ADD':
        if (power) {
          const a = resolveValue(tags, el.tagA); const b = resolveValue(tags, el.tagB);
          const dst = el.dst ?? el.tag;
          outputs[dst] = { ...(tags[dst] ?? { type: 'INT' }), value: a + b };
        }
        break;
      case 'SUB':
        if (power) {
          const a = resolveValue(tags, el.tagA); const b = resolveValue(tags, el.tagB);
          const dst = el.dst ?? el.tag;
          outputs[dst] = { ...(tags[dst] ?? { type: 'INT' }), value: a - b };
        }
        break;
      case 'MUL':
        if (power) {
          const a = resolveValue(tags, el.tagA); const b = resolveValue(tags, el.tagB);
          const dst = el.dst ?? el.tag;
          outputs[dst] = { ...(tags[dst] ?? { type: 'INT' }), value: a * b };
        }
        break;
      case 'DIV':
        if (power) {
          const a = resolveValue(tags, el.tagA); const b = resolveValue(tags, el.tagB);
          if (b !== 0) {
            const dst = el.dst ?? el.tag;
            outputs[dst] = { ...(tags[dst] ?? { type: 'INT' }), value: Math.trunc(a / b) };
          }
        }
        break;

      default: break;
    }
  }

  return power;
}

function executeScan(program, tags, deltaMs) {
  const outputs = {};

  // Execute all rungs
  for (const rung of (program ?? [])) {
    evalElements(rung, tags, outputs);
  }

  // Apply bool/int outputs
  const next = { ...tags };
  for (const [key, val] of Object.entries(outputs)) {
    if (key.includes('.__')) continue; // timer/counter metadata
    if (val && typeof val === 'object' && 'type' in val) {
      next[key] = val;
    }
  }

  // Update timers
  for (const [name, tag] of Object.entries(next)) {
    if (tag.type !== 'TIMER') continue;
    const enKey = `${name}.__EN`;
    const typeKey = `${name}.__type`;
    const preKey = `${name}.__PRE`;

    if (!(enKey in outputs)) continue;

    const en = outputs[enKey];
    const timerType = outputs[typeKey] ?? 'TON';
    const pre = outputs[preKey] ?? tag.PRE;

    const t = { ...tag, PRE: pre };

    if (timerType === 'TON') {
      t.EN = en;
      if (en) {
        if (!t.DN) {
          t.ACC = Math.min(pre, (t.ACC ?? 0) + deltaMs);
          t.TT = t.ACC < pre;
          t.DN = t.ACC >= pre;
        }
      } else {
        t.ACC = 0; t.TT = false; t.DN = false;
      }
    } else if (timerType === 'TOF') {
      t.EN = en;
      if (!en) {
        if (!t.DN) {
          t.ACC = Math.min(pre, (t.ACC ?? 0) + deltaMs);
          t.TT = t.ACC < pre;
          t.DN = t.ACC >= pre;
        }
      } else {
        t.ACC = 0; t.TT = false; t.DN = false;
      }
    } else if (timerType === 'RTO') {
      t.EN = en;
      if (en && !t.DN) {
        t.ACC = Math.min(pre, (t.ACC ?? 0) + deltaMs);
        t.TT = t.ACC < pre;
        t.DN = t.ACC >= pre;
      }
      // RTO does not reset on rung-false — needs explicit RES instruction
    }

    next[name] = t;
  }

  // Update counters
  for (const [name, tag] of Object.entries(next)) {
    if (tag.type !== 'COUNTER') continue;
    const powerKey = `${name}.__rungPower`;
    if (!(powerKey in outputs)) continue;

    const power = outputs[powerKey];
    const prevEN = tag.CU ?? false;
    const ctype = outputs[`${name}.__type`] ?? 'CTU';
    const pre = outputs[`${name}.__PRE`] ?? tag.PRE;
    const c = { ...tag, PRE: pre };

    if (ctype === 'CTU') {
      const risingEdge = power && !prevEN;
      c.CU = power;
      if (risingEdge) {
        c.ACC = (c.ACC ?? 0) + 1;
        c.DN = c.ACC >= pre;
      }
    } else if (ctype === 'CTD') {
      const risingEdge = power && !prevEN;
      c.CD = power;
      if (risingEdge) {
        c.ACC = Math.max(0, (c.ACC ?? 0) - 1);
        c.DN = c.ACC <= 0;
      }
    }

    next[name] = c;
  }

  return next;
}

// ─── Rendering helpers ─────────────────────────────────────────────────────

const TYPE_COLORS = {
  XIC: '#6366f1', XIO: '#ef4444',
  OTE: '#10b981', OTL: '#10b981', OTU: '#ef4444',
  TON: '#f59e0b', TOF: '#f59e0b', RTO: '#f59e0b',
  CTU: '#8b5cf6', CTD: '#8b5cf6',
  EQU: '#06b6d4', NEQ: '#06b6d4', GRT: '#06b6d4', GEQ: '#06b6d4', LES: '#06b6d4', LEQ: '#06b6d4',
  MOV: '#64748b', ADD: '#64748b', SUB: '#64748b', MUL: '#64748b', DIV: '#64748b',
};
const WIRE_ON = '#10b981';
const WIRE_OFF = '#334155';

function getElementPower(el, tags) {
  switch (el.type) {
    case 'XIC': return getTagValue(tags, el.tag) !== 0;
    case 'XIO': return getTagValue(tags, el.tag) === 0;
    case 'EQU': return resolveValue(tags, el.tagA) === resolveValue(tags, el.tagB);
    case 'NEQ': return resolveValue(tags, el.tagA) !== resolveValue(tags, el.tagB);
    case 'GRT': return resolveValue(tags, el.tagA) > resolveValue(tags, el.tagB);
    case 'GEQ': return resolveValue(tags, el.tagA) >= resolveValue(tags, el.tagB);
    case 'LES': return resolveValue(tags, el.tagA) < resolveValue(tags, el.tagB);
    case 'LEQ': return resolveValue(tags, el.tagA) <= resolveValue(tags, el.tagB);
    case 'OTE': return getTagValue(tags, el.tag) !== 0;
    case 'OTL': case 'OTU': return getTagValue(tags, el.tag) !== 0;
    case 'TON': case 'TOF': case 'RTO': return tags[el.tag]?.EN ?? false;
    case 'CTU': case 'CTD': return tags[el.tag]?.DN ?? false;
    default: return false;
  }
}

function getElementLabel(el, tags) {
  if (el.label) return el.label;
  switch (el.type) {
    case 'XIC': return el.tag;
    case 'XIO': return el.tag;
    case 'OTE': return el.tag;
    case 'OTL': return el.tag + '\n(Latch)';
    case 'OTU': return el.tag + '\n(Unlatch)';
    case 'TON': { const t = tags[el.tag]; return `TON\n${t ? Math.round(t.ACC) : 0}/${el.preset ?? t?.PRE ?? 0}ms`; }
    case 'TOF': { const t = tags[el.tag]; return `TOF\n${t ? Math.round(t.ACC) : 0}/${el.preset ?? t?.PRE ?? 0}ms`; }
    case 'CTU': { const c = tags[el.tag]; return `CTU\n${c ? c.ACC : 0}/${el.preset ?? c?.PRE ?? 0}`; }
    case 'CTD': { const c = tags[el.tag]; return `CTD\n${c ? c.ACC : 0}/${el.preset ?? c?.PRE ?? 0}`; }
    case 'EQU': return `EQU\n${el.tagA}=${el.tagB}`;
    case 'NEQ': return `NEQ\n${el.tagA}≠${el.tagB}`;
    case 'GRT': return `GRT\n${el.tagA}>${el.tagB}`;
    case 'GEQ': return `GEQ\n${el.tagA}≥${el.tagB}`;
    case 'LES': return `LES\n${el.tagA}<${el.tagB}`;
    case 'LEQ': return `LEQ\n${el.tagA}≤${el.tagB}`;
    case 'MOV': return `MOV\n${el.src ?? el.tagA}→${el.dst ?? el.tag}`;
    case 'ADD': return `ADD\n${el.tagA}+${el.tagB}→${el.dst ?? el.tag}`;
    case 'SUB': return `SUB\n${el.tagA}-${el.tagB}→${el.dst ?? el.tag}`;
    default: return el.type;
  }
}

const IS_COIL = new Set(['OTE', 'OTL', 'OTU']);
const IS_BOX = new Set(['TON', 'TOF', 'RTO', 'CTU', 'CTD', 'EQU', 'NEQ', 'GRT', 'GEQ', 'LES', 'LEQ', 'MOV', 'ADD', 'SUB', 'MUL', 'DIV']);
const IS_CONTACT = new Set(['XIC', 'XIO']);

function RungElement({ el, tags, powered, compact }) {
  const isCoil = IS_COIL.has(el.type);
  const isBox = IS_BOX.has(el.type);
  const isContact = IS_CONTACT.has(el.type);
  const color = TYPE_COLORS[el.type] ?? '#64748b';
  const active = getElementPower(el, tags);
  const wireColor = powered ? WIRE_ON : WIRE_OFF;
  const label = getElementLabel(el, tags);
  const lines = label.split('\n');

  const W = compact ? 56 : 64;
  const H = compact ? 48 : 56;

  if (isContact) {
    // Classic contact symbol
    const notched = el.type === 'XIO';
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 12, height: 2, background: wireColor }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative' }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', textAlign: 'center', maxWidth: W, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {lines[0]}
          </div>
          <div style={{
            width: W, height: 28, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Contact bars */}
            <div style={{ position: 'absolute', left: 0, width: 10, height: 2, background: wireColor }} />
            <div style={{ position: 'absolute', left: 10, width: 2, height: 20, background: active ? color : '#334155', borderRadius: 1 }} />
            {notched && (
              <div style={{ position: 'absolute', left: 13, top: 6, fontSize: 10, color: active ? color : '#475569', fontWeight: 800, lineHeight: 1 }}>/</div>
            )}
            <div style={{ position: 'absolute', right: 10, width: 2, height: 20, background: active ? color : '#334155', borderRadius: 1 }} />
            <div style={{ position: 'absolute', right: 0, width: 10, height: 2, background: wireColor }} />
            {active && (
              <div style={{ position: 'absolute', inset: 2, borderRadius: 4, background: color + '18' }} />
            )}
          </div>
          {lines[1] && <div style={{ fontSize: 9, color: active ? color : '#64748b', fontWeight: active ? 700 : 400 }}>{lines[1]}</div>}
        </div>
        <div style={{ width: 12, height: 2, background: (powered && active) ? WIRE_ON : WIRE_OFF }} />
      </div>
    );
  }

  if (isCoil) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 16, height: 2, background: wireColor, flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8', maxWidth: W, textAlign: 'center', whiteSpace: 'nowrap' }}>{lines[0]}</div>
          <div style={{
            width: 36, height: 28,
            borderRadius: '50%',
            border: `2.5px solid ${powered ? color : '#334155'}`,
            background: powered ? color + '22' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, color: powered ? color : '#475569', fontWeight: 700,
          }}>
            {el.type === 'OTL' ? 'L' : el.type === 'OTU' ? 'U' : ''}
          </div>
          {lines[1] && <div style={{ fontSize: 9, color: '#64748b' }}>{lines[1]}</div>}
        </div>
        <div style={{ width: 16, height: 2, background: '#1e293b' }} />
      </div>
    );
  }

  if (isBox) {
    const timerDN = el.type === 'TON' || el.type === 'TOF' ? tags[el.tag]?.DN : false;
    const boxActive = el.type.startsWith('EQU') || el.type.startsWith('NEQ') || el.type.startsWith('G') || el.type.startsWith('L')
      ? active : (powered && (timerDN || active));

    return (
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 8, height: 2, background: wireColor }} />
        <div style={{
          border: `2px solid ${powered ? color : '#334155'}`,
          borderRadius: 6,
          background: powered ? color + '14' : '#0f172a',
          padding: '3px 8px',
          minWidth: W, minHeight: H,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: powered ? color : '#475569', letterSpacing: '0.05em' }}>{el.type}</div>
          {lines.map((l, li) => (
            <div key={li} style={{ fontSize: li === 0 ? 9 : 10, color: powered ? '#e2e8f0' : '#64748b', fontFamily: 'monospace', textAlign: 'center' }}>{l}</div>
          ))}
        </div>
        <div style={{ width: 8, height: 2, background: powered ? WIRE_ON : WIRE_OFF }} />
      </div>
    );
  }

  return null;
}

function LadderRung({ rung, tags, rungNum, compact }) {
  // Compute power flow left-to-right
  let runningPower = true;

  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      background: '#0f172a', borderRadius: 8,
      border: '1px solid #1e293b',
      padding: '6px 0', marginBottom: 4, overflow: 'hidden',
    }}>
      {/* Rung number */}
      <div style={{ width: 28, textAlign: 'right', paddingRight: 6, fontSize: 9, color: '#475569', fontWeight: 700, flexShrink: 0 }}>{rungNum}</div>

      {/* Left power rail */}
      <div style={{ width: 4, height: compact ? 52 : 60, background: '#6366f1', borderRadius: 2, flexShrink: 0 }} />

      {/* Elements */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, flexWrap: 'nowrap', overflowX: 'auto', paddingLeft: 4 }}>
        {rung.map((el, i) => {
          if (el.type === 'BRANCH') {
            return (
              <BranchElement key={i} el={el} tags={tags} powered={runningPower} compact={compact} />
            );
          }

          const elPower = runningPower;
          const passes = elPower && getElementPower(el, tags);
          if (!IS_COIL.has(el.type)) runningPower = passes;

          return <RungElement key={i} el={el} tags={tags} powered={elPower} compact={compact} />;
        })}
      </div>

      {/* Right power rail */}
      <div style={{ width: 4, height: compact ? 52 : 60, background: '#1e293b', borderRadius: 2, flexShrink: 0 }} />
    </div>
  );
}

function BranchElement({ el, tags, powered, compact }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderLeft: `2px solid ${powered ? WIRE_ON : WIRE_OFF}`, borderRight: `2px solid ${powered ? WIRE_ON : WIRE_OFF}`, padding: '4px 0' }}>
        {(el.branches ?? []).map((branch, bi) => (
          <div key={bi} style={{ display: 'flex', alignItems: 'center', paddingLeft: 4, paddingRight: 4 }}>
            {branch.map((subEl, si) => {
              const subPower = powered && getElementPower(subEl, tags);
              return <RungElement key={si} el={subEl} tags={tags} powered={powered} compact={compact} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── INT tag editor ────────────────────────────────────────────────────────

function IntTagEditor({ name, value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={() => {
          const n = parseInt(draft, 10);
          if (!isNaN(n)) onChange(n);
          setEditing(false);
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') { const n = parseInt(draft, 10); if (!isNaN(n)) onChange(n); setEditing(false); }
          if (e.key === 'Escape') setEditing(false);
        }}
        style={{ width: 70, fontFamily: 'monospace', fontSize: 12, background: '#1e293b', color: '#6366f1', border: '1px solid #6366f1', borderRadius: 4, padding: '2px 6px', textAlign: 'right' }}
      />
    );
  }
  return (
    <span onClick={() => { setDraft(String(value)); setEditing(true); }}
      title="Click to edit"
      style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#6366f1', cursor: 'text', borderBottom: '1px dashed #334155' }}>
      {value}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function PLCLadderSim({ params = {}, initialProps }) {
  const cfg = (params && Object.keys(params).length > 0 ? params : initialProps) ?? {};
  const {
    program = [],
    tags: initialTagDefs = {},
    inputs = [],
    outputs = [],
    title = 'PLC Ladder Logic',
    description = '',
    scanInterval = 100,
    compact = false,
  } = cfg;

  const [tags, setTags] = useState(() => initTags(initialTagDefs));
  const [running, setRunning] = useState(true);
  const [scanCount, setScanCount] = useState(0);
  const [activeTab, setActiveTab] = useState('ladder');
  const lastTickRef = useRef(Date.now());
  const tagsRef = useRef(tags);
  tagsRef.current = tags;

  // Scan cycle
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const now = Date.now();
      const delta = Math.min(now - lastTickRef.current, 500);
      lastTickRef.current = now;
      setTags(prev => {
        const next = executeScan(program, prev, delta);
        return next;
      });
      setScanCount(c => c + 1);
    }, scanInterval);
    return () => clearInterval(id);
  }, [running, program, scanInterval]);

  const toggleInput = useCallback((tagName) => {
    setTags(prev => {
      const t = prev[tagName];
      if (!t) return { ...prev, [tagName]: { type: 'BOOL', value: true } };
      return { ...prev, [tagName]: { ...t, value: !t.value } };
    });
  }, []);

  const resetTag = useCallback((tagName, tagType) => {
    setTags(prev => {
      if (tagType === 'TIMER') return { ...prev, [tagName]: { ...prev[tagName], ACC: 0, DN: false, TT: false, EN: false } };
      if (tagType === 'COUNTER') return { ...prev, [tagName]: { ...prev[tagName], ACC: 0, DN: false } };
      return prev;
    });
  }, []);

  const resetAll = () => {
    setTags(initTags(initialTagDefs));
    lastTickRef.current = Date.now();
    setScanCount(0);
  };

  const tagEntries = Object.entries(tags);
  const timerTags = tagEntries.filter(([, t]) => t.type === 'TIMER');
  const counterTags = tagEntries.filter(([, t]) => t.type === 'COUNTER');
  const boolTags = tagEntries.filter(([, t]) => t.type === 'BOOL');
  const intTags = tagEntries.filter(([, t]) => t.type === 'INT' || t.type === 'DINT');

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#0a0f1e', color: '#e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', background: '#111827', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#10b981' : '#ef4444', boxShadow: running ? '0 0 8px #10b981' : 'none' }} />
          <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{title}</span>
          <span style={{ fontSize: 10, color: '#475569' }}>scan #{scanCount}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setRunning(r => !r)}
            style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid', borderColor: running ? '#10b981' : '#ef4444', background: 'transparent', color: running ? '#10b981' : '#ef4444' }}>
            {running ? '⏸ Pause' : '▶ Run'}
          </button>
          <button onClick={resetAll}
            style={{ padding: '4px 12px', borderRadius: 16, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: '1px solid #334155', background: 'transparent', color: '#94a3b8' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#111827', borderBottom: '1px solid #1e293b' }}>
        {['ladder', 'io', 'tags'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: '6px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none', background: activeTab === tab ? '#1e293b' : 'transparent', color: activeTab === tab ? '#e2e8f0' : '#64748b', borderBottom: activeTab === tab ? '2px solid #6366f1' : '2px solid transparent', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {tab === 'io' ? 'I/O' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Ladder view */}
      {activeTab === 'ladder' && (
        <div style={{ padding: 12, overflowX: 'auto' }}>
          {description && <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10, fontStyle: 'italic' }}>{description}</p>}
          {program.map((rung, i) => (
            <LadderRung key={i} rung={rung} tags={tags} rungNum={i + 1} compact={compact} />
          ))}
          {program.length === 0 && (
            <div style={{ textAlign: 'center', color: '#475569', padding: 24, fontSize: 12 }}>No program loaded. Configure via initialProps.program</div>
          )}
        </div>
      )}

      {/* I/O panel */}
      {activeTab === 'io' && (
        <div style={{ padding: 12 }}>
          {inputs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Digital Inputs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {inputs.map(inp => {
                  const tagName = typeof inp === 'string' ? inp : inp.tag;
                  const label = typeof inp === 'string' ? inp : (inp.label ?? inp.tag);
                  const val = getTagValue(tags, tagName);
                  return (
                    <button key={tagName} onClick={() => toggleInput(tagName)}
                      style={{
                        padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                        border: `2px solid ${val ? '#6366f1' : '#334155'}`,
                        background: val ? '#1e1b4b' : '#0f172a',
                        color: val ? '#a5b4fc' : '#64748b',
                        fontSize: 11, fontWeight: 700, textAlign: 'left', minWidth: 100,
                        transition: 'all 0.1s',
                      }}>
                      <div style={{ fontSize: 9, color: '#64748b', marginBottom: 2 }}>{tagName}</div>
                      <div>{label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 14, marginTop: 2, color: val ? '#10b981' : '#ef4444' }}>{val ? '1 (ON)' : '0 (OFF)'}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {outputs.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Digital Outputs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {outputs.map(out => {
                  const tagName = typeof out === 'string' ? out : out.tag;
                  const label = typeof out === 'string' ? out : (out.label ?? out.tag);
                  const val = getTagValue(tags, tagName);
                  return (
                    <div key={tagName} style={{
                      padding: '10px 16px', borderRadius: 10,
                      border: `2px solid ${val ? '#10b981' : '#1e293b'}`,
                      background: val ? '#052e16' : '#0f172a',
                      minWidth: 100,
                    }}>
                      <div style={{ fontSize: 9, color: '#475569', marginBottom: 2 }}>{tagName}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: val ? '#10b981' : '#64748b' }}>{label}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 14, marginTop: 2, color: val ? '#10b981' : '#475569' }}>{val ? '1 (ON)' : '0 (OFF)'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {inputs.length === 0 && outputs.length === 0 && (
            <div style={{ color: '#475569', fontSize: 12, textAlign: 'center', padding: 20 }}>No I/O configured. Add inputs/outputs via initialProps.</div>
          )}
        </div>
      )}

      {/* Tags watch window */}
      {activeTab === 'tags' && (
        <div style={{ padding: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {boolTags.map(([name, tag]) => (
              <div key={name} style={{ background: '#111827', border: `1px solid ${tag.value ? '#22c55e33' : '#1e293b'}`, borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8' }}>{name}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: tag.value ? '#10b981' : '#475569' }}>{tag.value ? '1' : '0'}</span>
              </div>
            ))}
            {intTags.map(([name, tag]) => (
              <div key={name} style={{ background: '#111827', border: '1px solid #1e293b', borderRadius: 8, padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94a3b8' }}>{name}</span>
                <IntTagEditor name={name} value={tag.value ?? 0} onChange={v => setTags(prev => ({ ...prev, [name]: { ...prev[name], value: v } }))} />
              </div>
            ))}
            {timerTags.map(([name, tag]) => (
              <div key={name} style={{ background: '#111827', border: `1px solid ${tag.EN ? '#f59e0b33' : '#1e293b'}`, borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#f59e0b' }}>{name}</span>
                  <span style={{ fontSize: 9, color: '#475569' }}>TIMER</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[['EN', tag.EN], ['DN', tag.DN], ['TT', tag.TT]].map(([k, v]) => (
                    <span key={k} style={{ fontSize: 10, fontFamily: 'monospace', color: v ? '#f59e0b' : '#475569' }}>{k}:{v ? '1' : '0'}</span>
                  ))}
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#e2e8f0' }}>ACC:{Math.round(tag.ACC)}ms</span>
                </div>
                <div style={{ marginTop: 4, height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#f59e0b', borderRadius: 2, width: `${Math.min(100, (tag.ACC / tag.PRE) * 100)}%`, transition: 'width 0.1s' }} />
                </div>
                <button onClick={() => resetTag(name, 'TIMER')} style={{ marginTop: 4, fontSize: 9, color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Reset</button>
              </div>
            ))}
            {counterTags.map(([name, tag]) => (
              <div key={name} style={{ background: '#111827', border: `1px solid ${tag.DN ? '#8b5cf633' : '#1e293b'}`, borderRadius: 8, padding: '6px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#8b5cf6' }}>{name}</span>
                  <span style={{ fontSize: 9, color: '#475569' }}>COUNTER</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: tag.DN ? '#8b5cf6' : '#475569' }}>DN:{tag.DN ? '1' : '0'}</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#e2e8f0' }}>ACC:{tag.ACC}</span>
                  <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#94a3b8' }}>PRE:{tag.PRE}</span>
                </div>
                <button onClick={() => resetTag(name, 'COUNTER')} style={{ marginTop: 4, fontSize: 9, color: '#475569', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Reset</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
