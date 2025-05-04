
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productApi, shopApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function ShopProductsPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', id],
    queryFn: () => id ? shopApi.getById(id) : Promise.reject("No shop ID"),
    enabled: !!id,
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'shop', id],
    queryFn: () => id ? productApi.getByShopId(id) : Promise.reject("No shop ID"),
    enabled: !!id,
  });

  if (shopLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="py-10 text-center">
        <h2 className="text-2xl font-bold mb-4">Shop Not Found</h2>
        <p className="mb-6">The shop you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link to="/shops">Back to Shops</Link>
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
          <Link to="/shops">
            <ArrowLeft className="h-4 w-4" />
            Back to Shops
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-muted-foreground">
              {products ? `${products.length} products` : 'No products'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={shop.base_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                <ExternalLink className="h-4 w-4" />
                Visit Website
              </a>
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = `/api/scrape-products?site=${new URL(shop.base_url).hostname}`}>
              Refresh Products
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products && products.length > 0 ? (
          products.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <h2 className="text-xl font-medium mb-2 line-clamp-2">{product.name}</h2>
                  <div className="flex justify-between items-baseline mb-4">
                    <p className="text-2xl font-bold">${product.current_price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Updated {format(parseISO(product.updated_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button asChild>
                      <Link to={`/products/${product.id}`}>View History</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <ExternalLink className="h-4 w-4" />
                        View on {shop.name}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-10 text-center">
            <p className="mb-4 text-muted-foreground">No products found for this shop.</p>
            <Button variant="secondary" onClick={() => window.location.href = `/api/scrape-products?site=${new URL(shop.base_url).hostname}`}>
              Scrape Products
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
