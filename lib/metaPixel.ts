export type MetaPixelEventData = Record<string, unknown>;

function track(eventName: string, data?: MetaPixelEventData, eventId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  const dispatch = (attempt = 0) => {
    if (typeof window.fbq !== "function") {
      if (attempt < 20) window.setTimeout(() => dispatch(attempt + 1), 100);
      return;
    }

    if (data || eventId) {
      window.fbq("track", eventName, data || {}, eventId ? { eventID: eventId } : undefined);
      return;
    }

    window.fbq("track", eventName);
  };

  dispatch();
}

export function pageView(eventId?: string) {
  track("PageView", undefined, eventId);
}

export function viewContent(data?: MetaPixelEventData, eventId?: string) {
  track("ViewContent", data, eventId);
}

export function initiateCheckout(data?: MetaPixelEventData, eventId?: string) {
  track("InitiateCheckout", data, eventId);
}

export function purchase(data?: MetaPixelEventData) {
  track("Purchase", data);
}

export function lead(data?: MetaPixelEventData, eventId?: string) {
  track("Lead", data, eventId);
}

export function completeRegistration(data?: MetaPixelEventData) {
  track("CompleteRegistration", data);
}

export function search(data?: MetaPixelEventData) {
  track("Search", data);
}

export function addToCart(data?: MetaPixelEventData) {
  track("AddToCart", data);
}
