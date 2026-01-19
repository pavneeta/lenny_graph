// Category-based color mapping for nodes
export const categoryColors: Record<string, number> = {
  'Product': 0x4a9eff,      // Blue
  'Growth': 0xffe66d,       // Yellow
  'Leadership': 0x4ecdc4,  // Teal
  'Design': 0x95e1d3,      // Light green
  'Engineering': 0xa8e6cf, // Green
  'Strategy': 0xff9ff3,    // Pink
  'Marketing': 0x54a0ff,   // Light blue
  'Data': 0x5f27cd,        // Purple
  'Customer': 0x00d2d3,    // Cyan
  'Startup': 0xff6348,     // Red-orange
  'Ai': 0xffa502,          // Orange
  'Monetization': 0xff6b6b, // Red
  'Hiring': 0x6c5ce7,      // Indigo
  'Communication': 0xfd79a8, // Rose
  'Default': 0x888888      // Gray
};

export function getCategoryColor(categories: string[]): number {
  if (!categories || categories.length === 0) {
    return categoryColors['Default'];
  }
  
  // Use the first category, or find a match
  const firstCategory = categories[0];
  const normalizedCategory = firstCategory.toLowerCase();
  
  // Try exact match first
  if (categoryColors[firstCategory]) {
    return categoryColors[firstCategory];
  }
  
  // Try partial matches
  for (const [key, color] of Object.entries(categoryColors)) {
    if (normalizedCategory.includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedCategory)) {
      return color;
    }
  }
  
  return categoryColors['Default'];
}

