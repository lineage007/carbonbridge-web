export type UserRole = 'buyer' | 'seller' | 'admin';
export type OrderStatus = 'new' | 'payment_received' | 'transfer_in_progress' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'rejected';
export type SellerStatus = 'pending' | 'approved' | 'suspended';
export type InsuranceProduct = 'non_delivery' | 'invalidation' | 'political_risk' | 'corsia_guarantee';
export type CreditType = 'ARR' | 'REDD+' | 'Blue Carbon' | 'Biochar' | 'Cookstove' | 'DACCS' | 'Soil Carbon' | 'ERW' | 'IFM' | 'Landfill Gas';
export type QualityRating = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'C';
export type ClaimStatus = 'submitted' | 'admin_reviewed' | 'routed_to_insurer' | 'resolved_paid' | 'resolved_denied';
export type ForwardStatus = 'awaiting' | 'in_progress' | 'delivered' | 'defaulted';
export type RFQStatus = 'open' | 'responses_received' | 'accepted' | 'expired' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  company_name: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  job_title?: string;
  phone?: string;
  trade_licence?: string;
  trn?: string;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  industry?: string;
  compliance_needs?: string[];
  seller_status?: SellerStatus;
  stripe_account_id?: string;
  stripe_onboarding_complete?: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  project_name: string;
  registry: string;
  registry_id?: string;
  methodology: string;
  credit_type: CreditType;
  vintage: number;
  country: string;
  region?: string;
  available_tonnes: number;
  price_per_tonne: number;
  quality_rating: QualityRating;
  co_benefits: string[];
  description: string;
  is_forward: boolean;
  forward_delivery_date?: string;
  forward_min_volume?: number;
  status: ListingStatus;
  corsia_eligible: boolean;
  cbam_eligible: boolean;
  nrcc_eligible: boolean;
  cost_basis?: number; // For CarbonBridge Direct
  created_at: string;
}

export interface Order {
  id: string;
  order_ref: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  insurance_products: InsuranceProduct[];
  insurance_premium: number;
  platform_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: 'pending' | 'received' | 'refunded';
  credit_transfer_status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  verra_transfer_ref?: string;
  status: OrderStatus;
  stripe_payment_intent_id?: string;
  bank_transfer_ref?: string;
  purchase_agreement_expires?: string;
  admin_notes?: string;
  created_at: string;
}

export interface InsuranceClaim {
  id: string;
  order_id: string;
  buyer_id: string;
  claim_ref: string;
  product: InsuranceProduct;
  description: string;
  supporting_docs?: string[];
  status: ClaimStatus;
  insurer_response?: string;
  resolution_amount?: number;
  admin_notes?: string;
  created_at: string;
}

export interface ForwardContract {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  volume: number;
  agreed_price: number;
  delivery_date: string;
  insurance_selected: boolean;
  status: ForwardStatus;
  contract_ref?: string;
  created_at: string;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  credit_types: CreditType[];
  quantity: number;
  target_price_min?: number;
  target_price_max?: number;
  delivery_timeline: string;
  compliance_requirement?: string;
  min_quality?: QualityRating;
  geography_preference?: string;
  insurance_required?: string;
  notes?: string;
  status: RFQStatus;
  created_at: string;
}

export interface APIClient {
  id: string;
  user_id: string;
  api_key_live: string;
  api_key_sandbox: string;
  company_name: string;
  credit_type_preference?: CreditType;
  min_quality?: QualityRating;
  preferred_region?: string;
  webhook_url?: string;
  monthly_minimum: number;
  margin_rate: number;
  per_call_fee: number;
  status: 'active' | 'suspended';
  created_at: string;
}

export interface APITransaction {
  id: string;
  client_id: string;
  co2_tonnes: number;
  credit_type_allocated?: CreditType;
  estimated_cost: number;
  billing_period: string;
  status: 'logged' | 'invoiced' | 'paid' | 'retired';
  created_at: string;
}
