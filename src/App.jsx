import { useState } from 'react';
import axios from 'axios';
import { getApiEndpoint } from './config';
import Header from './components/Header';
import InputSection from './components/InputSection';
import ResultsTable from './components/ResultsTable';
import InfoSection from './components/InfoSection';
import { ErrorAlert, InfoAlert } from './components/Alerts';
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
                  } catch {
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
        <Header />

        <InputSection
          url={url}
          loading={loading}
          onUrlChange={(e) => setUrl(e.target.value)}
          onScrapeClick={handleScrape}
        />

        <ErrorAlert error={error} />
        {!error && <InfoAlert message={progress} />}

        <ResultsTable results={results} onExport={handleExport} />

        <InfoSection />
      </div>
    </div>
  );
}

export default App;

