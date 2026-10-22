# Oklo 4D Spatiotemporal & TECDOC-643 Neutron Walk Shareable Portal

Self-contained static portal embedding:
1. **`spacetime_explorer_4d_shareable.html`** (`132,358` bytes, SHA-256 `f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612`): R10 Stage 0/1 4D Spatiotemporal Geochemistry Explorer (100% offline single-file HTML).
2. **`tecdoc643_neutron_walk.html`** (`937,606` bytes, SHA-256 `dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78`): IAEA-TECDOC-643 10 MW MTR Neutron Walk design & data-structure reference (`https://claude.ai/artifact/KcgJyGkRmxzpEFSc8Y12md`).
3. **`oklo_r0_fixture_readonly.html`** (`77,117` bytes, SHA-256 `8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d`): Read-only copy of the frozen Revision-0 Oklo GUI Conformance Fixture.
4. **`artifact_index.xml`**: Machine-readable XML 1.0 manifest of all SHA-256 digests, PR links (#7 through #12), and epistemic gates.

## Deploy to Render (Free Static Site / Blueprint)

`render.yaml` is included in this directory using the same Render Blueprint workflow as `agri_yield_pipeline`:

1. Push `/Users/aurascoper/Developer/oklo_shareable_portal` to a GitHub repository (or point Render at a branch containing this folder).
2. Open `https://dashboard.render.com` -> **New -> Blueprint** (or **New -> Static Site**).
3. Render auto-detects `render.yaml` (`runtime: static`, `staticPublishPath: .`) and provisions a public `https://oklo-4d-shareable-portal.onrender.com` URL.
