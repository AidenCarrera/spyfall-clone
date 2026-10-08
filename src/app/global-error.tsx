"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong | Spyfall</title>
      </head>
      <body
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0d14",
          backgroundImage:
            "radial-gradient(ellipse 90% 55% at 50% -12%, rgb(217 43 57 / 0.2), transparent 62%)",
          color: "#e8e9ef",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
          boxSizing: "border-box",
        }}
      >
        <main>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 800,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#a8adbf" }}>
            Spyfall failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              cursor: "pointer",
              borderRadius: "0.75rem",
              border: "none",
              backgroundImage: "linear-gradient(to bottom, #d92b39, #b81d2a)",
              boxShadow:
                "inset 0 1px 0 rgb(255 255 255 / 0.28), 0 4px 0 #660d16",
              padding: "0.875rem 1.75rem",
              fontSize: "1rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#ffffff",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
