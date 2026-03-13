import Image from "next/image";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Card from "@/components/Card";
import Header from "@/components/SectionHeader";
import SectionHeader from "@/components/SectionHeader";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-10 py-12">
        <Card variant="surface" className="mt-10 w-full p-6">
          <SectionHeader
            title="Projetos"
            subtitle="Escolha o projeto e gerencie importações."
            right={<Button variant="primary">+ Novo</Button>}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card variant="subtle" className="p-5">
              <div className="text-[13px] font-black text-black dark:text-white">
                Cliente X • Billing API
              </div>
              <div className="mt-1 text-[11px] font-medium text-[#333333] dark:text-white/70">
                Fonte: Confluence • 128 páginas
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="success">Indexado</Badge>
                <Button variant="ghost">Abrir</Button>
              </div>
            </Card>
            <Card variant="subtle" className="p-5">
              <div className="text-[13px] font-black text-black dark:text-white">
                Cliente Y • Portal Web
              </div>
              <div className="mt-1 text-[11px] font-medium text-[#333333] dark:text-white/70">
                Fonte: Notion • 54 páginas
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="warning">Atualizar</Badge>
                <Button variant="ghost">Abrir</Button>
              </div>
            </Card>
          </div>
        </Card>
      </main>
    </div>
  );
}
