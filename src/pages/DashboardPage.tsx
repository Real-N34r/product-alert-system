
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { alertApi } from "@/services/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertApi.getUserAlerts,
    enabled: !!user,
  });
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>My Alerts</CardTitle>
            <CardDescription>Monitor your price alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <p>Loading alerts...</p>
            ) : (
              <>
                <p className="mb-4">
                  You have {alerts?.length || 0} active price alerts.
                </p>
                <Button asChild>
                  <Link to="/alerts" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Manage Alerts
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Browse and track products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Explore products and set price alerts.
            </p>
            <Button asChild>
              <Link to="/products" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Browse Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
