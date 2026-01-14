import { useState, useEffect } from "react";
import { useContent, defaultContent } from "@/lib/contentContext";
import { navigate } from "@/lib/hashLocation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, RefreshCw, Users, Settings, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithBaseUrl } from "@/lib/api";

interface Lead {
  id: string;
  amoLeadId: number | null;
  name: string;
  phone: string;
  job: string;
  source: string;
  pipelineId: number | null;
  statusId: number | null;
  syncStatus: string;
  submittedAt: string;
}

interface Pipeline {
  id: number;
  name: string;
  _embedded?: {
    statuses?: Array<{ id: number; name: string }>;
  };
}

interface PipelinesResponse {
  _embedded?: {
    pipelines?: Pipeline[];
  };
}

export default function AdminPage() {
  const { content, updateContent, saveContentToServer, isLoading: contentLoading } = useContent();
  const [formData, setFormData] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!contentLoading) {
      setFormData(content);
    }
  }, [content, contentLoading]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [selectedStatusId, setSelectedStatusId] = useState<string>("");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/check"],
    queryFn: async () => {
      const res = await fetchWithBaseUrl("/api/auth/check", { credentials: "include" });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Failed to check auth: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
  });

  useEffect(() => {
    if (!authLoading && authData && !authData.authenticated) {
      navigate("/login");
    }
  }, [authData, authLoading]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetchWithBaseUrl("/api/auth/logout", { method: "POST", credentials: "include" });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Logout xatolik: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Chiqishda xatolik", variant: "destructive" });
    },
  });

  const credentialsMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newUsername?: string; newPassword?: string }) => {
      const res = await fetchWithBaseUrl("/api/auth/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      let result;
      try {
        result = await res.json();
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
      
      if (!res.ok) throw new Error(result.error || "Xatolik");
      return result;
    },
    onSuccess: (data) => {
      toast({ title: "Muvaffaqiyat", description: data.message });
      setCurrentPassword("");
      setNewUsername("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      toast({ title: "Xatolik", description: error.message, variant: "destructive" });
    },
  });

  const handleCredentialsUpdate = () => {
    if (!currentPassword) {
      toast({ title: "Xatolik", description: "Joriy parolni kiriting", variant: "destructive" });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      toast({ title: "Xatolik", description: "Yangi parollar mos kelmadi", variant: "destructive" });
      return;
    }
    if (!newUsername && !newPassword) {
      toast({ title: "Xatolik", description: "Yangi login yoki parol kiriting", variant: "destructive" });
      return;
    }
    credentialsMutation.mutate({
      currentPassword,
      newUsername: newUsername || undefined,
      newPassword: newPassword || undefined,
    });
  };

  const { data: leads = [], isLoading: leadsLoading, refetch: refetchLeads, error: leadsError } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
    queryFn: async () => {
      const res = await fetchWithBaseUrl("/api/leads", { credentials: "include" });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Failed to fetch leads: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
    enabled: authData?.authenticated === true
  });

  const { data: pipelines = [], isLoading: pipelinesLoading, error: pipelinesError } = useQuery<Pipeline[]>({
    queryKey: ["/api/kommo/pipelines"],
    queryFn: async () => {
      const res = await fetchWithBaseUrl("/api/kommo/pipelines", { credentials: "include" });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Failed to fetch pipelines: ${res.status} ${errorText}`);
      }
      
      const data: PipelinesResponse = await res.json();
      return data._embedded?.pipelines || [];
    },
    enabled: authData?.authenticated === true
  });

  const { data: pipelineSettings } = useQuery({
    queryKey: ["/api/settings/pipeline-stage"],
    queryFn: async () => {
      const res = await fetchWithBaseUrl("/api/settings/pipeline-stage", { credentials: "include" });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Failed to fetch settings: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
    enabled: authData?.authenticated === true
  });

  useEffect(() => {
    if (pipelineSettings) {
      if (pipelineSettings.pipelineId) {
        setSelectedPipelineId(String(pipelineSettings.pipelineId));
      }
      if (pipelineSettings.statusId) {
        setSelectedStatusId(String(pipelineSettings.statusId));
      }
    }
  }, [pipelineSettings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: { pipelineId: number; statusId: number }) => {
      const res = await fetchWithBaseUrl("/api/settings/pipeline-stage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      // Clone the response to read it safely
      const responseClone = res.clone();
      
      if (!res.ok) {
        let errorText = res.statusText;
        try {
          errorText = await responseClone.text();
        } catch {
          // If we can't read the text, use statusText
        }
        throw new Error(`Failed to save settings: ${res.status} ${errorText}`);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saqlandi", description: "Pipeline sozlamalari saqlandi" });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/pipeline-stage"] });
    },
    onError: () => {
      toast({ title: "Xatolik", description: "Sozlamalarni saqlashda xatolik", variant: "destructive" });
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!authData?.authenticated) {
    return null;
  }

  const handleSavePipelineSettings = () => {
    if (selectedPipelineId && selectedStatusId) {
      saveSettingsMutation.mutate({
        pipelineId: parseInt(selectedPipelineId),
        statusId: parseInt(selectedStatusId)
      });
    }
  };

  const selectedPipeline = pipelines.find(p => String(p.id) === selectedPipelineId);
  const statuses = selectedPipeline?._embedded?.statuses || [];

  const handleSave = async () => {
    setIsSaving(true);
    const success = await saveContentToServer(formData);
    setIsSaving(false);
    
    if (success) {
      toast({
        title: "Saqlandi",
        description: "O'zgarishlar muvaffaqiyatli saqlandi va barchaga ko'rinadi",
      });
    } else {
      toast({
        title: "Xatolik",
        description: "Saqlashda xatolik yuz berdi",
        variant: "destructive",
      });
    }
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
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2"/> Chiqish
            </Button>
            <Button variant="destructive" onClick={resetToDefault}>Reset to Default</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2"/> {isSaving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 justify-start">
            <TabsTrigger value="leads" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border bg-blue-50">
              <Users className="w-4 h-4 mr-1" /> Lidlar
            </TabsTrigger>
            <TabsTrigger value="navbar" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Navbar</TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Hero</TabsTrigger>
            <TabsTrigger value="painPoints" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Muammolar</TabsTrigger>
            <TabsTrigger value="methodology" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Metodika</TabsTrigger>
            <TabsTrigger value="program" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Dastur</TabsTrigger>
            <TabsTrigger value="mentors" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Mentorlar</TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Narxlar</TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">Footer</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border bg-gray-100">
              <Settings className="w-4 h-4 mr-1" /> Sozlamalar
            </TabsTrigger>
          </TabsList>

          {/* LEADS */}
          <TabsContent value="leads">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AmoCRM Pipeline Sozlamalari</CardTitle>
                  <CardDescription>Yangi lidlar qaysi pipeline va bosqichga tushishini tanlang</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pipelinesError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="error-pipelines">
                      Pipeline ma'lumotlarini olishda xatolik yuz berdi. AmoCRM sozlamalarini tekshiring.
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Pipeline</Label>
                      <Select value={selectedPipelineId} onValueChange={(val) => { setSelectedPipelineId(val); setSelectedStatusId(""); }}>
                        <SelectTrigger data-testid="select-pipeline">
                          <SelectValue placeholder={pipelinesLoading ? "Yuklanmoqda..." : pipelinesError ? "Xatolik" : "Pipeline tanlang"} />
                        </SelectTrigger>
                        <SelectContent>
                          {pipelines.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)} data-testid={`pipeline-option-${p.id}`}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Bosqich (Status)</Label>
                      <Select value={selectedStatusId} onValueChange={setSelectedStatusId} disabled={!selectedPipelineId}>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Bosqich tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)} data-testid={`status-option-${s.id}`}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSavePipelineSettings} 
                    disabled={!selectedPipelineId || !selectedStatusId || saveSettingsMutation.isPending}
                    data-testid="button-save-pipeline-settings"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sozlamalarni saqlash
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Lidlar ro'yxati</CardTitle>
                    <CardDescription>Saytdan kelgan barcha arizalar</CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => refetchLeads()} data-testid="button-refresh-leads">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Yangilash
                  </Button>
                </CardHeader>
                <CardContent>
                  {leadsError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="error-leads">
                      Lidlar ro'yxatini olishda xatolik yuz berdi. Sahifani yangilang yoki keyinroq urinib ko'ring.
                    </div>
                  ) : leadsLoading ? (
                    <p className="text-center py-8 text-gray-500">Yuklanmoqda...</p>
                  ) : leads.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">Hozircha lidlar yo'q</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ism</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Kasb</TableHead>
                          <TableHead>Manba</TableHead>
                          <TableHead>Sana</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((lead) => (
                          <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                            <TableCell className="font-medium" data-testid={`text-name-${lead.id}`}>{lead.name}</TableCell>
                            <TableCell data-testid={`text-phone-${lead.id}`}>{lead.phone}</TableCell>
                            <TableCell data-testid={`text-job-${lead.id}`}>{lead.job}</TableCell>
                            <TableCell>
                              <Badge variant="outline" data-testid={`badge-source-${lead.id}`}>{lead.source}</Badge>
                            </TableCell>
                            <TableCell data-testid={`text-date-${lead.id}`}>
                              {new Date(lead.submittedAt).toLocaleDateString("uz-UZ")}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={lead.syncStatus === "synced" ? "default" : lead.syncStatus === "failed" ? "destructive" : "secondary"}
                                data-testid={`badge-sync-${lead.id}`}
                              >
                                {lead.syncStatus === "synced" ? "Yuborildi" : lead.syncStatus === "failed" ? "Xatolik" : "Kutilmoqda"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NAVBAR */}
          <TabsContent value="navbar">
            <Card>
              <CardHeader><CardTitle>Navbar Sozlamalari</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Logo Rasmi (URL yoki fayl yo'li)</Label>
                    <Input 
                        value={formData.navbar.logoImage} 
                        onChange={(e) => handleChange("navbar", "logoImage", e.target.value)} 
                        placeholder="/logo.png"
                    />
                </div>
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
                    <Label>Orqa fon rasmi (URL)</Label>
                    <Input 
                        value={formData.hero.heroImage} 
                        onChange={(e) => handleChange("hero", "heroImage", e.target.value)} 
                        placeholder="Rasm havolasini kiriting (https://...)"
                    />
                    <p className="text-xs text-gray-500">Internetdagi rasm havolasini kiriting</p>
                </div>
                <div className="space-y-2">
                    <Label>Video Havolasi (YouTube)</Label>
                    <Input 
                        value={formData.hero.heroVideoUrl} 
                        onChange={(e) => handleChange("hero", "heroVideoUrl", e.target.value)} 
                        placeholder="https://www.youtube.com/watch?v=..."
                    />
                </div>
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
                        <div className="space-y-2">
                            <Label>Rasm URL</Label>
                            <Input 
                                value={item.image} 
                                onChange={(e) => handleNestedChange("mentors", idx, "image", e.target.value, "items")} 
                                placeholder="https://..."
                            />
                        </div>
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

          {/* SETTINGS */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Login ma'lumotlarini o'zgartirish</CardTitle>
                <CardDescription>Admin panel uchun login va parolni o'zgartiring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Joriy parol *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Joriy parolni kiriting"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    data-testid="input-current-password"
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="newUsername">Yangi login (ixtiyoriy)</Label>
                  <Input
                    id="newUsername"
                    type="text"
                    placeholder="Yangi login"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    data-testid="input-new-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yangi parol (ixtiyoriy)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Yangi parol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yangi parolni tasdiqlang</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Yangi parolni qayta kiriting"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                  />
                </div>
                <Button
                  onClick={handleCredentialsUpdate}
                  disabled={credentialsMutation.isPending}
                  data-testid="button-update-credentials"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {credentialsMutation.isPending ? "Saqlanmoqda..." : "Saqlash"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
