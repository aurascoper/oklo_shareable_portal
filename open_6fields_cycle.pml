# open_6fields_cycle.pml
# Interactive 60-State 6-Field Cycle Visualization & Animation in PyMOL 3.1.9
# Pre-builds all 60 states into GPU memory in PyMOL grid_mode = 1 (3x2 grid)
# with physical units (normalize_ccp4_maps = 0) for smooth 60 FPS interactive playback.

reinitialize
set normalize_ccp4_maps, 0
set_color bg_slate, [0.043, 0.059, 0.098]
bg_color bg_slate
viewport 1680, 980
set grid_mode, 1
set grid_max, 3

set_color temp_mesh, [0.984, 0.573, 0.235]
set_color temp_core, [0.937, 0.267, 0.267]
set_color hyd_mesh,  [0.220, 0.741, 0.973]
set_color hyd_void,  [0.231, 0.510, 0.965]
set_color h2_mesh,   [0.204, 0.827, 0.600]
set_color h2_core,   [0.063, 0.725, 0.506]
set_color u235_mesh, [0.992, 0.878, 0.278]
set_color u235_core, [0.918, 0.702, 0.031]
set_color poly_mesh, [0.753, 0.518, 0.988]
set_color poly_core, [0.659, 0.333, 0.969]
set_color comp_mesh, [0.580, 0.639, 0.722]
set_color comp_stm,  [0.976, 0.451, 0.086]
set_color comp_liq,  [0.024, 0.714, 0.831]

set transparency_mode, 1
set backface_cull, 0
set two_sided_lighting, 1
set depth_cue, 0
set movie_fps, 15

python
import os
from pymol import cmd

SERIES_DIR = os.environ.get("OKLO_SERIES_DIR", "out/series/b0.17")

fields_cfg = [
    (1, "temperature",      75.0,   "temp_mesh", 160.0,  "temp_core", 0.30),
    (2, "hydration",        0.85,   "hyd_mesh",  0.50,   "hyd_void",  0.25),
    (3, "h2_concentration", 1.20,   "h2_mesh",   2.00,   "h2_core",   0.25),
    (4, "u235_ratio",       0.0068, "u235_mesh", 0.0060, "u235_core", 0.28),
    (5, "polymer_yield",    3.20,   "poly_mesh", 8.00,   "poly_core", 0.32),
    (6, "compartments",     1.50,   "comp_mesh", 2.50,   "comp_liq",  0.18),
]

for slot, fname, l_mesh, c_mesh, l_surf, c_surf, transp in fields_cfg:
    mesh_name = f"slot{slot}_{fname}_mesh"
    surf_name = f"slot{slot}_{fname}_surf"
    for i in range(60):
        st = i + 1
        # u235_ratio is static, hydration/h2/compartments share identical static frames outside f08..f20
        mpath = os.path.join(SERIES_DIR, f"{fname}_f{i:02d}.mrc")
        tmp_map = f"tmp_{fname}_{i}"
        cmd.load(mpath, tmp_map, format="ccp4")
        cmd.isomesh(mesh_name, tmp_map, l_mesh, state=st)
        if fname == "compartments" and (8 <= i <= 19):
            cmd.isosurface(surf_name, tmp_map, 3.50, state=st)
        else:
            cmd.isosurface(surf_name, tmp_map, l_surf, state=st)
    cmd.color(c_mesh, mesh_name)
    cmd.color("comp_stm" if fname == "compartments" else c_surf, surf_name)
    cmd.set("transparency", transp, surf_name)
    cmd.set("grid_slot", slot, mesh_name)
    cmd.set("grid_slot", slot, surf_name)

cmd.group("raw_mrc_maps", "tmp_*")
cmd.reset()
cmd.origin(position=[7.75, 7.75, 7.75])
cmd.center("slot4_u235_ratio_mesh")
cmd.turn("z", 28.0)
cmd.turn("x", -68.0)
cmd.zoom("slot4_u235_ratio_mesh", buffer=3.2)

cmd.mset("1 -60")
for f in range(1, 61):
    az = 25.0 + (f - 1) * 6.0
    cmd.mdo(f, f"reset; origin position=[7.75,7.75,7.75]; center slot4_u235_ratio_mesh; turn z, {az:.1f}; turn x, -68.0; zoom slot4_u235_ratio_mesh, buffer=3.2")
python end

mplay
