import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Trash2, Check, X, Pencil, Star, ArrowRightLeft, Eye, EyeOff, Search, Save, Upload, CheckSquare, Square, Image as ImageIcon, Mail } from "lucide-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { toast } from "sonner";

export default function Admin() {
  const utils = trpc.useUtils();

  // State for artwork form
  const [artworkForm, setArtworkForm] = useState<any>({
    collectionId: "",
    title: "",
    slug: "",
    description: "",
    dimensions: "",
    medium: "",
    priceZar: "",
    priceUsd: "",
    isFeatured: 0,
    displayOrder: 0,
  });
  const [imageFile, setImageFile] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for collection form
  const [collectionForm, setCollectionForm] = useState<any>({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
  });

  // State for editing artworks inline
  const [editingArtworkId, setEditingArtworkId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollection, setFilterCollection] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");

  // Batch selection state
  const [selectedArtworks, setSelectedArtworks] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Queries
  const { data: collections } = trpc.collections.list.useQuery();
  const { data: artworks } = trpc.artworks.list.useQuery();
  const { data: contacts } = trpc.contact.list.useQuery(undefined, {
    enabled: true,
  });
  const { data: allComments } = trpc.comments.listAll.useQuery(undefined, {
    enabled: true,
  });
  const { data: allReviews } = trpc.reviews.listAll.useQuery(undefined, {
    enabled: true,
  });
  const { data: newsletterSubscribers, isLoading: newsletterLoading } = trpc.newsletter.list.useQuery(undefined, {
    enabled: true,
  });

  // Mutations
  const createArtwork = trpc.artworks.create.useMutation({
    onSuccess: () => {
      toast.success("Artwork created successfully!");
      utils.artworks.list.invalidate();
      utils.artworks.featured.invalidate();
      resetArtworkForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create artwork");
    },
  });

  const updateArtwork = trpc.artworks.update.useMutation({
    onSuccess: () => {
      toast.success("Artwork updated successfully!");
      utils.artworks.list.invalidate();
      utils.artworks.featured.invalidate();
      setEditingArtworkId(null);
      setEditForm({});
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update artwork");
    },
  });

  const deleteArtwork = trpc.artworks.delete.useMutation({
    onSuccess: () => {
      toast.success("Artwork deleted successfully!");
      utils.artworks.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete artwork");
    },
  });

  const createCollection = trpc.collections.create.useMutation({
    onSuccess: () => {
      toast.success("Collection created successfully!");
      utils.collections.list.invalidate();
      resetCollectionForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const deleteCollection = trpc.collections.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted successfully!");
      utils.collections.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete collection");
    },
  });

  const approveComment = trpc.comments.approve.useMutation({
    onSuccess: () => {
      toast.success("Comment approved!");
      utils.comments.listAll.invalidate();
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      utils.comments.listAll.invalidate();
    },
  });

  const approveReview = trpc.reviews.approve.useMutation({
    onSuccess: () => {
      toast.success("Review approved!");
      utils.reviews.listAll.invalidate();
    },
  });

  const deleteReview = trpc.reviews.delete.useMutation({
    onSuccess: () => {
      toast.success("Review deleted!");
      utils.reviews.listAll.invalidate();
    },
  });

  const deleteNewsletterSubscriber = trpc.newsletter.delete.useMutation({
    onSuccess: () => {
      toast.success("Subscriber removed from the collector list.");
      utils.newsletter.list.invalidate();
    },
    onError: (error) => toast.error(error.message || "Could not remove this subscriber."),
  });

  const removeNewsletterSubscriber = (id: number, email: string) => {
    if (window.confirm(`Remove ${email} from the collector newsletter list?`)) {
      deleteNewsletterSubscriber.mutate({ id });
    }
  };

  // Filtered artworks
  const filteredArtworks = useMemo(() => {
    if (!artworks) return [];
    return artworks.filter((artwork) => {
      const matchesSearch = searchQuery === "" || 
        artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (artwork.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCollection = filterCollection === "all" || 
        artwork.collectionId.toString() === filterCollection;
      const matchesAvailability = filterAvailability === "all" ||
        (filterAvailability === "available" && artwork.isAvailable === 1) ||
        (filterAvailability === "sold" && artwork.isAvailable === 0);
      return matchesSearch && matchesCollection && matchesAvailability;
    });
  }, [artworks, searchQuery, filterCollection, filterAvailability]);

  const resetArtworkForm = () => {
    setArtworkForm({
      collectionId: "",
      title: "",
      slug: "",
      description: "",
      dimensions: "",
      medium: "",
      priceZar: "",
      priceUsd: "",
      isFeatured: 0,
      displayOrder: 0,
    });
    setImageFile("");
    setImagePreview("");
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      name: "",
      slug: "",
      description: "",
      displayOrder: 0,
    });
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageFile(result);
      setImagePreview(result);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleArtworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an image");
      return;
    }
    if (!artworkForm.collectionId) {
      toast.error("Please select a collection");
      return;
    }
    const trimmedTitle = artworkForm.title.trim();
    const trimmedSlug = artworkForm.slug.trim();
    
    if (!trimmedTitle) {
      toast.error("Please enter a title");
      return;
    }
    const collectionIdNum = parseInt(artworkForm.collectionId);
    if (isNaN(collectionIdNum)) {
      toast.error("Invalid collection selected");
      return;
    }

    let slug = trimmedSlug || trimmedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      toast.error("Please enter a title to generate a slug");
      return;
    }
    slug = `${slug}-${Date.now()}`;

    const priceZar = artworkForm.priceZar ? parseFloat(artworkForm.priceZar) : null;
    const priceUsd = artworkForm.priceUsd ? parseFloat(artworkForm.priceUsd) : null;

    createArtwork.mutate({
      ...artworkForm,
      title: trimmedTitle,
      slug,
      collectionId: collectionIdNum,
      priceZar,
      priceUsd,
      imageBase64: imageFile,
    } as any);
  };

  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCollection.mutate(collectionForm);
  };

  // Start editing an artwork
  const startEditing = (artwork: any) => {
    setEditingArtworkId(artwork.id);
    setEditForm({
      title: artwork.title,
      description: artwork.description || "",
      priceZAR: artwork.priceZar || "",
      priceUSD: artwork.priceUsd || "",
      dimensions: artwork.dimensions || "",
      medium: artwork.medium || "",
      collectionId: artwork.collectionId,
      isAvailable: artwork.isAvailable,
      isFeatured: artwork.isFeatured,
    });
  };

  // Save inline edit
  const saveEdit = (artworkId: number) => {
    updateArtwork.mutate({
      id: artworkId,
      title: editForm.title,
      description: editForm.description,
      priceZAR: editForm.priceZAR || null,
      priceUSD: editForm.priceUSD || null,
      dimensions: editForm.dimensions,
      medium: editForm.medium,
      collectionId: editForm.collectionId,
      isAvailable: editForm.isAvailable,
      isFeatured: editForm.isFeatured,
    });
  };

  // Quick toggle availability
  const toggleAvailability = (artwork: any) => {
    const newStatus = artwork.isAvailable === 1 ? 0 : 1;
    updateArtwork.mutate({
      id: artwork.id,
      isAvailable: newStatus,
    });
    toast.success(newStatus === 0 ? "Marked as SOLD" : "Marked as Available");
  };

  // Quick toggle featured
  const toggleFeatured = (artwork: any) => {
    const newStatus = artwork.isFeatured === 1 ? 0 : 1;
    updateArtwork.mutate({
      id: artwork.id,
      isFeatured: newStatus,
    });
    toast.success(newStatus === 1 ? "Added to Featured" : "Removed from Featured");
  };

  // Quick move to collection
  const moveToCollection = (artworkId: number, newCollectionId: string) => {
    updateArtwork.mutate({
      id: artworkId,
      collectionId: parseInt(newCollectionId),
    });
  };

  // Get collection name by ID
  const getCollectionName = (collectionId: number) => {
    const collection = collections?.find((c) => c.id === collectionId);
    return collection?.name || "Unknown";
  };

  // Batch selection handlers
  const toggleSelectArtwork = (artworkId: number) => {
    const newSelected = new Set(selectedArtworks);
    if (newSelected.has(artworkId)) {
      newSelected.delete(artworkId);
    } else {
      newSelected.add(artworkId);
    }
    setSelectedArtworks(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    const allIds = new Set(filteredArtworks.map((a) => a.id));
    setSelectedArtworks(allIds);
    setShowBulkActions(allIds.size > 0);
  };

  const deselectAll = () => {
    setSelectedArtworks(new Set());
    setShowBulkActions(false);
  };

  // Bulk actions
  const bulkMarkSold = () => {
    selectedArtworks.forEach((id) => {
      updateArtwork.mutate({ id, isAvailable: 0 });
    });
    toast.success(`${selectedArtworks.size} artwork(s) marked as SOLD`);
    deselectAll();
  };

  const bulkMarkAvailable = () => {
    selectedArtworks.forEach((id) => {
      updateArtwork.mutate({ id, isAvailable: 1 });
    });
    toast.success(`${selectedArtworks.size} artwork(s) marked as Available`);
    deselectAll();
  };

  const bulkMoveToCollection = (collectionId: string) => {
    selectedArtworks.forEach((id) => {
      updateArtwork.mutate({ id, collectionId: parseInt(collectionId) });
    });
    toast.success(`${selectedArtworks.size} artwork(s) moved`);
    deselectAll();
  };

  const bulkDelete = () => {
    selectedArtworks.forEach((id) => {
      deleteArtwork.mutate({ id });
    });
    toast.success(`${selectedArtworks.size} artwork(s) deleted`);
    deselectAll();
  };

  return (
    <div className="min-h-screen">
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-font text-6xl gradient-text">ADMIN PANEL</h1>
          <Button variant="outline" onClick={() => window.history.back()} className="transition-all hover:scale-105">
            ← Back
          </Button>
        </div>

        <Tabs defaultValue="artworks" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-6">
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="contacts">Contact Forms</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="subscribers">Collectors</TabsTrigger>
          </TabsList>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-6">
            {/* Add New Artwork Form - Improved */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Plus size={20} className="text-primary" />
                Add New Artwork
              </h2>
              <form onSubmit={handleArtworkSubmit} className="space-y-6">
                {/* Drag & Drop Image Upload */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : imagePreview
                      ? "border-green-500 bg-green-500/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg shadow-md" />
                      <div className="text-left">
                        <p className="text-green-400 font-semibold flex items-center gap-2">
                          <Check size={16} /> Image ready
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">Click or drag to replace</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Upload size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">Drop your artwork image here</p>
                        <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WebP (max 10MB)</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Collection *</Label>
                    <Select
                      value={artworkForm.collectionId}
                      onValueChange={(value) =>
                        setArtworkForm({ ...artworkForm, collectionId: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-background mt-1">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent>
                        {collections?.map((col) => (
                          <SelectItem key={col.id} value={col.id.toString()}>
                            {col.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Title *</Label>
                    <Input
                      value={artworkForm.title}
                      onChange={(e) => setArtworkForm({ ...artworkForm, title: e.target.value })}
                      required
                      className="bg-background mt-1"
                      placeholder="e.g., African Sunset"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Dimensions</Label>
                    <Input
                      value={artworkForm.dimensions}
                      onChange={(e) => setArtworkForm({ ...artworkForm, dimensions: e.target.value })}
                      className="bg-background mt-1"
                      placeholder="e.g., 24x36 inches"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Medium</Label>
                    <Input
                      value={artworkForm.medium}
                      onChange={(e) => setArtworkForm({ ...artworkForm, medium: e.target.value })}
                      className="bg-background mt-1"
                      placeholder="e.g., Oil on canvas"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Price (ZAR)</Label>
                    <Input
                      value={artworkForm.priceZar}
                      onChange={(e) => setArtworkForm({ ...artworkForm, priceZar: e.target.value })}
                      className="bg-background mt-1"
                      placeholder="e.g., 5000"
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Price (USD)</Label>
                    <Input
                      value={artworkForm.priceUsd}
                      onChange={(e) => setArtworkForm({ ...artworkForm, priceUsd: e.target.value })}
                      className="bg-background mt-1"
                      placeholder="e.g., 300"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">Description</Label>
                  <Textarea
                    value={artworkForm.description}
                    onChange={(e) => setArtworkForm({ ...artworkForm, description: e.target.value })}
                    className="bg-background mt-1"
                    rows={3}
                    placeholder="Describe the artwork, inspiration, technique..."
                  />
                </div>

                <Button type="submit" disabled={createArtwork.isPending} size="lg" className="w-full md:w-auto">
                  {createArtwork.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Create Artwork
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Search & Filter Bar */}
            <Card className="p-4 bg-card border-border">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search artworks..."
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
                <div className="min-w-[160px]">
                  <Select value={filterCollection} onValueChange={setFilterCollection}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Collections" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      {collections?.map((col) => (
                        <SelectItem key={col.id} value={col.id.toString()}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[140px]">
                  <Select value={filterAvailability} onValueChange={setFilterAvailability}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <span className="text-sm text-muted-foreground">
                  {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>

            {/* Bulk Actions Toolbar */}
            <Card className={`p-4 bg-primary/10 border-primary/30 transition-all ${showBulkActions ? 'opacity-100' : 'opacity-50'}`}>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={selectAll} className="text-xs">
                    <CheckSquare size={14} className="mr-1" /> Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={deselectAll} className="text-xs">
                    <Square size={14} className="mr-1" /> Deselect
                  </Button>
                  <span className="text-sm font-medium text-primary">
                    {selectedArtworks.size} selected
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkMarkSold}
                    disabled={selectedArtworks.size === 0}
                    className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <EyeOff size={14} className="mr-1" /> Mark Sold
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={bulkMarkAvailable}
                    disabled={selectedArtworks.size === 0}
                    className="text-xs border-green-500/30 text-green-400 hover:bg-green-500/10"
                  >
                    <Eye size={14} className="mr-1" /> Mark Available
                  </Button>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (value) bulkMoveToCollection(value);
                    }}
                    disabled={selectedArtworks.size === 0}
                  >
                    <SelectTrigger className="h-8 text-xs w-[140px] bg-background">
                      <ArrowRightLeft size={12} className="mr-1" />
                      <span>Move to...</span>
                    </SelectTrigger>
                    <SelectContent>
                      {collections?.map((col) => (
                        <SelectItem key={col.id} value={col.id.toString()}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={bulkDelete}
                    disabled={selectedArtworks.size === 0}
                    className="text-xs"
                  >
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </Card>

            {/* Artworks List - Enhanced with Checkboxes */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Manage Artworks</h2>
              <div className="space-y-3">
                {filteredArtworks.map((artwork) => (
                  <div key={artwork.id} className={`p-4 rounded-lg border transition-all ${
                    selectedArtworks.has(artwork.id)
                      ? "bg-primary/5 border-primary/40"
                      : "bg-background border-border"
                  }`}>
                    {editingArtworkId === artwork.id ? (
                      /* Inline Edit Mode */
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                          <img src={artwork.imageUrl} alt={artwork.title} className="w-20 h-20 object-cover rounded" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-foreground mb-1">Editing: {artwork.title}</h3>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="bg-card"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Collection</Label>
                            <Select
                              value={editForm.collectionId?.toString()}
                              onValueChange={(value) => setEditForm({ ...editForm, collectionId: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-card">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {collections?.map((col) => (
                                  <SelectItem key={col.id} value={col.id.toString()}>
                                    {col.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Price (ZAR)</Label>
                            <Input
                              value={editForm.priceZAR}
                              onChange={(e) => setEditForm({ ...editForm, priceZAR: e.target.value })}
                              className="bg-card"
                              placeholder="e.g., 5000"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price (USD)</Label>
                            <Input
                              value={editForm.priceUSD}
                              onChange={(e) => setEditForm({ ...editForm, priceUSD: e.target.value })}
                              className="bg-card"
                              placeholder="e.g., 300"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dimensions</Label>
                            <Input
                              value={editForm.dimensions}
                              onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                              className="bg-card"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Medium</Label>
                            <Input
                              value={editForm.medium}
                              onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                              className="bg-card"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Availability</Label>
                            <Select
                              value={editForm.isAvailable?.toString()}
                              onValueChange={(value) => setEditForm({ ...editForm, isAvailable: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-card">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Available</SelectItem>
                                <SelectItem value="0">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Featured</Label>
                            <Select
                              value={editForm.isFeatured?.toString()}
                              onValueChange={(value) => setEditForm({ ...editForm, isFeatured: parseInt(value) })}
                            >
                              <SelectTrigger className="bg-card">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">No</SelectItem>
                                <SelectItem value="1">Yes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="bg-card"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(artwork.id)}
                            disabled={updateArtwork.isPending}
                          >
                            {updateArtwork.isPending ? (
                              <Loader2 className="mr-1 animate-spin" size={14} />
                            ) : (
                              <Save className="mr-1" size={14} />
                            )}
                            Save Changes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingArtworkId(null); setEditForm({}); }}
                          >
                            <X className="mr-1" size={14} />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSelectArtwork(artwork.id)}
                          className="mt-1 flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
                        >
                          {selectedArtworks.has(artwork.id) ? (
                            <CheckSquare size={18} className="text-primary" />
                          ) : (
                            <Square size={18} className="text-muted-foreground" />
                          )}
                        </button>

                        <img src={artwork.imageUrl} alt={artwork.title} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground">{artwork.title}</h3>
                            {/* Status Badges */}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              artwork.isAvailable === 1 
                                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                                : "bg-red-500/20 text-red-400 border border-red-500/30"
                            }`}>
                              {artwork.isAvailable === 1 ? "Available" : "SOLD"}
                            </span>
                            {artwork.isFeatured === 1 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-semibold">
                                ★ Featured
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="bg-muted px-2 py-0.5 rounded text-xs">{getCollectionName(artwork.collectionId)}</span>
                            {artwork.priceZar && <span>R {artwork.priceZar}</span>}
                            {artwork.priceUsd && <span>${artwork.priceUsd}</span>}
                            {artwork.dimensions && <span>{artwork.dimensions}</span>}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-1 flex-shrink-0">
                          <Button size="sm" variant="outline" onClick={() => startEditing(artwork)} title="Edit artwork">
                            <Pencil size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant={artwork.isAvailable === 1 ? "outline" : "default"}
                            onClick={() => toggleAvailability(artwork)}
                            title={artwork.isAvailable === 1 ? "Mark as Sold" : "Mark as Available"}
                            className={artwork.isAvailable === 0 ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {artwork.isAvailable === 1 ? <EyeOff size={14} /> : <Eye size={14} />}
                          </Button>
                          <Button
                            size="sm"
                            variant={artwork.isFeatured === 1 ? "default" : "outline"}
                            onClick={() => toggleFeatured(artwork)}
                            title={artwork.isFeatured === 1 ? "Remove from Featured" : "Add to Featured"}
                            className={artwork.isFeatured === 1 ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                          >
                            <Star size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteArtwork.mutate({ id: artwork.id })}
                            title="Delete artwork"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {filteredArtworks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No artworks found matching your filters.
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Add New Collection</h2>
              <form onSubmit={handleCollectionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={collectionForm.name}
                      onChange={(e) => setCollectionForm({ ...collectionForm, name: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={collectionForm.slug}
                      onChange={(e) => setCollectionForm({ ...collectionForm, slug: e.target.value })}
                      required
                      className="bg-background"
                      placeholder="collection-slug"
                    />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={collectionForm.description}
                    onChange={(e) => setCollectionForm({ ...collectionForm, description: e.target.value })}
                    className="bg-background"
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={createCollection.isPending}>
                  {createCollection.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Create Collection
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Collections List */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">All Collections</h2>
              <div className="space-y-4">
                {collections?.map((collection) => (
                  <div key={collection.id} className="flex items-center justify-between p-4 bg-background rounded">
                    <div>
                      <h3 className="font-semibold text-foreground">{collection.name}</h3>
                      <p className="text-sm text-muted-foreground">{collection.slug}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCollection.mutate({ id: collection.id })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Submissions</h2>
              <div className="space-y-4">
                {contacts?.map((contact) => (
                  <div key={contact.id} className="p-4 bg-background rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>Subject:</strong> {contact.subject}
                    </p>
                    <p className="text-sm text-foreground">{contact.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Manage Comments</h2>
              <div className="space-y-4">
                {allComments?.map((comment) => (
                  <div key={comment.id} className="p-4 bg-background rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{comment.name}</h3>
                        <p className="text-sm text-muted-foreground">{comment.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {!comment.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveComment.mutate({ id: comment.id })}
                          >
                            <Check size={16} className="mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteComment.mutate({ id: comment.id })}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{comment.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {comment.isApproved ? "Approved" : "Pending"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Manage Reviews</h2>
              <div className="space-y-4">
                {allReviews?.map((review) => (
                  <div key={review.id} className="p-4 bg-background rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{review.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.email}</p>
                        <p className="text-sm text-accent">Rating: {review.rating}⭐</p>
                      </div>
                      <div className="flex gap-2">
                        {!review.isApproved && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveReview.mutate({ id: review.id })}
                          >
                            <Check size={16} className="mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReview.mutate({ id: review.id })}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {review.isApproved ? "Approved" : "Pending"}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card className="border-border bg-card p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-semibold text-foreground"><Mail className="h-5 w-5 text-primary" /> Collector newsletter</h2>
                  <p className="mt-1 text-sm text-muted-foreground">First-party collector signups are available only to Administrators.</p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">{newsletterSubscribers?.length ?? 0} subscribers</span>
              </div>

              {newsletterLoading ? (
                <div className="py-8 text-sm text-muted-foreground">Loading collector subscribers…</div>
              ) : newsletterSubscribers?.length ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr><th className="px-4 py-3">Collector</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Action</th></tr>
                    </thead>
                    <tbody>
                      {newsletterSubscribers.map((subscriber) => (
                        <tr key={subscriber.id} className="border-t border-border bg-background">
                          <td className="px-4 py-3 font-medium text-foreground">{subscriber.firstName} {subscriber.lastName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{subscriber.email}</td>
                          <td className="px-4 py-3 text-muted-foreground">{subscriber.createdAt ? new Date(subscriber.createdAt).toLocaleDateString() : "—"}</td>
                          <td className="px-4 py-3 text-right"><Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10" onClick={() => removeNewsletterSubscriber(subscriber.id, subscriber.email)} disabled={deleteNewsletterSubscriber.isPending}><Trash2 className="mr-1 h-3.5 w-3.5" /> Remove</Button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No collector signups have been recorded yet. New public popup signups will appear here.</div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
