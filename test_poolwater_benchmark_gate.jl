# ==============================================================================
# Gate 0 - Gate 4 Automated Julia Benchmark & Provenance Verification Suite
# Invoke with:
#   julia --startup-file=no --compile=min --heap-size-hint=4G test_poolwater_benchmark_gate.jl
# ==============================================================================

using Test
using SHA

const PORTAL_ROOT = @__DIR__

include(joinpath(PORTAL_ROOT, "tecdoc643_reference_fixture.jl"))
using .TECDOC643ReferenceFixture

function file_sha256_and_bytes(relpath::AbstractString)
    full = joinpath(PORTAL_ROOT, relpath)
    bytes = read(full)
    return (bytes = length(bytes), sha256 = bytes2hex(sha256(bytes)), text = String(copy(bytes)))
end

const LOCAL_SCREEN_CONFIG_PATH = expanduser(
    get(
        ENV,
        "LOCAL_RELEASE_SCREEN_CONFIG",
        joinpath(homedir(), ".config", "local-release-screen", "patterns.txt"),
    ),
)

function load_optional_local_screen_patterns()
    isfile(LOCAL_SCREEN_CONFIG_PATH) || return String[]
    return [lowercase(strip(line)) for line in readlines(LOCAL_SCREEN_CONFIG_PATH)
            if !isempty(strip(line)) && !startswith(lstrip(line), "#")]
end

const LOCAL_SCREEN_PATTERNS = load_optional_local_screen_patterns()

function matches_local_screen_policy(text::AbstractString)
    isempty(LOCAL_SCREEN_PATTERNS) && return false
    lower = lowercase(text)
    return any(pat -> occursin(pat, lower), LOCAL_SCREEN_PATTERNS)
end

@testset "Oklo Shareable Portal & Pool-Water Interactive Workflow Gates 0-4" begin
    # --------------------------------------------------------------------------
    # Gate 0: Provenance & Frozen Artifact Hash Lock
    # --------------------------------------------------------------------------
    @testset "Gate 0: Byte-Identical Baseline & Artifact Digest Lock" begin
        exact_table = Dict(
            "spacetime_explorer_4d_shareable.html"              => (132358, "f9ca39ea37503f0e2012ad3dd5aad05ef26709337d5e84f83df89234920b4612"),
            "tecdoc643_neutron_walk.html"                       => (937606, "dc15eb934fe6cd32a084dc13d05ee17d8f5ad988f7ea1bd2598bdcd9a0065b78"),
            "oklo_r0_fixture_readonly.html"                     => (77117,  "8dac3ae9b8268a476b791f8c2293130e899d5c86c7fab09ce27345de2333544d"),
            "CONFORMANCE_FIXTURE_SPEC.md"                       => (20743,  "587745ede6c6997a298f8f0a4e01127823de1b7c606383cfa49b87db0cc60d0c"),
            "biofilms_3d_explorer.html"                         => (869353, "eea45e31e898c2f5fc2623d38767311ab74650570b80823138f0d9b7f6f553c2"),
            "tecdoc643_reference_fixture.jl"                    => (6040,   "15eb6da017d610109bdcd03dc568ff243a3dae80399e5b33638c6166bd786294"),
            "proto_biofilms_geyser_fission_research_program.md" => (48056,  "da50d4002e6bcca94234045c3d371e16af243806cdb1ed99e0beff074c1cfb11"),
            "poolwater_interactive.html"                         => (79614,   "34b3e9f50689dd5f1ee6a7ee252996f0ff5a6a3410b33c353dd0cd2783feb964"),
            "POOLWATER_WORKFLOW_SPEC.md"                         => (27762,   "6d37ab122d90396a53b9b8b2d0a7f413f969551c8ed66294f19903dc26d6fb54"),
            "multispecies_biofilm_robin_cylindrical_4panel.gif"  => (2571435, "e73622d6454a3a6ad16af88f15b8d5e21161c801d51059050244303af5148997"),
            "clonal_sector_expansion_reference.jpg"              => (159146,  "67865f346f4d23835707174251eb589f72f344637ac221fbff427169fc34f115"),
            "magnetoreception_3d_explorer.html"                  => (263873,  "335039227479d9704f0e71122624e4ba21d050b7ab2f1c580509ea5cfdf04bcb"),
            "reactor_pool_biofilm_explorer.html"                 => (204031,  "09bb3d9cbca7757c3630d48b50c344f04694522d1d991f8b1f53ef38a9c8d694"),
            "evidence_manifest.json"                             => (116876,  "4f61d995772ee055fd0df378d4884bc8b2a2be235877ffc4b4424fc519f9cacf"),
            "test_calculation_provenance_and_invariants.js"      => (73416,   "cd3023c73f13f61fa88383b90b487d12f2be7fb5f4bab4a76392660690a9c5e5"),
            "benchmark_manifest.json"                            => (30784,   "0b7cb0befac0ba4b3e880f2cf76d880a107a88e19902adaaf3941f2260c5dd05"),
        )

        xml_info = file_sha256_and_bytes("artifact_index.xml")
        readme_info = file_sha256_and_bytes("README.md")
        manifest_info = file_sha256_and_bytes("benchmark_manifest.json")
        index_info = file_sha256_and_bytes("index.html")

        for (rel, (exp_bytes, exp_sha)) in exact_table
            actual = file_sha256_and_bytes(rel)
            @test actual.bytes == exp_bytes
            @test actual.sha256 == exp_sha
            @test occursin(exp_sha, readme_info.text)
            if rel != "proto_biofilms_geyser_fission_research_program.md"
                @test occursin(exp_sha, xml_info.text)
            end
            if rel in ("spacetime_explorer_4d_shareable.html", "tecdoc643_neutron_walk.html",
                       "oklo_r0_fixture_readonly.html", "CONFORMANCE_FIXTURE_SPEC.md",
                       "biofilms_3d_explorer.html", "tecdoc643_reference_fixture.jl",
                       "poolwater_interactive.html", "POOLWATER_WORKFLOW_SPEC.md",
                       "multispecies_biofilm_robin_cylindrical_4panel.gif",
                       "clonal_sector_expansion_reference.jpg",
                       "magnetoreception_3d_explorer.html",
                       "reactor_pool_biofilm_explorer.html",
                       "evidence_manifest.json",
                       "test_calculation_provenance_and_invariants.js")
                @test occursin(exp_sha, manifest_info.text)
            end
        end

        # Gate 2: Explicit entry-by-entry on-disk byte size & SHA-256 verification of benchmark_manifest.json["gate_0_frozen_inputs"]
        g0_keys = [
            "R10-4D-SHAREABLE-HTML",
            "REF-NW-HTML-01",
            "REF-NW-JL-FIX",
            "OKLO-R0-FROZEN-FIXTURE",
            "BIOFILMS-3D-CPM-01",
            "POOLWATER-3D-INTERACTIVE-01",
            "BIOFILMS-ROBIN-CYL-GIF-01",
            "BIOTITE-MAGNETORECEPTION-4D-01",
            "REACTOR-POOL-BIOFILM-COORDINATED-3D-01",
            "REACTOR-POOL-BIOFILM-3D-01",
        ]
        g0_section_match = match(r"\"gate_0_frozen_inputs\"\s*:\s*\{(.*?)\n  \},"s, manifest_info.text)
        @test g0_section_match !== nothing
        g0_section = g0_section_match.captures[1]
        discovered_g0_keys = [m.captures[1] for m in eachmatch(r"\n    \"([^\"]+)\"\s*:\s*\{", g0_section)]
        @test discovered_g0_keys == g0_keys
        for gk in g0_keys
            entry_pat = Regex("\"$(gk)\"\\s*:\\s*\\{(.*?)\\n    \\}", "s")
            em = match(entry_pat, g0_section)
            @test em !== nothing
            eblock = em.captures[1]

            rel_m = match(r"\"relative_path\"\s*:\s*\"([^\"]+)\"", eblock)
            bytes_m = match(r"\"bytes\"\s*:\s*(\d+)", eblock)
            sha_m = match(r"\"sha256\"\s*:\s*\"([0-9a-f]{64})\"", eblock)
            @test rel_m !== nothing && bytes_m !== nothing && sha_m !== nothing
            ondisk = file_sha256_and_bytes(rel_m.captures[1])
            @test ondisk.bytes == parse(Int, bytes_m.captures[1])
            @test ondisk.sha256 == sha_m.captures[1]

            for (path_field, bytes_field, sha_field) in [
                ("spec_relative_path", "spec_bytes", "spec_sha256"),
                ("companion_reference_relative_path", "companion_reference_bytes", "companion_reference_sha256"),
                ("evidence_manifest_relative_path", "evidence_manifest_bytes", "evidence_manifest_sha256"),
                ("invariant_test_relative_path", "invariant_test_bytes", "invariant_test_sha256"),
            ]
                pm = match(Regex("\"$(path_field)\"\\s*:\\s*\"([^\"]+)\""), eblock)
                if pm !== nothing
                    bm = match(Regex("\"$(bytes_field)\"\\s*:\\s*(\\d+)"), eblock)
                    sm = match(Regex("\"$(sha_field)\"\\s*:\\s*\"([0-9a-f]{64})\""), eblock)
                    @test bm !== nothing && sm !== nothing
                    sub_ondisk = file_sha256_and_bytes(pm.captures[1])
                    @test sub_ondisk.bytes == parse(Int, bm.captures[1])
                    @test sub_ondisk.sha256 == sm.captures[1]
                end
            end
        end

        @test occursin("Multispecies Biofilm Spatial Model", index_info.text)
        @test occursin("Synthetic visualization", index_info.text)
        @test occursin("Robin boundary condition", index_info.text)
        @test occursin("Erithacus rubecula", index_info.text)
        @test occursin("multispecies_biofilm_robin_cylindrical_4panel.gif", index_info.text)
        @test occursin("clonal_sector_expansion_reference.jpg", index_info.text)
        @test occursin("magnetoreception_3d_explorer.html", index_info.text)
        @test occursin("reactor_pool_biofilm_explorer.html", index_info.text)
        @test occursin("09bb3d9cbca7757c...", index_info.text)
        @test occursin("(204,031 bytes)", index_info.text)
        @test occursin("https://github.com/aurascoper/Biofilms", index_info.text)

        @test !occursin("file://", xml_info.text)
        @test !occursin("/Users/", xml_info.text)
    end

    # --------------------------------------------------------------------------
    # Gate 1: TECDOC-643 Reactivity Algebra & Precision-Aware Recomputation
    # --------------------------------------------------------------------------
    @testset "Gate 1: Unrounded Reactivity Algebra & Depletion Crossing Parity" begin
        meta = source_metadata()
        @test meta.dataset_id == "tecdoc643_neutron_walk_transcribed_table_v0"
        @test meta.provenance_status == :transcribed_unverified

        sweep = blade_sweep()
        @test length(sweep) == 5
        @test sweep[1].withdrawn_pct == 0.0
        @test sweep[1].worth_to_fully_withdrawn_pcm ≈ 18634.714116279465 atol = 1e-9
        @test sweep[1].worth_sigma_pcm ≈ 120.3749252933642 atol = 1e-9

        t_cross = interpolated_k_crossing_day()
        @test t_cross ≈ 340.2540415704388 atol = 1e-9

        burn = burnup_table()
        @test length(burn) == 12
        day0_to_5_drop_pcm = 1.0e5 * delta_rho(burn[1].k_eff, burn[2].k_eff)
        @test day0_to_5_drop_pcm ≈ -3214.223788039883 atol = 1e-9

        # Two-point (2M histories) vs 5-point sweep (800k histories) discrepancy
        k_in_2m, sig_in_2m = 0.98057, 0.00069
        k_out_2m, sig_out_2m = 1.19621, 0.00063
        worth_2m_pcm = 1.0e5 * delta_rho(k_in_2m, k_out_2m)
        worth_2m_sig_pcm = worth_sigma_pcm(k_in_2m, sig_in_2m, k_out_2m, sig_out_2m)
        @test worth_2m_pcm ≈ 18384.13888853339 atol = 1e-9
        @test worth_2m_sig_pcm ≈ 84.191196036753 atol = 1e-9
        @test (18635.3 - worth_2m_pcm) ≈ 251.16111146660842 atol = 1e-9

        # Operator function equivalence check
        op_audit = audit_operator_functions(
            reactivity_rho_fn = k -> (k - 1.0) / k,
            delta_rho_fn = (k1, k2) -> ((k2 - 1.0) / k2) - ((k1 - 1.0) / k1),
        )
        @test all(row -> row.agrees_with_fixture, op_audit)
    end

    # --------------------------------------------------------------------------
    # Gate 2: Decoupled Module Architecture & Surrogate Loop / PIE Demarcation
    # --------------------------------------------------------------------------
    @testset "Gate 2: Decoupled Physics Modules & Surrogate Loop Contract" begin
        pool_html = file_sha256_and_bytes("poolwater_interactive.html").text
        manifest_txt = file_sha256_and_bytes("benchmark_manifest.json").text
        spec_txt = file_sha256_and_bytes("POOLWATER_WORKFLOW_SPEC.md").text

        for sym in [
            "NeutronTransportReference",
            "PoolThermalHydraulicsSynthetic",
            "ReactorKineticsAlgebra",
            "SurrogateLoopBiofilmPIEBoundary",
        ]
            @test occursin(sym, pool_html)
            @test occursin(sym, spec_txt)
        end

        @test occursin("verifyPoolWaterAcceptanceGates", pool_html)

        for shared_id in [
            "SURROGATE-LOOP-PIE-CAMPAIGN-V1",
            "PIE-COUPON-SS316L-01",
            "PIE-COUPON-AL6061-02",
            "SOP-QMS-001",
            "oklo_tecdoc_poolwater_benchmark_contract_v1",
        ]
            @test occursin(shared_id, pool_html)
            @test occursin(shared_id, manifest_txt)
            @test occursin(shared_id, spec_txt)
        end

        for peer_mod in [
            "BiofilmRheology",
            "MagnetoreceptionHypotheses",
            "BiofilmInference",
        ]
            @test occursin(peer_mod, manifest_txt)
            @test occursin(peer_mod, spec_txt)
        end

        for peer_fn in [
            "ingest_biofilms_3d_cpm_ensemble_benchmark",
            "simulate_surrogate_loop_pie_materials_campaign",
            "simulate_biofilm_porous_rheology_coupling",
            "evaluate_radical_pair_magnetoreception_hypothesis",
            "simulate_biofilm_factorial_glmm",
            "simulate_4d_reactor_pool_kinetics",
            "verify_research_cgmp_firewall",
        ]
            @test occursin(peer_fn, spec_txt)
        end

        index_html = file_sha256_and_bytes("index.html").text
        for cite_token in [
            "arXiv:2610.01565",
            "PMC6707926",
            "arXiv:1709.06288",
        ]
            @test occursin(cite_token, index_html)
            @test occursin(cite_token, pool_html)
            @test occursin(cite_token, spec_txt)
        end

        for genotype_token in [
            "WT Melanized",
            "Melanin-Deficient",
            "Complemented Rescue",
        ]
            @test occursin(genotype_token, index_html)
            @test occursin(genotype_token, pool_html)
            @test occursin(genotype_token, manifest_txt)
            @test occursin(genotype_token, spec_txt)
        end

        @test occursin("coreLattice6x7", pool_html)
        @test occursin("sigmaAllIn: 0.00069", pool_html)
        @test occursin("sigmaAllOut: 0.00063", pool_html)
    end

    # --------------------------------------------------------------------------
    # Gate 3 & Gate 4: Explicit UNAVAILABLE States, Lexical Digest Gate & Dash Ban
    # --------------------------------------------------------------------------
    @testset "Gate 3 & Gate 4: Unavailable Field Honesty, Lexical Digest Gate & Zero En/Em-Dashes" begin
        pool_html = file_sha256_and_bytes("poolwater_interactive.html").text
        manifest_txt = file_sha256_and_bytes("benchmark_manifest.json").text
        for unavail_field in [
            "validated_cfd_pressure_Pa",
            "empirical_piv_temperature",
            "live_coupled_openmc_cfd_statepoint",
        ]
            @test occursin(unavail_field, pool_html)
            @test occursin(unavail_field, manifest_txt)
        end

        all_portal_files = [
            "index.html",
            "README.md",
            "render.yaml",
            "artifact_index.xml",
            "poolwater_interactive.html",
            "POOLWATER_WORKFLOW_SPEC.md",
            "benchmark_manifest.json",
            "tecdoc643_reference_fixture.jl",
            "biofilms_3d_explorer.html",
            "spacetime_explorer_4d_shareable.html",
            "tecdoc643_neutron_walk.html",
            "oklo_r0_fixture_readonly.html",
            "CONFORMANCE_FIXTURE_SPEC.md",
            "proto_biofilms_geyser_fission_research_program.md",
            "magnetoreception_3d_explorer.html",
            "reactor_pool_biofilm_explorer.html",
            "evidence_manifest.json",
            "test_calculation_provenance_and_invariants.js",
            "test_tecdoc643_viewer_regression.js",
            "test_poolwater_benchmark_gate.jl",
        ]

        if !isempty(LOCAL_SCREEN_PATTERNS)
            for f in all_portal_files
                txt = file_sha256_and_bytes(f).text
                if f != "tecdoc643_neutron_walk.html"
                    @test !matches_local_screen_policy(txt)
                end
            end
        end

        prov_label = "Generic IAEA-TECDOC-643 Vol. 1 10 MW MTR benchmark; illustrative OpenMC proof of concept; not modeled on any operating reactor."
        @test occursin(prov_label, file_sha256_and_bytes("index.html").text)
        @test occursin(prov_label, file_sha256_and_bytes("README.md").text)
        @test occursin(prov_label, file_sha256_and_bytes("artifact_index.xml").text)
        @test occursin(prov_label, file_sha256_and_bytes("benchmark_manifest.json").text)
        @test occursin(prov_label, file_sha256_and_bytes("POOLWATER_WORKFLOW_SPEC.md").text)

        dash_clean_files = [
            "index.html",
            "README.md",
            "render.yaml",
            "artifact_index.xml",
            "poolwater_interactive.html",
            "POOLWATER_WORKFLOW_SPEC.md",
            "benchmark_manifest.json",
            "tecdoc643_reference_fixture.jl",
            "biofilms_3d_explorer.html",
            "spacetime_explorer_4d_shareable.html",
            "oklo_r0_fixture_readonly.html",
            "CONFORMANCE_FIXTURE_SPEC.md",
            "proto_biofilms_geyser_fission_research_program.md",
            "magnetoreception_3d_explorer.html",
            "reactor_pool_biofilm_explorer.html",
            "evidence_manifest.json",
            "test_calculation_provenance_and_invariants.js",
            "test_tecdoc643_viewer_regression.js",
            "test_poolwater_benchmark_gate.jl",
        ]

        for f in dash_clean_files
            txt = file_sha256_and_bytes(f).text
            @test !occursin("\u2014", txt)
            @test !occursin("\u2013", txt)
            if !(f in ("test_calculation_provenance_and_invariants.js", "test_poolwater_benchmark_gate.jl"))
                @test !occursin("&mdash;", txt)
                @test !occursin("&ndash;", txt)
            end
        end
    end

    # --------------------------------------------------------------------------
    # Gate 5: Biotite, Biomagnetite & Cryptochrome 4D Magnetoreception Gates
    # --------------------------------------------------------------------------
    @testset "Gate 5: Biotite, Biomagnetite & Cryptochrome 4D Magnetoreception Epistemic Gates EG-1..EG-4 & 3-Regime Sensitivity" begin
        mag_html = file_sha256_and_bytes("magnetoreception_3d_explorer.html").text
        ev_json = file_sha256_and_bytes("evidence_manifest.json").text
        manifest_txt = file_sha256_and_bytes("benchmark_manifest.json").text

        for gate_token in ["EG-1: Geochemical Provenance", "EG-2: Physical Mechanism", "EG-3: Cellular Transduction", "EG-4: Evolutionary Origin"]
            @test occursin(gate_token, mag_html)
            @test occursin(gate_token, ev_json)
            @test occursin(gate_token, manifest_txt)
        end

        for ui_token in [
            "hyperplane4dBox",
            "slider4dW",
            "selD4Action",
            "selBiotiteRegime",
            "lblHyperRot",
            "lblD4Action",
            "lblBiotiteUmag",
            "btnExport4dPng",
            "biotiteInclusionTable",
            "verifyBiotite4dMagnetoreceptionGates",
            "exportMagnetoreception4dPng",
            "#22c55e",
            "#ef4444",
            "d4 - w",
        ]
            @test occursin(ui_token, mag_html)
        end

        # Verify 3-regime 1 um^3 biotite Fe3O4 inclusion physics algebra at B = 50 uT, T = 300 K
        mu0 = 4.0e-7 * pi
        kB = 1.380649e-23
        T = 300.0
        B = 50.0e-6
        V = 1.0e-18
        u_paramag_mid = (2.5e-4 * V * B^2 / (2.0 * mu0)) / (kB * T)
        @test u_paramag_mid ≈ 6.00393000154484e-5 atol = 1e-10

        # Scenario A: Single-domain remanent (M_s = 480 kA/m, f_inc = 1e-4)
        u_rem_1e4 = ((1.0 - 1.0e-4) * u_paramag_mid) + (1.0e-4 * 4.8e5 * V * B) / (kB * T)
        @test u_rem_1e4 ≈ 0.57949767458 atol = 1e-7

        # Scenario B: Partially remanent natural NRM (eta_NRM = 0.01, f_inc = 1e-2)
        u_nrm_1e2 = ((1.0 - 1.0e-2) * u_paramag_mid) + (1.0e-2 * 0.01 * 4.8e5 * V * B) / (kB * T)
        @test u_nrm_1e2 ≈ 0.57949708019 atol = 1e-7

        # Scenario C: Unblocked induced-anisotropy (Delta_chi_eff = 0.5, chi_eff = 3.0, f_inc = 1e-2)
        u_c_aniso_1e2 = ((1.0 - 1.0e-2) * u_paramag_mid) + (1.0e-2 * 0.5 * V * B^2 / (2.0 * mu0)) / (kB * T)
        u_c_iso_1e2 = ((1.0 - 1.0e-2) * u_paramag_mid) + (1.0e-2 * 3.0 * V * B^2 / (2.0 * mu0)) / (kB * T)
        @test u_c_aniso_1e2 ≈ 0.00126022491 atol = 1e-8
        @test u_c_iso_1e2 ≈ 0.00726415491 atol = 1e-8
    end

    # --------------------------------------------------------------------------
    # Gate 6: Coordinated 3D Open-Pool Reactor & Biofilm Coupon Explorer
    # --------------------------------------------------------------------------
    @testset "Gate 6: Coordinated 3D Pool-and-Biofilm Explorer (REACTOR-POOL-BIOFILM-COORDINATED-3D-01)" begin
        rpb_info = file_sha256_and_bytes("reactor_pool_biofilm_explorer.html")
        rpb_html = rpb_info.text
        manifest_txt = file_sha256_and_bytes("benchmark_manifest.json").text
        spec_txt = file_sha256_and_bytes("POOLWATER_WORKFLOW_SPEC.md").text
        xml_txt = file_sha256_and_bytes("artifact_index.xml").text

        @test rpb_info.bytes == 204031
        @test rpb_info.sha256 == "09bb3d9cbca7757c3630d48b50c344f04694522d1d991f8b1f53ef38a9c8d694"
        @test occursin("REACTOR-POOL-BIOFILM-COORDINATED-3D-01", rpb_html)
        @test occursin("REACTOR-POOL-BIOFILM-3D-01", rpb_html)
        @test occursin("REACTOR-POOL-BIOFILM-COORDINATED-3D-01", manifest_txt)
        @test occursin("REACTOR-POOL-BIOFILM-3D-01", manifest_txt)
        @test occursin("REACTOR-POOL-BIOFILM-COORDINATED-3D-01", spec_txt)
        @test occursin("verifyScientificBoundaries", rpb_html)
        @test occursin("getState", rpb_html)
        @test occursin("solvers_kept_separate: true", rpb_html)
        @test occursin("solver_level_coupled_validation_claimed: false", rpb_html)
        @test occursin("default_lambda_etc_on_load: 0.0", rpb_html)
        @test occursin("seconds_per_mcs: NaN", rpb_html)
        @test occursin("TIME BASES UNCOUPLED: t_pool [s] != MCS", rpb_html)
        @test occursin("downstream_differences_are_regime_dependent: true", rpb_html)
        @test occursin("implies_downstream_differences_under_all_regimes: false", rpb_html)
        @test occursin("ILLUSTRATIVE_PARAMETRIC_SENSITIVITY_ANALYSIS_NOT_EMPIRICAL_VALIDATION", rpb_html)
        @test occursin("geometry_classification: 'SYNTHETIC_SCHEMATIC'", rpb_html)
        @test occursin("geometry_classification: 'MICRO_BIOFILM_SLAB_VOXEL'", rpb_html)
        @test occursin("is_tecdoc643_benchmark_geometry: false", rpb_html)
        @test occursin("synthetic_schematic_not_tecdoc643_geometry", rpb_html)
        @test occursin("syntheticSchematicNotTecdoc643Geometry", rpb_html)
        @test !occursin("BENCHMARK_GEOMETRY", rpb_html)

        # Gate 1: Separated Provenance Taxonomy Contract (geometry_classification vs lowercase evidence_classification vs epistemic_status)
        @test occursin("PROVENANCE_TAXONOMY_CONTRACT", rpb_html)
        @test occursin("evidence_classification: 'synthetic'", rpb_html)
        @test occursin("evidence_classification: 'calculated'", rpb_html)
        @test occursin("evidence_classification: 'uncalibrated_model_snapshot'", rpb_html)
        @test occursin("evidence_classification: 'unavailable'", rpb_html)
        @test occursin("SYNTHETIC_SCHEMATIC_GEOMETRY_ONLY", rpb_html)
        @test occursin("SYNTHETIC_ANALYTICAL_OR_PACKING_SURROGATE", rpb_html)
        @test occursin("REDUCED_ORDER_CALCULATED_FROM_PUBLISHED_PARAMETERS", rpb_html)
        @test occursin("UNCALIBRATED_PROVISIONAL_MODEL_SNAPSHOT", rpb_html)
        @test occursin("EXPLICITLY_UNAVAILABLE_CAMPAIGN_DATA", rpb_html)
        @test occursin("prov_geometry_classification", rpb_html)
        @test occursin("prov_evidence_classification", rpb_html)
        @test occursin("prov_epistemic_class", rpb_html)
        @test occursin("prov_epistemic_status", rpb_html)
        @test occursin("\"geometry_classification\": \"SYNTHETIC_SCHEMATIC\"", manifest_txt)
        @test occursin("\"evidence_classification\": \"synthetic\"", manifest_txt)
        @test occursin("\"epistemic_status\": \"COORDINATED_SYNTHETIC_AND_REDUCED_ORDER_EXPLORER", manifest_txt)
        @test occursin("\"provenance_taxonomy_contract\"", manifest_txt)
        @test occursin("\"TECDOC643_6X7_BENCHMARK_REFERENCE\"", manifest_txt)
        @test occursin("\"POOLWATER_R200_H800_SYNTHETIC_CYLINDER\"", manifest_txt)
        @test occursin("<GeometryClassification>SYNTHETIC_SCHEMATIC</GeometryClassification>", xml_txt)
        @test occursin("<EvidenceClassification>synthetic</EvidenceClassification>", xml_txt)
        @test occursin("<EpistemicStatus>COORDINATED_SYNTHETIC_AND_REDUCED_ORDER_EXPLORER", xml_txt)
        @test occursin("\"is_tecdoc643_benchmark_geometry\": false", manifest_txt)
        @test occursin("\"synthetic_schematic_pool_conflated_with_tecdoc643_benchmark_geometry\": false", manifest_txt)

        # Gate 3: Programmatic lambda_etc = 0.0 & timeline coupling firewall + narrow software boundary validation claims
        @test occursin("setBaselineLambdaLock", rpb_html)
        @test occursin("attemptTimelineCoupling", rpb_html)
        @test occursin("enforceBaselineAndTimelineFirewall", rpb_html)
        @test occursin("installExplorerStateFirewallGuards", rpb_html)
        @test occursin("NO_VALIDATED_SECONDS_TO_MCS_CONVERSION", rpb_html)
        @test occursin("timeline_coupling_rejected: true", rpb_html)
        @test occursin("baseline_lambda_etc_enforced_zero", rpb_html)
        @test occursin("rendering_tests_validate_physical_model: false", rpb_html)
        @test occursin("H0_5b_rpm_sensitivity", rpb_html)
        @test occursin("H0_equal_dose_schedules", rpb_html)
        @test occursin("H0_epistemic_gates", rpb_html)
        @test occursin("attemptCrossTimelineOrBaselineViolation", rpb_html)
        @test occursin("provenanceTaxonomySeparated: taxonomyOk", rpb_html)
        @test occursin("passingRenderingTestsValidateSoftwareBoundariesNotPhysicalModel: narrowClaimsOk", rpb_html)
        @test occursin("empiricalPhysicalOrBiologicalValidationClaimed: st.empirical_physical_or_biological_validation_claimed", rpb_html)
        @test occursin("passing_rendering_tests_validate_software_boundaries_not_physical_model: true", rpb_html)
        @test occursin("empirical_physical_or_biological_validation_claimed: false", rpb_html)
        @test occursin("timelineCouplingProgrammaticallyBlocked: timelineFirewallOk", rpb_html)
        @test occursin("baselineNullControlEnforcesLambdaZero: baselineEnforcedOk", rpb_html)
        @test occursin("\"passing_rendering_tests_validate_software_boundaries_not_physical_model\": true", manifest_txt)
        @test occursin("\"empirical_physical_or_biological_validation_claimed\": false", manifest_txt)
        @test occursin("\"solver_level_coupled_pool_biofilm_validation_claimed\": false", manifest_txt)
        @test occursin("\"melanin_radiotrophy_default_lambda_etc_nonzero\": false", manifest_txt)

        @test occursin("507fc19c507505233268e058b7b5d7a0bd4e378c", rpb_html)
        @test occursin("2db2a7b558ea736c61cc459fd6a72c4afa36e3c5", rpb_html)
        @test occursin("8182c30ab46d3b6a8cee7c853c18f7a44766a59d", rpb_html)
        @test occursin("local_test_results_attributed_to_remote_pr_head: false", rpb_html)
        @test occursin("local_branch_pushed_to_remote: false", rpb_html)
    end

    # --------------------------------------------------------------------------
    # Licensing, Attribution, Hygiene & Facility-Neutral Wording Checks
    # --------------------------------------------------------------------------
    @testset "Licensing, Attribution, Hygiene & Dash-Clean Invariants" begin
        # Enforce exact Author and License strings
        idx_txt = file_sha256_and_bytes("index.html").text
        rdm_txt = file_sha256_and_bytes("README.md").text
        @test occursin("Author: Hunter Kinder (Mark Hunter Kinder II)", idx_txt)
        @test occursin("Author: Hunter Kinder (Mark Hunter Kinder II)", rdm_txt)
        @test occursin("Code: MIT · Content: CC BY 4.0", idx_txt)
        @test occursin("Code: MIT · Content: CC BY 4.0", rdm_txt)

        # Enforce release-hygiene and public terminology checks across all checked portal docs
        portal_docs = [
            "index.html",
            "README.md",
            "POOLWATER_WORKFLOW_SPEC.md",
            "artifact_index.xml",
            "benchmark_manifest.json",
            "LICENSE",
            "LICENSE-docs",
            "NOTICE",
        ]
        public_hygiene_regexes = [
            r"\b(prove|proves|proved|proving|falsification|falsifiable)\b"i,
            r"implies zero fouling"i,
            r"\bCC0\b",
            r"Hunter Kinder \(Mark Kinder II\)",
        ]
        for doc_name in portal_docs
            doc_path = joinpath(PORTAL_ROOT, doc_name)
            @test isfile(doc_path)
            doc_text = read(doc_path, String)
            @test !occursin("\u2014", doc_text)
            @test !occursin("\u2013", doc_text)
            @test !occursin("&mdash;", doc_text)
            @test !occursin("&ndash;", doc_text)
            for pat in public_hygiene_regexes
                @test !occursin(pat, doc_text)
            end
            if !isempty(LOCAL_SCREEN_PATTERNS)
                @test !matches_local_screen_policy(doc_text)
            end
        end

        @test occursin("do not apply a facility-specific Xe-135 shutdown factor.", idx_txt)
        @test occursin("#inspValue", idx_txt)
        @test occursin("216.4 deg C", idx_txt)

        # Verify LICENSE contains standard MIT text and copyright
        lic_text = read(joinpath(PORTAL_ROOT, "LICENSE"), String)
        @test occursin("MIT License", lic_text)
        @test occursin("Copyright (c) 2026 Mark Hunter Kinder II", lic_text)

        # Verify LICENSE-docs contains CC BY 4.0 notice and legalcode link
        lic_docs = read(joinpath(PORTAL_ROOT, "LICENSE-docs"), String)
        @test occursin("Creative Commons Attribution 4.0 International (CC BY 4.0)", lic_docs)
        @test occursin("Hunter Kinder (Mark Hunter Kinder II)", lic_docs)
        @test occursin("https://creativecommons.org/licenses/by/4.0/", lic_docs)
        @test occursin("https://creativecommons.org/licenses/by/4.0/legalcode", lic_docs)

        # Verify NOTICE documents dual license split, TECDOC-643 exclusion, and contributor review note
        notice_text = read(joinpath(PORTAL_ROOT, "NOTICE"), String)
        @test occursin("Code: MIT · Content: CC BY 4.0", notice_text)
        @test occursin("Fixture Provenance and Revision Note (for contributor review):", notice_text)
        @test occursin("tecdoc643_neutron_walk.html", notice_text)
        @test occursin("tecdoc643_reference_fixture.jl", notice_text)
        @test occursin("0.0 pcm", notice_text)
        @test occursin("worth_sigma_pcm", notice_text)

        if isdir(joinpath(PORTAL_ROOT, ".git"))
            commit_msg = read(`git -C $(PORTAL_ROOT) log -1 --format=%B`, String)
            @test occursin("for contributor review", commit_msg)
            if !isempty(LOCAL_SCREEN_PATTERNS)
                @test !matches_local_screen_policy(commit_msg)
            end
        end
        if isempty(LOCAL_SCREEN_PATTERNS)
            println("screen skipped (local patterns file not present)")
        else
            println("local release screen: PASS ($(length(LOCAL_SCREEN_PATTERNS)) patterns)")
        end
    end
end



