import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { buildToastErrorDescription } from "@/lib/apiErrors";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isDev = import.meta.env.DEV;

  // Check API health when modal opens
  useEffect(() => {
    if (isOpen) {
      api.test().then((isHealthy) => {
        if (!isHealthy && isDev) {
          console.warn("API endpoint is not reachable.");
        }
      });
    }
  }, [isOpen, isDev]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  const getUTMParameters = () => {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    const utmFields = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_referrer",
      "referrer",
      "fbclid",
      "gclid",
    ];

    utmFields.forEach((field) => {
      const value = params.get(field);
      if (value) {
        utmParams[field] = value;
      }
    });

    if (!utmParams.referrer && document.referrer) {
      utmParams.referrer = document.referrer;
    }

    utmParams.form = "registration-modal";

    return utmParams;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (phone.length !== 9) {
      toast({
        title: "Xatolik",
        description: "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const utmParams = getUTMParameters();

      const response = await api.leads.create({
        name,
        phone: `+998${phone}`,
        job,
        source: "registration",
        ...utmParams,
      });

      const responseClone = response.clone();

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        if (isDev) {
          console.error("Failed to parse response:", parseError);
        }
        const text = await responseClone.text();
        if (isDev) {
          console.error("Response text:", text);
        }
        if (text) {
          if (text.includes("FUNCTION_INVOCATION_FAILED")) {
            throw new Error("Server funksiyasi ishlamayapti. Iltimos birozdan keyin qayta urinib ko'ring.");
          }
          throw new Error(`Invalid JSON response: ${text.substring(0, 300)}`);
        }
        throw new Error("Empty response from server");
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || data.savedLocally) {
        const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
        if (typeof fbq === "function") {
          fbq("track", "Lead");
        }

        toast({
          title: "Muvaffaqiyatli yuborildi!",
          description: "Ma'lumotlaringiz qabul qilindi. Telegram kanalimizga qo'shiling!",
        });

        setName("");
        setPhone("");
        setJob("");

        setTimeout(() => {
          onClose();

          setTimeout(() => {
            const newWindow = window.open("https://t.me/najotnurnotiqlikmarkazi", "_blank", "noopener,noreferrer");
            if (newWindow) {
              newWindow.opener = null;
            }
          }, 300);
        }, 1500);
      } else {
        toast({
          title: "Xatolik",
          description: data.message || data.error || "Ma'lumot yuborishda xatolik yuz berdi",
          variant: "destructive",
        });
      }
      } catch (error) {
      if (isDev) console.error("Submit error:", error);

      toast({
        title: "Xatolik",
        description: buildToastErrorDescription(error, isDev),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-navy-900 text-navy-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">Kursga yozilish</DialogTitle>
          <DialogDescription>
            Ma'lumotlaringizni qoldiring, biz sizga aloqaga chiqamiz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ismingiz</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ism Familiya"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon raqamingiz</Label>
            <div className="flex items-center gap-2">
              <span className="bg-gray-100 dark:bg-navy-800 px-3 py-2 rounded-md border border-input text-sm text-muted-foreground">
                +998
              </span>
              <Input
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="90 123 45 67"
                type="tel"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Kasbingiz</Label>
            <Input
              id="job"
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Tadbirkor, Talaba, O'qituvchi..."
              required
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
