import { VerificationResult } from '@/types';

const STORAGE_KEY = 'truthlens_history';

export const saveVerification = (result: VerificationResult): void => {
  const history = getVerificationHistory();
  history.unshift(result);
  // Keep only last 50 verifications
  const trimmed = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
};

export const getVerificationHistory = (): VerificationResult[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const getVerificationById = (id: string): VerificationResult | null => {
  const history = getVerificationHistory();
  return history.find(v => v.id === id) || null;
};

export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
