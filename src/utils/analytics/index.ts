
interface TrackEventOptions {
    action?: string;
    category?: string;
    label: string;
    value?: number;
}

export function trackEventBtn({
    action,
    category,
    label,
    value,
}: TrackEventOptions): void {
    if (window.gtag) {
        window.gtag("event", 'click', {
            event_category: 'button',
            event_label: label,
            value: value,
        });
    } else {
        console.warn("Google Analytics not initialized");
    }
}
