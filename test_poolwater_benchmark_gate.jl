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
            "biofilms_3d_explorer.html"                         => (869267, "037e2050b70e92b77075b3b913aeed615457d6a1cb09a0fe85f4d6b14d96366d"),
            "tecdoc643_reference_fixture.jl"                    => (6018,   "ec440f838d6c70263dcad3efef11da2159ab7f4d793d885367e4811415f8147d"),
            "proto_biofilms_geyser_fission_research_program.md" => (48056,  "da50d4002e6bcca94234045c3d371e16af243806cdb1ed99e0beff074c1cfb11"),
            "poolwater_interactive.html"                         => (79610,   "fa0f0dc30c45681a3b774db8533110370ebdce77b91317b003bfdc065a639b5a"),
            "POOLWATER_WORKFLOW_SPEC.md"                         => (17684,   "2969c35e198d0019d3b8a970754eb6a75754428c93724049822be96759db0669"),
            "multispecies_biofilm_robin_cylindrical_4panel.gif"  => (2571435, "e73622d6454a3a6ad16af88f15b8d5e21161c801d51059050244303af5148997"),
            "clonal_sector_expansion_reference.jpg"              => (159146,  "67865f346f4d23835707174251eb589f72f344637ac221fbff427169fc34f115"),
            "magnetoreception_3d_explorer.html"                  => (263619,  "e9e50a6857b699aa0c102b536842790f5555bf5d228f01b430282049f0ed2064"),
            "evidence_manifest.json"                             => (116876,  "4f61d995772ee055fd0df378d4884bc8b2a2be235877ffc4b4424fc519f9cacf"),
            "test_calculation_provenance_and_invariants.js"      => (38751,   "db751a8972ee125fe4e334cdc59c51f1f3c5784b03026119587b50a3cd65fb55"),
            "benchmark_manifest.json"                            => (17965,   "f32f2393768e6c6ddb1baa47702e4d1ca973fcd7e5ae2e26907a3e4c2743e35b"),
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
                       "evidence_manifest.json",
                       "test_calculation_provenance_and_invariants.js")
                @test occursin(exp_sha, manifest_info.text)
            end
        end

        @test occursin("Multispecies Biofilm Spatial Model", index_info.text)
        @test occursin("Synthetic visualization", index_info.text)
        @test occursin("Robin boundary condition", index_info.text)
        @test occursin("Erithacus rubecula", index_info.text)
        @test occursin("multispecies_biofilm_robin_cylindrical_4panel.gif", index_info.text)
        @test occursin("clonal_sector_expansion_reference.jpg", index_info.text)
        @test occursin("magnetoreception_3d_explorer.html", index_info.text)
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
    @testset "Gate 2: Decoupled Physics Modules & Peer RadioPharmacology.jl Contract" begin
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
    # Gate 3 & Gate 4: Explicit UNAVAILABLE States, Institutional Scrub & Dash Ban
    # --------------------------------------------------------------------------
    @testset "Gate 3 & Gate 4: Unavailable Field Honesty, Zero Forbidden Strings & Zero En/Em-Dashes" begin
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
            "evidence_manifest.json",
            "test_tecdoc643_viewer_regression.js",
        ]

        forbidden_patterns = [
            r"\bmurr\b"i,
            r"missouri\s+university\s+research\s+reactor"i,
            r"\br-103\b"i,
            r"rur-26"i,
            r"\bap-dc-001\b"i,
            r"specialist\s+ii"i,
            r"177lu"i,
            r"lu-177"i,
            r"lutetium"i,
            r"chelat"i,
            r"\bdota\b"i,
            r"\bpsma\b"i,
            r"radiopharmaceutical"i,
        ]

        for f in all_portal_files
            txt = file_sha256_and_bytes(f).text
            for pat in forbidden_patterns
                @test !occursin(pat, txt)
            end
        end

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
            "evidence_manifest.json",
            "test_calculation_provenance_and_invariants.js",
            "test_tecdoc643_viewer_regression.js",
        ]

        for f in dash_clean_files
            txt = file_sha256_and_bytes(f).text
            @test !occursin("\u2014", txt)
            @test !occursin("\u2013", txt)
            if f != "test_calculation_provenance_and_invariants.js"
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
end
