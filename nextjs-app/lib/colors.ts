// Category-based color mapping for nodes - Lenny's Newsletter orange theme
// Orange palette inspired by Lenny's Newsletter branding
export const categoryColors: Record<string, number> = {
  'Product': 0xff6b35,      // Vibrant orange (primary)
  'Growth': 0xff8c42,       // Bright orange
  'Leadership': 0xff7f50,   // Coral orange
  'Design': 0xff6b4a,      // Red-orange
  'Engineering': 0xff7849,  // Medium orange
  'Strategy': 0xff6348,     // Tomato orange
  'Marketing': 0xff7a5c,    // Light orange
  'Data': 0xff6b2d,        // Deep orange
  'Customer': 0xff8a65,     // Peach orange
  'Startup': 0xff5722,      // Deep orange-red
  'Ai': 0xff7043,          // Orange-red
  'Monetization': 0xff6b1a, // Bright orange
  'Hiring': 0xff7d47,      // Warm orange
  'Communication': 0xff8c69, // Soft orange
  'Default': 0xff6b35      // Primary orange as default
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

