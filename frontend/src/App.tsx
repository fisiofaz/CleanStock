import { BrowserRouter, Routes, Route } from "react-router";

import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import { StockProvider } from "@/contexts/StockContext";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import MovementsPage from "@/pages/MovementsPage";
import SuppliersPage from "@/pages/SuppliersPage";
import PurchasesPage from "@/pages/PurchasesPage";
import ReportsPage from "@/pages/ReportsPage";
import UsersPage from "@/pages/UsersPage";



function App() {
  return (
    <TooltipProvider>
      <StockProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/movements" element={<MovementsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StockProvider>
    </TooltipProvider>
  );
}

export default App;
