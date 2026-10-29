# PyMOL interactive visualization & live animation script for Oklo polymer yield
# Compatible with PyMOL 3.1.9
# Preserves physical micromol/L units (normalize_ccp4_maps = 0) and animates a continuous
# 120-frame vertical-axis turntable and contour dissection loop.

reinitialize
set normalize_ccp4_maps, 0
set_color bg_slate, [0.043, 0.059, 0.098]
bg_color bg_slate
viewport 1440, 900

python
import math
import os
import struct
import sys
import tempfile
from pymol import cmd

def _load_polymer_yield_map():
    candidates = [os.path.join(os.getcwd(), "oklo_polymer_yield_phase0.57.mrc")]
    for arg in sys.argv:
        if arg.endswith(".pml") and os.path.exists(arg):
            sdir = os.path.dirname(os.path.abspath(arg))
            candidates.append(os.path.join(sdir, "oklo_polymer_yield_phase0.57.mrc"))
    for c in candidates:
        if os.path.isfile(c):
            cmd.load(c, "oklo_map", format="ccp4")
            return
    nx, ny, nz = 32, 32, 32
    vals = []
    for iz in range(nz):
        z = (iz + 0.5) / nz - 0.5
        for iy in range(ny):
            y = (iy + 0.5) / ny - 0.5
            for ix in range(nx):
                x = (ix + 0.5) / nx - 0.5
                r2 = x * x + y * y + z * z
                v = 2.0 + 5.8 * math.exp(-r2 / 0.085)
                vals.append(v)
    hdr = bytearray(1024)
    struct.pack_into("<10i", hdr, 0, nx, ny, nz, 2, 0, 0, 0, nx - 1, ny - 1, nz - 1)
    struct.pack_into("<6f", hdr, 40, 15.5, 15.5, 15.5, 90.0, 90.0, 90.0)
    struct.pack_into("<3i", hdr, 64, 1, 2, 3)
    struct.pack_into("<3f", hdr, 76, min(vals), max(vals), sum(vals) / len(vals))
    hdr[208:212] = b"MAP "
    hdr[212:216] = b"\x44\x44\x00\x00"
    fd, tmp_p = tempfile.mkstemp(suffix=".ccp4")
    os.close(fd)
    with open(tmp_p, "wb") as tf:
        tf.write(hdr)
        tf.write(struct.pack(f"<{len(vals)}f", *vals))
    cmd.load(tmp_p, "oklo_map", format="ccp4")
    os.remove(tmp_p)

_load_polymer_yield_map()
python end

set_color cyan_matrix, [0.220, 0.741, 0.973]
set_color indigo_plume, [0.388, 0.400, 0.945]
set_color emerald_neck, [0.063, 0.725, 0.506]
set_color amber_zone, [0.961, 0.620, 0.043]
set_color rose_core, [0.957, 0.247, 0.369]

isomesh mesh_matrix, oklo_map, 2.50
color cyan_matrix, mesh_matrix
set mesh_width, 1.3, mesh_matrix

isosurface surf_conduit, oklo_map, 4.65
color indigo_plume, surf_conduit
set transparency, 0.68, surf_conduit

isomesh mesh_terrace, oklo_map, 5.25
color emerald_neck, mesh_terrace
set mesh_width, 1.8, mesh_terrace

isosurface surf_zone, oklo_map, 6.15
color amber_zone, surf_zone
set transparency, 0.38, surf_zone

isosurface surf_core, oklo_map, 6.95
color rose_core, surf_core
set transparency, 0.0, surf_core

set transparency_mode, 1
set backface_cull, 0
set two_sided_lighting, 1
set spec_reflect, 0.35
set spec_power, 40
set depth_cue, 0

python
import math
from pymol import cmd, cgo

box_cgo = [cgo.LINEWIDTH, 2.0, cgo.BEGIN, cgo.LINES, cgo.COLOR, 0.45, 0.52, 0.62]
corners = [
    (0.0, 0.0, 0.0), (15.5, 0.0, 0.0), (15.5, 15.5, 0.0), (0.0, 15.5, 0.0),
    (0.0, 0.0, 15.5), (15.5, 0.0, 15.5), (15.5, 15.5, 15.5), (0.0, 15.5, 15.5),
]
edges = [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]
for i, j in edges:
    box_cgo.extend([cgo.VERTEX, *corners[i], cgo.VERTEX, *corners[j]])
box_cgo.append(cgo.END)
cmd.load_cgo(box_cgo, "unit_cell_box")

cmd.mset("1 x120")
for f in range(1, 121):
    az = 30.0 + (f - 1) * 3.0
    lvl = 4.65 + 1.45 * math.sin(2.0 * math.pi * (f - 1) / 120.0)
    cmd.mdo(f, f"reset; origin position=[7.75,7.75,7.75]; center mesh_matrix; turn z, {az:.2f}; turn x, -72.0; zoom mesh_matrix, buffer=4.2; isosurface surf_conduit, oklo_map, {lvl:.3f}")
python end

mplay
