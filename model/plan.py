import os
import cv2
import numpy as np
import trimesh
import pyvista as pv
from shapely.geometry import Polygon as ShapelyPolygon
import json

# --- Parameters ---
image_path = "bedroom-outlines.jpg"
wall_height = 50      # mm
wall_thickness = 2    # mm
door_height = 40      # mm
window_height = 30    # mm
min_wall_area = 1e-2

# --- Ensure OpenSCAD is in PATH for this VS Code environment ---
openscad_path = r"C:\Program Files\OpenSCAD"  # adjust if different
os.environ["PATH"] += os.pathsep + openscad_path

# Test OpenSCAD availability
try:
    import subprocess
    subprocess.run(["openscad", "--version"], check=True)
except Exception as e:
    print("⚠️ OpenSCAD not found. Boolean operations will fail:", e)

# --- Load and preprocess image ---
img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
if img is None:
    raise FileNotFoundError(f"Image not found: {image_path}")

_, thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
thresh = cv2.medianBlur(thresh, 3)

# --- Find contours ---
contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

walls, doors, windows, stairs, cutouts = [], [], [], [], []

for cnt in contours:
    if cv2.contourArea(cnt) < 5:
        continue

    x, y, w, h = cv2.boundingRect(cnt)
    aspect_ratio = max(w / h, h / w)

    # --- Windows ---
    if aspect_ratio > 3 and min(w, h) < 15:
        windows.append((x, y, w, h))
        poly = ShapelyPolygon([(x, y), (x+w, y), (x+w, y+h), (x, y+h)])
        cutouts.append(trimesh.creation.extrude_polygon(poly, window_height))
        continue

    # --- Stairs ---
    if 50 < cv2.contourArea(cnt) < 2000 and aspect_ratio > 1.2:
        stairs.append((x, y, w, h))
        continue

    # --- Doors ---
    if 10 < max(w, h) < 50:
        doors.append((x, y, w, h))
        poly = ShapelyPolygon([(x, y), (x+w, y), (x+w, y+h), (x, y+h)])
        cutouts.append(trimesh.creation.extrude_polygon(poly, door_height))
        continue

    # --- Walls ---
    epsilon = 0.01 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)
    pts = approx.reshape(-1, 2).astype(float)

    if not np.array_equal(pts[0], pts[-1]):
        pts = np.vstack([pts, pts[0]])

    for i in range(len(pts)-1):
        p1, p2 = pts[i], pts[i+1]
        direction = p2 - p1
        length = np.linalg.norm(direction)
        if length == 0: continue
        direction /= length
        perp = np.array([-direction[1], direction[0]]) * (wall_thickness / 2)
        corners = np.array([p1+perp, p1-perp, p2-perp, p2+perp])
        wall_poly = ShapelyPolygon(corners)
        if wall_poly.is_valid and wall_poly.area > min_wall_area:
            walls.append(trimesh.creation.extrude_polygon(wall_poly, wall_height))

# --- Combine walls ---
if walls:
    building_walls = trimesh.util.concatenate(walls)

    # --- Subtract doors/windows ---
    if cutouts:
        try:
            cutouts_mesh = trimesh.util.concatenate(cutouts)
            building_walls = trimesh.boolean.difference(
                [building_walls, cutouts_mesh],
                engine="scad"
            )
            print("✅ Openings successfully cut")
        except Exception as e:
            print("⚠️ Boolean subtraction failed:", e)

    building_walls.export("building_with_openings.stl")
    print("✅ STL exported: building_with_openings.stl")
else:
    building_walls = None
    print("⚠️ No walls detected")

# --- Save features JSON ---
features = {"windows": windows, "doors": doors, "stairs": stairs}
with open("features.json", "w") as f:
    json.dump(features, f, indent=2)
print("✅ Features saved to features.json")

# --- Visualization ---
plotter = pv.Plotter()

if building_walls is not None:
    faces = []
    for f in building_walls.faces:
        faces.append(3)
        faces.extend(f)
    mesh_pv = pv.PolyData(building_walls.vertices.astype(np.float32), np.array(faces))
    plotter.add_mesh(mesh_pv, color="lightgray", show_edges=True, opacity=0.9)

# Stairs (green)
for (x, y, w, h) in stairs:
    corners = np.array([[x, y, 0], [x+w, y, 0], [x+w, y+h, 0], [x, y+h, 0]])
    poly = pv.PolyData(corners.astype(np.float32)).delaunay_2d()
    plotter.add_mesh(poly.extrude((0,0,wall_height), capping=True), color="green", opacity=0.6)

plotter.add_axes()
plotter.show_grid()
plotter.show()

# python plan.py
