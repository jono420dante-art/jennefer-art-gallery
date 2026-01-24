import { useState } from 'react';
import { ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkStatus {
  title: string;
  description: string;
  status: 'working' | 'available' | 'commission';
  completionPercentage?: number;
}

const defaultStatus: WorkStatus = {
  title: "Currently Working On",
  description: "New artwork series - Portraits & Landscapes",
  status: 'working',
  completionPercentage: 65
};

export default function WorkingOnWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [status] = useState<WorkStatus>(defaultStatus);

  const statusColors = {
    working: 'bg-blue-500',
    available: 'bg-green-500',
    commission: 'bg-orange-500'
  };

  const statusLabels = {
    working: 'Working',
    available: 'Available',
    commission: 'Commission'
  };

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40 animate-float">
      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute top-1/2 left-20 transform -translate-y-1/2 w-80 bg-card border border-border rounded-lg shadow-2xl p-6 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              {status.title}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {status.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[status.status]} animate-pulse`} />
              <span className="text-sm font-medium text-foreground">
                {statusLabels[status.status]}
              </span>
            </div>

            {status.completionPercentage !== undefined && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">
                    {status.completionPercentage}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-accent to-accent/70 h-full transition-all duration-300"
                    style={{ width: `${status.completionPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group flex-shrink-0 ${
          isOpen
            ? 'bg-accent text-accent-foreground'
            : 'bg-primary text-primary-foreground hover:shadow-xl hover:scale-110'
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-2xl">🎨</span>
          {!isOpen && (
            <span className="text-xs font-bold mt-1 group-hover:hidden">
              Working
            </span>
          )}
        </div>

        {/* Pulse indicator */}
        {status.status === 'working' && (
          <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse" />
        )}

        {/* Chevron indicator */}
        <ChevronUp
          size={16}
          className={`absolute bottom-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
}
