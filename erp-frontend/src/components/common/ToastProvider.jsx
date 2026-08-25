"use client";

import { Toaster, ToastBar, toast } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <>
      <style>{`
        @keyframes toastProgress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "inherit",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
            padding: "12px 16px",
            color: "#1f2937",
            background: "#ffffff",
            position: "relative",
            overflow: "hidden",
          },
          success: {
            iconTheme: { primary: "#1565c0", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== "loading" && (
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    aria-label="Close toast"
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "2px",
                      marginLeft: "8px",
                      color: "#9ca3af",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      outline: "none",
                      transition: "color 0.2s, background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.backgroundColor = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#9ca3af";
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {t.type !== "loading" && (t.duration || 2500) !== Infinity && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "3px",
                      backgroundColor: "#2563eb",
                      transformOrigin: "right",
                      animationName: "toastProgress",
                      animationDuration: `${t.duration || 2500}ms`,
                      animationTimingFunction: "linear",
                      animationFillMode: "forwards",
                    }}
                  />
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}

