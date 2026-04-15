# 🚀 DocPilot Backend - Setup Guide

Guia completo para configurar o backend do DocPilot em ambiente local.

## ✅ O que foi implementado

### 1. **Arquitetura Limpa**

- ✅ **Repositories**: Camada de acesso a dados (ProjectRepository, DocumentRepository, ChatRepository, EmbeddingRepository)
- ✅ **Services**: Lógica de negócio com validações (ProjectService, DocumentService, ChatService)
- ✅ **API Routes**: 14 endpoints RESTful com tratamento de erros
- ✅ **Validações**: Schemas Zod para todas as entidades
- ✅ **Tratamento de Erros**: Hierarquia de AppError com status HTTP apropriados

### 2. **Processamento Assíncrono**

- ✅ **Worker Standalone**: Processo Node.js isolado para documentos (`scripts/worker.ts`)
- ✅ **BullMQ Queue**: Fila de processamento com Redis backend
- ✅ **Chunking**: Algoritmo inteligente com fallback por parágrafos/sentenças
- ✅ **Embeddings**: Integração com OpenAI (text-embedding-3-small)
- ✅ **pgvector**: Armazenamento vetorial de embeddings no PostgreSQL

### 3. **Infraestrutura**

- ✅ **Database**: PostgreSQL com Prisma ORM + pgvector extension
- ✅ **Authentication**: Auth.js v5 com OAuth (GitHub, Google)
- ✅ **Health Checks**: Endpoints para validação de saúde do sistema
- ✅ **Rate Limiting**: Middleware simples de controle de taxa
- ✅ **Lazy Initialization**: OpenAI client e BullMQ queue carregadas sob demanda

### 4. **Desenvolvimento**

- ✅ **Environment Documentation**: `.env.example` com todas as variáveis necessárias
- ✅ **Seed Script**: `prisma/seed.ts` com dados de desenvolvimento
- ✅ **Database Scripts**: `db:migrate`, `db:seed`, `db:reset` no package.json
- ✅ **Worker Scripts**: `worker`, `worker:dev` para processamento assíncrono

---

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

1. **Node.js 20+** - https://nodejs.org/
2. **PostgreSQL 15+** com extensão pgvector - https://pgvector.io/
3. **Redis 6+** - https://redis.io/ (ou use Docker: `docker run -d -p 6379:6379 redis:latest`)
4. **OpenAI API Key** - https://platform.openai.com/api-keys

---

## 🔧 Passo 1: Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Gerar NEXTAUTH_SECRET
openssl rand -base64 32
# (Copiar saída para NEXTAUTH_SECRET no .env)
```

**Editar `.env` com:**

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/docpilot?schema=public"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui-gerado-acima"

# OAuth (opcional - configure em GitHub/Google OAuth apps)
GITHUB_ID="seu-github-oauth-id"
GITHUB_SECRET="seu-github-oauth-secret"
GOOGLE_ID="seu-google-oauth-id"
GOOGLE_SECRET="seu-google-oauth-secret"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
OPENAI_EMBEDDING_DIMENSIONS="1536"

# Redis
REDIS_URL="redis://localhost:6379"

# Observabilidade (opcional)
LOG_LEVEL="debug"
ENABLE_COST_TRACKING="false"
```

---

## 🗄️ Passo 2: Configurar Database

### 2.1 Criar Database PostgreSQL

```bash
# Via psql
createdb docpilot

# Verificar pgvector (pode precisar instalar extensão)
psql docpilot -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

### 2.2 Aplicar Migrations

```bash
npm run db:migrate
```

Output esperado:

```
Applying migration `20260415000000_enable_pgvector`
✓ Creating pgvector extension
✓ Updating schema with vector support
```

### 2.3 Popular com Dados de Teste

```bash
npm run db:seed
```

Output esperado:

```
🌱 Seeding database...
✓ User: dev@docpilot.local
✓ Project: Example Project
✓ Documents: 3
✓ Chunks: 12
✓ Chat session: Demo
Database seeded! 🎉
```

---

## 🚀 Passo 3: Iniciar Serviços

### 3.1 Iniciar Redis (se não estiver rodando)

```bash
# Opção 1: Docker
docker run -d -p 6379:6379 redis:latest

# Opção 2: Redis nativo
redis-server
```

### 3.2 Iniciar Next.js Dev Server

```bash
npm run dev
```

Acesse em: http://localhost:3000

### 3.3 Validar Health Checks

Em outro terminal:

```bash
# Sistema geral
curl http://localhost:3000/api/health

# Database
curl http://localhost:3000/api/health/db
```

Resposta esperada:

```json
{
  "status": "healthy",
  "timestamp": "2025-04-15T10:30:00Z",
  "uptime": "00:05:23",
  "database": {
    "connected": true,
    "latency_ms": 2
  }
}
```

---

## ⚙️ Passo 4: Iniciar Document Worker

Em novo terminal:

```bash
npm run worker
```

Output esperado:

```
🚀 DocPilot Worker iniciado!
   Redis: redis://localhost:6379
   Modelo: text-embedding-3-small (1536d)
   Concurrency: 2
   Status: Aguardando jobs...
```

Worker estará pronto para processar documentos!

---

## 📚 Passo 5: Testar API

### 5.1 Criar um Projeto

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Meu Projeto","description":"Teste"}'
```

### 5.2 Criar um Documento

```bash
curl -X POST http://localhost:3000/api/projects/{projectId}/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Documento Teste",
    "content":"Este é um documento de teste com informações importantes.",
    "source":"manual"
  }'
```

### 5.3 Processar Documento (Enfileirar)

```bash
curl -X POST http://localhost:3000/api/documents/process \
  -H "Content-Type: application/json" \
  -d '{"documentId":"{docId}"}'
```

Worker receberá o job e processará!

### 5.4 Buscar com Semântica

```bash
curl -X POST http://localhost:3000/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{"query":"informações importantes","limit":5}'
```

---

## 🧪 Scripts Úteis

| Comando              | Descrição                        |
| -------------------- | -------------------------------- |
| `npm run dev`        | Iniciar dev server               |
| `npm run build`      | Build production                 |
| `npm run start`      | Iniciar production server        |
| `npm run db:migrate` | Aplicar migrations pending       |
| `npm run db:seed`    | Popular com dados teste          |
| `npm run db:reset`   | Reset completo (⚠️ deleta dados) |
| `npm run worker`     | Iniciar worker production        |
| `npm run worker:dev` | Iniciar worker com watch         |

---

## 🐛 Troubleshooting

### ❌ `ECONNREFUSED` em Redis

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solução**: Verificar se Redis está rodando

```bash
redis-cli ping  # Deve responder: PONG
```

### ❌ `relation "User" does not exist`

**Solução**: Rodar migrations

```bash
npm run db:migrate
```

### ❌ `OPENAI_API_KEY` não configurada

**Solução**: Verificar arquivo `.env` e adicionar chave

```bash
# Gerar chave em https://platform.openai.com/api-keys
echo "OPENAI_API_KEY=sk-..." >> .env
```

### ❌ Worker não processa documentos

**Solução**: Verificar BullMQ

```bash
# Ver fila (usando Redis CLI)
redis-cli

> KEYS documents:*
> HGETALL documents:jobs
```

---

## 📊 API Endpoints

### Projetos

- `GET /api/projects` - Listar meus projetos
- `POST /api/projects` - Criar projeto
- `GET /api/projects/{id}` - Detalhes do projeto
- `PATCH /api/projects/{id}` - Atualizar projeto
- `DELETE /api/projects/{id}` - Deletar projeto

### Documentos

- `GET /api/projects/{id}/documents` - Listar documentos
- `POST /api/projects/{id}/documents` - Upload documento
- `GET /api/projects/{id}/documents/{docId}` - Detalhes
- `DELETE /api/projects/{id}/documents/{docId}` - Deletar
- `POST /api/documents/search` - Busca semântica
- `POST /api/documents/process` - Enfileirar processamento

### Chat

- `GET /api/chat/sessions` - Listar sessões
- `POST /api/chat/sessions` - Criar sessão
- `GET /api/chat/sessions/{id}` - Detalhes sessão
- `DELETE /api/chat/sessions/{id}` - Deletar sessão
- `GET /api/chat/sessions/{id}/messages` - Mensagens
- `POST /api/chat/sessions/{id}/messages` - Nova mensagem

### Saúde

- `GET /api/health` - Status geral
- `GET /api/health/db` - Status database

---

## 🎯 Próximos Passos

1. **Chat RAG com Streaming** ← MVP Priority 1
   - Implementar `/api/chat/stream` com Vercel AI SDK
   - Integrar RAG: query → embedding → search → context → Claude
   - Build UI com real-time streaming

2. **Upload Real de Arquivos**
   - Suporte para PDF, Markdown, TXT
   - Parser automático de conteúdo
   - Processamento imediato

3. **Geração de Documentação**
   - Templates de documentação
   - Integração com Claude
   - Export em múltiplos formatos

4. **Testes & Deploy**
   - Unit tests (repositories, services)
   - E2E tests (API workflows)
   - CI/CD com GitHub Actions
   - Deploy em Azure/Vercel

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs: `npm run dev` (console)
2. Verificar database: `psql docpilot`
3. Verificar Redis: `redis-cli`
4. Verificar worker: `npm run worker` output

---

**Backend Status**: ✅ Pronto para MVP Priority 1 (Chat RAG)
