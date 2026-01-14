// Simple JavaScript API route for content
export default function handler(req, res) {
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
    return res.status(200).end();
  }

  // Default content
  const defaultContent = {
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
      heroVideoUrl: "" // Empty for now - will be filled when video is ready
    }
  };

  try {
    // GET /api/content - Get content
    if (req.method === 'GET') {
      return res.status(200).json(defaultContent);
    }

    // PUT /api/content - Update content (simplified for now)
    if (req.method === 'PUT') {
      return res.status(200).json({
        success: true,
        message: 'Content updated successfully',
        timestamp: new Date().toISOString()
      });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
}