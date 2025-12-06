import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useContent } from "@/lib/contentContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const { content } = useContent();

  // Extract video ID if it's a standard YouTube URL, or use as is if embed URL
  // Simple check for standard youtube watch URL
  let embedUrl = content.hero.heroVideoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";
  
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black overflow-hidden border-none">
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
      </DialogContent>
    </Dialog>
  );
}
