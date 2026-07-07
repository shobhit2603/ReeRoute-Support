# AI Usage Report

## Overview

This document explains how AI tools were used both **inside the product** (runtime AI features) and **during development** (AI-assisted engineering). It showcases my AI-driven development workflow, thought process, and the decisions that remained human-driven.

---

## AI Tools Used

### In the Product (Runtime AI)
- **Mistral AI** (`mistral-medium-latest` model) via the `@mistralai/mistralai` SDK
  - Powers all 6 AI features: summarization, suggested replies, sentiment analysis, categorization, similar ticket discovery, and escalation recommendations

### In Development (AI-Assisted Engineering)

| Tool | Role | Phase |
|------|------|-------|
| **ChatGPT** | Research & ideation — brainstorming product decisions, understanding assignment requirements, exploring approaches | Research & Planning |
| **Gemini** | Research & learning — studying tech stack options, database design patterns, AI integration approaches | Research & Planning |
| **Antigravity (Gemini IDE Agent)** | Primary coding partner — architecture review, full-stack implementation, bug detection, code optimization, documentation | Implementation & Polish |

---

## My Development Process & Thought Process

### Phase 1: Research & Understanding (ChatGPT + Gemini)

I started by deeply understanding the assignment requirements. Rather than jumping into code, I used ChatGPT and Gemini to research and learn:

**What I researched:**
- Customer support dashboard best practices and UX patterns
- How AI is used in real support tools (Zendesk, Intercom, Freshdesk)
- Which AI capabilities would have the highest impact for support agents
- Database schema design for ticket systems with conversation history
- Best practices for integrating LLMs into backend services

**Example research prompts I used:**

```
"What are the most common AI features in modern customer support platforms, 
and which ones have the highest impact on agent productivity?"
```

```
"I'm building a support ticket system with MongoDB. Should I embed messages 
inside the ticket document or use a separate collection? What are the 
tradeoffs for each approach?"
```

```
"What's the best way to structure prompts for an LLM to get consistent, 
parseable output for ticket categorization with confidence scores?"
```

These research conversations helped me make informed decisions before writing a single line of code.

### Phase 2: MVP Design & Architecture Decisions

After research, I made these key architectural decisions (human-driven, informed by AI research):

1. **Tech Stack Selection:**
   - **Next.js 16** for the frontend (SSR, App Router, great DX)
   - **Express 5** for the backend (mature, flexible, layered architecture)
   - **MongoDB** over PostgreSQL (tickets have variable shapes — tags, notes, metadata)
   - **Mistral AI** over OpenAI (cost-effective, good quality for structured outputs)

2. **Database Design:**
   - Separate `Tickets` and `Messages` collections (avoid 16MB document limit)
   - Embedded `activityLog` and `internalNotes` (small, bounded arrays)
   - Strategic indexing (7 indexes across 2 collections)

3. **Architecture Pattern:**
   - Layered monolithic: Routes → Controllers → Services → DAOs
   - Clear separation of concerns — each layer has a single responsibility
   - AI as a service layer, not embedded in controllers

4. **Folder Structure:**
   - Created a clean, scalable folder structure before starting implementation
   - Installed all packages upfront based on my design decisions

### Phase 3: AI-Driven Implementation (Antigravity)

This is where AI-assisted development became my primary workflow. I used Antigravity (Gemini IDE agent) as my pair programming partner with a structured, plan-first approach.

**My workflow with Antigravity:**

1. **Plan First** — I gave Antigravity detailed context about what I wanted to build, let it create a plan, reviewed and approved it
2. **Iterative Building** — Built features incrementally: models → DAOs → services → controllers → routes → frontend
3. **Review & Refine** — After each major feature, I reviewed the code, asked for improvements, and iterated

**Example prompts that were effective:**

```
"Build the backend API for a customer support dashboard. Use Express 5 
with a layered architecture (routes → controllers → services → DAOs). 
The database is MongoDB with Mongoose. Include ticket CRUD, message 
management, internal notes, and AI features (summarization, sentiment 
analysis, categorization, suggested replies, similar tickets, escalation)."
```

```
"Create the frontend dashboard with Next.js and TailwindCSS. It should 
have a split-panel layout — ticket inbox on the left, ticket detail on 
the right. Include an AI assistance panel with tabs for summary, 
escalation advisor, and similar cases. Use a dark theme with 
glassmorphism styling."
```

```
"Review my entire codebase for bugs, deployment readiness, and code 
quality. Fix any issues and make it ready for Vercel + Render deployment."
```

**Why this approach worked:**
- Providing clear architectural constraints upfront (layered architecture, specific patterns) prevented the AI from making arbitrary design decisions
- Breaking work into phases (backend first, then frontend) kept the context focused
- Reviewing AI output before moving to the next phase caught issues early

### Phase 4: Quality Assurance & Deployment Prep

The final review phase with Antigravity was critical. It identified:
- **6 data path bugs** in the frontend where AI feature responses weren't being read correctly
- **CORS misconfiguration** that would have blocked all API calls in production
- **Missing environment variable validation** for the `FRONTEND_URL`
- **Search performance issue** (no debouncing on search input)
- **Deployment gaps** (missing `.env.example` files, missing `engines` in package.json)

These bugs would have been very hard to catch manually because they only manifest when AI features are actually triggered, and the code doesn't throw errors — it just silently fails to display data.

---

## Where AI Helped Significantly

### 1. Cognitive Load Reduction (In the Product)
The summarization feature eliminates the need for agents to read 20+ message threads. A ticket with 5 messages produces a summary in ~1 second that captures the essential context.

### 2. Consistent Tone in Replies (In the Product)
AI-suggested replies maintain a professional, empathetic tone consistently — something that's hard for human agents under pressure. The suggestions serve as a starting point that agents can personalize.

### 3. Proactive Sentiment Monitoring (In the Product)
Auto-analyzing sentiment on every customer message means frustrated customers are surfaced before an agent explicitly checks. Combined with negative-sentiment filtering, this enables proactive intervention.

### 4. Development Velocity (In Development)
AI-assisted coding dramatically accelerated the development cycle:
- Comprehensive seed data (100 tickets with realistic conversations) that would have taken hours to write manually
- Consistent code style and patterns across the entire codebase
- Documentation co-authored with AI assistance, including architecture diagrams
- Bug detection during the review phase caught issues that would have required debugging later

### 5. Architecture Validation (In Development)
Using AI to review the architecture pattern (layered monolithic with DAO pattern) against best practices confirmed the design decisions and identified missing patterns like the `asyncHandler` wrapper and proper graceful shutdown.

---

## Where AI Produced Poor Results

### 1. Vague Customer Messages (Product)
When a customer sends a short, context-free message like "it's broken" or "help", the AI's suggested replies are generic ("I'm sorry to hear that. Could you provide more details?"). While safe, this lacks the personal touch a human agent could provide by checking order history or account context.

### 2. Similar Ticket Matching (Product)
Finding similar tickets by comparing only titles and categories has limited accuracy. Without embeddings or vector search, the AI relies on surface-level text comparison, which can miss semantically similar but differently worded tickets.

### 3. Confidence Calibration (Product)
The AI's self-reported confidence scores (0-1) are not well-calibrated. An AI might report 0.9 confidence for a categorization that's actually wrong. This is why the product design treats confidence scores as advisory rather than authoritative.

### 4. Edge Cases in Sentiment (Product)
Sarcasm, mixed-sentiment messages ("Your product is great but the shipping was terrible"), and non-English text cause unreliable sentiment classifications. The current fallback to "neutral" is safe but not informative.

### 5. Initial Code Generation (Development)
AI-generated code occasionally had subtle data path issues (reading `response.suggestedReply` instead of `response.data.suggestedReply`) that didn't cause errors but silently broke features. This reinforces the importance of the **review phase** in AI-driven development.

---

## Decisions That Remained Human-Driven

| Decision Area | Why It Stays Human |
|---|---|
| **Product Feature Selection** | Choosing which 6 AI features to implement (and which to exclude) required understanding the assignment's evaluation criteria and user workflow priorities |
| **Tech Stack Selection** | MongoDB vs PostgreSQL, Express vs NestJS, Mistral vs OpenAI — these decisions required weighing cost, complexity, and project constraints |
| **Database Schema Design** | Whether to embed messages or use separate collections required understanding MongoDB's document size limits and read/write performance tradeoffs |
| **Architecture Pattern** | The layered monolithic pattern (Routes → Controllers → Services → DAOs) was a deliberate human decision about code organization and testability |
| **AI Prompt Engineering** | Crafting structured output prompts (CATEGORY: \<value\> / CONFIDENCE: \<score\>) required understanding LLM behavior and parser reliability |
| **Security Decisions** | Rate limiting thresholds (20 req/min for AI, 200/15min for general), CORS policy, and error exposure levels were all human decisions |
| **Final Ticket Resolution** | AI summarizes and suggests, but closing a ticket is an explicit human action with accountability |
| **Escalation Execution** | Auto-escalation only triggers with strict guards (high urgency + negative sentiment). All other escalations require human judgment |
| **UX/UI Design** | The split-panel layout, dark theme with glassmorphism, badge color system, and activity timeline design were human design decisions |

---

## Example Prompts That Were Effective (Prompt Engineering in the Product)

### 1. Ticket Summarization
```text
You are a customer support analyst. Summarize the following support ticket 
conversation in 2-3 concise sentences. Focus on the core issue, what has been 
done so far, and the current status.

Conversation:
CUSTOMER: I was charged twice for order #ORD-2847...
AGENT: I can confirm there was a duplicate charge...
```
**Why it works:** Clear role assignment ("support analyst"), explicit length constraint ("2-3 sentences"), and structured focus areas ("core issue, what has been done, current status") prevent verbose, unfocused summaries.

### 2. Sentiment Analysis
```text
Analyze the sentiment of the following customer support messages. Classify 
the overall sentiment as exactly one of: positive, neutral, negative.

Respond with ONLY one word.
```
**Why it works:** The "ONLY one word" instruction combined with a closed set of options makes the output deterministic and trivially parseable. The code also includes fallback logic to extract sentiment from longer responses.

### 3. Issue Categorization
```text
Respond in EXACTLY this format (nothing else):
CATEGORY: <category>
CONFIDENCE: <score>
```
**Why it works:** Explicit formatting instructions with placeholder examples produce consistently structured output. Adding "nothing else" prevents explanatory text that would break parsing.

### 4. Escalation Recommendation
```text
Consider escalation if:
- Customer is frustrated or angry
- Issue has been unresolved for many messages
- Issue involves financial loss, security, or data concerns
- Priority is high/urgent with negative sentiment

Respond in EXACTLY this format:
ESCALATE: YES or NO
URGENCY: low, medium, or high
REASON: <one sentence explanation>
```
**Why it works:** Providing explicit escalation criteria gives the AI a decision framework rather than relying on its own judgment. The structured output with reasoning enables transparency.

---

## Key Takeaway: How I Think About AI-Driven Development

My approach to using AI in development follows this philosophy:

1. **Research first, code second** — Use AI for learning and understanding before implementation
2. **Human designs, AI implements** — I make the architectural and product decisions; AI accelerates the coding
3. **Plan → Build → Review** — Every AI-generated code goes through a review cycle before being accepted
4. **AI as copilot, not autopilot** — Both in the product (agents approve AI suggestions) and in development (I approve AI-generated code)
5. **Know what AI can't do** — Recognize where AI produces poor results and design fallbacks accordingly
