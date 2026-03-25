// CarbonBridge Purchase Agreement Template Engine
// Generates the full legal agreement as structured data for PDF rendering
// Based on: ISDA VCC Definitions 2022, IETA ETMA structure, ADGM English Common Law framework

export interface AgreementParty {
  companyName: string;
  registeredAddress: string;
  registrationNumber?: string;
  contactPerson: string;
  email: string;
  country: string;
}

export interface CreditDetails {
  projectName: string;
  registryProjectId: string;
  registry: string;
  methodology: string;
  creditType: string;
  vintageYear: number;
  qualityRating: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  complianceEligibility: string[];
  serialRange?: string;
}

export interface InsuranceDetails {
  selected: boolean;
  products: Array<{
    type: string; // non_delivery | invalidation | political_risk | corsia_guarantee
    premium: number;
    premiumRate: number;
    underwriter: string;
    policyReference?: string;
  }>;
  totalPremium: number;
}

export interface AgreementData {
  reference: string; // PA-2026-00001
  date: string;
  buyer: AgreementParty;
  seller: AgreementParty;
  isCBDirect: boolean;
  credits: CreditDetails;
  insurance: InsuranceDetails;
  paymentMethod: 'card' | 'bank_transfer';
  totalAmount: number; // credits + insurance
  validityPeriod: number; // days (5 for bank transfer)
  acceptedAt?: string;
  acceptedIP?: string;
  sessionId?: string;
}

export function generateAgreementReference(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `PA-${year}-${seq}`;
}

export function generateAgreementHTML(data: AgreementData): string {
  const { buyer, seller, credits, insurance, isCBDirect, paymentMethod } = data;
  const isBank = paymentMethod === 'bank_transfer';
  const complianceList = credits.complianceEligibility.length > 0
    ? credits.complianceEligibility.join(', ')
    : 'None declared';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Purchase Agreement ${data.reference}</title>
<style>
  @page { size: A4; margin: 25mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.65; color: #1A1714; background: #fff; }
  .header { background: #1B3A2D; color: #F2ECE0; padding: 32px 36px; margin: -25mm -25mm 28px; }
  .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(201,169,110,0.2); }
  .header-logo-img { height: 44px; width: auto; }
  .header-ref { text-align: right; font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 9pt; }
  .header-ref .ref { color: #C9A96E; font-size: 13pt; font-weight: 700; display: block; margin-bottom: 2px; }
  .header-title { font-family: Georgia, serif; font-size: 18pt; font-weight: 400; color: #F2ECE0; letter-spacing: -0.01em; }
  .header-subtitle { font-size: 10pt; color: #8AAA92; margin-top: 4px; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 72pt; color: rgba(201,169,110,0.06); font-weight: 800; z-index: -1; pointer-events: none; }
  h1 { font-family: Georgia, serif; font-size: 16pt; font-weight: 700; color: #1B3A2D; margin: 28px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E5DED3; }
  h2 { font-family: Georgia, serif; font-size: 13pt; font-weight: 700; color: #1B3A2D; margin: 20px 0 8px; }
  h3 { font-family: Georgia, serif; font-size: 11pt; font-weight: 700; color: #5A5248; margin: 14px 0 6px; }
  p { margin: 6px 0; text-align: justify; }
  .indent { margin-left: 24px; }
  .sub-clause { margin-left: 24px; margin-bottom: 4px; }
  ol { margin: 6px 0 6px 28px; }
  ol li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 10.5pt; }
  th { background: #F5F0E8; color: #1B3A2D; font-weight: 700; padding: 8px 12px; text-align: left; border-bottom: 1px solid #E5DED3; font-size: 9pt; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 7px 12px; border-bottom: 1px solid #F0EBE0; vertical-align: top; }
  .definition { margin: 4px 0 4px 24px; }
  .definition strong { color: #1B3A2D; }
  .schedule-box { background: #FDFBF7; border: 1px solid #E5DED3; border-radius: 6px; padding: 16px 20px; margin: 12px 0; }
  .sig-block { margin-top: 40px; padding: 24px; background: #FDFBF7; border: 1px solid #E5DED3; border-radius: 6px; }
  .sig-line { border-top: 1px solid #1B3A2D; width: 280px; margin-top: 40px; padding-top: 6px; font-size: 10pt; color: #5A5248; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #E5DED3; text-align: center; font-size: 8.5pt; color: #8A8279; }
  .highlight { background: #F5F0E8; padding: 2px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; font-size: 10pt; }
  .amount { font-family: 'JetBrains Mono', monospace; font-weight: 700; }
  @media print { .watermark { display: none; } body { font-size: 10.5pt; } }
</style>
</head>
<body>

${!data.acceptedAt ? '<div class="watermark">DRAFT</div>' : ''}

<div class="header">
  <div class="header-top">
    <img src="https://carbonbridge-web.vercel.app/logo-green.png" alt="CarbonBridge" class="header-logo-img" />
    <div class="header-ref">
      <span class="ref">${data.reference}</span>
      ${data.date}
    </div>
  </div>
  <div class="header-title">Purchase Agreement</div>
  <div class="header-subtitle">Carbon Credit Sale and Purchase — governed by the laws of Abu Dhabi Global Market</div>
</div>

<h1>1. Parties</h1>

<table>
  <tr><th colspan="2">BUYER</th></tr>
  <tr><td width="160">Company Name</td><td><strong>${buyer.companyName}</strong></td></tr>
  <tr><td>Registered Address</td><td>${buyer.registeredAddress}</td></tr>
  ${buyer.registrationNumber ? `<tr><td>Registration No.</td><td>${buyer.registrationNumber}</td></tr>` : ''}
  <tr><td>Contact Person</td><td>${buyer.contactPerson}</td></tr>
  <tr><td>Email</td><td>${buyer.email}</td></tr>
</table>

<table>
  <tr><th colspan="2">SELLER${isCBDirect ? ' (CarbonBridge Direct — Principal Seller)' : ''}</th></tr>
  <tr><td width="160">Company Name</td><td><strong>${seller.companyName}</strong></td></tr>
  <tr><td>Registered Address</td><td>${seller.registeredAddress}</td></tr>
  ${seller.registrationNumber ? `<tr><td>Registration No.</td><td>${seller.registrationNumber}</td></tr>` : ''}
  <tr><td>Contact Person</td><td>${seller.contactPerson}</td></tr>
  <tr><td>Email</td><td>${seller.email}</td></tr>
</table>

<p><strong>CarbonBridge's Role:</strong> ${isCBDirect
  ? 'CarbonBridge Ltd acts as both marketplace operator and principal Seller in this transaction. This dual role is disclosed. CarbonBridge Direct inventory is clearly labelled on the Platform and is not algorithmically favoured over third-party listings.'
  : 'CarbonBridge Ltd acts as marketplace facilitator and escrow agent. CarbonBridge is NOT a party to this sale — the sale is between the Buyer and the Seller. CarbonBridge&rsquo;s obligations are limited to holding funds in escrow, facilitating communication, monitoring the registry transfer, and releasing funds to the Seller upon confirmed Delivery.'
}</p>

<h1>2. Definitions</h1>

<div class="definition"><strong>&ldquo;Carbon Credit&rdquo;</strong> means a verified carbon credit representing one metric tonne of CO&#8322; equivalent (tCO&#8322;e) emission reduction or removal, issued by a Recognised Registry under an approved methodology, and identifiable by a unique serial number.</div>

<div class="definition"><strong>&ldquo;Recognised Registry&rdquo;</strong> means any of the following carbon credit registries: Verra (Verified Carbon Standard), Gold Standard, or the American Carbon Registry (ACR), each as maintained and operated by their respective governing bodies.</div>

<div class="definition"><strong>&ldquo;Delivery&rdquo;</strong> means the transfer of Carbon Credits from the Seller&rsquo;s Registry account to the Buyer&rsquo;s Registry account, or the retirement of Carbon Credits in the Buyer&rsquo;s name on the relevant Registry, in accordance with the ISDA 2022 Verified Carbon Credit Transactions Definitions concept of physical settlement.</div>

<div class="definition"><strong>&ldquo;Settlement&rdquo;</strong> means the simultaneous or sequential completion of both Delivery (transfer of Carbon Credits) and Payment (transfer of funds), constituting full performance of the obligations under this Agreement.</div>

<div class="definition"><strong>&ldquo;Retirement&rdquo;</strong> means the permanent cancellation of a Carbon Credit on the relevant Registry, such that it cannot be further transferred, sold, or used for any purpose, in accordance with the Registry&rsquo;s retirement procedures.</div>

<div class="definition"><strong>&ldquo;Purchase Agreement Reference&rdquo;</strong> means the unique identifier <span class="highlight">${data.reference}</span> assigned to this transaction.</div>

<div class="definition"><strong>&ldquo;CarbonBridge Platform&rdquo;</strong> means the carbon credit marketplace operated at carbonbridge.ae and any successor domains.</div>

<div class="definition"><strong>&ldquo;Escrow&rdquo;</strong> means funds held by CarbonBridge (via Stripe Connect for card payments, or CarbonBridge&rsquo;s designated bank account for wire transfers) pending confirmation of Delivery.</div>

<div class="definition"><strong>&ldquo;Reservation&rdquo;</strong> or <strong>&ldquo;Soft Hold&rdquo;</strong> means the temporary removal of purchased Carbon Credits from marketplace availability pending Settlement completion, enforced through the CarbonBridge Platform database and, for CarbonBridge Direct inventory, through segregation in CarbonBridge&rsquo;s Registry account.</div>

<div class="definition"><strong>&ldquo;Purchase Agreement Validity Period&rdquo;</strong> means ${isBank ? 'five (5) Business Days from the date of this Agreement' : 'seventy-two (72) hours from payment capture'}.</div>

<div class="definition"><strong>&ldquo;Business Day&rdquo;</strong> means a day (other than a Saturday or Sunday) on which banks are open for general business in Abu Dhabi, United Arab Emirates.</div>

<div class="definition"><strong>&ldquo;Force Majeure&rdquo;</strong> means any event beyond the reasonable control of a party, including but not limited to: natural disasters, acts of war or terrorism, government action or sanctions, Registry system failures lasting more than five (5) Business Days, epidemics, and material changes in applicable law or regulation.</div>

<div class="definition"><strong>&ldquo;ICVCM CCP&rdquo;</strong> means the Core Carbon Principles established by the Integrity Council for the Voluntary Carbon Market.</div>

<div class="definition"><strong>&ldquo;Insurance Products&rdquo;</strong> means optional carbon credit guarantee insurance products distributed by CarbonBridge, underwritten by Lloyd&rsquo;s of London syndicates including Kita Earth Ltd and CFC Underwriting Ltd.</div>

<h1>3. Subject of the Agreement</h1>

<div class="schedule-box">
  <table>
    <tr><th colspan="2">CREDIT DETAILS (Schedule 1)</th></tr>
    <tr><td width="180">Project Name</td><td><strong>${credits.projectName}</strong></td></tr>
    <tr><td>Registry Project ID</td><td>${credits.registryProjectId}</td></tr>
    <tr><td>Registry</td><td>${credits.registry}</td></tr>
    <tr><td>Methodology</td><td>${credits.methodology}</td></tr>
    <tr><td>Credit Type</td><td>${credits.creditType}</td></tr>
    <tr><td>Vintage Year</td><td>${credits.vintageYear}</td></tr>
    <tr><td>Quality Rating</td><td>${credits.qualityRating} (CarbonBridge assessment against ICVCM CCP criteria)</td></tr>
    <tr><td>Quantity</td><td class="amount">${credits.quantity.toLocaleString()} tCO&#8322;e</td></tr>
    <tr><td>Unit Price</td><td class="amount">USD ${credits.unitPrice.toFixed(2)} per tCO&#8322;e</td></tr>
    <tr><td>Credit Cost</td><td class="amount">USD ${credits.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
    <tr><td>Source</td><td>${isCBDirect ? 'CarbonBridge Direct (principal inventory)' : 'Third-party Seller via CarbonBridge Marketplace'}</td></tr>
    <tr><td>Compliance Eligibility</td><td>${complianceList}</td></tr>
    ${credits.serialRange ? `<tr><td>Serial Number Range</td><td>${credits.serialRange}</td></tr>` : ''}
  </table>
</div>

<p><strong>Compliance Disclaimer:</strong> Compliance eligibility designations (including NRCC, CBAM, CORSIA, SBTi, and VCMI classifications) are based on CarbonBridge&rsquo;s assessment at the time of listing and are provided for informational purposes only. The Buyer is advised to verify compliance eligibility with their own legal and regulatory advisors before relying on any such designation for regulatory filings or compliance obligations.</p>

<h1>4. Purchase Price and Payment Terms</h1>

<table>
  <tr><th>Item</th><th style="text-align: right;">Amount (USD)</th></tr>
  <tr><td>Carbon Credits (${credits.quantity.toLocaleString()} tCO&#8322;e × $${credits.unitPrice.toFixed(2)})</td><td style="text-align: right;" class="amount">$${credits.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
  ${insurance.selected ? insurance.products.map(p => `<tr><td>Insurance: ${p.type.replace(/_/g, ' ')} (${(p.premiumRate * 100).toFixed(1)}%)</td><td style="text-align: right;" class="amount">$${p.premium.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>`).join('') : '<tr><td>Insurance</td><td style="text-align: right;">Not selected</td></tr>'}
  <tr style="border-top: 2px solid #1B3A2D;"><td><strong>Total Amount Due</strong></td><td style="text-align: right;" class="amount"><strong>$${data.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td></tr>
</table>

<p><strong>Payment Method:</strong> ${isBank ? 'Bank Transfer' : 'Card Payment (Stripe)'}</p>

${isBank ? `
<p>The Buyer shall transfer the full Total Amount Due within the Purchase Agreement Validity Period (five Business Days from the date of this Agreement) to the following account:</p>
<div class="schedule-box">
  <strong>CarbonBridge Ltd — Escrow Account</strong><br>
  Bank: [ADGM Bank Name]<br>
  Account Name: CarbonBridge Ltd — Client Escrow<br>
  IBAN: [To be provided]<br>
  SWIFT/BIC: [To be provided]<br>
  Reference: <span class="highlight">${data.reference}</span>
</div>
<p>If funds are not received and cleared within the Purchase Agreement Validity Period, this Agreement expires automatically, the credit Reservation is released, and neither party shall have any further obligation under this Agreement.</p>
` : `
<p>Payment has been captured at checkout via Stripe Connect. Funds are held in escrow by CarbonBridge until Delivery is confirmed by the relevant Registry.</p>
`}

<p>CarbonBridge&rsquo;s marketplace fee is deducted from the Seller&rsquo;s proceeds at Settlement. The Buyer pays the listed price — the fee structure is transparent and does not affect the Buyer&rsquo;s total obligation.</p>

${insurance.selected ? `
<h1>5. Insurance</h1>

<div class="schedule-box">
  <table>
    <tr><th>Product</th><th>Premium</th><th>Underwriter</th></tr>
    ${insurance.products.map(p => `<tr><td>${p.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</td><td class="amount">$${p.premium.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td>${p.underwriter}</td></tr>`).join('')}
    <tr style="border-top: 1px solid #E5DED3;"><td><strong>Total Premium</strong></td><td class="amount"><strong>$${insurance.totalPremium.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td><td></td></tr>
  </table>
</div>

<p>Insurance Products are distributed by CarbonBridge Ltd. CarbonBridge does not underwrite, assess claims, pay claims, or hold insurance reserves. All insurance is underwritten by Kita Earth Ltd (FCA authorised, Lloyd&rsquo;s Coverholder) and/or CFC Underwriting Ltd (Lloyd&rsquo;s syndicate). Full policy wording is available upon request or via the CarbonBridge Platform.</p>

<p><strong>Claims Process:</strong> Claims shall be submitted through the CarbonBridge Platform. CarbonBridge routes the claim to the relevant underwriter. Resolution is governed by the applicable insurance policy terms and conditions.</p>

<p><strong>Refundability:</strong> Insurance premiums are non-refundable once the insurance policy has been bound (i.e., upon completion of checkout and generation of the insurance certificate).</p>
` : ''}

<h1>6. Delivery of Credits</h1>

<p><strong>6.1 Method:</strong> Delivery shall be effected by the transfer of Carbon Credits on the relevant Registry from the Seller&rsquo;s Registry account to the Buyer&rsquo;s Registry account, or, where the Buyer has elected immediate retirement at checkout, by retirement in the Buyer&rsquo;s name on the Registry.</p>

<p><strong>6.2 Timeline:</strong> The Seller shall initiate the Registry transfer within twenty-four (24) hours of payment confirmation. The transfer shall be completed within seventy-two (72) hours of payment confirmation, subject to Registry processing times which are outside the parties&rsquo; reasonable control.</p>

<p><strong>6.3 Confirmation:</strong> Delivery is complete when the relevant Registry confirms that the Carbon Credits are held in the Buyer&rsquo;s account or have been retired in the Buyer&rsquo;s name. CarbonBridge will notify the Buyer by email with Registry serial numbers and, where applicable, a downloadable retirement certificate.</p>

<p><strong>6.4 ${isCBDirect ? 'CarbonBridge Direct' : 'Third-Party Seller'}:</strong> ${isCBDirect
  ? 'CarbonBridge initiates the transfer directly from its own Registry account.'
  : 'The Seller is responsible for initiating the transfer. CarbonBridge monitors and facilitates but does not guarantee the Seller&rsquo;s performance, except where the Buyer has purchased Non-Delivery Insurance.'
}</p>

<h1>7. Credit Reservation and Locking</h1>

<p>7.1 Upon execution of this Agreement (payment capture for card transactions; acceptance of this Agreement for bank transfer transactions), the specified quantity of Carbon Credits is reserved on the CarbonBridge Platform and removed from general marketplace availability.</p>

<p>7.2 No other party may purchase the reserved Carbon Credits during the Settlement period.</p>

<p>7.3 ${isCBDirect
  ? 'The reserved credits are held in CarbonBridge&rsquo;s Registry account and will not be transferred to any other party during the Settlement period.'
  : 'The reservation is enforced through the CarbonBridge Platform database. The Seller has agreed, pursuant to the CarbonBridge Marketplace Rules, that listed credits are exclusively available through the Platform during active transactions.'
}</p>

<p>7.4 If Settlement is not completed within the Purchase Agreement Validity Period, the Reservation is automatically released and neither party shall have further obligation under this Agreement in respect of the reserved credits.</p>

${isBank ? `
<h1>8. Credit Availability (Bank Transfer Only)</h1>

<p>This purchase is subject to credit availability at the time of fund clearance. In the unlikely event that the specified credits are no longer available when funds clear (due to Seller withdrawal, Registry error, or other circumstances beyond CarbonBridge&rsquo;s reasonable control), CarbonBridge will:</p>
<ol type="a">
  <li>offer the Buyer substitute Carbon Credits of equal or higher quality rating, the same credit type, and the same or newer vintage at the same unit price; or</li>
  <li>if no suitable substitute is available, or the Buyer declines the substitute, issue a full refund of all amounts paid within five (5) Business Days.</li>
</ol>
<p>CarbonBridge shall not be liable for any consequential losses, lost profits, or additional costs arising from credit unavailability.</p>
` : ''}

<h1>9. Title and Risk</h1>

<p>9.1 Title to the Carbon Credits passes from the Seller to the Buyer upon confirmed Delivery on the relevant Registry.</p>
<p>9.2 Risk in the Carbon Credits passes with title.</p>
<p>9.3 Until Delivery is confirmed, the Carbon Credits remain the property of the Seller${isCBDirect ? ' (CarbonBridge)' : ''}.</p>
<p>9.4 The Buyer acknowledges that Carbon Credits are intangible digital instruments recorded on third-party Registries, and that CarbonBridge does not operate or control any Registry.</p>

<h1>10. Representations and Warranties</h1>

<h2>10.1 Seller Represents and Warrants:</h2>
<ol type="a">
  <li>it is the legal and beneficial owner of the Carbon Credits, or is duly authorised to sell them on behalf of the owner;</li>
  <li>the Carbon Credits are free from all encumbrances, liens, pledges, charges, or third-party claims;</li>
  <li>the Carbon Credits have not been previously retired, cancelled, or transferred to another party;</li>
  <li>the Carbon Credits are validly issued by the relevant Registry under the stated methodology;</li>
  <li>all information provided about the Carbon Credits (including project details, vintage, methodology, and co-benefits) is true and accurate in all material respects.</li>
</ol>

<h2>10.2 Buyer Represents and Warrants:</h2>
<ol type="a">
  <li>it has full power and authority to enter into this Agreement and to perform its obligations hereunder;</li>
  <li>the purchase is for its own account or for a disclosed principal;</li>
  <li>it has conducted its own independent due diligence and is not relying solely on CarbonBridge&rsquo;s quality ratings or compliance eligibility assessments for any regulatory filing or compliance purpose.</li>
</ol>

<h2>10.3 CarbonBridge Represents and Warrants:</h2>
<ol type="a">
  <li>it is duly organised and authorised to operate the CarbonBridge Platform;</li>
  <li>it will hold funds in escrow and release them only upon confirmed Delivery;</li>
  <li>it will facilitate the transaction in good faith and in accordance with the CarbonBridge Marketplace Rules.</li>
</ol>

<h1>11. CarbonBridge&rsquo;s Role and Limitations</h1>

<p>${isCBDirect
  ? '11.1 In this transaction, CarbonBridge acts as both marketplace operator and principal Seller. The dual role is disclosed to the Buyer. CarbonBridge Direct inventory is clearly labelled on the Platform and is never algorithmically favoured over third-party listings.'
  : '11.1 In this transaction, CarbonBridge acts as marketplace facilitator and escrow agent. CarbonBridge is NOT a party to the sale &mdash; the sale is between the Buyer and the Seller. CarbonBridge&rsquo;s obligations are limited to holding funds in escrow, facilitating communication between the parties, monitoring the Registry transfer, and releasing funds upon confirmed Delivery.'
}</p>

<p>11.2 CarbonBridge does not guarantee the quality, additionality, permanence, or environmental integrity of any Carbon Credit. Quality ratings and compliance eligibility assessments are provided for informational purposes only and should not be relied upon as legal, regulatory, or investment advice.</p>

<p>11.3 CarbonBridge is not responsible for any acts, omissions, delays, errors, or system outages of any Registry.</p>

<h1>12. Failure to Deliver</h1>

<p>12.1 If the Seller fails to deliver the Carbon Credits within seventy-two (72) hours of payment confirmation (or such longer period as the parties may agree in writing), the Buyer may, at its sole discretion:</p>
<ol type="a">
  <li>extend the Delivery period by a further seventy-two (72) hours;</li>
  <li>cancel the transaction and receive a full refund of all amounts paid, to be processed within five (5) Business Days of cancellation confirmation; or</li>
  <li>where Non-Delivery Insurance has been purchased, submit a claim under the relevant insurance policy in accordance with its terms.</li>
</ol>

${isCBDirect ? '<p>12.2 Where CarbonBridge is the Seller (CarbonBridge Direct), the same remedies apply. CarbonBridge will additionally use reasonable efforts to offer substitute Carbon Credits of equal or better quality at the same or improved terms.</p>' : ''}

<p>12.${isCBDirect ? '3' : '2'} Repeated failure to deliver by a third-party Seller may result in suspension or termination of the Seller&rsquo;s CarbonBridge account in accordance with the Marketplace Rules.</p>

<h1>13. Cancellation and Refunds</h1>

<p>13.1 The Buyer may cancel this Agreement before payment is captured (card) or before funds are transferred (bank transfer) without penalty or further obligation.</p>
<p>13.2 After payment has been captured or funds received, cancellation is subject to CarbonBridge&rsquo;s reasonable discretion. If Carbon Credits have not yet been transferred on the Registry, CarbonBridge will use reasonable efforts to cancel and process a refund.</p>
<p>13.3 If Carbon Credits have already been transferred to the Buyer&rsquo;s Registry account, cancellation is not possible and no refund will be issued.</p>
<p>13.4 Refunds shall be processed via the same payment method (Stripe refund for card payments; bank transfer reversal for wire payments) within five (5) Business Days of cancellation confirmation.</p>
<p>13.5 Insurance premiums are non-refundable once the insurance policy has been bound.</p>

<h1>14. Dispute Resolution</h1>

<p>14.1 The parties shall first attempt to resolve any dispute arising out of or in connection with this Agreement through good-faith negotiation within thirty (30) days of written notice of the dispute.</p>
<p>14.2 If the dispute is not resolved within the negotiation period, it shall be referred to and finally resolved by the courts of Abu Dhabi Global Market (ADGM).</p>
<p>14.3 This Agreement is governed by and shall be construed in accordance with the laws of Abu Dhabi Global Market, which applies English common law pursuant to the ADGM Application of English Law Regulations 2015.</p>
<p>14.4 Nothing in this clause shall prevent either party from seeking urgent interim or injunctive relief from any court of competent jurisdiction.</p>

<h1>15. Force Majeure</h1>

<p>15.1 Neither party shall be liable for any failure or delay in performing its obligations under this Agreement if such failure or delay results from a Force Majeure event.</p>
<p>15.2 The affected party shall notify the other party in writing within forty-eight (48) hours of becoming aware of the Force Majeure event.</p>
<p>15.3 If the Force Majeure event continues for more than thirty (30) days, either party may terminate this Agreement by written notice without liability.</p>
<p>15.4 Registry system outages lasting more than five (5) Business Days shall constitute a Force Majeure event for the purposes of this Agreement.</p>

<h1>16. Confidentiality</h1>

<p>Transaction details including pricing, volume, and counterparty identity are confidential and shall not be disclosed to any third party except: (a) as required by applicable law, regulation, or court order; (b) to the disclosing party&rsquo;s professional advisors on a need-to-know basis; (c) with the prior written consent of the other party; or (d) to CarbonBridge for platform operation and anonymised market analytics.</p>

<h1>17. Limitation of Liability</h1>

<p>17.1 CarbonBridge&rsquo;s total aggregate liability under or in connection with this Agreement, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, shall not exceed the Total Amount Due under this Agreement.</p>
<p>17.2 Neither party shall be liable to the other for any indirect, consequential, special, or punitive damages, including but not limited to loss of profits, loss of revenue, loss of business opportunity, or loss of goodwill.</p>
<p>17.3 Nothing in this clause shall exclude or limit liability for fraud, wilful misconduct, or death or personal injury caused by negligence.</p>

<h1>18. General Provisions</h1>

<p><strong>18.1 Entire Agreement:</strong> This Agreement, together with the Schedules hereto and the documents incorporated by reference, constitutes the entire agreement between the parties in respect of this transaction and supersedes all prior negotiations, discussions, representations, and agreements.</p>
<p><strong>18.2 Amendment:</strong> No amendment or modification of this Agreement shall be effective unless made in writing and agreed by both parties.</p>
<p><strong>18.3 Assignment:</strong> Neither party may assign or transfer its rights or obligations under this Agreement without the prior written consent of the other party, except that CarbonBridge may assign to any successor entity or affiliate.</p>
<p><strong>18.4 Severability:</strong> If any provision of this Agreement is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.</p>
<p><strong>18.5 Notices:</strong> All notices under this Agreement shall be sent to the email addresses registered with the CarbonBridge Platform.</p>
<p><strong>18.6 Electronic Execution:</strong> This Agreement may be executed electronically. Acceptance via the CarbonBridge Platform (checkbox acknowledgement and confirmation for bank transfers, or completion of checkout for card payments) constitutes valid execution and is binding under the laws of ADGM.</p>

<div class="sig-block">
  <h2>Acceptance</h2>
  ${data.acceptedAt ? `
  <p>This Agreement was accepted electronically via the CarbonBridge Platform.</p>
  <table>
    <tr><td width="140">Accepted by</td><td><strong>${buyer.companyName}</strong></td></tr>
    <tr><td>Contact</td><td>${buyer.contactPerson} (${buyer.email})</td></tr>
    <tr><td>Date &amp; Time</td><td>${data.acceptedAt} UTC</td></tr>
    ${data.acceptedIP ? `<tr><td>IP Address</td><td>${data.acceptedIP}</td></tr>` : ''}
    ${data.sessionId ? `<tr><td>Session ID</td><td style="font-family: monospace; font-size: 9pt;">${data.sessionId}</td></tr>` : ''}
  </table>
  ` : `
  <p style="color: #8A8279;">This is a draft. The Agreement becomes binding upon electronic acceptance by the Buyer via the CarbonBridge Platform.</p>
  <div class="sig-line">Authorised Signatory — ${buyer.companyName}</div>
  <div class="sig-line" style="margin-top: 28px;">CarbonBridge Ltd</div>
  `}
</div>

<div class="schedule-box" style="margin-top: 28px;">
  <h3>Schedules Incorporated by Reference</h3>
  <p><strong>Schedule 1:</strong> Credit Details — as set out in Section 3 above</p>
  ${insurance.selected ? '<p><strong>Schedule 2:</strong> Insurance Details — as set out in Section 5 above</p>' : ''}
  <p><strong>Schedule ${insurance.selected ? '3' : '2'}:</strong> CarbonBridge Marketplace Rules — available at carbonbridge.ae/legal/marketplace-rules</p>
  <p><strong>Schedule ${insurance.selected ? '4' : '3'}:</strong> CarbonBridge Privacy Policy — available at carbonbridge.ae/legal/privacy</p>
</div>

<div class="footer">
  <img src="https://carbonbridge-web.vercel.app/logo-green.png" alt="CarbonBridge" style="height: 24px; width: auto; margin-bottom: 6px;" />
  <p>CarbonBridge Ltd &middot; Abu Dhabi Global Market &middot; Al Maryah Island, Abu Dhabi, UAE</p>
  <p>${data.reference} &middot; Generated ${data.date}</p>
</div>

</body>
</html>`;
}
