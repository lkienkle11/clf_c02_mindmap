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

/**
 * Domain of each authored Capstone question (topic 'capstone' has no domain of its own), keyed by question id;
 * assigned by the AWS knowledge each question tests.
 */
export const CAPSTONE_QUESTION_DOMAIN: Record<string, DomainId> = {
  // Lambda vs EC2: who patches the OS is a shared-responsibility question.
  'auth-capstone-01': 'security',
  // S3 Lifecycle to Glacier Deep Archive is storage and storage classes.
  'auth-capstone-02': 'technology',
  // RDS Multi-AZ and Route 53 failover routing are availability services.
  'auth-capstone-03': 'technology',
  // CloudWatch alarm with Auto Scaling and SNS is compute scaling and monitoring.
  'auth-capstone-04': 'technology',
  // Consolidated billing in AWS Organizations is account billing and cost management.
  'auth-capstone-05': 'billing',
  // Amazon Inspector and Patch Manager are vulnerability scanning and patching.
  'auth-capstone-06': 'security',
  // Bedrock under the shared responsibility model: the customer controls access to its data.
  'auth-capstone-07': 'security',
  // Oracle to Aurora with DMS is a database migration strategy (cloud adoption and migration).
  'auth-capstone-08': 'concepts',
  // NAT gateway and route tables for a private subnet are networking.
  'auth-capstone-09': 'technology',
  // AWS Artifact reports and KMS customer managed keys are compliance and encryption.
  'auth-capstone-10': 'security',
};
