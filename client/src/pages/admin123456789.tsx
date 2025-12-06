import { useState } from "react";
import { useContent, defaultContent } from "@/lib/contentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { content, updateContent } = useContent();
  const [formData, setFormData] = useState(content);
  const { toast } = useToast();

  const handleSave = () => {
    updateContent(formData);
    toast({
      title: "Saqlandi",
      description: "O'zgarishlar muvaffaqiyatli saqlandi",
    });
  };

  const handleChange = (section: keyof typeof content, key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleNestedChange = (section: keyof typeof content, index: number, key: string, value: any, arrayName: string) => {
    setFormData((prev) => {
      const newArray = [...(prev[section] as any)[arrayName]];
      newArray[index] = { ...newArray[index], [key]: value };
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [arrayName]: newArray,
        },
      };
    });
  };
  
  const resetToDefault = () => {
    if(confirm("Barcha o'zgarishlarni bekor qilib, boshlang'ich holatga qaytarmoqchimisiz?")) {
        setFormData(defaultContent);
        updateContent(defaultContent);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
             <p className="text-gray-500">Sayt ma'lumotlarini tahrirlash</p>
          </div>
          <div className="flex gap-4">
            <Button variant="destructive" onClick={resetToDefault}>Reset to Default</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2"/> Saqlash
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
            <TabsTrigger value="navbar" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Navbar</TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Hero</TabsTrigger>
            <TabsTrigger value="painPoints" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Muammolar</TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Metodika</TabsTrigger>
            <TabsTrigger value="program" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Dastur</TabsTrigger>
            <TabsTrigger value="mentors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Mentorlar</TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Narxlar</TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Footer</TabsTrigger>
          </TabsList>

          {/* NAVBAR */}
          <TabsContent value="navbar">
            <Card>
              <CardHeader><CardTitle>Navbar Sozlamalari</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Logo Matni</Label>
                    <Input value={formData.navbar.logoText} onChange={(e) => handleChange("navbar", "logoText", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo Highlight (Oltin rangda)</Label>
                    <Input value={formData.navbar.logoHighlight} onChange={(e) => handleChange("navbar", "logoHighlight", e.target.value)} />
                  </div>
                </div>
                 <div className="space-y-2">
                    <Label>CTA Button Matni</Label>
                    <Input value={formData.navbar.ctaText} onChange={(e) => handleChange("navbar", "ctaText", e.target.value)} />
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HERO */}
          <TabsContent value="hero">
            <Card>
              <CardHeader><CardTitle>Hero Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Badge (Tepada kichik yozuv)</Label>
                  <Input value={formData.hero.badge} onChange={(e) => handleChange("hero", "badge", e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha Boshlanishi</Label>
                    <Input value={formData.hero.titlePart1} onChange={(e) => handleChange("hero", "titlePart1", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlight (Oltin rang)</Label>
                    <Input value={formData.hero.titleHighlight} onChange={(e) => handleChange("hero", "titleHighlight", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Sarlavha Davomi</Label>
                    <Input value={formData.hero.titlePart2} onChange={(e) => handleChange("hero", "titlePart2", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif (Description)</Label>
                  <Textarea value={formData.hero.description} onChange={(e) => handleChange("hero", "description", e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Asosiy Button</Label>
                    <Input value={formData.hero.ctaPrimary} onChange={(e) => handleChange("hero", "ctaPrimary", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ikkinchi Button</Label>
                    <Input value={formData.hero.ctaSecondary} onChange={(e) => handleChange("hero", "ctaSecondary", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAIN POINTS */}
          <TabsContent value="painPoints">
            <Card>
              <CardHeader><CardTitle>Muammolar Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input value={formData.painPoints.titlePart1} onChange={(e) => handleChange("painPoints", "titlePart1", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlight (Qizil rang)</Label>
                    <Input value={formData.painPoints.titleHighlight} onChange={(e) => handleChange("painPoints", "titleHighlight", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tavsif</Label>
                  <Textarea value={formData.painPoints.description} onChange={(e) => handleChange("painPoints", "description", e.target.value)} />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Muammolar ro'yxati</h3>
                  {formData.painPoints.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50/50">
                       <div className="space-y-2">
                        <Label>Sarlavha {idx + 1}</Label>
                        <Input value={item.title} onChange={(e) => handleNestedChange("painPoints", idx, "title", e.target.value, "items")} />
                      </div>
                       <div className="space-y-2">
                        <Label>Tavsif {idx + 1}</Label>
                        <Textarea value={item.desc} onChange={(e) => handleNestedChange("painPoints", idx, "desc", e.target.value, "items")} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* METHODOLOGY */}
           <TabsContent value="methodology">
            <Card>
              <CardHeader><CardTitle>Metodika Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input value={formData.methodology.titlePart1} onChange={(e) => handleChange("methodology", "titlePart1", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlight</Label>
                    <Input value={formData.methodology.titleHighlight} onChange={(e) => handleChange("methodology", "titleHighlight", e.target.value)} />
                  </div>
                </div>
                 <div className="space-y-4">
                  <h3 className="font-semibold">Metodlar ro'yxati</h3>
                  {formData.methodology.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 gap-2 p-4 border rounded-lg bg-gray-50/50">
                       <div className="space-y-2">
                        <Label>Metod {idx + 1}</Label>
                        <Input value={item.title} onChange={(e) => handleNestedChange("methodology", idx, "title", e.target.value, "items")} />
                      </div>
                       <div className="space-y-2">
                        <Textarea value={item.desc} onChange={(e) => handleNestedChange("methodology", idx, "desc", e.target.value, "items")} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROGRAM */}
          <TabsContent value="program">
            <Card>
              <CardHeader><CardTitle>Dastur Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input value={formData.program.titlePart1} onChange={(e) => handleChange("program", "titlePart1", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlight</Label>
                    <Input value={formData.program.titleHighlight} onChange={(e) => handleChange("program", "titleHighlight", e.target.value)} />
                  </div>
                </div>
                 <div className="space-y-4">
                  <h3 className="font-semibold">Haftalik Dastur</h3>
                  {formData.program.weeks.map((week, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 space-y-3">
                       <div className="flex gap-4">
                         <div className="w-24">
                            <Label>Hafta</Label>
                            <Input value={week.week} onChange={(e) => handleNestedChange("program", idx, "week", e.target.value, "weeks")} />
                         </div>
                         <div className="flex-1">
                            <Label>Mavzu</Label>
                            <Input value={week.title} onChange={(e) => handleNestedChange("program", idx, "title", e.target.value, "weeks")} />
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
           {/* MENTORS */}
          <TabsContent value="mentors">
            <Card>
              <CardHeader><CardTitle>Mentorlar Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sarlavha</Label>
                    <Input value={formData.mentors.titlePart1} onChange={(e) => handleChange("mentors", "titlePart1", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Highlight</Label>
                    <Input value={formData.mentors.titleHighlight} onChange={(e) => handleChange("mentors", "titleHighlight", e.target.value)} />
                  </div>
                </div>
                 <div className="space-y-4">
                  <h3 className="font-semibold">Mentorlar</h3>
                  {formData.mentors.items.map((item, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Ism</Label>
                                <Input value={item.name} onChange={(e) => handleNestedChange("mentors", idx, "name", e.target.value, "items")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input value={item.role} onChange={(e) => handleNestedChange("mentors", idx, "role", e.target.value, "items")} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea value={item.bio} onChange={(e) => handleNestedChange("mentors", idx, "bio", e.target.value, "items")} />
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

           {/* PRICING */}
          <TabsContent value="pricing">
            <Card>
              <CardHeader><CardTitle>Narxlar Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                  {formData.pricing.plans.map((plan, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-gray-50/50 space-y-3">
                        <h4 className="font-bold">{plan.name} Tarifi</h4>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label>Narx</Label>
                                <Input value={plan.price} onChange={(e) => handleNestedChange("pricing", idx, "price", e.target.value, "plans")} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tavsif</Label>
                                <Input value={plan.desc} onChange={(e) => handleNestedChange("pricing", idx, "desc", e.target.value, "plans")} />
                            </div>
                        </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* FOOTER */}
          <TabsContent value="footer">
             <Card>
              <CardHeader><CardTitle>Footer Seksiyasi</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input value={formData.footer.phone} onChange={(e) => handleChange("footer", "phone", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Manzil</Label>
                    <Input value={formData.footer.address} onChange={(e) => handleChange("footer", "address", e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label>Copyright</Label>
                    <Input value={formData.footer.copyright} onChange={(e) => handleChange("footer", "copyright", e.target.value)} />
                  </div>
              </CardContent>
             </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
