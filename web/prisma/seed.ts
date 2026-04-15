import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  try {
    // ─── Limpar dados existentes (dev only) ───
    console.log("🗑️  Limpando dados antigos...");
    await prisma.chatMessage.deleteMany({});
    await prisma.chatSession.deleteMany({});
    await prisma.embedding.deleteMany({});
    await prisma.chunk.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("  ✅ Dados antigos removidos\n");

    // ─── Criar usuário de teste ───
    console.log("👤 Criando usuário de teste...");
    const user = await prisma.user.create({
      data: {
        email: "dev@docpilot.local",
        name: "Developer",
        image: "https://github.com/ghost.png",
      },
    });
    console.log(`  ✅ Usuário criado: ${user.email} (${user.id})\n`);

    // ─── Criar projeto de exemplo ───
    console.log("📁 Criando projeto exemplo...");
    const project = await prisma.project.create({
      data: {
        name: "Projeto Exemplo",
        description:
          "Projeto de demonstração do DocPilot para desenvolvimento local.",
        ownerId: user.id,
      },
    });
    console.log(`  ✅ Projeto criado: ${project.name} (${project.id})\n`);

    // ─── Criar documento de exemplo ───
    console.log("📄 Criando documento exemplo...");
    const document = await prisma.document.create({
      data: {
        title: "README.md",
        fileName: "README.md",
        mimeType: "text/markdown",
        fileSize: 512,
        status: "READY",
        projectId: project.id,
      },
    });
    console.log(`  ✅ Documento criado: ${document.title} (${document.id})\n`);

    // ─── Criar chunks de exemplo ───
    console.log("✂️  Criando chunks de exemplo...");
    const chunkTexts = [
      "# DocPilot - Plataforma de Análise de Documentos com IA\n\nDocPilot permite que você faça upload de documentos e converse com IA para extrair insights.",
      "## Features\n\n- 📄 Upload de documentos em Markdown, TXT e PDF\n- 🤖 Chat inteligente com contexto do documento\n- 🔍 Busca vetorial semântica\n- 📝 Geração automática de documentação\n- 🔐 Autenticação segura com OAuth",
      "## Como Usar\n\n1. Faça login com GitHub ou Google\n2. Crie um novo projeto\n3. Faça upload de documentos\n4. Converse com o assistente IA\n5. Gere documentação automaticamente",
    ];

    const chunks = await Promise.all(
      chunkTexts.map((content, index) =>
        prisma.chunk.create({
          data: {
            content,
            position: index,
            tokenCount: content.split(/\s+/).length,
            documentId: document.id,
          },
        }),
      ),
    );
    console.log(`  ✅ ${chunks.length} chunks criados\n`);

    // ─── Criar session de chat de exemplo ───
    console.log("💬 Criando sessão de chat...");
    const chatSession = await prisma.chatSession.create({
      data: {
        title: "Primeira conversa",
        projectId: project.id,
        userId: user.id,
      },
    });
    console.log(`  ✅ Sessão criada: ${chatSession.title} (${chatSession.id})\n`);

    // ─── Criar mensagens de exemplo ───
    console.log("📨 Criando mensagens de exemplo...");
    const messages = await Promise.all([
      prisma.chatMessage.create({
        data: {
          role: "USER",
          content: "O que é o DocPilot?",
          sessionId: chatSession.id,
          tokens: 4,
        },
      }),
      prisma.chatMessage.create({
        data: {
          role: "ASSISTANT",
          content:
            "DocPilot é uma plataforma inovadora que combina upload de documentos com busca vetorial e IA. Permite extrair insights de seus documentos através de uma interface intuitiva de chat.",
          sessionId: chatSession.id,
          tokens: 32,
        },
      }),
    ]);
    console.log(`  ✅ ${messages.length} mensagens criadas\n`);

    // ─── Estatísticas finais ───
    console.log("📊 Resumo do Seed:\n");
    console.log(`  👤 Usuários: 1`);
    console.log(`  📁 Projetos: 1`);
    console.log(`  📄 Documentos: 1`);
    console.log(`  ✂️  Chunks: ${chunks.length}`);
    console.log(`  💬 Sessões de Chat: 1`);
    console.log(`  📨 Mensagens: ${messages.length}\n`);

    console.log("✨ Seed concluído com sucesso!\n");
    console.log("🚀 Para testar, acesse: http://localhost:3000");
    console.log(`   Email (dev): dev@docpilot.local\n`);
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
