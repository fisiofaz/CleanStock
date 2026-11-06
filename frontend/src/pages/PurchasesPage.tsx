import { useState } from "react";

import {
  Plus,
  ShoppingCart,
  DollarSign,
  CalendarDays,
  Trash2,
} from "lucide-react";

import { useStock } from "@/contexts/StockContext";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PurchaseItem = {
  productId: number;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

type Purchase = {
  id: number;
  supplierId: number;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: "CONFIRMED";
};

export default function PurchasesPage() {

    const { suppliers, products, registerMovement } = useStock();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(
      new Date().toISOString().slice(0, 10),
    );
    const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [itemQuantity, setItemQuantity] = useState("1");
    const [itemUnitPrice, setItemUnitPrice] = useState("");
    const [itemError, setItemError] = useState("");
    const [purchaseError, setPurchaseError] = useState("");
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    
    const totalPurchases = purchases.length;

    const totalPurchaseValue = purchases.reduce(
      (total, purchase) => total + purchase.total,
      0,
    );

    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}`;

    const monthlyPurchases = purchases.filter(
      (purchase) => purchase.date.slice(0, 7) === currentMonth,
    ).length;

    function handleAddItem() {
      const product = products.find(
        (item) => item.id === Number(selectedProductId),
      );

      const quantity = Number(itemQuantity);
      const unitPrice = Number(itemUnitPrice);

      if (!product) {
        setItemError("Selecione um produto.");
        return;
      }

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setItemError("Informe uma quantidade válida.");
        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setItemError("Informe um preço unitário válido.");
        return;
      }

      if (purchaseItems.some((item) => item.productId === product.id)) {
        setItemError("Esse produto já foi adicionado à compra.");
        return;
      }

      setPurchaseItems((currentItems) => [
        ...currentItems,
        {
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity,
          unitPrice,
        },
      ]);

      setSelectedProductId("");
      setItemQuantity("1");
      setItemUnitPrice("");
      setItemError("");
    }

    const purchaseTotal = purchaseItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    );

    function handleConfirmPurchase() {
      const supplier = suppliers.find(
        (item) => item.id === Number(selectedSupplierId),
      );

      if (!supplier || !supplier.active) {
        setPurchaseError("Selecione um fornecedor ativo.");
        return;
      }

      if (!purchaseDate) {
        setPurchaseError("Informe a data da compra.");
        return;
      }

      if (purchaseDate > new Date().toISOString().slice(0, 10)) {
        setPurchaseError("A data da compra não pode ser futura.");
        return;
      }

      if (purchaseItems.length === 0) {
        setPurchaseError("Adicione pelo menos um produto à compra.");
        return;
      }

      for (const item of purchaseItems) {
        const product = products.find(
          (currentProduct) => currentProduct.id === item.productId,
        );

        if (!product || !product.active) {
          setPurchaseError(
            `O produto "${item.productName}" não está mais disponível.`,
          );
          return;
        }
      }

      for (const item of purchaseItems) {
        const error = registerMovement({
          productId: item.productId,
          type: "ENTRY",
          quantity: item.quantity,
          responsible: "Usuário do sistema",
          reason: `Compra realizada com ${supplier.name}`,
        });

        if (error) {
          setPurchaseError(error);
          return;
        }
      }

      const newPurchase: Purchase = {
        id: Date.now(),
        supplierId: supplier.id,
        supplierName: supplier.name,
        date: purchaseDate,
        items: [...purchaseItems],
        total: purchaseTotal,
        status: "CONFIRMED",
      };

      setPurchases((currentPurchases) => [newPurchase, ...currentPurchases]);

      setPurchaseItems([]);
      setSelectedSupplierId("");
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setPurchaseError("");
      setIsDialogOpen(false);
    }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-6 text-primary" />

            <h1 className="text-2xl font-semibold tracking-tight">Compras</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie as compras e entradas de produtos no estoque.
          </p>
        </header>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button
            onClick={() => {
              setPurchaseError("");
              setItemError("");
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Nova compra
          </Button>

          <DialogContent className="w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto sm:max-w-[760px]">
            <DialogHeader>
              <DialogTitle>Nova compra</DialogTitle>
              <DialogDescription>
                Registre uma nova compra de produtos para o estoque.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {purchaseError && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {purchaseError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>

                <Button type="button" onClick={handleConfirmPurchase}>
                  Confirmar compra
                </Button>
              </div>

              {/* Fornecedor */}
              <div className="space-y-2">
                <label htmlFor="supplier" className="text-sm font-medium">
                  Fornecedor
                </label>

                <select
                  id="supplier"
                  value={selectedSupplierId}
                  onChange={(event) =>
                    setSelectedSupplierId(event.target.value)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecione um fornecedor</option>

                  {suppliers
                    .filter((supplier) => supplier.active)
                    .map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                </select>

                {suppliers.filter((supplier) => supplier.active).length ===
                  0 && (
                  <p className="text-xs text-muted-foreground">
                    Nenhum fornecedor ativo cadastrado. Cadastre um fornecedor
                    antes de registrar uma compra.
                  </p>
                )}
              </div>

              {/* Data da compra */}
              <div className="space-y-2">
                <label htmlFor="purchaseDate" className="text-sm font-medium">
                  Data da compra
                </label>

                <input
                  id="purchaseDate"
                  type="date"
                  value={purchaseDate}
                  onChange={(event) => setPurchaseDate(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Produtos da compra */}
              <div className="space-y-3 border-t pt-5">
                <h3 className="text-sm font-semibold">Produtos da compra</h3>

                <div className="space-y-2">
                  <label htmlFor="product" className="text-sm font-medium">
                    Produto
                  </label>

                  <select
                    id="product"
                    value={selectedProductId}
                    onChange={(event) => {
                      const productId = event.target.value;
                      setSelectedProductId(productId);

                      const product = products.find(
                        (item) => item.id === Number(productId),
                      );

                      setItemUnitPrice(
                        product ? String(product.unitPrice) : "",
                      );
                      setItemError("");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione um produto</option>

                    {products
                      .filter((product) => product.active)
                      .map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="itemQuantity"
                      className="text-sm font-medium"
                    >
                      Quantidade
                    </label>

                    <input
                      id="itemQuantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={itemQuantity}
                      onChange={(event) => setItemQuantity(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="itemUnitPrice"
                      className="text-sm font-medium"
                    >
                      Valor unitário (R$)
                    </label>

                    <input
                      id="itemUnitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={itemUnitPrice}
                      onChange={(event) => setItemUnitPrice(event.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>

                {itemError && (
                  <p className="text-sm text-destructive">{itemError}</p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddItem}
                >
                  <Plus className="mr-2 size-4" />
                  Adicionar produto
                </Button>
              </div>

              {/* Itens adicionados */}
              <div className="space-y-3 border-t pt-5">
                <h3 className="text-sm font-semibold">
                  Itens adicionados ({purchaseItems.length})
                </h3>

                {purchaseItems.length === 0 ? (
                  <p className="rounded-md bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                    Nenhum produto adicionado à compra.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {purchaseItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {item.productName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit} ×{" "}
                            {item.unitPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-sm font-semibold">
                            {(item.quantity * item.unitPrice).toLocaleString(
                              "pt-BR",
                              {
                                style: "currency",
                                currency: "BRL",
                              },
                            )}
                          </span>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setPurchaseItems((currentItems) =>
                                currentItems.filter(
                                  (currentItem) =>
                                    currentItem.productId !== item.productId,
                                ),
                              )
                            }
                            aria-label={`Remover ${item.productName}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  <span className="font-semibold">Total da compra</span>
                  <span className="text-lg font-bold">
                    {purchaseTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">
              Total de compras
            </CardTitle>

            <ShoppingCart className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>

            <p className="text-xs text-muted-foreground">Compras registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">
              Valor total comprado
            </CardTitle>

            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {totalPurchaseValue.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>

            <p className="text-xs text-muted-foreground">
              Investimento em compras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-1">
            <CardTitle className="text-sm font-medium">
              Compras no mês
            </CardTitle>

            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{monthlyPurchases}</div>

            <p className="text-xs text-muted-foreground">
              Compras realizadas neste mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de compras */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Histórico de compras</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Consulte as compras realizadas e seus respectivos detalhes.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Fornecedor</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Itens</th>
                  <th className="px-4 py-3 font-medium">Valor total</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>

              <tbody>
                {purchases.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingCart className="size-8 opacity-40" />
                        <p>Nenhuma compra registrada.</p>
                        <span className="text-xs">
                          As compras realizadas aparecerão aqui.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  purchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">
                        {purchase.supplierName}
                      </td>

                      <td className="px-4 py-3">
                        {new Date(
                          `${purchase.date}T12:00:00`,
                        ).toLocaleDateString("pt-BR")}
                      </td>

                      <td className="px-4 py-3">{purchase.items.length}</td>

                      <td className="px-4 py-3 font-medium">
                        {purchase.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Confirmada
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
