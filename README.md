# Storefront — The Zero-Ops E-Commerce Builder

An agentic storefront builder: a merchant has one conversation describing their
business, and the platform generates their store, homepage copy, and first ad
campaigns automatically.

## Structure

```
apps/web/               Next.js 14 app (frontend + API routes)
  app/onboarding/        Intake chat UI
  app/dashboard/          Single-screen store dashboard
  app/api/intake/         Conversational intake agent endpoint
  app/api/agents/generate/  Homepage copy + campaign generation endpoint
packages/agents/src/     Agent logic, framework-agnostic
  intakeAgent.ts          Runs the onboarding conversation, extracts structured context
  generationAgent.ts      Turns completed context into homepage copy + ad variants
  optimizeAgent.ts        v1 rules-based pricing/conversion experiment evaluator
prisma/schema.prisma     Data model: MerchantContext, Store, Product, Campaign, etc.
```

## Why this shape

- **Intake is conversational, not a form.** `intakeAgent.ts` drives a short chat and
  extracts structured fields via a tool call after every turn, so context is saved
  incrementally and the flow can be resumed.
- **Generation is a separate agent** from intake, triggered once `intakeComplete` is
  true, so it can be re-run independently (e.g. "regenerate my homepage copy") without
  re-running the conversation.
- **The optimizer is deliberately simple in v1** (`optimizeAgent.ts`): explainable
  A/B rules with a minimum-sample-size guard, not a live learning loop. This is the
  highest-risk feature to fake convincingly, so it's built to be real but modest, with
  a clean seam to swap in a learned policy later without changing callers or schema.

## Local setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and ANTHROPIC_API_KEY
npm run db:push        # sync Prisma schema to your Postgres instance
npm run dev
```

Visit `http://localhost:3000` → "Start building" runs the intake chat at `/onboarding`,
then `/dashboard` shows the generated store.

## Pushing to GitHub

This folder is already a git repo. To push it to a new GitHub repo:

```bash
git add -A
git commit -m "Initial scaffold: intake agent, generation agent, dashboard"
gh repo create storefront --private --source=. --remote=origin --push
```

(Or without the `gh` CLI: create an empty repo on GitHub, then
`git remote add origin <your-repo-url> && git push -u origin main`.)

**On the token you shared earlier:** revoke it at github.com/settings/tokens before
pushing — treat any token that's been pasted into a chat as compromised, generate a
fresh one, and use `gh auth login` or a credential manager rather than a raw PAT in
your shell history.

## Roadmap (matches the MoSCoW in the deck)

- [x] Single-screen builder shell + conversational intake (Must-have)
- [x] Auto-generated homepage copy + campaign drafts (Must-have)
- [ ] Marketing ad creative image generation (Must-have) — wire an image model into `generationAgent.ts`
- [ ] Real-time conversion/pricing optimization (Should-have) — upgrade `optimizeAgent.ts` from rules to a learned policy
- [ ] Inventory management integration (Should-have)
- [ ] Manual override / editing UI (Could-have)
- [ ] Social proof / review automation (Could-have)
- [ ] Legal/policy page auto-generation (not in original MoSCoW — recommended addition, low lift, removes a real launch blocker)
