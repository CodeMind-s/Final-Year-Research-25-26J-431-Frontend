import { io, Socket } from "socket.io-client";
import { tokenStorage } from "@/lib/storage.utils";
import { LAB_AGENT_URL } from "@/lib/api.config";

const WS_URL = process.env.NEXT_PUBLIC_VISION_WS_URL || "https://49mbsvf2-3400.asse.devtunnels.ms";
// Phase 7: socket points at the local Lab Agent on this PC, not the cloud
// vision-service. The handshake JWT is the same cloud-issued token the rest
// of the app uses; the agent verifies it via the cloud /auth/jwks endpoint
// (Phase 4).

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
    socket = io(`${LAB_AGENT_URL}/vision`, {
      transports: ["websocket"],
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
