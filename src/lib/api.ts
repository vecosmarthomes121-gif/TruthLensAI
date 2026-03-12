import { supabase } from './supabase';
import { InputType, VerificationResult } from '@/types';
import { FunctionsHttpError } from '@supabase/supabase-js';

export const verifyClaimWithAI = async (
  claim: string,
  inputType: InputType,
  mediaUrl?: string
): Promise<VerificationResult> => {
  console.log('Calling verify-claim Edge Function:', { claim, inputType, mediaUrl });

  const { data, error } = await supabase.functions.invoke('verify-claim', {
    body: {
      claim,
      inputType,
      mediaUrl,
    },
  });

  if (error) {
    console.error('Edge Function error:', error);
    let errorMessage = error.message;
    
    if (error instanceof FunctionsHttpError) {
      try {
        const statusCode = error.context?.status ?? 500;
        const textContent = await error.context?.text();
        errorMessage = `[Code: ${statusCode}] ${textContent || error.message || 'Unknown error'}`;
      } catch {
        errorMessage = `${error.message || 'Failed to verify claim'}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  console.log('Verification successful:', data);
  return {
    id: data.id,
    claim,
    inputType,
    truthScore: data.truthScore,
    status: data.status,
    explanation: data.explanation,
    sources: data.sources,
    relatedClaims: data.relatedClaims,
    verifiedAt: new Date().toISOString(),
    mediaUrl,
    contentAnalysis: data.contentAnalysis,
  };
};

export const getVerificationHistory = async (): Promise<VerificationResult[]> => {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Failed to fetch history:', error);
    throw error;
  }

  return data.map(v => ({
    id: v.id,
    claim: v.claim,
    inputType: v.input_type,
    truthScore: v.truth_score,
    status: v.status,
    explanation: v.explanation,
    sources: v.sources,
    relatedClaims: v.related_claims,
    verifiedAt: v.created_at,
    mediaUrl: v.media_url,
  }));
};

export const getVerificationById = async (id: string): Promise<VerificationResult | null> => {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Failed to fetch verification:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    claim: data.claim,
    inputType: data.input_type,
    truthScore: data.truth_score,
    status: data.status,
    explanation: data.explanation,
    sources: data.sources,
    relatedClaims: data.related_claims,
    verifiedAt: data.created_at,
    mediaUrl: data.media_url,
  };
};

export const getTrendingClaims = async () => {
  const { data, error } = await supabase
    .from('trending_claims')
    .select('*')
    .order('verification_count', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch trending:', error);
    return [];
  }

  return data.map(t => ({
    id: t.id,
    claim: t.claim,
    verificationCount: t.verification_count,
    truthScore: t.average_truth_score,
    status: t.status,
    category: t.category,
  }));
};
