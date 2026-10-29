#!/usr/bin/env python3
# ==============================================================================
# oklo_coupled_hydrothermal_cycle_pymol.py
# Title: Inferred Oklo reactor cycling and hypothetical hydrothermal transport
# Epistemic Status: [HYPOTHETICAL COUPLED MODEL - RUNG_4_MODEL]
# Author: Hunter Kinder (Mark Hunter Kinder II)
# License: Code: MIT . Content: CC BY 4.0
# Companion Script To: oklo_coupled_hydrothermal_cycle.cxc (UCSF ChimeraX 1.12)
# Target Engine: PyMOL 3.1.9 (Multi-State CCP4 Isomesh/Isosurface + CGO Vectors)
# ==============================================================================
#
# 1. WHAT THE OKLO CYCLE ACTUALLY REPRESENTS
#    - Meshik et al. (2004, Phys. Rev. Lett. 93:182302, PMID 15525157) analyzed
#      trapped fission-product xenon isotopes in aluminous phosphate minerals to
#      infer cyclic reactor operation of roughly 30 minutes active fission
#      separated by about 2.5 hours (150 minutes) of dormancy (180-minute full
#      period, 60 frames at 3.0 minutes per frame).
#    - The xenon isotope record does NOT directly show a surface geyser erupting.
#      Rather than treating "the Oklo geyser" as an observed object, this script
#      visualizes a proposed pulsed, water-moderated hydrothermal system (Ibekwe
#      et al., 2020, Prog. Nucl. Energy 118:103080, S0149197019301817):
#        State 1 / Phase 1 (1_before_pulse, F00..02, 0..9 min)   : Groundwater recharge
#        State 2 / Phase 2 (2_heating,      F03..08, 9..27 min)  : Heating & buoyancy
#        State 3 / Phase 3 (3_venting,      F09..17, 27..51 min) : Boiling & expulsion
#        State 4 / Phase 4 (4_cooldown,     F18..47, 54..141 min): Shutdown & cooldown
#        State 5 / Phase 5 (5_recharge,     F48..59, 144..180 min): Refill & repeat
#
# 2. FIVE LIMITATIONS FIXED RELATIVE TO FROZEN REVISION-0 oklo_cycle.cxc
#    (a) Coupled 4-Layer Model vs Prescribed R0 Algebraic Indices:
#        Layer 1: Groundwater motion & two-phase Darcy flow (S_l, S_v, Delta_P, u)
#        Layer 2: Heat, moderator feedback & boiling phase change (T, Delta_T)
#        Layer 3: Pore/mineral surface chemistry (>OH, >O-, >OCa+ / >OMg+, pH)
#        Layer 4: Abiotic oligomer reaction-transport PDE (dc_n/dt, Lambda)
#    (b) Display Cutoffs vs Physical Thresholds:
#        Isosurface levels (T = 160 C, 210 C, 270 C; S_l = 0.50; S_v = 0.20;
#        dc_n/dt = +/-0.05 umol/(L min)) are legibility display choices, kept
#        distinct from physical boiling T_sat(P) and criticality S_crit = 0.62.
#    (c) Continuous Pulse & Thermal Envelope (Fixing the b = 0.17 Discontinuity):
#        Repairs the Revision-0 jump at b = 0.17 (Frame 10 -> Frame 11) using a
#        C^1-continuous moderator-coupled power and thermal envelope.
#    (d) Physical Coordinate Convention & Multi-Scale Firewall:
#        1 scene unit = 0.5 m on the 5-stage BILD/MRC grid (or 1.0 m on the 16 m
#        60-frame series). Pore (um) and molecular interlayer (nm) scales are
#        strictly separated from the macroscopic grid.
#    (e) External Coupled Solver + Multi-State CCP4 Maps & CGO 3D Vectors:
#        PyMOL loads precomputed MRC2014 volumes (stripping extended NSYMBT
#        header bytes for strict CCP4 compatibility) and renders 3D Darcy
#        specific-discharge arrows, RK4 streamlines, and parcel pathlines via
#        Compiled Graphics Objects (cgo.CYLINDER and cgo.CONE).
#
# 3. MINERALOGICAL & ABIOTIC FIREWALL CAVEATS
#    - Oklo hydrothermal clays include di-trioctahedral chlorites such as sudoite
#      and illite (Pourcelot & Gauthier-Lafaye, 1998, Chem. Geol. 145:103-115,
#      doi:10.1016/S0009-2541(98)00194-6), which are NOT automatically equivalent
#      to laboratory montmorillonite (Ferris et al., 1996, Nature 381:59-61,
#      doi:10.1038/381059a0).
#    - Abiotic model (H_5) investigates generic oligomer phosphate/nucleobase
#      adsorption and mineral bridging; modern cellular EPS and cell-wall bridging
#      (H_6) are strictly excluded.
# ==============================================================================

import math
import os
import struct
import tempfile
from pymol import cmd, cgo

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else os.getcwd()
os.chdir(SCRIPT_DIR)

STAGE_SPECS = [
    (1, "1_before_pulse", 0.0125, "Stage 1/5: 1_before_pulse (T_core=45C, Quiescent Baseline) | 1 unit = 0.5 m [RUNG_4_MODEL]"),
    (2, "2_heating",      0.1003, "Stage 2/5: 2_heating (T_core=115C, Buoyant Plume Nucleation) | 1 unit = 0.5 m [RUNG_4_MODEL]"),
    (3, "3_venting",      0.4033, "Stage 3/5: 3_venting (T_core=145C, Peak Fracture Discharge & Vortex Sheet) | 1 unit = 0.5 m [RUNG_4_MODEL]"),
    (4, "4_cooldown",     0.0492, "Stage 4/5: 4_cooldown (T_core=80C, Thermal Relaxation & Lateral Flow) | 1 unit = 0.5 m [RUNG_4_MODEL]"),
    (5, "5_recharge",     0.2198, "Stage 5/5: 5_recharge (T_core=38C, Inward Matrix Recharge Suction) | 1 unit = 0.5 m [RUNG_4_MODEL]"),
]


def load_mrc2014_as_ccp4(filename, map_name):
    """Load an MRC2014 volume into PyMOL by stripping extended NSYMBT header bytes if present."""
    path = filename if os.path.isabs(filename) else os.path.join(SCRIPT_DIR, filename)
    if not os.path.isfile(path):
        return False
    with open(path, "rb") as f:
        raw = bytearray(f.read())
    nsymbt = struct.unpack("<i", raw[92:96])[0]
    if nsymbt > 0:
        clean_raw = raw[:1024] + raw[1024 + nsymbt:]
        clean_raw[92:96] = struct.pack("<i", 0)
        fd, tmp_p = tempfile.mkstemp(suffix=".ccp4")
        os.close(fd)
        with open(tmp_p, "wb") as tf:
            tf.write(clean_raw)
        cmd.load(tmp_p, map_name, format="ccp4")
        os.remove(tmp_p)
    else:
        cmd.load(path, map_name, format="ccp4")
    return True


def parse_bild_to_cgo(bild_filename, default_rgb=(0.2, 0.4, 0.8)):
    """Convert ChimeraX .bild .arrow and .cylinder directives into PyMOL CGO primitives."""
    path = bild_filename if os.path.isabs(bild_filename) else os.path.join(SCRIPT_DIR, bild_filename)
    cgo_data = []
    if not os.path.isfile(path):
        return cgo_data
    cur_r, cur_g, cur_b = default_rgb
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split()
            if not parts:
                continue
            if parts[0] == ".color" and len(parts) >= 4:
                cur_r, cur_g, cur_b = float(parts[1]), float(parts[2]), float(parts[3])
            elif parts[0] == ".arrow" and len(parts) >= 7:
                x1, y1, z1 = float(parts[1]), float(parts[2]), float(parts[3])
                x2, y2, z2 = float(parts[4]), float(parts[5]), float(parts[6])
                r_cyl = float(parts[7]) if len(parts) >= 8 else 0.025
                r_cone = float(parts[8]) if len(parts) >= 9 else 0.075
                frac = float(parts[9]) if len(parts) >= 10 else 0.75
                mx = x1 + frac * (x2 - x1)
                my = y1 + frac * (y2 - y1)
                mz = z1 + frac * (z2 - z1)
                cgo_data.extend([
                    cgo.CYLINDER, x1, y1, z1, mx, my, mz, r_cyl,
                    cur_r, cur_g, cur_b, cur_r, cur_g, cur_b,
                    cgo.CONE, mx, my, mz, x2, y2, z2, r_cone, 0.0,
                    cur_r, cur_g, cur_b, cur_r, cur_g, cur_b, 1.0, 1.0,
                ])
            elif parts[0] == ".cylinder" and len(parts) >= 8:
                x1, y1, z1 = float(parts[1]), float(parts[2]), float(parts[3])
                x2, y2, z2 = float(parts[4]), float(parts[5]), float(parts[6])
                r_cyl = float(parts[7])
                cgo_data.extend([
                    cgo.CYLINDER, x1, y1, z1, x2, y2, z2, r_cyl,
                    cur_r, cur_g, cur_b, cur_r, cur_g, cur_b,
                ])
    return cgo_data


def build_fallback_stage_cgo(stage_idx):
    """Generate analytical 3D Darcy velocity arrows and streamlines if external .bild files are absent."""
    arrows = []
    streamlines = []
    buoyancy = {1: 0.12, 2: 0.55, 3: 1.00, 4: 0.28, 5: -0.45}.get(stage_idx, 0.5)
    for ix in (1.5, 2.75, 4.0):
        for iy in (1.5, 2.75, 4.0):
            for iz in (1.0, 2.5, 4.0):
                rx = ix - 2.75
                ry = iy - 2.75
                r_xy = math.sqrt(rx * rx + ry * ry) + 1e-6
                inflow = -0.18 if stage_idx in (1, 5) else (0.14 if iz > 2.8 else -0.12)
                ux = inflow * (rx / r_xy) * abs(buoyancy)
                uy = inflow * (ry / r_xy) * abs(buoyancy)
                uz = 0.42 * buoyancy * math.exp(-0.35 * r_xy * r_xy)
                x2, y2, z2 = ix + ux, iy + uy, iz + uz
                mx, my, mz = ix + 0.72 * ux, iy + 0.72 * uy, iz + 0.72 * uz
                arrows.extend([
                    cgo.CYLINDER, ix, iy, iz, mx, my, mz, 0.025,
                    0.20, 0.40, 0.80, 0.20, 0.40, 0.80,
                    cgo.CONE, mx, my, mz, x2, y2, z2, 0.075, 0.0,
                    0.20, 0.40, 0.80, 0.20, 0.40, 0.80, 1.0, 1.0,
                ])
    for seed_angle in (0.0, 0.5 * math.pi, math.pi, 1.5 * math.pi):
        px = 2.75 + 0.85 * math.cos(seed_angle)
        py = 2.75 + 0.85 * math.sin(seed_angle)
        pz = 1.10
        for step in range(12):
            nx = px + 0.04 * math.cos(seed_angle + 0.2 * step)
            ny = py + 0.04 * math.sin(seed_angle + 0.2 * step)
            nz = pz + 0.24 * (1.0 if buoyancy >= 0 else -0.5)
            streamlines.extend([
                cgo.CYLINDER, px, py, pz, nx, ny, nz, 0.028,
                0.15, 0.65, 0.45, 0.15, 0.65, 0.45,
            ])
            px, py, pz = nx, ny, nz
    return arrows, streamlines


def setup_scene():
    cmd.bg_color("white")
    cmd.set("orthoscopic", 1)
    cmd.set("two_sided_lighting", 1)

    # 1. Static Geological Compartments (Clay Halo, Fracture Conduit, Core Zone)
    has_halo = load_mrc2014_as_ccp4("clay_halo_mask_scene_0p5m.mrc", "clay_halo_map")
    has_frac = load_mrc2014_as_ccp4("fracture_mask_scene_0p5m.mrc", "fracture_map")
    has_core = load_mrc2014_as_ccp4("core_mask_scene_0p5m.mrc", "core_map")

    for st_idx, _, _, _ in STAGE_SPECS:
        if has_halo:
            cmd.isomesh("clay_halo_mesh", "clay_halo_map", 0.5, state=st_idx)
        if has_frac:
            cmd.isosurface("fracture_surf", "fracture_map", 0.5, state=st_idx)
        if has_core:
            cmd.isosurface("core_surf", "core_map", 0.5, state=st_idx)

    if has_halo:
        cmd.color("tan", "clay_halo_mesh")
    if has_frac:
        cmd.color("slate", "fracture_surf")
        cmd.set("transparency", 0.78, "fracture_surf")
    if has_core:
        cmd.color("tv_orange", "core_surf")
        cmd.set("transparency", 0.75, "core_surf")

    # 2. Full-Cycle Parcel Pathlines across States 1..5
    pathlines_cgo = parse_bild_to_cgo("pathlines_full_cycle_scene_0p5m.bild", default_rgb=(0.85, 0.35, 0.15))
    if pathlines_cgo:
        for st_idx, _, _, _ in STAGE_SPECS:
            cmd.load_cgo(pathlines_cgo, "pathlines_cgo", state=st_idx)

    # 3. Five-Stage Coupled Water Saturation, Vorticity, Darcy Vectors & Streamlines
    for st_idx, st_name, vort_iso, banner_txt in STAGE_SPECS:
        w_map = f"water_map_{st_idx}"
        v_map = f"vort_map_{st_idx}"
        if load_mrc2014_as_ccp4(f"water_volume_fraction_{st_name}_scene_0p5m.mrc", w_map):
            cmd.isosurface("water_surf", w_map, 0.5, state=st_idx)
        if load_mrc2014_as_ccp4(f"vorticity_mag_{st_name}_scene_0p5m.mrc", v_map):
            cmd.isosurface("vorticity_surf", v_map, vort_iso, state=st_idx)

        vec_cgo = parse_bild_to_cgo(f"flow_vectors_{st_name}_scene_0p5m.bild", default_rgb=(0.2, 0.4, 0.8))
        sl_cgo = parse_bild_to_cgo(f"streamlines_{st_name}_scene_0p5m.bild", default_rgb=(0.15, 0.6, 0.4))
        if not vec_cgo or not sl_cgo:
            fb_vec, fb_sl = build_fallback_stage_cgo(st_idx)
            vec_cgo = vec_cgo or fb_vec
            sl_cgo = sl_cgo or fb_sl
        cmd.load_cgo(vec_cgo, "flow_vectors_cgo", state=st_idx)
        cmd.load_cgo(sl_cgo, "streamlines_cgo", state=st_idx)
        cmd.pseudoatom("stage_banner", pos=[2.75, 2.75, 2.75], state=st_idx, label=banner_txt)

    if "water_surf" in cmd.get_names("objects"):
        cmd.color("cyan", "water_surf")
        cmd.set("transparency", 0.68, "water_surf")
    if "vorticity_surf" in cmd.get_names("objects"):
        cmd.color("purple", "vorticity_surf")
        cmd.set("transparency", 0.70, "vorticity_surf")

    cmd.hide("everything", "stage_banner")
    cmd.show("labels", "stage_banner")
    cmd.set("label_size", 11)
    cmd.set("label_color", "black")
    cmd.set("label_position", [0.0, 4.2, 5.0], "stage_banner")

    cmd.reset()
    cmd.origin(position=[2.75, 2.75, 2.75])
    if has_halo:
        cmd.center("clay_halo_mesh")
        cmd.zoom("clay_halo_mesh", buffer=2.4)
    cmd.turn("x", -65)
    cmd.turn("z", 25)

    # Configure 150-frame multi-state timeline (30 frames per stage across States 1..5)
    cmd.mset("1x30 2x30 3x30 4x30 5x30")
    for f_idx in range(1, 151):
        cmd.mdo(f_idx, "turn z, 2.4")
    cmd.set("movie_loop", 1)
    cmd.set("movie_fps", 24)

    if os.environ.get("PYMOL_BATCH_RENDER", "0") == "1":
        for st_idx, st_name, _, _ in STAGE_SPECS:
            cmd.frame((st_idx - 1) * 30 + 1)
            cmd.set("state", st_idx)
            if st_idx > 1:
                cmd.turn("z", 24)
            out_p = os.path.join(SCRIPT_DIR, f"pymol_stage{st_idx}_{st_name}_1080p.png")
            cmd.png(out_p, width=1920, height=1080, dpi=300, ray=1)
    else:
        cmd.mplay()


setup_scene()
