export interface AnalysisItem {
  id: string;
  standard_ref: string;
  category: string;
  status: "ok" | "fail" | "warn";
  note: string;
  suggestion: string | null;
}

export const bauDomain = {
  id: "bau",
  name: "Bau / Architektur",

  getAnalysisPrompt(): string {
    return `Du bist ein erfahrener Schweizer Bausachverständiger und Norm-Prüfer.

Deine Aufgabe: Analysiere den hochgeladenen Bauplan gegen die geltenden Normen und Vorschriften.

WICHTIG: Rufe zuerst das Tool \`get_standards\` auf, um die relevanten Normen für den angegebenen Kanton zu laden.
Warte auf die Normen, bevor du die Analyse durchführst.

Nach Erhalt der Normen, gib deine Analyse als JSON-Array aus:

\`\`\`json
[
  {
    "standard_ref": "SIA 416 §4.2",
    "category": "Grenzabstand",
    "status": "ok",
    "note": "Grenzabstand von 4m eingehalten (min. 3m gemäss kant. BauG)",
    "suggestion": null
  },
  {
    "standard_ref": "PBG ZH §270",
    "category": "Gebäudehöhe",
    "status": "fail",
    "note": "Traufhöhe 8.2m überschreitet das Maximum von 7.5m",
    "suggestion": "Dachneigung reduzieren oder Geschoss um ~0.7m absenken"
  }
]
\`\`\`

Regeln:
- Status: "ok" = konform, "fail" = Verletzung, "warn" = unklar/prüfungsbedürftig
- Mindestens 4 Prüfpunkte
- Nur JSON ausgeben, kein erklärender Text davor/danach
- Wenn eine Norm nicht beurteilbar ist (Plan unvollständig), Status "warn" setzen`;
  },

  parseAnalysisResult(raw: string): AnalysisItem[] {
    try {
      // JSON aus Markdown-Codeblock extrahieren
      const match = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = match ? match[1].trim() : raw.trim();
      const items = JSON.parse(jsonStr);
      return (items as AnalysisItem[]).map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        suggestion: item.suggestion ?? null,
      }));
    } catch {
      return [];
    }
  },
};

export function getDomain(id: string) {
  if (id === "bau") return bauDomain;
  return bauDomain; // Fallback auf Bau bis weitere Domains implementiert
}
