import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0a10",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 108,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: "#f5f2ee",
            textAlign: "center",
          }}
        >
          CHAMBER SEVEN
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            color: "#c9a0a3",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          A browser multiplayer shotgun-duel game
        </div>
      </div>
    ),
    { ...size },
  );
}
