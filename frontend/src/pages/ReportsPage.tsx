import { useState } from "react";

import { AlertTriangle, DollarSign, Package, ShoppingCart } from "lucide-react";

import { useStock } from "@/contexts/StockContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsPage() {
  const { products, purchases, movements } = useStock();
  // Filtros do histórico
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("all");

  // Produtos ativos
  const activeProducts = products.filter((product) => product.active);

  // Valor total do estoque
  const stockValue = activeProducts.reduce(
    (total, product) => total + product.quantity * product.unitPrice,
    0,
  );

  // Produtos com estoque baixo
  const lowStockProducts = activeProducts.filter(
    (product) => product.quantity <= product.minimumStock,
  );

  // Indicadores de compras
  const totalPurchases = purchases.length;

  const totalPurchaseValue = purchases.reduce(
    (total, purchase) => total + purchase.total,
    0,
  );

  // Indicadores de movimentações
  const totalEntries = movements.filter(
    (movement) => movement.type === "ENTRY",
  ).length;

  const totalConsumptions = movements.filter(
    (movement) => movement.type === "EXIT",
  ).length;

  const totalLosses = movements.filter(
    (movement) => movement.type === "LOSS",
  ).length;

  const totalAdjustments = movements.filter(
    (movement) => movement.type === "ADJUSTMENT",
  ).length;

  // Movimentações filtradas por produto e período
  const filteredMovements = movements.filter((movement) => {
    const movementDate = new Date(movement.date);

    const year = movementDate.getFullYear();
    const month = String(movementDate.getMonth() + 1).padStart(2, "0");
    const day = String(movementDate.getDate()).padStart(2, "0");

    const dateKey = `${year}-${month}-${day}`;

    const matchesProduct =
      selectedProduct === "all" ||
      movement.productId.toString() === selectedProduct;

    const matchesStartDate = !startDate || dateKey >= startDate;

    const matchesEndDate = !endDate || dateKey <= endDate;

    return matchesProduct && matchesStartDate && matchesEndDate;
  });

  // Quantidades movimentadas no período selecionado
  const productEntries = filteredMovements
    .filter((movement) => movement.type === "ENTRY")
    .reduce((total, movement) => total + movement.quantity, 0);

  const productConsumptions = filteredMovements
    .filter((movement) => movement.type === "EXIT")
    .reduce((total, movement) => total + movement.quantity, 0);

  const productLosses = filteredMovements
    .filter((movement) => movement.type === "LOSS")
    .reduce((total, movement) => total + movement.quantity, 0);

  // Produto selecionado para análise
  const selectedProductData =
    selectedProduct === "all"
      ? null
      : (products.find(
          (product) => product.id.toString() === selectedProduct,
        ) ?? null);

  const selectedUnit = selectedProductData?.unit ?? "unidades";

  // Movimentações dos últimos seis meses
  const monthlyMovements = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();

    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    date.setMonth(date.getMonth() - (5 - index));

    const year = date.getFullYear();
    const month = date.getMonth();

    const monthMovements = filteredMovements.filter((movement) => {
      const movementDate = new Date(movement.date);

      return (
        movementDate.getFullYear() === year && movementDate.getMonth() === month
      );
    });

    return {
      month: new Intl.DateTimeFormat("pt-BR", {
        month: "short",
      }).format(date),

      entries: monthMovements
        .filter((movement) => movement.type === "ENTRY")
        .reduce((total, movement) => total + movement.quantity, 0),

      consumptions: monthMovements
        .filter((movement) => movement.type === "EXIT")
        .reduce((total, movement) => total + movement.quantity, 0),

      losses: monthMovements
        .filter((movement) => movement.type === "LOSS")
        .reduce((total, movement) => total + movement.quantity, 0),
    };
  });

  // Maior quantidade mensal, usada como referência para as barras
  const maxMonthlyMovements = Math.max(
    1,
    ...monthlyMovements.flatMap((item) => [
      item.entries,
      item.consumptions,
      item.losses,
    ]),
  );

  // Formatação monetária brasileira
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>

        <p className="text-muted-foreground">
          Acompanhe os indicadores e o desempenho do estoque.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos ativos
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{activeProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Produtos cadastrados e ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor em estoque
            </CardTitle>
            <DollarSign className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stockValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Valor dos produtos disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque baixo</CardTitle>
            <AlertTriangle className="size-5 text-amber-500" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">
              Produtos no limite ou abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de compras
            </CardTitle>
            <ShoppingCart className="size-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(totalPurchaseValue)} em compras
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Movimentações do estoque</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas</CardTitle>
              <Package className="size-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                Operações de entrada
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consumos</CardTitle>
              <ShoppingCart className="size-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalConsumptions}</div>
              <p className="text-xs text-muted-foreground">
                Operações de consumo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perdas</CardTitle>
              <AlertTriangle className="size-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLosses}</div>
              <p className="text-xs text-muted-foreground">
                Operações de perda
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ajustes</CardTitle>
              <DollarSign className="size-5 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAdjustments}</div>
              <p className="text-xs text-muted-foreground">
                Operações de ajuste
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise por produto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Selecione um produto e um período para analisar suas movimentações.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>

              <Select
                value={selectedProduct}
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>

                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data inicial</label>

              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data final</label>

              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Quantidade de entradas
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {productEntries} {selectedUnit}
            </div>
            <p className="text-xs text-muted-foreground">
              Quantidade recebida no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Quantidade consumida
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {productConsumptions} {selectedUnit}
            </div>
            <p className="text-xs text-muted-foreground">
              Quantidade consumida no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Quantidade de perdas
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {productLosses} {selectedUnit}
            </div>
            <p className="text-xs text-muted-foreground">
              Quantidade perdida no período
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedProductData
              ? `Análise de ${selectedProductData.name}`
              : "Movimentações dos últimos 6 meses"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Quantidades mensais de entradas, consumos e perdas
            {selectedProductData
              ? ` em ${selectedProductData.unit}.`
              : " de todos os produtos."}
          </p>
        </CardHeader>

        <CardContent>
          <div className="mb-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-sm bg-emerald-500" />
              Entradas
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-sm bg-blue-500" />
              Consumos
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="size-3 rounded-sm bg-amber-500" />
              Perdas
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {monthlyMovements.map((item, index) => (
              <div
                key={`${item.month}-${index}`}
                className="flex min-w-0 flex-col items-center gap-3"
              >
                <div className="flex h-48 w-full items-end justify-center gap-1 border-b">
                  <div
                    className="w-full max-w-5 rounded-t-sm bg-emerald-500 transition-all"
                    style={{
                      height: `${(item.entries / maxMonthlyMovements) * 100}%`,
                      minHeight: item.entries > 0 ? "4px" : "0px",
                    }}
                    title={`Entradas: ${item.entries}`}
                  />

                  <div
                    className="w-full max-w-5 rounded-t-sm bg-blue-500 transition-all"
                    style={{
                      height: `${(item.consumptions / maxMonthlyMovements) * 100}%`,
                      minHeight: item.consumptions > 0 ? "4px" : "0px",
                    }}
                    title={`Consumos: ${item.consumptions}`}
                  />

                  <div
                    className="w-full max-w-5 rounded-t-sm bg-amber-500 transition-all"
                    style={{
                      height: `${(item.losses / maxMonthlyMovements) * 100}%`,
                      minHeight: item.losses > 0 ? "4px" : "0px",
                    }}
                    title={`Perdas: ${item.losses}`}
                  />
                </div>

                <span className="text-xs capitalize text-muted-foreground">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
