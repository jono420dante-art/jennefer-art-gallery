import { describe, expect, it } from "vitest";
import { getArtworkPaymentLinks } from "./artworkPaymentLinks";
import { ARTIST_WHATSAPP_PHONE, getWhatsAppLink } from "./galleryContact";

describe("sales link configuration", () => {
  it("builds an encoded WhatsApp link using the central gallery phone number", () => {
    const link = getWhatsAppLink('Hi Jennefer, I am interested in "Riana".');

    expect(link).toContain(`https://wa.me/${ARTIST_WHATSAPP_PHONE}?text=`);
    expect(link).toContain("Riana");
    expect(link).toContain("%22Riana%22");
  });

  it("returns no hosted payment links for an artwork until merchant URLs are configured", () => {
    expect(getArtworkPaymentLinks("riana-1769842761058")).toEqual({});
  });
});
