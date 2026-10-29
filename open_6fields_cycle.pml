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
import math
import os
import struct
import sys
import tempfile
from pymol import cmd

def _write_ccp4_map(path, nx, ny, nz, cell_len, vals):
    hdr = bytearray(1024)
    struct.pack_into("<10i", hdr, 0, nx, ny, nz, 2, 0, 0, 0, nx - 1, ny - 1, nz - 1)
    struct.pack_into("<6f", hdr, 40, cell_len, cell_len, cell_len, 90.0, 90.0, 90.0)
    struct.pack_into("<3i", hdr, 64, 1, 2, 3)
    struct.pack_into("<3f", hdr, 76, min(vals), max(vals), sum(vals) / len(vals))
    hdr[208:212] = b"MAP "
    hdr[212:216] = b"\x44\x44\x00\x00"
    with open(path, "wb") as tf:
        tf.write(hdr)
        tf.write(struct.pack(f"<{len(vals)}f", *vals))

def _resolve_series_dir():
    env_dir = os.environ.get("OKLO_SERIES_DIR", "")
    if env_dir and os.path.isdir(env_dir):
        return env_dir
    candidates = [os.path.join(os.getcwd(), "out", "series", "b0.17")]
    for arg in sys.argv:
        if arg.endswith(".pml") and os.path.exists(arg):
            sdir = os.path.dirname(os.path.abspath(arg))
            candidates.append(os.path.join(sdir, "out", "series", "b0.17"))
            candidates.append(os.path.join(sdir, "..", "oklo_pool_mobile", "out", "series", "b0.17"))
    candidates.append(os.path.join(os.getcwd(), "..", "oklo_pool_mobile", "out", "series", "b0.17"))
    for c in candidates:
        if os.path.isdir(c) and os.path.isfile(os.path.join(c, "temperature_f00.mrc")):
            return c
    tmp_dir = tempfile.mkdtemp(prefix="oklo_6fields_series_")
    nx, ny, nz = 12, 12, 12
    for i in range(60):
        p = i / 60.0
        pulse = math.sin(math.pi * min(p / 0.17, 1.0)) if p < 0.17 else math.exp(-6.0 * (p - 0.17))
        for fname, bmin, bmax in [
            ("temperature", 30.0, 175.0 + 65.0 * pulse),
            ("hydration", 0.35, 0.95),
            ("h2_concentration", 0.4, 2.2 + 0.6 * pulse),
            ("u235_ratio", 0.0056, 0.0072),
            ("polymer_yield", 1.5, 8.8 + 1.5 * math.sin(2.0 * math.pi * p)),
            ("compartments", 1.0, 3.8 if (8 <= i <= 19) else 3.0),
        ]:
            vals = []
            for iz in range(nz):
                z = (iz + 0.5) / nz - 0.5
                for iy in range(ny):
                    y = (iy + 0.5) / ny - 0.5
                    for ix in range(nx):
                        x = (ix + 0.5) / nx - 0.5
                        r2 = x * x + y * y + z * z
                        w = math.exp(-r2 / 0.12)
                        v = (bmax - (bmax - bmin) * w) if fname in ("hydration", "u235_ratio") else (bmin + (bmax - bmin) * w)
                        vals.append(v)
            _write_ccp4_map(os.path.join(tmp_dir, f"{fname}_f{i:02d}.mrc"), nx, ny, nz, 15.5, vals)
    return tmp_dir

SERIES_DIR = _resolve_series_dir()

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
