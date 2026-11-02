const YOUTUBE_HOST = 'www.youtube.com';
const AWS_HOSTS = ['docs.aws.amazon.com', 'aws.amazon.com'];

/**
 * The only external destinations the app may open: YouTube search results and AWS docs/site.
 * Pure and strict: https only, no userinfo, default port, exact lower-case host, no control characters.
 */
export function isAllowedExternalUrl(url: string): boolean {
  if (/[\u0000- \u007f]/.test(url)) return false; // tabs/newlines/spaces are silently stripped by URL()
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' || parsed.username !== '' || parsed.password !== '' || parsed.port !== '') return false;
  // URL() lower-cases the host; requiring the raw text to match rejects uppercase hosts and userinfo tricks.
  if (!url.startsWith(`https://${parsed.hostname}`)) return false;
  if (parsed.hostname === YOUTUBE_HOST) return parsed.pathname === '/results' && parsed.search.length > 1;
  return AWS_HOSTS.includes(parsed.hostname);
}
