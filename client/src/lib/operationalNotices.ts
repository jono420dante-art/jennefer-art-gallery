export type OperationalNoticeType = "review" | "message" | "sale" | "collector" | "system";

export function noticeTypeLabel(type: OperationalNoticeType) {
  return ({ review: "Review needed", message: "New message", sale: "Sale action", collector: "Collector update", system: "System check" } as const)[type];
}

export function noticeNextStep(type: OperationalNoticeType) {
  return ({ review: "Review the item in the management workspace.", message: "Open the Collector Inbox and prepare a response.", sale: "Check the order record before confirming the next step.", collector: "Review the consented collector record in the mailing list.", system: "Check the setting or connection named in this notice." } as const)[type];
}

export function noticeResolutionMeaning(type: OperationalNoticeType) {
  return ({ review: "The review item is cleared from the active queue; its record remains in the Administrator history.", message: "The message alert is cleared from the active queue; the enquiry remains available in the Collector Inbox.", sale: "The sale alert is cleared from the active queue; the order record remains available for follow-up.", collector: "The collector alert is cleared from the active queue; the consented subscriber remains in the mailing list.", system: "The system alert is cleared from the active queue; its audit record remains available to Administrators." } as const)[type];
}
