import { z } from 'zod'

// GSTIN format: 2 digit state code + 10 char PAN + 1 entity code + 1 check digit
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

export const onboardingSchema = z.object({
  name: z
    .string()
    .min(1, 'Organization name is required')
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters'),
  legalName: z
    .string()
    .optional(),
  gstin: z
    .string()
    .min(1, 'GSTIN is required')
    .length(15, 'GSTIN must be exactly 15 characters')
    .regex(gstinRegex, 'Please enter a valid GSTIN format'),
  industry: z
    .string()
    .optional(),
  state: z
    .string()
    .min(1, 'State is required'),
  city: z
    .string()
    .optional(),
  annualTurnoverRange: z
    .string()
    .optional(),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Industry options
export const industryOptions = [
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'trading', label: 'Trading' },
  { value: 'services', label: 'Services' },
  { value: 'it_software', label: 'IT & Software' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'construction', label: 'Construction' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transportation', label: 'Transportation & Logistics' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
]

// Indian states
export const stateOptions = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Puducherry', label: 'Puducherry' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
]

// Turnover ranges - must match backend validation
export const turnoverOptions = [
  { value: '0-40L', label: 'Below 40 Lakhs' },
  { value: '40L-1.5Cr', label: '40 Lakhs - 1.5 Crore' },
  { value: '1.5Cr-5Cr', label: '1.5 Crore - 5 Crore' },
  { value: '5Cr-25Cr', label: '5 Crore - 25 Crore' },
  { value: '25Cr+', label: 'Above 25 Crore' },
]
