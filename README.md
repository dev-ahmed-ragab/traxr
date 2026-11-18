# ⚡ Traxr

**High-velocity issue tracking and real-time execution for modern engineering teams.** Traxr is a keyboard-first, real-time issue tracker built in the spirit of Linear. Engineered with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase (Postgres, Row-Level Security, Realtime, and Storage).

* **🌐 Live Deployment:** [https://traxr.vercel.app](https://traxr.vercel.app)
* **💻 GitHub Repository:** [https://github.com/dev-ahmed-ragab/traxr](https://github.com/dev-ahmed-ragab/traxr)
* **👨‍💻 Author:** Ahmed Ragab ([@dev-ahmed-ragab](https://github.com/dev-ahmed-ragab))

---

## 🎯 Key Capabilities

- **Workspaces & Multitenancy**
  - Instant workspace setup with customizable subdomains/slugs.
  - Multi-tenant Row-Level Security (RLS) guaranteeing total tenant isolation.
  - Granular role-based access control (Admin, Member, Viewer).
- **High-Velocity Issue Management**
  - Per-team issue identifiers (`ENG-101`, `FRONT-42`) with customizable status workflows.
  - Rich-text editor powered by Tiptap v3 with Markdown shortcuts, mentions, and image uploads.
  - Relations (blocks, relates to, duplicates), sub-issues, and audit history.
- **Dynamic Kanban Boards & List Views**
  - Smooth drag-and-drop powered by `@dnd-kit`.
  - Grouping by status, assignee, priority, cycle, label, or project.
  - Multi-select, bulk status changes, and filter combinations.
- **Cycles & Sprints**
  - Time-boxed agile sprints with live progress tracking and automated Burn-up charts.
  - Automatic rollover of incomplete backlog items.
- **Command Palette (`⌘K`) & Keyboard Navigation**
  - Global shortcuts: `C` to create, `/` to search, `G` + navigation keys.
  - Issue shortcuts: `S` for status, `P` for priority, `A` for assignee, `L` for labels.
- **Real-Time Sync Engine & Offline Snapshot**
  - Optimistic UI updates with instant state synchronization via Supabase Realtime (`postgres_changes`).
  - IndexedDB local caching for instant cold loads and zero latency.
- **Dual-Theme Design System**
  - Refined Light & Dark themes built on precision HSL tokens, fully responsive across desktop, tablet, and mobile.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js (App Router) + React 18 / 19, TypeScript strict |
| **Styling & UI** | Tailwind CSS, Lucide Icons, `@dnd-kit`, Radix UI Primitives |
| **State & Sync** | Zustand, IndexedDB (`idb-keyval`), Supabase Realtime |
| **Database & Auth** | Supabase Postgres (Multi-tenant RLS, Triggers, RPCs), `@supabase/ssr` |
| **Editor** | Tiptap v3 |
| **Command Menu** | `cmdk` |
| **Testing Engine** | `@electric-sql/pglite` (174 multi-tenant database & RLS assertions) |

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js `^20.0.0` or `^22.0.0`
- npm or pnpm

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/dev-ahmed-ragab/traxr.git
cd traxr

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run database tests (in-memory Postgres via PGlite)
npm run db:test

# Start the development server
npm run dev
```

Visit [http://localhost:3456](http://localhost:3456) in your browser.

---

## 👨‍💻 Author

**Ahmed Ragab**  
*Full Stack & Frontend Software Engineer (Next.js / TypeScript / React / B2B SaaS)*  
- **GitHub:** [@dev-ahmed-ragab](https://github.com/dev-ahmed-ragab)  
- **LinkedIn:** [Ahmed Ragab](https://linkedin.com/in/ahmedragab)  
- **Portfolio:** [iqraa.live](https://iqraa.live)  
- **Email:** `ahmedragab.pro@outlook.com`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
