const { app, io } = require('./server');
const http = require('http');

// Create an HTTP server instance with the Express app
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
io.attach(server);

// Start server on fixed port 5000
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 