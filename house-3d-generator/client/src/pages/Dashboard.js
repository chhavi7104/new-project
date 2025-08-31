// client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import ProjectList from '../components/ProjectList';
import './Dashboard.css';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/models', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (newProject) => {
    setProjects([newProject, ...projects]);
    setShowUpload(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>My Projects</h1>
        <button 
          onClick={() => setShowUpload(!showUpload)} 
          className="btn-primary"
        >
          {showUpload ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showUpload && (
        <div className="upload-section">
          <ImageUpload onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading your projects...</div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
};

export default Dashboard;