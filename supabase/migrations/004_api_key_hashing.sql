-- Migration: 004_api_key_hashing.sql
-- Migrates API key storage from plaintext to SHA-256 hashed values.
--
-- WHY: Plaintext API keys in profiles.api_key_live / api_key_sandbox mean
-- any database dump or accidental SELECT exposes all live credentials.
-- SHA-256 hashes are one-way: a key can be verified by hashing the incoming
-- value and comparing, but cannot be reversed.
--
-- NOTE on timing attacks: The SQL OR lookup
--   .or(`api_key_live_hash.eq.${hash},api_key_sandbox_hash.eq.${hash}`)
-- avoids the early-return timing oracle of comparing two columns in
-- application code — Postgres evaluates both sides before returning.
-- For additional hardening, move to bcrypt via a Postgres extension.
--
-- APPLY INSTRUCTIONS (needs-gary):
--   1. Ensure pgcrypto extension is enabled in the Supabase project:
--        CREATE EXTENSION IF NOT EXISTS pgcrypto;
--   2. Run this migration on Supabase project ixoxhzlwaspjfvbgfgff.
--      NEVER run on dcemanhmabsjmkitskil.
--   3. After migration: update API route (src/app/api/retire/route.ts and
--      GET handler) to hash incoming key with SHA-256 before lookup.
--      See code comment in route.ts marked "TODO: use hashed key lookup".
--   4. Rotate all existing API keys after migration (old plaintext keys
--      will no longer work until re-issued as hashes).
--
-- STATUS: DRAFT — requires code changes in API routes to match. Apply after
-- retire/route.ts hashing changes are deployed. Needs Gary sign-off.

-- Step 1: enable pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: add hashed columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS api_key_live_hash text,
  ADD COLUMN IF NOT EXISTS api_key_sandbox_hash text;

-- Step 3: populate hashes from existing plaintext keys (one-time migration)
UPDATE public.profiles
  SET api_key_live_hash = encode(digest(api_key_live, 'sha256'), 'hex')
  WHERE api_key_live IS NOT NULL;

UPDATE public.profiles
  SET api_key_sandbox_hash = encode(digest(api_key_sandbox, 'sha256'), 'hex')
  WHERE api_key_sandbox IS NOT NULL;

-- Step 4: add unique indexes on hashed columns
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_api_key_live_hash
  ON public.profiles(api_key_live_hash)
  WHERE api_key_live_hash IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_api_key_sandbox_hash
  ON public.profiles(api_key_sandbox_hash)
  WHERE api_key_sandbox_hash IS NOT NULL;

-- Step 5 (after confirming all API routes use hash lookup):
-- Uncomment to drop plaintext columns:
-- ALTER TABLE public.profiles
--   DROP COLUMN api_key_live,
--   DROP COLUMN api_key_sandbox;
