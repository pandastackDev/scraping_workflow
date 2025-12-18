import React from 'react';

function InfoSection() {
  return (
    <div className="info-section">
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-header">
            <span className="info-icon">🌐</span>
            <h3>Supported Platforms</h3>
          </div>
          <ul className="info-list">
            <li><span className="check">✓</span> MapYourShow events</li>
            <li><span className="check">✓</span> A2Z event platforms</li>
            <li><span className="check">✓</span> SmallWorldLabs</li>
            <li><span className="check">✓</span> Affiliate Summit</li>
            <li><span className="check">✓</span> GoShow platforms</li>
            <li><span className="check">✓</span> Generic exhibitor listings</li>
          </ul>
        </div>

        <div className="info-card">
          <div className="info-card-header">
            <span className="info-icon">⚡</span>
            <h3>Key Features</h3>
          </div>
          <ul className="info-list">
            <li><span className="check">✓</span> Automatic JavaScript rendering</li>
            <li><span className="check">✓</span> Smart pagination handling</li>
            <li><span className="check">✓</span> Website discovery via Google</li>
            <li><span className="check">✓</span> One-click Excel export</li>
            <li><span className="check">✓</span> Universal URL support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default InfoSection;


