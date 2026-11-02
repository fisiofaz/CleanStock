import { Outlet } from "react-router";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppSidebar from "@/components/layout/AppSidebar";
import AppHeader from "@/components/layout/AppHeader";

function AppLayout() {
    return (
        <SidebarProvider defaultOpen={true}>
            <AppSidebar />

            <SidebarInset className="min-w-0">
                <AppHeader />

                <main className="flex flex-1 flex-col gap-6 overflow-auto p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export default AppLayout;
