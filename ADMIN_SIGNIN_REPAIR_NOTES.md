# Admin Portal Sign-in Repair Notes

## Root cause

The OAuth callback correctly created the authenticated session, but it always redirected a visitor to `/`. A visitor who began from the protected Admin Portal therefore lost the intended dashboard destination after signing in.

## Repair

The Admin Portal now stores only a validated internal admin return path in session storage before OAuth begins. After the standard OAuth callback returns to the gallery, an authenticated user with the `admin` role is redirected to that stored path. Valid destinations are limited to `/admin` and `/admin-dashboard`, including their query strings; all external and public-site paths are rejected.

## Browser evidence

On 13 August 2026, the logged-out preview browser loaded `/admin-dashboard?panel=seo` and displayed the secure sign-in panel. The protected SEO route did not render dashboard content before a verified administrator session existed.

The **Sign in securely** control then opened the configured Manus OAuth page for Jennefer Ann Art Gallery. The provider reached its standard account sign-in screen, so the remaining live check requires the administrator to complete their own authenticated sign-in.

After the native sign-in implementation, the preview route `/admin-login` was rechecked on 15 August 2026. It now renders the gallery-native **Administrator sign in** card with a username input, a password input, and a `Sign in to Admin Portal` action. It does not redirect the visitor to an external sign-in page.

The configured Administrator credentials were submitted successfully in the preview browser on 15 August 2026. The portal displayed the access-granted state and redirected to `/admin-dashboard?panel=seo`, where the protected **Gallery Command Centre** displayed artwork, collection, review, collector-lead, management, SEO, analytics, PDF-report, activity, and sign-out controls.

The authenticated traffic panel was also checked. It displays first-party traffic sources, referrers, top pages, and conversion-click areas with explicit empty states until real visits occur. Its geographic view states that location reporting requires the connected Google Analytics property, rather than fabricating location data from the privacy-safe tracker. The operational activity feed now displays recorded contact and review data rather than simulated notifications.

The protected PDF report control was invoked during the same authenticated preview session. The preview browser still surfaced `Failed to fetch`, matching the earlier known preview-transport issue. This did not bypass access control; the report procedure remains Administrator-only and was separately verified to generate valid PDF data on the server.

To remove the preview transport dependency, the report control now uses a protected direct PDF download endpoint. That endpoint builds the PDF on the server and permits only an authenticated Administrator session before returning an attachment response.

The direct PDF download was rechecked after this change and produced the successful download confirmation in the authenticated browser. The native Administrator session was also used to open the protected management studio, where upload, edit, availability, featured-status, delete, bulk selection, collection move, contact-form, comment, and review controls remained available.

As a non-destructive live verification, the Collections and Contact Forms tabs were opened under the native Administrator session. Existing collection controls and private collector/commission submission records loaded successfully without changing gallery data.

The Comments and Reviews tabs were also opened under the native Administrator session. Existing moderation records and their action controls loaded successfully without modifying any live comments or reviews.

The protected Collector newsletter tab was verified in the native Administrator session. It loaded the real subscriber list with name, email, signup date, and a confirmation-protected removal control.

The homepage was revisited to recheck the public collector popup. Its previous session-only dismissal state was cleared without submitting a new email address, so the trigger can be verified without creating artificial subscriber data.

The collector popup then appeared with first name, last name, email, submit, prominent close, and “Not now” controls. The “Not now” option was verified to close the modal and restore the homepage without creating a signup record.

Canonical URL verification: an artwork page loaded through the preview with a query parameter rendered both its canonical link and Open Graph URL as the clean `https://artbyjennefer.manus.space/artwork/Survival` public URL, with `index, follow` robots metadata.

## Remaining manual confirmation

An Administrator must complete the external OAuth sign-in once in the preview or deployed site to confirm the provider's real callback and role assignment. This manual step cannot be simulated without an authenticated administrator account in the browser.
