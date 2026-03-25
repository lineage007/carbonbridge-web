"use client";
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function Page() {
  return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: "26px", color: "#1A1714", marginBottom: "8px" }}>Purchases</h1>
      <p style={{ fontFamily: bg, fontSize: "14px", color: "#6B6259" }}>Your purchases data</p>
      <div style={{ marginTop: "40px", padding: "60px 0", textAlign: "center", border: "1px dashed #E5DED3", borderRadius: "14px" }}>
        <p style={{ fontFamily: bg, fontSize: "14px", color: "#8A7E70" }}>Connecting to live data</p>
      </div>
    </div>
  );
}
