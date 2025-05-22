import http from 'http';
import sql from './db.js';

const requestHandler = async (req, res) => {
  try {
    const result = await sql`SELECT version()`;
    const { version } = result[0];
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Connected to Neon!\nPostgreSQL version: ${version}`);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Failed to connect to Neon:\n' + err.message);
    console.error('DB ERROR:', err);
  }
};

http.createServer(requestHandler).listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
