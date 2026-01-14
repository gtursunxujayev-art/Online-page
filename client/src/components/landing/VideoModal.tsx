import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useContent } from "@/lib/contentContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const { content } = useContent();

  // Check if we have a video URL
  const hasVideoUrl = content.hero.heroVideoUrl && content.hero.heroVideoUrl.trim() !== "";
  
  // Extract video ID if it's a standard YouTube URL, or use as is if embed URL
  // Simple check for standard youtube watch URL
  let embedUrl = content.hero.heroVideoUrl || "";
  
  if (hasVideoUrl) {
    if (embedUrl.includes("watch?v=")) {
      const videoId = embedUrl.split("v=")[1]?.split("&")[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (embedUrl.includes("youtu.be/")) {
      const videoId = embedUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black overflow-hidden border-none">
        {hasVideoUrl ? (
          <div className="aspect-video w-full">
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video w-full flex items-center justify-center bg-gray-900">
            <div className="text-center p-8">
              <div className="text-white text-6xl mb-4">🎬</div>
              <h3 className="text-white text-xl font-semibold mb-2">Video hozircha mavjud emas</h3>
              <p className="text-gray-400">Tez orada video tayyor bo'ladi va bu yerda ko'rsatiladi.</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
