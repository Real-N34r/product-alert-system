
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { shopApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Plus, ExternalLink } from 'lucide-react';

export default function ShopsPage() {
  const [isAddShopDialogOpen, setIsAddShopDialogOpen] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', base_url: '' });
  const queryClient = useQueryClient();

  const { data: shops, isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: shopApi.getAll,
  });

  const createShopMutation = useMutation({
    mutationFn: shopApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shops'] });
      setIsAddShopDialogOpen(false);
      setNewShop({ name: '', base_url: '' });
      toast.success('Shop added successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error creating shop: ${error.message}`);
    }
  });

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure base_url has http/https prefix
    let formattedBaseUrl = newShop.base_url;
    if (!formattedBaseUrl.startsWith('http://') && !formattedBaseUrl.startsWith('https://')) {
      formattedBaseUrl = `https://${formattedBaseUrl}`;
    }
    
    createShopMutation.mutate({
      name: newShop.name,
      base_url: formattedBaseUrl,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading shops...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shops</h1>
        <Button onClick={() => setIsAddShopDialogOpen(true)} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Add Shop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops && shops.length > 0 ? (
          shops.map((shop) => (
            <Card key={shop.id}>
              <CardHeader className="pb-2">
                <CardTitle>{shop.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={shop.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
                >
                  <ExternalLink className="h-4 w-4" /> {shop.base_url}
                </a>
                <div className="flex gap-2">
                  <Button asChild className="w-full">
                    <Link to={`/shops/${shop.id}`}>View Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground mb-4">No shops found. Add a shop to get started!</p>
            <Button onClick={() => setIsAddShopDialogOpen(true)}>Add First Shop</Button>
          </div>
        )}
      </div>

      {/* Add Shop Dialog */}
      <Dialog open={isAddShopDialogOpen} onOpenChange={setIsAddShopDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shop</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddShop} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={newShop.name}
                onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                placeholder="e.g. Amazon"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base-url">Shop URL</Label>
              <Input
                id="base-url"
                value={newShop.base_url}
                onChange={(e) => setNewShop({ ...newShop, base_url: e.target.value })}
                placeholder="e.g. https://amazon.com"
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={createShopMutation.isPending}>
                {createShopMutation.isPending ? 'Adding...' : 'Add Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
