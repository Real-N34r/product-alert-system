
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, shopApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    shop_id: "",
    current_price: "",
    url: "",
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getAll
  });

  const { data: shops, isLoading: shopsLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: shopApi.getAll
  });

  const createProductMutation = useMutation({
    mutationFn: (product: any) => productApi.create({
      ...product,
      current_price: parseFloat(product.current_price)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setNewProduct({ name: "", shop_id: "", current_price: "", url: "" });
      setIsAddDialogOpen(false);
      toast.success("Product created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error creating product: ${error.message}`);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.shop_id) {
      toast.error("Please select a shop");
      return;
    }
    createProductMutation.mutate(newProduct);
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Product Name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop">Shop</Label>
                <Select
                  value={newProduct.shop_id}
                  onValueChange={(value) =>
                    setNewProduct({ ...newProduct, shop_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a shop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {shops?.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_price">Current Price</Label>
                <Input
                  id="current_price"
                  value={newProduct.current_price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, current_price: e.target.value })
                  }
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Product URL</Label>
                <Input
                  id="url"
                  value={newProduct.url}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, url: e.target.value })
                  }
                  placeholder="https://example.com/product"
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
                  disabled={createProductMutation.isPending || shopsLoading}
                >
                  {createProductMutation.isPending ? "Creating..." : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {productsLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products && products.length > 0 ? (
            products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{product.name}</CardTitle>
                  <CardDescription>
                    {product.shop?.name || "Unknown Shop"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-2xl font-bold mb-2">
                    ${product.current_price.toFixed(2)}
                  </p>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on {product.shop?.name}
                  </a>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/products/${product.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground mb-4">
                No products found. Add your first product to start tracking prices.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                Add Your First Product
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
