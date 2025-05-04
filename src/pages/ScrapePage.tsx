
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPPORTED_SITES = [
  { id: "startech.com.bd", name: "Star Tech" },
  { id: "ryans.com", name: "Ryans Computers" },
  { id: "techlandbd.com", name: "Tech Land" },
  { id: "ultratech.com.bd", name: "Ultra Tech" },
  { id: "binarylogic.com.bd", name: "Binary Logic" },
  { id: "skyland.com.bd", name: "Skyland" },
];

export default function ScrapePage() {
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScrape = async () => {
    if (!selectedSite) {
      toast.error("Please select a site to scrape");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("scrape-products", {
        body: { site: selectedSite },
      });

      if (error) {
        throw error;
      }

      setResult(data);
      
      if (data.success) {
        toast.success(
          `Successfully scraped products from ${selectedSite}`,
          { duration: 5000 }
        );
      } else {
        toast.error(
          `Error scraping products: ${data.error || "Unknown error"}`,
          { duration: 5000 }
        );
      }
    } catch (error: any) {
      console.error("Scrape error:", error);
      toast.error(`Error: ${error.message || "Failed to scrape products"}`, {
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold mb-6">Scrape Products</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scrape New Products</CardTitle>
          <CardDescription>
            Select a website to scrape product information and prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site to scrape" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_SITES.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleScrape} disabled={isLoading || !selectedSite}>
              {isLoading ? "Scraping..." : "Start Scraping"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center">
              Scraping products... This may take a few minutes.
            </p>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Scrape Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div>
                <p className="mb-4 text-green-600 font-medium">
                  Successfully scraped products
                </p>
                <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[400px]">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-2 text-red-600 font-medium">
                  Error occurred during scraping:
                </p>
                <p>{result.error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
