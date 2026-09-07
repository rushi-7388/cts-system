import React, { useState } from "react";
import { useClearingEvents } from "../hooks/useClearingEvents";

export default function LiveNotificationToast() {
  const [notification, setNotification] = useState(null);

  useClearingEvents((event) => {
    let title = "";
    let message = "";
    let type = "info";

    if (event.type === "PRESENTED") {
      title = "New Cheque Presented";
      message = `Cheque #${event.data.chequeNumber} (₹${Number(event.data.amount).toLocaleString("en-IN")}) presented by ${event.data.presentingBank}`;
      type = "presentation";
    } else if (event.type === "CLEARED") {
      title = "Cheque Cleared";
      message = `Cheque #${event.data.chequeNumber} cleared successfully. Ready for settlement.`;
      type = "success";
    } else if (event.type === "RETURNED") {
      title = "Cheque Returned";
      message = `Cheque #${event.data.chequeNumber} returned: ${event.data.returnReason}`;
      type = "danger";
    } else if (event.type === "SETTLEMENT") {
      title = "Net Settlement Executed";
      message = event.data.message;
      type = "success";
    }

    setNotification({ title, message, type, time: new Date().toLocaleTimeString() });

    setTimeout(() => {
      setNotification(null);
    }, 6000);
  });

  if (!notification) return null;

  const bgColors = {
    presentation: "bg-brand-900 border-brand-700 text-white",
    success: "bg-emerald-900 border-emerald-700 text-white",
    danger: "bg-rose-900 border-rose-700 text-white",
    info: "bg-gray-900 border-gray-700 text-white",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 max-w-sm ${bgColors[notification.type] || bgColors.info}`}>
        <div className="mt-0.5 shrink-0">
          {notification.type === "presentation" ? (
            <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ) : notification.type === "success" ? (
            <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs uppercase tracking-wider">{notification.title}</h4>
            <span className="text-[10px] opacity-70 font-mono">{notification.time}</span>
          </div>
          <p className="text-xs opacity-90 mt-1">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setNotification(null)}
          className="text-white/60 hover:text-white p-1 rounded transition-colors flex items-center justify-center cursor-pointer"
          title="Dismiss"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
