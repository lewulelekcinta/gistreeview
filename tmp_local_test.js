import app from './backend/api/index.js';
import http from 'http';

(async () => {
  const server = http.createServer(app);
  server.listen(0, async () => {
    const port = server.address().port;
    console.log('Local test server listening on', port);
    const res = await fetch(`http://localhost:${port}/trees`);
    console.log('status', res.status);
    const text = await res.text();
    console.log('body length', text.length);
    server.close();
  });
})();
