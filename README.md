# Oklo 4D Spatiotemporal & TECDOC-643 Neutron Walk Shareable Portal

Self-contained public static portal embedding:
1. **[`spacetime_explorer_4d_shareable.html`](spacetime_explorer_4d_shareable.html)** (`132,358` bytes, SHA-256 `f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612`): R10 Stage 0/1 4D Spatiotemporal Geochemistry Explorer (100% offline single-file HTML; prescribed analytical synthetic model; Stage 2 PDE solver not authorized).
2. **[`tecdoc643_neutron_walk.html`](tecdoc643_neutron_walk.html)** (`939,350` bytes, SHA-256 `a463adfac1fbf8aa60b52f937d8f180e0c69678af2103bca4199718f8f849650`): IAEA-TECDOC-643 10 MW MTR Neutron Walk design and data-structure reference ([`https://claude.ai/artifact/KcgJyGkRmxzpEFSc8Y12md`](https://claude.ai/artifact/KcgJyGkRmxzpEFSc8Y12md)).
3. **[`biofilms_3d_explorer.html`](biofilms_3d_explorer.html)** (`869,267` bytes, SHA-256 `037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d`): Read-only 100% offline 3D Cellular Potts + 2D slice + 256-seed 4-arm null ensemble explorer of pinned `aurascoper/Biofilms` consortium outputs (`diagnostics/melanin_ensemble/consortium_seed42` and `radial_n40_p6_seeds42-297.csv`, `40 x 40 x 40` uncalibrated lattice, `D-PITCH: awaiting_measurement`, `seconds_per_mcs = NaN`, Seed 42, MCS `0..100`, `full` vs. `null` arms, plus seed-keyed 4-arm paired contrast & TOST 90% CI equivalence view vs. the `+/-0.05 r/R` bound).
4. **[`oklo_r0_fixture_readonly.html`](oklo_r0_fixture_readonly.html)** (`77,117` bytes, SHA-256 `8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d`): Read-only copy of the frozen Revision-0 Oklo GUI Conformance Fixture ([`CONFORMANCE_FIXTURE_SPEC.md`](CONFORMANCE_FIXTURE_SPEC.md)).
5. **[`tecdoc643_reference_fixture.jl`](tecdoc643_reference_fixture.jl)** (`5,951` bytes, SHA-256 `813c9e9fb33e47d9ceead8ea8f08bf07122583cf4292aab651d4f919a572a849`): Quarantined Julia benchmark transcription for generic reactivity algebra checks.
6. **[`proto_biofilms_geyser_fission_research_program.md`](proto_biofilms_geyser_fission_research_program.md)**: 10-section evidence-gated multiphysics research program and Revision-0 fixture audit.
7. **[`artifact_index.xml`](artifact_index.xml)**: Machine-readable XML 1.0 manifest of all public URLs, relative portal paths, SHA-256 digests, and epistemic gates.

## Repository Visibility Boundary

- This portal repository (`aurascoper/oklo_shareable_portal`) is **public** so that selected self-contained visualization and audit artifacts can be viewed via GitHub Pages (`https://aurascoper.github.io/oklo_shareable_portal/`) or deployed as a static site.
- The upstream application and solver repository (`aurascoper/oklo_pool_mobile`, including PRs #7 through #12) is **private (owner-only)**. All public artifacts in this portal are self-contained and served via relative paths within this repository; any upstream PR numbers are retained strictly as owner-only provenance identifiers.

## Deploy to Render (Free Static Site / Blueprint)

[`render.yaml`](render.yaml) is included in the repository root using the standard Render Static Site Blueprint pattern (`type: web`, `runtime: static`, `staticPublishPath: .`):

1. Open `https://dashboard.render.com` -> **New -> Blueprint** (or **New -> Static Site**).
2. Connect this GitHub repository (`aurascoper/oklo_shareable_portal`).
3. Render reads `render.yaml` and serves the static root directory.
