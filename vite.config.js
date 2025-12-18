import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable websocket proxying for SSE
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err.message);
            // Handle connection reset errors gracefully
            if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
              console.warn('Backend server may not be running. Please ensure the backend is running on port 3000.');
            }
            // Don't crash the proxy, just log the error
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              });
              res.end(JSON.stringify({ 
                error: 'Proxy error', 
                message: 'Connection to backend server failed. Please ensure the backend is running on port 3000.' 
              }));
            }
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Set longer timeout for long-running requests like scraping
            proxyReq.setTimeout(300000); // 5 minutes
          });
        },
        // Increase timeout for long-running requests
        timeout: 300000, // 5 minutes
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  // Expose environment variables to the client
  // Variables prefixed with VITE_ are exposed
  envPrefix: 'VITE_'
});

