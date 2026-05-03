import { ImageResponse } from "next/og";

// Иконка во вкладке браузера: белый прямоугольник на чёрном фоне 32×32.
// Next.js автоматически отдаст её по пути /icon как PNG.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "70%",
            height: "40%",
            background: "#fff",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
