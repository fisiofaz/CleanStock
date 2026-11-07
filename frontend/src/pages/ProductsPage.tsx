import { useState } from "react";
import { useStock, type Product } from "@/contexts/StockContext";
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProductFormData = {
  name: string;
  category: string;
  unit: string;
  unitPrice: string;
  initialStock: string;
  minimumStock: string;
  description: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getStockStatus(product: Product) {
  if (product.quantity === 0) {
    return {
      label: "Sem estoque",
      className: "bg-rose-100 text-rose-700",
    };
  }

  if (product.quantity <= product.minimumStock) {
    return {
      label: "Estoque baixo",
      className: "bg-amber-100 text-amber-700",
    };
  }

  return {
    label: "Disponível",
    className: "bg-emerald-100 text-emerald-700",
  };
}

const categoryLabels: Record<string, string> = {
  cleaning: "Produtos de limpeza",
  disposables: "Descartáveis",
  durable: "Duráveis",
  others: "Outros",
};

const unitLabels: Record<string, string> = {
  UN: "Unidade",
  L: "Litro",
  ML: "Mililitro",
  KG: "Quilograma",
  G: "Grama",
  PCT: "Pacote",
  CX: "Caixa",
};

function ProductsPage() {

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedActiveStatus, setSelectedActiveStatus] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);    
    const { products, setProducts, createProduct, categories } = useStock();
    
    const indicators = [
      {
        title: "Total de produtos",
        value: String(products.length).padStart(2, "0"),
        description: "Produtos cadastrados",
        icon: Package,
        color: "text-blue-600",
        background: "bg-blue-100",
      },
      {
        title: "Produtos ativos",
        value: String(
          products.filter((product) => product.active).length,
        ).padStart(2, "0"),
        description: "Disponíveis para utilização",
        icon: CheckCircle2,
        color: "text-emerald-600",
        background: "bg-emerald-100",
      },
      {
        title: "Estoque baixo",
        value: String(
          products.filter(
            (product) =>
              product.quantity > 0 && product.quantity <= product.minimumStock,
          ).length,
        ).padStart(2, "0"),
        description: "Abaixo do estoque mínimo",
        icon: AlertTriangle,
        color: "text-amber-600",
        background: "bg-amber-100",
      },
      {
        title: "Sem estoque",
        value: String(
          products.filter((product) => product.quantity === 0).length,
        ).padStart(2, "0"),
        description: "Produtos que precisam de reposição",
        icon: PackageX,
        color: "text-rose-600",
        background: "bg-rose-100",
      },
    ];

    const filteredProducts = products.filter((product) => {
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "empty" && product.quantity === 0) ||
        (selectedStatus === "low" &&
          product.quantity > 0 &&
          product.quantity <= product.minimumStock) ||
        (selectedStatus === "available" &&
          product.quantity > product.minimumStock);
        
    const matchesActiveStatus =
      selectedActiveStatus === "all" ||
      (selectedActiveStatus === "active" && product.active) ||
      (selectedActiveStatus === "inactive" && !product.active);

      return matchesSearch && matchesCategory && matchesStatus && matchesActiveStatus;
    });

    const [formData, setFormData] = useState<ProductFormData>({
      name: "",
      category: "",
      unit: "",
      unitPrice: "",
      initialStock: "",
      minimumStock: "",
      description: "",
    });

    const [editingProductId, setEditingProductId] = useState<number | null>(
      null,
    );

    function handleEditProduct(product: Product) {
      setEditingProductId(product.id);

      setFormData({
        name: product.name,
        category:
          Object.entries(categoryLabels).find(
            ([, label]) => label === product.category,
          )?.[0] ?? product.category,
        unit:
          Object.entries(unitLabels).find(
            ([, label]) => label === product.unit,
          )?.[0] ?? product.unit,
        unitPrice: String(product.unitPrice).replace(".", ","),
        initialStock: "",
        minimumStock: String(product.minimumStock).replace(".", ","),
        description: product.description ?? "",
      });

      setIsDialogOpen(true);
    }

    function handleCreateProduct() {
      const isEditing = editingProductId !== null;

      if (
        !formData.name.trim() ||
        !formData.category ||
        !formData.unit ||
        !formData.unitPrice.trim() ||
        (!isEditing && !formData.initialStock.trim()) ||
        !formData.minimumStock.trim() ||
        !formData.description.trim()
      ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }

      const unitPrice = Number(formData.unitPrice.replace(",", "."));
      const initialStock = isEditing
        ? 0
        : Number(formData.initialStock.replace(",", "."));
      const minimumStock = Number(formData.minimumStock.replace(",", "."));

      if (
        !Number.isFinite(unitPrice) ||
        !Number.isFinite(initialStock) ||
        !Number.isFinite(minimumStock) ||
        unitPrice < 0 ||
        initialStock < 0 ||
        minimumStock < 0
      ) {
        alert("Informe valores numéricos válidos e não negativos.");
        return;
      }

      if (isEditing) {
        setProducts((currentProducts) =>
          currentProducts.map((product) =>
            product.id === editingProductId
              ? {
                  ...product,
                  name: formData.name.trim(),
                  category:
                    categoryLabels[formData.category] ?? formData.category,
                  unit: unitLabels[formData.unit] ?? formData.unit,
                  unitPrice,
                  minimumStock,
                  description: formData.description.trim(),
                }
              : product,
          ),
        );
      } else {
        createProduct({
          name: formData.name.trim(),
          category: categoryLabels[formData.category] ?? formData.category,
          quantity: initialStock,
          unit: unitLabels[formData.unit] ?? formData.unit,
          unitPrice,
          minimumStock,
          description: formData.description.trim(),
          active: true,
        });
      }

      setFormData({
        name: "",
        category: "",
        unit: "",
        unitPrice: "",
        initialStock: "",
        minimumStock: "",
        description: "",
      });

      setEditingProductId(null);
      setIsDialogOpen(false);
    }

    function resetProductForm() {
      setFormData({
        name: "",
        category: "",
        unit: "",
        unitPrice: "",
        initialStock: "",
        minimumStock: "",
        description: "",
      });

      setEditingProductId(null);
    }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie os materiais de limpeza cadastrados no estoque.
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

                <div className={`rounded-lg p-2 ${indicator.background}`}>
                  <Icon className={`size-5 ${indicator.color}`} />
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

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Lista de produtos</h2>

            <p className="text-sm text-muted-foreground">
              Consulte os materiais cadastrados no estoque.
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);

              if (!open) {
                resetProductForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Package className="mr-2 size-4" />
                Novo produto
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingProductId !== null
                    ? "Editar produto"
                    : "Cadastrar produto"}
                </DialogTitle>
                <DialogDescription>
                  {editingProductId !== null
                    ? "Altere os dados cadastrais do produto. O estoque atual será preservado."
                    : "Cadastre um material de limpeza para controlar seu estoque."}
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCreateProduct();
                }}
                className="space-y-4"
              >
                <div className="grid gap-4 py-4 sm:grid-cols-2">
                  {/* Nome do produto */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Nome do produto</Label>
                    <Input
                      id="name"
                      placeholder="Ex.: Detergente neutro"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          name: event.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Categoria */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>

                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category: value,
                        })
                      }
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>

                        {categories
                          .filter((category) => category.active)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unidade de medida */}
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidade de medida</Label>

                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          unit: value,
                        })
                      }
                    >
                      <SelectTrigger id="unit" className="w-full">
                        <SelectValue placeholder="Selecione uma unidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade</SelectItem>
                        <SelectItem value="L">Litro</SelectItem>
                        <SelectItem value="ML">Mililitro</SelectItem>
                        <SelectItem value="KG">Quilograma</SelectItem>
                        <SelectItem value="G">Grama</SelectItem>
                        <SelectItem value="PCT">Pacote</SelectItem>
                        <SelectItem value="CX">Caixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Valor unitário */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="unitPrice">Valor unitário (R$)</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex.: 12,50"
                      value={formData.unitPrice}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          unitPrice: event.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Estoque inicial */}
                  {editingProductId === null && (
                    <div className="space-y-2">
                      <Label htmlFor="initialStock">Estoque inicial</Label>
                      <Input
                        id="initialStock"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ex.: 50"
                        value={formData.initialStock}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            initialStock: event.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                  {/* Estoque mínimo */}
                  <div className="space-y-2">
                    <Label htmlFor="minimumStock">Estoque mínimo</Label>
                    <Input
                      id="minimumStock"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ex.: 10"
                      value={formData.minimumStock}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          minimumStock: event.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Descrição (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Adicione informações complementares sobre o produto..."
                      rows={3}
                      value={formData.description}
                      onChange={(event) =>
                        setFormData({
                          ...formData,
                          description: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetProductForm();
                      setIsDialogOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button type="submit">
                    {editingProductId !== null
                      ? "Salvar alterações"
                      : "Cadastrar produto"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Buscar por produto ou categoria..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>

              {categories
                .filter((category) => category.active)
                .map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-180px">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="available">Disponível</SelectItem>
              <SelectItem value="low">Estoque baixo</SelectItem>
              <SelectItem value="empty">Sem estoque</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedActiveStatus}
            onValueChange={setSelectedActiveStatus}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Cadastro" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Todos os cadastros</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Produto</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Estoque</th>
                  <th className="px-4 py-3 font-medium">Valor unitário</th>
                  <th className="px-4 py-3 font-medium">Disponibilidade</th>
                  <th className="px-4 py-3 font-medium">Situação</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product);

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4 font-medium">{product.name}</td>

                      <td className="px-4 py-4 text-muted-foreground">
                        {product.category}
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-medium">
                          {product.quantity} {product.unit}
                        </span>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Mínimo: {product.minimumStock} {product.unit}
                        </p>
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {formatCurrency(product.unitPrice)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            product.active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {product.active ? "Ativo" : "Inativo"}
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setProducts((currentProducts) =>
                              currentProducts.map((item) =>
                                item.id === product.id
                                  ? { ...item, active: !item.active }
                                  : item,
                              ),
                            )
                          }
                        >
                          {product.active ? "Desativar" : "Ativar"}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            Exibindo {filteredProducts.length} de {products.length} produtos
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
