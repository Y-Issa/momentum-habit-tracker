import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #6366f1, #818cf8)",
          color: "white",
          fontSize: 96,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
