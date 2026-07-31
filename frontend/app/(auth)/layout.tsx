import AuthBackButton from "./AuthBackButton";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16, background: "#151E32", overflow: "hidden",
    }}>

      {/* Ambient glow — blue top-left */}
      <div style={{
        position: "absolute", top: "-10%", left: "-10%",
        width: "60vw", height: "60vw", maxWidth: 800, maxHeight: 800,
        background: "radial-gradient(circle,rgba(133,166,233,0.22) 0%,rgba(48,95,189,0) 70%)",
        pointerEvents: "none",
      }} />

      {/* Ambient glow — orange bottom-right */}
      <div style={{
        position: "absolute", bottom: "-20%", right: "-15%",
        width: "70vw", height: "70vw", maxWidth: 900, maxHeight: 900,
        background: "radial-gradient(circle,rgba(232,132,74,0.35) 0%,rgba(232,132,74,0.1) 45%,rgba(232,132,74,0) 72%)",
        pointerEvents: "none",
      }} />

      <AuthBackButton />

      {/* Card slot */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 448 }}>
        {children}
      </div>
    </div>
  );
}
