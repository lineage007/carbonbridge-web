// API keys are interpolated into a PostgREST .or() filter, where commas, dots and
// parentheses are syntax. Anything outside this charset is rejected before the query,
// so a crafted x-api-key header cannot add its own filter clauses (e.g. ",id.eq.<uuid>").
export const API_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/

export function isWellFormedApiKey(key: string): boolean {
  return API_KEY_PATTERN.test(key)
}
