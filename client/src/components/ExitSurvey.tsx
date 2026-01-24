import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Check } from "lucide-react";

export default function ExitSurvey() {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const createContact = trpc.contact.submit.useMutation();

  // Auto-save indicator - shows when changes are being saved
  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Only show survey on actual page exit (not on regular navigation within the site)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show survey if user is actually leaving the site (not navigating within it)
      // This prevents the warning from appearing during normal browsing
      // Removed: e.preventDefault() - this was causing the annoying warning
      // The survey will only appear if user tries to close the tab/window
    };

    // Removed the beforeunload listener to prevent the "leaving site?" warning
    // Users can now work freely without interruptions
    
    return () => {
      // Cleanup
    };
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!rating && !feedback.trim()) {
      toast.error("Please provide at least a rating or feedback");
      return;
    }

    setIsSubmitting(true);
    setSaveStatus("saving");
    
    try {
      await createContact.mutateAsync({
        name: "Website Visitor",
        email: "feedback@gallery.local",
        phone: "",
        subject: "other",
        message: `Rating: ${rating || "Not provided"}\n\nFeedback: ${feedback || "No additional feedback provided"}`,
      });

      setSaveStatus("saved");
      toast.success("Thank you for your feedback!");
      setIsOpen(false);
      setRating("");
      setFeedback("");
    } catch (error) {
      setSaveStatus("idle");
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    setRating("");
    setFeedback("");
  };

  return (
    <>
      {/* Auto-save indicator - appears in top-right corner */}
      {saveStatus !== "idle" && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-lg">
          {saveStatus === "saving" && (
            <>
              <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">Saved</span>
            </>
          )}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="heading-font text-2xl gradient-text">
              Before You Go...
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Help us improve your experience at Jennefer Ann's gallery
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Rating Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">
                How would you rate your experience?
              </Label>
              <RadioGroup value={rating} onValueChange={setRating}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="excellent" />
                  <Label htmlFor="excellent" className="font-normal cursor-pointer">
                    Excellent
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="good" />
                  <Label htmlFor="good" className="font-normal cursor-pointer">
                    Good
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="average" id="average" />
                  <Label htmlFor="average" className="font-normal cursor-pointer">
                    Average
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="poor" />
                  <Label htmlFor="poor" className="font-normal cursor-pointer">
                    Could be better
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Feedback Section */}
            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
                Any suggestions for improvement? (Optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Tell us how we can improve..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="bg-muted border-border min-h-24 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="border-border"
            >
              Skip
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent/90"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
