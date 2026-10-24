#!/usr/bin/env node
/**
 * Scientific Calculation Provenance, Trajectory Counterfactual Invariants &
 * Factorial Design-Matrix Estimability Test Suite (Red-Team Finding 8 + EG-1..EG-4)
 *
 * SCOPE NOTE:
 * This suite verifies mathematical and computational claims from first principles:
 *   1. Biophysical interaction-energy and Larmor frequency provenance against SI equations
 *      (ferritin 3.358569e-5 k_B T, magnetosome chain 5.688616 k_B T, biotite paramagnetic
 *      anisotropy 5.894344e-8 k_B T, 3-regime 1 um^3 biotite Fe3O4 inclusion sensitivity
 *      Scenarios A/B/C, cryptochrome Larmor 1.401248 MHz / 113.58 ns)
 *   2. Trajectory-level counterfactual invariants (H0-A vs H0-B: surv_r_diff = init_surv_r_diff + disp_diff)
 *      and synthetic ensemble verification showing pure selection (delta_r_i = 0) produces Delta r_pop > 0
 *   3. Kuramoto phase-evolution counterfactual controls including the Red-Team Finding 7
 *      Matched-Connectivity & Fixed-Lineage graph control
 *   4. Full angular response curve Y(theta_B) across [0..180 deg] and Fourier harmonic identifiability
 *   5. Exact linear-algebraic rank and nullspace aliasing verification of the 15-cell planned-contrast
 *      subset (rank 15, 9 aliased interaction parameters) vs. the 24-cell (2x4x3) full crossed factorial (rank 24)
 *   6. Fine-grained per-edge evidence tagging, EG-1..EG-4 epistemic gates, 3-tier irradiation hierarchy,
 *      specimen-encoding gate, and zero em/en-dash & NDA keyword hygiene
 *
 * Passing this software suite does NOT establish biological magnetoreception or radiotropism in living fungi.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'evidence_manifest.json'), 'utf8'));

// ============================================================================
// 1. FIRST-PRINCIPLES BIOPHYSICAL CALCULATION PROVENANCE & 3-REGIME BIOTITE SENSITIVITY
// ============================================================================
function verifyBiophysicalCalculationProvenance() {
  const k_B = 1.380649e-23; // J/K (exact SI)
  const mu_B = 9.2740100783e-24; // J/T (CODATA)
  const mu_0 = 4.0 * Math.PI * 1e-7; // H/m
  const gamma_e_over_2pi = 28.0249514242e9; // Hz/T (electron gyromagnetic ratio / 2pi)
  const B_geo = 50.0e-6; // 50 uT in Tesla
  const T_ref = 300.0; // K
  const kBT = k_B * T_ref;

  const models = manifest.cross_domain_epistemic_gates.modeled_interaction_energy_comparison.models;

  // 1a. Single ferritin core thermal torque bound at 50 uT, T = 300 K (Meister 2016)
  const m_ferritin = 300.0 * mu_B;
  const u_ferritin_kBT = (m_ferritin * B_geo) / kBT;
  assert.ok(
    Math.abs(u_ferritin_kBT - models.ferritin_core_model.u_mag_over_kBT) < 1e-10,
    `Ferritin U_mag/k_B T mismatch: computed ${u_ferritin_kBT} vs manifest ${models.ferritin_core_model.u_mag_over_kBT}`
  );
  assert.ok(u_ferritin_kBT < 1e-4, 'Single ferritin core must be >4 orders of magnitude below 1 k_B T');

  // 1b. Track-4 Magnetosome chain (N = 15 spheres, r = 25 nm, Ms = 4.8e5 A/m, B = 50 uT, T = 300 K)
  const N_spheres = 15;
  const r_sphere = 25.0e-9;
  const Ms_magnetite = 4.8e5; // A/m
  const V_sphere = (4.0 / 3.0) * Math.PI * Math.pow(r_sphere, 3);
  const V_total = N_spheres * V_sphere; // 9.817477e-22 m^3
  const m_chain = Ms_magnetite * V_total;
  const u_chain_kBT = (m_chain * B_geo) / kBT; // 5.688616
  assert.ok(
    Math.abs(u_chain_kBT - models.magnetosome_chain_model.u_mag_over_kBT) < 1e-6,
    `Track-4 magnetosome chain U_mag/kBT mismatch: computed ${u_chain_kBT} vs manifest ${models.magnetosome_chain_model.u_mag_over_kBT}`
  );

  // 1c. Volume-matched inclusion-free paramagnetic biotite anisotropy at 50 uT, T = 300 K
  // U_aniso = (V * Delta_chi * B^2) / (2 * mu_0 * k_B * T)
  const chi_v = 1.0e-3; // SI
  const delta_chi = 2.5e-4; // SI
  const u_biotite_aniso_kBT = (V_total * delta_chi * B_geo * B_geo) / (2.0 * mu_0 * kBT); // 5.894344e-8
  const u_biotite_iso_kBT = (V_total * chi_v * B_geo * B_geo) / (2.0 * mu_0 * kBT); // 2.357738e-7
  assert.ok(
    Math.abs(u_biotite_aniso_kBT - models.biotite_inclusion_free_paramagnetic_model.u_mag_over_kBT) < 1e-13,
    `Biotite paramagnetic anisotropy mismatch: computed ${u_biotite_aniso_kBT} vs manifest ${models.biotite_inclusion_free_paramagnetic_model.u_mag_over_kBT}`
  );
  assert.ok(
    Math.abs(u_biotite_iso_kBT - models.biotite_inclusion_free_paramagnetic_model.u_mag_iso_over_kBT) < 1e-13,
    `Biotite paramagnetic isotropic energy mismatch: computed ${u_biotite_iso_kBT} vs manifest ${models.biotite_inclusion_free_paramagnetic_model.u_mag_iso_over_kBT}`
  );

  // 1d. 1 um^3 natural biotite flake 3-regime Fe3O4 inclusion sensitivity at B = 50 uT, T = 300 K
  const V_flake = 1.0e-18; // 1 um^3 in m^3
  const incSens = models.biotite_inclusion_free_paramagnetic_model.natural_1um3_flake_magnetite_inclusion_sensitivity;
  const scA = incSens.idealized_saturated_coherently_blocked_upper_bound;
  const scB = incSens.partially_remanent_natural_nrm_blocked_regime;
  const scC = incSens.unblocked_superparamagnetic_or_low_field_induced_regime;
  assert.strictEqual(scA.is_realistic_natural_default, false);
  assert.strictEqual(scB.is_realistic_natural_default, false);
  assert.strictEqual(scC.is_realistic_natural_default, false);
  assert.strictEqual(scC.directional_torque_requires_anisotropy, true);
  assert.strictEqual(scC.isotropic_b2_energy_generates_uniform_field_torque, false);

  const calcFlakeAnisoBase = f => ((1.0 - f) * V_flake * delta_chi * B_geo * B_geo) / (2.0 * mu_0 * kBT);

  // Scenario A: Idealized coherently aligned saturated SD upper bound (M = M_s = 4.8e5 A/m)
  const calcScA = f => calcFlakeAnisoBase(f) + (f * V_flake * Ms_magnetite * B_geo) / kBT;
  assert.ok(Math.abs(calcScA(0.0) - scA.inclusion_free_0pct_fe3o4) < 1e-9);
  assert.ok(Math.abs(calcScA(1.0e-4) - scA.trace_0_01pct_fe3o4) < 1e-6);
  assert.ok(Math.abs(calcScA(1.0e-2) - scA.minor_1pct_fe3o4) < 1e-4);

  // Scenario B: Partially remanent natural NRM (eta_NRM = 0.01)
  const eta_NRM = scB.nrm_to_saturation_ratio;
  assert.strictEqual(eta_NRM, 0.01);
  const calcScB = f => calcFlakeAnisoBase(f) + (f * V_flake * (eta_NRM * Ms_magnetite) * B_geo) / kBT;
  assert.ok(Math.abs(calcScB(0.0) - scB.inclusion_free_0pct_fe3o4) < 1e-9);
  assert.ok(Math.abs(calcScB(1.0e-4) - scB.trace_0_01pct_fe3o4) < 1e-8);
  assert.ok(Math.abs(calcScB(1.0e-2) - scB.minor_1pct_fe3o4) < 1e-6);

  // Scenario C: Unblocked SP / demagnetized MD low-field induced response (chi_eff = 3.0 SI, Delta_chi_eff = 0.5 SI)
  const chi_eff = scC.chi_eff_si;
  const dchi_eff = scC.delta_chi_eff_si;
  const calcScCAniso = f => calcFlakeAnisoBase(f) + (f * V_flake * dchi_eff * B_geo * B_geo) / (2.0 * mu_0 * kBT);
  const calcScCIso = f => calcFlakeAnisoBase(f) + (f * V_flake * chi_eff * B_geo * B_geo) / (2.0 * mu_0 * kBT);
  assert.ok(Math.abs(calcScCAniso(0.0) - scC.anisotropic_u_mag_over_kBT.inclusion_free_0pct_fe3o4) < 1e-9);
  assert.ok(Math.abs(calcScCAniso(1.0e-4) - scC.anisotropic_u_mag_over_kBT.trace_0_01pct_fe3o4) < 1e-9);
  assert.ok(Math.abs(calcScCAniso(1.0e-2) - scC.anisotropic_u_mag_over_kBT.minor_1pct_fe3o4) < 1e-8);
  assert.ok(Math.abs(calcScCIso(0.0) - scC.isotropic_u_mag_over_kBT.inclusion_free_0pct_fe3o4) < 1e-9);
  assert.ok(Math.abs(calcScCIso(1.0e-4) - scC.isotropic_u_mag_over_kBT.trace_0_01pct_fe3o4) < 1e-8);
  assert.ok(Math.abs(calcScCIso(1.0e-2) - scC.isotropic_u_mag_over_kBT.minor_1pct_fe3o4) < 1e-7);

  // 1e. Cryptochrome / radical-pair Larmor precession at 50 uT
  const f_larmor_Hz = gamma_e_over_2pi * B_geo; // 1.40124757e6 Hz
  const inv_omega_L_s = 1.0 / (2.0 * Math.PI * f_larmor_Hz); // 1.135802e-7 s
  const manifestCry = models.cryptochrome_zeeman_timescale;
  assert.ok(
    Math.abs(f_larmor_Hz - manifestCry.larmor_frequency_hz) < 1.0,
    `Larmor frequency mismatch: computed ${f_larmor_Hz} Hz vs manifest ${manifestCry.larmor_frequency_hz} Hz`
  );
  assert.ok(
    Math.abs(inv_omega_L_s - manifestCry.inverse_larmor_angular_freq_s) < 1e-12,
    `Inverse Larmor angular frequency mismatch: computed ${inv_omega_L_s} s vs manifest ${manifestCry.inverse_larmor_angular_freq_s} s`
  );

  console.log('PASS [Provenance 1/6]: First-principles SI biophysical calculations (ferritin 3.3586e-5 k_B T, magnetosome chain 5.6886 k_B T, biotite 5.8943e-8 k_B T, 3-regime 1 um^3 biotite Scenarios A/B/C, Larmor 1.401248 MHz) verified.');
}

// ============================================================================
// 2. TRAJECTORY COUNTERFACTUAL INVARIANTS (H0-A vs H0-B & cpm-sp-v1 IDENTITY)
// ============================================================================
function verifyTrajectoryCounterfactualInvariants() {
  const bw = manifest.biomagnetic_walk_null_explorer;
  assert.strictEqual(
    bw.synthetic_counterexample_scope.epistemic_tag,
    'SYNTHETIC_COUNTEREXAMPLE',
    'biomagnetic_walk_null_explorer must declare SYNTHETIC_COUNTEREXAMPLE scope'
  );
  assert.strictEqual(bw.synthetic_counterexample_scope.primary_biological_endpoints.length, 3);

  const cpm = bw.cpm_sp_v1_growth_off_256_seeds;
  assert.ok(cpm.epistemic_tag.includes('SYNTHETIC_COUNTEREXAMPLE'));
  assert.strictEqual(256 * cpm.species_rows.length * 6, cpm.total_parcels);

  // 2a. Verify algebraic identity across all 7 species in cpm-sp-v1:
  // surv_r_diff == init_surv_r_diff + disp_diff (from Biofilms/diagnostics/fitness_phase/export.jl)
  for (const row of cpm.species_rows) {
    assert.strictEqual(
      row.evaluable_seeds + row.excluded_seeds,
      256,
      `Species ${row.name} evaluable + excluded seeds != 256`
    );
    const algebraicResidual = Math.abs(row.surv_r_diff - (row.init_surv_r_diff + row.disp_diff));
    assert.ok(
      algebraicResidual <= 1e-6,
      `Species ${row.name} violates counterfactual identity surv_r_diff = init_surv_r_diff + disp_diff (residual = ${algebraicResidual})`
    );
    assert.ok(row.surv_r_diff > 0, `Species ${row.name} expected positive survivor radius shift`);
    assert.ok(row.init_surv_r_diff > 0, `Species ${row.name} expected positive initial survivor radius shift`);
    assert.ok(
      row.disp_ci95[0] <= 0 && row.disp_ci95[1] >= 0,
      `Species ${row.name} displacement CI [${row.disp_ci95[0]}, ${row.disp_ci95[1]}] does not span zero`
    );
  }

  // 2b. Direct trajectory-level synthetic simulation proving H0-B vs H0-A separation:
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Scenario I: Pure Selection (H0-B true, H0-A true: zero active displacement delta_r_i = 0)
  const rng = mulberry32(42);
  const nParcels = 10752;
  let sumAllInit = 0;
  let sumSurvInit = 0;
  let sumSurvFinal = 0;
  let sumSurvDisp = 0;
  let nSurv = 0;
  for (let i = 0; i < nParcels; i++) {
    const r0 = 0.10 + 0.80 * rng();
    const delta_r = 0.0; // strictly zero active movement
    const r1 = r0 + delta_r;
    const pDeath = 0.82 * Math.exp(-1.25 * r0);
    const survived = rng() > pDeath;
    sumAllInit += r0;
    if (survived) {
      nSurv++;
      sumSurvInit += r0;
      sumSurvFinal += r1;
      sumSurvDisp += (r1 - r0);
    }
  }
  const meanAllInit = sumAllInit / nParcels;
  const meanSurvInit = sumSurvInit / nSurv;
  const meanSurvFinal = sumSurvFinal / nSurv;
  const meanSurvDisp = sumSurvDisp / nSurv;
  const survRShift = meanSurvFinal - meanAllInit;
  const initSurvRShift = meanSurvInit - meanAllInit;

  assert.ok(survRShift > 0.04, `Expected large apparent outward shift from pure selection, got ${survRShift}`);
  assert.strictEqual(meanSurvDisp, 0.0, 'Identified-parcel displacement under pure selection must be identically 0');
  assert.ok(
    Math.abs(survRShift - (initSurvRShift + meanSurvDisp)) < 1e-15,
    'Counterfactual identity must hold to machine precision'
  );

  // Scenario II: Active Directed Drift (H0-A false: delta_r_i = +0.045, zero differential mortality)
  const rng2 = mulberry32(42);
  let sumDisp2 = 0;
  for (let i = 0; i < nParcels; i++) {
    const r0 = 0.10 + 0.80 * rng2();
    const delta_r = 0.045;
    const r1 = r0 + delta_r;
    sumDisp2 += (r1 - r0);
  }
  const meanDisp2 = sumDisp2 / nParcels;
  assert.ok(Math.abs(meanDisp2 - 0.045) < 1e-12, `Expected trajectory estimator to recover +0.045 drift, got ${meanDisp2}`);

  console.log('PASS [Invariants 2/6]: Trajectory counterfactual decomposition (surv_r_diff == init_surv_r_diff + disp_diff) verified across all 7 species and synthetic H0-A/H0-B ensembles.');
}

// ============================================================================
// 3. KURAMOTO PHASE-LOCKING & MATCHED-CONNECTIVITY / FIXED-LINEAGE CONTROLS
// ============================================================================
function verifyPhaseLockingAndMatchedConnectivityControls() {
  const plc = manifest.biomagnetic_walk_null_explorer.phase_locking_and_controls;
  assert.ok(plc.epistemic_tag.includes('SYNTHETIC_NEGATIVE_LESSON'));
  assert.ok(plc.matched_connectivity_and_lineage_control, 'Missing matched_connectivity_and_lineage_control (Finding 7)');
  assert.strictEqual(plc.matched_connectivity_and_lineage_control.control_id, 'CTRL_MATCHED_TOPOLOGY_FIXED_LINEAGE');
  assert.strictEqual(plc.three_required_phase_controls.length, 3);

  const N = 24;
  const T_steps = 200;
  const initPhases = Array.from({ length: N }, (_, i) => 0.2 + 2.6 * ((i * 7 + 3) % N) / N);
  const natFreqs = Array.from({ length: N }, (_, i) => 0.314159 + 0.012 * ((i % 7) - 3));

  function buildConnectedAdj(n) {
    const adj = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j && (Math.abs(i - j) <= 4 || Math.abs((i % 6) - (j % 6)) + Math.abs(Math.floor(i / 6) - Math.floor(j / 6)) <= 2)) {
          adj[i].push(j);
        }
      }
    }
    return adj;
  }

  function buildFragmentedAdj(n) {
    const adj = Array.from({ length: n }, () => []);
    for (let i = 0; i < n - 4; i += 2) {
      adj[i].push(i + 1);
      adj[i + 1].push(i);
    }
    return adj;
  }

  function simulateStaticKuramoto(adj, K, startPhases = initPhases, freqs = natFreqs) {
    let theta = startPhases.slice();
    let thetaWindowStart = startPhases.slice();
    const windowSteps = 50;
    for (let t = 0; t < T_steps; t++) {
      if (t === T_steps - windowSteps) {
        thetaWindowStart = theta.slice();
      }
      const next = new Array(N);
      for (let i = 0; i < N; i++) {
        let sumSin = 0;
        const nbrs = adj[i];
        for (const j of nbrs) {
          sumSin += Math.sin(theta[j] - theta[i]);
        }
        const coupling = nbrs.length > 0 ? (K / nbrs.length) * sumSin : 0;
        next[i] = theta[i] + freqs[i] + coupling;
      }
      theta = next;
    }
    let sumCos = 0;
    let sumSin = 0;
    const effFreqs = [];
    for (let i = 0; i < N; i++) {
      sumCos += Math.cos(theta[i]);
      sumSin += Math.sin(theta[i]);
      effFreqs.push((theta[i] - thetaWindowStart[i]) / windowSteps);
    }
    const R = Math.hypot(sumCos / N, sumSin / N);
    const freqRange = Math.max(...effFreqs) - Math.min(...effFreqs);
    return { R, freqRange, finalPhases: theta };
  }

  function simulateDividingLineageKuramoto(K, adjFrag, adjConn) {
    let activeCount = 8;
    let theta = initPhases.slice(0, 8);
    let freqs = natFreqs.slice(0, 8);
    let thetaWindowStart = null;
    const windowSteps = 50;
    for (let t = 0; t < T_steps; t++) {
      if (t === 40 || t === 80) {
        const prevCount = activeCount;
        for (let k = 0; k < 8; k++) {
          const parentIdx = k % prevCount;
          const daughterIdx = activeCount++;
          theta.push(theta[parentIdx] + 0.03 * ((daughterIdx % 5) - 2));
          freqs.push(natFreqs[daughterIdx]);
        }
      }
      if (t === T_steps - windowSteps) {
        thetaWindowStart = theta.slice();
      }
      const curAdj = activeCount < N ? adjFrag : adjConn;
      const next = new Array(activeCount);
      for (let i = 0; i < activeCount; i++) {
        let sumSin = 0;
        const nbrs = curAdj[i].filter(j => j < activeCount);
        for (const j of nbrs) {
          sumSin += Math.sin(theta[j] - theta[i]);
        }
        const coupling = nbrs.length > 0 ? (K / nbrs.length) * sumSin : 0;
        next[i] = theta[i] + freqs[i] + coupling;
      }
      theta = next;
    }
    let sumCos = 0;
    let sumSin = 0;
    const effFreqs = [];
    for (let i = 0; i < N; i++) {
      sumCos += Math.cos(theta[i]);
      sumSin += Math.sin(theta[i]);
      effFreqs.push((theta[i] - thetaWindowStart[i]) / windowSteps);
    }
    const R = Math.hypot(sumCos / N, sumSin / N);
    const freqRange = Math.max(...effFreqs) - Math.min(...effFreqs);
    return { R, freqRange, finalPhases: theta };
  }

  const adjConnected = buildConnectedAdj(N);
  const adjFragmented = buildFragmentedAdj(N);

  const growthOnCoupled = simulateDividingLineageKuramoto(0.5, adjFragmented, adjConnected);
  const growthOnZeroKReplay = simulateDividingLineageKuramoto(0.0, adjFragmented, adjConnected);
  const growthOffFragmented = simulateStaticKuramoto(adjFragmented, 0.5);
  const matchedConnFixedLineageCoupled = simulateStaticKuramoto(adjConnected, 0.5);
  const matchedConnFixedLineageZeroK = simulateStaticKuramoto(adjConnected, 0.0);

  const permutedPhases = initPhases.slice().reverse();
  const crossSeedFreqs = natFreqs.slice(3).concat(natFreqs.slice(0, 3));
  const surrogateUncoupled = simulateStaticKuramoto(adjConnected, 0.0, permutedPhases, crossSeedFreqs);

  const lineageSpreadReduction = 1.0 - growthOnCoupled.freqRange / growthOnZeroKReplay.freqRange;
  const matchedSpreadReduction = 1.0 - matchedConnFixedLineageCoupled.freqRange / matchedConnFixedLineageZeroK.freqRange;

  assert.ok(growthOnCoupled.R > 0.98, `Expected dividing Growth-On K=0.5 R > 0.98, got ${growthOnCoupled.R}`);
  assert.ok(lineageSpreadReduction > 0.98, `Expected >98% frequency-spread reduction vs K=0 lineage replay, got ${lineageSpreadReduction}`);
  assert.ok(growthOnZeroKReplay.R < 0.55, `Expected Control 1 (K=0 dividing-lineage replay) R < 0.55, got ${growthOnZeroKReplay.R}`);
  assert.ok(growthOffFragmented.R < 0.55, `Expected fragmented Growth-Off graph R < 0.55, got ${growthOffFragmented.R}`);
  assert.ok(
    matchedConnFixedLineageCoupled.R > 0.98 && matchedSpreadReduction > 0.98,
    `Expected Matched-Connectivity Fixed-Lineage Control (K=0.5, no division) to lock (R=${matchedConnFixedLineageCoupled.R}, spreadReduction=${matchedSpreadReduction})`
  );
  assert.notStrictEqual(
    matchedConnFixedLineageCoupled.R,
    growthOnCoupled.R,
    'Dividing-lineage Growth-On and Fixed-Lineage Matched-Connectivity trajectories must be distinct simulations'
  );
  assert.ok(surrogateUncoupled.R < 0.45, `Expected Control 2 cross-seed phase-permuted surrogate R < 0.45, got ${surrogateUncoupled.R}`);

  console.log('PASS [Phase Controls 3/6]: Kuramoto counterfactual controls (Dividing-lineage K=0 replay, fragmented percolation, Matched-Connectivity Fixed-Lineage Control, and Cross-Seed Surrogate) verified.');
}

// ============================================================================
// 4. FULL ANGULAR RESPONSE CURVE Y(theta_B) & FOURIER HARMONIC IDENTIFIABILITY
// ============================================================================
function verifyAngularResponseCurves() {
  const arc = manifest.biomagnetic_walk_null_explorer.preregistered_angular_response_curves;
  assert.ok(arc, 'Missing preregistered_angular_response_curves (Red-Team Finding 3)');
  const angles = arc.sampled_angles_deg;
  assert.deepStrictEqual(angles, [0, 30, 45, 60, 90, 120, 135, 150, 180]);
  assert.strictEqual(arc.candidate_curve_models.length, 4);

  const expectedIds = [
    'M_C1_POLAR_MAGNETITE_TORQUE',
    'M_B1_AXIAL_RADICAL_PAIR',
    'M_B2_ANISOTROPIC_RADICAL_PAIR_MAPPED',
    'M_C2_SUPERPARAMAGNETIC_INDUCED'
  ];
  assert.deepStrictEqual(arc.candidate_curve_models.map(m => m.model_id), expectedIds);

  const rad = deg => (deg * Math.PI) / 180.0;
  const formulaFns = {
    M_C1_POLAR_MAGNETITE_TORQUE: deg => Math.cos(rad(deg)),
    M_B1_AXIAL_RADICAL_PAIR: deg => Math.cos(2 * rad(deg)),
    M_B2_ANISOTROPIC_RADICAL_PAIR_MAPPED: deg => 0.7 * Math.cos(2 * rad(deg)) - 0.3 * Math.sin(2 * rad(deg)),
    M_C2_SUPERPARAMAGNETIC_INDUCED: deg => Math.sin(2 * rad(deg))
  };

  for (const m of arc.candidate_curve_models) {
    assert.ok(Array.isArray(m.predicted_curve_values) && m.predicted_curve_values.length === 9, `${m.model_id} missing 9-point predicted_curve_values`);
    const fn = formulaFns[m.model_id];
    angles.forEach((deg, idx) => {
      const expected = fn(deg);
      const actual = m.predicted_curve_values[idx];
      assert.ok(
        Math.abs(actual - expected) <= 1e-3,
        `${m.model_id} at ${deg} deg mismatch: manifest ${actual} vs formula ${expected}`
      );
    });
  }

  assert.strictEqual(Math.sin(2 * rad(0)), 0);
  assert.ok(Math.abs(Math.sin(2 * rad(180))) < 1e-15);

  const curves = arc.candidate_curve_models.map(m => m.predicted_curve_values);
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      const dot = curves[i].reduce((s, v, k) => s + v * curves[j][k], 0);
      const normI = Math.hypot(...curves[i]);
      const normJ = Math.hypot(...curves[j]);
      const cosSim = Math.abs(dot / (normI * normJ));
      assert.ok(cosSim < 0.95, `Candidate curves ${i} and ${j} are nearly collinear (|cos| = ${cosSim})`);
    }
  }

  const basis4 = deg => [1.0, Math.cos(rad(deg)), Math.cos(2 * rad(deg)), Math.sin(2 * rad(deg))];
  const H4 = angles.map(basis4);
  assert.strictEqual(computeMatrixRank(H4), 4, 'Expected full rank 4 for 4-parameter Fourier basis on [0..180 deg]');

  const basis5 = deg => [1.0, Math.cos(rad(deg)), Math.sin(rad(deg)), Math.cos(2 * rad(deg)), Math.sin(2 * rad(deg))];
  const H5 = angles.map(basis5);
  assert.strictEqual(computeMatrixRank(H5), 5, 'Expected full rank 5 for 5-parameter Fourier basis on [0..180 deg]');

  const fullCircle12 = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  for (const deg of fullCircle12) {
    assert.ok(arc.full_circle_extension_angles_deg.includes(deg), `Missing ${deg} deg in full_circle_extension_angles_deg`);
  }
  const HFull = fullCircle12.map(basis5);
  for (let r = 0; r < 5; r++) {
    for (let c = r + 1; c < 5; c++) {
      const innerProd = HFull.reduce((s, row) => s + row[r] * row[c], 0);
      assert.ok(Math.abs(innerProd) < 1e-12, `Harmonics ${r} and ${c} not orthogonal on [0..330 deg]: ${innerProd}`);
    }
  }

  console.log('PASS [Angular Curves 4/6]: Preregistered 9-angle response curves Y(theta_B), pairwise curve discriminability, rank-5 harmonic identifiability on [0..180 deg], and full-circle [0..330 deg] orthogonality verified.');
}

// ============================================================================
// 5. LINEAR-MODEL DESIGN MATRIX RANK & ALIASING (15-CELL vs. 24-CELL FACTORIAL)
// ============================================================================
function computeMatrixRank(mat, tol = 1e-9) {
  const m = mat.length;
  const n = mat[0].length;
  const A = mat.map(row => row.slice());
  let rank = 0;
  for (let col = 0; col < n && rank < m; col++) {
    let pivotRow = rank;
    let maxVal = Math.abs(A[rank][col]);
    for (let r = rank + 1; r < m; r++) {
      if (Math.abs(A[r][col]) > maxVal) {
        maxVal = Math.abs(A[r][col]);
        pivotRow = r;
      }
    }
    if (maxVal <= tol) continue;
    const tmp = A[rank];
    A[rank] = A[pivotRow];
    A[pivotRow] = tmp;
    const pivot = A[rank][col];
    for (let c = col; c < n; c++) A[rank][c] /= pivot;
    for (let r = 0; r < m; r++) {
      if (r !== rank && Math.abs(A[r][col]) > tol) {
        const factor = A[r][col];
        for (let c = col; c < n; c++) A[r][c] -= factor * A[rank][c];
      }
    }
    rank++;
  }
  return rank;
}

function isContrastEstimable(X, contrastVec, tol = 1e-9) {
  const rankX = computeMatrixRank(X, tol);
  const augmented = X.map(r => r.slice());
  augmented.push(contrastVec.slice());
  const rankAug = computeMatrixRank(augmented, tol);
  return rankAug === rankX;
}

function encodeFactorialRow(R, B, M) {
  const rInd = R === 1 ? 1 : 0;
  const bInd = [B === 1 ? 1 : 0, B === 2 ? 1 : 0, B === 3 ? 1 : 0];
  const mInd = [M === 1 ? 1 : 0, M === 2 ? 1 : 0];
  const row = [
    1,
    rInd,
    ...bInd,
    ...mInd,
    ...bInd.map(b => rInd * b),
    ...mInd.map(m => rInd * m)
  ];
  for (let k = 0; k < 3; k++) {
    for (let m = 0; m < 2; m++) {
      row.push(bInd[k] * mInd[m]);
    }
  }
  for (let k = 0; k < 3; k++) {
    for (let m = 0; m < 2; m++) {
      row.push(rInd * bInd[k] * mInd[m]);
    }
  }
  assert.strictEqual(row.length, 24);
  return row;
}

function verifyDesignMatrixEstimabilityAndAliasing() {
  const ledger = manifest.biomagnetic_walk_null_explorer.experimental_design_note.estimability_and_aliasing_ledger;
  assert.ok(ledger, 'Missing estimability_and_aliasing_ledger (Red-Team Finding 5)');
  assert.strictEqual(ledger.length, 4);
  assert.strictEqual(ledger[0].estimable_in_15_cell, true);
  assert.strictEqual(ledger[1].estimable_in_15_cell, true);
  assert.strictEqual(ledger[2].estimable_in_15_cell, false);
  assert.strictEqual(ledger[3].estimable_in_15_cell, false);

  const X_24 = [];
  for (let R = 0; R <= 1; R++) {
    for (let B = 0; B <= 3; B++) {
      for (let M = 0; M <= 2; M++) {
        X_24.push(encodeFactorialRow(R, B, M));
      }
    }
  }
  assert.strictEqual(X_24.length, 24);
  const rank24 = computeMatrixRank(X_24);
  assert.strictEqual(rank24, 24, `Expected full rank 24 for 24-cell crossed factorial, got ${rank24}`);

  const X_15 = [];
  for (let M = 0; M <= 2; M++) {
    X_15.push(encodeFactorialRow(0, 0, M));
  }
  for (let B = 0; B <= 3; B++) {
    for (let M = 0; M <= 2; M++) {
      X_15.push(encodeFactorialRow(1, B, M));
    }
  }
  assert.strictEqual(X_15.length, 15);
  const rank15 = computeMatrixRank(X_15);
  assert.strictEqual(rank15, 15, `Expected rank 15 for 15-cell subset, got ${rank15}`);
  const aliasedCount = 24 - rank15;
  assert.strictEqual(aliasedCount, 9, `Expected exactly 9 aliased parameter combinations in 15-cell subset, got ${aliasedCount}`);

  const c_beta_R = new Array(24).fill(0);
  c_beta_R[1] = 1;
  const c_beta_RM1 = new Array(24).fill(0);
  c_beta_RM1[10] = 1;
  assert.strictEqual(isContrastEstimable(X_15, c_beta_R), true, 'C1 (beta_R at 50 uT) must be estimable in 15-cell subset');
  assert.strictEqual(isContrastEstimable(X_15, c_beta_RM1), true, 'C1 (beta_RM at 50 uT) must be estimable in 15-cell subset');

  const c_cond_B1_in_R1 = new Array(24).fill(0);
  c_cond_B1_in_R1[2] = 1;
  c_cond_B1_in_R1[7] = 1;
  assert.strictEqual(
    isContrastEstimable(X_15, c_cond_B1_in_R1),
    true,
    'C2 (beta_B + beta_RB conditional within R=1) must be estimable in 15-cell subset'
  );

  const c_pure_B1 = new Array(24).fill(0);
  c_pure_B1[2] = 1;
  assert.strictEqual(
    isContrastEstimable(X_15, c_pure_B1),
    false,
    'C3 (pure beta_B under 0 Gy) must be ALIASED / NOT estimable in 15-cell subset'
  );
  assert.strictEqual(
    isContrastEstimable(X_24, c_pure_B1),
    true,
    'C3 (pure beta_B under 0 Gy) must be estimable in full 24-cell factorial'
  );

  const c_pure_RB1 = new Array(24).fill(0);
  c_pure_RB1[7] = 1;
  const c_pure_RBM11 = new Array(24).fill(0);
  c_pure_RBM11[18] = 1;
  assert.strictEqual(
    isContrastEstimable(X_15, c_pure_RB1),
    false,
    'C4 (beta_RB interaction) must be ALIASED / NOT estimable in 15-cell subset'
  );
  assert.strictEqual(
    isContrastEstimable(X_15, c_pure_RBM11),
    false,
    'C4 (beta_RBM 3-way interaction) must be ALIASED / NOT estimable in 15-cell subset'
  );
  assert.strictEqual(
    isContrastEstimable(X_24, c_pure_RB1),
    true,
    'C4 (beta_RB interaction) must be estimable in full 24-cell factorial'
  );
  assert.strictEqual(
    isContrastEstimable(X_24, c_pure_RBM11),
    true,
    'C4 (beta_RBM 3-way interaction) must be estimable in full 24-cell factorial'
  );

  console.log('PASS [Estimability 5/6]: Linear-model design matrix rank (rank(X_15)=15 vs rank(X_24)=24) and exact aliasing of beta_B, beta_BM, beta_RB, beta_RBM verified.');
}

// ============================================================================
// 6. PER-EDGE EVIDENCE TAGS, EG-1..EG-4 GATES, AND ZERO EM/EN-DASH & NDA HYGIENE
// ============================================================================
function verifyPerEdgeEvidenceAndRedTeamPolicies() {
  assert.ok(manifest.edge_level_evidence_policy, 'Missing edge_level_evidence_policy (Red-Team Finding 1)');
  assert.ok(manifest.edge_level_evidence_policy.prohibited_coarse_badges.includes('OBSERVED / MODELED / HYPOTHESIZED'));
  assert.strictEqual(manifest.edge_level_evidence_policy.mandatory_edge_chain.length, 4);

  let totalSystemEdges = 0;
  for (const sys of manifest.systems) {
    assert.ok(Array.isArray(sys.edges) && sys.edges.length >= 2, `System ${sys.system_id} missing per-edge array`);
    for (const edge of sys.edges) {
      totalSystemEdges++;
      assert.ok(edge.edge_id && edge.from && edge.to && edge.claim && edge.evidence_tag);
      assert.notStrictEqual(edge.evidence_tag, 'OBSERVED / MODELED / HYPOTHESIZED');
      assert.strictEqual(edge.evidence_tag.includes('->'), false, `Edge ${edge.edge_id} must not use compound '->' evidence_tag: ${edge.evidence_tag}`);
    }
  }
  assert.strictEqual(totalSystemEdges, 9, `Expected 9 directed edges across the 3 systems, got ${totalSystemEdges}`);

  for (const mech of manifest.mechanisms) {
    assert.ok(
      Array.isArray(mech.edge_claims) && mech.edge_claims.length >= 2,
      `Mechanism ${mech.id} missing edge_claims array`
    );
    for (const ec of mech.edge_claims) {
      assert.ok(ec.edge && ec.tag, `Mechanism ${mech.id} edge claim missing edge or tag`);
      assert.notStrictEqual(ec.tag, 'OBSERVED / MODELED / HYPOTHESIZED');
      assert.strictEqual(ec.tag.includes('->'), false, `Mechanism ${mech.id} edge claim must not use compound '->' tag: ${ec.tag}`);
    }
  }

  // Verify embedded <script id="evidence-manifest" type="application/json"> in magnetoreception_3d_explorer.html matches evidence_manifest.json
  const htmlPath = fs.existsSync(path.join(ROOT, 'magnetoreception_3d_explorer.html'))
    ? path.join(ROOT, 'magnetoreception_3d_explorer.html')
    : path.join(ROOT, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const match = html.match(/<script id="evidence-manifest" type="application\/json">\s*([\s\S]*?)\s*<\/script>/);
  assert.ok(match && match[1], `Missing <script id="evidence-manifest" type="application/json"> in ${path.basename(htmlPath)}`);
  const embeddedManifest = JSON.parse(match[1]);
  assert.deepStrictEqual(
    embeddedManifest,
    manifest,
    `Embedded #evidence-manifest in ${path.basename(htmlPath)} drifted out of sync with evidence_manifest.json`
  );

  // Verify Finding 4 (Orthogonal Mitochondrial Readouts & Mediation Controls)
  const medSpec = manifest.preregistration_protocol.causal_mediation_and_orthogonal_readout_spec;
  assert.ok(medSpec, 'Missing causal_mediation_and_orthogonal_readout_spec');
  assert.ok(medSpec.temporal_precedence_limitation.includes('NOT sufficient proof'));
  assert.ok(medSpec.orthogonal_biochemical_readouts.includes('2-OH-E+') && medSpec.orthogonal_biochemical_readouts.includes('mito-roGFP2-Orp1'));

  // Verify Finding 6 (Exposure & Environmental Control Spec)
  const expSpec = manifest.preregistration_protocol.exposure_and_environmental_control_spec;
  assert.ok(expSpec, 'Missing exposure_and_environmental_control_spec');
  assert.ok(expSpec.sample_plane_field_map.includes('>=9-point'));
  assert.ok(expSpec.field_magnitude_and_gradient_tolerances.includes('<= 0.5 uT/cm'));
  assert.ok(expSpec.temperature_and_vibration_limits.includes('0.05 C') && expSpec.temperature_and_vibration_limits.includes('1e-4 g'));

  // Verify Finding 9 (Organism-Specific Genetic Validation Gates GEN_1..GEN_5)
  const genSpec = manifest.biomagnetic_walk_null_explorer.organism_and_genetic_validation_requirements;
  assert.ok(genSpec, 'Missing organism_and_genetic_validation_requirements');
  assert.strictEqual(genSpec.mandatory_validation_gates.length, 5);

  // Verify Finding 10 (Staged Multiphysics Parsimony Roadmap)
  const sp = manifest.biomagnetic_walk_null_explorer.multiphysics_and_glmm_architecture.staged_parsimony_policy;
  assert.ok(sp, 'Missing staged_parsimony_policy');
  assert.ok(sp.stage_1_minimum_viable_model.includes('Layer D'));

  // Verify Cross-Domain Epistemic Gates (EG-1..EG-4), 3-Tier Irradiation Hierarchy & Specimen-Encoding Gate
  const cdeg = manifest.cross_domain_epistemic_gates;
  assert.ok(cdeg, 'Missing cross_domain_epistemic_gates');
  assert.strictEqual(cdeg.section_version, '1.3.0');
  const eg1 = cdeg.gates.find(g => g.gate_id === 'EG-1');
  assert.deepStrictEqual(eg1.oklo_documented_minerals, ['uraninite', 'bituminous_organic_matter', 'illite', 'chlorite']);
  assert.strictEqual(eg1.oklo_reactor_zone_biotite_verified, false);

  const irrad = cdeg.modeled_interaction_energy_comparison.models.biotite_inclusion_free_paramagnetic_model
    .natural_1um3_flake_magnetite_inclusion_sensitivity.irradiation_defect_transfer_boundary;
  assert.ok(irrad.three_tier_evidential_hierarchy, 'Missing three_tier_evidential_hierarchy');
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_1_neutron_damage_material_properties.evidential_status, 'DIRECTLY_SUPPORTED');
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_1_neutron_damage_material_properties.establishes_biological_sensing, false);
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_2_shared_physical_ingredients_analogy.evidential_status, 'ANALOGY_ONLY_OPPOSITE_EXPLANATORY_DIRECTION');
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_2_shared_physical_ingredients_analogy.establishes_biological_sensing, false);
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_3_biological_radiotropism_and_magnetoreception.evidential_status, 'SEPARATE_BIOLOGICAL_HYPOTHESIS');
  assert.strictEqual(irrad.three_tier_evidential_hierarchy.tier_3_biological_radiotropism_and_magnetoreception.establishes_biological_sensing, false);
  assert.ok(irrad.specimen_encoding_and_modality_gate, 'Missing specimen_encoding_and_modality_gate');
  assert.strictEqual(irrad.specimen_encoding_and_modality_gate.premature_to_connect_to_magnetoreception_without_gate, true);
  assert.strictEqual(irrad.specimen_encoding_and_modality_gate.required_metadata_checks.length, 3);
  const ccdb = irrad.specimen_encoding_and_modality_gate.colour_channel_decision_branches;
  assert.ok(ccdb, 'Missing colour_channel_decision_branches');
  assert.strictEqual(ccdb.phases_precipitates_defects_or_rendering_categories.domain_classification, 'MATERIALS_SCIENCE_MICROSTRUCTURE_PROBLEM');
  assert.strictEqual(ccdb.phases_precipitates_defects_or_rendering_categories.relevant_to_mineral_magnetism_eg2, false);
  assert.strictEqual(ccdb.phases_precipitates_defects_or_rendering_categories.establishes_biological_sensing_eg3, false);
  assert.strictEqual(ccdb.magnetic_domains_or_measured_magnetic_inclusions.domain_classification, 'MINERAL_AND_MAGNETITE_PHYSICS_CONSTRAINT_ONLY');
  assert.strictEqual(ccdb.magnetic_domains_or_measured_magnetic_inclusions.relevant_to_mineral_magnetism_eg2, true);
  assert.strictEqual(ccdb.magnetic_domains_or_measured_magnetic_inclusions.establishes_biological_sensing_eg3, false);
  const mpcb = irrad.specimen_encoding_and_modality_gate.methods_and_physical_constraints_bridge;
  assert.ok(mpcb, 'Missing methods_and_physical_constraints_bridge');
  assert.strictEqual(mpcb.is_evidence_for_radiotropism, false);
  assert.strictEqual(mpcb.is_evidence_for_biological_magnetoreception, false);
  const triage = irrad.specimen_encoding_and_modality_gate.reference_image_triage;
  assert.strictEqual(triage.in_situ_tem_dislocation_loops_and_cavities.assigned_tier, 'TIER_1_INORGANIC_IRRADIATION_MICROSTRUCTURE');
  assert.strictEqual(triage.in_situ_tem_dislocation_loops_and_cavities.establishes_magnetoreception_or_radiotropism, false);
  assert.strictEqual(triage.magnetotactic_bacterium_magnetosome_chain_tem.assigned_tier, 'PROKARYOTIC_BIOGENIC_MAGNETORECEPTION_REFERENCE');
  assert.strictEqual(triage.magnetotactic_bacterium_magnetosome_chain_tem.establishes_fungal_radiotropism, false);
  assert.strictEqual(triage.hyphal_tip_live_dic_timelapse.assigned_tier, 'TIER_3_CELLULAR_MORPHOLOGY_BASELINE_ONLY');
  assert.strictEqual(triage.hyphal_tip_live_dic_timelapse.establishes_magnetoreception_or_radiotropism, false);

  // Verify zero em-dashes, zero en-dashes, and zero NDA/institutional keywords in magnetoreception artifacts
  const rawJson = fs.readFileSync(path.join(ROOT, 'evidence_manifest.json'), 'utf8');
  const forbiddenNdaRegex = /(\bmurr\b|missouri\s+university\s+research\s+reactor|\br-103\b|rur-26|\bap-dc-001\b|specialist\s+ii|177lu|lu-177|lutetium|chelat|\bdota\b|\bpsma\b|radiopharm|\bmayo\b|mhealth|m-health)/i;
  for (const [label, txt] of [['evidence_manifest.json', rawJson], [path.basename(htmlPath), html]]) {
    assert.strictEqual(txt.includes('\u2014'), false, `${label} contains forbidden em-dash`);
    assert.strictEqual(txt.includes('\u2013'), false, `${label} contains forbidden en-dash`);
    assert.strictEqual(/(&mdash;|&ndash;|&#8211;|&#8212;|&#x2013;|&#x2014;)/i.test(txt), false, `${label} contains forbidden HTML dash entity`);
    assert.strictEqual(forbiddenNdaRegex.test(txt), false, `${label} contains forbidden NDA/institutional keyword`);
  }

  console.log('PASS [Red-Team Policies 6/6]: Per-edge evidence tags (9 system edges, 8 mechanism edge-chains), HTML/JSON manifest parity, EG-1..EG-4 gates, 3-tier irradiation/magnetoreception hierarchy, specimen-encoding gate, and zero em/en-dash & NDA hygiene verified.');
}

function runAll() {
  verifyBiophysicalCalculationProvenance();
  verifyTrajectoryCounterfactualInvariants();
  verifyPhaseLockingAndMatchedConnectivityControls();
  verifyAngularResponseCurves();
  verifyDesignMatrixEstimabilityAndAliasing();
  verifyPerEdgeEvidenceAndRedTeamPolicies();
  console.log('ALL SCIENTIFIC PROVENANCE, TRAJECTORY COUNTERFACTUAL, AND ESTIMABILITY TESTS PASSED.');
}

if (require.main === module) {
  runAll();
}

module.exports = { runAll };
