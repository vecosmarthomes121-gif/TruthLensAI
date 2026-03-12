import { VerificationResult, TrendingClaim, VerificationStatus, Source } from '@/types';

export const mockSources: Source[] = [
  {
    id: '1',
    name: 'Reuters',
    url: 'https://reuters.com/article/example',
    credibilityScore: 95,
    publishedDate: '2026-03-08',
    excerpt: 'Official confirmation from government sources indicates this claim has been verified through multiple independent channels.',
    stance: 'supports'
  },
  {
    id: '2',
    name: 'BBC News',
    url: 'https://bbc.com/news/example',
    credibilityScore: 94,
    publishedDate: '2026-03-07',
    excerpt: 'Our investigation team found corroborating evidence from official statements and on-ground reporting.',
    stance: 'supports'
  },
  {
    id: '3',
    name: 'Associated Press',
    url: 'https://apnews.com/article/example',
    credibilityScore: 96,
    publishedDate: '2026-03-09',
    excerpt: 'Multiple fact-checking organizations have verified the authenticity of this information.',
    stance: 'supports'
  },
  {
    id: '4',
    name: 'Al Jazeera',
    url: 'https://aljazeera.com/news/example',
    credibilityScore: 88,
    publishedDate: '2026-03-06',
    excerpt: 'Regional experts confirm the accuracy of the reported events based on local sources.',
    stance: 'neutral'
  }
];

export const falseSources: Source[] = [
  {
    id: '5',
    name: 'Snopes',
    url: 'https://snopes.com/fact-check/example',
    credibilityScore: 92,
    publishedDate: '2026-03-09',
    excerpt: 'Our investigation reveals this claim is false. The original source has been debunked and the image is from 2019.',
    stance: 'contradicts'
  },
  {
    id: '6',
    name: 'FactCheck.org',
    url: 'https://factcheck.org/example',
    credibilityScore: 91,
    publishedDate: '2026-03-08',
    excerpt: 'This claim has been circulating on social media but lacks credible evidence. No official confirmation exists.',
    stance: 'contradicts'
  },
  {
    id: '7',
    name: 'PolitiFact',
    url: 'https://politifact.com/example',
    credibilityScore: 90,
    publishedDate: '2026-03-07',
    excerpt: 'We rate this claim as False. The underlying data does not support the assertion made.',
    stance: 'contradicts'
  }
];

export const getStatusFromScore = (score: number): VerificationStatus => {
  if (score >= 80) return 'true';
  if (score >= 60) return 'mostly-true';
  if (score >= 40) return 'disputed';
  if (score >= 20) return 'mostly-false';
  return 'false';
};

export const generateMockResult = (claim: string, inputType: string): VerificationResult => {
  // Simple mock logic based on keywords
  const lowerClaim = claim.toLowerCase();
  
  let truthScore = 75;
  let explanation = '';
  let sources = mockSources;
  
  if (lowerClaim.includes('ban') || lowerClaim.includes('fake') || lowerClaim.includes('hoax')) {
    truthScore = 18;
    explanation = 'This claim appears to be false. Our AI scanned 3,247 trusted global news sources and found no credible reports supporting this claim. The origins trace back to unverified social media posts with no official confirmation. Multiple fact-checking organizations have rated this as false.';
    sources = falseSources;
  } else if (lowerClaim.includes('confirm') || lowerClaim.includes('official') || lowerClaim.includes('announce')) {
    truthScore = 89;
    explanation = 'This claim appears credible. Our AI verified this information across 4 major international news organizations including Reuters, BBC News, and Associated Press. Official government statements and multiple independent journalists corroborate the core facts. The timeline and details align with verified reporting.';
    sources = mockSources;
  } else if (lowerClaim.includes('rumor') || lowerClaim.includes('unverified')) {
    truthScore = 45;
    explanation = 'This claim is disputed. While some sources mention this topic, there are contradictory reports and a lack of official confirmation. The information appears to be based on anonymous sources or preliminary reports that have not been independently verified by multiple credible outlets.';
    sources = [...mockSources.slice(0, 2), ...falseSources.slice(0, 2)];
  } else {
    truthScore = 78;
    explanation = 'This claim appears mostly credible. Our AI found supporting evidence from trusted news sources, though some details remain unconfirmed. The core assertion aligns with verified reporting from established media organizations. We recommend monitoring for additional updates as more information becomes available.';
  }

  const relatedClaims = [
    {
      id: 'r1',
      claim: 'Similar claim about related topic verified last week',
      truthScore: 82,
      status: getStatusFromScore(82)
    },
    {
      id: 'r2',
      claim: 'Earlier version of this story debunked in 2025',
      truthScore: 15,
      status: getStatusFromScore(15)
    },
    {
      id: 'r3',
      claim: 'Official statement contradicts this assertion',
      truthScore: 35,
      status: getStatusFromScore(35)
    }
  ];

  return {
    id: `ver-${Date.now()}`,
    claim,
    inputType: inputType as any,
    truthScore,
    status: getStatusFromScore(truthScore),
    explanation,
    sources,
    relatedClaims,
    verifiedAt: new Date().toISOString()
  };
};

export const trendingClaims: TrendingClaim[] = [
  {
    id: 't1',
    claim: 'New AI regulation passed in European Union',
    verificationCount: 2847,
    truthScore: 92,
    status: 'true',
    category: 'Technology'
  },
  {
    id: 't2',
    claim: 'Climate summit postponed to 2027',
    verificationCount: 1923,
    truthScore: 12,
    status: 'false',
    category: 'Environment'
  },
  {
    id: 't3',
    claim: 'Major cryptocurrency exchange faces security breach',
    verificationCount: 1654,
    truthScore: 67,
    status: 'mostly-true',
    category: 'Finance'
  },
  {
    id: 't4',
    claim: 'New variant discovered in Southeast Asia',
    verificationCount: 1432,
    truthScore: 45,
    status: 'disputed',
    category: 'Health'
  },
  {
    id: 't5',
    claim: 'Space mission announces breakthrough discovery',
    verificationCount: 1287,
    truthScore: 85,
    status: 'true',
    category: 'Science'
  },
  {
    id: 't6',
    claim: 'Social media platform bans political ads',
    verificationCount: 1156,
    truthScore: 23,
    status: 'mostly-false',
    category: 'Technology'
  }
];
