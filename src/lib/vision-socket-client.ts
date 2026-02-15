import { io, Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/storage.utils";

const WS_URL = process.env.NEXT_PUBLIC_VISION_WS_URL || "http://localhost:3400";

let socket: Socket | null = null;
let currentToken: string | null = null;

export function getVisionSocket(): Socket {
  const token = tokenStorage.getToken();

  // Re-create socket if token changed (e.g. after refresh)
  if (socket && currentToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    currentToken = token;
    socket = io(`${WS_URL}/vision`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      auth: token ? { token } : {},
    });
  }
  return socket;
}

export function disconnectVisionSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
