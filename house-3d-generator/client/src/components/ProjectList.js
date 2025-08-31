// client/src/components/ProjectList.js
import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectList.css';

const ProjectList = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📁</div>
        <h3>No projects yet</h3>
        <p>Create your first project by uploading images of your house</p>
      </div>
    );
  }

  return (
    <div className="project-list">
      {projects.map(project => (
        <div key={project._id} className="project-card">
          <div className="project-card-header">
            <h3>{project.name}</h3>
            <span className={`status ${project.status}`}>{project.status}</span>
          </div>
          
          <div className="project-card-content">
            <div className="project-thumbnail">
              {project.images.length > 0 ? (
                <img src={`/${project.images[0].path}`} alt={project.name} />
              ) : (
                <div className="thumbnail-placeholder">🏠</div>
              )}
            </div>
            
            <div className="project-info">
              <p>Images: {project.images.length}</p>
              <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="project-card-actions">
            <Link to={`/project/${project._id}`} className="view-btn">
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectList;