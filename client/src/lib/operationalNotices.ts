export type OperationalNoticeType = "review" | "message" | "sale" | "collector" | "system";

export function noticeTypeLabel(type: OperationalNoticeType) {
  return ({ review: "Review needed", message: "New message", sale: "Sale action", collector: "Collector update", system: "System check" } as const)[type];
}

export function noticeNextStep(type: OperationalNoticeType) {
  return ({ review: "Review the item in the management workspace.", message: "Open the Collector Inbox and prepare a response.", sale: "Check the order record before confirming the next step.", collector: "Review the consented collector record in the mailing list.", system: "Check the setting or connection named in this notice." } as const)[type];
}
