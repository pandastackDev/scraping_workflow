import React, { useState, useMemo, useEffect } from 'react';

function ResultsTable({ results, onExport }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Reset to page 1 when results change from null/empty to having data, or if current page is out of bounds
  useEffect(() => {
    if (results && results.length > 0) {
      const newTotalPages = Math.ceil(results.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(1);
      }
    }
  }, [results, currentPage, itemsPerPage]);

  // Calculate pagination - handle null/undefined results
  const totalPages = results ? Math.ceil(results.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResults = results ? results.slice(startIndex, endIndex) : [];
  const startNumber = startIndex + 1;

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (totalPages === 0) return [];
    
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page, last page, current page, and pages around current
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Early return after all hooks are called
  if (!results) return null;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
      // Scroll to top of results table
      const resultsSection = document.querySelector('.results-section');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="results-section">
      <div className="results-header">
        <div className="results-title">
          <h2>Scraping Results</h2>
          <span className="results-count">
            {results.length} Exhibitors Found
            {totalPages > 1 && (
              <span className="page-info">
                {' '}(Page {currentPage} of {totalPages})
              </span>
            )}
          </span>
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
              {currentResults.map((item, index) => (
                <tr key={`${item.companyName}-${startIndex + index}`}>
                  <td className="row-number">{startNumber + index}</td>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {startNumber} to {Math.min(endIndex, results.length)} of {results.length} exhibitors
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ← Previous
            </button>
            
            <div className="pagination-pages">
              {pageNumbers.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsTable;


