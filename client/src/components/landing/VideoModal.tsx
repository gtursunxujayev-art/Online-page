import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useContent } from "@/lib/contentContext";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ isOpen, onClose }: VideoModalProps) {
  const { content } = useContent();

  const getSafeYouTubeEmbedUrl = (rawUrl: string): string => {
    if (!rawUrl.trim()) {
      return "";
    }

    try {
      const parsed = new URL(rawUrl.trim());
      const host = parsed.hostname.toLowerCase();

      if (host === "youtu.be") {
        const videoId = parsed.pathname.replace("/", "").trim();
        return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
      }

      if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
        if (parsed.pathname === "/watch") {
          const videoId = parsed.searchParams.get("v");
          return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
        }

        if (parsed.pathname.startsWith("/embed/")) {
          const videoId = parsed.pathname.split("/embed/")[1]?.split("/")[0];
          return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
        }
      }
    } catch {
      return "";
    }

    return "";
  };

  // Check if we have a video URL
  const hasVideoUrl = content.hero.heroVideoUrl && content.hero.heroVideoUrl.trim() !== "";
  const embedUrl = getSafeYouTubeEmbedUrl(content.hero.heroVideoUrl || "");
  const canRenderEmbed = hasVideoUrl && !!embedUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-black overflow-hidden border-none">
        {canRenderEmbed ? (
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
