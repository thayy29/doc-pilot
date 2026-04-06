# DocPilot 🚀

> **AI-Powered Document Analysis Platform** - Analyze documents with Claude, powered by RAG

[![Status](https://img.shields.io/badge/status-MVP-yellow?style=flat-square)](https://github.com)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square&logo=node.js)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## ✨ Features

### Core Capabilities

- 📄 **Multi-format Document Support** - PDF, DOCX, TXT with intelligent parsing
- 🤖 **AI-Powered Analysis** - Claude 3.5 Sonnet for natural language understanding
- 🔍 **RAG (Retrieval-Augmented Generation)** - Accurate answers based on document context
- ⚡ **Real-time Streaming** - SSE streaming for live response tokens
- 🔐 **Secure Authentication** - OAuth 2.0 (GitHub, Google) with Auth.js v5
- 📊 **Vector Embeddings** - pgvector with HNSW indexing for semantic search
- 💾 **Persistent Storage** - PostgreSQL + Vercel Blob for reliability
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- 🎨 **Modern UI** - Shadcn/ui + Tailwind CSS 4

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                           │
├─────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript  │  TanStack Query  │  Auth.js v5   │
├─────────────────────────────────────────────────────────────┤
│              Next.js 16 Route Handlers (BFF)                │
│     /api/auth   /api/documents   /api/chat   /api/users    │
├─────────────────────────────────────────────────────────────┤
│         Backend Services (Node.js + LangChain.js)          │
│  RAG Service  │  Document Processor  │  Chat Service       │
├─────────────────────────────────────────────────────────────┤
│           PostgreSQL 15+ + pgvector + Prisma ORM           │
├─────────────────────────────────────────────────────────────┤
│    Claude API  │  OpenAI Embeddings  │  OAuth Providers    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **PostgreSQL** 15+ (local or cloud)
- **Git**

### Installation (5 minutes)

1. **Clone the repository**

```bash
git clone https://github.com/seu-usuario/docpilot.git
cd docpilot
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/docpilot"

# Authentication
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"

# AI Services
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

4. **Setup database**

```bash
# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

5. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📖 Usage

### For Users

1. **Sign in** via GitHub or Google OAuth
2. **Upload document** (PDF, DOCX, or TXT)
3. **Ask questions** about the document
4. **Get AI-powered answers** with context from your documents
5. **View history** of all conversations

### For Developers

#### Upload & Process Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -F "file=@document.pdf" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Chat with Context

```bash
curl -X POST http://localhost:3000/api/chat/stream \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sessionId": "uuid",
    "documentId": "uuid",
    "query": "What is this document about?"
  }'
```

<!-- Full API docs: [API_DOCUMENTATION.md](./docs/API.md) -->

---

## 🛠️ Tech Stack

| Layer                | Technology                      | Version     |
| -------------------- | ------------------------------- | ----------- |
| **Frontend**         | React, TypeScript, Tailwind CSS | 19, 5, 4    |
| **Framework**        | Next.js                         | 16          |
| **State Management** | TanStack Query, Zustand         | 5, Latest   |
| **Authentication**   | Auth.js (NextAuth)              | 5           |
| **UI Components**    | Shadcn/ui, Lucide Icons         | Latest      |
| **Backend**          | Node.js, LangChain.js           | 18+, Latest |
| **Database**         | PostgreSQL, pgvector            | 15+, Latest |
| **ORM**              | Prisma                          | 5           |
| **Vector Search**    | pgvector (HNSW)                 | Latest      |
| **Caching**          | Redis                           | Latest      |
| **File Storage**     | Vercel Blob                     | Latest      |
| **AI**               | Claude API, OpenAI API          | Latest      |
| **Deployment**       | Vercel                          | Latest      |
| **CI/CD**            | GitHub Actions                  | Latest      |

---

## 📁 Project Structure

```
docpilot/
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes
│   ├── (dashboard)/              # Protected routes
│   │   ├── page.tsx             # Dashboard home
│   │   ├── documents/           # Document management
│   │   └── chat/[id]/           # Chat interface
│   ├── api/                     # API routes (BFF)
│   │   ├── auth/               # Authentication
│   │   ├── documents/          # Document operations
│   │   ├── chat/               # Chat endpoints
│   │   └── users/              # User management
│   └── layout.tsx              # Root layout
├── components/                   # React components
│   ├── ui/                      # Shadcn components
│   ├── layout/                  # Layout components
│   ├── documents/               # Document-related
│   └── chat/                    # Chat-related
├── lib/                         # Utilities & services
│   ├── auth.ts                 # Auth configuration
│   ├── db.ts                   # Prisma client
│   ├── ai/                     # AI services
│   │   ├── claude.ts          # Claude API wrapper
│   │   ├── embeddings.ts      # Embedding service
│   │   └── rag.ts             # RAG pipeline
│   └── utils/                  # Helper functions
├── prisma/                      # Database schema
│   └── schema.prisma           # Data models
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── API.md                  # API documentation
│   ├── SETUP.md                # Setup guide
│   └── CONTRIBUTING.md         # Contributing guide
├── .env.example                 # Environment template
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
└── README.md                   # This file
```

---

## 🔑 Key Features Explained

### RAG Pipeline (Retrieval-Augmented Generation)

**Phase 1: Ingestion**

```
Upload → Parse → Chunk (512 tokens) → Generate Embeddings → Store in pgvector
```

**Phase 2: Query**

```
Question → Embed Query → ANN Search (pgvector) → Retrieve Context → Claude Generate → Stream Response
```

### Authentication Flow

- OAuth 2.0 with GitHub & Google
- JWT tokens in httpOnly cookies (secure)
- Auto session refresh
- Role-based access control (RBAC)

### Data Security

- ✅ Encrypted passwords (bcrypt)
- ✅ HTTPS only (production)
- ✅ CSRF protection
- ✅ Rate limiting per user
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma)

---

## 📚 Documentation

| Document                                  | Purpose                      |
| ----------------------------------------- | ---------------------------- |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design & components   |
| [API.md](./docs/API.md)                   | REST API endpoints           |
| [SETUP.md](./docs/SETUP.md)               | Detailed setup guide         |
| [DATABASE.md](./docs/DATABASE.md)         | Database schema & migrations |
| [CONTRIBUTING.md](./docs/CONTRIBUTING.md) | How to contribute            |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md)     | Vercel deployment guide      |

---

## 🚀 Getting Started Development

### Run Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Build for Production

```bash
# Development
npm run dev

# Production build
npm run build
npm run start
```

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Code of conduct
- How to submit PRs
- Commit message conventions
- Code style guidelines

**Quick PR checklist:**

- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console errors/warnings

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes & commit
git add .
git commit -m "feat: add amazing feature"

# Push & create PR
git push origin feature/your-feature
```

---

## 📊 Performance Metrics

| Metric                   | Target       | Status |
| ------------------------ | ------------ | ------ |
| **Page Load Time**       | < 2s         | ✅     |
| **Time to Interactive**  | < 3s         | ✅     |
| **API Response Time**    | < 200ms      | ✅     |
| **Embedding Generation** | < 5s per doc | ✅     |
| **Uptime**               | 99.9%        | 🔄     |

Monitor live metrics: [Vercel Analytics](https://vercel.com/analytics)

---

## 🗺️ Product Roadmap

### MVP (Q2 2026) ✅

- [x] Document upload & parsing
- [x] RAG-based Q&A
- [x] User authentication
- [x] Chat interface
- [ ] Deployment

### V1.1 (Q3 2026)

- [ ] Multiple document analysis
- [ ] Collaborative features
- [ ] Advanced search filters
- [ ] Export results

### V2.0 (Q4 2026)

- [ ] Multi-language support
- [ ] Custom AI models
- [ ] API for third parties
- [ ] Mobile app (React Native)

---

## 🆘 Support & Community

- **Documentation**: [Read the docs](./docs)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/docpilot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/seu-usuario/docpilot/discussions)
- **Email**: contato@docpilot.com
- **Twitter**: [@docpilot](https://twitter.com/docpilot)

---

## 📝 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Claude](https://claude.ai) - AI model powering analysis
- [Next.js](https://nextjs.org) - React framework
- [Shadcn/ui](https://ui.shadcn.com) - UI components
- [Prisma](https://prisma.io) - Database ORM
- [LangChain](https://langchain.com) - LLM framework

---

## 📈 Project Stats

```
Languages     Files      Lines
─────────────────────────────────
TypeScript    450        ~45,000
CSS           120        ~8,000
Markdown      20         ~2,000
SQL           50         ~3,000
─────────────────────────────────
```

---

<div align="center">

**[⬆ back to top](#docpilot-)**

Made with ❤️ by [Your Name/Team](https://github.com/thayy29)

</div>
