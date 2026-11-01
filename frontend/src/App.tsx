function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            CleanStock
          </h1>

          <p className="mt-2 text-slate-500">
            Gestão inteligente de estoque e materiais.
          </p>
        </header>

        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Bem-vindo ao CleanStock!
          </h2>

          <p className="mt-3 text-slate-600">
            Estamos preparando seu sistema de gestão de estoque.
          </p>

          <div className="mt-6 inline-flex rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            Ambiente inicial configurado
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;
