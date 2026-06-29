# AI Analysis Platform — Project Context for Claude Code!

## What is this project?

A multi-domain AI platform for automatically checking technical documents (building plans, industrial drawings, machine documentation) against applicable standards and regulations.

**MVP focus: Construction/Architecture, Market: DACH (Switzerland first)**

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | FastAPI (Python 3.12) + Async |
| Database | Supabase (PostgreSQL 16 + pgvector + Storage + Auth) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Queue | Redis + Celery |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |
| CI/CD | GitHub Actions |
| Monitoring | Sentry + Posthog |

---

## Project Structure (Monorepo)

```
/
├── frontend/          # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/         # Project overview (all boards)
│   │   └── projects/[id]/     # Single project board
│   │       ├── standards/     # Part 1: Standards
│   │       ├── analysis/      # Part 2: Plan analysis
│   │       ├── chat/          # Part 3: AI chat
│   │       └── database/      # Part 4: Standards DB
│   ├── components/
│   └── lib/
├── backend/           # FastAPI App
│   ├── app/
│   │   ├── api/routes/
│   │   ├── services/
│   │   │   ├── standards_service.py
│   │   │   ├── analysis_service.py
│   │   │   ├── chat_service.py
│   │   │   ├── project_service.py
│   │   │   └── export_service.py
│   │   ├── domains/           # Domain plugin system
│   │   │   ├── base.py        # Abstract domain
│   │   │   ├── bau/           # Construction/architecture domain
│   │   │   ├── industrie/     # (Roadmap)
│   │   │   └── maschinenbau/  # (Roadmap)
│   │   ├── models/
│   │   └── core/
│   └── workers/       # Celery tasks
├── supabase/
│   ├── migrations/
│   └── seed/
└── CLAUDE.md          # This file
```

---

## Database Schema

```sql
-- Organizations
organizations (id uuid, name text, plan_tier text, created_at)

-- Users
users (id uuid, org_id → organizations, role text, email text)

-- Projects (1 board = 1 project)
projects (
  id uuid,
  org_id → organizations,
  name text,
  domain text,          -- 'bau' | 'industrie' | 'maschinenbau'
  location jsonb,       -- { canton, municipality, country }
  status text,          -- 'active' | 'archived'
  created_at
)

-- Uploaded documents (plans, drawings)
documents (
  id uuid,
  project_id → projects,
  file_url text,        -- Supabase Storage URL
  doc_type text,        -- 'grundriss' | 'schnitt' | 'ansicht' | ...
  pages int,
  uploaded_at
)

-- Analysis runs
analyses (
  id uuid,
  document_id → documents,
  result_json jsonb,    -- Structured raw Claude response
  status text,          -- 'pending' | 'running' | 'done' | 'error'
  cost_usd numeric,
  created_at
)

-- Individual check items per analysis
analysis_items (
  id uuid,
  analysis_id → analyses,
  standard_id → standards,
  status text,          -- 'ok' | 'fail' | 'warn'
  note text,
  suggestion text
)

-- Standards database
standards (
  id uuid,
  domain text,              -- 'bau' | 'industrie' | ...
  layer int,                -- 1=International, 2=Cantonal/Industry, 3=Municipal, 4=Customer
  jurisdiction_type text,   -- 'international' | 'national' | 'cantonal' | 'municipal' | 'org'
  jurisdiction_name text,   -- 'ZH' | 'Mels' | 'ISO' | null
  org_id uuid → organizations (null = public standard),
  category text,            -- 'grenzabstand' | 'gebaeudehöhe' | ...
  text text,
  source_url text,
  source_doc text,
  embedding vector(1536),
  valid_from date
)

-- Chat history per project
chat_messages (
  id uuid,
  project_id → projects,
  role text,            -- 'user' | 'assistant'
  content text,
  created_at
)
```

---

## Domain Plugin System

Each domain is a module under `backend/app/domains/` implementing the `BaseDomain` interface:

```python
class BaseDomain:
    domain_id: str
    display_name: str
    
    def get_analysis_prompt(self, context: dict) -> str:
        """System prompt for plan analysis"""
        ...
    
    def get_standards_search_prompt(self, location: dict) -> str:
        """Prompt for standards research"""
        ...
    
    def parse_analysis_result(self, raw: str) -> list[AnalysisItem]:
        """Parses Claude output into structured analysis items"""
        ...
```

**Active domain:** `bau` — building plans, SIA standards, cantonal building codes CH/AT

---

## The 4 Product Parts

### Part 1 — Standards Research
- User enters location (canton + municipality)
- Backend calls Claude with web search tool
- Claude researches: zoning regulations, RBG/RBV, cantonal building codes
- Result is saved to `standards` table + indexed with pgvector
- API: `POST /api/v1/projects/{id}/standards/research`

### Part 2 — Document Analysis (core feature)
- User uploads PDF → Supabase Storage
- Backend: PDF → page images (pdf2image)
- RAG: fetch relevant standards from pgvector (domain-filtered)
- Claude Sonnet 4.6 with vision: images + standards + domain prompt
- Output: JSON with `analysis_items` (ok/fail/warn + suggestion)
- API: `POST /api/v1/projects/{id}/analyses`

### Part 3 — AI Chat
- Standard chat with project context in system prompt
- Context includes: project standards set + latest analysis results
- Chat history persisted in `chat_messages`
- SSE streaming to frontend
- API: `POST /api/v1/projects/{id}/chat`

### Part 4 — Standards Database
- Admin interface: upload standards (PDF/text), chunk, embed
- Public: search standards, filtered by domain + region
- API: `GET /api/v1/standards?domain=bau&region=CH-ZH`

---

## Anthropic Claude API Usage

```python
import anthropic

client = anthropic.Anthropic()

# Plan analysis (vision)
response = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=4096,
    system=domain.get_analysis_prompt(context),  # with prompt caching
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "url", "url": image_url}},
            {"type": "text", "text": "Analyze this plan against the attached standards."}
        ]
    }]
)

# Standards research (web search)
response = client.messages.create(
    model="claude-sonnet-4-6",
    tools=[{"type": "web_search_20250305", "name": "web_search"}],
    messages=[...]
)
```

**Optimizations:**
- Prompt caching on system prompts (−90% input cost for chat)
- Batch API for bulk analyses (−50% total cost)
- pgvector RAG so not all standards need to be sent every time

---

## Environment Variables

```bash
# Backend (.env)
ANTHROPIC_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
REDIS_URL=...

# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Development Order (Recommended)

1. **Set up Supabase project** — migrate schema, enable auth, create storage bucket
2. **Monorepo scaffold** — set up Next.js + FastAPI, both running locally
3. **Auth flow** — login/register with Supabase Auth, pass JWT to backend
4. **Project dashboard** — CRUD for projects, dashboard view
5. **Plan analysis (Part 2)** — PDF upload → Claude → display results (core feature)
6. **Standards research (Part 1)** — location → Claude web search → DB
7. **Chat (Part 3)** — with project context
8. **Standards DB (Part 4)** — admin upload + public search
9. **Export** — PDF report + XLSX defect list

---

## Conventions

- Python: type hints everywhere, Pydantic for all schemas
- API responses: always `{ data: ..., error: null }` or `{ data: null, error: "..." }`
- Error handling: HTTP exceptions with clear messages
- Log all Claude costs per request to DB (`cost_usd`)
- Row Level Security in Supabase: users only see their own org's projects
- Domain-specific code always in `domains/` — never in core

---

## Agent Roles (Developer Army Framework)

This project is developed with multiple parallel Claude roles. Every Claude session working in this repo should understand which role it is currently in and stay within the corresponding scope.

### 1. CEO / Copilot (strategic, no code access)
- Location: pinned chat in Claude.ai / Claude Desktop (no file access)
- Task: roadmap prioritization, architecture decisions, feature scoping, prompt generation for senior/junior sessions, product-level review of results
- **No writing code** — produces ready-made prompts for the dev roles instead
- Initial prompt: `docs/ceo-prompt.md`

### 2. Senior Developer (Claude Code locally in VS Code)
- Location: Claude Code in local repo clone
- Scope: complex, cross-system work
  - Plan analysis pipeline (PDF → vision → RAG → Claude)
  - pgvector setup + embedding pipeline
  - Domain plugin interface (`backend/app/domains/base.py`)
  - Celery worker architecture
  - Supabase migrations + RLS policies
  - Deployment debugging (Vercel/Railway)
  - Merging + integrating junior PRs
- Works directly on `main` or `feature/*` branches

### 3. Junior Developer (Claude Code remote via GitHub)
- Location: Claude Code session connected to GitHub repo (not local)
- Scope: small, isolated tasks, max ~30 min work, ideally 1 file / 1 folder
  - Individual UI components (dashboard card, upload dropzone, filter table)
  - Individual API routes without complex business logic
  - Form validation, loading/error states, skeletons
  - Writing tests for existing services
  - Adding seed data (e.g. `standards` for a single canton)
  - Tailwind/design polish
- Branch naming: `junior/<short-description>` (e.g. `junior/toast-notifications`)
- **Never push directly to `main`** — always open a PR against `main`
- PR must follow the template in `.github/pull_request_template.md`
- CI must be green before merging

### Scope Decision Guide (for CEO)
| Symptom | Role |
|---|---|
| Change affects > 3 files across different layers | Senior |
| New API route + DB migration + frontend wiring | Senior |
| UI component in a single file | Junior |
| Bug fix in an existing function | Junior |
| Writing a test for an existing service | Junior |
| Architecture/interface change | Senior |
| Deployment or env config issue | Senior |

### PR Policy
- `main` is protected: PR + CI check + 1 review required
- Every PR automatically gets a Vercel preview URL — review before merging
- Junior PRs: keep them small, one PR = one feature
- Senior may push directly to `main` in urgent cases (e.g. production hotfix), but ideally via PR as well
