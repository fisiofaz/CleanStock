import { Bell, UserCircle, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/products": "Produtos",
    "/categories": "Categorias",
    "/suppliers": "Fornecedores",
    "/purchases": "Compras",
    "/movements": "Movimentações",
    "/reports": "Relatórios",
    "/users": "Usuários",
};

function AppHeader() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    function handleLogout() {
      logout();
      navigate("/login", { replace: true });
    }

    const currentPage = pageTitles[location.pathname] ?? "CleanStock";

    return (
      <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger />

          <Separator orientation="vertical" className="h-6" />

          <div>
            <h1 className="text-sm font-semibold">{currentPage}</h1>

            <p className="hidden text-xs text-muted-foreground sm:block">
              Sistema de gestão de estoque
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Notificações">
            <Bell className="size-5" />
          </Button>

          <Separator orientation="vertical" className="mx-2 h-6" />

          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <UserCircle className="size-5 text-muted-foreground" />
            </div>

            <div className="hidden flex-col sm:flex">
              <span className="text-sm font-medium">
                {user?.name ?? "Usuário"}
              </span>

              <span className="text-xs text-muted-foreground">
                {user?.role === "ADMIN" ? "Administrador" : "Operador"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair do sistema"
              title="Sair do sistema"
              onClick={handleLogout}
            >
              <LogOut className="size-5" />
            </Button>
          </div>
        </div>
      </header>
    );
}

export default AppHeader;
