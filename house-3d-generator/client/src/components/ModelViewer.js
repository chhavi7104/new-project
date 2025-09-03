// client/src/components/ModelViewer.js
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import './ModelViewer.css';

function Box(props) {
  const mesh = useRef();
  const [hovered, setHover] = useState(false);
  
  useFrame((state, delta) => {
    if (mesh.current && props.rotation) {
      mesh.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={hovered ? 1.1 : 1}
      onClick={props.onClick}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={props.color || 'orange'} />
    </mesh>
  );
}

const ModelViewer = ({ modelUrl, isLoading }) => {
  const [rotation, setRotation] = useState(true);

  if (isLoading) {
    return (
      <div className="model-viewer loading">
        <div className="spinner"></div>
        <p>Generating your 3D model...</p>
      </div>
    );
  }

  if (!modelUrl) {
    return (
      <div className="model-viewer placeholder">
        <div className="model-placeholder">🏠</div>
        <p>Your 3D model will appear here</p>
      </div>
    );
  }

  return (
    <div className="model-viewer">
      <Canvas camera={{ position: [5, 5, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]} rotation={rotation} color="orange" />
        <OrbitControls />
        <Sky sunPosition={[10, 10, 0]} />
        <gridHelper args={[10, 10]} />
      </Canvas>
      
      <div className="model-controls">
        <button onClick={() => setRotation(!rotation)}>
          {rotation ? 'Pause Rotation' : 'Start Rotation'}
        </button>
        <a href={modelUrl} download="house-model.glb" className="download-btn">
          Download Model
        </a>
      </div>
    </div>
  );
};

export default ModelViewer;