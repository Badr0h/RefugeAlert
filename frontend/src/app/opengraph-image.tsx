import { ImageResponse } from "next/og";

export const alt = "AlerteGR20 — refuge GR20 complet, alerte disponibilité";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#e4ece8",
          color: "#1c2b24",
        }}
      >
        <div style={{ width: 36, height: "100%", background: "#d10000" }} />
        <div style={{ width: 22, height: "100%", background: "#f3f7f5" }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {/* Le balisage du GR : barre rouge sur barre blanche. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                transform: "rotate(-6deg)",
              }}
            >
              <div style={{ width: 62, height: 26, borderRadius: 4, background: "#d10000" }} />
              <div style={{ width: 62, height: 26, borderRadius: 4, background: "#f3f7f5" }} />
            </div>
            <div style={{ fontSize: 86, fontWeight: 700, color: "#1e4636" }}>AlerteGR20</div>
          </div>
          <div style={{ fontSize: 44, marginTop: 18 }}>Refuge GR20 complet</div>
          <div style={{ fontSize: 30, marginTop: 22, color: "#5e6f68" }}>
            {"Une place se libère, on vous écrit"}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
