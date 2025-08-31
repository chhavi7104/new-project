// client/src/components/ImageUpload.js
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './ImageUpload.css';

const ImageUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projectName, setProjectName] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    ));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: true
  });

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    if (projectName) {
      formData.append('name', projectName);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const project = await response.json();
        if (onUploadComplete) {
          onUploadComplete(project);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error generating model. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileToRemove) => {
    setFiles(files.filter(file => file !== fileToRemove));
    URL.revokeObjectURL(fileToRemove.preview);
  };

  return (
    <div className="upload-container">
      <h2>Create 3D Model from Images</h2>
      
      <div className="project-name-input">
        <label>Project Name (optional):</label>
        <input 
          type="text" 
          value={projectName} 
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My House Model"
        />
      </div>
      
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the images here...</p> :
            <p>Drag & drop house images and floor plans here, or click to select</p>
        }
      </div>

      {files.length > 0 && (
        <div className="preview-section">
          <h3>Selected Files:</h3>
          <div className="preview-grid">
            {files.map((file, index) => (
              <div key={index} className="preview-item">
                <img src={file.preview} alt={file.name} />
                <div className="preview-info">
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(file)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={uploadFiles} 
            disabled={uploading}
            className="generate-btn"
          >
            {uploading ? `Processing... ${progress}%` : 'Generate 3D Model'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;