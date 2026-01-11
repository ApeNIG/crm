# CRM Builder Agent System — Design Document

> **Purpose:** Define a human-in-the-loop multi-agent system for building the CRM MVP
> **Status:** Design exploration

---

## 1) Design Philosophy

### Human-in-the-Loop Principles

1. **Agents propose, humans approve** — No significant code merged without human review
2. **Checkpoints at natural boundaries** — Review after planning, after each feature, after security audit
3. **Transparency** — Human can see what each agent is doing and why
4. **Reversibility** — Easy to roll back or redirect at any checkpoint
5. **Progressive autonomy** — Start with more checkpoints, reduce as trust builds

### What This Is NOT

- Not a fully autonomous "let it run overnight" system
- Not agents talking to each other without visibility
- Not a replacement for understanding your own codebase

---

## 2) Agent Definitions

### 2.1) Orchestrator

**Role:** Central coordinator. Breaks down work, assigns tasks, tracks progress, surfaces decisions to human.

**Inputs:**
- Spec document (`crm-mvp-spec.md`)
- Current task queue
- Agent status reports
- Human directives

**Outputs:**
- Task assignments to agents
- Progress reports to human
- Checkpoint requests (approval needed)
- Blockers and decisions needing human input

**Tools:**
- Read/write task queue
- Read spec and codebase
- Invoke other agents
- Request human input

**Does NOT:**
- Write application code directly
- Make architectural decisions without approval
- Skip checkpoints

---

### 2.2) Planner

**Role:** Reads spec, analyzes requirements, creates detailed implementation plans for features.

**Inputs:**
- Feature request from Orchestrator
- Spec document
- Existing codebase (read-only)

**Outputs:**
- Implementation plan (files to create/modify, order of operations)
- Acceptance criteria (testable conditions)
- Estimated complexity (S/M/L)
- Dependencies on other features
- Questions/ambiguities for human

**Tools:**
- Read spec
- Read codebase (glob, grep, read files)
- Write plan documents

**Checkpoint:** Plan requires human approval before coding begins.

---

### 2.3) Frontend Dev

**Role:** Implements UI components, pages, forms, client-side logic.

**Inputs:**
- Approved implementation plan
- Design system / component library reference
- Existing codebase

**Outputs:**
- React components
- Pages and routes
- Form implementations
- Client-side state management
- Styling (Tailwind)

**Tools:**
- Read/write to `apps/web/src/`
- Access to shadcn/ui docs
- Run dev server
- Run linter

**Constraints:**
- Must follow existing patterns in codebase
- Must use approved component library
- No direct API calls outside designated data layer

---

### 2.4) Backend Dev

**Role:** Implements API routes, database operations, server-side logic.

**Inputs:**
- Approved implementation plan
- Data model from spec
- Existing codebase

**Outputs:**
- API route handlers
- Database schema (Prisma)
- Server actions
- Business logic functions
- Validation schemas (Zod)

**Tools:**
- Read/write to `apps/web/src/app/api/`, `prisma/`
- Run migrations
- Test API endpoints
- Access database (dev only)

**Constraints:**
- Must validate all inputs
- Must handle errors consistently
- No raw SQL (use Prisma)
- Must log significant operations

---

### 2.5) Tester

**Role:** Writes and runs tests, reports coverage, identifies gaps.

**Inputs:**
- Completed feature code
- Acceptance criteria from plan
- Existing test patterns

**Outputs:**
- Unit tests
- Integration tests
- Test coverage report
- List of untested edge cases
- Bug reports (if tests fail)

**Tools:**
- Read/write to `__tests__/`, `*.test.ts`
- Run test suite (Vitest)
- Generate coverage reports

**Checkpoint:** Tests must pass before feature considered complete.

---

### 2.6) Security Auditor

**Role:** Reviews code for vulnerabilities, auth issues, data exposure risks.

**Inputs:**
- Completed feature code
- Security checklist
- OWASP guidelines

**Outputs:**
- Security review report
- Vulnerabilities found (with severity)
- Recommended fixes
- Approval or rejection

**Tools:**
- Read codebase (no write)
- Static analysis tools (if available)
- Security checklist reference

**Checkpoint:** Security approval required before merge to main.

**Checks:**
- [ ] Authentication properly enforced
- [ ] Authorization checks on all protected routes
- [ ] Input validation (no injection risks)
- [ ] No secrets in code
- [ ] Sensitive data not logged
- [ ] CSRF protection in place
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak internals

---

### 2.7) Code Reviewer

**Role:** Reviews code quality, patterns, maintainability.

**Inputs:**
- Completed feature code
- Style guide
- Existing patterns

**Outputs:**
- Code review comments
- Suggested improvements
- Approval or request changes

**Tools:**
- Read codebase
- Git diff

**Checks:**
- [ ] Follows existing patterns
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] Readable and maintainable
- [ ] No dead code or TODOs left behind
- [ ] Types properly defined

---

### 2.8) DevOps (Phase 2)

**Role:** Handles deployment, CI/CD, infrastructure.

**Inputs:**
- Deployment requirements
- Environment config

**Outputs:**
- CI/CD pipeline config
- Dockerfile / docker-compose
- Environment variable templates
- Deployment scripts

**Tools:**
- Read/write to `.github/`, `infra/`, root config files
- Access to Vercel/hosting CLI

---

## 3) Workflow: Feature Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                         HUMAN                                    │
│  (approves at checkpoints, provides direction, resolves blocks) │
└─────────────────────────────────────────────────────────────────┘
         │                    ▲                    ▲
         ▼                    │                    │
┌─────────────────┐           │                    │
│   Orchestrator  │───────────┴────────────────────┘
└────────┬────────┘       (checkpoints)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. PLAN                                                   │
│   ┌──────────┐                                              │
│   │ Planner  │──► Implementation Plan ──► [CHECKPOINT 1]   │
│   └──────────┘                              Human approves  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   2. BUILD                                                  │
│   ┌──────────────┐    ┌─────────────┐                       │
│   │ Backend Dev  │    │ Frontend Dev│  (can run parallel)  │
│   └──────────────┘    └─────────────┘                       │
│          │                   │                              │
│          └─────────┬─────────┘                              │
│                    ▼                                        │
│              Feature Code                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   3. TEST                                                   │
│   ┌──────────┐                                              │
│   │  Tester  │──► Tests + Coverage ──► [CHECKPOINT 2]      │
│   └──────────┘                          Tests must pass     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   4. REVIEW                                                 │
│   ┌───────────────┐    ┌──────────────────┐                 │
│   │ Code Reviewer │    │ Security Auditor │  (parallel)    │
│   └───────────────┘    └──────────────────┘                 │
│          │                      │                           │
│          └──────────┬───────────┘                           │
│                     ▼                                       │
│            Review Reports ──► [CHECKPOINT 3]                │
│                                Human approves               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   5. MERGE                                                  │
│   Feature complete ──► Next feature                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4) Checkpoints (Human Approval Points)

### Checkpoint 1: Plan Approval

**When:** After Planner produces implementation plan, before any coding.

**Human sees:**
- Feature summary
- Files to be created/modified
- Acceptance criteria
- Complexity estimate
- Any questions from Planner

**Human can:**
- Approve → proceed to Build
- Request changes → Planner revises
- Reject → feature deprioritized
- Answer questions → Planner incorporates

---

### Checkpoint 2: Test Verification

**When:** After code written and tests run.

**Human sees:**
- Test results (pass/fail)
- Coverage report
- Any failing tests with details
- Edge cases not covered

**Human can:**
- Approve → proceed to Review
- Request more tests → Tester adds
- Request code fixes → Back to Build

---

### Checkpoint 3: Review Approval

**When:** After Code Review and Security Audit complete.

**Human sees:**
- Code review comments
- Security audit report
- Any vulnerabilities found
- Recommended changes

**Human can:**
- Approve → Merge feature
- Request fixes → Back to Build (with specific feedback)
- Reject → Feature needs rethinking

---

### Checkpoint 4: Release Approval (Phase 2)

**When:** Before deploying to production.

**Human sees:**
- All features in release
- Test summary
- Security sign-off
- Deployment plan

---

## 5) State Management

### Task Queue Structure

```typescript
interface Task {
  id: string;
  feature: string;           // e.g., "contact-database"
  phase: Phase;              // plan | build | test | review | done
  status: Status;            // pending | in_progress | blocked | complete
  assignedTo: AgentType[];   // which agents are working on it
  checkpoint: Checkpoint | null;  // waiting for human?

  plan?: {
    files: FileChange[];
    acceptanceCriteria: string[];
    complexity: 'S' | 'M' | 'L';
    approvedAt?: Date;
    approvedBy?: string;
  };

  build?: {
    filesCreated: string[];
    filesModified: string[];
    completedAt?: Date;
  };

  test?: {
    testFiles: string[];
    passed: boolean;
    coverage: number;
    completedAt?: Date;
  };

  review?: {
    codeReview: ReviewResult;
    securityAudit: ReviewResult;
    approvedAt?: Date;
  };

  blockers: Blocker[];
  history: HistoryEntry[];   // audit trail
}

type Phase = 'plan' | 'build' | 'test' | 'review' | 'done';
type Status = 'pending' | 'in_progress' | 'blocked' | 'checkpoint' | 'complete';
type AgentType = 'planner' | 'frontend' | 'backend' | 'tester' | 'security' | 'reviewer';

interface Checkpoint {
  type: 'plan_approval' | 'test_verification' | 'review_approval';
  requestedAt: Date;
  summary: string;
  details: any;
}

interface Blocker {
  id: string;
  description: string;
  needsHuman: boolean;
  raisedBy: AgentType;
  resolvedAt?: Date;
}
```

### State File Location

```
crm/
├── .agents/
│   ├── state.json          # Current task queue and status
│   ├── history.json        # Completed tasks archive
│   └── logs/
│       ├── orchestrator.log
│       ├── planner.log
│       └── ...
```

---

## 6) Communication Patterns

### Agent → Orchestrator

Agents report back via structured output:

```typescript
interface AgentReport {
  agent: AgentType;
  taskId: string;
  status: 'complete' | 'blocked' | 'needs_input';

  output?: {
    files?: string[];        // files created/modified
    artifacts?: string[];    // plans, reports, etc.
    summary: string;
  };

  blocker?: {
    reason: string;
    needsHuman: boolean;
    suggestion?: string;
  };

  questions?: string[];      // questions for human
}
```

### Orchestrator → Agent

Tasks assigned with full context:

```typescript
interface AgentTask {
  taskId: string;
  feature: string;
  instruction: string;

  context: {
    specSection?: string;    // relevant part of spec
    plan?: string;           // approved plan (for build phase)
    relatedFiles?: string[]; // files to reference
    previousFeedback?: string; // if revision requested
  };

  constraints: string[];     // rules to follow
  outputExpected: string;    // what to produce
}
```

### Human → Orchestrator

Human provides direction via simple commands:

```
approve <task-id>              # approve checkpoint
reject <task-id> <reason>      # reject with feedback
answer <task-id> <response>    # answer agent question
prioritize <feature>           # change priority
pause                          # stop all agents
resume                         # continue work
status                         # show current state
```

---

## 7) Feature Breakdown (From Spec)

Based on the CRM spec, here's how features would be queued:

### Foundation (must be first)
1. **Project Setup** — scaffold, dependencies, config
2. **Database Schema** — all tables from spec Section 6
3. **Auth System** — users, sessions, roles

### Core Features (in dependency order)
4. **Contact CRUD** — create, read, update, delete contacts
5. **Activity Timeline** — log events on contacts
6. **Enquiry Form** — public form + contact creation
7. **Enquiry Management** — inbox, detail view
8. **Pipeline Board** — kanban view, stage changes
9. **Service Types** — CRUD for services
10. **Booking System** — create, calendar, status
11. **Email Templates** — CRUD for templates
12. **Email Sending** — transactional emails via Resend
13. **Stripe Integration** — deposits, webhooks
14. **Automated Workflows** — triggers and actions
15. **Dashboard** — metrics and overview
16. **Settings Pages** — hours, stages, config

### Each feature follows the full lifecycle:
Plan → [Checkpoint] → Build → Test → [Checkpoint] → Review → [Checkpoint] → Done

---

## 8) Implementation Options

### Option A: Claude Agent SDK

Use Anthropic's Agent SDK to build the multi-agent system.

**Pros:**
- Native tool use and handoffs
- Built for this purpose
- Good observability

**Cons:**
- Requires SDK knowledge
- More complex setup

### Option B: Claude Code + Conventions

Use Claude Code itself as the runtime, with agents as "modes" or prompts.

**Pros:**
- You're already in Claude Code
- Simpler to start
- Human naturally in the loop

**Cons:**
- Less structured
- Manual orchestration

### Option C: Custom Scripts + Claude API

Build lightweight scripts that call Claude API for each agent role.

**Pros:**
- Full control
- Can run headless
- Easy to customize

**Cons:**
- More code to write
- Need to handle API directly

---

## 9) Suggested Starting Point

### Minimal Viable Agent System (MVAS)

Start with just 3 agents:

1. **Planner** — creates plans from spec
2. **Builder** — implements code (frontend + backend combined)
3. **Reviewer** — reviews code + basic security

**Orchestration:** Manual (you run each agent, approve between steps)

**Expand later:** Split Builder into Frontend/Backend, add dedicated Tester and Security agents.

### First Run

1. Orchestrator (you) picks feature: "Contact Database"
2. Run Planner agent → produces plan
3. You approve plan
4. Run Builder agent → produces code
5. You verify code works
6. Run Reviewer agent → produces review
7. You approve → feature done
8. Repeat for next feature

---

## 10) Open Questions

1. **Where to run agents?**
   - In Claude Code sessions?
   - As separate scripts?
   - Via Agent SDK?

2. **How much autonomy per phase?**
   - Should Builder be able to run tests itself?
   - Should Reviewer auto-fail on security issues?

3. **State persistence?**
   - JSON files in repo?
   - External store?
   - Git branches as state?

4. **How to handle failures?**
   - Agent produces bad code — who fixes?
   - Tests fail — back to Builder automatically?

5. **Parallelism?**
   - Can multiple features be in flight?
   - Can Frontend and Backend work simultaneously?

---

## Next Steps

1. **Decide on implementation approach** (A, B, or C above)
2. **Define agent prompts** — detailed system prompts for each agent
3. **Build orchestrator** — task queue management
4. **Create first agent** — start with Planner
5. **Test on one feature** — Contact Database
6. **Iterate** — refine based on results

---

*End of Design Document*
