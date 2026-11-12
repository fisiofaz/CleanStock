import { useState, type FormEvent } from "react";
import { Plus, Search, Users, UserCheck, UserX } from "lucide-react";

import { useStock } from "@/contexts/StockContext";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { users, createUser, updateUser, toggleUserStatus } = useStock();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"ADMIN" | "OPERATOR">("OPERATOR");

  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const activeUsers = users.filter((user) => user.active).length;
  const inactiveUsers = users.filter((user) => !user.active).length;

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("OPERATOR");
    setEditingUserId(null);
  }

  function handleNewUser() {
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditUser(userId: number) {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setIsDialogOpen(true);
  }

  function handleToggleUserStatus(userId: number) {
    const user = users.find((item) => item.id === userId);

    if (!user) return;

    const action = user.active ? "desativar" : "ativar";

    const confirmed = window.confirm(
      `Deseja realmente ${action} o usuário ${user.name}?`,
    );

    if (!confirmed) return;

    toggleUserStatus(userId);
  }

  function handleCloseDialog() {
    setIsDialogOpen(false);
    resetForm();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    const emailAlreadyExists = users.some(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.id !== editingUserId,
    );

    if (emailAlreadyExists) {
      alert("Este e-mail já está cadastrado.");
      return;
    }

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role,
      active: true,
    };

    if (editingUserId !== null) {
      const currentUser = users.find((user) => user.id === editingUserId);

      updateUser(editingUserId, {
        ...userData,
        active: currentUser?.active ?? true,
      });
    } else {
      createUser(userData);
    }

    handleCloseDialog();
  }

  return (
    <div className="space-y-6">
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsDialogOpen(true);
          } else {
            handleCloseDialog();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>
              {editingUserId !== null ? "Editar usuário" : "Novo usuário"}
            </DialogTitle>

            <DialogDescription>
              Preencha os dados do usuário e defina seu perfil de acesso.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Nome completo</Label>
              <Input
                id="user-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">E-mail</Label>
              <Input
                id="user-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">Telefone</Label>
              <Input
                id="user-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-role">Perfil de acesso</Label>
              <select
                id="user-role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "ADMIN" | "OPERATOR")
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="ADMIN">Administrador</option>
                <option value="OPERATOR">Operador</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancelar
              </Button>

              <Button type="submit">
                {editingUserId !== null
                  ? "Salvar alterações"
                  : "Cadastrar usuário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>

        <p className="text-muted-foreground">
          Gerencie os usuários e seus níveis de acesso ao sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total de usuários</p>
            <Users className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold">{users.length}</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Usuários ativos</p>
            <UserCheck className="size-5 text-green-600" />
          </div>
          <p className="mt-3 text-2xl font-bold">{activeUsers}</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Usuários inativos</p>
            <UserX className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-3 text-2xl font-bold">{inactiveUsers}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <Button type="button" onClick={handleNewUser} className="gap-2">
          <Plus className="size-4" />
          Novo usuário
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="font-semibold">Lista de usuários</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Usuários cadastrados no CleanStock.
        </p>

        <div className="mt-6">
          {filteredUsers.length === 0 ? (
            <div className="py-10 text-center">
              <Users className="mx-auto size-10 text-muted-foreground" />

              <p className="mt-3 font-medium">Nenhum usuário encontrado</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Cadastre um usuário para começar.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Nome</th>
                    <th className="px-3 py-3 font-medium">E-mail</th>
                    <th className="px-3 py-3 font-medium">Telefone</th>
                    <th className="px-3 py-3 font-medium">Perfil</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="px-3 py-4 font-medium">{user.name}</td>

                      <td className="px-3 py-4">{user.email}</td>

                      <td className="px-3 py-4">{user.phone || "—"}</td>

                      <td className="px-3 py-4">
                        {user.role === "ADMIN" ? "Administrador" : "Operador"}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={
                            user.active
                              ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                              : "rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          }
                        >
                          {user.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user.id)}
                          >
                            Editar
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.active ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
