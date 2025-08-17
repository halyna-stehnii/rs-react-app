'use client';

import './NotFound.css';

const NotFound = () => {
  const handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <button onClick={handleGoHome} className="back-button">
        Back to Home
      </button>
    </div>
  );
};

export default NotFound;
