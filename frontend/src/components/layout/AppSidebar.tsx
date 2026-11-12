import {
    LayoutDashboard,
    Package,
    Tags,
    Truck,
    ShoppingCart,
    ArrowLeftRight,
    ChartNoAxesCombined,
    Users,
    Boxes,
} from "lucide-react";

import { NavLink } from "react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Produtos",
        url: "/products",
        icon: Package,
    },
    {
        title: "Categorias",
        url: "/categories",
        icon: Tags,
    },
    {
        title: "Fornecedores",
        url: "/suppliers",
        icon: Truck,
    },
    {
        title: "Compras",
        url: "/purchases",
        icon: ShoppingCart,
    },
    {
        title: "Movimentações",
        url: "/movements",
        icon: ArrowLeftRight,
    },
    {
        title: "Relatórios",
        url: "/reports",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Usuários",
        url: "/users",
        icon: Users,
    },
];

function AppSidebar() {
    return (
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </div>

            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-base font-bold tracking-tight">
                CleanStock
              </span>
              <span className="text-xs text-muted-foreground">
                Gestão de estoque
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>MENU PRINCIPAL</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className="group/menu-link"
                      >
                        {({ isActive }) => (
                          <SidebarMenuButton
                            isActive={isActive}
                            tooltip={item.title}
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-2 py-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            CleanStock · Versão 1.0
          </div>
        </SidebarFooter>
      </Sidebar>
    );
}

export default AppSidebar;
