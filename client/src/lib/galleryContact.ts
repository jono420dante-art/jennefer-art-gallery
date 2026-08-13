/**
 * Public contact configuration for Jennefer Ann Art Gallery.
 * Confirm this number with the artist before publishing sales campaigns.
 */
export const ARTIST_WHATSAPP_PHONE = "27846405120";

export function getWhatsAppLink(message: string) {
  return `https://wa.me/${ARTIST_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
