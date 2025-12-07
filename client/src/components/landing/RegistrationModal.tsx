import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [job, setJob] = useState("");
  const { toast } = useToast();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, "");
    // Limit to 9 digits
    if (value.length <= 9) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phone.length !== 9) {
      toast({
        title: "Xatolik",
        description: "Telefon raqam 9 ta raqamdan iborat bo'lishi kerak",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/leads', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          phone: `+998${phone}`, 
          job,
          source: 'registration'
        }) 
      });

      const data = await response.json();

      if (data.success || data.savedLocally) {
        toast({
          title: "Muvaffaqiyatli yuborildi!",
          description: "Ma'lumotlaringiz qabul qilindi. Tez orada menejerlarimiz siz bilan bog'lanishadi.",
        });
        
        onClose();
        setName("");
        setPhone("");
        setJob("");
      } else {
        toast({
          title: "Xatolik",
          description: data.message || "Ma'lumot yuborishda xatolik yuz berdi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast({
        title: "Xatolik",
        description: "Ma'lumot yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.",
        variant: "destructive"
      });
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
            <Button type="submit" className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold">
              Yuborish
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
