import { useState } from "react";
import { Plus, Tags, Power, Search, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStock, type Category } from "@/contexts/StockContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CategoryFormData = {
  name: string;
  description: string;
};

export function CategoriesPage() {
  const {
    categories,
    createCategory,
    updateCategory,
    toggleCategoryStatus,
  } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null,
  );

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  const activeCategories = categories.filter(
    (category) => category.active,
  ).length;

  const inactiveCategories = categories.filter(
    (category) => !category.active,
  ).length;

  const filteredCategories = categories.filter((category) => {
    const search = searchTerm.toLowerCase();

    return (
      category.name.toLowerCase().includes(search) ||
      category.description.toLowerCase().includes(search)
    );
  });

  function resetForm() {
    setFormData({
      name: "",
      description: "",
    });

    setEditingCategoryId(null);
  }

  function handleNewCategory() {
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditCategory(category: Category) {
    setEditingCategoryId(category.id);

    setFormData({
      name: category.name,
      description: category.description,
    });

    setIsDialogOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const categoryData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      active: true,
    };

    if (!categoryData.name) {
      return;
    }

    if (editingCategoryId !== null) {
      const currentCategory = categories.find(
        (category) => category.id === editingCategoryId,
      );

      if (currentCategory) {
        updateCategory(editingCategoryId, {
          ...categoryData,
          active: currentCategory.active,
        });
      }
    } else {
      createCategory(categoryData);
    }

    setIsDialogOpen(false);
    resetForm();
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open);

    if (!open) {
      resetForm();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>

          <p className="text-muted-foreground">
            Organize os produtos do estoque por categorias.
          </p>
        </div>

        <Button onClick={handleNewCategory}>
          <Plus className="mr-2 size-4" />
          Nova categoria
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Categorias ativas
          </p>

          <p className="mt-2 text-2xl font-bold">{activeCategories}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Categorias inativas
          </p>

          <p className="mt-2 text-2xl font-bold">{inactiveCategories}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            Categorias cadastradas
          </h2>

          <p className="text-sm text-muted-foreground">
            {categories.length} categoria(s) cadastrada(s)
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Tags className="mb-3 size-10 text-muted-foreground" />

            <h3 className="font-medium">
              Nenhuma categoria cadastrada
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre sua primeira categoria para organizar os produtos.
            </p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <Search className="mx-auto mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">Nenhuma categoria encontrada</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Tente pesquisar com outro nome ou descrição.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <div className="divide-y">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Tags className="size-5 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="font-medium">{category.name}</p>

                      <p className="text-sm text-muted-foreground">
                        {category.description || "Sem descrição"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        category.active
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {category.active ? "Ativa" : "Inativa"}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="size-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCategoryStatus(category.id)}
                    >
                      <Power className="mr-2 size-4" />
                      {category.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategoryId !== null
                ? "Editar categoria"
                : "Nova categoria"}
            </DialogTitle>

            <DialogDescription>
              Informe os dados da categoria.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Nome da categoria</Label>

              <Input
                id="categoryName"
                placeholder="Ex.: Produtos de limpeza"
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                  })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="categoryDescription">Descrição</Label>

              <Textarea
                id="categoryDescription"
                placeholder="Descreva os produtos que pertencem a esta categoria."
                value={formData.description}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    description: event.target.value,
                  })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogChange(false)}
              >
                Cancelar
              </Button>

              <Button type="submit">Salvar categoria</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CategoriesPage;