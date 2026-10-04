import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Le balisage du GR sur fond de brume : sert d'icône iOS et de logo Organization. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1e4636",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            transform: "rotate(-6deg)",
          }}
        >
          <div style={{ width: 104, height: 42, borderRadius: 6, background: "#d10000" }} />
          <div style={{ width: 104, height: 42, borderRadius: 6, background: "#f3f7f5" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
