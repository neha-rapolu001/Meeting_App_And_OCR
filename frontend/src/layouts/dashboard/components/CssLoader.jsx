import React from 'react';

const CircleLoader = () => {
  const loaderStyles = {
    position: 'relative',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const circleStyles = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: '8px solid transparent',
    borderTop: '8px solid #3498db',
    borderRight: '8px solid #9b59b6',
    borderBottom: '8px solid #f39c12',
    borderLeft: '8px solid #e74c3c',
    animation: 'spin 1.5s linear infinite, color-change 5s linear infinite',
  };

  return (
    <div style={loaderStyles}>
      <div style={circleStyles}></div>

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes color-change {
          0% {
            border-top-color: #3498db;
            border-right-color: #9b59b6;
            border-bottom-color: #f39c12;
            border-left-color: #e74c3c;
          }
          50% {
            border-top-color: #e74c3c;
            border-right-color: #3498db;
            border-bottom-color: #9b59b6;
            border-left-color: #f39c12;
          }
          100% {
            border-top-color: #3498db;
            border-right-color: #9b59b6;
            border-bottom-color: #f39c12;
            border-left-color: #e74c3c;
          }
        }
      `}</style>
    </div>
  );
};

export default CircleLoader;
