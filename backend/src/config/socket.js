import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer, corsOrigin) {
  io = new Server(httpServer, {
    cors: { origin: corsOrigin, credentials: true },
  });
  return io;
}

export function getIO() {
  return io;
}

export function emitEvent(event, data) {
  if (io) io.emit(event, data);
}
