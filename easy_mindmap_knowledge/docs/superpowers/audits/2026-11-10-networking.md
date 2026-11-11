# Audit: networking (67 questions, 10 lessons EN/VI)

Date: 2026-11-11. Workers: Codex gpt-6.1-sol high and Haiku 5.5 XHigh, read-only; compliance OK. Raw results: `.superpowers/diff-agents/2026-11-10-question-bank-audit/networking/results/`.

Result: no answer key changed. 60 of 67 verified by both workers.

## Options replaced (keys unchanged, approved by the user)
- `q_999988be4d37`: AWS Firewall Manager became Amazon GuardDuty (Firewall Manager can manage network ACLs). `q_26c6c9e1d58a`: the S3 Availability Zone choice and the EC2-for-Lambda choice became two AWS responsibilities. `q_8f3d719c6f61`: VPC endpoints and Direct Connect became Amazon CloudFront and AWS WAF. `q_6618bfe4df85`: the AMS option "landing zone and network management" (AMS Advanced only) became "operational monitoring, incident management and patch management". `q_c6e6746d2ee9`: ElastiCache became AWS Config. `q_a96a6d19e3cf`: Amazon VPC became AWS Shield (VPC has built-in DNS through the Route 53 Resolver).

## Wording (flagged by both workers)
- `q_7560b199e7a1`: Direct Connect needs a physical connection at a Direct Connect location through a colocation presence, a partner or an independent provider. `q_d901bbeb9455`: a security group applies to the resources it is associated with. `auth-networking-06`: instances in a public subnet also need a public IP address.

## Left unchanged
- Lessons: Haiku found no lesson issue; about 12 minor Codex-only notes (NAT gateway regional mode, IPv4 charges, IPv6 wording, S3 endpoint and NAT cost, VPN and Direct Connect wording, Client VPN security groups).
- Other explanation notes flagged by one worker only (about 10).
