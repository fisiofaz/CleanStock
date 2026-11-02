import { Package, Wallet, AlertTriangle, ShoppingCart } from "lucide-react";

const indicators = [
    {
        title: "Total de produtos",
        value: "—",
        description: "Produtos cadastrados",
        icon: Package,
    },
    {
        title: "Valor em estoque",
        value: "—",
        description: "Valor total dos materiais",
        icon: Wallet,
    },
    {
        title: "Estoque baixo",
        value: "—",
        description: "Produtos que precisam de atenção",
        icon: AlertTriangle,
    },
    {
        title: "Compras realizadas",
        value: "—",
        description: "Compras registradas",
        icon: ShoppingCart,
    },
    ];

    function DashboardPage() {
    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    Visão geral da gestão de estoque.
                </p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {indicators.map((indicator) => {
                    const Icon = indicator.icon;

                    return (
                        <article
                            key={indicator.title}
                            className="rounded-xl border bg-card p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {indicator.title}
                                </p>

                                <div className="rounded-lg bg-muted p-2">
                                    <Icon className="size-5 text-muted-foreground" />
                                </div>
                            </div>

                            <p className="mt-4 text-2xl font-bold">{indicator.value}</p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {indicator.description}
                            </p>
                        </article>
                    );
                })}
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <article className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="font-semibold">Movimentações de estoque</h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                    O histórico de entradas, consumos e perdas será apresentado aqui.
                    </p>
                </article>

                <article className="rounded-xl border bg-card p-6 shadow-sm">
                    <h2 className="font-semibold">Atenção ao estoque</h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Os produtos que precisam de reposição serão destacados aqui.
                    </p>
                </article>
            </section>
        </div>
    );
}

export default DashboardPage;
