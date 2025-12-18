import { useState } from 'react';
import axios from 'axios';
import { getApiEndpoint } from './config';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]); // Start with empty array for real-time updates
    setProgress('Starting scrape...');

    try {
      // Use fetch with streaming for real-time updates
      const response = await fetch(getApiEndpoint('api/scrape'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
          url: url.trim(),
          stream: true,
          options: {
            handlePagination: false,
            findWebsites: true,
            maxWebsiteSearches: 50
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // Check if we have any remaining data in buffer
            if (buffer.trim()) {
              const lines = buffer.split('\n');
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    if (data.type === 'complete') {
                      setProgress(`Scraping completed! Found ${data.count} exhibitors.`);
                    }
                  } catch (_parseError) {
                    // Ignore parse errors
                  }
                }
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'connected') {
                  setProgress('Connected, starting scrape...');
                } else if (data.type === 'start') {
                  setProgress(`Scraping ${data.url}...`);
                } else if (data.type === 'progress') {
                  if (data.searching) {
                    setProgress(`Finding websites: ${data.current}/${data.total} - ${data.message}`);
                  } else {
                    setProgress(data.message || 'Processing...');
                  }
                } else if (data.type === 'exhibitor') {
                  // Add exhibitor to results in real-time
                  setResults(prev => {
                    // Check if exhibitor already exists (avoid duplicates)
                    const exists = prev.some(e => e.companyName === data.exhibitor.companyName);
                    if (exists) {
                      // Update existing exhibitor
                      return prev.map(e => 
                        e.companyName === data.exhibitor.companyName ? data.exhibitor : e
                      );
                    } else {
                      // Add new exhibitor
                      return [...prev, data.exhibitor];
                    }
                  });
                } else if (data.type === 'complete') {
                  setProgress(`Scraping completed! Found ${data.count} exhibitors.`);
                  setLoading(false);
                } else if (data.type === 'error') {
                  setError(data.error || 'Scraping failed');
                  setProgress('');
                  setLoading(false);
                  break;
                }
              } catch (parseError) {
                console.error('Error parsing SSE data:', parseError, line);
              }
            }
          }
        }
      } catch (streamError) {
        console.error('Stream error:', streamError);
        setError('Connection error. Some results may be missing.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Scraping failed');
      setProgress('');
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!results || results.length === 0) {
      setError('No data to export');
      return;
    }

    try {
      setProgress('Exporting to Excel...');
      const response = await axios.post(
        getApiEndpoint('api/export'),
        {
          data: results,
          filename: 'exhibitors'
        },
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'exhibitors.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setProgress('Export completed!');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Export failed');
    } finally {
      setProgress('');
    }
  };

  return (
    <div className="app">
      <div className="background-decoration"></div>
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">🚀</div>
          </div>
          <h1>Exhibitor Scraper</h1>
          <p className="subtitle">Professional Web Scraping Tool for Event Exhibitors</p>
        </header>

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
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/exhibitors"
                  disabled={loading}
                  className="modern-input"
                />
                {url && (
                  <button 
                    className="clear-btn"
                    onClick={() => setUrl('')}
                    type="button"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleScrape}
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

        {error && (
          <div className="alert alert-error">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>Error</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {progress && !error && (
          <div className="alert alert-info">
            <div className="alert-icon">ℹ️</div>
            <div className="alert-content">
              <p>{progress}</p>
            </div>
          </div>
        )}

        {results && (
          <div className="results-section">
            <div className="results-header">
              <div className="results-title">
                <h2>Scraping Results</h2>
                <span className="results-count">{results.length} Exhibitors Found</span>
              </div>
              <button onClick={handleExport} className="btn btn-success btn-export">
                <span>📊</span>
                <span>Export to Excel</span>
              </button>
            </div>

            <div className="results-table-container">
              <div className="table-wrapper">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Company Name</th>
                      <th>Booth</th>
                      <th>Website</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item, index) => (
                      <tr key={index}>
                        <td className="row-number">{index + 1}</td>
                        <td className="company-name">
                          <strong>{item.companyName}</strong>
                        </td>
                        <td className="booth-number">
                          {item.booth ? (
                            <span className="booth-badge">{item.booth}</span>
                          ) : (
                            <span className="no-booth">-</span>
                          )}
                        </td>
                        <td className="website-cell">
                          {item.website ? (
                            <a
                              href={item.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="website-link"
                            >
                              <span className="link-icon">🌐</span>
                              <span className="link-text">{item.website}</span>
                            </a>
                          ) : (
                            <span className="no-website">
                              <span className="no-icon">—</span>
                              Not found
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${item.source || 'generic'}`}>
                            {item.source || 'generic'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}

export default App;

