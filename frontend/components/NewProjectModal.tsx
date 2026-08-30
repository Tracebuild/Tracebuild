"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const CANTONS = [
  "AG","AI","AR","BE","BL","BS","FR","GE","GL","GR",
  "JU","LU","NE","NW","OW","SG","SH","SO","SZ","TG",
  "TI","UR","VD","VS","ZG","ZH",
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

interface CreateProjectResponse {
  project: { id: string };
  assigned_norms_count: number;
  zone: string | null;
}

const inputStyle: React.CSSProperties = {
  width: "100%", border: "1px solid rgba(133,166,233,0.25)",
  background: "rgba(23,37,64,0.6)", borderRadius: 10, padding: "9px 13px",
  fontSize: 14, color: "#fff", outline: "none", fontFamily: "inherit",
  transition: "box-shadow .15s, border-color .15s", boxSizing: "border-box",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#ABAEBB" }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: "#7B8299", fontWeight: 400 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, required }: {
  value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      type="text" required={required} value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.2)"; }}
      onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const router = useRouter();
  const [name, setName]                 = useState("");
  const [canton, setCanton]             = useState("ZH");
  const [municipality, setMunicipality] = useState("");
  const [parcelNumber, setParcelNumber] = useState("");
  const [bauzone, setBauzone]           = useState("");
  const [lookupState, setLookupState]   = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const [error, setError]               = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!parcelNumber.trim() || !municipality.trim()) {
      setLookupState("idle");
      return;
    }
    setLookupState("loading");
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(async () => {
      try {
        const result = await api.post<{ bauzone: string | null }>(
          "/geoportal/lookup",
          { parcel_number: parcelNumber, municipality, canton }
        );
        if (result?.bauzone) {
          setBauzone(result.bauzone);
          setLookupState("found");
        } else {
          setLookupState("notfound");
        }
      } catch {
        setLookupState("notfound");
      }
    }, 800);
    return () => { if (lookupTimer.current) clearTimeout(lookupTimer.current); };
  }, [parcelNumber, municipality, canton]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !municipality.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await api.post<CreateProjectResponse>("/projects", {
        name: name.trim(),
        domain: "bau",
        location: { canton, municipality: municipality.trim(), country: "CH" },
        parcel_number: parcelNumber.trim() || null,
        bauzone: bauzone.trim() || null,
      });
      onCreated();
      onClose();
      router.push(`/projects/${result.project.id}/analysis`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#0E111B", borderRadius: 18, boxShadow: "0 30px 70px rgba(0,0,0,0.5)", border: "1px solid rgba(133,166,233,0.18)", width: "100%", maxWidth: 440, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#85A6E9", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>Neues Analyseprojekt</p>
        <h2 style={{ fontSize: 19, fontWeight: 800, color: "#fff", margin: "0 0 22px" }}>Projekt erstellen</h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <Field label="Projektname">
            <TextInput value={name} onChange={setName} placeholder="z.B. Einfamilienhaus Zürich" required />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Kanton">
              <select
                value={canton} onChange={e => setCanton(e.target.value)}
                style={{ ...inputStyle, appearance: "none" as const }}
                onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)"; }}
              >
                {CANTONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Gemeinde">
              <TextInput value={municipality} onChange={setMunicipality} placeholder="z.B. Winterthur" required />
            </Field>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid rgba(133,166,233,0.1)", margin: "2px 0" }} />

          <Field label="Parzellennummer" hint="(optional — für automatische Bauzonen-Erkennung)">
            <TextInput
              value={parcelNumber}
              onChange={v => { setParcelNumber(v); setBauzone(""); setLookupState("idle"); }}
              placeholder="z.B. 1234"
            />
          </Field>

          <Field label="Bauzone" hint="(optional)">
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={bauzone}
                onChange={e => { setBauzone(e.target.value); setLookupState("idle"); }}
                placeholder="z.B. W2, G, I — oder leer lassen"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "#2862D7"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(40,98,215,0.2)"; }}
                onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(133,166,233,0.25)"; e.currentTarget.style.boxShadow = "none"; }}
              />
              {lookupState === "loading" && (
                <div style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, border: "2px solid #2862D7", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
              )}
              {lookupState === "found" && (
                <span style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#34d399", fontWeight: 600 }}>✓ Geoportal</span>
              )}
            </div>
            {lookupState === "notfound" && (
              <p style={{ fontSize: 11, color: "#7B8299", margin: "5px 0 0", lineHeight: 1.4 }}>
                Parzelle nicht im Geoportal gefunden — Bauzone kann manuell eingegeben oder leer gelassen werden.
              </p>
            )}
          </Field>

          {error && (
            <div style={{ fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 12, paddingTop: 4 }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, border: "1px solid rgba(133,166,233,0.25)", color: "#ABAEBB", padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 500, background: "none", cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(133,166,233,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}
            >
              Abbrechen
            </button>
            <button type="submit" disabled={loading || !name.trim() || !municipality.trim()}
              style={{
                flex: 1, background: "linear-gradient(90deg,#4fd1ff,#38bdf8 55%,#2862D7)",
                color: "#fff", padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 600,
                border: "none", fontFamily: "inherit",
                cursor: (loading || !name.trim() || !municipality.trim()) ? "not-allowed" : "pointer",
                opacity: (loading || !name.trim() || !municipality.trim()) ? 0.5 : 1,
                boxShadow: "0 4px 16px rgba(40,98,215,0.35)", transition: "filter .15s, opacity .15s",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
            >
              {loading ? "Wird erstellt…" : "Projekt erstellen →"}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
