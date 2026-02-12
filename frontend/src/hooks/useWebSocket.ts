import { useEffect, useRef, useCallback, useState } from "react";

interface UseWebSocketProps {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  shouldReconnect?: boolean;
}

export const useWebSocket = ({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  shouldReconnect = true,
}: UseWebSocketProps) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const shouldReconnectRef = useRef(true);
  
  // Store callbacks in refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onMessage, onConnect, onDisconnect, onError]);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("[useWebSocket] Sending:", data.type);
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("[useWebSocket] Cannot send - WebSocket not ready. State:", wsRef.current?.readyState);
    }
  }, []);

  const connect = useCallback(() => {
    // Don't reconnect if shouldReconnect is false
    if (!shouldReconnect) {
      console.log("[useWebSocket] Reconnect disabled, skipping connection");
      return;
    }

    console.log("[useWebSocket] Attempting to connect to:", url);
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("[useWebSocket] ✅ WebSocket connected!");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        onConnectRef.current?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[useWebSocket] Message received:", data.type);
          onMessageRef.current?.(data);
        } catch (e) {
          console.error("[useWebSocket] Failed to parse message:", event.data);
        }
      };

      ws.onerror = (error) => {
        console.error("[useWebSocket] ❌ WebSocket error:", error);
        setIsConnected(false);
        onErrorRef.current?.(error);
      };

      ws.onclose = (event) => {
        console.log("[useWebSocket] WebSocket closed. Code:", event.code, "Reason:", event.reason);
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Attempt to reconnect only if enabled and reconnection flag is true
        if (shouldReconnect && shouldReconnectRef.current && reconnectAttemptsRef.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          console.log("[useWebSocket] Attempting to reconnect in", delay, "ms (attempt", reconnectAttemptsRef.current + 1, ")");

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("[useWebSocket] Exception during connection:", err);
      setIsConnected(false);
    }
  }, [url, shouldReconnect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.onclose = null; // Remove onclose handler to prevent reconnection
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    console.log("[useWebSocket] Initializing connection for URL:", url);
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connect();

    return () => {
      console.log("[useWebSocket] Cleanup - disconnecting");
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { send, isConnected, ws: wsRef.current, disconnect };
};
