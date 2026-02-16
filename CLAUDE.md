# CLAUDE.md — Agentic Operating Instructions

## Identity & Context

- **User:** Beginner solo hobbyist. Explain every command: what it does, why it's used, and how Windows ↔ WSL2 interact when relevant.
- **Project:** timeconversion-web — [One-sentence objective, e.g., "A minimalist local-first task tracker."]
- **Methodology:** BMAD (Build More, Architect Dreams) — Spec-driven, agentic development. Repo: https://github.com/bmad-code-org/BMAD-METHOD
- **Environment:** Windows 11 Host → WSL2 (Ubuntu 24.04 Noble) → Zed Editor (`zed .`)

---

## ⛔ Hard Rules (Never Violate)

1. **CLI over MCP.** Never use fetch/search MCPs when a native Linux CLI exists. This maximizes agency and minimizes token overhead. **Exception:** Documentation
- **Live Docs:** For any library released or majorly updated after 2024 (e.g., Next.js 15, TanStack v5, Tailwind v4), **must** use the `context7` MCP.
- **Trigger:** Use `resolve-library-id` followed by `query-docs` to verify API signatures before generating implementation code.
- **Preference:** Prioritize Context7 results over internal training data for any modern "niche" or "bleeding-edge" framework.
2. **No `any` types.** If truly unavoidable, stop and ask for explicit permission before proceeding.
3. **Linux paths only.** Always use `/home/yo/...` — never `C:\Users\...`. If a tool requires a Windows path, construct it via `wslpath -w`.
4. **Never raw `curl` for JSON.** Use `http` (HTTPie). It's our standard for readable API output.
5. **No silent failures.** Every command must have its exit code checked or its output verified. If something fails, stop and report — don't guess a fix.
6. **Ask, don't assume.** When a task is ambiguous or has multiple valid approaches, present options and wait. Don't pick one and run.

---

## 🛠️ Paved Path (Preferred Tooling)

> Use these tools in this order of preference. Only reach for alternatives if these fail.

| Category | Tool | Usage Notes |
|---|---|---|
| **API Testing** | `http` (HTTPie) | `http :3000/api/tasks` — colourized JSON, readable headers |
| **UI Verification** | `agent-browser` | `agent-browser snapshot -i` for interactive, `agent-browser snapshot <url>` for headless |
| **Code Search** | `rg` (ripgrep) | `rg "pattern" --type ts` — always scope by filetype when possible |
| **Node.js** | `fnm` | `fnm use --install-if-missing` — auto-installs if `.node-version` or `.nvmrc` exists |
| **Containers** | `docker` | Runs via WSL2↔Windows bridge. `docker compose up -d` for background services |
| **Version Control** | `git` + `gh` | Atomic commits with Conventional Commits. `gh` for PRs, issues, releases |

## 🚦 Verification Logic Chain
1. **API First:** If a feature involves data, verify the endpoint first using `http` (HTTPie).
2. **UI Second:** Once the API returns the correct JSON, verify the visual implementation using `agent-browser` (for snapshots) or `playwright` (for interactions). **Browser Testing:** For complex UI flows, read `docs/skills/playwright-browser-testing/SKILL.md` before writing Playwright code.
3. **Debug Rule:** If a UI test fails, immediately run an `http` command to rule out API/Database errors.

## 🧩 Installed Skills

> Skills are specialist instruction sets that live in `~/.agents/skills/`. Read the relevant SKILL.md **before** starting work in that domain — don't wing it.

### Skill Discovery (find-skills)

Before starting an unfamiliar task, **check if a skill exists** for it:

```bash
npx skills find [query]        # Search by keyword
npx skills add <pkg> -g -y     # Install a skill globally
npx skills check               # Check for updates
npx skills update              # Update all installed skills
```

Use `find-skills` when:
- The user asks "how do I do X" and X might have a community skill.
- You're about to tackle a domain not covered by the installed skills below.
- The user says "find a skill for…" or "is there a skill for…".

If no skill is found, say so and offer to help directly. Don't silently skip the search.

Browse all available skills: https://skills.sh/

### Installed Skill Registry

Read the SKILL.md for any skill **before writing code** in that domain. If multiple skills are relevant to a task, read all of them.

| Skill | Path | When to Read |
|---|---|---|
| **find-skills** | `~/.agents/skills/find-skills` | Before tackling any domain not covered below. Search first. |
| **next-best-practices** | `~/.agents/skills/next-best-practices` | Any Next.js routing, RSC, server actions, or data fetching work. |
| **vercel-react-best-practices** | `~/.agents/skills/vercel-react-best-practices` | React component design, performance, hooks patterns. |
| **tailwind-design-system** | `~/.agents/skills/tailwind-design-system` | Styling, design tokens, responsive layout, Tailwind config. |
| **ui-ux-pro-max** | `~/.agents/skills/ui-ux-pro-max` | UX flows, accessibility, interaction design decisions. |
| **supabase-postgres-best-practices** | `~/.agents/skills/supabase-postgres-best-practices` | Database schema, RLS policies, Supabase client usage, migrations. |
| **better-auth-best-practices** | `~/.agents/skills/better-auth-best-practices` | Authentication flows, session management, auth middleware. |
| **playwright-browser-testing** | `~/.agents/skills/playwright-browser-testing` | Complex browser testing: multistep forms, drag-and-drop, auth flows, visual regression. |
| **agent-browser** | `~/.agents/skills/agent-browser` | Quick UI snapshots and simple browser verification. |
| **tanstack-start-best-practices** | `~/.agents/skills/tanstack-start-best-practices` | Full-stack TanStack Start apps: server functions, middleware, SSR, auth, deployment. |
| **tanstack-query-best-practices** | `~/.agents/skills/tanstack-query-best-practices` | Data fetching, caching, mutations, server state with TanStack Query. |
| **tanstack-router-best-practices** | `~/.agents/skills/tanstack-router-best-practices` | Type-safe routing, data loading, search params, navigation. |
| **tanstack-integration-best-practices** | `~/.agents/skills/tanstack-integration-best-practices` | Combining Query + Router + Start: full-stack data flow, SSR, cache coordination. |



### Skill Selection Logic

Follow this order when deciding which skills to consult:
1. **Always check domain skills first.** Working on a login page? Read `better-auth-best-practices` AND `next-best-practices` AND `ui-ux-pro-max` — they all apply.
2. **Stack skills, don't pick just one.** A Supabase-backed form needs `supabase-postgres-best-practices` + `next-best-practices` + `tailwind-design-system` at minimum.
3. **Verification skills come after implementation skills.** Build with the domain skill, then verify with `agent-browser` (quick check) or `playwright-browser-testing` (complex flows).
4. **When in doubt, search.** If the task doesn't clearly map to an installed skill, run `npx skills find <keyword>` before improvising.
5. **TanStack skills are a stack within the stack.** If the project uses TanStack Start, read all four TanStack skills together — they're designed to work as a unit. If using only TanStack Query with a different framework (e.g., Next.js), read `tanstack-query-best-practices` alone alongside `next-best-practices`.

### WSL2 ↔ Windows Interaction Notes

- Docker Desktop runs on Windows but exposes its socket into WSL2. `docker` CLI works natively in the terminal — no extra config.
- Zed is a Windows app connecting to WSL2 via remote. File paths printed to the terminal should be relative (e.g., `src/components/Button.tsx`) so the user can Ctrl+Click to open in Zed.
- `localhost` ports are shared: a server on `:3000` inside WSL2 is reachable at `localhost:3000` from the Windows browser.
- If you ever need to convert paths: `wslpath -w /home/yo/project` → `\\wsl$\Ubuntu\home\yo\project`.

---

## 📐 Project Standards

- **Language:** [e.g., TypeScript 5.x, strict mode]
- **Framework:** [e.g., React 19, Next.js 15]
- **Styling:** [e.g., Tailwind CSS v4, no custom CSS unless unavoidable]
- **Components:** [e.g., Functional components only, props interfaces co-located]
- **State:** [e.g., Zustand for global, React state for local]
- **Testing:** [e.g., Vitest + Testing Library]
- **Package Manager:** [e.g., npm — do not use yarn/pnpm unless told]

---

## 🧠 Context Management

> Claude Code has a limited context window. Help it help you.

- **BMAD Specs:** If a BMAD spec file exists (e.g., `docs/prd.md`, `docs/architecture.md`), read it at the start of a task for grounding.
- **Focused reads:** Don't cat entire files. Use `rg` to find the relevant section, then read only that range.
- **Summarize before acting:** After exploring, write a 2–3 sentence summary of what you found and what you plan to do. This creates a checkpoint the user can correct.
- **Long sessions:** If a session is getting long (15+ back-and-forths), proactively suggest summarizing progress and remaining work.

---

## 🔧 Error Handling Protocol

When something breaks, follow this sequence:

1. **Read the full error.** Don't truncate. Copy the exact error message.
2. **Identify the layer.** Is it a TypeScript error? A runtime error? A network error? A Docker issue?
3. **Search the codebase first.** `rg "ErrorKeyword"` — often the answer is in the project itself.
4. **Propose a fix with reasoning.** "This failed because X. I'll fix it by doing Y, which works because Z."
5. **If stuck after 3 attempts:** Stop. Present what you've tried, what you've learned, and ask the user for direction. Do not loop.

---

## ⚡ Quick Reference

```bash
# --- Daily Drivers ---
npm install                          # Install dependencies
npm run dev                          # Start dev server
http :3000/health                    # Health check
agent-browser snapshot -i            # Interactive UI snapshot

# --- Diagnostics ---
git status && git diff --stat        # What changed?
npx tsc --noEmit                     # Type check without building
docker ps                            # Running containers
docker compose logs -f <service>     # Tail container logs
fnm current                          # Active Node.js version

# --- Search & Navigate ---
rg "TODO|FIXME|HACK" --type ts       # Find tech debt
rg "import.*from" <file> -N          # List imports in a file
find . -name "*.test.*" -not -path '*/node_modules/*'  # Find test files