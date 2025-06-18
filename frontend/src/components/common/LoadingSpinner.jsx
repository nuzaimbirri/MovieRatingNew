import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    "sm": { width: "20px", height: "20px" },
    "md": { width: "30px", height: "30px" },
    "lg": { width: "60px", height: "60px" },
  };
  const sizeClass = sizes[size];

  return (
    <div style={{ 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100px'
    }}>
      <div id="spinner" style={sizeClass}></div>
    </div>
  );
};

export default LoadingSpinner;
