// Single-file React component (no alias imports, no external UI libs)
// Fixes errors from unresolved imports like "@/const" and "@/_core/hooks/useAuth" by inlining everything.
// Pure JS/JSX (no TypeScript annotations) for maximum compatibility.
// EDITED: Added delete functionality for sample results

import React, { useState, useMemo, useEffect } from "react";

/******************************
 * Inlined constants & helpers
 ******************************/
const COLOR_PRESETS = {
  blue: {
    label: "Blue",
    color: "#2563eb",
    targetL: 65,
    targetA: -2,
    targetB: -18,
    samples: [
      { id: "A", L: 64.8, a: -2.5, b: -17 },
      { id: "B", L: 64.0, a: -3.0, b: -15 },
    ],
  },
  green: {
    label: "Green",
    color: "#16a34a",
    targetL: 72,
    targetA: -8,
    targetB: 12,
    samples: [
      { id: "A", L: 71.5, a: -8.5, b: 11 },
      { id: "B", L: 70.0, a: -10.0, b: 9 },
    ],
  },
  gray: {
    label: "Gray",
    color: "#6b7280",
    targetL: 70,
    targetA: 0,
    targetB: 0,
    samples: [
      { id: "A", L: 69.5, a: -0.2, b: 0.3 },
      { id: "B", L: 68.5, a: 0.8, b: -0.6 },
    ],
  },
  bronze: {
    label: "Bronze",
    color: "#b45309",
    targetL: 77.7,
    targetA: 3.07,
    targetB: 5.18,
    samples: [
      { id: "A", L: 77.5, a: 3.1, b: 5.0 },
      { id: "B", L: 77.0, a: 2.5, b: 4.4 },
    ],
  },
};

function deltaE(l1, a1, b1, l2, a2, b2) {
  const dl = l1 - l2;
  const da = a1 - a2;
  const db = b1 - b2;
  return Math.sqrt(dl * dl + da * da + db * db);
}

/*****************
 * Minimal styles
 *****************/
const styles = {
  page: { fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", background: "linear-gradient(135deg,#eff6ff,white,#eff6ff)", minHeight: "100vh" },
  container: { maxWidth: 1080, margin: "0 auto", padding: 24 },
  header: { position: "sticky", top: 0, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e5e7eb", zIndex: 10 },
  card: { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
  label: { fontSize: 12, fontWeight: 600, color: "#374151" },
  input: { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8 },
  button: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 10, background: "#111827", color: "white", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", borderBottom: "1px solid #e5e7eb", padding: 8 },
  td: { borderBottom: "1px solid #f3f4f6", padding: 8 },
};

/**********************
 * Inline subcomponents
 **********************/
function Card({ title, subtitle, children }) {
  return (
    <div style={styles.card}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontWeight: 700 }}>{title}</div>
        {subtitle && <div style={{ color: "#6b7280", fontSize: 13 }}>{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

function ColorSelector({ selectedColor, onColorChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8 }}>
      {Object.keys(COLOR_PRESETS).map((key) => {
        const p = COLOR_PRESETS[key];
        const active = selectedColor === key;
        return (
          <button
            key={key}
            onClick={() => onColorChange(key)}
            style={{
              padding: 10,
              border: `2px solid ${active ? "#2563eb" : "#e5e7eb"}`,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "white",
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 9999, background: p.color }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// EDITED: Added onDeleteResult callback and delete button
function ResultsTable({ results, tolerance, onDeleteResult }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>L*</th>
            <th style={styles.th}>a*</th>
            <th style={styles.th}>b*</th>
            <th style={styles.th}>ΔE</th>
            <th style={styles.th}>Status (≤ {tolerance})</th>
            {onDeleteResult && <th style={styles.th}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td style={styles.td}>{r.id}</td>
              <td style={styles.td}>{r.L.toFixed(2)}</td>
              <td style={styles.td}>{r.a.toFixed(2)}</td>
              <td style={styles.td}>{r.b.toFixed(2)}</td>
              <td style={styles.td}>{r.deltaE.toFixed(3)}</td>
              <td style={styles.td}>
                <span style={{ padding: "2px 8px", borderRadius: 9999, background: r.pass ? "#dcfce7" : "#fee2e2", color: r.pass ? "#166534" : "#991b1b", fontSize: 12 }}>
                  {r.pass ? "Pass" : "Fail"}
                </span>
              </td>
              {onDeleteResult && (
                <td style={styles.td}>
                  <button style={{ ...styles.button, padding: "4px 8px", fontSize: 12, background: "#dc2626" }} onClick={() => onDeleteResult(r.id)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EllipseDataTable({ data }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Angle (°)</th>
            <th style={styles.th}>Radians</th>
            <th style={styles.th}>cos θ</th>
            <th style={styles.th}>sin θ</th>
            <th style={styles.th}>X (a*)</th>
            <th style={styles.th}>Y (b*)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td style={styles.td}>{d.angle}</td>
              <td style={styles.td}>{d.radians.toFixed(4)}</td>
              <td style={styles.td}>{d.cos.toFixed(4)}</td>
              <td style={styles.td}>{d.sin.toFixed(4)}</td>
              <td style={styles.td}>{d.x.toFixed(3)}</td>
              <td style={styles.td}>{d.y.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Lightweight SVG chart (no external libs)
function EllipseChart({ ellipseData, target, samples }) {
  const xs = ellipseData.map((p) => p.x).concat(samples.map((s) => s.a)).concat([target.a]);
  const ys = ellipseData.map((p) => p.y).concat(samples.map((s) => s.b)).concat([target.b]);
  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, -1);
  const maxY = Math.max(...ys, 1);

  const w = 520, h = 420;
  const scaleX = (x) => ((x - minX) / (maxX - minX)) * w;
  const scaleY = (y) => h - ((y - minY) / (maxY - minY)) * h; // invert Y for Cartesian feel

  const ellipsePath = ellipseData
    .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`)
    .join(" ") + " Z";

  return (
    <svg width={w} height={h} style={{ width: "100%", height: 420, border: "1px solid #e5e7eb", borderRadius: 12 }}>
      {/* grid */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* axes at 0 */}
      <line x1={0} y1={scaleY(0)} x2={w} y2={scaleY(0)} stroke="#9ca3af"/>
      <line x1={scaleX(0)} y1={0} x2={scaleX(0)} y2={h} stroke="#9ca3af"/>

      {/* ellipse */}
      <path d={ellipsePath} fill="none" stroke="#1f2937" strokeWidth={2} />

      {/* target */}
      <circle cx={scaleX(target.a)} cy={scaleY(target.b)} r={5} fill="#fff" stroke="#111827" />

      {/* samples (colored by pass/fail if provided) */}
      {samples.map((s) => (
        <circle key={s.id} cx={scaleX(s.a)} cy={scaleY(s.b)} r={4} fill={s.pass ? "#22c55e" : "#ef4444"} />
      ))}

      {/* labels */}
      <text x={w - 6} y={scaleY(0) - 6} textAnchor="end" fontSize={12} fill="#6b7280">a*</text>
      <text x={scaleX(0) + 6} y={12} fontSize={12} fill="#6b7280">b*</text>
    </svg>
  );
}

function SaveBar({ onSave, disabled }) {
  const [name, setName] = useState("");
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input style={{ ...styles.input, maxWidth: 320 }} placeholder="Save name (e.g., Blue-Week42)" value={name} onChange={(e) => setName(e.target.value)} />
      <button style={styles.button} disabled={disabled || !name.trim()} onClick={() => { onSave(name.trim()); setName(""); }}>Save</button>
    </div>
  );
}

function SavedList({ results, onView, onDelete }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {results.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #e5e7eb", borderRadius: 12, padding: 8 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{r.colorType} · {new Date(r.timestamp).toLocaleString()} · {r.samplesCount} samples</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ ...styles.button, background: "white", color: "#111827" }} onClick={() => onView(r)}>View</button>
            <button style={{ ...styles.button, background: "white", color: "#111827" }} onClick={() => onDelete(r.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/***********
 * Main App
 ***********/
export default function App() {
  // Thickness constants (linear model)
  const L_SLOPE = -1.8214285714285716;
  const a_SLOPE = 0.25714285714285723;
  const b_SLOPE = -0.8214285714285716;
  const REFERENCE_THICKNESS = 6; // mm

  // Track current URL for quick reference in the UI
  const [appUrl, setAppUrl] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.href);
    }
  }, []);

  // Color selection
  const [selectedColor, setSelectedColor] = useState("blue");
  const currentPreset = COLOR_PRESETS[selectedColor];

  // Parameters
  const [targetL, setTargetL] = useState(currentPreset.targetL);
  const [targetA, setTargetA] = useState(currentPreset.targetA);
  const [targetB, setTargetB] = useState(currentPreset.targetB);
  const [tolerance, setTolerance] = useState(1.8);
  const [scaleX, setScaleX] = useState(1.0);
  const [scaleY, setScaleY] = useState(1.0);
  const [selectedThickness, setSelectedThickness] = useState(6);
  const [activeTab, setActiveTab] = useState("samples");

  // Samples
  const [samples, setSamples] = useState(currentPreset.samples);
  const [newSample, setNewSample] = useState({ id: "", L: 65, a: -2, b: -18 });

  // Saved results (localStorage)
  const [savedResults, setSavedResults] = useState([]);
  useEffect(() => {
    const stored = localStorage.getItem("savedCalculations");
    if (stored) {
      try { setSavedResults(JSON.parse(stored)); } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("savedCalculations", JSON.stringify(savedResults));
  }, [savedResults]);

  const handleColorChange = (colorName) => {
    const preset = COLOR_PRESETS[colorName];
    setSelectedColor(colorName);
    setTargetL(preset.targetL);
    setTargetA(preset.targetA);
    setTargetB(preset.targetB);
    setSamples(preset.samples);
  };

  const handleSaveCalculation = (name) => {
    const newResult = {
      id: Date.now().toString(),
      name,
      colorType: selectedColor,
      targetL,
      targetA,
      targetB,
      tolerance,
      samplesCount: samples.length,
      timestamp: Date.now(),
    };
    setSavedResults([newResult, ...savedResults]);
  };
  const handleDeleteResult = (id) => setSavedResults(savedResults.filter((r) => r.id !== id));
  const handleViewResult = (r) => {
    setSelectedColor(r.colorType);
    const preset = COLOR_PRESETS[r.colorType];
    setTargetL(r.targetL ?? preset.targetL);
    setTargetA(r.targetA ?? preset.targetA);
    setTargetB(r.targetB ?? preset.targetB);
    setTolerance(r.tolerance ?? 1.8);
  };

  // EDITED: Added deleteSample function
  const deleteSample = (sampleId) => {
    setSamples(samples.filter(s => s.id !== sampleId));
  };

  // Predicted colors vs thickness (simple linear model)
  const thicknessPredictions = useMemo(() => {
    const thicknesses = [2, 2.5, 3, 3.5, 4, 5, 5.5, 6, 8, 10, 12];
    return thicknesses.map((thickness) => ({
      thickness,
      L: targetL + L_SLOPE * (thickness - REFERENCE_THICKNESS),
      a: targetA + a_SLOPE * (thickness - REFERENCE_THICKNESS),
      b: targetB + b_SLOPE * (thickness - REFERENCE_THICKNESS),
    }));
  }, [targetL, targetA, targetB]);

  // Ellipse points (a*, b*)
  const ellipseData = useMemo(() => {
    const data = [];
    for (let angle = 0; angle <= 360; angle += 5) {
      const radians = (angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      const x = targetA + tolerance * scaleX * cos;
      const y = targetB + tolerance * scaleY * sin;
      data.push({ angle, radians, cos, sin, x, y });
    }
    return data;
  }, [targetA, targetB, tolerance, scaleX, scaleY]);

  // Sample results
  const sampleResults = useMemo(() => {
    return samples.map((s) => {
      const dE = deltaE(s.L, s.a, s.b, targetL, targetA, targetB);
      return { ...s, deltaE: dE, pass: dE <= tolerance };
    });
  }, [samples, targetL, targetA, targetB, tolerance]);

  const addSample = () => {
    if (newSample.id.trim()) {
      setSamples([...samples, newSample]);
      setNewSample({ id: "", L: 65, a: -2, b: -18 });
    }
  };

  const loadPreset = () => {
    handleColorChange(selectedColor);
    setTolerance(1.8);
    setScaleX(1.0);
    setScaleY(1.0);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.container}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
            <div style={{ width: 120, height: 40, background: "#e5e7eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontWeight: 700 }}>Logo</div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>Obeikan Color Ellipse Calculator</h1>
          </div>
          {appUrl && (
            <div style={{ fontSize: 12, color: "#4b5563" }}>
              Current URL: <span style={{ fontWeight: 600 }}>{appUrl}</span>
            </div>
          )}
        </div>
      </header>

      <main style={styles.container}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 24, height: 24, borderRadius: 9999, background: currentPreset.color }} />
          <span style={{ fontSize: 16, fontWeight: 700 }}>{currentPreset.label} Color Calculator</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
          {/* Left column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <Card title="Color Type Selection" subtitle="Choose your color type to load optimized parameters">
              <ColorSelector selectedColor={selectedColor} onColorChange={handleColorChange} />
            </Card>

            <Card title={`Target Color Parameters (${currentPreset.label})`} subtitle="Set your target L*, a*, b* values and tolerance">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
                <div>
                  <div style={styles.label}>Target L*</div>
                  <input style={styles.input} type="number" step="0.1" value={targetL} onChange={(e) => setTargetL(Number(e.target.value))} />
                </div>
                <div>
                  <div style={styles.label}>Target a*</div>
                  <input style={styles.input} type="number" step="0.1" value={targetA} onChange={(e) => setTargetA(Number(e.target.value))} />
                </div>
                <div>
                  <div style={styles.label}>Target b*</div>
                  <input style={styles.input} type="number" step="0.1" value={targetB} onChange={(e) => setTargetB(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 12 }}>
                <div>
                  <div style={styles.label}>Tolerance (ΔE)</div>
                  <input style={styles.input} type="number" step="0.1" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} />
                </div>
                <div>
                  <div style={styles.label}>Scale X</div>
                  <input style={styles.input} type="number" step="0.1" value={scaleX} onChange={(e) => setScaleX(Number(e.target.value))} />
                </div>
                <div>
                  <div style={styles.label}>Scale Y</div>
                  <input style={styles.input} type="number" step="0.1" value={scaleY} onChange={(e) => setScaleY(Number(e.target.value))} />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button style={styles.button} onClick={loadPreset}>Load Sample Preset</button>
              </div>
            </Card>

            <Card title="Thickness Analysis" subtitle="Predicted colors at different material thicknesses">
              <div style={{ display: "grid", gap: 8 }}>
                <label style={styles.label} htmlFor="thickness">Select Thickness (mm)</label>
                <select id="thickness" value={selectedThickness} onChange={(e) => setSelectedThickness(Number(e.target.value))} style={{ ...styles.input, width: 240 }}>
                  {[2, 2.5, 3, 3.5, 4, 5, 5.5, 6, 8, 10, 12].map((t) => (
                    <option key={t} value={t}>{t}mm</option>
                  ))}
                </select>

                <div style={{ background: "#eff6ff", padding: 12, borderRadius: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e3a8a" }}>Predicted Colors at {selectedThickness}mm:</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, fontSize: 14 }}>
                    <div><div style={{ color: "#6b7280" }}>L*:</div><div style={{ fontWeight: 700 }}>{(targetL + L_SLOPE * (selectedThickness - REFERENCE_THICKNESS)).toFixed(2)}</div></div>
                    <div><div style={{ color: "#6b7280" }}>a*:</div><div style={{ fontWeight: 700 }}>{(targetA + a_SLOPE * (selectedThickness - REFERENCE_THICKNESS)).toFixed(2)}</div></div>
                    <div><div style={{ color: "#6b7280" }}>b*:</div><div style={{ fontWeight: 700 }}>{(targetB + b_SLOPE * (selectedThickness - REFERENCE_THICKNESS)).toFixed(2)}</div></div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  <div>Reference thickness: {REFERENCE_THICKNESS}mm</div>
                  <div>L* slope: {L_SLOPE.toFixed(4)}</div>
                  <div>a* slope: {a_SLOPE.toFixed(4)}</div>
                  <div>b* slope: {b_SLOPE.toFixed(4)}</div>
                </div>
              </div>
            </Card>

            <Card title="Add Sample" subtitle="Input sample color values to test against target">
              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div style={styles.label}>Sample ID</div>
                  <input style={styles.input} value={newSample.id} onChange={(e) => setNewSample({ ...newSample, id: e.target.value })} placeholder="e.g., Sample D" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
                  <div><div style={styles.label}>L*</div><input style={styles.input} type="number" step="0.1" value={newSample.L} onChange={(e) => setNewSample({ ...newSample, L: Number(e.target.value) })} /></div>
                  <div><div style={styles.label}>a*</div><input style={styles.input} type="number" step="0.1" value={newSample.a} onChange={(e) => setNewSample({ ...newSample, a: Number(e.target.value) })} /></div>
                  <div><div style={styles.label}>b*</div><input style={styles.input} type="number" step="0.1" value={newSample.b} onChange={(e) => setNewSample({ ...newSample, b: Number(e.target.value) })} /></div>
                </div>
                <button style={styles.button} onClick={addSample}>Add Sample</button>
              </div>
            </Card>

            <Card title="Save Calculation" subtitle="Stores to your browser (localStorage)">
              <SaveBar onSave={handleSaveCalculation} disabled={samples.length === 0} />
            </Card>
          </div>

          {/* Right column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            <Card title="Tolerance Ellipse Visualization" subtitle="Target point and tolerance boundary in a*/b*">
              <EllipseChart ellipseData={ellipseData} target={{ a: targetA, b: targetB }} samples={sampleResults} />
            </Card>

            <Card title="Calculation Results">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginBottom: 10 }}>
                <button style={{ ...styles.button, background: activeTab === "samples" ? "#2563eb" : "#111827" }} onClick={() => setActiveTab("samples")}>Sample Results</button>
                <button style={{ ...styles.button, background: activeTab === "thickness" ? "#2563eb" : "#111827" }} onClick={() => setActiveTab("thickness")}>Thickness Table</button>
                <button style={{ ...styles.button, background: activeTab === "ellipse" ? "#2563eb" : "#111827" }} onClick={() => setActiveTab("ellipse")}>Ellipse Data</button>
              </div>
              {activeTab === "samples" && (
                <ResultsTable
                  results={sampleResults.map((x) => ({ id: x.id, L: x.L, a: x.a, b: x.b, deltaE: x.deltaE, pass: x.pass }))}
                  tolerance={tolerance}
                  onDeleteResult={deleteSample}
                />
              )}
              {activeTab === "thickness" && (
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Thickness (mm)</th>
                        <th style={styles.th}>L*</th>
                        <th style={styles.th}>a*</th>
                        <th style={styles.th}>b*</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thicknessPredictions.map((p) => (
                        <tr key={p.thickness}>
                          <td style={styles.td}>{p.thickness}mm</td>
                          <td style={styles.td}>{p.L.toFixed(2)}</td>
                          <td style={styles.td}>{p.a.toFixed(2)}</td>
                          <td style={styles.td}>{p.b.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "ellipse" && <EllipseDataTable data={ellipseData} />}
            </Card>

            {savedResults.length > 0 && (
              <Card title="Saved Calculations">
                <SavedList results={savedResults} onView={handleViewResult} onDelete={handleDeleteResult} />
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #e5e7eb", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", marginTop: 24 }}>
        <div style={styles.container}>
          <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280", padding: "12px 0" }}>© 2025 Obeikan Glass Company. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

/****************
 * Basic tests
 * (run once in dev; non-blocking and visible in console)
 ****************/
(function runtimeTests() {
  try {
    // ΔE symmetry & zero-case
    console.assert(deltaE(70, 0, 0, 70, 0, 0) === 0, "ΔE zero case failed");
    const d1 = deltaE(70, -2, 10, 69, -1, 9);
    const d2 = deltaE(69, -1, 9, 70, -2, 10);
    console.assert(Math.abs(d1 - d2) < 1e-9, "ΔE symmetry failed");

    // Ellipse sample count (0..360 step 5 => 73 points)
    const tmpA = 0, tmpB = 0, tol = 2, sx = 1, sy = 1;
    const pts = [];
    for (let angle = 0; angle <= 360; angle += 5) {
      const rad = (angle * Math.PI) / 180;
      pts.push({ x: tmpA + tol * sx * Math.cos(rad), y: tmpB + tol * sy * Math.sin(rad) });
    }
    console.assert(pts.length === 73, "Ellipse point count should be 73");

    // Thickness linear prediction basic sanity
    const L_SLOPE_T = -2, refT = 6, t4 = 4;
    const Lref = 70;
    const L4 = Lref + L_SLOPE_T * (t4 - refT); // should be > Lref when slope negative and t<tref
    console.assert(L4 > Lref, "Thickness slope sanity failed");
  } catch (e) {
    // non-fatal
    console.warn("Runtime tests warning:", e);
  }
})();
