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
    
    const contentType = response.headers.get('content-type');
    
    if (response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        // Check for the actual structure you're receiving
        if (data.token && data._id) {
          // Create user object from response data
          const userData = {
            _id: data._id,
            username: data.username,
            email: data.email
          };
          
          login(userData, data.token);
          navigate('/dashboard', { replace: true });
        } else {
          setError('Invalid response structure from server');
        }
      } else {
        const text = await response.text();
        setError(`Server returned unexpected format: ${text}`);
      }
    } else {
      // Handle error responses
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
      } else {
        const errorText = await response.text();
        setError(errorText || `Login failed with status: ${response.status}`);
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Network error. Please try again.');
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