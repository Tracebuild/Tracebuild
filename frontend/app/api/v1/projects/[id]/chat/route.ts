import { getAuthUser, ok, unauthorized, err } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { anthropic } from "@/lib/anthropic";

export const maxDuration = 300;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const { data, error } = await admin
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("project_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return err(error.message, 500);
  return ok(data);
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("*, analyses(result_json, status)")
    .eq("id", params.id)
    .eq("org_id", user.org_id)
    .single();
  if (!project) return err("Projekt nicht gefunden", 404);

  const body = await request.json();
  const { content } = body;
  if (!content) return err("Nachricht fehlt");

  // Usernachricht speichern
  await admin.from("chat_messages").insert({
    project_id: params.id,
    role: "user",
    content,
  });

  // Chatverlauf laden
  const { data: history } = await admin
    .from("chat_messages")
    .select("role, content")
    .eq("project_id", params.id)
    .order("created_at", { ascending: true });

  // Standards für Kontext laden
  const canton = project.location?.canton ?? "";
  const { data: standards } = await admin
    .from("standards")
    .select("category, text")
    .eq("domain", project.domain ?? "bau")
    .eq("jurisdiction_name", canton)
    .limit(15);

  const standardsText = (standards ?? [])
    .map((s: { category: string; text: string }) => `- [${s.category}] ${s.text}`)
    .join("\n");

  const systemPrompt = `Du bist ein Bausachverständiger für Schweizer Baurecht und hilfst dem Nutzer, sein Bauprojekt "${project.name}" zu analysieren.

Projekt: ${project.name} | Kanton: ${canton} | Gemeinde: ${project.location?.municipality ?? ""}

Relevante Normen und Vorschriften:
${standardsText || "Noch keine Normen in der Datenbank für diesen Kanton."}

Antworte präzise, fachlich und auf Deutsch.`;

  const messages = (history ?? []).map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // SSE-Stream
  const encoder = new TextEncoder();
  let fullResponse = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
          messages,
        });

        for await (const event of claudeStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = event.delta.text;
            fullResponse += text;
            controller.enqueue(encoder.encode(`data: ${text}\n\n`));
          }
        }

        // Assistent-Antwort speichern
        await admin.from("chat_messages").insert({
          project_id: params.id,
          role: "assistant",
          content: fullResponse,
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (e) {
        controller.enqueue(
          encoder.encode(`data: [ERROR] ${e instanceof Error ? e.message : "Unbekannter Fehler"}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
