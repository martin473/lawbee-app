/**
 * Legiscan API State Codes
 * Standard US state 2-letter abbreviations used by the Legiscan API
 * 
 * Legiscan supports:
 * - All 50 US states
 * - District of Columbia (DC)
 * - US Congress (US) - federal bills
 * - ALL - search across all states
 * 
 * Note: US territories (Guam, Puerto Rico, etc.) are NOT supported for local legislation.
 * Federal bills about territories appear in the US Congress dataset.
 */

export interface State {
  code: string;
  name: string;
}

export const LEGISCAN_STATES: State[] = [
  // Special options
  { code: 'ALL', name: 'All States' },
  { code: 'US', name: 'Federal (US Congress)' },
  // US States
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  // District of Columbia (supported by Legiscan)
  { code: 'DC', name: 'District of Columbia' },
];

/**
 * Get state name by code
 */
export function getStateName(code: string): string | undefined {
  return LEGISCAN_STATES.find(state => state.code === code)?.name;
}

/**
 * Get state code by name
 */
export function getStateCode(name: string): string | undefined {
  return LEGISCAN_STATES.find(state => state.name.toLowerCase() === name.toLowerCase())?.code;
}
