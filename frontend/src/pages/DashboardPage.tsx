import { useEffect, useState } from "react";
import { getDashboard, type DashboardData } from "@/services/dashboardService";

import { Package, Wallet, AlertTriangle, ShoppingCart } from "lucide-react";


function DashboardPage() {

      const [dashboard, setDashboard] = useState<DashboardData | null>(null);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState("");

    useEffect(() => {
        async function loadDashboard() {
            try {
              const data = await getDashboard();
              setDashboard(data);
            } catch (error) {
              setError(
                error instanceof Error
                  ? error.message
                  : "Erro ao carregar os dados do Dashboard.",
              );
            } finally {
              setLoading(false);
            }
          }

          loadDashboard();
        }, []);
    
      const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);

      const indicators = [
        {
          title: "Total de produtos",
          value: dashboard?.totalProducts ?? "—",
          description: "Produtos cadastrados",
          icon: Package,
        },
        {
          title: "Valor em estoque",
          value:
            dashboard !== null ? formatCurrency(dashboard.inventoryValue) : "—",
          description: "Valor total dos materiais",
          icon: Wallet,
        },
        {
          title: "Estoque baixo",
          value: dashboard?.lowStock ?? "—",
          description: "Produtos que precisam de atenção",
          icon: AlertTriangle,
        },
        {
          title: "Compras realizadas",
          value: dashboard?.totalPurchases ?? "—",
          description: "Compras registradas",
          icon: ShoppingCart,
        },
      ];

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

              <p className="mt-4 text-2xl font-bold">
                {loading ? "..." : error ? "Erro" : indicator.value}
              </p>

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

          {loading ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Carregando movimentações...
            </p>
          ) : error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : dashboard?.recentMovements.length ? (
            <div className="mt-4 space-y-3">
              {dashboard.recentMovements.map((movement) => (
                <div
                  key={movement.id}
                  className="flex items-center justify-between gap-4 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {movement.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {movement.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {movement.type === "ENTRY" ? "+" : "-"}
                      {movement.quantity} {movement.product.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(movement.date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhuma movimentação registrada.
            </p>
          )}
        </article>

        <article className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Atenção ao estoque</h2>

          {loading ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Carregando produtos...
            </p>
          ) : error ? (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          ) : dashboard?.lowStockProducts.length ? (
            <div className="mt-4 space-y-3">
              {dashboard.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Estoque mínimo: {product.minimumStock} {product.unit}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-destructive">
                    {product.quantity} {product.unit}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Nenhum produto com estoque baixo.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
