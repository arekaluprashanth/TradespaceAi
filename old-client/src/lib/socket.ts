import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_WS_URL || undefined;

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
  path: '/socket.io',
});

// ── Connection helpers ─────────────────────────────────

export function connectSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

// ── Event subscription helper ──────────────────────────

export function onSocketEvent<T>(
  event: string,
  callback: (data: T) => void
): () => void {
  socket.on(event, callback);
  return () => {
    socket.off(event, callback);
  };
}

export default socket;
