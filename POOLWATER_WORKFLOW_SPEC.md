# Pool-Water Interactive Visualization & Benchmark Workflow Specification (`v1.0.0`)

## 1. Purpose and Epistemic Scope

This specification defines the five-gate migration workflow (`Gate 0` through `Gate 4`) that extends the Oklo & IAEA-TECDOC-643 Shareable Portal (`https://aurascoper.github.io/oklo_shareable_portal/`) with:
1. A standalone, offline-capable **Pool-Water Interactive Viewer** ([`poolwater_interactive.html`](poolwater_interactive.html), artifact ID `POOLWATER-3D-INTERACTIVE-01`).
2. A **Coupled Comparison Mode** in [`index.html`](index.html) (`View 7`) that coordinates the pool-water thermal-hydraulic and core overlays with the TECDOC-643 neutron-walk reference only when they share a verified scenario, geometry mapping, and time basis, and otherwise labels them explicitly as independent reference panels.
3. A normalized, versioned, machine-readable **Benchmark Contract Manifest** ([`benchmark_manifest.json`](benchmark_manifest.json), schema `oklo_tecdoc_poolwater_benchmark_contract_v1`).
4. A demarcated **3D Cellular Potts Biofilms Consortium Explorer** ([`biofilms_3d_explorer.html`](biofilms_3d_explorer.html), artifact ID `BIOFILMS-3D-CPM-01`, schema `biofilms_cpm_snapshot_bundle_v1`) and a **Four-Stage Surrogate Water-Loop & Post-Irradiation Examination (PIE) Materials-Compatibility Protocol** synchronized with `RadioPharmacology.jl`.

Core architectural principle: we migrate the **workflow, evidence qualification, and visualization layers**, while preserving the original benchmark artifacts byte-identical as the source of truth and never relabeling a client-side neutron-walk demonstration or prescribed analytical field as a live four-dimensional coupled CFD + neutron-transport solver.

---

## 2. Artifact Reuse and Epistemic Boundary Matrix

| Existing / Added Artifact | Reuse in the Pool-Water Workflow | Strictly Do Not Imply |
| :--- | :--- | :--- |
| **TECDOC-643 Neutron Walk** ([`tecdoc643_neutron_walk.html`](tecdoc643_neutron_walk.html), `REF-NW-HTML-01`) | 10 MW MTR 5x6 box-grid core geometry (23 SFE + 5 CFE), 2D/3D slice interaction, 500-track OpenMC 0.15.3 playback, reference $k_{\text{eff}}$ and reaction tallies | That animated client-side particles are a live OpenMC calculation or validated 4D reactor solver |
| **TECDOC Julia Reference Fixture** ([`tecdoc643_reference_fixture.jl`](tecdoc643_reference_fixture.jl), `REF-NW-JL-FIX`) | Regression tests for point-reactor reactivity algebra ($\rho = (k-1)/k$, $\Delta\rho$, $\sigma_{\Delta\rho}$), 5-point blade sweep, 12-point depletion table, and linear $k_{\text{eff}} = 1$ crossing (`340.2540 d`) | That transcribed values are independently regenerated from raw OpenMC statepoints or calibrated to an annular pressurized MTR core |
| **Oklo Revision-0 Fixture** ([`oklo_r0_fixture_readonly.html`](oklo_r0_fixture_readonly.html), [`CONFORMANCE_FIXTURE_SPEC.md`](CONFORMANCE_FIXTURE_SPEC.md), `OKLO-R0-FROZEN-FIXTURE`) | Frozen $32 \times 32 \times 32$ voxel-generation and export/conformance test discipline | That prescribed analytic geochemistry fields are an empirical reconstruction of an ancient reactor or pool-water CFD data |
| **R10 4D Spatiotemporal Explorer** ([`spacetime_explorer_4d_shareable.html`](spacetime_explorer_4d_shareable.html), `R10-4D-SHAREABLE-HTML`) | Time-scrubber UI, synchronized field inspection, viewport and timeline patterns | That its prescribed analytical 3D Gaussian advection-diffusion-decay pulse is a validated transient PDE solution |
| **Biofilms 3D Cellular Potts Explorer** ([`biofilms_3d_explorer.html`](biofilms_3d_explorer.html), `BIOFILMS-3D-CPM-01`) | Demarcated optional research view: $40 \times 40 \times 40$ uncalibrated lattice (`Seed 42`, `MCS 0..100`), 256-seed 4-arm radial null (`full`, `no_rad`, `no_mel`, `null`), `cpm-sp-v1` selection-vs-displacement audit, and `15/16` synthetic phase-locking audit | That uncalibrated Potts parcels (`D-PITCH: awaiting_measurement`, `seconds_per_mcs = NaN`) represent calibrated biofilm rheology, directional radiotropism, or an operating MTR pool biofilm issue |
| **Pool-Water Interactive Viewer** ([`poolwater_interactive.html`](poolwater_interactive.html), `POOLWATER-3D-INTERACTIVE-01`) | Offline dataset-driven 3D core-and-pool visualization with time scrubbing (`t = 0..600 s`), cut planes, synthetic Boussinesq natural-convection temperature and velocity fields, core power/flux overlays, explicit `UNAVAILABLE` field handling, and TECDOC-643 benchmark verification | That synthetic demonstration fields are a live coupled 4D RANS/LES CFD + Monte Carlo neutron-transport calculation |

---

## 3. Five-Gate Migration Workflow

### Gate 0: Freeze and Identify the Inputs
All existing benchmark and reference artifacts are pinned by commit SHA, byte count, SHA-256 digest, benchmark configuration, units, reference values, and evidence classification in [`artifact_index.xml`](artifact_index.xml) and [`benchmark_manifest.json`](benchmark_manifest.json):
- [`spacetime_explorer_4d_shareable.html`](spacetime_explorer_4d_shareable.html): `132,358` bytes, SHA-256 `f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612` (`prescribed_analytical_synthetic_model`, untouched).
- [`tecdoc643_neutron_walk.html`](tecdoc643_neutron_walk.html): `937,606` bytes, SHA-256 `dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78` (`external_design_reference`, untouched).
- [`oklo_r0_fixture_readonly.html`](oklo_r0_fixture_readonly.html): `77,117` bytes, SHA-256 `8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d` (`prescribed_analytic_field`, untouched).
- [`CONFORMANCE_FIXTURE_SPEC.md`](CONFORMANCE_FIXTURE_SPEC.md): `20,743` bytes, SHA-256 `587745ede6c6997a298f8f0a4e01127823de1b7c606383cfa49b87db0cc60d0c` (`frozen_conformance_specification`, untouched).
- [`biofilms_3d_explorer.html`](biofilms_3d_explorer.html): `869,267` bytes, SHA-256 `037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d` (`uncalibrated_model_snapshot_reference`, generated from `/tmp/build_biofilms_3d_explorer.py`).
- [`tecdoc643_reference_fixture.jl`](tecdoc643_reference_fixture.jl): `6,018` bytes, SHA-256 `ec440f838d6c70263dcad3efef11da2159ab7f4d793d885367e4811415f8147d` (`transcribed_unverified_reference_fixture`, generic MTR nomenclature aligned with `RadioPharmacology.jl/test/tecdoc643_reference_fixture.jl`; upstream un-scrubbed reference digest `813c9e9fb33e47d9ceead8ea8f08bf07122583cf4292aab651d4f919a572a849`, `5,951` bytes).

### Gate 1: Normalize the Benchmark Contract
[`benchmark_manifest.json`](benchmark_manifest.json) defines schema `oklo_tecdoc_poolwater_benchmark_contract_v1`, normalizing:
- **Geometry & Coordinate Systems**:
  - `MTR_POOL_CARTESIAN_CM`: Right-handed Cartesian $(x, y, z)$ in $\text{cm}$ with $+z$ vertical upward along the pool column; active 5x6 MTR core $[-30.8, 30.8]\text{ cm} \times [-33.425, 33.425]\text{ cm} \times [-30.0, 30.0]\text{ cm}$ inside a $300\text{ cm}$ diameter, $600\text{ cm}$ visualized open-pool water column ($z \in [-150, 450]\text{ cm}$).
  - `OKLO_R10_VOXEL_M`: $12 \times 12 \times 12$ continuum geochemistry lattice with $+k$ vertical upward ($t \in \{0, 250, 500, 750, 1000\}\text{ s}$).
  - `BIOFILMS_CPM_LATTICE_SITES`: $40 \times 40 \times 40$ discrete lattice sites ($1..40$, `D-PITCH: awaiting_measurement`, `seconds_per_mcs = NaN`).
- **Evidence Classification Enum**: Every dataset and field is tagged as one of `measured`, `calculated`, `transcribed`, `replayed`, `synthetic`, `uncalibrated_model_snapshot`, or `unavailable`.

### Gate 2: Retain Independent Physics Modules
Inside [`poolwater_interactive.html`](poolwater_interactive.html), four independent modules (`window.PoolWaterModules`) communicate only through explicit, read-only interfaces:
1. `NeutronTransportReference`: Holds the recorded IAEA-TECDOC-643 10 MW MTR configuration, 5-point blade sweep, 2-point 2M-history reference, and 12-point depletion table. Never fabricates live Monte Carlo histories or transfers box-grid MTR values to an annular MTR core.
2. `ReactorKineticsAlgebra`: Pure functional point-reactor reactivity evaluator ($\rho = (k-1)/k$, $\Delta\rho$, $\sigma_{\Delta\rho}$, linear $k_{\text{eff}} = 1$ crossing interpolation).
3. `PoolThermalHydraulicsSynthetic`: Offline dataset-driven 4D (3D spatial grid $16 \times 16 \times 24$ across 6 timestamps $t \in \{0, 30, 60, 120, 300, 600\}\text{ s}$) synthetic Boussinesq natural-convection velocity field $\mathbf{u}(x,y,z,t)$ (constructed from an analytic divergence-free Stokes streamfunction $\psi(r,z,t)$ satisfying $\nabla \cdot \mathbf{u} = 0$) and thermal plume $T(x,y,z,t)$. Does not ingest or relabel the Oklo Revision-0 analytic geochemistry voxels as water flow.
4. `SurrogateLoopBiofilmPIEBoundary`: Encapsulates the 4-stage surrogate water-loop and PIE materials-compatibility protocol and enforces the hard firewall (`altersReactorKineticsOrPoolCFD = false`, `canIssueCgmpVerdict = false`).

### Gate 3: Build the Interactive Pool-Water View & Coupled Comparison
- [`poolwater_interactive.html`](poolwater_interactive.html) provides:
  - 3D WebGL core-and-pool visualization with rotatable camera, cylindrical pool boundary, 5x6 MTR core elements (23 SFE, 5 CFE, graphite reflectors, central flux trap), interactive control-blade insertion ($0\%, 25\%, 50\%, 75\%, 100\%$), 3D velocity vectors and buoyant streamlines, translucent cut planes, and the external surrogate-loop coupon test section.
  - 2D cross-section cut-plane renderer (`XZ`, `YZ`, `XY` planes) with continuous slice position scrubbing, velocity vector arrows, and field overlays.
  - Time scrubber ($t = 0\text{ s}$ to $600\text{ s}$) with Play/Pause animation and timestamp verification.
  - Explicit `UNAVAILABLE` state when selecting fields that require external solver or experimental campaigns (`validated_cfd_pressure_Pa`, `empirical_piv_temperature`, `live_coupled_openmc_cfd_statepoint`).
- [`index.html`](index.html) adds:
  - **View 6 (`Pool-Water Interactive Viewer`)**: Full-width embedded view of [`poolwater_interactive.html`](poolwater_interactive.html).
  - **View 7 (`Coupled Comparison`)**: Side-by-side comparison of [`poolwater_interactive.html`](poolwater_interactive.html) and [`tecdoc643_neutron_walk.html`](tecdoc643_neutron_walk.html) with an explicit synchronization gate bar (`#coupledSyncBar`) that only synchronizes the shared IAEA-TECDOC-643 blade-withdrawal geometry/scenario ($0\%..100\%$) when requested and labels the time basis as `INDEPENDENT_REFERENCE_PANELS`.

### Gate 4: Test and Release
- Automated regression test suite (`test_tecdoc643_viewer_regression.js` and `test_poolwater_benchmark_gate.jl`) verifies:
  1. Byte-for-byte SHA-256 integrity of all Gate-0 frozen artifacts (`oklo_r0_fixture_readonly.html`, `spacetime_explorer_4d_shareable.html`, `CONFORMANCE_FIXTURE_SPEC.md`, `tecdoc643_neutron_walk.html`) and all newly integrated artifacts (`biofilms_3d_explorer.html`, `poolwater_interactive.html`, `tecdoc643_reference_fixture.jl`, `benchmark_manifest.json`, `artifact_index.xml`).
  2. Exact reproduction of recorded TECDOC-643 benchmark values (`18,634.7141 +/- 120.3752 pcm` sweep worth, `340.254042 d` linear $k_{\text{eff}} = 1$ crossing, `-3,214.2242 pcm` Day 0 to Day 5 reactivity drop) and provenance boundaries in both Julia (`--startup-file=no --compile=min --heap-size-hint=4G`) and headless Chrome.
  3. Divergence-free mass conservation ($\max |\nabla \cdot \mathbf{u}| < 10^{-9}\text{ s}^{-1}$), thermal energy balance consistency, and explicit `UNAVAILABLE` handling for missing fields in [`poolwater_interactive.html`](poolwater_interactive.html).
  4. Strict compliance across all portal files (zero institutional identifiers, zero em-dashes, zero en-dashes).
  5. Machine-readable verification receipt written to [`ci_verification_receipt.json`](ci_verification_receipt.json).

---

## 4. Staged Surrogate Water-Loop, Biofilm Dynamics, and Post-Irradiation Examination (PIE) Protocol

To evaluate radiation effects on aqueous material surfaces without conflating exploratory biological hypotheses with core reactor physics or implying that an operating MTR pool has a biofilm issue, the portal and `RadioPharmacology.jl` enforce a four-stage experimental and modeling architecture:

1. **Stage 1 (Hydrodynamic Baseline in a Controlled Surrogate Water Loop)**:
   - Model a defined off-core surrogate water loop (`surrogate_water_loop`) with controlled velocity $\mathbf{u}$, temperature $T$, dissolved-species transport (advection-diffusion-reaction), and coupon wall shear stress $\tau_w\ [\text{Pa}]$.
2. **Stage 2 (Biofilm Attachment, Growth, Detachment, and Survival Dynamics)**:
   - Couple hydrodynamic shear and nutrient transport to surface attachment, growth, detachment, and survival on removable coupon surfaces, using viscoelastic rheology (`BiofilmRheology`) only where justified by measured constitutive behavior.
3. **Stage 3 (Sham-Controlled Radiation-Response Test)**:
   - Compare irradiated and sham-exposed coupon samples at matched temperature, flow, and water chemistry.
   - Measure three outcomes independently: (a) growth rate under irradiation, (b) survival or redox/metabolic shifts following irradiation, and (c) statistically reproducible directional bias toward the source (`Radiotropism`).
   - Do not build directional movement into the transport model as an established biological response: both Sandia National Laboratories (2024, four fungal isolates near a Cs-137 gamma source) and the 256-seed `aurascoper/Biofilms` Cellular Potts ensemble ([`biofilms_3d_explorer.html`](biofilms_3d_explorer.html), `cpm-sp-v1` selection-vs-displacement audit where all 7 identified-parcel displacement 95% CIs $\Delta r_i$ span zero and all 4-arm TOST 90% CIs lie inside $\pm 0.05\ r/R$) report null directional displacement under tested conditions.
4. **Stage 4 (Materials Compatibility & Post-Irradiation Examination / PIE Endpoints)**:
   - Quantify post-exposure surface changes, attachment density, and microbially influenced corrosion (MIC) indicators on stainless-steel (`PIE-COUPON-SS316L-01`, `316L Stainless Steel UNS S31603`) and aluminum (`PIE-COUPON-AL6061-02`, `6061-T6 Aluminum UNS A96061`) coupons via microscopy and surface characterization under `SOP-QMS-001` (`campaign_id = "SURROGATE-LOOP-PIE-CAMPAIGN-V1"`).
   - Maintain a hard regulatory firewall (`can_issue_cgmp_verdict = false`, `alters_core_reactor_or_nca_separation = false`): exploratory biofilm or magnetoreception modules in `RadioPharmacology.jl` (`src/biofilm_magnetoreception_research.jl`) never modify core neutronics, pool thermal-hydraulics, isotope activation, or cGMP batch release.

---

## 5. Cross-Repository Alignment: 4-Layer Multiphysics-GLMM Architecture & 5-Row Planned-Contrast Matrix

The portal's optional research views (`BIOFILMS-3D-CPM-01` in [`biofilms_3d_explorer.html`](biofilms_3d_explorer.html) and `SurrogateLoopBiofilmPIEBoundary` in [`poolwater_interactive.html`](poolwater_interactive.html)) are synchronized with `RadioPharmacology.jl` (`src/biofilm_magnetoreception_research.jl`) and `aurascoper/magnetoreception_3d_prototype` (PR #1 at `2e75031e6be60cf1a55c14500d0b4a4e5d8fb016`):

1. **4-Layer Multiphysics & Hierarchical GLMM Architecture**:
   - **Layer A**: Conservative Darcy-Brinkman-Stokes hydrodynamics & reactive transport ($\nabla \cdot \mathbf{u} = 0$, budget residual $< 10^{-6}$; Kim & Yao 2026 `arXiv:2610.01565`).
   - **Layer B**: Microbial kinetics & Oldroyd-B vs. generalized-Newtonian viscoelastic rheology calibrated from independent rheograms (Charlton et al. 2019 `PMC6707926`; Li, Matous & Nerenberg 2022 `doi:10.1002/bit.28056`).
   - **Layer C**: Falsifiable magnetic and radiation perturbation parameters around the explicit null ($\theta_i = 0, \gamma_i = 0$; Dadachova et al. 2007; Maeda et al. 2012; Rishabh et al. 2023 `arXiv:2312.06597`; Gassab et al. 2026 `arXiv:2605.00205`).
   - **Layer D**: Hierarchical GLMM $g(E[Y_{ijk}(t)]) = \beta_0 + \beta_R R + \beta_B B + \beta_M M + \beta_{RB}(RB) + \beta_{BM}(BM) + \beta_{RBM}(RBM) + b_{\text{batch}} + b_{\text{culture}} + f(t)$ with separated endpoint families (Lee, Green & Ryan 2017 `arXiv:1709.06288`).
2. **Revised 5-Row Planned-Contrast Experimental Matrix (15 Cells vs. 24-Cell Full Crossed Factorial)**:
   - Crossing 5 experimental rows (Row 1: Sham `0 Gy` + `50 uT`; Row 2: `+grad I_gamma` + `50 uT`; Row 3: `+grad I_gamma` + rotated `+90 deg` field; Row 4: `+grad I_gamma` + reversed `180 deg` field; Row 5: `+grad I_gamma` + suppressed `<0.1 uT` field) with 3 genotypes (`WT Melanized`, `Melanin-Deficient Albino`, `Complemented Rescue`) yields **15 planned-contrast cells**, whereas the **24-cell full crossed factorial** ($2 \times 4 \times 3$) additionally tests the rotated, reversed, and suppressed magnetic states under sham radiation.
3. **Exported `RadioPharmacology.jl` Interface Symbols**:
   - Submodules: `BiofilmRheology`, `MagnetoreceptionHypotheses`, `BiofilmInference`
   - Functions: `ingest_biofilms_3d_cpm_ensemble_benchmark()`, `simulate_surrogate_loop_pie_materials_campaign()`, `simulate_biofilm_porous_rheology_coupling()`, `evaluate_radical_pair_magnetoreception_hypothesis()`, `simulate_biofilm_factorial_glmm()`, `simulate_4d_reactor_pool_kinetics()`, `build_magnetoreception_relationship_table()`, `build_magnetoreception_epistemic_matrix()`, `build_4d_reactor_pool_epistemic_matrix()`, `verify_research_cgmp_firewall()`.

