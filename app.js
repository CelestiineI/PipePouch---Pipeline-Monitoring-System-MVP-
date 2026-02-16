const express = require('express');
const path = require('path');

const { pipeline, thresholds, simulation } = require('./config/pipelineConfig');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ────────────────────────────────────────────────
// Fake measurement generator – now supports previous state for continuity
// ────────────────────────────────────────────────
function generateMeasurement(prev = null) {
  const now = new Date();

  // Base variation (sinusoidal)
  const timeFactor = now.getTime() / 1000000;
  const pressureVar = Math.sin(timeFactor) * simulation.basePressureVariation_percent / 100;
  const flowVar     = Math.sin(timeFactor * 1.3) * 0.015;

  // Start from nominal or evolve from previous
  let pressure = prev ? prev.internalPressure_bar : pipeline.internalPressure_bar;
  let flow     = prev ? prev.flowRate_m3h         : pipeline.nominalFlowRate_m3h;

  // Apply base variation + noise
  pressure *= (1 + pressureVar);
  flow     *= (1 + flowVar);

  pressure += (Math.random() - 0.5) * simulation.flowNoise_percent / 100 * pipeline.internalPressure_bar;
  flow     += (Math.random() - 0.5) * simulation.flowNoise_percent / 100 * pipeline.nominalFlowRate_m3h;

  // Rare event simulation
  if (Math.random() < simulation.rareEventChance) {
    const eventType = Math.random();
    if (eventType < 0.4) {
      // Possible leak signature
      pressure *= 0.82;
      flow     *= 0.75;
    } else if (eventType < 0.7) {
      // Transient / pump issue
      flow     *= 1.28;
      pressure *= 1.09;
    } else {
      // Minor change
      flow += (Math.random() - 0.5) * 35;
    }
  }

  // Clamp to realistic range
  pressure = Math.max(10, Math.min(110, pressure));
  flow     = Math.max(20, Math.min(300, flow));

  return {
    timestamp: now.toISOString(),
    internalPressure_bar: Number(pressure.toFixed(2)),
    flowRate_m3h: Number(flow.toFixed(1)),
  };
}

// Generate chain of measurements (smooth transitions)
function generateMeasurementChain(count = 40) {
  const measurements = [];
  let prev = null;

  for (let i = 0; i < count; i++) {
    const m = generateMeasurement(prev);
    measurements.push(m);
    prev = m;
  }

  return measurements;
}

// ────────────────────────────────────────────────
// Anomaly detection – returns array of alerts (multi-alert support)
// ────────────────────────────────────────────────
function detectAnomaly(current, prevFlow) {
  const alerts = [];
  const { internalPressure_bar, flowRate_m3h } = current;

  // Barlow burst pressure (MPa → bar conversion fixed)
  const burstPressure_MPa =
    (2 * pipeline.materialYieldStrength_MPa * pipeline.nominalWallThickness_mm) /
    pipeline.nominalDiameter_mm;
  const burstPressure_bar = burstPressure_MPa * 10;

  // Optional safety factor example (uncomment if desired)
  // const allowable_bar = burstPressure_bar / 1.5;

  if (internalPressure_bar > burstPressure_bar * 1.05) {
    alerts.push('CRITICAL: Pressure exceeds theoretical burst limit! (Barlow)');
  }

  if (internalPressure_bar > thresholds.maxAllowablePressure_bar) {
    alerts.push('WARNING: Pressure above maximum allowable limit');
  }

  // Flow change
  const flowChange = Math.abs(flowRate_m3h - prevFlow);
  if (flowChange > thresholds.criticalFlowChange_m3h) {
    const direction = flowRate_m3h > prevFlow ? 'increase' : 'drop';
    alerts.push(
      `ALERT: Significant flow ${direction} (${flowChange.toFixed(1)} m³/h)! Possible rupture or valve issue.`
    );
  }

  if (alerts.length === 0) {
    alerts.push('OK – Pipeline within normal operating range');
  }

  return alerts;
}

// ────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────

app.get('/', (req, res) => {
  const history = generateMeasurementChain(20);
  const latest = history[history.length - 1];
  const prevFlow = history.length >= 2 ? history[history.length - 2].flowRate_m3h : pipeline.nominalFlowRate_m3h;

  const alerts = detectAnomaly(latest, prevFlow);

  res.render('index', {
    alerts,                     // now array
    latestMeasurement: latest,
    history,
    pipelineConfig: pipeline,
  });
});

app.get('/monitor', (req, res) => {
  const history = generateMeasurementChain(40);
  const latest = history[history.length - 1];
  const prevFlow = history.length >= 2 ? history[history.length - 2].flowRate_m3h : pipeline.nominalFlowRate_m3h;

  const alerts = detectAnomaly(latest, prevFlow);

  res.render('monitor', {
    latest,
    alerts,
    history,
    pipeline: pipeline,
    thresholds: thresholds,
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

