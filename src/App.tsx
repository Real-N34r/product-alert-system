
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import ShopsPage from "./pages/ShopsPage";
import ShopProductsPage from "./pages/ShopProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AlertsPage from "./pages/AlertsPage";
import ScrapePage from "./pages/ScrapePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryProductsPage from "./pages/CategoryProductsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="shops" element={<ShopsPage />} />
              <Route path="shops/:id" element={<ShopProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="categories/:slug" element={<CategoryProductsPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="scrape" element={<ScrapePage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
