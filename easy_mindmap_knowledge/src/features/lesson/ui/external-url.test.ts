import { describe, expect, it } from 'vitest';
import { isAllowedExternalUrl } from './external-url';

describe('isAllowedExternalUrl', () => {
  it.each([
    'https://www.youtube.com/results?search_query=aws%20ec2',
    'https://docs.aws.amazon.com/ec2/latest/userguide/',
    'https://aws.amazon.com/ec2/pricing/?x=1',
    'https://aws.amazon.com',
    'https://aws.amazon.com:443/ec2',
  ])('allows %s', (url) => expect(isAllowedExternalUrl(url)).toBe(true));

  it.each([
    'https://www.youtube.com.evil.com/results?search_query=a',
    'https://evil.com/?www.youtube.com/results?search_query=a',
    'https://www.youtube.com@evil.com/results?q=1',
    'https://user:pw@docs.aws.amazon.com/x',
    'http://www.youtube.com/results?search_query=a',
    'http://docs.aws.amazon.com/x',
    'javascript:alert(1)',
    'https://www.youtube.com/results',
    'https://www.youtube.com/results?',
    'https://www.youtube.com/watch?v=abc',
    'https://WWW.YOUTUBE.COM/results?search_query=a',
    'https://Docs.AWS.amazon.com/x',
    'https://www.youtube.com./results?search_query=a',
    'https://docs.aws.amazon.com./x',
    'https://docs.aws.amazon.com:8443/x',
    'https://www.youtube.com/res\tults?search_query=a',
    'https://docs.aws.amazon.com/a\nb',
    'https://docs.aws.amazon.com\t/x',
    '/results?search_query=a',
    '#x',
    'results?search_query=a',
    '',
    'evil.aws.amazon.com',
    'https://evil.aws.amazon.com/x',
  ])('rejects %j', (url) => expect(isAllowedExternalUrl(url)).toBe(false));
});
