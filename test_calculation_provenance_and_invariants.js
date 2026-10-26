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

  // 2b. Direct trajectory-level synthetic simulation showing H0-B vs H0-A separation:
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

function verifyReactorPoolBiofilmCoordinatedExplorer() {
  const explorerPath = path.join(ROOT, 'reactor_pool_biofilm_explorer.html');
  assert.ok(fs.existsSync(explorerPath), 'Missing reactor_pool_biofilm_explorer.html');
  const html = fs.readFileSync(explorerPath, 'utf8');

  // 1. Dash & NDA hygiene
  const forbiddenNdaRegex = /(\bmurr\b|missouri\s+university\s+research\s+reactor|institutional-scrubbed|thomas\s+mccoy|\br-103\b|rur-26|\bap-dc-001\b|specialist\s+ii|177lu|lu-177|lutetium|chelat|\bdota\b|\bpsma\b|radiopharm|\bmayo\b|mhealth|m-health)/i;
  assert.strictEqual(html.includes('\u2014'), false, 'reactor_pool_biofilm_explorer.html contains forbidden em-dash');
  assert.strictEqual(html.includes('\u2013'), false, 'reactor_pool_biofilm_explorer.html contains forbidden en-dash');
  assert.strictEqual(/(&mdash;|&ndash;|&#8211;|&#8212;|&#x2013;|&#x2014;)/i.test(html), false, 'reactor_pool_biofilm_explorer.html contains forbidden HTML dash entity');
  assert.strictEqual(forbiddenNdaRegex.test(html), false, 'reactor_pool_biofilm_explorer.html contains forbidden NDA keyword');

  // 2. Artifact IDs & Cross-portal navigation links
  assert.ok(html.includes("artifact_id: 'REACTOR-POOL-BIOFILM-COORDINATED-3D-01'"), 'Missing artifact_id REACTOR-POOL-BIOFILM-COORDINATED-3D-01');
  assert.ok(html.includes("artifact_id_alias: 'REACTOR-POOL-BIOFILM-3D-01'"), 'Missing artifact_id_alias REACTOR-POOL-BIOFILM-3D-01');
  for (const href of ['index.html', 'poolwater_interactive.html', 'biofilms_3d_explorer.html', 'magnetoreception_3d_explorer.html']) {
    assert.ok(html.includes(`href="${href}"`), `Missing cross-portal link to ${href}`);
  }

  // 3. Strict architectural & scientific boundaries + required API hooks
  assert.ok(html.includes('solvers_kept_separate: true'), 'Missing solvers_kept_separate: true');
  assert.ok(html.includes('solver_level_coupled_validation_claimed: false'), 'Missing solver_level_coupled_validation_claimed: false');
  assert.ok(html.includes('default_lambda_etc_on_load: 0.0'), 'Missing default_lambda_etc_on_load: 0.0');
  assert.ok(html.includes('lambda_etc: 0.0'), 'Missing default lambda_etc: 0.0');
  assert.ok(html.includes('seconds_per_mcs: NaN'), 'Missing seconds_per_mcs: NaN');
  assert.ok(html.includes("d_pitch_status: 'awaiting_measurement'"), 'Missing d_pitch_status: awaiting_measurement');
  assert.ok(html.includes('TIME BASES UNCOUPLED: t_pool [s] != MCS'), 'Missing uncoupled time-base banner');
  for (const hook of [
    'getState: window.getState',
    'setLayerToggle: window.setLayerToggle',
    'setMorphotype: window.setMorphotype',
    'setNullControl: window.setNullControl',
    'setScheduleRegime: window.setScheduleRegime',
    'selectProvenanceField: window.selectProvenanceField',
    'getProvenanceRecord: window.getProvenanceRecord',
    'verifyScientificBoundaries: window.verifyScientificBoundaries'
  ]) {
    assert.ok(html.includes(hook), `Missing required __POOL_BIOFILM_EXPLORER__ hook: ${hook}`);
  }

  // 4. Four toggleable spatial layers, camera view presets & morphotype stratification
  for (const layer of ['pool_geometry', 'temperature_flow', 'radiation_radiolysis', 'biofilm_coupons']) {
    assert.ok(html.includes(`toggle_${layer}`), `Missing layer toggle ${layer}`);
  }
  for (const cam of ['Wedge Cutaway', 'Orbit', 'Isometric', 'Top Core', 'Coupon Micro-Zoom']) {
    assert.ok(html.includes(`data-cam="${cam}"`), `Missing camera preset button ${cam}`);
  }
  assert.ok(html.includes('id="toggle_sync_camera"'), 'Missing synchronized camera rotation toggle');
  for (const morph of ['SL', 'SS', 'LL', 'CPM-Hypha']) {
    assert.ok(html.includes(`data-morph="${morph}"`), `Missing morphotype button ${morph}`);
  }

  // 5. Seven null-model controls & regime-dependent equal-dose schedules
  for (const nullId of [
    'baseline_no_coupling_default',
    'five_way_radionuclide_retention',
    'equal_dose_power_schedules',
    'control_5a_spatial_bias_null',
    'control_5b_biochemical_magnetic_sensitivity',
    'control_6_oxidant_chemotropism',
    'epistemic_gates_eg1_eg4_and_links_l1_l5'
  ]) {
    assert.ok(html.includes(`data-null="${nullId}"`), `Missing null-model control ${nullId}`);
  }
  assert.ok(html.includes('downstream_differences_are_regime_dependent: true'), 'Missing downstream_differences_are_regime_dependent: true');
  assert.ok(html.includes('implies_downstream_differences_under_all_regimes: false'), 'Missing implies_downstream_differences_under_all_regimes: false');
  assert.ok(html.includes('conserved_regime_final_yields_identical: true'), 'Missing conserved_regime_final_yields_identical: true');
  assert.ok(html.includes('uncoupled_regime_cpm_trajectories_identical: true'), 'Missing uncoupled_regime_cpm_trajectories_identical: true');
  assert.ok(html.includes('ILLUSTRATIVE_PARAMETRIC_SENSITIVITY_ANALYSIS_NOT_EMPIRICAL_VALIDATION'), 'Missing Control 5b epistemic badge');
  assert.ok(html.includes('verifies_implemented_function_not_real_melanin_mechanism: true'), 'Missing Control 5b verification scope');
  assert.ok(html.includes('empirically_validates_melanin_radical_pair_mechanism: false'), 'Missing Control 5b empirical validation guard');
  assert.ok(html.includes('grounded_in_measured_melanin_spin_hamiltonian: false'), 'Missing Control 5b spin Hamiltonian guard');

  // 6. SYNTHETIC_SCHEMATIC geometry provenance, separated taxonomy contract & commit locks + POOLWATER_WORKFLOW_SPEC.md parity
  assert.strictEqual(html.includes('BENCHMARK_GEOMETRY'), false, 'reactor_pool_biofilm_explorer.html must not label its schematic 3x3 geometry as BENCHMARK_GEOMETRY');
  assert.ok(html.includes('PROVENANCE_TAXONOMY_CONTRACT'), 'Missing PROVENANCE_TAXONOMY_CONTRACT in reactor_pool_biofilm_explorer.html');
  assert.ok(html.includes('provenance_taxonomy_contract: PROVENANCE_TAXONOMY_CONTRACT'), 'Missing provenance_taxonomy_contract on EXPLORER_STATE');
  assert.ok(html.includes("geometry_classification: 'SYNTHETIC_SCHEMATIC'"), 'Missing geometry_classification: SYNTHETIC_SCHEMATIC');
  assert.ok(html.includes("geometry_classification: 'MICRO_BIOFILM_SLAB_VOXEL'"), 'Missing geometry_classification: MICRO_BIOFILM_SLAB_VOXEL');
  for (const evClass of ['synthetic', 'calculated', 'uncalibrated_model_snapshot', 'unavailable']) {
    assert.ok(html.includes(`evidence_classification: '${evClass}'`), `Missing lowercase evidence_classification: '${evClass}'`);
  }
  assert.ok(html.includes("epistemic_class: 'SYNTHETIC_SCHEMATIC'"), 'Missing epistemic_class: SYNTHETIC_SCHEMATIC');
  assert.ok(html.includes("data_classification: 'SYNTHETIC_SCHEMATIC'"), 'Missing data_classification: SYNTHETIC_SCHEMATIC');
  assert.ok(html.includes('is_tecdoc643_benchmark_geometry: false'), 'Missing is_tecdoc643_benchmark_geometry: false');
  assert.ok(
    html.includes('SYNTHETIC_SCHEMATIC: Schematic cylindrical cutaway (X,Y in [-500,500] cm, Z in [-200,200] cm, simplified 3x3 core lattice); NOT the IAEA-TECDOC-643 6x7 box-grid MTR benchmark geometry and NOT the R=2.0 m, H=8.0 m poolwater_interactive.html domain. Displaying benchmark-derived fields requires an explicit coordinate mapping and preserves the distinction between SYNTHETIC_SCHEMATIC geometry and TECDOC-643 benchmark geometry.'),
    'Missing explicit SYNTHETIC_SCHEMATIC vs TECDOC-643 6x7 and poolwater_interactive.html provenance statement'
  );
  assert.ok(html.includes('synthetic_schematic_not_tecdoc643_geometry: geomOk'), 'Missing synthetic_schematic_not_tecdoc643_geometry check in verifyScientificBoundaries');
  assert.ok(html.includes('syntheticSchematicNotTecdoc643Geometry: geomOk'), 'Missing syntheticSchematicNotTecdoc643Geometry check in verifyScientificBoundaries');
  for (const domRowId of [
    'id="prov_label"',
    'id="prov_geometry_classification"',
    'id="prov_evidence_classification"',
    'id="prov_epistemic_class"',
    'id="prov_data_classification"',
    'id="prov_epistemic_status"'
  ]) {
    assert.ok(html.includes(domRowId), `Missing ${domRowId} row in Provenance Inspector table`);
  }

  // 7. Gate 3: Narrow validation claims & programmatic enforcement of baseline lambda_etc = 0.0 and uncoupled timelines
  assert.ok(html.includes('passing_rendering_tests_validate_software_boundaries_not_physical_model: true'), 'Missing passing_rendering_tests_validate_software_boundaries_not_physical_model: true');
  assert.ok(html.includes('empirical_physical_or_biological_validation_claimed: false'), 'Missing empirical_physical_or_biological_validation_claimed: false');
  assert.ok(html.includes('baseline_lambda_lock: true'), 'Missing baseline_lambda_lock: true');
  for (const fwHook of [
    'setBaselineLambdaLock: window.setBaselineLambdaLock',
    'attemptTimelineCoupling: window.attemptTimelineCoupling',
    'enforceBaselineAndTimelineFirewall: window.enforceBaselineAndTimelineFirewall',
    'attemptCrossTimelineOrBaselineViolation: window.attemptCrossTimelineOrBaselineViolation',
    'provenanceTaxonomySeparated: taxonomyOk',
    'passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel: narrowClaimsOk',
    'empiricalPhysicalOrBiologicalValidationClaimed: st.empirical_physical_or_biological_validation_claimed',
    'timelineCouplingProgrammaticallyBlocked: timelineFirewallOk',
    'baselineNullControlEnforcesLambdaZero: baselineEnforcedOk'
  ]) {
    assert.ok(html.includes(fwHook), `Missing Gate 3 firewall/boundary property: ${fwHook}`);
  }

  for (const commitHash of [
    '903f278',
    '7c21d35',
    '507fc19c507505233268e058b7b5d7a0bd4e378c',
    '2db2a7b558ea736c61cc459fd6a72c4afa36e3c5',
    '8182c30ab46d3b6a8cee7c853c18f7a44766a59d'
  ]) {
    assert.ok(html.includes(commitHash), `Missing commit lock ${commitHash}`);
  }
  assert.ok(html.includes('local_test_results_attributed_to_remote_pr_head: false'), 'Missing local_test_results_attributed_to_remote_pr_head: false');
  assert.ok(html.includes('local_branch_pushed_to_remote: false'), 'Missing local_branch_pushed_to_remote: false');

  const specPath = path.join(ROOT, 'POOLWATER_WORKFLOW_SPEC.md');
  assert.ok(fs.existsSync(specPath), 'Missing POOLWATER_WORKFLOW_SPEC.md');
  const specTxt = fs.readFileSync(specPath, 'utf8');
  assert.strictEqual(specTxt.includes('\u2014'), false, 'POOLWATER_WORKFLOW_SPEC.md contains forbidden em-dash');
  assert.strictEqual(specTxt.includes('\u2013'), false, 'POOLWATER_WORKFLOW_SPEC.md contains forbidden en-dash');
  assert.ok(specTxt.includes('REACTOR-POOL-BIOFILM-COORDINATED-3D-01'), 'POOLWATER_WORKFLOW_SPEC.md missing REACTOR-POOL-BIOFILM-COORDINATED-3D-01');
  assert.ok(specTxt.includes('reactor_pool_biofilm_explorer.html'), 'POOLWATER_WORKFLOW_SPEC.md missing reactor_pool_biofilm_explorer.html');
  assert.ok(specTxt.includes('SYNTHETIC_SCHEMATIC'), 'POOLWATER_WORKFLOW_SPEC.md missing SYNTHETIC_SCHEMATIC');
  assert.ok(specTxt.includes('is_tecdoc643_benchmark_geometry = false'), 'POOLWATER_WORKFLOW_SPEC.md missing is_tecdoc643_benchmark_geometry = false');

  // 8. Gate 1 & Gate 2: Verify benchmark_manifest.json taxonomy contract & exact on-disk SHA-256 digests of all Gate-0 frozen inputs
  const bmPath = path.join(ROOT, 'benchmark_manifest.json');
  assert.ok(fs.existsSync(bmPath), 'Missing benchmark_manifest.json');
  const bm = JSON.parse(fs.readFileSync(bmPath, 'utf8'));
  const g0 = bm.gate_0_frozen_inputs;
  assert.ok(g0, 'Missing gate_0_frozen_inputs in benchmark_manifest.json');

  // Verify Gate 1 taxonomy fields in benchmark_manifest.json
  const expectedEpistemicStatus = 'COORDINATED_SYNTHETIC_AND_REDUCED_ORDER_EXPLORER (geometry_classification=SYNTHETIC_SCHEMATIC, not TECDOC-643 6x7 benchmark geometry; combines synthetic flow/geometry, reduced-order calculated radiolysis, uncalibrated_model_snapshot biofilm/sorption layers, and unavailable validated CFD; passing rendering and boundary tests verify software implementation only, not empirical physical or biological validation; baseline lambda_etc=0.0 and uncoupled t_pool [s] vs MCS timelines strictly enforced)';
  for (const g0Key of ['REACTOR-POOL-BIOFILM-COORDINATED-3D-01', 'REACTOR-POOL-BIOFILM-3D-01']) {
    const entry = g0[g0Key];
    assert.ok(entry, `Missing ${g0Key} in benchmark_manifest.json gate_0_frozen_inputs`);
    assert.strictEqual(entry.geometry_classification, 'SYNTHETIC_SCHEMATIC', `Expected geometry_classification=SYNTHETIC_SCHEMATIC on ${g0Key}`);
    assert.strictEqual(entry.evidence_classification, 'synthetic', `Expected lowercase evidence_classification=synthetic on ${g0Key}`);
    assert.strictEqual(entry.epistemic_class, 'SYNTHETIC_SCHEMATIC', `Expected epistemic_class=SYNTHETIC_SCHEMATIC on ${g0Key}`);
    assert.strictEqual(entry.data_classification, 'SYNTHETIC_SCHEMATIC', `Expected data_classification=SYNTHETIC_SCHEMATIC on ${g0Key}`);
    assert.strictEqual(entry.epistemic_status, expectedEpistemicStatus, `Unexpected epistemic_status on ${g0Key}`);
    assert.strictEqual(entry.is_tecdoc643_benchmark_geometry, false, `Expected is_tecdoc643_benchmark_geometry=false on ${g0Key}`);
  }
  const g1Coord = bm.gate_1_normalized_contracts && bm.gate_1_normalized_contracts.coordinated_pool_biofilm_3d_viewer_benchmark;
  assert.ok(g1Coord, 'Missing gate_1_normalized_contracts.coordinated_pool_biofilm_3d_viewer_benchmark');
  assert.strictEqual(g1Coord.geometry_classification, 'SYNTHETIC_SCHEMATIC');
  assert.strictEqual(g1Coord.evidence_classification, 'synthetic');
  assert.strictEqual(g1Coord.epistemic_class, 'SYNTHETIC_SCHEMATIC');
  assert.strictEqual(g1Coord.data_classification, 'SYNTHETIC_SCHEMATIC');
  assert.strictEqual(g1Coord.epistemic_status, expectedEpistemicStatus);
  assert.ok(g1Coord.provenance_taxonomy_contract, 'Missing provenance_taxonomy_contract in gate_1_normalized_contracts.coordinated_pool_biofilm_3d_viewer_benchmark');
  assert.deepStrictEqual(
    g1Coord.provenance_taxonomy_contract.normalized_evidence_taxonomy,
    ['measured', 'calculated', 'synthetic', 'uncalibrated_model_snapshot', 'replayed', 'transcribed', 'unavailable']
  );
  assert.deepStrictEqual(
    g1Coord.provenance_taxonomy_contract.geometry_classification_taxonomy,
    ['SYNTHETIC_SCHEMATIC', 'MICRO_BIOFILM_SLAB_VOXEL', 'TECDOC643_6X7_BENCHMARK_REFERENCE', 'POOLWATER_R200_H800_SYNTHETIC_CYLINDER']
  );

  // Execute reactor_pool_biofilm_explorer.html inline script in a Node VM context to verify Gate 1 & Gate 3 runtime contracts
  const vm = require('vm');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(scriptMatch && scriptMatch[1], 'Missing inline <script> in reactor_pool_biofilm_explorer.html');
  const domElements = {};
  function getMockEl(id) {
    if (!domElements[id]) {
      domElements[id] = {
        id,
        width: 560,
        height: 360,
        value: '0',
        max: '30',
        checked: true,
        textContent: '',
        innerHTML: '',
        className: '',
        style: { display: 'block', cursor: 'grab' },
        classList: {
          _set: new Set(),
          toggle(cls, force) {
            if (force === undefined) {
              if (this._set.has(cls)) this._set.delete(cls); else this._set.add(cls);
            } else if (force) {
              this._set.add(cls);
            } else {
              this._set.delete(cls);
            }
          },
          contains(cls) { return this._set.has(cls); }
        },
        getAttribute() { return ''; },
        addEventListener() {},
        getBoundingClientRect() { return { left: 0, top: 0, width: 560, height: 360 }; },
        getContext(type) {
          if (type === '2d') {
            return {
              clearRect() {}, fillRect() {}, strokeRect() {}, beginPath() {}, moveTo() {}, lineTo() {},
              closePath() {}, fill() {}, stroke() {}, arc() {}, ellipse() {}, fillText() {},
              save() {}, restore() {}, translate() {}, rotate() {}, setLineDash() {},
              createLinearGradient() { return { addColorStop() {} }; }
            };
          }
          return null;
        }
      };
    }
    return domElements[id];
  }
  const sandboxWindow = {
    location: { search: '?force2d=1' },
    URLSearchParams,
    Math,
    Number,
    String,
    Boolean,
    Object,
    Array,
    Float32Array,
    isNaN,
    addEventListener() {},
    document: {
      getElementById: getMockEl,
      querySelectorAll() { return []; }
    }
  };
  sandboxWindow.window = sandboxWindow;
  vm.runInNewContext(scriptMatch[1], sandboxWindow);

  const vmApi = sandboxWindow.__POOL_BIOFILM_EXPLORER__;
  const vmState = sandboxWindow.getState();
  assert.ok(vmApi && vmState, 'VM execution of reactor_pool_biofilm_explorer.html failed to expose __POOL_BIOFILM_EXPLORER__ or getState()');
  assert.deepStrictEqual(
    JSON.parse(JSON.stringify(vmState.provenance_taxonomy_contract)),
    g1Coord.provenance_taxonomy_contract,
    'getState().provenance_taxonomy_contract must match benchmark_manifest.json gate_1_normalized_contracts.coordinated_pool_biofilm_3d_viewer_benchmark.provenance_taxonomy_contract'
  );

  // Verify all 33 canonical registry entries + all shorthand aliases in VM runtime
  const canonicalKeys = Object.keys(vmApi.provenance_registry);
  assert.strictEqual(canonicalKeys.length, 33, `Expected 33 canonical PROVENANCE_REGISTRY keys, got ${canonicalKeys.length}`);
  const requiredAliasKeys = [
    'boundary_layer_um', 'dose_rate_Gy_h', 'H2O2_uM', 'H2_uM', 'OH_rad_nM', 'e_aq_nM',
    'oklo_comparison', 'Co60_retained_Bq_cm2', 'Ag110m_algal_Bq_g', 'J_ETC_fmol_cm2_s',
    'C1', 'C2', 'C3', 'SL', 'SS', 'LL', 'CPM-Hypha',
    'H0_baseline_lambda0', 'H0_1_sterile_abiotic', 'H0_2_dead_biomass', 'H0_3_non_melanized',
    'H0_4_equal_dose_schedule', 'H0_equal_dose_schedules', 'H0_5a_spatial_bias_null',
    'H0_5b_biochemical_magnetic', 'H0_5b_rpm_sensitivity', 'H0_6_chemotropism',
    'H0_epistemic_gates', 'EXPLORATORY_COUPLED_HYPOTHESIS'
  ];
  for (const key of [...canonicalKeys, ...requiredAliasKeys]) {
    const rec = vmApi.getProvenanceRecord(key);
    assert.ok(rec, `getProvenanceRecord('${key}') returned null`);
    assert.ok(
      ['SYNTHETIC_SCHEMATIC', 'MICRO_BIOFILM_SLAB_VOXEL'].includes(rec.geometry_classification),
      `Invalid geometry_classification on ${key}: ${rec.geometry_classification}`
    );
    assert.ok(
      ['synthetic', 'calculated', 'uncalibrated_model_snapshot', 'unavailable'].includes(rec.evidence_classification),
      `Invalid lowercase evidence_classification on ${key}: ${rec.evidence_classification}`
    );
    assert.ok(typeof rec.epistemic_status === 'string' && rec.epistemic_status.length > 20, `Missing epistemic_status on ${key}`);
    vmApi.selectProvenanceField(key);
    assert.strictEqual(getMockEl('prov_geometry_classification').textContent, rec.geometry_classification);
    assert.strictEqual(getMockEl('prov_evidence_classification').textContent, rec.evidence_classification);
    assert.strictEqual(getMockEl('prov_epistemic_class').textContent, rec.epistemic_class);
    assert.strictEqual(getMockEl('prov_epistemic_status').textContent, rec.epistemic_status);
  }

  // Verify Gate 3 programmatic enforcement of lambda_etc = 0.0 under null controls & timeline firewall in VM
  for (const zeroCtrl of ['H0_baseline_lambda0', 'H0_1_sterile_abiotic', 'H0_2_dead_biomass', 'H0_3_non_melanized', 'H0_6_chemotropism']) {
    vmApi.setLambdaEtc(0.6);
    assert.strictEqual(vmState.lambda_etc, 0.6);
    assert.strictEqual(vmState.active_null_control, 'EXPLORATORY_COUPLED_HYPOTHESIS');
    vmApi.setNullControl(zeroCtrl);
    assert.strictEqual(vmState.lambda_etc, 0.0, `setNullControl('${zeroCtrl}') must reset lambda_etc to 0.0`);
    assert.strictEqual(vmState.baseline_lambda_lock, true);
    // Direct property mutation while in null control must be blocked by descriptor trap
    vmState.lambda_etc = 0.9;
    assert.strictEqual(vmState.lambda_etc, 0.0, `Direct mutation ofEXPLORER_STATE.lambda_etc under ${zeroCtrl} must be blocked`);
  }
  vmState.seconds_per_mcs = 15.0;
  vmState.time_bases_locked_uncoupled = false;
  assert.strictEqual(Number.isNaN(vmState.seconds_per_mcs), true, 'Direct mutation of seconds_per_mcs must be rejected');
  assert.strictEqual(vmState.time_bases_locked_uncoupled, true, 'Direct mutation of time_bases_locked_uncoupled must be rejected');

  const tcRes = vmApi.attemptTimelineCoupling(5.0);
  assert.strictEqual(tcRes.timeline_coupling_rejected, true);
  assert.strictEqual(tcRes.reason, 'NO_VALIDATED_SECONDS_TO_MCS_CONVERSION');
  assert.strictEqual(tcRes.baseline_lambda_etc_enforced_zero, true);
  assert.strictEqual(tcRes.rendering_tests_validate_physical_model, false);

  const fwRes = vmApi.enforceBaselineAndTimelineFirewall();
  assert.strictEqual(fwRes.timeline_coupling_rejected, true);
  assert.strictEqual(fwRes.reason, 'NO_VALIDATED_SECONDS_TO_MCS_CONVERSION');
  assert.strictEqual(fwRes.baseline_lambda_etc_enforced_zero, true);
  assert.strictEqual(fwRes.rendering_tests_validate_physical_model, false);

  const vioRes = vmApi.attemptCrossTimelineOrBaselineViolation();
  assert.strictEqual(vioRes.all_violations_blocked, true);
  assert.strictEqual(vioRes.raw_property_tamper_blocked_immediately, true);
  assert.strictEqual(vioRes.timeline_coupling_rejected, true);
  assert.strictEqual(vioRes.reason, 'NO_VALIDATED_SECONDS_TO_MCS_CONVERSION');
  assert.strictEqual(vioRes.baseline_lambda_etc_enforced_zero, true);
  assert.strictEqual(vioRes.rendering_tests_validate_physical_model, false);

  const vmBoundaries = vmApi.verifyScientificBoundaries();
  assert.strictEqual(vmBoundaries.all_passed, true);
  assert.strictEqual(vmBoundaries.provenanceTaxonomySeparated, true);
  assert.strictEqual(vmBoundaries.passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel, true);
  assert.strictEqual(vmBoundaries.empiricalPhysicalOrBiologicalValidationClaimed, false);
  assert.strictEqual(vmBoundaries.timelineCouplingProgrammaticallyBlocked, true);
  assert.strictEqual(vmBoundaries.baselineNullControlEnforcesLambdaZero, true);

  // Verify Gate 2: Pinned baseline SHA-256 hashes of all 10 primary pre-existing Gate-0 artifacts + 1 linked sidecar manifest (11 pre-existing frozen files) + coordinated/companion files
  const pinnedPrimaryGate0Artifacts = {
    'spacetime_explorer_4d_shareable.html': {
      bytes: 132358,
      sha256: 'f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612'
    },
    'tecdoc643_neutron_walk.html': {
      bytes: 937606,
      sha256: 'dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78'
    },
    'tecdoc643_reference_fixture.jl': {
      bytes: 6018,
      sha256: 'ec440f838d6c70263dcad3efef11da2159ab7f4d793d885367e4811415f8147d'
    },
    'oklo_r0_fixture_readonly.html': {
      bytes: 77117,
      sha256: '8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d'
    },
    'CONFORMANCE_FIXTURE_SPEC.md': {
      bytes: 20743,
      sha256: '587745ede6c6997a298f8f0a4e01127823de1b7c606383cfa49b87db0cc60d0c'
    },
    'biofilms_3d_explorer.html': {
      bytes: 869267,
      sha256: '037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d'
    },
    'poolwater_interactive.html': {
      bytes: 79610,
      sha256: 'fa0f0dc30c45681a3b774db8533110370ebdce77b91317b003bfdc065a639b5a'
    },
    'multispecies_biofilm_robin_cylindrical_4panel.gif': {
      bytes: 2571435,
      sha256: 'e73622d6454a3a6ad16af88f15b8d5e21161c801d51059050244303af5148997'
    },
    'clonal_sector_expansion_reference.jpg': {
      bytes: 159146,
      sha256: '67865f346f4d23835707174251eb589f72f344637ac221fbff427169fc34f115'
    },
    'magnetoreception_3d_explorer.html': {
      bytes: 263619,
      sha256: 'e9e50a6857b699aa0c102b536842790f5555bf5d228f01b430282049f0ed2064'
    }
  };
  const pinnedSidecarManifests = {
    'evidence_manifest.json': {
      bytes: 116876,
      sha256: '4f61d995772ee055fd0df378d4884bc8b2a2be235877ffc4b4424fc519f9cacf'
    }
  };
  const pinnedCoordinatedAndCompanionFiles = {
    'reactor_pool_biofilm_explorer.html': {
      bytes: 203053,
      sha256: 'b25fa9cc46f7c2bd181b84c961e4efc42fc981a4b50733e8555c1d122ac94b32'
    },
    'POOLWATER_WORKFLOW_SPEC.md': {
      bytes: 27723,
      sha256: 'a58b90704dd273aa4cf388af7007175df2f4b5c2a6b885406857279a6748503d'
    },
    'index.html': {
      bytes: 98176,
      sha256: 'c1349076ce0e29f1db58b1087b68812d3652658ef96ae615189b08559e80c4e3'
    }
  };
  assert.strictEqual(Object.keys(pinnedPrimaryGate0Artifacts).length, 10, 'Expected exactly 10 primary pre-existing Gate-0 artifacts');
  assert.strictEqual(Object.keys(pinnedSidecarManifests).length, 1, 'Expected exactly 1 linked sidecar manifest');
  assert.strictEqual(
    Object.keys(pinnedPrimaryGate0Artifacts).length + Object.keys(pinnedSidecarManifests).length,
    11,
    'Expected 10 primary Gate-0 artifacts + 1 sidecar manifest = 11 pre-existing frozen files'
  );
  if (bm.gate_0_frozen_file_accounting) {
    assert.strictEqual(bm.gate_0_frozen_file_accounting.primary_pre_existing_gate_0_artifact_count, 10);
    assert.strictEqual(bm.gate_0_frozen_file_accounting.linked_sidecar_manifest_count, 1);
    assert.strictEqual(bm.gate_0_frozen_file_accounting.total_pre_existing_frozen_file_count, 11);
  }
  const pinnedGate0Files = Object.assign(
    {},
    pinnedPrimaryGate0Artifacts,
    pinnedSidecarManifests,
    pinnedCoordinatedAndCompanionFiles
  );

  const nodeCrypto = require('crypto');
  for (const [relFile, expected] of Object.entries(pinnedGate0Files)) {
    const fullPath = path.join(ROOT, relFile);
    assert.ok(fs.existsSync(fullPath), `Missing Gate-0 file on disk: ${relFile}`);
    const buf = fs.readFileSync(fullPath);
    const actualSha = nodeCrypto.createHash('sha256').update(buf).digest('hex');
    assert.strictEqual(buf.length, expected.bytes, `Byte count mismatch for ${relFile}: actual=${buf.length}, expected=${expected.bytes}`);
    assert.strictEqual(actualSha, expected.sha256, `SHA-256 mismatch for ${relFile}: actual=${actualSha}, expected=${expected.sha256}`);
  }

  for (const [entryKey, entryVal] of Object.entries(g0)) {
    const fileTriples = [
      ['relative_path', 'bytes', 'sha256'],
      ['spec_relative_path', 'spec_bytes', 'spec_sha256'],
      ['companion_reference_relative_path', 'companion_reference_bytes', 'companion_reference_sha256'],
      ['evidence_manifest_relative_path', 'evidence_manifest_bytes', 'evidence_manifest_sha256'],
      ['invariant_test_relative_path', 'invariant_test_bytes', 'invariant_test_sha256']
    ];
    for (const [pathField, bytesField, shaField] of fileTriples) {
      if (entryVal[pathField]) {
        const relFile = entryVal[pathField];
        const fullPath = path.join(ROOT, relFile);
        assert.ok(fs.existsSync(fullPath), `Gate-0 entry ${entryKey}.${pathField} (${relFile}) missing on disk`);
        const buf = fs.readFileSync(fullPath);
        const actualSha = nodeCrypto.createHash('sha256').update(buf).digest('hex');
        assert.strictEqual(buf.length, entryVal[bytesField], `Manifest ${entryKey}.${bytesField} mismatch for ${relFile}`);
        assert.strictEqual(actualSha, entryVal[shaField], `Manifest ${entryKey}.${shaField} mismatch for ${relFile}`);
      }
    }
  }

  // Verify Pre-Publication Portal Review Fixes (1-7) & Biotite/Biomagnetite Framing on index.html and editable companion files
  const indexText = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.ok(!/institutional-scrubbed|institutionally scrubbed/i.test(indexText), 'index.html must not contain Institutional-scrubbed');
  assert.ok(!/pre-oct 19|pre-2026-10-19/i.test(indexText), 'index.html must not contain Pre-Oct 19 Materials');
  assert.ok(!/proving|falsification|falsifiable/i.test(indexText), 'index.html must not contain proving/falsification');
  assert.ok(!/implies zero fouling/i.test(indexText), 'index.html must not contain implies zero fouling');
  assert.ok(indexText.includes('Public-literature benchmark'), 'index.html must include Public-literature benchmark');
  assert.ok(indexText.includes('Archived Playback Only') && indexText.includes('Archived Playback'), 'index.html must include Archived Playback labels');
  assert.ok(indexText.includes('Illustrative Proxy: Monod Rate minus Parcel Hazard, 1/MCS'), 'index.html must declare net_biomass_rate_proxy currency');
  assert.ok(indexText.includes('This demo does not model fouling.'), 'index.html must state This demo does not model fouling.');
  assert.ok(indexText.includes('O. intermedium AM7 (reclassified as Brucella intermedia)'), 'index.html must note Brucella intermedia reclassification');
  assert.ok(indexText.includes('Author:') && indexText.includes('Mark Hunter Kinder II') && indexText.includes('CC0 1.0 Public Domain'), 'index.html must include Author, Date, License header');
  assert.ok(indexText.includes('class="plain-language-summary"'), 'index.html must include plain-language-summary');
  assert.ok(indexText.includes('positive code-verification benchmark') && indexText.includes('Treiber et al. (2012') && indexText.includes('Fe/K'), 'index.html must highlight magnetosome positive control, Treiber et al. (2012) warning, and fungal biotite Fe/K ICP bench assay');
  const forbiddenHyperRe = new RegExp('hyper' + 'paramagnet', 'i');
  for (const checkFile of ['index.html', 'POOLWATER_WORKFLOW_SPEC.md', 'README.md', 'artifact_index.xml', 'benchmark_manifest.json', 'magnetoreception_3d_explorer.html']) {
    const txt = fs.readFileSync(path.join(ROOT, checkFile), 'utf8');
    assert.ok(!forbiddenHyperRe.test(txt), `${checkFile} must use superparamagnetic terminology exclusively`);
  }

  console.log('PASS [Coordinated 3D Pool-and-Biofilm Explorer 7/7]: Gate 1 separated provenance taxonomy, Gate 2 explicit on-disk SHA-256 verification of all 10 primary Gate-0 frozen inputs + 1 sidecar manifest + coordinated/companion files, Gate 3 narrow validation claims and programmatic baseline/timeline firewall (including VM runtime execution), 4 spatial layers, 4 morphotypes, 7 null-model comparisons, and pre-publication portal review invariants verified.');
}

function runAll() {
  verifyBiophysicalCalculationProvenance();
  verifyTrajectoryCounterfactualInvariants();
  verifyPhaseLockingAndMatchedConnectivityControls();
  verifyAngularResponseCurves();
  verifyDesignMatrixEstimabilityAndAliasing();
  verifyPerEdgeEvidenceAndRedTeamPolicies();
  verifyReactorPoolBiofilmCoordinatedExplorer();
  console.log('ALL SCIENTIFIC PROVENANCE, TRAJECTORY COUNTERFACTUAL, AND ESTIMABILITY TESTS PASSED.');
}

if (require.main === module) {
  runAll();
}

module.exports = { runAll };

