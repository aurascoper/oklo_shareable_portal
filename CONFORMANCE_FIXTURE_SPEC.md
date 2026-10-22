# Oklo GUI Conformance Fixture Specification

Status: provisional draft, revision 0 of this specification, written 2026-10-17. Uncommitted, read-only with respect to the fixture: nothing in this directory was modified to write it.

Decision on file: Hunter, 2026-10-17. Draft the conformance-fixture specification before changing the artifact; keep it beside the source files in this scratch project; freeze the source hash and record current outputs before any correction.

## 1. Scope and what this document does not authorize

This specification turns the existing Oklo GUI scratch project into a reproducible conformance benchmark for the toolchain that reads, writes and renders its volumes. The object under test is a deterministic analytic voxel generator. Its field coefficients are prescribed by hand, not calibrated against observations, and none of its generated values is a measurement of a reconstructed 16 m geological volume.

This document does not authorize edits to `oklo_model.js`, `index.html`, `export_oklo_mrc.py` or `verify_chimerax_interop.py`; a new physical calibration; a repository migration; or a publication claim. It does not turn the analytic fixture into evidence that a prebiotic pool operated at Oklo. Each later correction gets its own source revision and receipt (section 7).

## 2. Revision 0: the frozen original

Revision 0 is the fixture exactly as found on 2026-10-17. All hashes are SHA-256 of the file bytes.

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `oklo_model.js` | 21226 | `a300455caa05116c099150ef552350041b23b27b1d36e81e2b8661793b0e6321` |
| `index.html` | 77117 | `8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d` |
| `export_oklo_mrc.py` | 18506 | `402981117d96a3074ce11a5abc8729187473479e1e4c432e7d2c17f0cba02d31` |
| `verify_chimerax_interop.py` | 17984 | `a3e65b335364f7b45a7fda2d0c9096cd9c6007b841ac7e8098c13fc026354088` |
| `run_gui.py` | 2537 | `3ad2b1f9853be2efc36c06f2157d538907b5eb708ff0876825d8b0f8e771dfb3` |
| `chimera_open_script.cxc` | 909 | `6c8de3ec4d2610d72dbd4895b57382f948ce5978002e4bc2ff85ca1c9278425d` |
| `README.md` | 9355 | `d91dc594f39b924a0bc8ca15875da26241e3589c57ca0bf82e0505bb32a87bcb` |
| `Archive.zip` | 233091 | `1eedd56846b6abd7968f18121f16c88587925afac36756858b4cf8a449de4892` |

`Archive.zip` holds the same source and fixture files plus `__MACOSX` resource forks (42 entries). Whether it is byte-identical to the `Archive(3).zip` reviewed elsewhere has not been checked; record that archive's hash beside this one before treating them as the same object.

The model block embedded in `index.html` (lines 522 to 1154) matches `oklo_model.js` after trailing-whitespace normalization. The GUI and `oklo_model.js` are therefore one implementation. `export_oklo_mrc.py` is a second, independently written implementation of the same fields.

### 2.1 Recorded outputs of revision 0

The six MRC files on disk were all exported by `export_oklo_mrc.py` at cycle phase 0.15, active scenario (`is_null_scenario = false`), grid 32 x 32 x 32. Statistics below were computed from the stored float32 data, not copied from the headers. "sd" is the population standard deviation, which is what the MRC header field labelled RMS contains (section 4, finding R0-3).

| Field | MRC file SHA-256 | Data block SHA-256 | min | max | mean | sd |
| --- | --- | --- | --- | --- | --- | --- |
| temperature | `70dcf80f...b9766` | `89d85fc802e4f4d638af529f66bf7f3eb73b14e704afaf31dc652b68c9cb8e47` | 26.849241 | 216.861908 | 84.661757 | 27.992193 |
| hydration | `3e951f3e...b19ec` | `eb75f8694ae51fb6d3b37e941f93e931ca4aa84250a02c7ec9c55b0330791356` | 0.020000 | 0.881707 | 0.757855 | 0.125662 |
| h2_concentration | `20db0315...5f7f` | `cb42d37ca160d80168b2fc9d0d8095c9f8d9303f7c1b8445e2166ae35e8cb290` | 0.001111 | 3.652889 | 1.064380 | 0.705570 |
| u235_ratio | `8805534c...c1ae5` | `faff264263d13277cf6f4cdb4d60e20e59249e91278df035f9ca269f481de944` | 0.004214 | 0.007249 | 0.006734 | 0.000593 |
| polymer_yield | `1d85bf12...c3ca5` | `c84d5c5c2e3bee7ef8b50ad7092c8b124c69783aa99be8bf699bf6b08f78fe35` | 0.004336 | 14.159290 | 5.301710 | 2.871762 |
| compartments | `d3ba9a25...910fc` | `6271f65f4030e3a45b8a1b80817ae33aeae1b7596dfbbc07cd77c6c30c39dd5d` | 0 | 4 | 1.509155 | 0.964539 |

Full MRC file hashes: temperature `70dcf80f0bb4972cf374d13bcd8714001c3b3fcc0d0a32e1fd0c5e619c0b9766`, hydration `3e951f3ee385f3a0c971ac9f3aa92bf927f072964e1f8ecb4e5a8e1ac54b19ec`, h2_concentration `20db0315200c261be84ca5619d13d1bfeb757ace05285a15b12667a7cfa33f7f`, u235_ratio `8805534c6ef1f9a9cda783661daccbd3f5348ac1a72f194b6e77decaf83c1ae5`, polymer_yield `1d85bf12f86d71b5800983abf9dc85682055dffadda48a61b91194dc451c3ca5`, compartments `d3ba9a2509ed1b28968900b1faf4339fb2c6360ce0844f15d0c1ce7e961910fc`.

Compartment voxel counts at phase 0.15, active: zone 0 = 7560, zone 1 = 3356, zone 2 = 20656, zone 3 = 0, zone 4 = 1196 (total 32768). Zone 3 is empty at this phase because desiccation (0.588) exceeds the 0.4 threshold, so every conduit voxel is labelled zone 4. The clay and phosphate halo (zone 2) occupies 63 percent of the volume, because the halo shell at normalized radius 1.1 spans most of the box.

Manifest statistics match the data statistics to float64 precision. Header min, max, mean and RMS match the data to float32 rounding.

## 3. Reference definition of the fields

The analytic reference generator required by CF-2 must be written from the equations in this section, not imported from either implementation. Index order is X fastest: `index = k*nx*ny + j*nx + i`, with `i, j, k` in `0..31`.

Geometry, with nx = ny = nz = 32:

- `cx = cy = (nx - 1)/2 = 15.5`, `czc = 0.35*nz = 11.2`
- `xN = (i - cx)/(0.40*nx)`, `yN = (j - cy)/(0.40*ny)`, `zN = (k - czc)/(0.35*nz)`
- `rc = sqrt(xN^2 + yN^2 + zN^2)`
- `rf = sqrt(((i - cx)/(0.12*nx))^2 + ((j - cy)/(0.12*ny))^2)`
- conduit indicator `F = exp(-rf^2/2)` if `k >= czc`, else 0
- core indicator `C = exp(-(rc/0.6)^2/2)`
- halo indicator `H = max(0, exp(-((rc - 1.1)/0.35)^2/2))`

Cycle terms for phase `p` in [0, 1]. In the null scenario both are 0.

- pulse `P(p) = sin(pi*p/b)` for `p < b`, else `exp(-8*(p - b))`, where the boundary `b` differs between implementations in revision 0 (finding R0-1)
- desiccation `D(p) = sin(pi*(p - 0.10)/0.25)` for `0.10 <= p <= 0.35`, else 0

Fields:

| Field | Null scenario | Active scenario |
| --- | --- | --- |
| temperature | `25 + 35*k/nz + 30*C` | `25 + 35*k/nz + 320*P*C + 180*P*F + 40*H*(1 - 0.5*P)` |
| hydration | `0.85 - 0.10*k/nz` | `clamp(0.85 - 0.10*k/nz - D*(0.80*F + 0.65*C) + 0.08*H, 0.02, 1.0)` |
| h2_concentration | `0.001` | `5.0*(C + 0.3*H)*max(0.05, 1 - 0.7*D) + 1.8*F*(1 - D)` |
| u235_ratio | `0.00725 - 0.00305*C` | same as null |
| polymer_yield | `0` | `8.5*(0.7*H + 0.5*F)*(1 + 0.5*sin(2*pi*p))` |
| compartments | rule below | rule below |

Compartment rule, applied in order: `C > 0.45` gives 1; else `F > 0.35` gives 4 if `D > 0.4`, otherwise 3; else `H > 0.35` gives 2; else 0.

Every value is computed in float64 and stored as IEEE-754 float32, little-endian.

## 4. Revision 0 findings that the conformance checks must capture

These are recorded as found. Revision 0 keeps them unchanged.

- **R0-1, the two implementations disagree.** `oklo_model.js` (and therefore the GUI) uses pulse boundary `b = 0.1667` and phase-name thresholds 0.1667, 0.25, 0.8333. `export_oklo_mrc.py` uses `b = 0.17` and thresholds 0.17, 0.25, 0.83. At the default phase 0.15 the pulse factor is 0.30955 (JS) versus 0.36124 (Python). Re-evaluating the temperature equation analytically, the maximum absolute temperature difference over the grid is 25.48 C. The GUI display and the exported MRC volume do not describe the same field at the default phase. The equations in this specification were re-evaluated independently; the JS code was not executed.
- **R0-2, MRC2014 version word.** NVERSION (word 28, byte 108) is 0 in all six files. MRC2014 expects 20140 (or 20141). ChimeraX loads the files anyway. EXTTYP is zero, which is acceptable with NSYMBT = 0.
- **R0-3, the RMS label.** The header word labelled RMS, and the manifest key `rms`, hold the population standard deviation about the mean. That matches the MRC convention. It is not the root mean square of the values, which for temperature is 89.17 against an sd of 27.99. Consumers must not read it as the root mean square.
- **R0-4, length units.** Cell lengths are written as 16.0 with a voxel step of 0.5, intended as metres. ChimeraX and other MRC readers interpret header lengths as angstrom. Any consumer must treat 1 header unit = 1 m as a declared convention, not something the format carries.
- **R0-5, the H2 field has no unit derivation.** The field is labelled mmol/L. Its scale `0.40*12.5` multiplies a gamma radiolytic G-value by an unexplained factor, with no absorbed-dose rate, exposure time or density conversion. A G-value alone cannot yield a concentration. The field is a dimensionless spatial index until a dose basis and a unit chain are declared.
- **R0-6, the uranium field definition.** The field is defined as the atom ratio 235U/238U, with baseline 0.00725. Natural uranium's commonly quoted 0.7204 percent is the atom percentage of 235U among all uranium isotopes, a different quantity, and the corresponding 235U/238U ratio is about 0.00725. The baseline is therefore consistent with a ratio definition. Swapping in 0.007204 without changing the definition would introduce a denominator mismatch. The registry text "depleted to 0.40% - 0.55% vs 0.725% natural baseline" uses percent signs for a ratio and needs a source check: Oklo depletion is usually reported as 235U atom abundance, so the denominator of the depleted values must be confirmed before they are compared with the field.
- **R0-7, the seed does nothing.** `seed: 42` is declared in both implementations, but neither generator makes any random call. The fields are fully deterministic. `dx`, `dy` and `dz` enter only the header, not the field values.
- **R0-8, the invariants are bookkeeping.** In `auditMassBalance`, free monomer is the residual that closes a 100 umol/L precursor pool, so carbon "conservation" holds by construction whenever mean polymer yield times 1.15 is below 100. `waterContinuous` is set to `true` directly. In the Python manifests, `monomer_precursor_mass_conserved` and `radiolytic_yield_scaled_to_water_presence` are hard-coded `True`. These are useful software invariants. They do not validate chemical kinetics or water continuity in a solved physical system.
- **R0-9, the verifier is not independent.**
  - `verify_chimerax_interop.py` imports the generator it validates (`from export_oklo_mrc import ...`).
  - It tests the header builder with synthetic arguments, not the headers of the six canonical files.
  - Its ChimeraX probe checks grid size, `step[0]` and `origin[0]`. It does not check the data values or the other two axes.
  - Its mass-balance test repeats the residual identity in R0-8.
  - Its HTML test requires the external script to be the Antigravity `gstatic` Tailwind build. Tailwind documents that browser Play CDN as development-only.
- **R0-10, the registry tiers describe literature, not this volume.** Entries tagged `[MEASURED]` name literature observations: Lin et al. 2005 G(H2), Dubessy et al. 1988, the 1972 CEA 235U depletion, and the D/H anomaly. They do not describe values in this voxel volume. The D/H entry's citation chain (Neuilly et al. 1972; Hagemann et al. 1975) and its 127 ppm figure have not been verified here. The cycle entry credits Meshik et al. 2004 alone (section 6).

## 5. Conformance checks

Each check has an identifier, a contract, a pass criterion declared before the check is run, and its status for revision 0. "Not run" means the check is specified but has not been executed.

### CF-1, Frozen source

Contract: before any check runs, record the SHA-256 of every file in section 2, the exact configuration (grid, phase, scenario), and the tool versions (Python, Node or browser, ChimeraX, ParaView) in a receipt.

Pass: every hash in the receipt equals the hash recorded for the revision under test.

Revision 0 status: hashes recorded in section 2. Tool versions not yet recorded.

### CF-2, Analytic reference

Contract: a reference generator written from section 3, independent of both implementations, produces each field on a pinned grid of cases. The cases are phase in {0.05, 0.15, 0.20, 0.50, 0.90} times scenario in {active, null}, for all six fields, at 32 x 32 x 32. Because R0-1 makes the pulse boundary implementation-dependent, the reference runs twice, once with `b = 0.1667` and once with `b = 0.17`, and each implementation is compared with its own variant until a later revision unifies them. For each case the reference records:

- min, max, mean, population sd and root mean square;
- the SHA-256 of the canonical serialized array: little-endian float32, X fastest, no header.

Summary statistics alone cannot detect voxel permutations or axis-order errors. The array hash is required.

Pass:
- same-implementation regeneration: identical array hash;
- implementation against reference: maximum absolute difference no greater than `1e-6 * max(1, |reference value|)` per voxel. This tolerance is declared here, before any run.

A seed-invariance case is included: regenerating with seed 7 must give the identical array hash, since R0-7 says the seed is unused. If it does not, the generator has changed and needs a new revision.

Revision 0 status: not run. Expected from R0-1: the Python implementation agrees with the `b = 0.17` reference and the JS implementation with the `b = 0.1667` reference, but the two disagree with each other in temperature (up to 25.48 C at phase 0.15), in compartment labels near phase boundaries, and in phase names.

### CF-3, Export correctness

Contract: every exported `.mrc` file is checked field by field against MRC2014.

| Word or bytes | Expected |
| --- | --- |
| NX, NY, NZ | 32, 32, 32 |
| MODE | 2 (float32) |
| NXSTART, NYSTART, NZSTART | 0, 0, 0 |
| MX, MY, MZ | 32, 32, 32 |
| cell lengths | 16.0, 16.0, 16.0 (declared convention: 1 unit = 1 m, R0-4) |
| cell angles | 90, 90, 90 |
| MAPC, MAPR, MAPS | 1, 2, 3 |
| DMIN, DMAX, DMEAN | equal to data min, max, mean within float32 rounding |
| ISPG, NSYMBT | 1, 0 |
| NVERSION (byte 108) | 20140 |
| ORIGIN (bytes 196 to 207) | 0, 0, 0 |
| MAP (bytes 208 to 211) | ASCII `MAP ` |
| MACHST (bytes 212 to 215) | `44 44 00 00` |
| RMS (byte 216) | population sd of data, within float32 rounding (R0-3) |
| NLABL, first label | 1, `Oklo <field> phase=<p> null=<bool>` |
| file length | 1024 + 4*32768 = 132096 bytes |
| data block | SHA-256 equals the CF-2 reference array hash for the same case and implementation |

Pass: every row matches. The file's field identity must also be preserved: the label, the manifest `field_name` and the file name all name the same field.

Revision 0 status: the snapshot in section 2.1 shows every row matching except NVERSION (R0-2, fails). The data-block comparison against CF-2 has not been run.

### CF-4, Ingestion and rendering

Contract: each downstream path preserves the numeric volume and its coordinate metadata. Data fidelity and visual similarity are judged separately.

- **ChimeraX:** the probe reads the full data matrix and records its hash, plus step and origin on all three axes. Pass: the matrix hash equals the CF-3 data-block hash after the probe's axis order is mapped to X fastest. Steps are 0.5 and origins 0 on every axis.
- **ParaView and VTK:** the same comparison through the MRC or VTI reader.
- **Adapter B and Adapter C** (SobolevBiofilms specs v0.3, S2): an adapter given this fixture must either carry the declared units and the R0-4 length convention, or refuse, as their stop rule requires. A field with no defined unit, such as h2_concentration under R0-5, must be marked unknown, never zero-filled, and never converted into a dose.
- **HTML GUI:** the statistics panel the GUI displays for a case equals the CF-2 reference statistics for the `b = 0.1667` variant, to 4 significant figures.

Pass criterion for every renderer: preserved data and coordinate metadata. Pixel-for-pixel identity is not required and is not evidence of correctness.

Revision 0 status: not run, except that the existing verifier confirms ChimeraX loads all six files with size 32 cubed, `step[0] = 0.5` and `origin[0] = 0` (R0-9 lists what that does not cover).

### CF-5, Backend parity

Contract: a CPU reference in float64, independent of the backends under test, is compared with CPU threads and with JACC on Metal. Metal has no Float64: the JACC README backend table marks Float64 unsupported on Metal. The GPU path therefore runs in Float32.

Pass, declared before running:
- Float32 backends against the float64 reference: maximum absolute difference no greater than `2e-6 * max(1, |reference|)` per voxel.
- Compartment labels: identical, except voxels within `1e-5` of a threshold, which are listed rather than failed.

Revision 0 status: not run. No JACC or Metal implementation of the fields exists yet.

### CF-6, Epistemic and unit integrity

Contract: every field carries a definition record with these entries.

| Entry | Content |
| --- | --- |
| quantity | what is represented, in words |
| units | a unit with a derivation chain, or "dimensionless index" |
| value tier | always "prescribed analytic" for generated values in this fixture |
| literature anchor | the registry entries that motivate the shape or scale, each with its own tier |
| assumptions | the coefficients and thresholds that set the field |
| limitations | what the field must not be used to claim |

Pass: every field has a complete record, no generated value is labelled as measured, and every unit either has a derivation or is declared dimensionless.

Revision 0 status: fails.
- temperature: unit in degrees C with no derivation of the coefficients 320, 180 and 40.
- hydration: dimensionless saturation, prescribed.
- h2_concentration: mmol/L with no derivation (R0-5).
- u235_ratio: ratio definition is consistent but the depletion source needs checking (R0-6).
- polymer_yield: umol/L for a hypothetical surrogate with no kinetic basis.
- compartments: categorical, prescribed thresholds.

## 6. Registry corrections to make in a later revision (not made here)

Keep two separate entries for the cycle:

- **Meshik et al. 2004,** Phys. Rev. Lett. 93:182302. Tier: isotopic evidence and its interpretation, about 30 min active and about 2.5 h dormant, inferred from xenon in aluminium phosphate. Limitation, from Hunter's own lane: an independent reconstruction of the xenon record from ENDF data did not reproduce the cycle (oklo_heartbeat, B0 result, 2026-10-14). Record this as a reported internal non-reproduction, not a refutation.
- **Ibekwe, Cooling, Trainer & Eaton 2020,** Prog. Nucl. Energy 118:103080, doi 10.1016/j.pnucene.2019.103080. Tier: computational reproduction. It models short-term and long-term reactor behaviour and reproduces the roughly 3-hour cycle. It is a modelling anchor, not new empirical confirmation.

Other registry corrections:

- Separate the tier of a literature value from the tier of the voxel values it motivates (CF-6).
- Fix the 235U entry's quantity and denominator (R0-6).
- Mark the D/H entry's citation chain unverified until checked (R0-10).

## 7. Revision policy

Revision 0 is frozen by the hashes in section 2. Any change to source, configuration or outputs creates revision N+1, with:

- its own section 2 hash table;
- a receipt recording which findings it addresses;
- a rerun of CF-1 through CF-6.

A revision may fix several findings, but each fix is listed separately in its receipt.

Candidate changes for revision 1, all unauthorized until approved:

- unify the pulse boundary (R0-1);
- set NVERSION = 20140 (R0-2);
- rename the RMS manifest key to `sd`, or document it (R0-3);
- relabel h2_concentration as a dimensionless index, or add a dose basis (R0-5);
- correct the registry (section 6);
- make the verifier read the canonical files and compare full arrays (R0-9);
- bundle the CSS locally and test offline operation, replacing the gstatic Tailwind script (R0-9).

## 8. Open items

- Whether `Archive.zip` here equals the `Archive(3).zip` reviewed elsewhere (hash comparison).
- Tool versions for the CF-1 receipt.
- Where the fixture should live after review. Hunter decides that separately; until then it stays in this scratch directory.
- Whether a reference generator for CF-2 should be written in Julia (for the CF-5 JACC comparison) or Python (for the CF-3 and CF-4 checks); one independent generator can serve both if it writes the canonical array format of CF-2.
