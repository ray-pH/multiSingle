// server.js
import http from "http";
import { handler } from './build/handler.js'; // <- Import SvelteKit handlers
import injectSocketIO from "./server/socketIoHandler.js"; // The SocketIO stuff (see next step)
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
