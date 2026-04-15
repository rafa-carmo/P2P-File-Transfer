import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "P2P Transfer — Secure File Transfer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#09090b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          gap: "24px",
          padding: "60px",
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "9999px",
            padding: "8px 20px",
            color: "#71717a",
            fontSize: "18px",
            letterSpacing: "0.05em",
          }}
        >
          <span style={{ color: "#22c55e", fontSize: "12px" }}>●</span>
          WebRTC · AES-256-GCM · No Server
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "80px" }}>⚡</span>
          <span style={{ fontSize: "80px", fontWeight: "bold", color: "#fafafa" }}>
            P2P{" "}
            <span style={{ color: "#a78bfa" }}>Transfer</span>
          </span>
          <span style={{ fontSize: "80px" }}>⚡</span>
        </div>

        {/* Description */}
        <div
          style={{
            color: "#a1a1aa",
            fontSize: "28px",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.5",
          }}
        >
          Secure peer-to-peer file transfer with end-to-end encryption.
          No server. No size limit. Fully private.
        </div>

        {/* Bottom tags */}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          {["🔐 Encrypted", "🌐 P2P", "⚡ Fast", "🔓 Open Source"].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#d4d4d8",
                  fontSize: "20px",
                }}
              >
                {tag}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
