import { applyMessage, type Tier } from '$stores/liveRankings';

interface Options {
  url?: string;
  retryLimit?: number;
}

let socket: WebSocket | null = null;
let retries = 0;
let heartbeat: ReturnType<typeof setInterval> | undefined;

const DEFAULT_URL = 'ws://localhost:8081';

export function connect(options: Options = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) return;
  const url = options.url ?? DEFAULT_URL;
  socket = new WebSocket(url);

  socket.onopen = () => {
    retries = 0;
    heartbeat && clearInterval(heartbeat);
    heartbeat = setInterval(() => {
      if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      applyMessage(data);
    } catch (error) {
      console.error('Failed to parse message', error);
    }
  };

  socket.onclose = () => {
    heartbeat && clearInterval(heartbeat);
    if (retries < (options.retryLimit ?? 10)) {
      const timeout = Math.min(1000 * 2 ** retries, 30000);
      retries += 1;
      setTimeout(() => connect(options), timeout);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error', error);
  };
}

export function disconnect() {
  heartbeat && clearInterval(heartbeat);
  if (socket) {
    socket.close();
    socket = null;
  }
}
