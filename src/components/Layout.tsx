
import { useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  ShoppingBag, 
  Store, 
  Bell, 
  Home, 
  LogOut,
  LogIn,
  Menu,
  X 
} from "lucide-react";

export default function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <BarChart className="h-6 w-6" />
            <span>Price Alert</span>
          </Link>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:underline flex items-center gap-1">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/products" className="text-sm font-medium hover:underline flex items-center gap-1">
              <ShoppingBag className="h-4 w-4" />
              Products
            </Link>
            <Link to="/shops" className="text-sm font-medium hover:underline flex items-center gap-1">
              <Store className="h-4 w-4" />
              Shops
            </Link>
            {user && (
              <Link to="/alerts" className="text-sm font-medium hover:underline flex items-center gap-1">
                <Bell className="h-4 w-4" />
                My Alerts
              </Link>
            )}
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild className="gap-1">
                <Link to="/auth">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container mx-auto py-4 space-y-4">
              <Link 
                to="/" 
                className="block px-2 py-2 text-sm font-medium hover:bg-gray-100 rounded-md flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link 
                to="/products" 
                className="block px-2 py-2 text-sm font-medium hover:bg-gray-100 rounded-md flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <ShoppingBag className="h-4 w-4" />
                Products
              </Link>
              <Link 
                to="/shops" 
                className="block px-2 py-2 text-sm font-medium hover:bg-gray-100 rounded-md flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <Store className="h-4 w-4" />
                Shops
              </Link>
              {user && (
                <Link 
                  to="/alerts" 
                  className="block px-2 py-2 text-sm font-medium hover:bg-gray-100 rounded-md flex items-center gap-2"
                  onClick={closeMobileMenu}
                >
                  <Bell className="h-4 w-4" />
                  My Alerts
                </Link>
              )}
              {user ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    handleSignOut();
                    closeMobileMenu();
                  }} 
                  className="w-full justify-start gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="w-full justify-start gap-2">
                  <Link to="/auth" onClick={closeMobileMenu}>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="container mx-auto py-4 px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Price Alert System. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
