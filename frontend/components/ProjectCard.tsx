"use client";

import Link from "next/link";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  domain: string;
  location: { canton: string; municipality: string };
  status: string;
  created_at: string;
}

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const [hovered, setHovered] = useState(false);

  const date = new Date(project.created_at).toLocaleDateString("de-CH", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <Link
      href={`/projects/${project.id}/analysis`}
      style={{
        position: "relative",
        background: "rgba(23,37,64,0.55)",
        border: `1px solid ${hovered ? "rgba(40,98,215,0.5)" : "rgba(133,166,233,0.18)"}`,
        borderRadius: 16, padding: 22, cursor: "pointer", overflow: "hidden",
        transition: "all .2s",
        boxShadow: hovered ? "0 20px 40px -12px rgba(0,0,0,0.4)" : "none",
        transform: hovered ? "translateY(-3px)" : "none",
        display: "block", textDecoration: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {project.name}
        </h3>
        <p style={{ fontSize: 12.5, color: "#7B8299", margin: "3px 0 0" }}>
          {project.location?.municipality}, {project.location?.canton}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, background: "rgba(40,98,215,0.12)", color: "#85A6E9", padding: "3px 9px", borderRadius: "50px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2862D7", flexShrink: 0 }} />
          {project.domain === "bau" ? "Bau / Architektur" : project.domain}
        </span>
        <span style={{ fontSize: 11, color: "#7B8299", fontFamily: "monospace" }}>{date}</span>
      </div>
    </Link>
  );
}
