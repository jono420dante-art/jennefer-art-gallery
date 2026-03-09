import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function WorkInProgressSection() {
  const { data: wipImages, isLoading } = trpc.wipImages.list.useQuery();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <section className="container py-20">
        <div className="section-divider" />
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </section>
    );
  }

  if (!wipImages || wipImages.length === 0) {
    return null;
  }

  const currentImage = wipImages[currentIndex];
  const progressPercentage = currentImage.progress || 0;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? wipImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === wipImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="container py-20">
      <div className="section-divider" />
      <div className="text-center mb-16">
        <h2 className="heading-font text-5xl gradient-text mb-6">WORK IN PROGRESS</h2>
        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-6" />
        <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
          Peek behind the scenes at Jennefer's current projects and artistic process
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden bg-card border-border">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={currentImage.imageUrl}
              alt={currentImage.title}
              className="w-full h-full object-cover"
            />
            
            {/* Progress Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{currentImage.title}</span>
                  <span className="text-accent font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent to-primary h-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              {currentImage.description && (
                <p className="text-sm text-white/90 line-clamp-2">
                  {currentImage.description}
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Image Counter and Dots */}
          <div className="p-6 bg-card">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {wipImages.length}
              </span>
              
              {/* Dot Navigation */}
              <div className="flex gap-2">
                {wipImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? "bg-accent w-6"
                        : "bg-muted-foreground/50 hover:bg-muted-foreground"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>

              {/* View Details Button */}
              <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                View Details
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            These works are currently in progress. Interested in commissioning a custom piece? 
            <span className="block mt-2">
              <a href="/contact" className="text-accent hover:text-accent/80 font-semibold">
                Get in touch with Jennefer
              </a>
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
