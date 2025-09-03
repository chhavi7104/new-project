// client/src/pages/ProjectDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ModelViewer from '../components/ModelViewer';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/models/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading project...</div>;
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  return (
    <div className="project-detail">
      <div className="project-header">
        <h1>{project.name}</h1>
        <p>Created on {new Date(project.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="project-content">
        <div className="model-viewer-container">
          <h2>3D Model</h2>
          <ModelViewer 
            modelUrl={project.modelPath} 
            isLoading={project.status === 'processing'} 
          />
        </div>

        <div className="project-images">
          <h2>Original Images</h2>
          <div className="images-grid">
            {project.images.map((image, index) => (
              <div key={index} className="image-item">
                <img src={`/${image.path}`} alt={`House view ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;