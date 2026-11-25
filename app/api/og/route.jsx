import { ImageResponse } from "@vercel/og";

export const runtime = "edge";

const loadGoogleFont = async (font, text, weights) => {
  const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weights}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) {
      return await response.arrayBuffer();
    }
  }

  throw new Error("failed to load font data");
};

export async function GET() {
  const text = "Gökhan Öztürk - JavaScript enthusiast and 👻 Witchcraft 🕸️.";
  try {
    return new ImageResponse(
      <div
        style={{
          alignItems: "flex-start",
          background: "rgba(17, 16, 16, 1)",
          color: "rgba(249, 250, 251, 1)",
          display: "flex",
          flexDirection: "column",
          fontFamily:
            'Geist, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
          height: "100%",
          justifyContent: "flex-end",
          MozOsxFontSmoothing: "grayscale",
          overflow: "hidden",
          padding: "80px",
          position: "relative",
          WebkitFontSmoothing: "antialiased",
          width: "100%",
        }}
      >
        <div style={{ alignItems: "flex-end", display: "flex", gap: "10px" }}>
          <img
            alt="logo"
            height={240}
            src="https://pub-e80ae7bbbfd0439e86c73b572dc9e5b0.r2.dev/profile.svg"
            width={240}
          />
          <span style={{ display: "flex", flexDirection: "column" }}>
            <p
              style={{
                fontSize: "60px",
                fontWeight: "700",
                lineHeight: "0.01",
                paddingBottom: "10px",
              }}
            >
              Gökhan Öztürk
            </p>
            <p
              style={{
                fontSize: "28px",
                fontWeight: "500",
              }}
            >
              Frontend developer, JavaScript enthusiast and 👻 Witchcraft 🕸️.
            </p>
          </span>
        </div>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "4px",
            justifyContent: "center",
            marginTop: "60px",
            width: "100%",
          }}
        >
          <p
            style={{
              color: "rgba(96, 165, 250, 1)",
              fontSize: "18px",
              fontWeight: "500",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            github.com/gokh4nozturk
          </p>
          <span
            style={{
              color: "rgba(75, 85, 99, 1)",
              fontSize: "40px",
              fontWeight: "500",
              lineHeight: "0.01",
            }}
          >
            ·
          </span>
          <p
            style={{
              color: "rgba(96, 165, 250, 1)",
              fontSize: "18px",
              fontWeight: "500",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            linkedin.com/in/gokhannozturk
          </p>
        </div>
      </div>,
      {
        debug: false,
        emoji: "fluent",
        fonts: [
          {
            data: await loadGoogleFont("Geist", text, "400"),
            name: "Geist",
            weight: 400,
          },
          {
            data: await loadGoogleFont("Geist", text, "500"),
            name: "Geist",
            weight: 500,
          },
          {
            data: await loadGoogleFont("Geist", text, "600"),
            name: "Geist",
            weight: 600,
          },
          {
            data: await loadGoogleFont("Geist", text, "700"),
            name: "Geist",
            weight: 700,
          },
        ],
        height: 630,
        width: 1200,
      },
    );
  } catch (e) {
    console.log(`${e.message}`);
    return new Response("Failed to generate the image", {
      status: 500,
    });
  }
}
