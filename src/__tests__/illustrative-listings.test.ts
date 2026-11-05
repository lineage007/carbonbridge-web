// E9: the 21 marketplace listings are illustrative. They must not name real
// developers, verifiers, buyers or partners, must not claim CarbonBridge holds
// inventory, and must not carry a CCP label. Prices, volumes and ratings are
// pinned so this change cannot move them.
// Copy to src/__tests__/illustrative-listings.test.ts. Expected on main 6f43ba0:
// 8 failing, 4 passing (ids, prices+ratings, volumes, scanner control).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { LISTINGS } from '../data/credits';

const read = (p: string) => readFileSync(join(process.cwd(), p), 'utf8');

const OLD_PROJECT_NAMES = [
  'Great Southern Forest Restoration', 'Kimberley Savanna Carbon Project', 'Queensland Tropical Reforestation',
  'Murray-Darling Regenerative Agriculture', 'South Australia Rangeland Restoration', 'Abu Dhabi Mangrove Blue Carbon',
  'Dubai Industrial Energy Transition', 'Kalimantan Peatland Conservation', 'Prey Lang Wildlife Sanctuary',
  'Central Highlands Forest Protection', 'Kenya Highland Reforestation', 'Zambézia Biodiversity Corridor',
  'Uganda Clean Cooking Alliance', 'Atlantic Forest Restoration Brazil', 'Colombian Cloud Forest Conservation',
  'Victorian Biochar Carbon Sequestration', 'Swiss Engineered Carbon Removal', 'Guyana REDD+ National Programme',
  'Pacific Northwest Extended Rotation', 'Rajasthan Solar Thermal Industrial', 'São Paulo Landfill Methane Recovery',
];

const BANNED = [
  // developers on main 6f43ba0
  'GreenCollar', 'Aboriginal Carbon Foundation', 'Cassowary Conservation Trust', 'Regen Farmers Mutual',
  'Outback Carbon', 'EAD Carbon', 'Masdar', 'Infinite Earth', 'Wildlife Works', 'South Pole', 'Komaza',
  'ETC Group', 'ClimateCare', 'SOS Mata', 'Terrasos', 'Pacific Biochar', 'Climeworks', 'Architecture for REDD',
  'Finite Carbon', 'CleanMax', 'Biogas Energia',
  // verification bodies
  'SCS Global', 'KPMG', 'Bureau Veritas', 'ERM CVS', 'RINA Services', 'DNV', 'Aster Global',
  'Gold Standard Foundation', 'ART Secretariat', 'UNFCCC', 'TÜV SÜD',
  // buyers, partners, endorsements
  'Environment Agency', '(EAD)', 'COP28', 'Microsoft', 'Stripe', 'Swiss Re', 'Hess',
  // standing claims about real projects
  "world's most advanced", "world's first", 'among the most credible', 'highest-rated',
  'independently metered', "world's most important",
  ...OLD_PROJECT_NAMES,
];

const hits = (text: string) => BANNED.filter((b) => text.includes(b));

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTU'.split('');

describe('illustrative listings: identity (E9)', () => {
  it('every developer is "Example Developer A" to "U", in file order', () => {
    expect(LISTINGS.map((c) => c.developer)).toEqual(LETTERS.map((l) => `Example Developer ${l}`));
  });

  it('no listing names a verification body', () => {
    for (const c of LISTINGS) expect(c.verificationBody, c.id).toBe('Illustrative (no verification)');
  });

  it('no listing claims CB inventory, CB sourcing or a CCP label', () => {
    for (const c of LISTINGS) {
      expect(c.isCBDirect, c.id).toBe(false);
      expect(c.isCBSourced ?? false, c.id).toBe(false);
      expect(c.ccpLabelled, c.id).toBe(false);
    }
  });

  it('project names are illustrative and locations are country-level', () => {
    LISTINGS.forEach((c, i) => {
      expect(c.projectName.startsWith(`Illustrative listing ${LETTERS[i]}: `), c.id).toBe(true);
      expect(c.location, c.id).not.toMatch(/[,(]/);
    });
  });

  it('no real developer, verifier, buyer, partner or project name appears in any field', () => {
    expect(hits(JSON.stringify(LISTINGS))).toEqual([]);
  });

  it('the data file no longer says it is based on real projects', () => {
    expect(read('src/data/credits.ts')).not.toContain('Based on real');
  });
});

describe('illustrative listings: page copy (E9)', () => {
  it('marketplace says illustrative, not verified', () => {
    const page = read('src/app/marketplace/page.tsx');
    expect(page).not.toContain('verified credit');
    expect(page).not.toContain('ICVCM CCP criteria');
    expect(page).toContain('illustrative listing');
    expect(page).toContain('They are not offers');
  });

  it('credit detail page offers no documentation and claims no verified co-benefits', () => {
    const page = read('src/app/credits/[id]/page.tsx');
    expect(page).not.toContain('Documentation available upon request');
    expect(page).not.toContain('Verified Co-benefits');
    expect(page).toContain('No documentation exists for illustrative listings.');
    expect(page).toContain('They are not offers');
  });
});

describe('illustrative listings: guards (must pass before and after)', () => {
  it('ids are unchanged', () => {
    expect(LISTINGS.map((c) => c.id)).toEqual([
      'cb-au-arr-001', 'cb-au-sav-001', 'cb-au-arr-003', 'cb-au-soil-001', 'cb-au-soil-002', 'cb-ae-blue-001',
      'cb-ae-ee-001', 'cb-id-redd-001', 'cb-kh-redd-001', 'cb-vn-redd-001', 'cb-ke-arr-001', 'cb-mz-redd-001',
      'cb-ug-ee-001', 'cb-br-arr-001', 'cb-co-arr-001', 'cb-au-bio-001', 'cb-ch-bio-001', 'cb-gy-jredd-001',
      'cb-us-ifm-001', 'cb-in-ee-001', 'cb-br-lfg-001',
    ]);
  });

  it('prices and quality ratings are unchanged', () => {
    expect(LISTINGS.map((c) => c.price)).toEqual([
      26.4, 18.9, 32.8, 22.1, 19.5, 42.5, 14.2, 11.8, 8.9, 9.6, 15.2, 7.4, 6.8, 18.4, 21.5, 85, 148, 35, 16.8, 5.8, 8.2,
    ]);
    expect(LISTINGS.map((c) => c.qualityRating).join(',')).toBe(
      'AA,AAA,AA,A,BBB,AAA,A,A,BBB,A,A,BB,BBB,AA,AA,AAA,AAA,AAA,A,BBB,A',
    );
  });

  it('volumes are unchanged', () => {
    expect(LISTINGS.map((c) => c.volumeAvailable)).toEqual([
      45000, 82000, 12500, 28000, 35000, 8500, 120000, 250000, 380000, 180000, 55000, 420000, 200000, 35000, 18000,
      4200, 1200, 2500000, 95000, 340000, 180000,
    ]);
    expect(LISTINGS.map((c) => c.volumeTotal)).toEqual([
      120000, 150000, 35000, 65000, 80000, 25000, 300000, 800000, 500000, 350000, 90000, 600000, 400000, 75000, 40000,
      12000, 5000, 5000000, 200000, 500000, 350000,
    ]);
  });

  it('the banned-string scanner catches a known string (positive control)', () => {
    expect(hits('developer: South Pole, verified by DNV')).toEqual(['South Pole', 'DNV']);
  });
});
