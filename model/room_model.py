import cv2
import numpy as np
import trimesh
import pyvista as pv
from shapely.geometry import Polygon as ShapelyPolygon

# --- Parameters ---
image_path = "floor_plan.jpg"
wall_height = 50   # height of walls in mm
wall_thickness = 2 # thickness of walls in mm

# --- Load and preprocess image ---
img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
_, thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
thresh = cv2.medianBlur(thresh, 3)  # remove small noise

# --- Find all contours (black lines) ---
contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

walls = []

for cnt in contours:
    if cv2.contourArea(cnt) < 5:  # skip tiny noise
        continue

    # Approximate contour as a polygon
    epsilon = 0.01 * cv2.arcLength(cnt, True)
    approx = cv2.approxPolyDP(cnt, epsilon, True)

    # Flatten points
    pts = approx.reshape(-1, 2).astype(float)
    if not np.array_equal(pts[0], pts[-1]):
        pts = np.vstack([pts, pts[0]])

    # --- Create thin wall along the line ---
    for i in range(len(pts) - 1):
        p1 = pts[i]
        p2 = pts[i+1]

        # Direction vector of the segment
        direction = p2 - p1
        length = np.linalg.norm(direction)
        if length == 0:
            continue
        direction /= length

        # Perpendicular vector for wall thickness
        perp = np.array([-direction[1], direction[0]]) * (wall_thickness / 2)

        # 4 corners of the rectangle
        corners = np.array([
            p1 + perp,
            p1 - perp,
            p2 - perp,
            p2 + perp
      ])

# Use Shapely Polygon
        wall_poly = ShapelyPolygon(corners)

# Extrude to 3D
        wall_mesh = trimesh.creation.extrude_polygon(wall_poly, wall_height)
        walls.append(wall_mesh)

# --- Combine all walls ---
building_walls = trimesh.util.concatenate(walls)

# --- Export STL ---
building_walls.export("walls_only.stl")
print("3D walls saved as walls_only.stl")

# --- Visualize ---
faces_pv = []
for face in building_walls.faces:
    faces_pv.append(3)
    faces_pv.extend(face)
faces_pv = np.array(faces_pv)

mesh_pv = pv.PolyData(building_walls.vertices, faces_pv)
plotter = pv.Plotter()
plotter.add_mesh(mesh_pv, color="lightgray", show_edges=True, opacity=0.9)
plotter.add_axes()
plotter.show_grid()
plotter.show()
