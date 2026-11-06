import { BrowserRouter, Routes, Route } from "react-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import { StockProvider } from "@/contexts/StockContext";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import MovementsPage from "@/pages/MovementsPage";
import SuppliersPage from "@/pages/SuppliersPage";
import PurchasesPage from "@/pages/PurchasesPage";

function App() {
  return (
    <TooltipProvider>
      <StockProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/movements" element={<MovementsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StockProvider>
    </TooltipProvider>
  );
}

export default App;
