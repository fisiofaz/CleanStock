import { BrowserRouter, Routes, Route } from "react-router";
import { TooltipProvider } from "@/components/ui/tooltip";
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
