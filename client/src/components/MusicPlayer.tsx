import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Multiple music sources with fallback
  const musicSources = [
    "https://cdn.pixabay.com/download/audio/2022/03/10/audio_d3d2b9e7e0.mp3", // Pixabay - Ambient
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // SoundHelix
  ];

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;

    const handleCanPlay = () => {
      console.log("Audio can play");
      setHasError(false);
    };

    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setHasError(true);
      setIsPlaying(false);
      
      // Try next source
      if (currentSourceIndex < musicSources.length - 1) {
        setCurrentSourceIndex(currentSourceIndex + 1);
      }
    };

    const handleEnded = () => {
      console.log("Audio ended");
      setIsPlaying(false);
    };

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSourceIndex, musicSources]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        // Reset audio if it ended
        if (audio.ended) {
          audio.currentTime = 0;
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Playback started");
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Playback failed:", error);
              setIsPlaying(false);
            });
        }
      }
    } catch (error) {
      console.error("Play/pause error:", error);
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={musicSources[currentSourceIndex]}
        crossOrigin="anonymous"
        preload="auto"
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

              {/* Error Message */}
              {hasError && (
                <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
                  Music unavailable. Please try again.
                </div>
              )}

              {/* Play/Pause and Mute Controls */}
              <div className="flex gap-2">
                <button
                  onClick={handlePlayPause}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg py-2 transition-colors disabled:opacity-50"
                  disabled={hasError}
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
                <p>Ambient Classical</p>
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
