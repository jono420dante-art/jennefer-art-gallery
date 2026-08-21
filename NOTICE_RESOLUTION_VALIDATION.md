# Notice Resolution Validation

## Protected Command Centre Review — 21 August 2026

The Action queue now excludes events already marked read by the protected backend mutation, so resolved notices do not reappear after the Administrator dashboard refreshes. The protected queue correctly displayed its empty state when no active unread notices remained.

When an Administrator resolves one active notice, the interface immediately removes it from the active queue and presents a status confirmation that names the completed notice and states its practical meaning. The confirmation distinguishes, for example, an enquiry remaining in the Collector Inbox from a collector remaining in the mailing list. The event is not deleted; `notifications.markRead` retains the durable Administrator audit record.

No real notice was resolved during this validation review.
