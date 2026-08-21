import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, Filter } from "lucide-react";
import { Link } from "wouter";

export default function Showcase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"title" | "price" | "newest">("title");

  // Fetch collections with error handling
  const {
    data: collections = [],
    isLoading: collectionsLoading,
    error: collectionsError,
  } = trpc.collections.list.useQuery();

  // Fetch all artworks with error handling
  const {
    data: allArtworks = [],
    isLoading: artworksLoading,
    error: artworksError,
  } = trpc.artworks.list.useQuery();

  // Filter and sort artworks with validation
  const filteredArtworks = useMemo(() => {
    try {
      let filtered = Array.isArray(allArtworks) ? [...allArtworks] : [];

      // Filter by collection
      if (selectedCollection !== "all") {
        const collectionId = parseInt(selectedCollection, 10);
        if (!isNaN(collectionId)) {
          filtered = filtered.filter((art) => art.collectionId === collectionId);
        }
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (art) =>
            (art.title?.toLowerCase() || "").includes(term) ||
            (art.description?.toLowerCase() || "").includes(term)
        );
      }

      // Sort with validation
      filtered.sort((a, b) => {
        switch (sortBy) {
          case "price":
            const priceA = Number(a.priceUsd) || Number(a.priceZar) || 0;
            const priceB = Number(b.priceUsd) || Number(b.priceZar) || 0;
            return priceA - priceB;
          case "newest":
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          case "title":
          default:
            return (a.title || "").localeCompare(b.title || "");
        }
      });

      return filtered;
    } catch (error) {
      console.error("Error filtering artworks:", error);
      return [];
    }
  }, [allArtworks, selectedCollection, searchTerm, sortBy]);

  // Calculate statistics with error handling
  const stats = useMemo(() => {
    try {
      return {
        totalArtworks: Array.isArray(allArtworks) ? allArtworks.length : 0,
        totalCollections: Array.isArray(collections) ? collections.length : 0,
        forSaleCount: Array.isArray(allArtworks)
          ? allArtworks.filter((art) => art.isAvailable).length
          : 0,
        averagePrice:
          Array.isArray(allArtworks) && allArtworks.length > 0
            ? (
                allArtworks.reduce(
                  (sum, art) => sum + (Number(art.priceUsd) || 0),
                  0
                ) / allArtworks.length
              ).toFixed(2)
            : "0",
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return {
        totalArtworks: 0,
        totalCollections: 0,
        forSaleCount: 0,
        averagePrice: "0",
      };
    }
  }, [allArtworks, collections]);

  const isLoading = collectionsLoading || artworksLoading;
  const hasError = collectionsError || artworksError;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-card to-background py-12 md:py-20 border-b border-border">
        <div className="container">
          <h1 className="heading-font text-5xl md:text-7xl gradient-text mb-4">
            Gallery Showcase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore Jennefer Ann's complete collection of realist oil paintings
            capturing the beauty of Africa's people, wildlife, and landscapes.
          </p>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 md:py-16 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {stats.totalArtworks}
              </div>
              <p className="text-sm text-muted-foreground">Total Artworks</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {stats.totalCollections}
              </div>
              <p className="text-sm text-muted-foreground">Collections</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                {stats.forSaleCount}
              </div>
              <p className="text-sm text-muted-foreground">Available for Sale</p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">
                ${stats.averagePrice}
              </div>
              <p className="text-sm text-muted-foreground">Average Price</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search */}
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Search Artworks
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Collection Filter */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Collection
              </label>
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger>
                  <SelectValue placeholder="All Collections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {Array.isArray(collections) &&
                    collections.map((collection) => (
                      <SelectItem
                        key={collection.id}
                        value={collection.id.toString()}
                      >
                        {collection.name || "Unnamed"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full md:w-48">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title (A-Z)</SelectItem>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-accent" size={40} />
            </div>
          ) : hasError ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">
                Error loading gallery. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">
                No artworks found matching your criteria.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCollection("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center gap-2">
                <Filter size={20} className="text-accent" />
                <p className="text-muted-foreground">
                  Showing {filteredArtworks.length} of {stats.totalArtworks}{" "}
                  artworks
                </p>
              </div>

              {/* Artworks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtworks.map((artwork) => (
                  <Link
                    key={artwork.id}
                    href={`/artwork/${artwork.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      {/* Image */}
                      <div className="relative overflow-hidden bg-muted h-64">
                        {artwork.imageUrl ? (
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title || "Artwork"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={handleImageError}
                          />
                        ) : null}
                        {!artwork.imageUrl && (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">
                              No Image Available
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                          {artwork.title || "Untitled"}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {artwork.description || "No description"}
                        </p>

                        {/* Metadata */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          {artwork.dimensions && (
                            <p>
                              <span className="font-medium">Dimensions:</span>{" "}
                              {artwork.dimensions}
                            </p>
                          )}
                          {artwork.medium && (
                            <p>
                              <span className="font-medium">Medium:</span>{" "}
                              {artwork.medium}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mt-4 pt-4 border-t border-border">
                          {artwork.priceUsd || artwork.priceZar ? (
                            <div className="space-y-0.5">
                              {artwork.priceZar && (
                                <p className="font-semibold text-accent">R {artwork.priceZar}</p>
                              )}
                              {artwork.priceUsd && (
                                <p className="text-xs text-muted-foreground">${artwork.priceUsd} USD</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Price on request
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-card border-t border-border">
        <div className="container text-center">
          <h2 className="heading-font text-4xl md:text-5xl gradient-text mb-6">
            Ready to Own a Piece?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse the full gallery or commission a custom artwork. Contact
            Jennefer Ann today to discuss your vision.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/gallery">
              <Button className="w-full sm:w-auto">Explore Gallery</Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="w-full sm:w-auto">
                Commission Artwork
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
