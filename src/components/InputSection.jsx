import React from 'react';

function InputSection({ url, loading, onUrlChange, onScrapeClick }) {
  return (
    <div className="input-section">
      <div className="input-card">
        <div className="input-group">
          <label htmlFor="url">
            <span className="label-icon">🔗</span>
            Exhibitor Listing URL
          </label>
          <div className="input-wrapper">
            <input
              id="url"
              type="text"
              value={url}
              onChange={onUrlChange}
              placeholder="https://example.com/exhibitors"
              disabled={loading}
              className="modern-input"
            />
            {url && (
              <button
                className="clear-btn"
                onClick={() => onUrlChange({ target: { value: '' } })}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onScrapeClick}
          disabled={loading || !url.trim()}
          className={`btn btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              <span>Scraping...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Start Scraping</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default InputSection;


