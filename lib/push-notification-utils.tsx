// Push notification preference management
const PUSH_PROMPT_DISMISSED_KEY = "push_prompt_dismissed_at";
const PUSH_PROMPT_COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours

// Event used to ask the (globally mounted) push prompt to re-evaluate and show
// itself on demand, e.g. when the user clicks the notification bell.
export const PUSH_PROMPT_REQUEST_EVENT = "ipinayo:request-push-prompt";

export function requestPushPrompt(): void {
  if (globalThis.window === undefined) return;
  globalThis.dispatchEvent(new Event(PUSH_PROMPT_REQUEST_EVENT));
}

export function shouldShowPushPrompt(pushEnabled: boolean): boolean {
  if (pushEnabled) {
    return false;
  }

  const dismissedAt = localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY);

  if (!dismissedAt) {
    return true;
  }

  const dismissedTimestamp = Number.parseInt(dismissedAt, 10);
  const now = Date.now();
  const timeSinceDismissal = now - dismissedTimestamp;

  return timeSinceDismissal > PUSH_PROMPT_COOLDOWN_MS;
}

export function dismissPushPrompt(): void {
  localStorage.setItem(PUSH_PROMPT_DISMISSED_KEY, Date.now().toString());
}

export function getTimeUntilPromptReappears(): number {
  const dismissedAt = localStorage.getItem(PUSH_PROMPT_DISMISSED_KEY);

  if (!dismissedAt) {
    return 0;
  }

  const dismissedTimestamp = Number.parseInt(dismissedAt, 10);
  const now = Date.now();
  const timeSinceDismissal = now - dismissedTimestamp;
  const timeUntilReappears = Math.max(
    0,
    PUSH_PROMPT_COOLDOWN_MS - timeSinceDismissal,
  );

  return timeUntilReappears;
}
