Task and planning manager for the content platform master plan.

Master plan lives at: `docs/master-plan.md`
Sub-plan docs live at: `docs/<section>/plan.md`

## Usage

  /plan                            — full task board (all sections, all statuses)
  /plan next                       — only tasks that are Ready to Start right now
  /plan check <task>               — pre-flight: verify prerequisites, env vars, files are ready
  /plan start <task>               — check + mark In Progress + begin implementation
  /plan update <task> <status>     — update a task's status
  /plan add                        — add a new task interactively
  /plan questions                  — list all open questions from planning-pending docs

Status shorthands accepted by `update`:
  done      → ✅ Completed
  wip       → 🚧 In Progress
  start     → 🔲 Ready to Start
  planning  → 📋 Planning Pending
  defer     → ⏸ Deferred

---

## Step 1 — Parse $ARGUMENTS

Read $ARGUMENTS. The first word is the subcommand. Everything after it is the arguments to that subcommand.

- Empty → run **show**
- `next` → run **next**
- `check` → run **check** (remaining words = task name fragment)
- `start` → run **start** (remaining words = task name fragment)
- `update` → run **update** (remaining words = task name fragment + status)
- `add` → run **add**
- `questions` → run **questions**
- Anything else → show usage hint and list valid subcommands

---

## Subcommand: show (no arguments)

Read `docs/master-plan.md`. Parse every markdown table that contains a Status column.

Present a task board in this format:

```
━━━ CONTENT PLATFORM — TASK BOARD ━━━━━━━━━━━━━━━━━━━━━━━

✅  Completed        13 tasks
🚧  In Progress       0 tasks
🔲  Ready to Start    3 tasks   ← START HERE
📋  Planning Pending  8 tasks
⏸  Deferred          5 tasks

━━━ 🔲 READY TO START ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  1. fal.ai image generation integration       ~2h
  2. Monorepo setup (content-platform)         ~1 day
  3. AI-image video mode                       ~1–2 days

━━━ 🚧 IN PROGRESS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  (none)

━━━ 📋 PLANNING PENDING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [Infrastructure]  Admin dashboard
  [Infrastructure]  Platform services (TTS + compositor + queue)
  [Video]           Sports / World Cup channel
  [Content]         Infographics / explainer videos
  [Video]           Documentary France
  [News]            Expand to new country pages
  ...

━━━ ⏸ DEFERRED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RunPod Serverless          trigger: 2,000+ images/month
  Facebook publish (reels)   trigger: after Phase 3 + pages created
  Seedance video clips        trigger: Month 2+
  ...

Run `/plan next` to see what's unblocked and what completing each task unlocks.
Run `/plan update <task> <status>` to update a status.
```

Show every task. Do not truncate. Group by section within each status bucket.

---

## Subcommand: next

Read `docs/master-plan.md`. Find only tasks with status `🔲 Ready to Start`.

Then show the prerequisite chain — for each ready task, show what it unlocks when done.
Read the dependency notes in the master plan ("After Phase X", "Trigger: Y") to build this chain.

Format:

```
━━━ WHAT YOU CAN START TODAY ━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. fal.ai image generation integration   ~2h
   └─ Unlocks: Monorepo setup

2. Monorepo setup (content-platform)     ~1 day
   └─ Waiting on: fal.ai integration
   └─ Unlocks: AI-image video mode, Platform services

3. AI-image video mode                   ~1–2 days
   └─ Waiting on: Monorepo setup
   └─ Unlocks: Activate Facebook publish for reels

━━━ STILL BLOCKED ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Platform services      → needs: answer 6 open questions first
  Admin dashboard        → needs: answer 4 open questions first
  Infographics           → needs: answer 5 open questions first

Run `/plan questions` to see all the open questions you need to answer.
```

---

## Subcommand: update

Arguments after `update` are: one or more words of the task name, then the final word is the status shorthand.

Example: `/plan update fal.ai done` → task fragment = "fal.ai", status = "done"
Example: `/plan update monorepo setup wip` → task fragment = "monorepo setup", status = "wip"

### Step 1 — Map status shorthand to full status string

| Shorthand | Full string |
|---|---|
| done | ✅ Completed |
| wip | 🚧 In Progress |
| start | 🔲 Ready to Start |
| planning | 📋 Planning Pending |
| defer | ⏸ Deferred |

**If called with no arguments** (`/plan update` only), use the AskUserQuestion tool with 2 questions:

Question 1 — "Which task do you want to update?"
- header: "Task"
- Show up to 4 of the most actionable tasks (prefer 🚧 In Progress, then 🔲 Ready to Start)
- Each option label = task name, description = current status + section
- User can select Other to type any task name fragment

Question 2 — "What is the new status?"
- header: "New status"
- Options:
  - label: "✅ Completed", description: "Done — built, tested, live"
  - label: "🚧 In Progress", description: "Actively being worked on right now"
  - label: "🔲 Ready to Start", description: "Fully planned, can begin immediately"
  - label: "⏸ Deferred", description: "Waiting on a trigger or dependency"

Then proceed with Steps 2–5 below using the selected values.

**If called with arguments**, skip the AskUserQuestion and proceed directly:

If the last word is not a valid shorthand, tell the user the valid options and stop.

### Step 2 — Find the task in master-plan.md

Read `docs/master-plan.md`. Search every table row for a cell that contains the task name fragment (case-insensitive partial match). If multiple rows match, list them and ask the user to be more specific. If zero rows match, say so.

### Step 3 — Update the status cell

The status cell is the second column in the table row (after the task name). Replace only the status emoji + text with the new full status string. Keep all other columns unchanged.

Use the Edit tool to make this change in `docs/master-plan.md`. Match enough surrounding text to make the edit unique.

### Step 4 — Update the sub-plan doc if it exists

Check if the task's row has a link to a sub-plan doc (e.g. `[plan.md](admin-dashboard/plan.md)`). If it does, read that file. If the file's header contains a `**Status:**` line, update it to match the new status string and update the `**Last updated:**` date to today's date.

### Step 5 — Confirm

Tell the user: "Updated: [task name] → [new status]". If a sub-plan doc was also updated, mention that too.

---

## Subcommand: add

Use the AskUserQuestion tool to collect section, status, and effort in one interactive step. Then ask for the task name and notes as plain text.

### Step 1 — Get the task name

If $ARGUMENTS contains text after "add" (e.g. `/plan add Fix login bug`), use that as the task name and skip this step.

Otherwise ask: "What should the task be called?" as a plain text question. Wait for the reply before continuing.

### Step 2 — Present section + status + effort in one AskUserQuestion call

Use the AskUserQuestion tool with these 3 questions simultaneously:

Question 1 — "Which section does this task belong to?"
- header: "Section"
- multiSelect: false
- options:
  - label: "Infrastructure & Platform", description: "Core platform setup, AI providers, monorepo, admin"
  - label: "News or Video Pipeline", description: "facebook-news-pipeline or reels-pipeline features"
  - label: "New Content Types", description: "Infographics, documentaries, new formats"
  - label: "Platform Services", description: "Containerised TTS, compositor, task queue, hosting"
  (Self-Hosting & Cost Optimisation → user can select Other and type it)

Question 2 — "What is the initial status?"
- header: "Status"
- multiSelect: false
- options:
  - label: "📋 Planning Pending", description: "Idea captured — needs design or scoping before dev starts"
  - label: "🔲 Ready to Start", description: "Fully planned — can begin immediately"
  - label: "🚧 In Progress", description: "Actively being worked on right now"
  - label: "⏸ Deferred", description: "Waiting on a specific trigger or dependency"

Question 3 — "What is the effort estimate?"
- header: "Effort"
- multiSelect: false
- options:
  - label: "~1h", description: "Quick task — under an hour"
  - label: "~1 day", description: "Half to full day of work"
  - label: "~2–3 days", description: "Multi-day implementation"
  - label: "TBD", description: "Not yet estimated"

### Step 3 — Handle "News or Video Pipeline" section answer

If the user selected "News or Video Pipeline" for section, follow up with a second AskUserQuestion:
- Question: "Which pipeline specifically?"
- header: "Pipeline"
- options:
  - label: "News Pipeline", description: "facebook-news-pipeline"
  - label: "Video Pipeline", description: "reels-pipeline"

### Step 4 — Ask for notes (plain text)

Ask: "Any notes, trigger conditions, or links? (type 'skip' to leave blank)"
Wait for reply.

### Step 5 — Add to master-plan.md

Add a new row to the appropriate section table in `docs/master-plan.md`. Use the Edit tool to insert at the end of the matching table.

Update the "Last updated" date in the master plan header to today's date.

Confirm: "Added: **[task name]** → [section] · [status] · [effort]"

### Step 6 — Offer stub planning doc

If status is `📋 Planning Pending`, ask using AskUserQuestion:

Question — "Create a stub planning doc for this task?"
- header: "Planning doc"
- options:
  - label: "Yes, create it", description: "Creates docs/<slug>/plan.md with Status, Created, and an open questions scaffold"
  - label: "No thanks", description: "Skip — you can create it later"

If yes: create `docs/<kebab-case-task-name>/plan.md` using this template:
```markdown
# [Task Name] — Planning Document

**Status:** 📋 Planning Pending
**Created:** [today's date]

---

## What This Is

[One paragraph describing the task.]

---

## Open Questions (must answer before dev starts)

1. 
2. 
3. 

---

## Next Step

Answer the open questions above, then update status to 🔲 Ready to Start.
```

---

## Subcommand: questions

Read every file listed under `📋 Planning Pending` tasks in `docs/master-plan.md` that has a sub-plan doc link. For each one, read the file and extract the "Open Questions" section.

Present all open questions grouped by task:

```
━━━ OPEN QUESTIONS — WHAT'S BLOCKING PLANNING ━━━━━━━━━━

📋 Admin Dashboard   (docs/admin-dashboard/plan.md)
   1. Who uses the admin dashboard — just you, or multiple operators?
   2. Where does config live — Supabase platform_config table or env vars?
   3. Real-time cost tracking or estimates only?
   4. What is the MVP scope?

📋 Platform Services   (docs/platform-services/plan.md)
   1. Hosting choice — Fly.io vs Railway vs always-on VPS?
   2. TTS API: return audio bytes or upload to R2?
   3. Worker polling interval or Supabase Realtime?
   4. Sequential or parallel workers?
   5. Compositor: monolithic or two-stage pipeline?
   6. Dev/local mode with docker-compose?

📋 Infographics   (docs/infographics/plan.md)
   1. Static image or explainer video first?
   ...

━━━ TOTAL: 15 open questions across 4 planning docs ━━━━

Answer any of these and run `/plan update <task> start` when a task is unblocked.
```

Only include tasks that are `📋 Planning Pending` and have a linked sub-plan doc. Skip tasks with no doc.

---

## Subcommand: check

Usage: `/plan check <task-name-fragment>`

Purpose: Pre-flight readiness check — verifies that everything needed to begin a task is actually in place before writing a single line of code. Covers prerequisites, credentials, files, and plan completeness.

### Step 0 — If no task name given

If $ARGUMENTS is just "check" with nothing after it, read `docs/master-plan.md` and find all tasks with status `🔲 Ready to Start`. Present them using AskUserQuestion:

Question — "Which task do you want to check?"
- header: "Task"
- multiSelect: false
- List up to 4 Ready to Start tasks as options (label = task name, description = effort + key note)
- User can select Other to type any task name

Then proceed with the selected task name.

### Step 1 — Find the task

Read `docs/master-plan.md`. Find the table row matching the task name fragment (case-insensitive partial match). If multiple rows match, list them and stop. If the task is `📋 Planning Pending`, skip to the Plan Readiness check — that is the only relevant check.

### Step 2 — Check prerequisites

From the task's Notes column, extract any dependency language ("After X", "Waiting on X", "needs X first", "After Phase N"). Find those referenced tasks in the master plan and verify each is `✅ Completed`. Report any that are not.

If no explicit dependencies are stated, cross-check against the Phase diagram in the master plan (the ASCII flow under "Development Phase Order") to see if the phase chain shows a prerequisite.

### Step 3 — Check env vars

Read the task's linked sub-plan doc. Scan for env var names — any word matching `ALL_CAPS_WITH_UNDERSCORES` that looks like a var name (especially in code blocks, env sections, or lines containing `=`). Collect a unique list.

Then run:
```bash
cat .env 2>/dev/null | grep -oE '^[A-Z_]+(?==)' | sort
```
Cross-reference: for each var the task needs, is it present and non-empty in `.env`?

If `.env` does not exist, report that as a blocker.

Also check if the task references Supabase secrets. If so, note: "Supabase secrets cannot be verified locally — confirm manually via `supabase secrets list`."

### Step 4 — Check key files

From the sub-plan doc, identify files that need to exist or be modified (look for file paths in code blocks, sentences like "Rewrite X", "Edit Y", "Read Z"). Run:
```bash
ls -la <file-path> 2>/dev/null && echo EXISTS || echo MISSING
```
for each key file. Report any that are MISSING.

### Step 5 — Check plan completeness

If the task has a linked sub-plan doc:
- Read the file and check its `**Status:**` line. If it is still `📋 Planning Pending`, the open questions block dev — list them.
- Scan for a section titled "Open Questions" or "open questions". If any questions are present and the status is not `🔲 Ready to Start` or better, list them as blockers.
- If a "Go / No-Go Checklist" section exists (with `- [ ]` items), show unchecked items as blockers.

### Step 6 — Report

Use this format:

```
━━━ PRE-FLIGHT: <Task Name> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PREREQUISITES
  ✅  No blocking prerequisites (first task in the chain)
  — or —
  ✅  fal.ai integration  →  ✅ Completed
  ❌  Monorepo setup      →  🔲 Ready to Start (not yet done)

CREDENTIALS & ENV VARS
  ✅  SUPABASE_URL        — present in .env
  ✅  ANTHROPIC_KEY       — present in .env
  ❌  FAL_KEY             — MISSING from .env
     → Add to .env: FAL_KEY=<your-fal-api-key>
     → Get key at: fal.ai → Account → API Keys
  ⚠️  FAL_KEY (Supabase)  — cannot verify locally
     → Confirm: supabase secrets list | grep FAL_KEY

FILES
  ✅  supabase/functions/generate-image/index.ts  — exists
  ❌  packages/ai/image-gen/fal.js               — does not exist yet (will be created)

PLAN READINESS
  ✅  Sub-plan: docs/image-generation/provider-decision.md
  ✅  Status: 🔲 Ready to Start
  ✅  No open questions blocking dev

━━━ VERDICT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ❌  NOT READY — 1 blocker:
      • FAL_KEY missing from .env

  Fix the blocker above, then run: /plan start <task>
```

If all checks pass:
```
  ✅  ALL CLEAR — run `/plan start <task>` to begin implementation
```

Use ✅ for pass, ❌ for blocker (must fix), ⚠️ for warning (should verify but not strictly blocking).

---

## Subcommand: start

Usage: `/plan start <task-name-fragment>`

Purpose: Runs the pre-flight check, marks the task as 🚧 In Progress, then executes the implementation steps. This is the action command — it does real work.

### Step 0 — If no task name given

If $ARGUMENTS is just "start" with nothing after it, read `docs/master-plan.md` and find all tasks with status `🔲 Ready to Start`. Present them using AskUserQuestion:

Question — "Which task do you want to start?"
- header: "Task"
- multiSelect: false
- List up to 4 Ready to Start tasks as options (label = task name, description = effort + key note)
- User can select Other to type any task name

Then proceed with the selected task name.

### Step 1 — Run pre-flight check (silently)

Execute all steps from the `check` subcommand. If any ❌ BLOCKER is found, show the full check report and stop — do not proceed. Tell the user: "Fix the blockers above and re-run `/plan start <task>`."

Warnings (⚠️) are acceptable — proceed with a note.

### Step 2 — Mark as In Progress

Update the task status in `docs/master-plan.md` to `🚧 In Progress` (same as `/plan update <task> wip`). Update any linked sub-plan doc `**Status:**` line too.

### Step 3 — Show the implementation plan

Read the sub-plan doc. Extract the implementation steps section (any section titled "Implementation Steps", "How it works", "Phase", or numbered step list). Present a numbered action plan:

```
━━━ STARTING: <Task Name> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status updated → 🚧 In Progress

IMPLEMENTATION STEPS
  1. Read supabase/functions/generate-image/index.ts
  2. Replace Cloudflare block with fal.ai as primary provider
  3. Move Cloudflare call into the catch block as fallback
  4. Add FAL_KEY reference to Supabase secrets
  5. Test: deploy edge function, trigger from dashboard

Estimated effort: ~2h
```

### Step 4 — Execute

For tasks where the implementation is code changes to existing files (the common case), proceed immediately:
- Read every file that needs to be modified
- Make the changes using the Edit tool
- Run any non-destructive setup commands (e.g. check if a package is installed)
- After each significant change, briefly confirm what was done

Do NOT ask for permission before each individual edit — the user triggered `/plan start` knowing it will make changes. Just do the work and report progress.

For tasks that involve infrastructure setup (creating new repos, Fly.io deployment, GitHub Actions changes) or are primarily a series of decisions rather than code edits, present the step plan and ask: "Shall I start with step 1?" before executing.

### Step 5 — Completion prompt

After all implementation steps are done (or after reaching a natural stopping point that requires user action like deploying or testing), report:

```
━━━ DONE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What was done:
  ✅ supabase/functions/generate-image/index.ts — fal.ai added as primary
  ✅ Cloudflare call moved to fallback (catch block)
  ✅ FAL_KEY referenced in edge function

Remaining manual steps:
  • supabase secrets set FAL_KEY=<your-key>
  • supabase functions deploy generate-image
  • Test from dashboard: click ✦ Generate on an article

When testing passes, run: /plan update fal.ai done
```
