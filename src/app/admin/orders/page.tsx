"use client";
const fr = "'Fraunces', Georgia, serif";
const bg = "'Bricolage Grotesque', system-ui, sans-serif";

export default function Page() {
  return (
    <div>
      <h1 style={{ fontFamily: fr, fontSize: "26px", color: "#F2ECE0", marginBottom: "8px" }}>Orders</h1>
      <p style={{ fontFamily: bg, fontSize: "14px", color: "#6B8A74" }}>Admin orders management</p>
      <div style={{ marginTop: "40px", padding: "60px 0", textAlign: "center", border: "1px dashed rgba(201,169,110,0.15)", borderRadius: "14px" }}>
        <p style={{ fontFamily: bg, fontSize: "14px", color: "#6B8A74" }}>Supabase integration pending</p>
      </div>
    </div>
  );
}
