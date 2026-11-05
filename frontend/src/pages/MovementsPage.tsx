import { useState, type FormEvent } from "react";
import { useStock, type MovementType } from "@/contexts/StockContext";
import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const movementTypeLabels: Record<MovementType, string> = {
  ENTRY: "Entrada",
  EXIT: "Saída",
  LOSS: "Perda",
  ADJUSTMENT: "Ajuste",
};

const movementTypeStyles: Record<MovementType, string> = {
  ENTRY: "bg-emerald-100 text-emerald-700",
  EXIT: "bg-blue-100 text-blue-700",
  LOSS: "bg-orange-100 text-orange-700",
  ADJUSTMENT: "bg-purple-100 text-purple-700",
};

function MovementsPage() {
  const { products, movements, registerMovement } = useStock();
  const [typeFilter, setTypeFilter] = useState<MovementType | "ALL">("ALL");
  const [productFilter, setProductFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("ENTRY");
  const [quantity, setQuantity] = useState("");
  const [responsible, setResponsible] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState("");

  const totalEntries = movements.filter(
    (movement) => movement.type === "ENTRY",
  ).length;

  const totalExits = movements.filter(
    (movement) => movement.type === "EXIT",
  ).length;

  const totalLosses = movements.filter(
    (movement) => movement.type === "LOSS",
  ).length;

  const filteredMovements = movements.filter((movement) => {
    const matchesType = typeFilter === "ALL" || movement.type === typeFilter;

    const movementDate = new Date(movement.date).toISOString().slice(0, 10);

    const matchesProduct =
      productFilter === "ALL" ||
      movement.productId.toString() === productFilter;

    const matchesStartDate = !startDate || movementDate >= startDate;

    const matchesEndDate = !endDate || movementDate <= endDate;

    return matchesType && matchesProduct && matchesStartDate && matchesEndDate;
  });

  const movementProducts = Array.from(
    new Map(
      movements.map((movement) => [movement.productId, movement.productName]),
    ),
    ([id, name]) => ({ id, name }),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const parsedQuantity = Number(quantity);

    if (!selectedProductId) {
      setFormError("Selecione um produto.");
      return;
    }

    if (
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity < 0 ||
      (movementType !== "ADJUSTMENT" && parsedQuantity === 0)
    ) {
      setFormError("Informe uma quantidade válida.");
      return;
    }

    const error = registerMovement({
      productId: Number(selectedProductId),
      type: movementType,
      quantity: parsedQuantity,
      responsible,
      reason,
    });

    if (error) {
      setFormError(error);
      return;
    }

    setSelectedProductId("");
    setMovementType("ENTRY");
    setQuantity("");
    setResponsible("");
    setReason("");
    setFormError("");
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Movimentações de estoque
        </h1>

        <p className="text-muted-foreground">
          Acompanhe e controle todas as entradas e saídas de produtos.
        </p>

        <div className="mt-4 flex justify-end">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Nova movimentação
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova movimentação</DialogTitle>
              <DialogDescription>
                Registre uma entrada, saída, perda ou ajuste no estoque.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="movementProduct"
                  className="text-sm font-medium"
                >
                  Produto
                </label>

                <select
                  id="movementProduct"
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  <option value="">Selecione um produto</option>

                  {products
                    .filter((product) => product.active)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — Estoque: {product.quantity}{" "}
                        {product.unit}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="movementType" className="text-sm font-medium">
                  Tipo de movimentação
                </label>

                <select
                  id="movementType"
                  value={movementType}
                  onChange={(event) =>
                    setMovementType(event.target.value as MovementType)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="ENTRY">Entrada</option>
                  <option value="EXIT">Saída</option>
                  <option value="LOSS">Perda</option>
                  <option value="ADJUSTMENT">Ajuste de estoque</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="movementQuantity"
                  className="text-sm font-medium"
                >
                  {movementType === "ADJUSTMENT"
                    ? "Nova quantidade total em estoque"
                    : "Quantidade"}
                </label>

                <input
                  id="movementQuantity"
                  type="number"
                  min="0"
                  step="any"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="Informe a quantidade"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />

                {movementType === "ADJUSTMENT" && (
                  <p className="text-xs text-muted-foreground">
                    No ajuste, informe o saldo correto que deverá ficar no
                    estoque.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="movementResponsible"
                  className="text-sm font-medium"
                >
                  Responsável
                </label>

                <input
                  id="movementResponsible"
                  value={responsible}
                  onChange={(event) => setResponsible(event.target.value)}
                  placeholder="Nome do responsável"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="movementReason" className="text-sm font-medium">
                  Justificativa
                </label>

                <textarea
                  id="movementReason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Descreva o motivo da movimentação"
                  className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedProductId("");
                    setMovementType("ENTRY");
                    setQuantity("");
                    setResponsible("");
                    setReason("");
                    setFormError("");
                  }}
                >
                  Cancelar
                </Button>

                <Button type="submit">Registrar movimentação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total de movimentações
            </p>
            <ArrowLeftRight className="size-5 text-muted-foreground" />
          </div>

          <p className="mt-3 text-2xl font-bold">{movements.length}</p>
          <p className="text-xs text-muted-foreground">Registros realizados</p>
        </div>

        {/* Entradas */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Entradas</p>
            <ArrowDownCircle className="size-5 text-emerald-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {totalEntries}
          </p>
          <p className="text-xs text-muted-foreground">
            Recebimentos de produtos
          </p>
        </div>

        {/* Saídas */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Saídas</p>
            <ArrowUpCircle className="size-5 text-blue-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-blue-600">{totalExits}</p>
          <p className="text-xs text-muted-foreground">Consumo e retiradas</p>
        </div>

        {/* Perdas */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Perdas</p>
            <AlertTriangle className="size-5 text-amber-600" />
          </div>

          <p className="mt-3 text-2xl font-bold text-amber-600">
            {totalLosses}
          </p>
          <p className="text-xs text-muted-foreground">Produtos inutilizados</p>
        </div>

        {/* Histórico de movimentações */}
        <div className="col-span-full w-full min-w-0 rounded-xl border bg-card">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold">
              Histórico de movimentações
            </h2>

            <p className="text-sm text-muted-foreground">
              Exibindo {filteredMovements.length} de {movements.length}{" "}
              movimentações
            </p>

            <p className="text-sm text-muted-foreground">
              Consulte todas as operações realizadas no estoque.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="typeFilter" className="text-sm font-medium">
                Tipo de movimentação:
              </label>

              <select
                id="typeFilter"
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as MovementType | "ALL")
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">Todas</option>
                <option value="ENTRY">Entradas</option>
                <option value="EXIT">Saídas</option>
                <option value="LOSS">Perdas</option>
                <option value="ADJUSTMENT">Ajustes</option>
              </select>

              <label htmlFor="productFilter" className="text-sm font-medium">
                Produto:
              </label>

              <select
                id="productFilter"
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ALL">Todos os produtos</option>

                {movementProducts.map((product) => (
                  <option key={product.id} value={product.id.toString()}>
                    {product.name}
                  </option>
                ))}
              </select>

              <label htmlFor="startDate" className="text-sm font-medium">
                De:
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />

              <label htmlFor="endDate" className="text-sm font-medium">
                Até:
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                min={startDate || undefined}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              />

              <button
                type="button"
                onClick={() => {
                  setTypeFilter("ALL");
                  setProductFilter("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                className="h-10 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <Table className="w-full min-w-[1100px] table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[170px]">Data</TableHead>
                  <TableHead className="w-[170px]">Produto</TableHead>
                  <TableHead className="w-[100px]">Tipo</TableHead>
                  <TableHead className="w-[110px]">Quantidade</TableHead>
                  <TableHead className="w-[130px]">Estoque anterior</TableHead>
                  <TableHead className="w-[120px]">Estoque atual</TableHead>
                  <TableHead className="w-[140px]">Responsável</TableHead>
                  <TableHead className="w-[160px]">Justificativa</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMovements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Nenhuma movimentação registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>
                        {new Date(movement.date).toLocaleString("pt-BR")}
                      </TableCell>

                      <TableCell className="font-medium">
                        {movement.productName}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${movementTypeStyles[movement.type]}`}
                        >
                          {movementTypeLabels[movement.type]}
                        </span>
                      </TableCell>

                      <TableCell>{movement.quantity}</TableCell>

                      <TableCell>{movement.previousQuantity}</TableCell>

                      <TableCell>{movement.newQuantity}</TableCell>

                      <TableCell>{movement.responsible}</TableCell>

                      <TableCell>{movement.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovementsPage;
