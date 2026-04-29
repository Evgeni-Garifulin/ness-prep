import { ImageResponse } from "next/og";

// iOS home screen icon. iOS сам режет углы (rounded mask), поэтому выгоднее
// плотная белая заливка квадратом — иначе после маски получится белый круг с
// фрагментами фона. 180×180 — рекомендованный размер для iOS.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
        }}
      />
    ),
    { ...size },
  );
}
