
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll
  });

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Categories</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <p>Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <Card key={category.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-1">{category.name}</CardTitle>
                  <CardDescription>
                    Track prices for all {category.name} products
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Badge variant="outline">{category.slug}</Badge>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/categories/${category.slug}`}>View Products</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground mb-4">
                No categories found.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
