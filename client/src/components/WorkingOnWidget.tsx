import { useState } from 'react';
import { ChevronUp, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function WorkingOnWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { data: wipImages = [] } = trpc.wipImages.list.useQuery();

  const nextImage = () => {
    if (wipImages.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % wipImages.length);
    }
  };

  const prevImage = () => {
    if (wipImages.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + wipImages.length) % wipImages.length);
    }
  };

  const currentImage = wipImages[currentImageIndex];
  const averageProgress = wipImages.length > 0 
    ? Math.round(wipImages.reduce((sum, img) => sum + img.progress, 0) / wipImages.length)
    : 0;

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 animate-float">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute top-1/2 left-20 transform -translate-y-1/2 w-80 bg-card border border-border rounded-lg shadow-2xl p-4 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              What I'm Working On
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {wipImages.length > 0 ? (
            <div className="space-y-3">
              {/* Image Gallery */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={currentImage?.imageUrl}
                  alt={currentImage?.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                {wipImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {wipImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    {currentImageIndex + 1} / {wipImages.length}
                  </div>
                )}
              </div>

              {/* Image Info */}
              <div>
                <h4 className="font-medium text-foreground">{currentImage?.title}</h4>
                {currentImage?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentImage.description}
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">
                    {currentImage?.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-full transition-all duration-300"
                    style={{ width: `${currentImage?.progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Dots Indicator */}
              {wipImages.length > 1 && (
                <div className="flex justify-center gap-1.5">
                  {wipImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex 
                          ? 'bg-orange-500' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-3xl mb-2 block">🎨</span>
              <p className="text-sm">No work-in-progress images yet</p>
              <p className="text-xs mt-1">Add some from the admin panel!</p>
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">
                {wipImages.length > 0 ? `${wipImages.length} piece${wipImages.length > 1 ? 's' : ''} in progress` : 'Currently available for commissions'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group flex-shrink-0 ${
          isOpen
            ? 'bg-orange-500 text-white'
            : 'bg-orange-500 text-white hover:shadow-xl hover:scale-110'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl">🎨</span>
          {!isOpen && (
            <span className="text-[10px] font-bold mt-0.5 group-hover:hidden">
              Working
            </span>
          )}
        </div>

        {/* Pulse indicator */}
        <div className="absolute inset-0 rounded-full bg-orange-400/30 animate-pulse" />

        {/* Chevron indicator */}
        <ChevronUp
          size={14}
          className={`absolute bottom-0.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
}
