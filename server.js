// server.js
import http from "http";
import { handler } from './build/handler.js'; 
import injectSocketIO from "./server/socketIoHandler.js";
import express from 'express';

const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Inject SocketIO
injectSocketIO(server)

// SvelteKit handlers
app.use(handler);

server.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
