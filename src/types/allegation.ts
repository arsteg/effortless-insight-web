// Allegation types for point-wise reply drafting

export type AllegationStatus = 'complete' | 'needs_review' | 'missing_info'

export type AllegationCategory =
  | 'Tax Evasion'
  | 'ITC Mismatch'
  | 'Non-filing'
  | 'Short Payment'
  | 'Wrong Classification'
  | 'Fake Invoice'
  | 'E-way Bill Violation'
  | 'Registration Issue'
  | 'Procedural Lapse'
  | 'Documentation Issue'
  | 'Other'

// Individual allegation extracted from a notice
export interface Allegation {
  id: string
  serialNumber: number
  description: string
  category: string
  legalProvision?: string
  amountInvolved?: number
  period?: string
  evidenceCited: string[]
  pageReference?: string
}

// Supporting document reference
export interface SupportingDocument {
  documentName: string
  documentType: string
  relevance: string
  available: boolean
}

// Case law citation
export interface CaseLawReference {
  citation: string
  court: string
  principle: string
  relevance: string
}

// AI-generated response for a single allegation
export interface AllegationResponse {
  allegationId: string
  responseText: string
  legalBasis: string[]
  supportingEvidence: SupportingDocument[]
  missingInformation: string[]
  caseLawReferences?: CaseLawReference[]
  confidence: number
  status: AllegationStatus
}

// Metadata for draft generation
export interface AutoDraftMetadata {
  model: string
  processingTimeMs: number
  noticeType?: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

// Request for generating allegation-wise draft
export interface AllegationWiseDraftRequest {
  tone?: 'formal' | 'conciliatory' | 'defensive'
  language?: 'en' | 'hi'
  allegationOverrides?: Record<string, string>
  includeCaseLaw?: boolean
  taxpayerContext?: Record<string, unknown>
}

// Response from allegation-wise draft generation
export interface AllegationWiseDraftResponse {
  generationOptions?: AllegationWiseDraftRequest
  allegations: Allegation[]
  responses: AllegationResponse[]
  combinedDraft?: string
  missingInfoSummary: string[]
  metadata: AutoDraftMetadata
}

// Request for regenerating a single allegation response
export interface RegenerateAllegationRequest {
  allegation: Allegation
  tone?: 'formal' | 'conciliatory' | 'defensive'
  language?: 'en' | 'hi'
  customInstructions?: string
  taxpayerContext?: Record<string, unknown>
}

// Helper type for allegation with response
export interface AllegationWithResponse {
  allegation: Allegation
  response: AllegationResponse
  isExpanded?: boolean
  isRegenerating?: boolean
}

// Helper to calculate status color
export function getStatusColor(status: AllegationStatus): string {
  switch (status) {
    case 'complete':
      return 'mint'
    case 'needs_review':
      return 'amber'
    case 'missing_info':
      return 'coral'
    default:
      return 'gray'
  }
}

// Helper to get status label
export function getStatusLabel(status: AllegationStatus): string {
  switch (status) {
    case 'complete':
      return 'Complete'
    case 'needs_review':
      return 'Needs Review'
    case 'missing_info':
      return 'Missing Info'
    default:
      return 'Unknown'
  }
}

// Helper to format amount
export function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null) {
    return '-'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}
