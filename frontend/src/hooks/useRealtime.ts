import { useEffect, useRef, useState, useCallback } from 'react';

export interface RealtimeEvent {
  type: 'BID_PLACED' | 'AUCTION_EXTENDED' | 'AUCTION_CLOSED' | 'OFFER_SUBMITTED' | 'OFFER_ACCEPTED' | 'PRICE_ALERT' | 'SYSTEM';
  timestamp: string;
  data: any;
  message?: string;
  messageBn?: string;
}

export const useRealtime = () => {
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<RealtimeEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    const connectSSE = () => {
      try {
        es = new EventSource('/api/v1/realtime');

        es.onopen = () => {
          setConnected(true);
        };

        es.onmessage = (event) => {
          try {
            const parsed: RealtimeEvent = JSON.parse(event.data);
            setLastEvent(parsed);
            if (parsed.type !== 'SYSTEM') {
              setNotifications((prev) => [parsed, ...prev.slice(0, 19)]);
            }
          } catch {
            // Ignore non-JSON heartbeat
          }
        };

        es.onerror = () => {
          setConnected(false);
          es?.close();
          // Retry after 5s
          setTimeout(connectSSE, 5000);
        };

        eventSourceRef.current = es;
      } catch {
        setConnected(false);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const clearNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    connected,
    lastEvent,
    notifications,
    clearNotification
  };
};

