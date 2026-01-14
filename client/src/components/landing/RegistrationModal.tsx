import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

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

  // Check API health when modal opens
  useEffect(() => {
    if (isOpen) {
      api.test().then(isHealthy => {
        if (!isHealthy) {
          console.warn('⚠️ API server might not be running. Make sure to run: npm run dev:api');
        } else {
          console.log('✅ API server is running');
        }
      });
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "");
    // Limit to 9 digits
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  // Function to get UTM parameters from URL
  const getUTMParameters = () => {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    
    // Standard UTM parameters
    const utmFields = [
      'utm_source',
      'utm_medium', 
      'utm_campaign',
      'utm_content',
      'utm_term',
      'utm_referrer',
      'referrer',
      'fbclid',
      'gclid'
    ];
    
    utmFields.forEach(field => {
      const value = params.get(field);
      if (value) {
        utmParams[field] = value;
      }
    });
    
    // Also get current page URL and referrer
    if (!utmParams.referrer && document.referrer) {
      utmParams.referrer = document.referrer;
    }
    
    // Add form identifier
    utmParams.form = 'registration-modal';
    
    return utmParams;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('Form is already submitting, ignoring duplicate click');
      return;
    }
    
    if (phone.length !== 9) {
      toast({
        title: "Xatolik",
        description: "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get UTM parameters
      const utmParams = getUTMParameters();
      
      console.log('Submitting lead:', { 
        name, 
        phone: `+998${phone}`, 
        job, 
        source: 'registration',
        ...utmParams
      });
      
      const response = await api.leads.create({ 
        name, 
        phone: `+998${phone}`, 
        job,
        source: 'registration',
        ...utmParams
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Clone the response to read it safely
      const responseClone = response.clone();
      
      let data;
      try {
        data = await response.json();
        console.log('API Response:', data);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        // Try to read as text if JSON parsing fails
        try {
          const text = await responseClone.text();
          console.error('Response text:', text);
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
        } catch (textError) {
          throw new Error('Failed to read response from server');
        }
      }

      // Check if response is ok
      if (!response.ok) {
        console.error('API Error Response:', data);
        throw new Error(data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success || data.savedLocally) {
        toast({
          title: "Muvaffaqiyatli yuborildi!",
          description: "Ma'lumotlaringiz qabul qilindi. Telegram kanalimizga qo'shiling!",
        });
        
        // Clear form
        setName("");
        setPhone("");
        setJob("");
        
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          
          // Redirect to Telegram after modal closes
          setTimeout(() => {
            window.open('https://t.me/najotnurnotiqlikmarkazi', '_blank');
          }, 300);
        }, 1500);
        
      } else {
        toast({
          title: "Xatolik",
          description: data.message || data.error || "Ma'lumot yuborishda xatolik yuz berdi",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error name:", error instanceof Error ? error.name : 'N/A');
      console.error("Error message:", error instanceof Error ? error.message : 'Unknown');
      console.error("Error stack:", error instanceof Error ? error.stack : 'N/A');
      
      let errorMessage = 'Noma\'lum xatolik';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Serverga ulanib bo\'lmadi. API server ishlamayaptimi?';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Xatolik",
        description: `Ma'lumot yuborishda xatolik yuz berdi: ${errorMessage}. Iltimos qaytadan urinib ko'ring.`,
        variant: "destructive"
      });
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
