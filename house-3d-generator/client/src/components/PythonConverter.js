// client/src/components/PythonConverter.js
import React, { useState } from 'react';
import axios from 'axios';
import './PythonConverter.css';

const PythonConverter = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    setSelectedFile(file);
    setError('');
    setDownloadUrl('');
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleConvert = async () => {
    if (!selectedFile) {
      setError('Please select a floor plan image');
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        'http://localhost:5002/api/convert', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
          timeout: 300000, // 5 minute timeout
          onUploadProgress: (progressEvent) => {
            // You can add progress tracking here
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );

      // Create download link for STL file
      const blob = new Blob([response.data], { type: 'application/sla' });
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

    } catch (error) {
      console.error('Conversion error:', error);
      if (error.response?.status === 413) {
        setError('File too large. Please select a smaller image.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Conversion timed out. Please try a simpler floor plan.');
      } else if (error.response?.data) {
        // Try to read error message from response
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setError(errorData.error || 'Conversion failed');
          } catch {
            setError('Conversion failed. Please try again.');
          }
        };
        reader.readAsText(error.response.data);
      } else {
        setError('Failed to convert floor plan. Please try again.');
      }
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="python-converter">
      <div className="converter-header">
        <h2>🏠 Floor Plan to 3D Model Converter</h2>
        <p>Powered by Python Computer Vision</p>
      </div>

      <div className="upload-section">
        <div className="file-input-container">
          <label htmlFor="floorplan-file" className="file-input-label">
            📸 Upload Floor Plan Image
          </label>
          <input
            id="floorplan-file"
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            disabled={isConverting}
          />
          {selectedFile && (
            <p className="file-name">{selectedFile.name}</p>
          )}
        </div>
        
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="Floor plan preview" />
          </div>
        )}
        
        <button 
          onClick={handleConvert} 
          disabled={!selectedFile || isConverting}
          className="convert-btn"
        >
          {isConverting ? (
            <>
              <span className="spinner"></span>
              Converting...
            </>
          ) : (
            '🔄 Convert to 3D Model'
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {downloadUrl && (
        <div className="download-section">
          <p>✅ Conversion successful!</p>
          <a 
            href={downloadUrl} 
            download="3d_model.stl"
            className="download-btn"
          >
            📦 Download 3D Model (STL)
          </a>
        </div>
      )}

      <div className="instructions">
        <h3>📋 Instructions:</h3>
        <ul>
          <li>Upload a clear floor plan image with distinct walls</li>
          <li>Image should be in PNG or JPG format</li>
          <li>Maximum file size: 10MB</li>
          <li>Walls should be clearly visible</li>
          <li>Doors and windows will be automatically detected</li>
          <li>Download will start automatically after conversion</li>
        </ul>
      </div>

      <div className="features">
        <h3>✨ Features:</h3>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🧱</div>
            <h4>Wall Detection</h4>
            <p>Automatically detects and extracts walls from floor plans</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚪</div>
            <h4>Door Recognition</h4>
            <p>Identifies and creates openings for doors</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🪟</div>
            <h4>Window Detection</h4>
            <p>Finds windows and creates appropriate openings</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📦</div>
            <h4>STL Export</h4>
            <p>Exports to standard 3D printable STL format</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PythonConverter;