import type { ScanResponseContract } from '@phumspace/contracts';
import { MatchResult } from './match-result';
import { SuggestResult } from './suggest-result';
import { UnknownResult } from './unknown-result';
import { HumanReviewResult } from './human-review-result';

interface ScanResultProps {
  scanResponse: ScanResponseContract;
  onReset: () => void;
}

export function ScanResult({ scanResponse, onReset }: ScanResultProps) {
  switch (scanResponse.decision) {
    case 'MATCH':
      return <MatchResult scanResponse={scanResponse} onReset={onReset} />;
    case 'SUGGEST':
      return <SuggestResult scanResponse={scanResponse} onReset={onReset} />;
    case 'HUMAN_REVIEW':
      return <HumanReviewResult scanResponse={scanResponse} onReset={onReset} />;
    case 'UNKNOWN':
    default:
      return <UnknownResult onReset={onReset} />;
  }
}
