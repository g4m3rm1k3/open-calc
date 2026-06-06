// AnalogEngine.js
// A custom iterative nodal relaxation solver for breadboard simulations.

export function buildNetlist(nodes, wires, bbHoles) {
  const parent = {};
  function find(i) {
    if (parent[i] === undefined) parent[i] = i;
    if (parent[i] === i) return i;
    return parent[i] = find(parent[i]);
  }
  function union(i, j) { parent[find(i)] = find(j); }

  // 1. Base nets from holes
  bbHoles.forEach(h => { find(h.netId); });

  // 2. Wires short holes (0 Ohms)
  wires.forEach(w => {
    const h1 = bbHoles.find(h => h.id === w.h1);
    const h2 = bbHoles.find(h => h.id === w.h2);
    if (h1 && h2) union(h1.netId, h2.netId);
  });

  // Switches short nets when pressed
  nodes.forEach(n => {
    if (n.type === "SWITCH" && n.state?.on) {
      // Connect L1 (pin 0) to R1 (pin 1) and L2 (pin 2) to R2 (pin 3)
      const hL1 = bbHoles.find(h => h.x === n.x + 0 && h.y === n.y + 0);
      const hR1 = bbHoles.find(h => h.x === n.x + 1 && h.y === n.y + 0);
      if (hL1 && hR1) union(hL1.netId, hR1.netId);
      
      const hL2 = bbHoles.find(h => h.x === n.x + 0 && h.y === n.y + 2);
      const hR2 = bbHoles.find(h => h.x === n.x + 1 && h.y === n.y + 2);
      if (hL2 && hR2) union(hL2.netId, hR2.netId);
    }
  });

  // Assign sequential Net IDs (0 to N-1)
  const uniqueNets = new Set();
  bbHoles.forEach(h => { uniqueNets.add(find(h.netId)); });
  const netList = Array.from(uniqueNets);
  const netToIdx = {};
  netList.forEach((n, i) => netToIdx[n] = i);

  const holeToNetIdx = {};
  bbHoles.forEach(h => { holeToNetIdx[h.id] = netToIdx[find(h.netId)]; });

  return { netList, netToIdx, holeToNetIdx, numNets: netList.length };
}

export function solveAnalog(netlist, nodes, simState, dt = 1/60) {
  const { numNets, holeToNetIdx } = netlist;
  
  if (!simState.voltages || simState.voltages.length !== numNets) {
    simState.voltages = new Float32Array(numNets); // Initialize to 0V
  }
  
  const V = new Float32Array(simState.voltages);
  const isFixed = new Uint8Array(numNets);
  const fixedV = new Float32Array(numNets);
  
  // Matrix representations for relaxation
  // G[i] = map of { netIdx: conductance }
  const G_matrix = Array.from({length: numNets}, () => ({}));
  const I_inject = new Float32Array(numNets);
  
  function addConductance(n1, n2, g) {
    if (n1 === undefined || n2 === undefined) return;
    G_matrix[n1][n2] = (G_matrix[n1][n2] || 0) + g;
    G_matrix[n2][n1] = (G_matrix[n2][n1] || 0) + g;
  }

  // Parse components
  nodes.forEach(n => {
    // Helper to get net index for a pin offset
    const getNet = (dx, dy) => {
      const holeId = Object.keys(holeToNetIdx).find(id => {
        const parts = id.split("_");
        // We need a better way to map node pins to holes. We assume bbHoles is known or we can just use string matching.
        // Actually, logic is usually done by passing the pins in.
        return false; 
      });
      return holeId ? holeToNetIdx[holeId] : undefined;
    };

    // For simplicity, we assume we receive an array of netIdx for the component's pins
    if (!n.pinNets) return;

    if (n.type === "POWER_SUPPLY") {
      const p5v = n.pinNets[0];
      const pGnd = n.pinNets[1];
      if (p5v !== undefined) { isFixed[p5v] = 1; fixedV[p5v] = 5.0; V[p5v] = 5.0; }
      if (pGnd !== undefined) { isFixed[pGnd] = 1; fixedV[pGnd] = 0.0; V[pGnd] = 0.0; }
    }
    
    if (n.type === "RESISTOR") {
      const r = n.state?.value || 1000;
      addConductance(n.pinNets[0], n.pinNets[1], 1.0 / r);
    }
    
    if (n.type === "CAPACITOR") {
      const c = n.state?.value || 0.00001; // 10uF
      const g_eq = c / dt;
      addConductance(n.pinNets[0], n.pinNets[1], g_eq);
      
      const v_old = (simState.voltages[n.pinNets[0]] || 0) - (simState.voltages[n.pinNets[1]] || 0);
      const i_eq = g_eq * v_old;
      
      if (n.pinNets[0] !== undefined) I_inject[n.pinNets[0]] += i_eq;
      if (n.pinNets[1] !== undefined) I_inject[n.pinNets[1]] -= i_eq;
    }
    
    if (n.type === "INDUCTOR") {
      const L = n.state?.value || 0.001; // 1mH
      if (!n.state) n.state = {};
      let i_curr = n.state.current || 0;
      
      const v0 = n.pinNets[0] !== undefined ? (simState.voltages[n.pinNets[0]] || 0) : 0;
      const v1 = n.pinNets[1] !== undefined ? (simState.voltages[n.pinNets[1]] || 0) : 0;
      
      // Inject current (Forward Euler)
      if (n.pinNets[0] !== undefined) I_inject[n.pinNets[0]] -= i_curr;
      if (n.pinNets[1] !== undefined) I_inject[n.pinNets[1]] += i_curr;
      
      n.state.current = i_curr + (dt / L) * (v0 - v1);
      addConductance(n.pinNets[0], n.pinNets[1], 1e-6); // Avoid floating node
    }
    
    if (n.type === "LED" || n.type === "DIODE" || n.type === "ZENER_DIODE") {
      const nA = n.pinNets[0]; // anode
      const nC = n.pinNets[1]; // cathode
      if (nA !== undefined && nC !== undefined) {
        const v_diff = V[nA] - V[nC];
        const v_f = n.type === "LED" ? 2.0 : 0.7; 
        if (v_diff > v_f) {
           const r_on = n.type === "LED" ? 50.0 : 10.0;
           addConductance(nA, nC, 1.0 / r_on);
           const i_f = v_f / r_on;
           I_inject[nA] -= i_f;
           I_inject[nC] += i_f;
        } else if (n.type === "ZENER_DIODE" && v_diff < -5.1) {
           const r_on = 10.0;
           addConductance(nA, nC, 1.0 / r_on);
           const i_z = -5.1 / r_on;
           I_inject[nA] -= i_z;
           I_inject[nC] += i_z;
        } else {
           addConductance(nA, nC, 1e-9);
        }
      }
    }
    
    if (n.type === "POTENTIOMETER") {
      const p1 = n.pinNets[0], pw = n.pinNets[1], p2 = n.pinNets[2];
      const val = n.state?.value ?? 0.5;
      const totalR = 10000;
      const r1 = Math.max(1, totalR * val);
      const r2 = Math.max(1, totalR * (1 - val));
      if (p1 !== undefined && pw !== undefined) addConductance(p1, pw, 1.0 / r1);
      if (pw !== undefined && p2 !== undefined) addConductance(pw, p2, 1.0 / r2);
    }
    
    if (n.type === "PHOTORESISTOR") {
      const light = n.state?.light ?? 0.5; // 0=dark(1M), 1=bright(1k)
      const r = 1000000 - light * 999000;
      addConductance(n.pinNets[0], n.pinNets[1], 1.0 / r);
    }
    
    if (n.type === "NPN_TRANSISTOR") {
      const nE = n.pinNets[0], nB = n.pinNets[1], nC = n.pinNets[2];
      if (nE !== undefined && nB !== undefined && nC !== undefined) {
        // Simple saturated switch model
        if (V[nB] - V[nE] > 0.6) {
          addConductance(nC, nE, 1.0 / 10.0); // 10 ohms when on
          // Base-Emitter diode
          addConductance(nB, nE, 1.0 / 50.0);
          const i_f = 0.6 / 50.0;
          I_inject[nB] -= i_f;
          I_inject[nE] += i_f;
        } else {
          addConductance(nC, nE, 1e-9);
          addConductance(nB, nE, 1e-9);
        }
      }
    }

    if (n.type === "PNP_TRANSISTOR") {
      const nE = n.pinNets[0], nB = n.pinNets[1], nC = n.pinNets[2];
      if (nE !== undefined && nB !== undefined && nC !== undefined) {
        if (V[nE] - V[nB] > 0.6) {
          addConductance(nE, nC, 1.0 / 10.0);
          addConductance(nE, nB, 1.0 / 50.0);
          const i_f = 0.6 / 50.0;
          I_inject[nE] -= i_f;
          I_inject[nB] += i_f;
        } else {
          addConductance(nE, nC, 1e-9);
          addConductance(nE, nB, 1e-9);
        }
      }
    }
    
    if (n.type === "DIP_SWITCH") {
      for (let i=0; i<4; i++) {
        if (n.state?.switches && n.state.switches[i]) {
          const p1 = n.pinNets[i];
          const p2 = n.pinNets[7 - i];
          if (p1 !== undefined && p2 !== undefined) addConductance(p1, p2, 1.0 / 0.1);
        }
      }
    }
    
    // Generic Logic Gate helper
    const handleLogicGate = (outPin, inPins, logicFn, pinNets) => {
      const nOut = pinNets[outPin];
      if (nOut === undefined) return;
      const inputs = inPins.map(p => pinNets[p] !== undefined ? V[pinNets[p]] > 2.5 : false);
      const isHigh = logicFn(...inputs);
      const nVcc = pinNets[13]; // Pin 14 is index 13
      const nGnd = pinNets[6];  // Pin 7 is index 6
      if (isHigh && nVcc !== undefined) {
        addConductance(nOut, nVcc, 1.0 / 50.0);
      } else if (!isHigh && nGnd !== undefined) {
        addConductance(nOut, nGnd, 1.0 / 50.0);
      }
    };

    if (n.type === "74HC00") { // NAND
      handleLogicGate(2, [0, 1], (a, b) => !(a && b), n.pinNets);
      handleLogicGate(5, [3, 4], (a, b) => !(a && b), n.pinNets);
      handleLogicGate(7, [8, 9], (a, b) => !(a && b), n.pinNets);
      handleLogicGate(10, [11, 12], (a, b) => !(a && b), n.pinNets);
    }
    if (n.type === "74HC04") { // NOT
      handleLogicGate(1, [0], a => !a, n.pinNets);
      handleLogicGate(3, [2], a => !a, n.pinNets);
      handleLogicGate(5, [4], a => !a, n.pinNets);
      handleLogicGate(7, [8], a => !a, n.pinNets);
      handleLogicGate(9, [10], a => !a, n.pinNets);
      handleLogicGate(11, [12], a => !a, n.pinNets);
    }
    if (n.type === "74HC08") { // AND
      handleLogicGate(2, [0, 1], (a, b) => (a && b), n.pinNets);
      handleLogicGate(5, [3, 4], (a, b) => (a && b), n.pinNets);
      handleLogicGate(7, [8, 9], (a, b) => (a && b), n.pinNets);
      handleLogicGate(10, [11, 12], (a, b) => (a && b), n.pinNets);
    }
    if (n.type === "74HC32") { // OR
      handleLogicGate(2, [0, 1], (a, b) => (a || b), n.pinNets);
      handleLogicGate(5, [3, 4], (a, b) => (a || b), n.pinNets);
      handleLogicGate(7, [8, 9], (a, b) => (a || b), n.pinNets);
      handleLogicGate(10, [11, 12], (a, b) => (a || b), n.pinNets);
    }

    if (n.type === "VOLTAGE_REGULATOR") {
      const nIn = n.pinNets[0], nGnd = n.pinNets[1], nOut = n.pinNets[2];
      if (nIn !== undefined && nGnd !== undefined && nOut !== undefined) {
        const v_in = V[nIn];
        const v_gnd = V[nGnd];
        if (v_in > v_gnd + 6.0) {
          const target_out = v_gnd + 5.0;
          addConductance(nOut, nGnd, 1.0 / 0.1);
          const i_inj = target_out / 0.1;
          I_inject[nOut] += i_inj;
          I_inject[nGnd] -= i_inj;
          addConductance(nIn, nGnd, 1.0 / 1000); 
        } else {
          addConductance(nIn, nOut, 1.0 / 1000);
        }
      }
    }

    if (n.type === "OP_AMP") {
      const nP = n.pinNets[0], nN = n.pinNets[1], nOut = n.pinNets[2], nVcc = n.pinNets[3], nGnd = n.pinNets[4];
      if (nOut !== undefined) {
        const vP = nP !== undefined ? V[nP] : 0;
        const vN = nN !== undefined ? V[nN] : 0;
        const vcc = nVcc !== undefined ? V[nVcc] : 5.0;
        const gnd = nGnd !== undefined ? V[nGnd] : 0.0;
        
        const gain = 100000;
        let targetV = gnd + gain * (vP - vN);
        if (targetV > vcc - 1.5) targetV = vcc - 1.5; // LM358 isn't rail-to-rail high
        if (targetV < gnd) targetV = gnd;
        
        const gGnd = nGnd !== undefined ? nGnd : 0;
        addConductance(nOut, gGnd, 1.0 / 50.0);
        const i_inj = targetV / 50.0;
        I_inject[nOut] += i_inj;
        if (nGnd !== undefined) I_inject[nGnd] -= i_inj;
      }
    }

    if (n.type === "555_TIMER") {
      // Pinout: 1=GND, 2=TRIG, 3=OUT, 4=RESET, 5=CTRL, 6=THRES, 7=DISCH, 8=VCC
      // Simplified Behavioral Model
      const gnd = n.pinNets[0], trig = n.pinNets[1], out = n.pinNets[2], thres = n.pinNets[5], vcc = n.pinNets[7];
      const disch = n.pinNets[6];
      
      const v_cc = vcc !== undefined ? V[vcc] : 5.0;
      const v_trig = trig !== undefined ? V[trig] : 5.0;
      const v_thres = thres !== undefined ? V[thres] : 0.0;
      
      if (!n.state) n.state = { flipFlop: false };
      
      if (v_trig < v_cc / 3) {
        n.state.flipFlop = true; // Set
      } else if (v_thres > 2 * v_cc / 3) {
        n.state.flipFlop = false; // Reset
      }
      
      // Output driver (simplified: 50 ohm resistor to VCC or GND)
      if (out !== undefined) {
        if (n.state.flipFlop) {
          addConductance(out, vcc, 1/50);
        } else {
          addConductance(out, gnd, 1/50);
        }
      }
      
      // Discharge pin (Open collector to GND)
      if (disch !== undefined) {
        if (!n.state.flipFlop) {
          // Discharging: connect DISCH to GND
          addConductance(disch, gnd, 1/10); // 10 ohms
        } else {
          // Charging: open circuit
          addConductance(disch, gnd, 1e-9);
        }
      }
      
      // Internal resistor divider (3x 5k resistors between VCC and GND)
      if (vcc !== undefined && gnd !== undefined) {
        addConductance(vcc, gnd, 1/15000); 
      }
    }
  });

  // Fallback to ground for completely floating nets to prevent NaN
  for (let i = 0; i < numNets; i++) {
    if (Object.keys(G_matrix[i]).length === 0 && !isFixed[i]) {
       G_matrix[i][i] = 1e-9;
    }
  }

  // Relaxation Loop (Gauss-Seidel)
  for (let iter = 0; iter < 100; iter++) {
    let maxError = 0;
    for (let i = 0; i < numNets; i++) {
      if (isFixed[i]) continue;
      
      let sum_G = 1e-9; // base conductance to ground to avoid divide by zero
      let sum_I = I_inject[i];
      
      for (const neighbor in G_matrix[i]) {
        const g = G_matrix[i][neighbor];
        sum_G += g;
        sum_I += V[neighbor] * g;
      }
      
      const v_new = sum_I / sum_G;
      maxError = Math.max(maxError, Math.abs(V[i] - v_new));
      V[i] = v_new;
    }
    if (maxError < 0.001) break;
  }

  simState.voltages = V;
  return simState;
}
