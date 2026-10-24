import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Layers, 
  Cpu, 
  Shield, 
  ListOrdered, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ReportDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportDocModal: React.FC<ReportDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'components' | 'assembly' | 'electrical'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden text-slate-200 text-xs flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">CALMA Product Design Report Reference</h3>
              <p className="text-[11px] text-slate-400">
                SolidWorks Premium 2025 SP4.1 · Prototype Design, CAD Model, Web Dashboard &amp; Build Method
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800/80 bg-slate-950/30 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; Architecture
          </button>
          <button
            onClick={() => setActiveTab('dimensions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dimensions' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CAD Specifications (Table 2 &amp; 4)
          </button>
          <button
            onClick={() => setActiveTab('electrical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'electrical' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Electrical Pinout (Table 6)
          </button>
          <button
            onClick={() => setActiveTab('assembly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'assembly' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Assembly Sequence &amp; Verification
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-slate-300">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-sm font-semibold text-white">Section 1: Product Overview and Design Intent</h4>
                <p className="text-xs leading-relaxed text-slate-300">
                  CALMA is a wrist-worn wellness band that watches for early physiological signs of stress and responds with a gentle, hands-free intervention. It combines four sensing channels: optical pulse (PPG), electrodermal activity (EDA/GSR), motion (IMU), and skin temperature. The microcontroller fuses these signals, so that a raised pulse caused by walking or exercise is not mistaken for stress.
                </p>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  Table 1. Functional Zones of the Housing
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white">Zone A: Upper Housing (on top of wrist)</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">Electronics</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      <strong>Contents:</strong> ESP32 board, Li-Po battery, TP4056 charger, MPU6050 IMU, vibration motor, WS2812B RGB LED, motor driver circuit (2N2222 + 1N4007).
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      <strong>Rationale:</strong> These parts need no skin contact. Placing them on top protects them and balances the band.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white">Zone B: Lower Face (against the skin)</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/15 text-teal-300">Sensing</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      <strong>Contents:</strong> MAX30102 optical window &amp; acrylic lens, two stainless steel GSR electrodes, MAX30205 temperature sensor, lower sensor plate.
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      <strong>Rationale:</strong> Skin-contact sensors need a stable, light-tight, and clean interface to the wrist.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dimensions' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  Table 2. Part-Level Mechanical Specification (Engineering Report)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-2">Part</th>
                        <th className="py-2 px-2">Dimensions (L×W×H)</th>
                        <th className="py-2 px-2">Material</th>
                        <th className="py-2 px-2">Fixing / Clearance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Main housing</td>
                        <td className="py-2 px-2 font-mono text-teal-300">60 × 35 × 18 mm</td>
                        <td className="py-2 px-2">PETG / ABS</td>
                        <td className="py-2 px-2 text-slate-400">M2 screws at 4 corners; 1.0 mm internal clearance</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Top lid</td>
                        <td className="py-2 px-2 font-mono text-teal-300">60 × 35 × 2 mm</td>
                        <td className="py-2 px-2">PETG / ABS</td>
                        <td className="py-2 px-2 text-slate-400">Screws / press-fit; 0.2 mm edge clearance</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Lower sensor plate</td>
                        <td className="py-2 px-2 font-mono text-teal-300">40 × 25 × 3 mm</td>
                        <td className="py-2 px-2">PLA / resin</td>
                        <td className="py-2 px-2 text-slate-400">Press-fit inside housing; 0.5 mm clearance</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">MAX30102 cavity &amp; lens</td>
                        <td className="py-2 px-2 font-mono text-teal-300">16 × 16 × 2 mm</td>
                        <td className="py-2 px-2">Clear acrylic</td>
                        <td className="py-2 px-2 text-slate-400">Glued or press-fit; 0.5 mm lens clearance</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">GSR electrode seats</td>
                        <td className="py-2 px-2 font-mono text-teal-300">10 (dia.) × 2 mm</td>
                        <td className="py-2 px-2">Stainless steel</td>
                        <td className="py-2 px-2 text-slate-400">Raised metal discs/nuts</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 font-medium text-white">Wrist strap</td>
                        <td className="py-2 px-2 font-mono text-teal-300">220 × 22 × 2 mm</td>
                        <td className="py-2 px-2">TPU / silicone</td>
                        <td className="py-2 px-2 text-slate-400">Mounting slots &amp; cradle integrated in housing</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  Table 4. SolidWorks CAD Feature Tree Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-white block">main_box (ABS)</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Boss-Extrude1, Shell1 (2mm), Cut-Extrude1 (USB), Cut-Extrude2, Cut-Extrude8, Fillet1, Chamfer1
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-white block">top_lid (ABS)</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Boss-Extrude1, Boss-Extrude2 (stepped edge), Cut-Extrude1 (LED window), Fillet1, Chamfer1
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-white block">lens (Acrylic)</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Boss-Extrude1, Boss-Extrude2 (two-step transparent part)
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-semibold text-white block">strap (Silicone Rubber)</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Boss-Extrude, Extrude-Thin2 &amp; Thin4, Cut-Extrude (9 adjustment holes), Fillet4 to 12
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'electrical' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  Table 6. Proposed ESP32 Pin Assignment
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-2">Component</th>
                        <th className="py-2 px-2">Signal</th>
                        <th className="py-2 px-2">ESP32 Pin</th>
                        <th className="py-2 px-2">Engineering Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2 px-2 text-white font-sans">I2C Bus Data</td>
                        <td className="py-2 px-2 text-teal-300">SDA</td>
                        <td className="py-2 px-2 font-bold text-teal-400">GPIO 21</td>
                        <td className="py-2 px-2 text-slate-400 font-sans">Shared by MAX30102, MPU6050 and MAX30205</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-white font-sans">I2C Bus Clock</td>
                        <td className="py-2 px-2 text-teal-300">SCL</td>
                        <td className="py-2 px-2 font-bold text-teal-400">GPIO 22</td>
                        <td className="py-2 px-2 text-slate-400 font-sans">Shared by MAX30102, MPU6050 and MAX30205</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-white font-sans">GSR Sensor</td>
                        <td className="py-2 px-2 text-amber-300">Analog Out</td>
                        <td className="py-2 px-2 font-bold text-amber-400">GPIO 34 (ADC1)</td>
                        <td className="py-2 px-2 text-slate-400 font-sans">ADC1 keeps working while Bluetooth is active</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-white font-sans">Motor Driver</td>
                        <td className="py-2 px-2 text-purple-300">PWM (Base)</td>
                        <td className="py-2 px-2 font-bold text-purple-400">GPIO 25</td>
                        <td className="py-2 px-2 text-slate-400 font-sans">Through a 1 kΩ resistor to 2N2222 base</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-white font-sans">RGB LED</td>
                        <td className="py-2 px-2 text-cyan-300">Data In</td>
                        <td className="py-2 px-2 font-bold text-cyan-400">GPIO 26</td>
                        <td className="py-2 px-2 text-slate-400 font-sans">330 Ω series resistor protects data pin</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-2 text-[11px] leading-relaxed">
                <span className="font-semibold text-white block">Design Note on Vibration Driver (Section 3):</span>
                <p className="text-slate-300">
                  The vibration motor draws more current than an ESP32 GPIO pin can safely supply (~90mA peak), so it is driven through a 2N2222 NPN transistor switch with a 1N4007 flyback diode connected in reverse across the motor coils to suppress inductive spikes. It is mounted firmly to the inner wall of the housing so vibration energy is transferred into the shell and wrist.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'assembly' && (
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ListOrdered size={14} />
                  <span>Section 6.4: 9-Step Assembly Sequence</span>
                </h4>
                <ol className="space-y-2 text-[11px]">
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">1</span>
                    <span>Solder core circuit (ESP32, resistors, transistor) on small perfboard sized to housing.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">2</span>
                    <span>Fit GSR electrodes and optical PPG lens window in the lower base and seal in place.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">3</span>
                    <span>Wire the lower sensors (MAX30102, GSR, MAX30205) to the main board I2C and ADC lines.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">4</span>
                    <span>Fix vibration motor and IMU to inner housing walls for mechanical resonance transfer.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">5</span>
                    <span>Mount WS2812B RGB LED facing upward toward the top lid aperture.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">6</span>
                    <span>Solder Li-Po battery leads to TP4056 charger and connect output to board power input.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">7</span>
                    <span>Place battery and circuit inside the housing on the internal support shelf.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">8</span>
                    <span>Close the housing with 4 M2 screws, taking care not to pinch internal wires.</span>
                  </li>
                  <li className="p-2 bg-slate-900/80 rounded border border-slate-800 flex gap-2">
                    <span className="font-mono text-teal-400 font-bold">9</span>
                    <span>Attach flexible TPU wrist strap into cradle pocket.</span>
                  </li>
                </ol>
              </div>

              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>Table 7. Prototype Verification Plan</span>
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center p-2 bg-slate-900/70 rounded border border-slate-800">
                    <span className="font-medium text-white">Electrical Stability</span>
                    <span className="text-teal-400 font-mono">Stable 3.3V while motor runs</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/70 rounded border border-slate-800">
                    <span className="font-medium text-white">Pulse (PPG) Accuracy</span>
                    <span className="text-teal-400 font-mono">Within ±5 BPM vs clinical oximeter</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/70 rounded border border-slate-800">
                    <span className="font-medium text-white">Sweat (GSR) Latency</span>
                    <span className="text-teal-400 font-mono">Deep breath response in 2-3s</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-900/70 rounded border border-slate-800">
                    <span className="font-medium text-white">Motion Rejection</span>
                    <span className="text-teal-400 font-mono">Shaking pauses pulse; no false alarms</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
