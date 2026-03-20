import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import Topbar from "@/components/Topbar";
import ImportDocsCard from "@/components/ImportDocsCard";
import ProjectCard from "@/components/ProjectCard";
import ChatDemo from "@/components/ChatDemo";
import DocsDemo from "@/components/DocsDemo";

export default function Home() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 overflow-x-hidden px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-6 lg:px-10">
        <Topbar
          projectLabel="Projeto: Cliente X * Billing API"
          statusLabel="Indexado"
          anchors={[
            { key: "projects", label: "Projetos", active: true, href: "/projects" },
            { key: "chat", label: "Chat", href: "/chat" },
            { key: "docs", label: "Gerar Docs", href: "/docs" },
            { key: "sources", label: "Fontes", href: "/sources" },
          ]}
          newHref="/projects/new"
        />
        <Card variant="surface" className="w-full p-4">
          <SectionHeader
            title="Projetos"
            subtitle="Escolha o projeto e gerencie importações."
          />

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">

            <ProjectCard
              title="Cliente X • Billing API"
              source="Confluence"
              pages={128}
              badgeVariant="success"
              badgeLabel="Indexado"
            />
            <ProjectCard
              title="Cliente Y • Portal Web"
              source="Notion"
              pages={54}
              badgeVariant="warning"
              badgeLabel="Atualizar"
            />
            <ImportDocsCard />
          </div>
        </Card>
        <ChatDemo />
        <DocsDemo />
      </main>
    </div >
  );
}
