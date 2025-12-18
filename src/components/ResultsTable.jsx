import React from 'react';

function ResultsTable({ results, onExport }) {
  if (!results) return null;

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-title">
          <h2>Scraping Results</h2>
          <span className="results-count">{results.length} Exhibitors Found</span>
        </div>
        <button onClick={onExport} className="btn btn-success btn-export">
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
  );
}

export default ResultsTable;


