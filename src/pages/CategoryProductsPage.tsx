
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryApi, alertApi } from "@/services/api";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ExternalLink, BellPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const alertFormSchema = z.object({
  threshold: z.string().min(1, "Please enter a price threshold"),
  direction: z.enum(["down", "up"], {
    required_error: "Please select a price direction",
  }),
});

export default function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  
  const { data: category, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoryApi.getBySlug(slug || ''),
    enabled: !!slug,
  });
  
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['category-products', slug],
    queryFn: () => categoryApi.getProductsByCategory(slug || ''),
    enabled: !!slug,
  });
  
  const form = useForm({
    resolver: zodResolver(alertFormSchema),
    defaultValues: {
      threshold: "",
      direction: "down",
    },
  });
  
  const createCategoryAlertMutation = useMutation({
    mutationFn: (values: z.infer<typeof alertFormSchema>) => {
      if (!category) throw new Error("Category not found");
      
      return alertApi.create({
        category_id: category.id,
        threshold: parseFloat(values.threshold),
        direction: values.direction,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setIsCreateAlertOpen(false);
      form.reset();
      toast.success("Category price alert created successfully!");
    },
    onError: (error: any) => {
      console.error("Error creating category alert:", error);
      if (error.message.includes("must be authenticated")) {
        toast.error("You must be logged in to create an alert");
        navigate('/auth');
      } else {
        toast.error(`Error creating alert: ${error.message}`);
      }
    }
  });
  
  const onSubmit = (values: z.infer<typeof alertFormSchema>) => {
    if (!user) {
      toast.error("You must be logged in to create an alert");
      navigate('/auth');
      return;
    }
    
    createCategoryAlertMutation.mutate(values);
  };
  
  const isLoading = categoryLoading || productsLoading;
  
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="flex justify-center py-10">
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="py-6">
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">Category not found</p>
          <Button asChild>
            <Link to="/categories">Back to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{category.name} Products</h1>
          <p className="text-muted-foreground mt-1">
            Browse and track prices for all {category.name} products
          </p>
        </div>
        
        <Dialog open={isCreateAlertOpen} onOpenChange={setIsCreateAlertOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <BellPlus className="h-4 w-4" />
              Set Price Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert for {category.name}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Threshold</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Alert me when the price goes:</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="down" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Below threshold (price drops)
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="up" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Above threshold (price increases)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={createCategoryAlertMutation.isPending}
                  >
                    {createCategoryAlertMutation.isPending
                      ? "Creating..."
                      : "Create Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
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
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground mb-4">
            No {category.name} products found yet.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Products will appear here when they are scraped from supported stores.
          </p>
        </div>
      )}
    </div>
  );
}
