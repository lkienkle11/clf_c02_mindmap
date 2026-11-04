// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  extractServiceNames,
  findMissingServices,
  lessonBody,
  lessonProse,
  mentions,
  serviceMentioned,
  uncoveredServices,
  type ServiceEntry,
} from './coverage';

describe('mentions', () => {
  it('ignores case, hyphens and spaces', () => {
    expect(mentions('The Well-Architected Framework applies.', 'well architected')).toBe(true);
    expect(mentions('use the aws transit-gateway', 'AWS Transit Gateway')).toBe(true);
  });

  it('accepts an optional plural on the last word', () => {
    expect(mentions('Placement groups spread instances.', 'placement group')).toBe(true);
    expect(mentions('Each VPC endpoints table', 'VPC endpoint')).toBe(true);
  });

  it('matches whole words only', () => {
    expect(mentions('AWS AppSync is an API service', 'Sync')).toBe(false);
    expect(mentions('Amazon Elastic Compute Cloud', 'Amazon Elastic Container')).toBe(false);
  });

  it('treats punctuation as a separator', () => {
    expect(mentions("Use Amazon S3's storage classes", 'Amazon S3')).toBe(true);
    expect(mentions('Ask on AWS re:Post', 'AWS re Post')).toBe(true);
  });
});

describe('serviceMentioned', () => {
  const sts = { name: 'AWS STS', aliases: ['AWS Security Token Service'] };

  it('matches the name or any alias', () => {
    expect(serviceMentioned('AWS STS issues temporary credentials.', sts)).toBe(true);
    expect(serviceMentioned('The Security Token Service issues credentials.', sts)).toBe(false);
    expect(serviceMentioned('AWS Security Token Service issues credentials.', sts)).toBe(true);
  });
});

describe('lessonProse', () => {
  it('drops link targets so a URL slug cannot count as a mention', () => {
    const body = 'Read [the guide](https://docs.aws.amazon.com/network-firewall/latest/guide/).';
    expect(mentions(lessonProse(body), 'network firewall')).toBe(false);
    expect(mentions(lessonProse(body), 'the guide')).toBe(true);
  });

  it('drops the Sources section so a service named only there does not count as covered', () => {
    const body = 'Use the Transit Gateway here.\n\n## Sources\n\n- [AWS Client VPN guide](https://docs.aws.amazon.com/vpn/)\n';
    expect(mentions(lessonProse(body), 'Transit Gateway')).toBe(true);
    expect(mentions(lessonProse(body), 'AWS Client VPN')).toBe(false);
  });

  it('drops the Vietnamese Nguồn section too', () => {
    const body = 'Nội dung chính.\n\n## Nguồn\n\n- [AWS Client VPN](https://docs.aws.amazon.com/vpn/)\n';
    expect(mentions(lessonProse(body), 'AWS Client VPN')).toBe(false);
  });
});

describe('extractServiceNames', () => {
  it('finds Amazon and AWS names and stops at the first lowercase word', () => {
    expect(extractServiceNames('Which Amazon S3 storage class is cheapest?')).toEqual(['Amazon S3']);
    expect(extractServiceNames('Use AWS Trusted Advisor and AWS Support.')).toEqual(['AWS Trusted Advisor', 'AWS Support']);
    expect(extractServiceNames('The Amazon Snowball Edge device')).toEqual(['Amazon Snowball Edge']);
  });

  it('keeps hyphenated words and the re:Post name', () => {
    expect(extractServiceNames('Follow the AWS Well-Architected Framework.')).toEqual(['AWS Well-Architected Framework']);
    expect(extractServiceNames('Ask on AWS re:Post.')).toEqual(['AWS re:Post']);
  });

  it('returns nothing when there is no Amazon or AWS name', () => {
    expect(extractServiceNames('Which storage class is cheapest?')).toEqual([]);
  });
});

describe('uncoveredServices', () => {
  it('lists names no lesson mentions, sorted by question count, each question counted once', () => {
    const questions = [
      { text: 'Which Amazon S3 class?', options: [{ text: 'AWS Snowball Edge' }, { text: 'Amazon S3 Glacier' }] },
      { text: 'Amazon S3 pricing?', options: [{ text: 'Amazon S3' }, { text: 'Amazon S3' }] },
      { text: 'AWS Trusted Advisor?', options: [{ text: 'AWS Trusted Advisor' }] },
    ];
    const bodies = ['The AWS Trusted Advisor checks your account.'];
    expect(uncoveredServices(questions, bodies)).toEqual([
      { name: 'Amazon S3', count: 2 },
      { name: 'Amazon S3 Glacier', count: 1 },
      { name: 'AWS Snowball Edge', count: 1 },
    ]);
  });
});

describe('findMissingServices', () => {
  const services: ServiceEntry[] = [
    { name: 'AWS Transit Gateway', aliases: ['Transit Gateway'], topicId: 'networking', active: true },
    { name: 'Snowmobile', aliases: [], topicId: 'storage', active: true },
    { name: 'AWS Client VPN', aliases: [], topicId: 'networking', active: false },
  ];

  it('returns only active entries that no lesson of their own topic mentions', () => {
    const bodies = {
      networking: ['A Transit Gateway connects VPCs.', 'Client VPN is not covered in this topic.'],
      storage: ['Snowball moves large data sets.'],
    };
    expect(findMissingServices(services, bodies)).toEqual([services[1]]);
  });

  it('does not accept a mention in a lesson of another topic', () => {
    const bodies = { networking: ['Snowmobile is a storage device.'], storage: [] };
    expect(findMissingServices(services, bodies).map((s) => s.name)).toEqual(['AWS Transit Gateway', 'Snowmobile']);
  });
});

describe('lessonBody', () => {
  it('returns the body without the front matter', () => {
    const file = '---\nid: x\ntitle: Amazon EC2 basics\n---\n## Body\n\nText about AWS Lambda.\n';
    expect(lessonBody(file)).toBe('## Body\n\nText about AWS Lambda.\n');
  });
});
