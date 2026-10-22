module TECDOC643ReferenceFixture

"""
A quarantined, test-only transcription of the benchmark values pasted into the
conversation. This module is NOT evidence that the values have been regenerated
from OpenMC statepoints, depletion results, or raw HDF5 track files.

Keep this IAEA generic MTR fixture separate from MURR simulation/calibration
inputs. It can test generic reactivity algebra; it cannot establish MURR physics.
"""

export source_metadata, blade_sweep, burnup_table, interpolated_k_crossing_day,
       reactivity_rho, delta_rho, worth_sigma_pcm, audit_operator_functions

const SOURCE_METADATA = (
    dataset_id = "tecdoc643_neutron_walk_transcribed_table_v0",
    provenance_status = :transcribed_unverified,
    reactor = "IAEA generic 10 MW MTR benchmark (not MURR)",
    openmc_version = "0.15.3 (claimed in supplied narrative; not independently verified)",
    nuclear_data = "ENDF/B-VIII.0 (claimed in supplied narrative; not independently verified)",
    required_before_scientific_use = [
        "Hash and archive the actual OpenMC input deck, materials, cross_sections.xml, statepoints, summary, track files and depletion outputs.",
        "Record OpenMC build, nuclear-data library revision, tally definitions, settings, source/batch counts and uncertainty definitions.",
        "Tie each table to an explicit run/configuration ID; do not merge the independent 0.98057/1.19621 pair with the sweep endpoints 0.97943/1.19810.",
        "Do not infer MURR power peaking, blade worth, isotope inventory or shutdown transient from this IAEA MTR fixture."
    ]
)

source_metadata() = SOURCE_METADATA

# Values below are transcribed from the supplied code block, not independently
# regenerated. The displayed k values are rounded; derived values therefore
# need not reproduce claims made from higher-precision source records.
const WITHDRAWN_PCT = [0.0, 25.0, 50.0, 75.0, 100.0]
const SWEEP_K = [0.97943, 1.02804, 1.11336, 1.17049, 1.19810]
const SWEEP_SIGMA_K = [0.00102, 0.00115, 0.00116, 0.00113, 0.00081]

const BURN_DAYS = [0.0, 5.0, 10.0, 20.0, 40.0, 80.0, 120.0, 160.0, 200.0, 250.0, 300.0, 350.0]
const BURN_K = [1.19676, 1.15243, 1.14750, 1.14054, 1.12952, 1.11619, 1.09730, 1.07909, 1.06614, 1.04293, 1.01743, 0.99578]
const U235_G = [10402.9928, 10337.9759, 10272.9547, 10143.4932, 9887.0078, 9383.6650, 8886.3671, 8394.8641, 7909.3097, 7314.7278, 6729.9779, 6155.7275]
const PU239_G = [0.0, 2.9668, 8.4975, 20.7104, 44.5863, 89.2064, 128.1251, 162.4050, 192.7640, 225.5186, 252.1807, 273.5623]
const XE135_EQ_G = [0.0, 0.0577, 0.0578, 0.0573, 0.0563, 0.0543, 0.0523, 0.0504, 0.0484, 0.0457, 0.0431, 0.0405]
const SM149_G = [0.0, 0.1401, 0.3115, 0.4770, 0.5346, 0.5319, 0.5237, 0.5156, 0.5044, 0.4896, 0.4723, 0.4521]

"Reactivity rho = (k_eff - 1) / k_eff."
reactivity_rho(k::Real) = (k - 1) / k

"Signed change in reactivity, rho(k2) - rho(k1)."
delta_rho(k1::Real, k2::Real) = reactivity_rho(k2) - reactivity_rho(k1)

"""
First-order propagated uncertainty in pcm for a reactivity difference,
assuming the two k-effective estimates are independent and sigma_k is 1-sigma.
"""
function worth_sigma_pcm(k1::Real, sigma_k1::Real, k2::Real, sigma_k2::Real)
    sigma_k1 >= 0 || throw(ArgumentError("sigma_k1 must be non-negative"))
    sigma_k2 >= 0 || throw(ArgumentError("sigma_k2 must be non-negative"))
    return 1.0e5 * sqrt((sigma_k1 / k1^2)^2 + (sigma_k2 / k2^2)^2)
end

"Return the transcribed blade sweep with algebraically derived values and uncertainty."
function blade_sweep()
    k_out = SWEEP_K[end]
    sigma_out = SWEEP_SIGMA_K[end]
    return [(
        withdrawn_pct = WITHDRAWN_PCT[i],
        k_eff = SWEEP_K[i],
        sigma_k = SWEEP_SIGMA_K[i],
        reactivity_pcm = 1.0e5 * reactivity_rho(SWEEP_K[i]),
        # Positive means reactivity gained going from this row to blades fully withdrawn.
        worth_to_fully_withdrawn_pcm = 1.0e5 * delta_rho(SWEEP_K[i], k_out),
        worth_sigma_pcm = worth_sigma_pcm(SWEEP_K[i], SWEEP_SIGMA_K[i], k_out, sigma_out)
    ) for i in eachindex(SWEEP_K)]
end

"Return transcribed depletion rows. No shutdown transient is fabricated here."
function burnup_table()
    n = length(BURN_DAYS)
    all(length(v) == n for v in (BURN_K, U235_G, PU239_G, XE135_EQ_G, SM149_G)) ||
        error("Burnup arrays have inconsistent lengths")
    return [(
        day = BURN_DAYS[i],
        mwd = 10.0 * BURN_DAYS[i],
        k_eff = BURN_K[i],
        reactivity_pcm = 1.0e5 * reactivity_rho(BURN_K[i]),
        u235_g = U235_G[i],
        pu239_g = PU239_G[i],
        xe135_full_power_equilibrium_g = XE135_EQ_G[i],
        sm149_g = SM149_G[i]
    ) for i in eachindex(BURN_DAYS)]
end

"Linear interpolation of the first displayed interval bracketing k_eff = 1."
function interpolated_k_crossing_day()
    for i in 1:(length(BURN_K) - 1)
        if (BURN_K[i] - 1) * (BURN_K[i + 1] - 1) <= 0
            k1, k2 = BURN_K[i], BURN_K[i + 1]
            t1, t2 = BURN_DAYS[i], BURN_DAYS[i + 1]
            k1 == k2 && return t1
            return t1 + (k1 - 1) / (k1 - k2) * (t2 - t1)
        end
    end
    return nothing
end

"""
Compare this fixture's algebra with supplied RadioPharm functions. Pass functions
explicitly so this file does not pretend to know or replace their implementation.
"""
function audit_operator_functions(; reactivity_rho_fn, delta_rho_fn)
    points = [(0.97943, 1.19810), (1.19676, 1.15243)]
    return [(
        k1 = k1,
        k2 = k2,
        local_rho_k1_pcm = 1.0e5 * reactivity_rho_fn(k1),
        fixture_rho_k1_pcm = 1.0e5 * reactivity_rho(k1),
        local_delta_rho_pcm = 1.0e5 * delta_rho_fn(k1, k2),
        fixture_delta_rho_pcm = 1.0e5 * delta_rho(k1, k2),
        agrees_with_fixture = isapprox(reactivity_rho_fn(k1), reactivity_rho(k1); atol=1e-12, rtol=0) &&
                              isapprox(delta_rho_fn(k1, k2), delta_rho(k1, k2); atol=1e-12, rtol=0)
    ) for (k1, k2) in points]
end

end # module
