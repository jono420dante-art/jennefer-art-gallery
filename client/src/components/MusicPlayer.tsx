import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // Classical ambient music URL (royalty-free - Incompetech)
  const musicUrl = "https://www.incompetech.com/music/royalty-free/mp3-preview/Ambient%20Meditation.mp3";

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = volume;

    // Auto-play when component mounts
    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Autoplay prevented by browser policy");
        setIsPlaying(false);
      }
    };

    playAudio();

    // Handle audio end
    const handleAudioEnd = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleAudioEnd);
    return () => audio.removeEventListener("ended", handleAudioEnd);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={musicUrl}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Music Player */}
      <div className="fixed bottom-6 right-6 z-40">
        <div
          className={`bg-card border border-border rounded-full shadow-lg transition-all duration-300 ${
            showControls ? "w-64 p-4" : "w-14 h-14"
          }`}
        >
          {showControls ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  Gallery Music
                </h3>
                <button
                  onClick={() => setShowControls(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Play/Pause and Mute Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg py-2 transition-colors"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} />
                      <span className="text-xs font-medium">Pause</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span className="text-xs font-medium">Play</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleMute}
                  className="flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground rounded-lg px-3 transition-colors"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Volume</label>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(volume * 100)}%
                </p>
              </div>

              {/* Now Playing Info */}
              <div className="text-xs text-muted-foreground text-center border-t border-border pt-2">
                <p className="font-medium text-foreground mb-1">
                  {isPlaying ? "Now Playing" : "Paused"}
                </p>
                <p>Ambient Meditation</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowControls(true)}
              className="w-full h-full flex items-center justify-center hover:bg-muted/50 rounded-full transition-colors"
              title="Open music player"
            >
              <div className="flex flex-col items-center gap-1">
                {isPlaying ? (
                  <>
                    <Music size={20} className="text-accent" />
                    <span className="text-xs text-accent font-semibold">
                      On
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX size={20} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-semibold">
                      Off
                    </span>
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// Music icon component
function Music({ size, className }: { size: number; className: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
