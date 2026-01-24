import { useAuth } from "@/_core/hooks/useAuth";
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
import { Loader2, Plus, Trash2, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Admin() {
  const [, setLocation] = useLocation();

  // Check if user is authenticated as admin
  useEffect(() => {
    const isAdminAuth = localStorage.getItem("adminAuth");
    if (!isAdminAuth) {
      setLocation("/admin-login");
    }
  }, [setLocation]);
  const utils = trpc.useUtils();
  const isAdminAuth = localStorage.getItem("adminAuth");

  if (!isAdminAuth) {
    return null; // Will redirect via useEffect
  }

  // State for artwork form
  const [artworkForm, setArtworkForm] = useState({
    collectionId: "",
    title: "",
    slug: "",
    description: "",
    dimensions: "",
    medium: "",
    priceZAR: "",
    priceUSD: "",
    isFeatured: 0,
    displayOrder: 0,
  });
  const [imageFile, setImageFile] = useState<string>("");

  // State for collection form
  const [collectionForm, setCollectionForm] = useState({
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
  });

  // Queries
  const { data: collections } = trpc.collections.list.useQuery();
  const { data: artworks } = trpc.artworks.list.useQuery();
  const { data: contacts } = trpc.contact.list.useQuery(undefined, {
    enabled: Boolean(isAdminAuth),
  });
  const { data: allComments } = trpc.comments.listAll.useQuery(undefined, {
    enabled: Boolean(isAdminAuth),
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

  const resetArtworkForm = () => {
    setArtworkForm({
      collectionId: "",
      title: "",
      slug: "",
      description: "",
      dimensions: "",
      medium: "",
      priceZAR: "",
      priceUSD: "",
      isFeatured: 0,
      displayOrder: 0,
    });
    setImageFile("");
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      name: "",
      slug: "",
      description: "",
      displayOrder: 0,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("File selected:", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Image loaded, setting state");
        setImageFile(reader.result as string);
      };
      reader.onerror = () => {
        console.error("FileReader error:", reader.error);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
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
    // Trim all string fields to remove leading/trailing spaces
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

    // Auto-generate slug from title if not provided
    const slug = trimmedSlug || trimmedTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (!slug) {
      toast.error("Please enter a title to generate a slug");
      return;
    }

    const priceZAR = artworkForm.priceZAR ? parseFloat(artworkForm.priceZAR) : null;
    const priceUSD = artworkForm.priceUSD ? parseFloat(artworkForm.priceUSD) : null;

    createArtwork.mutate({
      ...artworkForm,
      title: trimmedTitle,
      slug,
      collectionId: collectionIdNum,
      priceZAR: priceZAR as any,
      priceUSD: priceUSD as any,
      imageBase64: imageFile,
    });
  };

  const handleCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCollection.mutate(collectionForm);
  };

  // Admin is authenticated via localStorage check above

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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="artworks">Artworks</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          {/* Artworks Tab */}
          <TabsContent value="artworks" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Add New Artwork</h2>
              <form onSubmit={handleArtworkSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Collection *</Label>
                    <Select
                      value={artworkForm.collectionId}
                      onValueChange={(value) =>
                        setArtworkForm({ ...artworkForm, collectionId: value })
                      }
                      required
                    >
                      <SelectTrigger className="bg-background">
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
                    <Label>Title *</Label>
                    <Input
                      value={artworkForm.title}
                      onChange={(e) => setArtworkForm({ ...artworkForm, title: e.target.value })}
                      required
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <Label>Slug *</Label>
                    <Input
                      value={artworkForm.slug}
                      onChange={(e) => setArtworkForm({ ...artworkForm, slug: e.target.value })}
                      required
                      className="bg-background"
                      placeholder="artwork-title-slug"
                    />
                  </div>

                  <div>
                    <Label>Dimensions</Label>
                    <Input
                      value={artworkForm.dimensions}
                      onChange={(e) => setArtworkForm({ ...artworkForm, dimensions: e.target.value })}
                      className="bg-background"
                      placeholder="e.g., 24x36 inches"
                    />
                  </div>

                  <div>
                    <Label>Medium</Label>
                    <Input
                      value={artworkForm.medium}
                      onChange={(e) => setArtworkForm({ ...artworkForm, medium: e.target.value })}
                      className="bg-background"
                      placeholder="e.g., Oil on canvas"
                    />
                  </div>

                  <div>
                    <Label>Price (ZAR)</Label>
                    <Input
                      value={artworkForm.priceZAR}
                      onChange={(e) => setArtworkForm({ ...artworkForm, priceZAR: e.target.value })}
                      className="bg-background"
                      placeholder="5000"
                    />
                  </div>

                  <div>
                    <Label>Price (USD)</Label>
                    <Input
                      value={artworkForm.priceUSD}
                      onChange={(e) => setArtworkForm({ ...artworkForm, priceUSD: e.target.value })}
                      className="bg-background"
                      placeholder="300"
                    />
                  </div>

                  <div>
                    <Label>Featured</Label>
                    <Select
                      value={artworkForm.isFeatured.toString()}
                      onValueChange={(value) =>
                        setArtworkForm({ ...artworkForm, isFeatured: parseInt(value) })
                      }
                    >
                      <SelectTrigger className="bg-background">
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
                  <Label>Description</Label>
                  <Textarea
                    value={artworkForm.description}
                    onChange={(e) => setArtworkForm({ ...artworkForm, description: e.target.value })}
                    className="bg-background"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Image *</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    required
                    className="bg-background"
                  />
                  {imageFile && (
                    <img src={imageFile} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded" />
                  )}
                </div>

                <Button type="submit" disabled={createArtwork.isPending}>
                  {createArtwork.isPending ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2" size={16} />
                      Create Artwork
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Artworks List */}
            <Card className="p-6 bg-card border-border">
              <h2 className="text-2xl font-semibold text-foreground mb-4">All Artworks</h2>
              <div className="space-y-4">
                {artworks?.map((artwork) => (
                  <div key={artwork.id} className="flex items-center justify-between p-4 bg-background rounded">
                    <div className="flex items-center gap-4">
                      <img src={artwork.imageUrl} alt={artwork.title} className="w-16 h-16 object-cover rounded" />
                      <div>
                        <h3 className="font-semibold text-foreground">{artwork.title}</h3>
                        <p className="text-sm text-muted-foreground">{artwork.slug}</p>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteArtwork.mutate({ id: artwork.id })}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
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
        </Tabs>
      </section>
    </div>
  );
}
