import { useState } from "react";
import { Plus, Truck, Power, Search, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStock, type Supplier } from "@/contexts/StockContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SupplierFormData = {
  name: string;
  document: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
};

function SuppliersPage() {

    const { suppliers, createSupplier, updateSupplier, toggleSupplierStatus } =
      useStock();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplierId, setEditingSupplierId] = useState<number | null>(
      null,
    );
    const [searchTerm, setSearchTerm] = useState("");

    const [formData, setFormData] = useState<SupplierFormData>({
        name: "",
        document: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
    });

    const filteredSuppliers = suppliers.filter((supplier) => {
      const search = searchTerm.toLowerCase().trim();

      return (
        supplier.name.toLowerCase().includes(search) ||
        supplier.document.toLowerCase().includes(search) ||
        supplier.contactName.toLowerCase().includes(search)
      );
    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
      event.preventDefault();

      if (!formData.name.trim()) {
        alert("Informe o nome do fornecedor.");
        return;
      }

      if (!formData.document.trim()) {
        alert("Informe o CPF ou CNPJ.");
        return;
      }

      if (editingSupplierId !== null) {
        const currentSupplier = suppliers.find(
          (supplier) => supplier.id === editingSupplierId,
        );

        updateSupplier(editingSupplierId, {
          ...formData,
          active: currentSupplier?.active ?? true,
        });
      } else {
        createSupplier({
          ...formData,
          active: true,
        });
      }

      setFormData({
        name: "",
        document: "",
        contactName: "",
        phone: "",
        email: "",
        address: "",
      });

      setIsDialogOpen(false);
      setEditingSupplierId(null);
    }

    function handleEditSupplier(supplier: Supplier) {
      setEditingSupplierId(supplier.id);

      setFormData({
        name: supplier.name,
        document: supplier.document,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
      });

      setIsDialogOpen(true);
      
    }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fornecedores</h1>

          <p className="text-muted-foreground">
            Gerencie os fornecedores responsáveis pelo abastecimento do estoque.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingSupplierId(null);

            setFormData({
              name: "",
              document: "",
              contactName: "",
              phone: "",
              email: "",
              address: "",
            });

            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 size-4" />
          Novo fornecedor
        </Button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar por nome, CPF/CNPJ ou contato..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Fornecedores cadastrados</h2>
            <p className="text-sm text-muted-foreground">
              {suppliers.length} fornecedor(es) cadastrado(s)
            </p>
          </div>
        </div>

        {suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <Truck className="mb-3 size-10 text-muted-foreground" />

            <h3 className="font-medium">Nenhum fornecedor cadastrado</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Cadastre seu primeiro fornecedor para começar.
            </p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center">
            <Search className="mx-auto mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">Nenhum fornecedor encontrado</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Tente pesquisar com outro nome, documento ou contato.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <div className="divide-y">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Truck className="size-5 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="font-medium">{supplier.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.document}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {supplier.contactName || "Contato não informado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        supplier.active
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {supplier.active ? "Ativo" : "Inativo"}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => toggleSupplierStatus(supplier.id)}
                    >
                      <Power className="mr-2 size-4" />
                      {supplier.active ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingSupplierId !== null
                ? "Editar fornecedor"
                : "Novo fornecedor"}
            </DialogTitle>

            <DialogDescription>
              Cadastre as informações do fornecedor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do fornecedor</Label>
              <Input
                id="name"
                placeholder="Ex.: Distribuidora Central"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="document">CPF/CNPJ</Label>
              <Input
                id="document"
                placeholder="Digite o CPF ou CNPJ"
                value={formData.document}
                onChange={(event) =>
                  setFormData({ ...formData, document: event.target.value })
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="contactName">Nome do contato</Label>
                <Input
                  id="contactName"
                  placeholder="Nome do responsável"
                  value={formData.contactName}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      contactName: event.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(event) =>
                    setFormData({ ...formData, phone: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com.br"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                placeholder="Rua, número, bairro, cidade e estado"
                value={formData.address}
                onChange={(event) =>
                  setFormData({ ...formData, address: event.target.value })
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit">Salvar fornecedor</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SuppliersPage;