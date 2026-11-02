import { BrowserRouter, Routes, Route } from "react-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";

function ProductsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Produtos</h1>

      <p className="mt-2 text-muted-foreground">
        Aqui ficará o gerenciamento dos produtos.
      </p>
    </div>
  );
}

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
