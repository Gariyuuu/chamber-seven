import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

const CHAMBERS: [number, number][] = [
  [50.0, 20.0],
  [73.5, 31.3],
  [79.2, 56.7],
  [63.0, 77.0],
  [37.0, 77.0],
  [20.8, 56.7],
  [26.5, 31.3],
];

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0a10",
        }}
      >
        <svg width="56" height="56" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="#141219" stroke="#3a1014" strokeWidth="3" />
          <circle cx="50" cy="50" r="10" fill="#0b0a10" stroke="#5a1a1a" strokeWidth="2" />
          {CHAMBERS.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i === 0 ? 9 : 7.5}
              fill={i === 0 ? "#ff2f3a" : "#0b0a10"}
              stroke={i === 0 ? "#ff8085" : "#5a1a1a"}
              strokeWidth={i === 0 ? 2 : 1.5}
            />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
