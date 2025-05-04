
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function AlertsPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertApi.getUserAlerts,
    enabled: !!user,
  });
  
  const deleteAlertMutation = useMutation({
    mutationFn: alertApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success("Alert deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error deleting alert: ${error.message}`);
    }
  });
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  const handleDeleteAlert = (id: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteAlertMutation.mutate(id);
    }
  };
  
  if (isLoading || alertsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">My Price Alerts</h1>
      
      {alerts && alerts.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Shop</TableHead>
                <TableHead>Current Price</TableHead>
                <TableHead>Alert Threshold</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell>
                    <Link 
                      to={`/products/${alert.product_id}`}
                      className="font-medium hover:underline"
                    >
                      {alert.product?.name || "Unknown Product"}
                    </Link>
                  </TableCell>
                  <TableCell>{alert.product?.shop?.name || "Unknown Shop"}</TableCell>
                  <TableCell>${alert.product?.current_price.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>${alert.threshold.toFixed(2)}</TableCell>
                  <TableCell>
                    {alert.direction === "down" ? (
                      <span className="text-green-600">Below (price drops)</span>
                    ) : (
                      <span className="text-red-600">Above (price increases)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/products/${alert.product_id}`}>
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View Product</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground mb-4">
            You don't have any price alerts yet. Browse products and set alerts to get notified when prices change.
          </p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
