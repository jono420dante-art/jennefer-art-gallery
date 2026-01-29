import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Edit2, Save, X } from "lucide-react";

export default function About() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const { data: aboutData, isLoading } = trpc.about.get.useQuery();
  const updateAbout = trpc.about.update.useMutation({
    onSuccess: () => {
      toast.success("About page updated successfully!");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("Failed to update about page");
    },
  });

  useEffect(() => {
    if (aboutData) {
      setEditTitle(aboutData.title || "About the Artist");
      setEditContent(aboutData.content);
    }
  }, [aboutData]);

  const handleSave = () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    updateAbout.mutate({
      title: editTitle,
      content: editContent,
    });
  };

  const defaultContent = `Jennefer Ann Gordon Grant is a South African-based professional artist, recognised for her realistic portrait, landscape, seascape, and wildlife paintings.

Born in Salisbury, Rhodesia (now Harare, Zimbabwe), Jennefer developed a deep love for art at a young age, choosing it as one of her main school subjects. Art runs strongly through her family lineage; her parents, Dieuwie and Piet Holthuysen, were both highly respected landscape and wildlife artists in Zimbabwe and played a significant role in nurturing her artistic gifts. Her mother passed away five years ago, while her father, now in his nineties, remains a source of inspiration.

Jennefer's life journey has taken her across the world. She has lived in Mauritius and Dubai before settling in South Africa, where she spent 15 years in the quiet coastal town of George. It was there, in the heart of the Garden Route, that she fully embraced her calling as a professional artist. Her early career included hand-painted crafts and fine art sold at well-known local markets such as the Sedgefield Scarab and Wilderness markets.

Today, Jennefer and her husband reside in the peaceful Belvidere Estate in Knysna, Western Cape. She works from her private studio, surrounded by her three dachshunds and one cat, creating with joy, dedication, and enthusiasm.

Deeply inspired by creation, Jennefer's work reflects what she describes as the "Heartbeat of Africa." Her faith and love for the Creator are central to her artistry, influencing every piece she paints. She is particularly drawn to realism, delighting in expressing the uniqueness and richness of God's colour palette.

Jennefer works across several mediums, including oil, watercolour, acrylic, and pastel, though oils remain her primary medium. Her subject matter is diverse, encompassing portraits, still life, landscapes, and animals. Wildlife, in particular, holds a special place in her heart, and she has donated numerous works to charitable causes—especially animal welfare organisations—believing strongly that animals need humans to be their voices.

Her exhibition history spans many years and locations. Her first exhibition took place in Zimbabwe at the Standard Bank Arena, alongside her family. Since then, she has participated in numerous exhibitions, including shows at the Garden Route Mall in George with Crouse Gallery and the Grahamstown National Arts Festival. Jennefer has also received several accolades, including Best on Show awards in Bathurst and recognition in a NAVS competition in the United States.

Her work has been collected by clients both locally and internationally, with the majority of her paintings created through private commissions. She continues to generously support conservation efforts, having recently donated works to The Tortoise Conservation of South Africa—which sold in Arizona, USA, for $10,000—as well as to Panthera Sanctuary.

Through her art, Jennefer seeks not only to capture beauty, but to honour creation, stir the soul, and tell stories that connect people to nature, faith, and the living world around them.`;

  const displayContent = aboutData?.content || defaultContent;
  const displayTitle = aboutData?.title || "About the Artist";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="heading-font text-6xl gradient-text mb-4">
            {displayTitle}
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto" />
        </div>

        {/* Admin Edit Mode */}
        {user?.role === "admin" && (
          <div className="mb-8 flex justify-center gap-4">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} className="mr-2" />
                Edit About Page
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={updateAbout.isPending}
                  size="sm"
                >
                  <Save size={16} className="mr-2" />
                  {updateAbout.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTitle(displayTitle);
                    setEditContent(displayContent);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : isEditing && user?.role === "admin" ? (
          <Card className="p-8 max-w-4xl mx-auto border-border bg-card">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Title
                </label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-muted border-border"
                  placeholder="About the Artist"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Content
                </label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-muted border-border min-h-96 font-mono text-sm"
                  placeholder="Enter about page content..."
                />
              </div>

              <div className="text-xs text-muted-foreground">
                <p>Tip: Use line breaks to separate paragraphs for better readability.</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 border-border bg-card/50 backdrop-blur-sm">
              <div className="prose prose-invert max-w-none">
                {displayContent.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-lg text-foreground leading-relaxed mb-6 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Artist Focus Areas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <Card className="p-8 border-border bg-card/50 backdrop-blur-sm text-center">
            <div className="heading-font text-3xl gradient-text mb-2">
              REALISM
            </div>
            <p className="text-muted-foreground text-sm">
              Traditional oil painting techniques focused on accuracy and authenticity
            </p>
          </Card>

          <Card className="p-8 border-border bg-card/50 backdrop-blur-sm text-center">
            <div className="heading-font text-3xl gradient-text mb-2">
              AFRICA
            </div>
            <p className="text-muted-foreground text-sm">
              Capturing the distinct light, vast spaces, and natural beauty of the continent
            </p>
          </Card>

          <Card className="p-8 border-border bg-card/50 backdrop-blur-sm text-center">
            <div className="heading-font text-3xl gradient-text mb-2">
              FAITH
            </div>
            <p className="text-muted-foreground text-sm">
              Honouring God's creation through truthful and careful artistic expression
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
