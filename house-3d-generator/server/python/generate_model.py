# server/python/generate_model.py
import sys
import os
import json
import cv2
import numpy as np
import trimesh
from shapely.geometry import Polygon as ShapelyPolygon

# --- Parameters ---
wall_height = 50      # mm
wall_thickness = 2    # mm
door_height = 40      # mm
window_height = 30    # mm

def process_floorplan(image_path, output_dir="models"):
    # Ensure output directory
    os.makedirs(output_dir, exist_ok=True)

    # --- Load floorplan image ---
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        return {"success": False, "message": f"Image not found: {image_path}"}

    _, thresh = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY_INV)
    thresh = cv2.medianBlur(thresh, 3)

    # --- Find contours ---
    contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)

    walls, cutouts, doors, windows, stairs = [], [], [], [], []

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

        # --- Doors ---
        if 10 < max(w, h) < 50:
            doors.append((x, y, w, h))
            poly = ShapelyPolygon([(x, y), (x+w, y), (x+w, y+h), (x, y+h)])
            cutouts.append(trimesh.creation.extrude_polygon(poly, door_height))
            continue

        # --- Stairs ---
        if 50 < cv2.contourArea(cnt) < 2000 and aspect_ratio > 1.2:
            stairs.append((x, y, w, h))
            continue

        # --- Walls ---
        epsilon = 0.01 * cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, epsilon, True)
        pts = approx.reshape(-1, 2).astype(float)

        if not np.array_equal(pts[0], pts[-1]):
            pts = np.vstack([pts, pts[0]])

        for i in range(len(pts) - 1):
            p1, p2 = pts[i], pts[i+1]
            direction = p2 - p1
            length = np.linalg.norm(direction)
            if length == 0:
                continue
            direction /= length
            perp = np.array([-direction[1], direction[0]]) * (wall_thickness / 2)
            corners = np.array([p1+perp, p1-perp, p2-perp, p2+perp])
            wall_poly = ShapelyPolygon(corners)
            if wall_poly.is_valid:
                walls.append(trimesh.creation.extrude_polygon(wall_poly, wall_height))

    if not walls:
        return {"success": False, "message": "No walls detected"}

    # --- Combine walls ---
    building = trimesh.util.concatenate(walls)

    # --- Cut out doors/windows (if OpenSCAD available) ---
    if cutouts:
        try:
            cutouts_mesh = trimesh.util.concatenate(cutouts)
            building = trimesh.boolean.difference([building, cutouts_mesh], engine="scad")
        except Exception as e:
            print("⚠️ Boolean subtraction failed:", e)

    # --- Export model ---
    model_name = os.path.basename(image_path).split(".")[0] + "_model.glb"
    model_path = os.path.join(output_dir, model_name)
    building.export(model_path)

    # --- Save features JSON ---
    features = {"windows": windows, "doors": doors, "stairs": stairs}
    with open(os.path.join(output_dir, model_name.replace(".glb", "_features.json")), "w") as f:
        json.dump(features, f, indent=2)

    return {"success": True, "modelPath": model_path, "message": "3D model generated successfully"}

def main(image_paths):
    for img_path in image_paths:
        result = process_floorplan(img_path)
        print(json.dumps(result))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_model.py <image1> <image2> ...")
        sys.exit(1)
    main(sys.argv[1:])
