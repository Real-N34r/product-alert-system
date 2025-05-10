
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertApi, categoryApi } from "@/services/api";
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
import { Badge } from "@/components/ui/badge";

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
  
  // Group alerts by type (product or category)
  const productAlerts = alerts?.filter(alert => alert.product_id) || [];
  const categoryAlerts = alerts?.filter(alert => alert.category_id) || [];
  
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">My Price Alerts</h1>
      
      {alerts && alerts.length > 0 ? (
        <>
          {productAlerts.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Product Alerts</h2>
              <div className="border rounded-md mb-8">
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
                    {productAlerts.map((alert) => (
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
                            <Badge variant="success" className="bg-green-500">Below (price drops)</Badge>
                          ) : (
                            <Badge variant="destructive">Above (price increases)</Badge>
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
            </>
          )}
          
          {categoryAlerts.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-3">Category Alerts</h2>
              <div className="border rounded-md mb-8">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Alert Threshold</TableHead>
                      <TableHead>Direction</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          {/* We'll need to fetch category data separately since we don't have it joined */}
                          <CategoryName id={alert.category_id} />
                        </TableCell>
                        <TableCell>${alert.threshold.toFixed(2)}</TableCell>
                        <TableCell>
                          {alert.direction === "down" ? (
                            <Badge variant="success" className="bg-green-500">Below (price drops)</Badge>
                          ) : (
                            <Badge variant="destructive">Above (price increases)</Badge>
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
                              <Link to={`/categories/${alert.category_id}`}>
                                <ExternalLink className="h-4 w-4" />
                                <span className="sr-only">View Category</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground mb-4">
            You don't have any price alerts yet. Browse products and set alerts to get notified when prices change.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Component to fetch and display category name
function CategoryName({ id }: { id?: string }) {
  const { data: category } = useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id || ''),
    enabled: !!id,
  });
  
  return (
    <Link 
      to={`/categories/${category?.slug}`}
      className="font-medium hover:underline"
    >
      {category?.name || "Unknown Category"}
    </Link>
  );
}
