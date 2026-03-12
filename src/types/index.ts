export type InputType = 'text' | 'url' | 'image' | 'video';

export type VerificationStatus = 'true' | 'mostly-true' | 'disputed' | 'mostly-false' | 'false';

export interface Source {
  id: string;
  name: string;
  url: string;
  credibilityScore: number;
  publishedDate: string;
  excerpt: string;
  stance: 'supports' | 'contradicts' | 'neutral';
  imageUrl?: string;
}

export interface VerificationResult {
  id: string;
  claim: string;
  inputType: InputType;
  truthScore: number;
  status: VerificationStatus;
  explanation: string;
  sources: Source[];
  relatedClaims: RelatedClaim[];
  verifiedAt: string;
  mediaUrl?: string;
  contentAnalysis?: {
    contentType: 'article' | 'image' | 'video' | 'social-post' | 'mixed';
    summary: string;
    extractedText?: string;
    mainClaim?: string;
    extractedMedia?: Array<{
      type: 'image' | 'video';
      url: string;
      caption?: string;
    }>;
  };
}

export interface RelatedClaim {
  id: string;
  claim: string;
  truthScore: number;
  status: VerificationStatus;
}

export interface TrendingClaim {
  id: string;
  claim: string;
  verificationCount: number;
  truthScore: number;
  status: VerificationStatus;
  category: string;
}
