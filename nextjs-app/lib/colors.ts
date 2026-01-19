// Category-based color mapping for nodes - Lenny's Newsletter color scheme
// Based on Substack's professional palette with primary blue accent
export const categoryColors: Record<string, number> = {
  'Product': 0x0066ff,      // Substack primary blue
  'Growth': 0x00a8ff,       // Bright blue
  'Leadership': 0x5b8def,   // Soft blue
  'Design': 0x7b9acc,      // Muted blue-gray
  'Engineering': 0x4a90e2,  // Medium blue
  'Strategy': 0x6c7ae0,     // Periwinkle blue
  'Marketing': 0x5dade2,    // Sky blue
  'Data': 0x5499c7,        // Steel blue
  'Customer': 0x48cae4,     // Cyan blue
  'Startup': 0x0070f3,      // Vercel blue (Substack-like)
  'Ai': 0x3b82f6,          // Modern blue
  'Monetization': 0x2563eb, // Deep blue
  'Hiring': 0x6366f1,      // Indigo blue
  'Communication': 0x818cf8, // Light indigo
  'Default': 0x6b7280      // Gray (Tailwind gray-500)
};

export function getCategoryColor(categories: string[]): number {
  if (!categories || categories.length === 0) {
    return categoryColors['Default'];
  }
  
  // Try each category in order
  for (const category of categories) {
    // Try exact match first (case-insensitive)
    const categoryKey = Object.keys(categoryColors).find(
      key => key.toLowerCase() === category.toLowerCase()
    );
    if (categoryKey) {
      return categoryColors[categoryKey];
    }
    
    // Try partial matches
    const normalizedCategory = category.toLowerCase();
    for (const [key, color] of Object.entries(categoryColors)) {
      const normalizedKey = key.toLowerCase();
      if (normalizedCategory.includes(normalizedKey) || 
          normalizedKey.includes(normalizedCategory)) {
        return color;
      }
    }
  }
  
  return categoryColors['Default'];
}

