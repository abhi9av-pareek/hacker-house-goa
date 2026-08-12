/**
 * Deterministic builder class generator from role/stack input.
 * Purely client-side, no AI needed.
 */

const CLASS_MAP = [
  { pattern: /(design|ui|ux|visual|figma|product design)/i, title: 'THE PIXEL ENGINEER', code: 'PE-01' },
  { pattern: /(ai|ml|machine learning|data science|llm|deep learning|nlp|computer vision)/i, title: 'THE MODEL WHISPERER', code: 'MW-09' },
  { pattern: /(blockchain|web3|crypto|solidity|defi|nft|smart contract)/i, title: 'THE CHAIN ARCHITECT', code: 'CA-03' },
  { pattern: /(security|cyber|pentest|infosec|ctf|exploit|hacker)/i, title: 'THE GATEKEEPER', code: 'GK-00' },
  { pattern: /(backend|server|api|database|sql|postgres|redis|kafka|infra|devops|cloud|aws|gcp|azure|k8s|docker)/i, title: 'THE SYSTEM SMITH', code: 'SS-07' },
  { pattern: /(mobile|ios|android|flutter|react native|swift|kotlin)/i, title: 'THE POCKET SHIPPER', code: 'PS-05' },
  { pattern: /(product|pm|founder|ceo|cto|startup|growth)/i, title: 'THE PRODUCT ALCHEMIST', code: 'PA-04' },
  { pattern: /(hardware|iot|embedded|robotics|firmware|electronics)/i, title: 'THE CIRCUIT BENDER', code: 'CB-06' },
  { pattern: /(game|unity|unreal|xr|vr|ar|3d)/i, title: 'THE WORLD BUILDER', code: 'WB-08' },
  { pattern: /(full.?stack|fullstack)/i, title: 'THE SYSTEM SMITH', code: 'SS-07' },
  { pattern: /(frontend|front.?end|react|vue|angular|svelte|next|remix)/i, title: 'THE INTERFACE WEAVER', code: 'IW-02' },
];

const FALLBACK = { title: 'THE BUILDER', code: 'BL-42' };

export function makeBuilderClass(role = '') {
  if (!role.trim()) return FALLBACK;
  for (const entry of CLASS_MAP) {
    if (entry.pattern.test(role)) {
      return { title: entry.title, code: entry.code };
    }
  }
  return FALLBACK;
}
