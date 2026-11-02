import { Button } from "@/components/ui/button";
import { PackagePlus } from "lucide-react";

function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">CleanStock</h1>

          <p className="mt-2 text-muted-foreground">
            Gestão inteligente de estoque e materiais.
          </p>
        </header>

        <section className="rounded-xl border  bg-card p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Bem-vindo ao CleanStock!</h2>

          <p className="mt-3 text-muted-foreground">
            Estamos preparando seu sistema de gestão de estoque.
          </p>

          <div className="mt-6 ">
            <Button>
              <PackagePlus />
              Cadastrar produto
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
