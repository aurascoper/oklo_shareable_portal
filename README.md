# Oklo 4D Spatiotemporal, Pool-Water Interactive & TECDOC-643 Shareable Portal

Self-contained public static portal (`https://aurascoper.github.io/oklo_shareable_portal/`) embedding and indexing:

1. **[`spacetime_explorer_4d_shareable.html`](spacetime_explorer_4d_shareable.html)** (`132,358` bytes, SHA-256 `f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612`): R10 Stage 0/1 4D Spatiotemporal Geochemistry Explorer (100% offline single-file HTML; prescribed analytical synthetic model; Stage 2 PDE solver not authorized; preserved unmodified per Gate 0).
2. **[`poolwater_interactive.html`](poolwater_interactive.html)** (`79,610` bytes, SHA-256 `fa0f0dc30c45681a3b774db8533110370ebdce77b91317b003bfdc065a639b5a`): 3D WebGL + 2D cut-plane + Gate 0-4 benchmark & conservation audit viewer (`POOLWATER-3D-INTERACTIVE-01`), decoupling `NeutronTransportReference` (IAEA-TECDOC-643 10 MW MTR `6 x 7` lattice: 23 SFE + 5 CFE + 2 FT + 12 GR inside `123.2 x 133.7 x 180.0 cm` pool water reflector boundary), `PoolThermalHydraulicsSynthetic` (divergence-free Boussinesq convection plume demo across `t = 0..600 s`, explicit `UNAVAILABLE` states for missing CFD/PIV fields), `ReactorKineticsAlgebra` (unrounded recomputed control-blade sweep `18,634.714 +/- 120.375 pcm`, two-point worth `18,384.139 +/- 84.191 pcm` with `251.16 pcm` / `1.71 sigma` discrepancy, and linear `k_eff = 1` crossing at `Day 340.254042`), and `SurrogateLoopBiofilmPIEBoundary` (`SURROGATE-LOOP-PIE-CAMPAIGN-V1`).
3. **[`POOLWATER_WORKFLOW_SPEC.md`](POOLWATER_WORKFLOW_SPEC.md)** (`17,684` bytes, SHA-256 `2969c35e198d0019d3b8a970754eb6a75754428c93724049822be96759db0669`): Comprehensive specification of the 5-gate benchmark migration workflow, 4-stage surrogate water-loop / biofilm / PIE materials-compatibility protocol, revised 5-row planned-contrast matrix (15 cells vs. 24-cell full crossed factorial), and 4-layer multiphysics-GLMM architecture (`Layers A, B, C, D`).
4. **[`benchmark_manifest.json`](benchmark_manifest.json)** (`12,663` bytes, SHA-256 `f3689098bd9a5a8cb03c0c82776cc1de57f0ad504b001a664b3be27dba76f98f`): Machine-readable JSON benchmark manifest (`oklo_tecdoc_poolwater_benchmark_contract_v1`) containing field-level provenance, SHA-256 registry, recomputed reactivity algebra, and peer `RadioPharmacology.jl` integration hooks.
5. **[`biofilms_3d_explorer.html`](biofilms_3d_explorer.html)** (`869,267` bytes, SHA-256 `037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d`): Read-only 100% offline 3D Cellular Potts + 2D slice + 256-seed 4-arm null ensemble explorer (`BIOFILMS-3D-CPM-01`) of pinned `aurascoper/Biofilms` consortium outputs (`diagnostics/melanin_ensemble/consortium_seed42` and `radial_n40_p6_seeds42-297.csv`, `40 x 40 x 40` uncalibrated lattice, `D-PITCH: awaiting_measurement`, `seconds_per_mcs = NaN`, Seed 42, MCS `0..100`, `full` vs. `null` arms, seed-keyed 4-arm paired contrast & TOST 90% CI equivalence view vs. `+/-0.05 r/R`, plus `cpm-sp-v1` selection-vs-displacement NULL and `cpm-sp-growth-v1` 15/16 synthetic phase-locking PASS audits).
6. **[`multispecies_biofilm_robin_cylindrical_4panel.gif`](multispecies_biofilm_robin_cylindrical_4panel.gif)** (`2,571,435` bytes, SHA-256 `e73622d6454a3a6ad16af88f15b8d5e21161c801d51059050244303af5148997`) & **[`clonal_sector_expansion_reference.jpg`](clonal_sector_expansion_reference.jpg)** (`159,146` bytes, SHA-256 `67865f346f4d23835707174251eb589f72f344637ac221fbff427169fc34f115`): Four-panel synthetic visualization (`BIOFILMS-ROBIN-CYL-GIF-01`, `aurascoper/Biofilms` `diagnostics/fitness_phase/pv_workflow.py --clip`, commit `841d052`, config `eb090aa3c0a971776a6e262713eb0cf5c130b53cf2b8d7720ad93dec19f50b01`, `cpm-sp-growth-v1`, `combined` arm, `growth=1`, Seed 42, MCS `0..200`, `800 x 571`, 219 frames) and comparative clonal sector expansion figure paired in the **Multispecies Biofilm Spatial Model (`Synthetic visualization`)** card in [`index.html`](index.html). Explicitly clarifies that "Robin" denotes the mathematical **Robin boundary condition** (`-D_eff * dc/dr|_{r=R} = P_eff(t) * (c(R,t) - c_ext)`) at the cylinder wall `r = R` (not European robin `Erithacus rubecula` magnetoreception), distinguishes the synthetic dose-rate field (`0..0.01 Gy/s`) from calibrated radiation transport, distinguishes the mixed-currency net biomass-rate proxy (`growth_rate - hazard_rate [1/MCS]`) from measured growth, separates living biofilms (`H_6`) from abiotic prebiotic organization (`H_5` in [`proto_biofilms_geyser_fission_research_program.md`](proto_biofilms_geyser_fission_research_program.md)), and plots the matched-seed `Radiation OFF` vs. `Radiation ON` counterfactual outcomes (survival, biomass change, and directional displacement).
7. **[`tecdoc643_neutron_walk.html`](tecdoc643_neutron_walk.html)** (`937,606` bytes, SHA-256 `dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78`): IAEA-TECDOC-643 10 MW MTR Neutron Walk design and data-structure reference ([`https://claude.ai/artifact/KcgJyGkRmxzpEFSc8Y12md`](https://claude.ai/artifact/KcgJyGkRmxzpEFSc8Y12md); preserved 100% byte-identical per Gate 0).
8. **[`oklo_r0_fixture_readonly.html`](oklo_r0_fixture_readonly.html)** (`77,117` bytes, SHA-256 `8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d`): Read-only copy of the frozen Revision-0 Oklo GUI Conformance Fixture ([`CONFORMANCE_FIXTURE_SPEC.md`](CONFORMANCE_FIXTURE_SPEC.md), `20,743` bytes, SHA-256 `587745ede6c6997a298f8f0a4e01127823de1b7c606383cfa49b87db0cc60d0c`; preserved 100% byte-identical per Gate 0).
9. **[`tecdoc643_reference_fixture.jl`](tecdoc643_reference_fixture.jl)** (`6,018` bytes, SHA-256 `ec440f838d6c70263dcad3efef11da2159ab7f4d793d885367e4811415f8147d`; institutional-scrubbed generic MTR version of upstream raw `813c9e9fb33e47d9ceead8ea8f08bf07122583cf4292aab651d4f919a572a849`, `5,951` bytes): Quarantined Julia benchmark transcription for generic reactivity algebra checks.
10. **[`proto_biofilms_geyser_fission_research_program.md`](proto_biofilms_geyser_fission_research_program.md)** (`48,056` bytes, SHA-256 `da50d4002e6bcca94234045c3d371e16af243806cdb1ed99e0beff074c1cfb11`): 10-section evidence-gated multiphysics research program and Revision-0 fixture audit.
11. **[`artifact_index.xml`](artifact_index.xml)**: Machine-readable XML 1.0 manifest of all public URLs, relative portal paths, SHA-256 digests, and epistemic gates.

## Verification & Automated Gate Suite

Run the Julia Gate 0-4 benchmark & provenance test suite:

```bash
julia --startup-file=no --compile=min --heap-size-hint=4G test_poolwater_benchmark_gate.jl
```

Run the headless Chrome WebGL, 2D fallback, 256-seed statistical integrity, and Coupled Comparison regression suite:

```bash
node test_tecdoc643_viewer_regression.js
```

## Repository Visibility Boundary

- This portal repository (`aurascoper/oklo_shareable_portal`) is **public** so that selected self-contained visualization and audit artifacts can be viewed via GitHub Pages (`https://aurascoper.github.io/oklo_shareable_portal/`) or deployed as a static site.
- The upstream application and solver repository (`aurascoper/oklo_pool_mobile`, including PRs #7 through #12) is **private (owner-only)**. All public artifacts in this portal are self-contained and served via relative paths within this repository; any upstream PR numbers are retained strictly as owner-only provenance identifiers.

## Deploy to Render (Free Static Site / Blueprint)

[`render.yaml`](render.yaml) is included in the repository root using the standard Render Static Site Blueprint pattern (`type: web`, `runtime: static`, `staticPublishPath: .`):

1. Open `https://dashboard.render.com` -> **New -> Blueprint** (or **New -> Static Site**).
2. Connect this GitHub repository (`aurascoper/oklo_shareable_portal`).
3. Render reads `render.yaml` and serves the static root directory.
