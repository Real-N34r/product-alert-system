
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, priceHistoryApi, alertApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Bell, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { format, parseISO, subDays } from "date-fns";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isAddPriceDialogOpen, setIsAddPriceDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    current_price: "",
    url: "",
  });
  const [newAlert, setNewAlert] = useState({
    threshold: "",
    direction: "down",
  });
  const [newPrice, setNewPrice] = useState({
    price: "",
  });

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => id ? productApi.getById(id) : Promise.reject("No product ID"),
    enabled: !!id,
  });

  const { data: priceHistory, isLoading: priceHistoryLoading } = useQuery({
    queryKey: ['priceHistory', id],
    queryFn: () => id ? priceHistoryApi.getByProductId(id) : Promise.reject("No product ID"),
    enabled: !!id,
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: any }) =>
      productApi.update(id, {
        ...product,
        current_price: parseFloat(product.current_price),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsEditDialogOpen(false);
      toast.success("Product updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error updating product: ${error.message}`);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: productApi.delete,
    onSuccess: () => {
      toast.success("Product deleted successfully!");
      navigate("/products");
    },
    onError: (error: any) => {
      toast.error(`Error deleting product: ${error.message}`);
    }
  });

  const createAlertMutation = useMutation({
    mutationFn: alertApi.create,
    onSuccess: () => {
      toast.success("Alert created successfully!");
      setIsAlertDialogOpen(false);
      setNewAlert({ threshold: "", direction: "down" });
    },
    onError: (error: any) => {
      toast.error(`Error creating alert: ${error.message}`);
    }
  });

  const addPriceMutation = useMutation({
    mutationFn: priceHistoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['priceHistory', id] });
      setIsAddPriceDialogOpen(false);
      setNewPrice({ price: "" });
      toast.success("Price added to history!");
    },
    onError: (error: any) => {
      toast.error(`Error adding price: ${error.message}`);
    }
  });

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      updateProductMutation.mutate({
        id,
        product: editedProduct,
      });
    }
  };

  const handleDeleteProduct = () => {
    if (id && confirm("Are you sure you want to delete this product? This will also delete all associated price history and alerts.")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (id && product) {
      createAlertMutation.mutate({
        product_id: id,
        threshold: parseFloat(newAlert.threshold),
        direction: newAlert.direction as "up" | "down",
      });
    }
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (id) {
      addPriceMutation.mutate({
        product_id: id,
        price: parseFloat(newPrice.price),
      });
    }
  };

  // Set up initial edited product state when product data loads
  if (product && editedProduct.name === "" && !isEditDialogOpen) {
    setEditedProduct({
      name: product.name,
      current_price: product.current_price.toString(),
      url: product.url,
    });
    
    // Initialize new alert threshold with current price
    if (newAlert.threshold === "") {
      setNewAlert({
        ...newAlert,
        threshold: product.current_price.toString(),
      });
    }
    
    // Initialize new price with current price
    if (newPrice.price === "") {
      setNewPrice({
        price: product.current_price.toString(),
      });
    }
  }

  // Format price history for Chart.js
  const chartData = {
    labels: [],
    datasets: [
      {
        label: 'Price',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1
      }
    ]
  };

  // Generate labels for the last 30 days (even if no data points)
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    return format(subDays(today, 29 - i), 'MMM dd');
  });

  if (priceHistory && priceHistory.length > 0) {
    // Create a map of dates to prices
    const priceMap = new Map();
    priceHistory.forEach(record => {
      const date = format(parseISO(record.checked_at), 'MMM dd');
      priceMap.set(date, record.price);
    });
    
    // Fill chartData with values from the map or null for missing dates
    chartData.labels = last30Days;
    chartData.datasets[0].data = last30Days.map(date => priceMap.get(date) || null);
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y}`;
          }
        }
      }
    }
  };

  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="mb-4 flex items-center gap-1"
        >
          <Link to="/products">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">{product.shop?.name}</p>
              <a
                href={product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View product
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {user && (
              <Button
                onClick={() => setIsAlertDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <Bell className="h-4 w-4" />
                Set Alert
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={() => {
                setEditedProduct({
                  name: product.name,
                  current_price: product.current_price.toString(),
                  url: product.url,
                });
                setIsEditDialogOpen(true);
              }}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => {
                if (id && confirm("Are you sure you want to delete this product? This will also delete all associated price history and alerts.")) {
                  productApi.delete(id).then(() => {
                    toast.success("Product deleted successfully!");
                    navigate("/products");
                  }).catch(error => {
                    toast.error(`Error deleting product: ${error.message}`);
                  });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price History (30 Days)</CardTitle>
            <CardDescription>Track how the price has changed over time</CardDescription>
          </CardHeader>
          <CardContent>
            {priceHistoryLoading ? (
              <div className="py-10 text-center">Loading price history...</div>
            ) : priceHistory && priceHistory.length > 0 ? (
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground mb-4">No price history available yet.</p>
                <Button onClick={() => setIsAddPriceDialogOpen(true)}>
                  Add First Price Point
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Current Price</CardTitle>
            <CardDescription>Last updated: {format(parseISO(product.updated_at), 'MMM dd, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <p className="text-4xl font-bold">${product.current_price.toFixed(2)}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setIsAddPriceDialogOpen(true)}
                variant="outline"
                className="w-full flex items-center gap-1 justify-center"
              >
                <Plus className="h-4 w-4" />
                Add Price Point
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Price History Records</h2>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistoryLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : priceHistory && priceHistory.length > 0 ? (
                priceHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(parseISO(record.checked_at), "MMM dd, yyyy 'at' h:mm a")}
                    </TableCell>
                    <TableCell>${record.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6">
                    No price history records available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProduct} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name</Label>
              <Input
                id="edit-name"
                value={editedProduct.name}
                onChange={(e) =>
                  setEditedProduct({ ...editedProduct, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Current Price</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0"
                value={editedProduct.current_price}
                onChange={(e) =>
                  setEditedProduct({
                    ...editedProduct,
                    current_price: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">Product URL</Label>
              <Input
                id="edit-url"
                value={editedProduct.url}
                onChange={(e) =>
                  setEditedProduct({ ...editedProduct, url: e.target.value })
                }
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={updateProductMutation.isPending}
              >
                {updateProductMutation.isPending ? "Updating..." : "Update Product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Set Alert Dialog */}
      <Dialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Price Alert</DialogTitle>
          </DialogHeader>
          {!user ? (
            <div className="pt-4">
              <p className="mb-4">Please sign in to create price alerts.</p>
              <Button asChild className="w-full">
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateAlert} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="threshold">Alert me when price is</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newAlert.threshold}
                  onChange={(e) =>
                    setNewAlert({ ...newAlert, threshold: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direction">Direction</Label>
                <Select
                  value={newAlert.direction}
                  onValueChange={(value) =>
                    setNewAlert({ ...newAlert, direction: value })
                  }
                >
                  <SelectTrigger id="direction">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="down">Below this price (price drops)</SelectItem>
                    <SelectItem value="up">Above this price (price increases)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={createAlertMutation.isPending}
                >
                  {createAlertMutation.isPending ? "Creating..." : "Set Alert"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Price Dialog */}
      <Dialog open={isAddPriceDialogOpen} onOpenChange={setIsAddPriceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Price Point</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPrice} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newPrice.price}
                onChange={(e) => setNewPrice({ price: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={addPriceMutation.isPending}
              >
                {addPriceMutation.isPending ? "Adding..." : "Add Price"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
