/**
 * Helper to get the correct image URL.
 * Defaults to local storage (/uploads/) if a simple filename is provided.
 */
export function getImageUrl(image: string | null | undefined): string {
  if (!image) {
    // Return a high-quality placeholder if no image exists
    return "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800";
  }

  // If it's a full URL (YouTube, Unsplash, etc.), return as is
  if (image.startsWith("http")) {
    return image;
  }

  // Otherwise, assume it's a local filename in public/uploads
  return `/uploads/${image}`;
}
