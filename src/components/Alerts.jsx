import React from 'react';

export function ErrorAlert({ error }) {
  if (!error) return null;

  return (
    <div className="alert alert-error">
      <div className="alert-icon">⚠️</div>
      <div className="alert-content">
        <strong>Error</strong>
        <p>{error}</p>
      </div>
    </div>
  );
}

export function InfoAlert({ message }) {
  if (!message) return null;

  return (
    <div className="alert alert-info">
      <div className="alert-icon">ℹ️</div>
      <div className="alert-content">
        <p>{message}</p>
      </div>
    </div>
  );
}


