import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import Topbar from "@/components/Topbar";
import ImportDocsCard from "@/components/ImportDocsCard";
import ProjectCard from "@/components/ProjectCard";
import ChatDemo from "@/components/ChatDemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-docpilot px-docpilot-x py-docpilot-y">
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
        <Card variant="surface" className="mt-10 w-full p-6">
          <SectionHeader
            title="Projetos"
            subtitle="Escolha o projeto e gerencie importações."
            right={<Button variant="primary">+ Novo</Button>}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">

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
      </main>
    </div >
  );
}
