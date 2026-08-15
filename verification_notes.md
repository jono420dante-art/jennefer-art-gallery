# Public Sales-Flow Verification Notes

## 13 August 2026

The public `/contact` page rendered the dedicated **Commission an Original Piece** form with name, email, phone, commission type, preferred size, budget, timeline, and vision fields. The existing general contact form, email address, South Africa location, and WhatsApp link remained present.

The public `/gallery` page rendered its collection navigation, including the **For Sale** collection. The browser capture showed its initial loading indicator, so artwork-card verification should be repeated directly on an available artwork detail URL after client data has completed loading.

The `/gallery/for-sale` page rendered available artwork cards and exposed a direct detail link for **Bright & Beautiful**. Navigating to its URL with encoded spaces and ampersand remained on the initial loading state, so a simpler slug should be used to distinguish URL encoding from data-loading behaviour before marking the artwork purchase card as browser-verified.

The simple `/artwork/Riana` route completed loading and returned **Artwork Not Found**, which confirms this is a stored-slug mismatch rather than a product-card rendering error. The actual link targets should be extracted from the rendered For Sale collection before a final detail-page browser verification.

The rendered For Sale collection uses timestamped or title-based slugs, including `/artwork/Riana-1769842761058`. The exact route list was extracted from the client DOM; this confirms that the prior `Riana` test did not use the artwork’s stored slug.

The available **Riana** product page successfully rendered the sales card. It exposed a secure internal checkout route, a 30% reservation message to Jennefer’s existing WhatsApp line, an artwork-specific WhatsApp enquiry, availability state, certificate of authenticity, delivery guidance, international-quote guidance, and a 3–7 working day dispatch estimate.

## Growth Control verification — 2026-08-13

The public homepage loaded successfully with the first-party tracker active. The app title and public content rendered correctly, and the tracker is mounted globally for public routes. Browser access to `/admin-dashboard` redirected to the project sign-in flow because the browser session was not authenticated as the gallery administrator; no admin credentials were entered during verification.

After stabilizing the tracker lifecycle, a controlled browser reload recorded only three events across two local browser sessions instead of generating a repeated event loop. Those locally generated verification records were then removed. The analytics tables are now empty and ready to begin collecting visitor-originated traffic and conversion data.

Authenticated Admin Growth Control verification was completed with the existing admin session flag. The dashboard rendered its live metrics cards, traffic controls, report button, and SEO Health tab. The runtime SEO audit verified the public homepage title at 48 characters, its description at 116 characters, the Google Analytics tag, `/robots.txt`, `/sitemap.xml`, and a rendered public artwork page containing `VisualArtwork` structured data.

The first browser PDF click reported a fetch failure, but a direct authenticated request to the same `analytics.downloadReport` procedure returned HTTP 200 with a valid base64 PDF payload. The endpoint and server-side PDF generation are healthy; the browser download action requires a retry after the preview transport recovers.

A fresh browser reload and second PDF click produced the same preview-browser fetch error. Direct calls to the endpoint succeeded both through `http://127.0.0.1:3000` and the preview proxy URL, returning HTTP 200 and the PDF payload. The remaining failure is specific to the preview browser’s JavaScript fetch transport, not the report API or PDF generator.

The redesigned collector signup appeared after the intended delay with a visible X control in the upper-right corner, a secondary “Not now — keep exploring the artwork” action, and refreshed art-led copy. Clicking the X closed the overlay immediately and restored access to the homepage artwork navigation and content.

The report procedure was also switched from a mutation to a read-only query, but the preview browser still reported a fetch failure on the PDF button. This confirms that the failure is not specific to the HTTP mutation method. The API continues to return a valid report payload outside the preview-browser JavaScript transport.

The final regression run passed all 33 tests across 9 test files, and the production build completed successfully. Browser-generated analytics verification events were cleared afterward, leaving the new analytics tables at zero sessions and zero events so that dashboard metrics start with genuine visitor activity.

The Admin Growth Control now exposes a prominent **SEO DASHBOARD** card and an **SEO dashboard** button. Opening `/admin-dashboard?panel=seo#seo-dashboard` selects the SEO Health panel directly. The browser verified all six live checks as ready: homepage title, meta description, Google Analytics tag, robots.txt, sitemap.xml, and artwork structured data.
