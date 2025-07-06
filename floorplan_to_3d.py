import cv2
import numpy as np
import pyvista as pv

def process_floor_plan(image_path):
    # Load image
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found at {image_path}")
    
    # Preprocess image
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a plotter
    plotter = pv.Plotter(off_screen=True)
    
    for contour in contours:
        # Simplify contour to reduce points
        epsilon = 0.01 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        
        # Skip if not enough points
        if len(approx) < 3:
            continue
            
        # Convert to 2D points and add z=0
        points = approx.squeeze()
        points_3d = np.hstack([points, np.zeros((len(points), 1))])
        
        # Create a polyline and close it
        poly = pv.PolyData()
        poly.points = np.vstack([points_3d, points_3d[0]])   
        
         # Create lines between points
        lines = np.arange(len(poly.points))
        lines = np.insert(lines, 0, len(lines))
        poly.lines = lines
        
        # Extrude to create wall
        wall = poly.extrude((0, 0, 3.0), capping=True)
        plotter.add_mesh(wall, color='tan')
    
    # Export to GLTF
    plotter.export_gltf("static/house.gltf")

if __name__ == "__main__":
    process_floor_plan("templates/floorplan.png")