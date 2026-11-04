/** Exam domains of CLF-C02 (exam guide weights, in percent). */
export type DomainId = 'concepts' | 'security' | 'technology' | 'billing';

export const DOMAIN_WEIGHTS: Record<DomainId, number> = {
  concepts: 24,
  security: 30,
  technology: 34,
  billing: 12,
};

/** Approximate assignment of app topics to exam domains (spec section 7). */
export const DOMAIN_OF_TOPIC: Record<string, DomainId> = {
  'cloud-concepts': 'concepts',
  'migration-caf': 'concepts',
  'shared-responsibility': 'security',
  'iam-security': 'security',
  'global-infrastructure': 'technology',
  compute: 'technology',
  storage: 'technology',
  networking: 'technology',
  databases: 'technology',
  'deploy-operate': 'technology',
  'support-ai-other': 'technology',
  'pricing-billing': 'billing',
};
