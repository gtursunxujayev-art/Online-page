import { NextRequest, NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db';

// Default content (same as in frontend)
const defaultContent = {
  navbar: {
    logoText: "Najot Nur",
    logoHighlight: "Notiqlik markazi",
    logoImage: "/logo_v3.png",
    ctaText: "Kursga yozilish",
    links: [
      { name: "Muammolar", href: "#/pain-points" },
      { name: "Metodika", href: "#/methodology" },
      { name: "Dastur", href: "#/program" },
      { name: "Mentorlar", href: "#/mentors" },
      { name: "Natijalar", href: "#/results" },
    ]
  },
  hero: {
    badge: "Professional Notiqlik Kursi",
    titlePart1: "So'z qudrati bilan",
    titleHighlight: "dunyoni",
    titlePart2: "zabt eting",
    description: "Hayajonni yengib, fikrlaringizni tizimli va ta'sirchan yetkazishni o'rganing. 4 hafta ichida o'zgarishni his qiling.",
    ctaPrimary: "Hoziroq ro'yxatdan o'ting",
    ctaSecondary: "Dastur bilan tanishish",
    promises: [
      "His hayajon va qo'rquvni yo'qotish",
      "Fikrlarimni tizimli yetkazish",
      "Ishonchli, ravon va ta'sirchan nutq"
    ],
    heroImage: "https://i.ibb.co/3ySvdQ0t/photo-2025-12-06-18-38-33.jpg",
    heroVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  },
  // ... (other sections would be here)
};

// GET /api/content - Get content
export async function GET() {
  try {
    // In a real implementation, you'd fetch content from database
    // For now, return default content
    return NextResponse.json(defaultContent);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return NextResponse.json(defaultContent); // Fallback to default
  }
}

// PUT /api/content - Update content (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const content = await request.json();
    
    // In a real implementation, you'd save content to database
    // For now, we'll store it in settings
    await setSetting('content', JSON.stringify(content));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}