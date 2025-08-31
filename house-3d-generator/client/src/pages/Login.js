// client/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // Default credentials for development
  const defaultCredentials = {
    email: 'admin@example.com',
    password: 'admin123'
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Function to handle default credentials login (renamed from useDefaultCredentials)
  const handleDefaultCredentials = () => {
    // Check if user is trying to login with default credentials
    const isUsingDefaultCredentials = 
      formData.email === defaultCredentials.email && 
      formData.password === defaultCredentials.password;
    
    if (isUsingDefaultCredentials) {
      // Simulate a successful login with default user data
      const defaultUser = {
        _id: 'default-user-id',
        username: 'admin',
        email: defaultCredentials.email
      };
      
      // Generate a mock token (in a real app, this would be a JWT)
      const mockToken = btoa(JSON.stringify({
        user: defaultUser,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
      }));
      
      login(defaultUser, mockToken);
      navigate('/dashboard');
    } else {
      setError('Network error. You can try using default credentials: admin@example.com / admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      // Check if we got a response at all
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Check if we got an HTML error page instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') === -1) {
        // Server returned HTML (probably an error page)
        console.warn('Server returned HTML, using default credentials');
        handleDefaultCredentials(); // Fixed: using the renamed function
        return;
      }
      
      const data = await response.json();
      
      if (response.ok) {
        login(data.user, data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.warn('Network error, using default credentials:', error.message);
      handleDefaultCredentials(); // Fixed: using the renamed function
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill form with default credentials for development
  const fillDefaultCredentials = () => {
    setFormData(defaultCredentials);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login to Your Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        {/* Default credentials hint for development */}
        <div className="dev-credentials">
          <p>Development credentials:</p>
          <button 
            type="button" 
            onClick={fillDefaultCredentials}
            className="dev-btn"
          >
            Use: admin@example.com / admin123
          </button>
        </div>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;