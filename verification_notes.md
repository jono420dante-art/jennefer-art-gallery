# Public Sales-Flow Verification Notes

## 13 August 2026

The public `/contact` page rendered the dedicated **Commission an Original Piece** form with name, email, phone, commission type, preferred size, budget, timeline, and vision fields. The existing general contact form, email address, South Africa location, and WhatsApp link remained present.

The public `/gallery` page rendered its collection navigation, including the **For Sale** collection. The browser capture showed its initial loading indicator, so artwork-card verification should be repeated directly on an available artwork detail URL after client data has completed loading.

The `/gallery/for-sale` page rendered available artwork cards and exposed a direct detail link for **Bright & Beautiful**. Navigating to its URL with encoded spaces and ampersand remained on the initial loading state, so a simpler slug should be used to distinguish URL encoding from data-loading behaviour before marking the artwork purchase card as browser-verified.

The simple `/artwork/Riana` route completed loading and returned **Artwork Not Found**, which confirms this is a stored-slug mismatch rather than a product-card rendering error. The actual link targets should be extracted from the rendered For Sale collection before a final detail-page browser verification.

The rendered For Sale collection uses timestamped or title-based slugs, including `/artwork/Riana-1769842761058`. The exact route list was extracted from the client DOM; this confirms that the prior `Riana` test did not use the artwork’s stored slug.

The available **Riana** product page successfully rendered the sales card. It exposed a secure internal checkout route, a 30% reservation message to Jennefer’s existing WhatsApp line, an artwork-specific WhatsApp enquiry, availability state, certificate of authenticity, delivery guidance, international-quote guidance, and a 3–7 working day dispatch estimate.
