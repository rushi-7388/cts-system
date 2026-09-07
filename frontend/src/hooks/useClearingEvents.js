import { useEffect, useState } from "react";
import { playNotificationChime } from "../utils/sound.util";

export function useClearingEvents(onEvent) {
  const [lastEvent, setLastEvent] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("CONNECTED", () => {
      setConnected(true);
    });

    eventSource.addEventListener("CHEQUE_PRESENTED", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ type: "PRESENTED", data });
        playNotificationChime("presentation");
        onEvent?.({ type: "PRESENTED", data });
      } catch (err) {}
    });

    eventSource.addEventListener("CHEQUE_CLEARED", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ type: "CLEARED", data });
        playNotificationChime("cleared");
        onEvent?.({ type: "CLEARED", data });
      } catch (err) {}
    });

    eventSource.addEventListener("CHEQUE_RETURNED", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ type: "RETURNED", data });
        onEvent?.({ type: "RETURNED", data });
      } catch (err) {}
    });

    eventSource.addEventListener("SETTLEMENT_RUN", (e) => {
      try {
        const data = JSON.parse(e.data);
        setLastEvent({ type: "SETTLEMENT", data });
        playNotificationChime("cleared");
        onEvent?.({ type: "SETTLEMENT", data });
      } catch (err) {}
    });

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [onEvent]);

  return { lastEvent, connected };
}
