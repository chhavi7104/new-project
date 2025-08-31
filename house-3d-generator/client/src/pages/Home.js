// client/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Photos into 3D Models</h1>
          <p>Upload images of your house and floor plans to generate interactive 3D models instantly</p>
          {user ? (
            <Link to="/dashboard" className="cta-button">Go to Dashboard</Link>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="cta-button">Get Started</Link>
              <Link to="/login" className="cta-button secondary">Login</Link>
            </div>
          )}
        </div>
        <div className="hero-visual">
          <div className="visual-container">
            <div className="house-model-preview">
              <div className="model-placeholder">🏠</div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>1. Upload Images</h3>
            <p>Upload photos of your house from different angles and your floor plan</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚙️</div>
            <h3>2. Generate Model</h3>
            <p>Our AI processes your images to create an accurate 3D model</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👁️</div>
            <h3>3. View & Explore</h3>
            <p>Interact with your 3D model, take measurements, and explore different views</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;