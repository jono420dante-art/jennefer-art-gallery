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

  const defaultContent = `I am a South African realist oil painter inspired by God's creation and the enduring beauty of Africa's people, wildlife, and landscapes.

My work is rooted in careful observation and traditional oil painting techniques. I strive to capture subjects as they truly are — honouring form, proportion, light, and texture — while preserving the emotion and presence that make each subject unique. Whether painting wildlife, portraits, seascapes, or landscapes, my focus is on accuracy, depth, and authenticity.

Africa's distinct light, vast spaces, and rich natural life are constant influences on my work. Living in South Africa allows me to study these elements firsthand and translate them faithfully onto canvas.

Faith quietly underpins my creative process. I see realism as a way of honouring God's creation by depicting it truthfully and with care. Through my art, my aim is to preserve moments of beauty and meaning — paintings that invite reflection, connection, and lasting appreciation.`;

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
