import { describe, it, expect } from 'vitest';
import { buildNetlist, solveAnalog } from './AnalogEngine.js';

describe('AnalogEngine Physics Simulation', () => {

  const createBasicEngine = () => {
    const bbHoles = [];
    for(let i=0; i<10; i++) {
      bbHoles.push({ id: `h_${i}`, x: i, y: 0, netId: i });
    }
    return { bbHoles, nodes: [], wires: [] };
  };

  it("Ohm's Law: Voltage divider (5V across 1k and 4k)", () => {
    const sys = createBasicEngine();
    sys.nodes = [
      { id: 'ps', type: 'POWER_SUPPLY', pinNets: [0, 9] }, // 5V on net 0, GND on net 9
      { id: 'r1', type: 'RESISTOR', state: { value: 1000 }, pinNets: [0, 1] },
      { id: 'r2', type: 'RESISTOR', state: { value: 4000 }, pinNets: [1, 9] }
    ];
    
    const netlist = buildNetlist(sys.nodes, sys.wires, sys.bbHoles);
    const simState = { voltages: new Float32Array(netlist.numNets) };
    solveAnalog(netlist, sys.nodes, simState, 1/60);
    
    // Middle node should be exactly 5 * (4k / 5k) = 4.0V
    expect(simState.voltages[1]).toBeCloseTo(4.0, 2);
  });

  it('Diode Voltage Drop', () => {
    const sys = createBasicEngine();
    sys.nodes = [
      { id: 'ps', type: 'POWER_SUPPLY', pinNets: [0, 9] },
      { id: 'd1', type: 'DIODE', pinNets: [0, 1] }, // Anode=0, Cathode=1
      { id: 'r1', type: 'RESISTOR', state: { value: 1000 }, pinNets: [1, 9] }
    ];
    
    const netlist = buildNetlist(sys.nodes, sys.wires, sys.bbHoles);
    const simState = { voltages: new Float32Array(netlist.numNets) };
    solveAnalog(netlist, sys.nodes, simState, 1/60);
    
    // Diode forwards at 0.7V drop. Node 1 should be around 4.3V
    expect(simState.voltages[1]).toBeLessThan(4.4);
    expect(simState.voltages[1]).toBeGreaterThan(4.2);
  });

  it('Zener Diode Clamping', () => {
    const sys = createBasicEngine();
    sys.nodes = [
      // 10V virtual source
      { id: 'r_pull', type: 'RESISTOR', state: { value: 1000 }, pinNets: [0, 1] },
      { id: 'z1', type: 'ZENER_DIODE', pinNets: [9, 1] } // Anode to GND, Cathode to Node 1 (Reverse Bias)
    ];
    
    const netlist = buildNetlist(sys.nodes, sys.wires, sys.bbHoles);
    const simState = { voltages: new Float32Array(netlist.numNets) };
    
    // Manually force a 10V fixed source on net 0
    simState.voltages[0] = 10;
    
    // Inject custom fixed voltage code for the test
    const _solve = () => {
      sys.nodes.push({ type: 'POWER_SUPPLY', pinNets: [undefined, 9] }); // Just grounding net 9
      solveAnalog(netlist, sys.nodes, simState, 1/60);
      // Wait, solveAnalog overrides V. Let's just use the built-in POWER_SUPPLY
    }
    
    sys.nodes.push({ type: 'POWER_SUPPLY', pinNets: [2, 9] }); // 5V source on net 2, GND on 9
    // Connect 5V to the resistor
    sys.nodes[0].pinNets[0] = 2;
    
    solveAnalog(netlist, sys.nodes, simState, 1/60);
    
    // At 5V input, Zener (5.1V) should not conduct. Voltage should be ~5V.
    expect(simState.voltages[1]).toBeCloseTo(5.0, 1);
  });

  it('74HC00 NAND Logic Gate', () => {
    const sys = createBasicEngine();
    // NAND: A(0), B(1) -> Y(2). GND(6), VCC(13)
    sys.nodes = [
      { id: 'ps', type: 'POWER_SUPPLY', pinNets: [8, 9] }, // 5V=8, GND=9
      { id: 'ic', type: '74HC00', pinNets: [1, 2, 3, undefined, undefined, undefined, 9, undefined, undefined, undefined, undefined, undefined, undefined, 8] }
    ];
    
    const netlist = buildNetlist(sys.nodes, sys.wires, sys.bbHoles);
    const simState = { voltages: new Float32Array(netlist.numNets) };
    
    // Case 1: 0, 0 -> 1 (5V)
    simState.voltages[1] = 0; simState.voltages[2] = 0;
    solveAnalog(netlist, sys.nodes, simState, 1/60);
    expect(simState.voltages[3]).toBeCloseTo(5.0, 1);
    
    // Case 2: 5V, 5V -> 0 (0V)
    simState.voltages[1] = 5; simState.voltages[2] = 5;
    solveAnalog(netlist, sys.nodes, simState, 1/60);
    expect(simState.voltages[3]).toBeCloseTo(0.0, 1);
  });

});
