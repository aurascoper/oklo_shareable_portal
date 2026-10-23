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
            "poolwater_interactive.html"                        => (73931,  "c3340543ded0e746153d39247d7ff106a00c61ec98996b9d9074cef97b0f8f76"),
            "POOLWATER_WORKFLOW_SPEC.md"                        => (17490,  "19144eafb188ab1d5fa2bb7d81ca97513d58a2c2b85ec1c74f1b809ea5c85b79"),
            "benchmark_manifest.json"                           => (10971,  "2fbdf2e6b602494ad22a97e677b36a89514e33b2b8542397c162791551f6dcaf"),
        )

        xml_info = file_sha256_and_bytes("artifact_index.xml")
        readme_info = file_sha256_and_bytes("README.md")
        manifest_info = file_sha256_and_bytes("benchmark_manifest.json")

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
                       "poolwater_interactive.html", "POOLWATER_WORKFLOW_SPEC.md")
                @test occursin(exp_sha, manifest_info.text)
            end
        end

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
        ]

        forbidden_patterns = [
            r"\bmurr\b"i,
            r"missouri\s+university\s+research\s+reactor"i,
            r"\br-103\b"i,
            r"rur-26-"i,
            r"\bap-dc-001\b"i,
            r"specialist\s+ii"i,
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
            "CONFORMANCE_FIXTURE_SPEC.md",
            "proto_biofilms_geyser_fission_research_program.md",
        ]

        for f in dash_clean_files
            txt = file_sha256_and_bytes(f).text
            @test !occursin("\u2014", txt)
            @test !occursin("\u2013", txt)
            @test !occursin("&mdash;", txt)
            @test !occursin("&ndash;", txt)
        end
    end
end
