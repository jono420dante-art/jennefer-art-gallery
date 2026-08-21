# Operational Notice Queue Validation

## Protected Command Centre Review — 21 August 2026

The Administrator-only **Security & System** panel now presents operational alerts as a compact **Action queue**. The queue is internally constrained to a `420px` vertical scroll area, so a longer event history does not expand the Command Centre page.

Each notice shows a concise plain-language category, the event context, a one-line **Next step**, its timestamp, and an individual **Resolve** action. Resolving delegates to the existing protected `notifications.markRead` mutation, preserving the durable event record while clearing it from the active queue. A **Resolve all** action retains the same server-side Administrator restriction.

No notice was resolved during the review. The protected panel rendered with 20 active notices and no exposed public controls.
