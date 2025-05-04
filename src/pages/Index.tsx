
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, ShoppingBag, Bell, TrendingUp } from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Never Overpay for Products Again</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          Track prices across your favorite shops and get notified when prices drop
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {user ? (
            <>
              <Button asChild size="lg" className="gap-2">
                <Link to="/products">
                  <ShoppingBag className="h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/alerts">
                  <Bell className="h-5 w-5" />
                  Manage Alerts
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg" className="gap-2">
                <Link to="/auth">
                  <AlertTriangle className="h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link to="/products">
                  <ShoppingBag className="h-5 w-5" />
                  Browse Products
                </Link>
              </Button>
            </>
          )}
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Track Products</h3>
            <p className="text-muted-foreground">
              Monitor prices for products across multiple online shops with ease.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Price History</h3>
            <p className="text-muted-foreground">
              View detailed price history charts to find the best time to buy.
            </p>
          </div>
          
          <div className="border rounded-lg p-6 text-center">
            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Price Alerts</h3>
            <p className="text-muted-foreground">
              Set custom alerts to be notified when prices drop or increase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
