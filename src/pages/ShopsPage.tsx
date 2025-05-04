
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Shop } from "@/types/database";

export default function ShopsPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [newShop, setNewShop] = useState({
    name: "",
    base_url: "",
  });

  const { data: shops, isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: shopApi.getAll
  });

  const createShopMutation = useMutation({
    mutationFn: shopApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      setNewShop({ name: "", base_url: "" });
      setIsAddDialogOpen(false);
      toast.success("Shop created successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error creating shop: ${error.message}`);
    }
  });

  const updateShopMutation = useMutation({
    mutationFn: ({ id, shop }: { id: string; shop: Partial<Shop> }) =>
      shopApi.update(id, shop),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      setIsEditDialogOpen(false);
      setCurrentShop(null);
      toast.success("Shop updated successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error updating shop: ${error.message}`);
    }
  });

  const deleteShopMutation = useMutation({
    mutationFn: shopApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      toast.success("Shop deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Error deleting shop: ${error.message}`);
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createShopMutation.mutate(newShop);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentShop) {
      updateShopMutation.mutate({
        id: currentShop.id,
        shop: {
          name: currentShop.name,
          base_url: currentShop.base_url,
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this shop? This will also delete all associated products and price history.")) {
      deleteShopMutation.mutate(id);
    }
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shops</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Shop
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Shop</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name</Label>
                <Input
                  id="name"
                  value={newShop.name}
                  onChange={(e) =>
                    setNewShop({ ...newShop, name: e.target.value })
                  }
                  placeholder="Example Shop"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="base_url">Base URL</Label>
                <Input
                  id="base_url"
                  value={newShop.base_url}
                  onChange={(e) =>
                    setNewShop({ ...newShop, base_url: e.target.value })
                  }
                  placeholder="https://example.com"
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
                  disabled={createShopMutation.isPending}
                >
                  {createShopMutation.isPending ? "Creating..." : "Create Shop"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading shops...</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops && shops.length > 0 ? (
                shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="font-medium">{shop.name}</TableCell>
                    <TableCell>
                      <a
                        href={shop.base_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shop.base_url}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentShop(shop);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(shop.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    No shops found. Add your first shop to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
          </DialogHeader>
          {currentShop && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Shop Name</Label>
                <Input
                  id="edit-name"
                  value={currentShop.name}
                  onChange={(e) =>
                    setCurrentShop({ ...currentShop, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-base_url">Base URL</Label>
                <Input
                  id="edit-base_url"
                  value={currentShop.base_url}
                  onChange={(e) =>
                    setCurrentShop({ ...currentShop, base_url: e.target.value })
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
                  disabled={updateShopMutation.isPending}
                >
                  {updateShopMutation.isPending ? "Updating..." : "Update Shop"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
