export function isWeChatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}
