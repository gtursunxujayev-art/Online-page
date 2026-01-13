import { VercelRequest, VercelResponse } from '@vercel/node';
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/content - Get content
    if (req.method === 'GET') {
      // In a real implementation, you'd fetch content from database
      // For now, return default content
      return res.status(200).json(defaultContent);
    }

    // PUT /api/content - Update content (admin only)
    if (req.method === 'PUT') {
      // Check authentication
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const content = req.body;
      
      // In a real implementation, you'd save content to database
      // For now, we'll store it in settings
      await setSetting('content', JSON.stringify(content));
      
      return res.status(200).json({ success: true });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('Content API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}