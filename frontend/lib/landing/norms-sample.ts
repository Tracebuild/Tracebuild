/**
 * Sample norm entries for the landing-page showcase only.
 * Invented, plausible-looking Swiss building norms — NOT a legal source and not
 * wired to any backend. Used purely to demonstrate the Normen-Datenbank UI.
 */

export type NormWork = "SIA" | "VSS" | "Kantonal";

export type SampleNorm = {
  id: string;
  code: string;
  title: string;
  work: NormWork;
  canton: string | null; // null = national / gesamtschweizerisch
  theme: string;
  updated: string; // "MM/YYYY"
  breadcrumb: string;
  body: string;
  clause: string; // exact substring of `body` to highlight
  related: string[]; // norm ids
};

export const SAMPLE_NORMS: SampleNorm[] = [
  {
    id: "pbg-zh-260",
    code: "§ 260 PBG ZH",
    title: "Grenzabstand für Hochbauten",
    work: "Kantonal",
    canton: "ZH",
    theme: "Grenzabstand",
    updated: "08/2026",
    breadcrumb: "PBG ZH › 5. Titel › § 260",
    body:
      "Der kleine Grenzabstand beträgt 3.50 m, der grosse Grenzabstand 6.00 m. Für Gebäude mit mehr als drei Vollgeschossen erhöht sich der grosse Grenzabstand um 1.00 m je zusätzliches Vollgeschoss.",
    clause: "Der kleine Grenzabstand beträgt 3.50 m, der grosse Grenzabstand 6.00 m.",
    related: ["bzo-zh-24", "pbg-zh-270", "sia-451"],
  },
  {
    id: "pbg-zh-270",
    code: "§ 270 PBG ZH",
    title: "Näherbaurecht und Grenzbaurecht",
    work: "Kantonal",
    canton: "ZH",
    theme: "Grenzabstand",
    updated: "03/2026",
    breadcrumb: "PBG ZH › 5. Titel › § 270",
    body:
      "Mit schriftlicher Zustimmung der Nachbarschaft, die im Grundbuch anzumerken ist, darf der Grenzabstand unterschritten oder an die Grenze gebaut werden. Der Gebäudeabstand bleibt in jedem Fall einzuhalten.",
    clause: "Der Gebäudeabstand bleibt in jedem Fall einzuhalten.",
    related: ["pbg-zh-260", "bzo-zh-24"],
  },
  {
    id: "bzo-zh-24",
    code: "Art. 24 BZO Zürich",
    title: "Gebäudehöhe in der Wohnzone W3",
    work: "Kantonal",
    canton: "ZH",
    theme: "Gebäudehöhe",
    updated: "01/2026",
    breadcrumb: "BZO Zürich › Zonenvorschriften › Art. 24",
    body:
      "In der Wohnzone W3 beträgt die zulässige Gebäudehöhe 11.50 m, gemessen ab dem gewachsenen Terrain bis zur Schnittlinie der Fassade mit der Dachhaut. Für Flachdachbauten gilt die Höhe bis Oberkant Attika.",
    clause: "die zulässige Gebäudehöhe 11.50 m",
    related: ["pbg-zh-260", "sia-416"],
  },
  {
    id: "bzo-zh-argb",
    code: "Art. 9 BZO Zürich",
    title: "Ausnützungsziffer und anrechenbare Geschossfläche",
    work: "Kantonal",
    canton: "ZH",
    theme: "Ausnützung",
    updated: "11/2025",
    breadcrumb: "BZO Zürich › Allgemeines › Art. 9",
    body:
      "Die Ausnützungsziffer ist das Verhältnis der anrechenbaren Geschossfläche zur anrechenbaren Grundstücksfläche. Nicht angerechnet werden Flächen mit einer lichten Höhe unter 1.00 m sowie notwendige Nebenräume im Untergeschoss.",
    clause: "Verhältnis der anrechenbaren Geschossfläche zur anrechenbaren Grundstücksfläche",
    related: ["bzo-zh-24", "sia-416"],
  },
  {
    id: "sia-500",
    code: "SIA 500",
    title: "Hindernisfreie Bauten",
    work: "SIA",
    canton: null,
    theme: "Hindernisfreiheit",
    updated: "06/2026",
    breadcrumb: "SIA 500 › 3 Anforderungen › 3.4",
    body:
      "Türen in der hindernisfreien Erschliessung müssen eine lichte Durchgangsbreite von mindestens 0.80 m aufweisen. Vor und nach der Tür ist eine horizontale Bewegungsfläche von mindestens 1.40 m Länge vorzusehen.",
    clause: "lichte Durchgangsbreite von mindestens 0.80 m",
    related: ["sia-118", "vss-40-281"],
  },
  {
    id: "sia-380-1",
    code: "SIA 380/1",
    title: "Heizwärmebedarf",
    work: "SIA",
    canton: null,
    theme: "Energie",
    updated: "08/2026",
    breadcrumb: "SIA 380/1 › 3 Grenzwerte › 3.1",
    body:
      "Der Heizwärmebedarf Qh darf den projektbezogenen Grenzwert Qh,li nicht überschreiten. Der Grenzwert ist abhängig von der thermischen Gebäudehüllfläche im Verhältnis zur Energiebezugsfläche.",
    clause: "darf den projektbezogenen Grenzwert Qh,li nicht überschreiten",
    related: ["sia-380-2", "sia-180"],
  },
  {
    id: "sia-380-2",
    code: "SIA 380/2",
    title: "Kühlleistung und Klimatisierung",
    work: "SIA",
    canton: null,
    theme: "Energie",
    updated: "02/2026",
    breadcrumb: "SIA 380/2 › 4 Nachweis › 4.2",
    body:
      "Eine aktive Kühlung ist nur zulässig, wenn der sommerliche Wärmeschutz nach SIA 180 nachgewiesen ist und die installierte Kälteleistung 20 W/m² Energiebezugsfläche nicht übersteigt.",
    clause: "die installierte Kälteleistung 20 W/m² Energiebezugsfläche nicht übersteigt",
    related: ["sia-380-1", "sia-180"],
  },
  {
    id: "sia-180",
    code: "SIA 180",
    title: "Wärmeschutz, Feuchteschutz und Raumklima",
    work: "SIA",
    canton: null,
    theme: "Bauphysik",
    updated: "05/2026",
    breadcrumb: "SIA 180 › 5 Sommerlicher Wärmeschutz › 5.3",
    body:
      "Ohne aktive Kühlung darf die operative Raumtemperatur an höchstens 100 Stunden pro Jahr über der oberen Komfortgrenze liegen. Massgebend ist das Klimadatenjahr des Standortkantons.",
    clause: "höchstens 100 Stunden pro Jahr über der oberen Komfortgrenze",
    related: ["sia-380-1", "sia-380-2"],
  },
  {
    id: "sia-181",
    code: "SIA 181",
    title: "Schallschutz im Hochbau",
    work: "SIA",
    canton: null,
    theme: "Schallschutz",
    updated: "09/2025",
    breadcrumb: "SIA 181 › 3 Anforderungen › Tab. 3",
    body:
      "Zwischen fremden Nutzungseinheiten ist ein bewerteter Schallschutz von mindestens 52 dB für Luftschall einzuhalten. Bei erhöhten Anforderungen erhöht sich der Wert um 3 dB.",
    clause: "bewerteter Schallschutz von mindestens 52 dB für Luftschall",
    related: ["sia-118", "sia-180"],
  },
  {
    id: "sia-261",
    code: "SIA 261",
    title: "Einwirkungen auf Tragwerke",
    work: "SIA",
    canton: null,
    theme: "Tragwerk",
    updated: "04/2026",
    breadcrumb: "SIA 261 › 5 Schnee und Wind › 5.2",
    body:
      "Die charakteristische Schneelast auf dem Boden sk ist standortabhängig und beträgt im Mittelland mindestens 0.90 kN/m². Für Bauhöhen über 800 m ü. M. ist sk nach Anhang D zu bestimmen.",
    clause: "beträgt im Mittelland mindestens 0.90 kN/m²",
    related: ["sia-232-1", "sia-416"],
  },
  {
    id: "sia-232-1",
    code: "SIA 232/1",
    title: "Geneigte Dächer",
    work: "SIA",
    canton: null,
    theme: "Dach",
    updated: "07/2026",
    breadcrumb: "SIA 232/1 › 2 Konstruktion › 2.5",
    body:
      "Bei Dachneigungen unter 25° ist eine zusätzliche wasserdichte Unterdachbahn erforderlich. Die Mindestüberdeckung der Ziegel richtet sich nach Neigung, Regionalklima und Regeldachneigung des Produkts.",
    clause: "Bei Dachneigungen unter 25° ist eine zusätzliche wasserdichte Unterdachbahn erforderlich.",
    related: ["sia-261", "sia-271"],
  },
  {
    id: "sia-271",
    code: "SIA 271",
    title: "Abdichtungen von Hochbauten",
    work: "SIA",
    canton: null,
    theme: "Dach",
    updated: "12/2025",
    breadcrumb: "SIA 271 › 4 Anschlüsse › 4.3",
    body:
      "Abdichtungen sind an aufgehenden Bauteilen mindestens 100 mm über die fertige Oberfläche hochzuziehen. Bei begrünten Flächen erhöht sich das Mass auf 150 mm.",
    clause: "mindestens 100 mm über die fertige Oberfläche hochzuziehen",
    related: ["sia-232-1", "sia-271"],
  },
  {
    id: "sia-416",
    code: "SIA 416",
    title: "Flächen und Volumen von Gebäuden",
    work: "SIA",
    canton: null,
    theme: "Ausnützung",
    updated: "10/2025",
    breadcrumb: "SIA 416 › 3 Definitionen › 3.2",
    body:
      "Die Geschossfläche GF umfasst die Grundfläche aller Geschosse einschliesslich Konstruktionsflächen. Nicht dazu zählen Flächen ausserhalb der Gebäudehülle wie offene Balkone und auskragende Vordächer.",
    clause: "einschliesslich Konstruktionsflächen",
    related: ["bzo-zh-argb", "bzo-zh-24"],
  },
  {
    id: "sia-118",
    code: "SIA 118",
    title: "Allgemeine Bedingungen für Bauarbeiten",
    work: "SIA",
    canton: null,
    theme: "Vertrag",
    updated: "03/2026",
    breadcrumb: "SIA 118 › Art. 158 › Abs. 1",
    body:
      "Die Abnahme des Werks erfolgt gemeinsam durch Bauherrschaft und Unternehmer. Ab Abnahme läuft die zweijährige Rügefrist; verdeckte Mängel können während der Verjährungsfrist von fünf Jahren geltend gemacht werden.",
    clause: "Ab Abnahme läuft die zweijährige Rügefrist",
    related: ["sia-500", "sia-181"],
  },
  {
    id: "vss-40-281",
    code: "VSS 40 281",
    title: "Parkieren – Angebot an Parkfeldern",
    work: "VSS",
    canton: null,
    theme: "Parkierung",
    updated: "06/2026",
    breadcrumb: "VSS 40 281 › 5 Bedarf › 5.1",
    body:
      "Für Wohnnutzungen ist als Richtwert ein Parkfeld je 100 m² Bruttogeschossfläche vorzusehen, mindestens jedoch ein Parkfeld je Wohnung. Kommunale Reduktionen bei guter ÖV-Erschliessung bleiben vorbehalten.",
    clause: "ein Parkfeld je 100 m² Bruttogeschossfläche",
    related: ["sia-500", "bzo-zh-argb"],
  },
  {
    id: "gschg-abstand",
    code: "Art. 41c GSchV",
    title: "Gewässerraum – Bauverbot",
    work: "Kantonal",
    canton: "BE",
    theme: "Gewässerabstand",
    updated: "05/2026",
    breadcrumb: "GSchV › 4a › Art. 41c",
    body:
      "Im Gewässerraum dürfen nur standortgebundene, im öffentlichen Interesse liegende Anlagen erstellt werden. Bestehende Bauten geniessen Bestandesgarantie, dürfen aber nicht erweitert werden.",
    clause: "dürfen nur standortgebundene, im öffentlichen Interesse liegende Anlagen erstellt werden",
    related: ["waldg-abstand", "pbg-zh-260"],
  },
  {
    id: "waldg-abstand",
    code: "Art. 13 KWaG BE",
    title: "Waldabstand für Bauten",
    work: "Kantonal",
    canton: "BE",
    theme: "Waldabstand",
    updated: "02/2026",
    breadcrumb: "KWaG BE › 3 › Art. 13",
    body:
      "Bauten und Anlagen haben einen Mindestabstand von 30 m zum Waldrand einzuhalten. Die zuständige Stelle kann Ausnahmen bis 15 m bewilligen, wenn keine überwiegenden Interessen entgegenstehen.",
    clause: "Mindestabstand von 30 m zum Waldrand",
    related: ["gschg-abstand"],
  },
];

export const THEMES = Array.from(new Set(SAMPLE_NORMS.map((n) => n.theme))).sort();
export const CANTONS = Array.from(
  new Set(SAMPLE_NORMS.map((n) => n.canton).filter((c): c is string => !!c))
).sort();
export const WORKS: NormWork[] = ["SIA", "VSS", "Kantonal"];

export function findNorm(id: string) {
  return SAMPLE_NORMS.find((n) => n.id === id);
}
