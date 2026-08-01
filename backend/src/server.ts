import { createServer, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { callTachibana } from './tachibana/callTachibana.js';

const port = Number(process.env.PORT ?? '8080');
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim() || '*';

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT ?? ''}`);
}

function setCommonHeaders(response: ServerResponse): void {
  response.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store');
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  setCommonHeaders(response);
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(body));
}

const server = createServer(async (request, response) => {
  const url = new URL(
    request.url ?? '/',
    `http://${request.headers.host ?? 'localhost'}`,
  );

  if (request.method === 'OPTIONS') {
    setCommonHeaders(response);
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (
    request.method === 'GET' &&
    url.pathname === '/api/tachibana/market-price'
  ) {
    try {
      const tachibanaResponse = await callTachibana();
      sendJson(response, 200, tachibanaResponse);
    } catch (error) {
      console.error('Failed to call Tachibana API.', error);
      sendJson(response, 500, { error: 'Failed to call Tachibana API.' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found.' });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}.`);
});
