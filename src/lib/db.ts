import { supabase } from './supabase';

// ═══════════════════════════════════════════════════
// Profile
// ═══════════════════════════════════════════════════

export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════════════
// Portfolio — user's owned credits
// ═══════════════════════════════════════════════════

export async function getPortfolio(userId: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, listing:listings(*)')
    .eq('buyer_id', userId)
    .in('status', ['completed', 'credits_transferred'])
    .order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════════════
// Orders — purchases
// ═══════════════════════════════════════════════════

export async function getUserOrders(userId: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, listing:listings(*)')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getSellerOrders(userId: string) {
  const { data } = await supabase
    .from('orders')
    .select('*, listing:listings(*), buyer:profiles!buyer_id(company_name, email)')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════════════
// Listings — seller's credits
// ═══════════════════════════════════════════════════

export async function getUserListings(userId: string) {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function createListing(listing: Record<string, unknown>) {
  const { data, error } = await supabase.from('listings').insert(listing).select().single();
  if (error) throw error;
  return data;
}

export async function updateListing(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════════════
// All listings (marketplace)
// ═══════════════════════════════════════════════════

export async function getMarketplaceListings() {
  const { data } = await supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(company_name)')
    .eq('status', 'active')
    .gt('available_tonnes', 0)
    .order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════════════
// Forward contracts
// ═══════════════════════════════════════════════════

export async function getUserForwards(userId: string) {
  const { data } = await supabase
    .from('forward_contracts')
    .select('*, listing:listings(*)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════════════
// Carbon management — emissions data
// ═══════════════════════════════════════════════════

export async function getEmissions(userId: string) {
  const { data } = await supabase
    .from('emissions')
    .select('*')
    .eq('user_id', userId)
    .order('reporting_year', { ascending: false });
  return data || [];
}

// ═══════════════════════════════════════════════════
// API keys
// ═══════════════════════════════════════════════════

export async function generateApiKey(userId: string, type: 'sandbox' | 'live') {
  const key = `cb_${type}_${crypto.randomUUID().replace(/-/g, '')}`;
  const field = type === 'sandbox' ? 'api_key_sandbox' : 'api_key_live';
  await supabase.from('profiles').update({ [field]: key, api_enabled: true }).eq('id', userId);
  return key;
}

// ═══════════════════════════════════════════════════
// Admin
// ═══════════════════════════════════════════════════

export async function getAllOrders() {
  const { data } = await supabase
    .from('orders')
    .select('*, listing:listings(*), buyer:profiles!buyer_id(company_name, email), seller:profiles!seller_id(company_name, email)')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAllUsers() {
  const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getAllListings() {
  const { data } = await supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(company_name)')
    .order('created_at', { ascending: false });
  return data || [];
}

export async function getAdminStats() {
  const { data: orders } = await supabase.from('orders').select('total_amount, status, created_at');
  const { data: users } = await supabase.from('profiles').select('id, created_at, role');
  const { data: listings } = await supabase.from('listings').select('id, available_tonnes, total_tonnes, price_per_tonne');

  const totalGmv = (orders || []).reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingSettlements = (orders || []).filter(o => ['buyer_paid', 'credits_transferring'].includes(o.status)).length;
  const totalUsers = (users || []).length;
  const totalCredits = (listings || []).reduce((s, l) => s + (l.total_tonnes || 0), 0);

  return { totalGmv, pendingSettlements, totalUsers, totalCredits, orders: orders || [], users: users || [], listings: listings || [] };
}
