export interface Keyword {
  pattern: RegExp;
  /** 3 = specific service/product name, 1 = generic word. */
  weight: 1 | 3;
}

export interface TopicRule {
  topicId: string;
  keywords: Keyword[];
}

const s = (pattern: RegExp): Keyword => ({ pattern, weight: 3 });
const g = (pattern: RegExp): Keyword => ({ pattern, weight: 1 });

// Each keyword lives in exactly one topic. Topic 13 (capstone) has no rules.
// Unless noted, patterns are case-insensitive; AI/ML/product names that collide
// with ordinary English words are case-sensitive with a leading boundary.
export const TOPIC_RULES: TopicRule[] = [
  {
    topicId: 'cloud-concepts',
    keywords: [
      s(/\belasticity\b/i),
      s(/\bpay[- ]as[- ]you[- ]go\b/i),
      s(/economies of scale/i),
      s(/\bhigh(ly)? availab/i),
      s(/\bfault[- ]toleran/i),
      s(/\bcapital expense|\bcapex\b|\bopex\b|operational expense|variable expense/i),
      s(/\bstop guessing capacity\b|go global in minutes/i),
      s(/benefits? of (the )?(aws )?cloud|cloud computing/i),
      g(/\bagility\b/i),
      g(/\bscalab(le|ility)\b/i),
      g(/\bon-demand delivery\b/i),
    ],
  },
  {
    topicId: 'global-infrastructure',
    keywords: [
      s(/\bavailability zones?\b/i),
      s(/\bedge locations?\b/i),
      s(/global infrastructure/i),
      s(/\bAWS Outposts\b|\bLocal Zones?\b|\bWavelength\b/i),
      s(/\bdata residency\b|\bdata sovereignty\b/i),
      g(/\bregions?\b/i),
      g(/\bAZs?\b/),
      g(/\blatency\b/i),
    ],
  },
  {
    topicId: 'compute',
    keywords: [
      s(/\bEC2\b/i),
      s(/\bLambda\b/),
      s(/\bECS\b|\bEKS\b|\bECR\b/),
      s(/\bFargate\b/i),
      s(/\bLightsail\b/i),
      s(/\bAWS Batch\b/),
      s(/Auto ?Scaling/i),
      s(/\bElastic Load Balanc|\bELB\b|\bALB\b|load balancer/i),
      s(/\bAMI\b|Amazon Machine Image/),
      s(/\bspot instances?\b|\bdedicated hosts?\b|\bdedicated instances?\b|\binstance types?\b/i),
      g(/\bserverless\b/i),
      g(/\bcontainers?\b/i),
      g(/\bvirtual (machine|server)s?\b/i),
    ],
  },
  {
    topicId: 'storage',
    keywords: [
      s(/\bS3\b|Simple Storage Service/),
      s(/\bEBS\b|Elastic Block Store/),
      s(/\bEFS\b|Elastic File System/),
      s(/\bFSx\b/i),
      s(/Glacier/i),
      s(/Snowball|Snowcone|Snowmobile|Snow Family/i),
      s(/Storage Gateway/i),
      s(/\bAWS Backup\b/),
      s(/\binstance store\b/i),
      g(/\bobject storage\b|\bblock storage\b|\bfile storage\b|\bbucket/i),
      g(/\bstorage class/i),
    ],
  },
  {
    topicId: 'networking',
    keywords: [
      s(/\bVPC\b|virtual private cloud/i),
      s(/Route ?53/i),
      s(/CloudFront/i),
      s(/Direct Connect/i),
      s(/\bsubnets?\b/i),
      s(/\bsecurity groups?\b/i),
      s(/\bnetwork ACLs?\b|\bNACLs?\b|\baccess control lists?\b/i),
      s(/\bNAT gateway|\binternet gateway|\bPrivateLink\b|\bTransit Gateway\b|\bVPC peering\b/i),
      s(/\bGlobal Accelerator\b|\bAPI Gateway\b/),
      s(/\bVPN\b/),
      g(/\bDNS\b|\bCDN\b|content delivery network/i),
      g(/\bIP address|\bCIDR\b/i),
      g(/\bnetwork(ing)?\b/i),
    ],
  },
  {
    topicId: 'databases',
    keywords: [
      s(/\bRDS\b/),
      s(/DynamoDB/i),
      s(/\bAurora\b/),
      s(/Redshift/i),
      s(/ElastiCache/i),
      s(/\bNeptune\b|\bDocumentDB\b|\bTimestream\b|\bQLDB\b|\bKeyspaces\b/),
      s(/\bread replicas?\b|\bMulti-AZ\b/i),
      g(/\bdatabases?\b/i),
      g(/\bSQL\b|\bNoSQL\b/),
      g(/data warehouse/i),
    ],
  },
  {
    topicId: 'deploy-operate',
    keywords: [
      s(/CloudFormation/i),
      s(/CloudWatch/i),
      s(/CloudTrail/i),
      s(/\bAWS Config\b/),
      s(/Systems Manager/i),
      s(/CodeDeploy|CodePipeline|CodeBuild|CodeCommit|CodeStar|\bCI\/CD\b/),
      s(/Elastic Beanstalk/i),
      s(/infrastructure as code|\bIaC\b/i),
      s(/\bOpsWorks\b|\bAWS CDK\b|\bAWS CLI\b|command line interface|\bAWS SDKs?\b|Management Console/),
      s(/\bX-Ray\b|\bEventBridge\b|\bAWS Health\b|\bPersonal Health Dashboard\b|\bService Health\b/),
      g(/\bAPI calls?\b|\bdeleted\b/i),
      g(/\bmonitoring\b|\blogging\b|\bautomat(e|ion)/i),
      g(/\brepeatable\b|\bprovision/i),
    ],
  },
  {
    topicId: 'shared-responsibility',
    keywords: [
      s(/shared responsibility/i),
      s(/security (of|in) the cloud/i),
      g(/responsib(le|ility) for/i),
      g(/\bmanaged service/i),
      g(/\bpatch(ing)?\b/i),
    ],
  },
  {
    topicId: 'iam-security',
    keywords: [
      s(/\bIAM\b|Identity and Access Management/),
      s(/\bKMS\b|Key Management Service|CloudHSM/),
      s(/\bShield\b/),
      s(/\bWAF\b/),
      s(/GuardDuty/i),
      s(/Inspector/),
      s(/Macie/i),
      s(/Cognito/i),
      s(/Secrets Manager|Certificate Manager|\bACM\b|\bAWS Artifact\b|Security Hub|\bAmazon Detective\b/),
      s(/\bMFA\b|multi-factor|\broot user\b|\baccess keys?\b|\bleast privilege\b/i),
      s(/\bIAM Identity Center\b|\bDirectory Service\b|\bAWS SSO\b/),
      g(/\bencrypt|\bsecurity\b|\bfirewall\b|\bDDoS\b/i),
      g(/\bpolic(y|ies)\b|\broles?\b|\busers?\b|\bfederat/i),
      g(/\bcompliance\b|\baudit/i),
    ],
  },
  {
    topicId: 'pricing-billing',
    keywords: [
      s(/Cost Explorer/i),
      s(/\bAWS Budgets\b|\bBudgets\b/),
      s(/Savings Plans?/i),
      s(/\bReserved (Instances?|capacity)\b|\bReserved\b/),
      s(/consolidated billing/i),
      s(/\bAWS Organizations\b/),
      s(/\bTCO\b|total cost of ownership/i),
      s(/\bcost allocation tags?\b|\bcost and usage report\b|\bPricing Calculator\b|\bAWS Marketplace\b/i),
      s(/\bpurchasing options?\b/i),
      g(/\bpricing\b|\bprice\b/i),
      g(/\bbilling\b|\bbill\b|\binvoice/i),
      g(/\bcosts?\b|\bcost[- ]effective|\bcost optimi[sz]ation\b/i),
      g(/\bfree tier\b|\bdiscount/i),
    ],
  },
  {
    topicId: 'migration-caf',
    keywords: [
      s(/Cloud Adoption Framework|\bCAF\b/),
      s(/Database Migration Service|\bAWS DMS\b/),
      s(/Migration Hub|Application Discovery|Application Migration|\bMGN\b/),
      s(/Well-Architected/i),
      s(/\bDataSync\b|\bTransfer Family\b/),
      s(/\b(6|six) Rs\b|\brehost|\breplatform|\bre-?architect|\brepurchase/i),
      g(/\bmigrat/i),
      g(/\brefactor|\bretire\b|\bretain\b/i),
      g(/\bhybrid\b|\bon-premises\b|\bon premises\b/i),
      g(/\boperational excellence\b|\bperformance efficiency\b|\bsustainability\b|\breliability pillar\b/i),
    ],
  },
  {
    topicId: 'support-ai-other',
    keywords: [
      s(/Support plans?|Developer Support|Business Support|Enterprise (On-Ramp )?Support|Basic Support/i),
      s(/Trusted Advisor/i),
      s(/Technical Account Manager|\bTAM\b|Concierge|Professional Services|Partner Network|\bAPN\b|\bIQ\b/),
      s(/SageMaker|Rekognition|Comprehend|\bAmazon Lex\b|\bPolly\b|Transcribe|Bedrock|Textract|Kendra/),
      s(/\bAmazon Translate\b|\bAmazon Forecast\b|\bAmazon Personalize\b|\bAmazon Connect\b/),
      s(/\bSNS\b|\bSQS\b|\bSES\b|\bStep Functions\b|\bKinesis\b|\bAthena\b|\bGlue\b|\bQuickSight\b|\bEMR\b|\bWorkSpaces\b|AppStream|\bIoT\b|\bAmplify\b|\bAppSync\b|\bAmazon MQ\b/),
      g(/machine learning|artificial intelligence|generative/i),
      g(/\bAI\b|\bML\b/),
      g(/\bwhitepapers?\b|\bre:Invent\b|\bAWS Training\b|\bcertification/i),
    ],
  },
];
