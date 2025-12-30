import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Plus, FileText, Eye, Download, Star, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import LoginModal from '@/components/LoginModal';

interface DocumentTemplate {
  id: number;
  name: string;
  downloads: string;
  rating: number;
  category: string;
  description: string;
  content: string;
}

const documents: DocumentTemplate[] = [
  { 
    id: 1, 
    name: 'House Rental Agreement', 
    downloads: '12.5k', 
    rating: 4.8, 
    category: 'Rental Agreements',
    description: 'Standard house rental agreement template for residential properties in India.',
    content: `HOUSE RENTAL AGREEMENT

This Rental Agreement is made and executed on this _____ day of __________, 20__

BETWEEN

[LANDLORD NAME], aged about ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter called the "LANDLORD/OWNER" which expression shall mean and include his/her heirs, executors, legal representatives and assigns) of the FIRST PART

AND

[TENANT NAME], aged about ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter called the "TENANT" which expression shall mean and include his/her heirs, executors, legal representatives and assigns) of the SECOND PART

WHEREAS the Owner is the absolute owner of the house/flat/premises situated at _____________________________ (hereinafter referred to as the "Said Premises")

AND WHEREAS the Tenant has approached the Owner to take the Said Premises on rent for residential purposes and the Owner has agreed to let out the same to the Tenant on the following terms and conditions:

1. TERM OF TENANCY: The tenancy shall be for a period of _____ months/years commencing from __________ to __________.

2. MONTHLY RENT: The Tenant shall pay a monthly rent of Rs. ________/- (Rupees __________________ only) payable on or before the 5th day of every English calendar month.

3. SECURITY DEPOSIT: The Tenant has paid a sum of Rs. ________/- (Rupees __________________ only) as security deposit, refundable at the time of vacating the premises after deducting any dues.

4. MAINTENANCE CHARGES: The Tenant shall pay maintenance charges of Rs. ________/- per month separately.

5. USE OF PREMISES: The Said Premises shall be used for residential purposes only.

6. SUBLETTING: The Tenant shall not sublet, assign or transfer the tenancy or any part thereof.

7. UTILITIES: Electricity, water charges and other utilities shall be borne by the Tenant.

8. REPAIRS: Minor repairs shall be borne by the Tenant. Major structural repairs shall be borne by the Owner.

9. TERMINATION: Either party may terminate this agreement by giving _____ month(s) prior written notice.

10. POSSESSION: Upon termination, the Tenant shall hand over vacant possession of the premises in the same condition as it was at the time of renting.

IN WITNESS WHEREOF, the parties have set their hands on this agreement on the day, month and year first above written.

LANDLORD/OWNER                           TENANT
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________

WITNESSES:
1. Name: ____________  Signature: ____________
2. Name: ____________  Signature: ____________`
  },
  { 
    id: 2, 
    name: 'Employment Contract', 
    downloads: '8.2k', 
    rating: 4.9, 
    category: 'Employment',
    description: 'Comprehensive employment contract template for hiring employees in India.',
    content: `EMPLOYMENT CONTRACT

This Employment Contract is entered into as of __________, 20__

BETWEEN

[COMPANY NAME], a company incorporated under the laws of India, having its registered office at ___________________________ (hereinafter referred to as the "EMPLOYER")

AND

[EMPLOYEE NAME], aged ____ years, residing at ___________________________ (hereinafter referred to as the "EMPLOYEE")

1. POSITION AND DUTIES
The Employer hereby employs the Employee as [JOB TITLE]. The Employee shall perform all duties as assigned by the Employer and shall report to [REPORTING MANAGER].

2. COMMENCEMENT DATE
The employment shall commence on __________ and shall continue until terminated as per the terms herein.

3. COMPENSATION
a) Basic Salary: Rs. ________/- per month
b) HRA: Rs. ________/- per month
c) Special Allowance: Rs. ________/- per month
d) Total CTC: Rs. ________/- per annum

4. WORKING HOURS
The standard working hours are from _____ AM to _____ PM, Monday to Friday/Saturday. The Employee may be required to work additional hours as needed.

5. PROBATION PERIOD
The Employee shall be on probation for a period of _____ months from the date of joining. During this period, employment may be terminated by either party with _____ days' notice.

6. LEAVE ENTITLEMENT
a) Earned Leave: ____ days per year
b) Sick Leave: ____ days per year
c) Casual Leave: ____ days per year

7. CONFIDENTIALITY
The Employee agrees to maintain strict confidentiality regarding all proprietary information, trade secrets, and business strategies of the Employer.

8. NON-COMPETE CLAUSE
For a period of _____ months after termination, the Employee shall not engage in any business that directly competes with the Employer.

9. TERMINATION
a) Either party may terminate this contract by giving _____ days' written notice
b) The Employer may terminate immediately for gross misconduct

10. GOVERNING LAW
This contract shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Employment Contract.

EMPLOYER                                 EMPLOYEE
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Designation: ____________             Date: ____________
Date: ____________

Witness: ____________`
  },
  { 
    id: 3, 
    name: 'NDA Agreement', 
    downloads: '15.3k', 
    rating: 4.7, 
    category: 'Business',
    description: 'Non-Disclosure Agreement for protecting confidential business information.',
    content: `NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement ("Agreement") is entered into as of __________, 20__

BETWEEN

[DISCLOSING PARTY NAME], having its principal place of business at ___________________________ (hereinafter referred to as the "Disclosing Party")

AND

[RECEIVING PARTY NAME], having its principal place of business at ___________________________ (hereinafter referred to as the "Receiving Party")

WHEREAS, the Disclosing Party possesses certain confidential and proprietary information; and

WHEREAS, the Receiving Party desires to receive disclosure of this information;

NOW, THEREFORE, in consideration of the mutual covenants and agreements set forth herein, the parties agree as follows:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by the Disclosing Party, including but not limited to:
a) Business plans and strategies
b) Financial information
c) Technical data and specifications
d) Customer and supplier lists
e) Trade secrets and proprietary processes

2. OBLIGATIONS OF RECEIVING PARTY
The Receiving Party agrees to:
a) Hold and maintain the Confidential Information in strict confidence
b) Not disclose to any third parties without prior written consent
c) Use the Confidential Information solely for the Purpose
d) Limit access to employees who need to know

3. EXCLUSIONS
This Agreement does not apply to information that:
a) Is or becomes publicly available without breach of this Agreement
b) Was known to the Receiving Party prior to disclosure
c) Is independently developed by the Receiving Party

4. TERM
This Agreement shall remain in effect for _____ years from the date of execution.

5. RETURN OF MATERIALS
Upon termination, the Receiving Party shall return or destroy all Confidential Information.

6. REMEDIES
The Receiving Party acknowledges that breach may cause irreparable harm, entitling the Disclosing Party to seek injunctive relief.

7. GOVERNING LAW
This Agreement shall be governed by the laws of India.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DISCLOSING PARTY                        RECEIVING PARTY
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Title: ____________                   Title: ____________
Date: ____________                    Date: ____________`
  },
  { 
    id: 4, 
    name: 'Power of Attorney', 
    downloads: '6.8k', 
    rating: 4.6, 
    category: 'Family Law',
    description: 'General Power of Attorney format for authorizing someone to act on your behalf.',
    content: `GENERAL POWER OF ATTORNEY

KNOW ALL MEN BY THESE PRESENTS

I, [PRINCIPAL NAME], aged ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter referred to as the "PRINCIPAL")

DO HEREBY appoint and constitute [ATTORNEY NAME], aged ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter referred to as the "ATTORNEY")

as my true and lawful Attorney to act in my name and on my behalf in all matters as stated hereunder:

1. PROPERTY MATTERS
a) To manage, supervise, and administer all my properties
b) To collect rents, dues, and other amounts receivable
c) To negotiate, execute, and register sale deeds, lease agreements
d) To pay all taxes, fees, and other charges

2. BANKING OPERATIONS
a) To operate all my bank accounts
b) To deposit and withdraw funds
c) To open new accounts if necessary
d) To sign cheques and banking instruments

3. LEGAL PROCEEDINGS
a) To file, prosecute, or defend any legal proceedings
b) To engage and appoint advocates
c) To appear before any court, tribunal, or authority
d) To sign plaints, petitions, and other legal documents

4. GOVERNMENT MATTERS
a) To represent before all government authorities
b) To obtain licenses, permits, and approvals
c) To sign and submit all applications and documents

5. GENERAL AUTHORITY
a) To do all acts that I could personally do
b) To execute all necessary documents
c) To take all decisions in my best interest

I hereby ratify and confirm all acts done by my Attorney under this Power of Attorney.

This Power of Attorney shall remain in force until revoked by me in writing.

IN WITNESS WHEREOF, I have set my hand on this _____ day of __________, 20__

PRINCIPAL                               ATTORNEY (Acceptance)
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________

WITNESSES:
1. Name: ____________  Signature: ____________
2. Name: ____________  Signature: ____________`
  },
  { 
    id: 5, 
    name: 'Sale Deed', 
    downloads: '9.1k', 
    rating: 4.8, 
    category: 'Property',
    description: 'Sale deed template for property transfer and registration.',
    content: `SALE DEED

This Sale Deed is made and executed on this _____ day of __________, 20__

BETWEEN

[SELLER NAME], aged ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter called the "VENDOR/SELLER")

AND

[BUYER NAME], aged ____ years, S/o / D/o _________________, residing at ___________________________ (hereinafter called the "VENDEE/PURCHASER")

WHEREAS the Vendor is the absolute owner of the property more particularly described in the Schedule hereunder.

AND WHEREAS the Vendor has agreed to sell the said property to the Vendee for a consideration of Rs. ________/- (Rupees __________________ only).

NOW THIS DEED WITNESSETH AS FOLLOWS:

1. In consideration of Rs. ________/- paid by the Vendee to the Vendor (receipt whereof is hereby acknowledged), the Vendor hereby sells, transfers, and conveys the property described in the Schedule.

2. The Vendor hereby declares that:
a) He/She is the absolute owner of the property
b) The property is free from all encumbrances, liens, and litigations
c) He/She has full right to sell and transfer the property

3. The Vendor shall deliver possession of the property to the Vendee on __________.

4. All taxes and outgoings up to the date of this deed shall be borne by the Vendor.

SCHEDULE OF PROPERTY

All that piece and parcel of land/flat/house bearing No. __________, situated at __________, bounded as follows:
- East by: __________
- West by: __________
- North by: __________
- South by: __________

Total Area: __________ sq. ft./sq. meters

IN WITNESS WHEREOF, the parties have executed this Sale Deed.

VENDOR/SELLER                           VENDEE/PURCHASER
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________

WITNESSES:
1. Name: ____________  Signature: ____________
2. Name: ____________  Signature: ____________`
  },
  { 
    id: 6, 
    name: 'Loan Agreement', 
    downloads: '7.4k', 
    rating: 4.5, 
    category: 'Business',
    description: 'Personal/Business loan agreement template between lender and borrower.',
    content: `LOAN AGREEMENT

This Loan Agreement is made on __________, 20__

BETWEEN

[LENDER NAME], residing at ___________________________ (hereinafter called the "LENDER")

AND

[BORROWER NAME], residing at ___________________________ (hereinafter called the "BORROWER")

TERMS AND CONDITIONS:

1. LOAN AMOUNT
The Lender agrees to lend Rs. ________/- (Rupees __________________ only) to the Borrower.

2. INTEREST RATE
Interest shall be charged at ____% per annum, calculated on simple/compound interest basis.

3. REPAYMENT SCHEDULE
a) Total Repayment Amount: Rs. ________/-
b) EMI Amount: Rs. ________/-
c) Number of Installments: ____
d) First EMI Date: __________
e) Last EMI Date: __________

4. PAYMENT MODE
All payments shall be made via cheque/bank transfer to account:
Bank Name: __________
Account No: __________
IFSC Code: __________

5. PREPAYMENT
The Borrower may prepay the loan at any time without penalty.

6. DEFAULT
In case of default:
a) Late payment fee of Rs. ____/- per day shall apply
b) The Lender may demand immediate full repayment
c) Legal action may be initiated

7. SECURITY/COLLATERAL
[Details of any security or collateral, if applicable]

8. REPRESENTATIONS
The Borrower represents that:
a) All information provided is true and accurate
b) The loan shall be used for lawful purposes only

9. GOVERNING LAW
This Agreement shall be governed by Indian laws.

IN WITNESS WHEREOF, the parties have signed this Agreement.

LENDER                                   BORROWER
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________

WITNESSES:
1. Name: ____________  Signature: ____________
2. Name: ____________  Signature: ____________`
  },
  { 
    id: 7, 
    name: 'Will Template', 
    downloads: '5.2k', 
    rating: 4.9, 
    category: 'Family Law',
    description: 'Last Will and Testament template for estate planning.',
    content: `LAST WILL AND TESTAMENT

I, [TESTATOR NAME], aged ____ years, S/o / D/o _________________, presently residing at ___________________________, being of sound mind and disposing memory, do hereby declare this to be my Last Will and Testament.

1. REVOCATION
I hereby revoke all my previous Wills, Codicils, and Testamentary dispositions.

2. FAMILY DETAILS
a) Spouse: [NAME]
b) Children: [NAMES]
c) Other dependents: [NAMES]

3. APPOINTMENT OF EXECUTOR
I appoint [EXECUTOR NAME], residing at ___________________________, as the Executor of this Will.

4. BEQUESTS AND DISTRIBUTION

IMMOVABLE PROPERTY:
a) Property at __________ shall go to __________
b) Property at __________ shall go to __________

MOVABLE PROPERTY:
a) Bank accounts in [BANK NAME] shall go to __________
b) Fixed deposits shall be distributed as: __________
c) Jewelry and valuables shall go to __________
d) Vehicles shall go to __________

INVESTMENTS:
a) Shares and securities shall go to __________
b) Mutual funds shall go to __________

5. RESIDUARY ESTATE
All remaining assets not specifically mentioned shall go to __________.

6. GUARDIANSHIP
In case of minor children, I appoint [GUARDIAN NAME] as their legal guardian.

7. DEBTS AND LIABILITIES
All my debts and liabilities shall be cleared from my estate before distribution.

8. SPECIAL INSTRUCTIONS
[Any specific wishes or instructions]

9. ATTESTATION
I declare that I have signed this Will voluntarily, without any coercion, undue influence, or fraud.

Signed by me on this _____ day of __________, 20__

TESTATOR
Signature: ____________
Name: ____________

WITNESSES (must not be beneficiaries):
1. Name: ____________  Signature: ____________  Address: ____________
2. Name: ____________  Signature: ____________  Address: ____________`
  },
  { 
    id: 8, 
    name: 'Commercial Lease', 
    downloads: '4.8k', 
    rating: 4.7, 
    category: 'Property',
    description: 'Commercial property lease agreement for shops, offices, and warehouses.',
    content: `COMMERCIAL LEASE AGREEMENT

This Commercial Lease Agreement is made on __________, 20__

BETWEEN

[LESSOR NAME], the owner of the premises at ___________________________ (hereinafter called the "LESSOR")

AND

[LESSEE NAME/COMPANY], having its registered office at ___________________________ (hereinafter called the "LESSEE")

RECITALS:
The Lessor is the owner of commercial premises described in Schedule A and agrees to lease the same to the Lessee for commercial purposes.

1. PREMISES
The Lessor leases to the Lessee the commercial space at __________, measuring approximately _____ sq. ft.

2. TERM
The lease shall be for a period of _____ years, commencing from __________ to __________.

3. RENT
a) Monthly Rent: Rs. ________/-
b) Rent Escalation: ____% per year
c) Due Date: 5th of every month

4. SECURITY DEPOSIT
Rs. ________/- (_____ months' rent) paid in advance, refundable upon termination.

5. PERMITTED USE
The premises shall be used only for __________ [type of business].

6. MAINTENANCE
a) Interior maintenance: Lessee's responsibility
b) Structural maintenance: Lessor's responsibility
c) Common area maintenance: As per society rules

7. UTILITIES
All utility charges including electricity, water, and telecom shall be borne by the Lessee.

8. ALTERATIONS
No structural alterations without prior written consent of the Lessor.

9. INSURANCE
The Lessee shall maintain adequate insurance for business operations.

10. TERMINATION
a) Mutual: _____ months' notice
b) Default: Immediate upon breach

SCHEDULE A - PROPERTY DESCRIPTION
[Detailed description of the property]

IN WITNESS WHEREOF, the parties have executed this Lease Agreement.

LESSOR                                   LESSEE
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________`
  },
  { 
    id: 9, 
    name: 'Partnership Deed', 
    downloads: '3.9k', 
    rating: 4.6, 
    category: 'Business',
    description: 'Partnership deed for establishing a business partnership.',
    content: `PARTNERSHIP DEED

This Partnership Deed is made on __________, 20__

BETWEEN

1. [PARTNER 1 NAME], residing at ___________________________ (First Partner)
2. [PARTNER 2 NAME], residing at ___________________________ (Second Partner)
3. [PARTNER 3 NAME], residing at ___________________________ (Third Partner)

(Collectively referred to as "Partners")

WHEREAS the Partners have agreed to carry on business in partnership under the following terms:

1. NAME OF FIRM
The partnership shall be carried on under the name and style of "[FIRM NAME]"

2. NATURE OF BUSINESS
The business shall be: __________

3. PRINCIPAL PLACE OF BUSINESS
__________

4. COMMENCEMENT DATE
The partnership shall commence from __________

5. CAPITAL CONTRIBUTION
Partner 1: Rs. ________/- (____%)
Partner 2: Rs. ________/- (____%)
Partner 3: Rs. ________/- (____%)
Total Capital: Rs. ________/-

6. PROFIT AND LOSS SHARING
Profits and losses shall be shared in the ratio of their capital contribution.

7. INTEREST ON CAPITAL
Interest at ____% per annum shall be paid on partners' capital.

8. DRAWINGS
Partners may draw up to Rs. ________/- per month.

9. BANK ACCOUNT
All transactions shall be through the partnership bank account operated by __________.

10. DUTIES OF PARTNERS
a) Each partner shall devote full time and attention to the business
b) All partners shall act with utmost good faith
c) Books of accounts shall be maintained at the principal place

11. RETIREMENT/DEATH
a) Upon retirement: Settlement within _____ months
b) Upon death: Heirs entitled to share value

12. DISSOLUTION
The partnership may be dissolved:
a) By mutual consent
b) By _____ months' notice by any partner
c) By court order

13. ARBITRATION
All disputes shall be referred to arbitration under the Arbitration and Conciliation Act, 1996.

IN WITNESS WHEREOF, the Partners have executed this Deed.

PARTNER 1                    PARTNER 2                    PARTNER 3
Signature: ____________   Signature: ____________   Signature: ____________
Name: ____________        Name: ____________        Name: ____________

WITNESSES:
1. ____________
2. ____________`
  },
  { 
    id: 10, 
    name: 'Affidavit Format', 
    downloads: '11.2k', 
    rating: 4.8, 
    category: 'All Templates',
    description: 'General affidavit format for various legal declarations.',
    content: `AFFIDAVIT

I, [DEPONENT NAME], aged about ____ years, S/o / D/o / W/o _________________, by occupation __________, presently residing at ___________________________, do hereby solemnly affirm and declare as under:

1. That I am a citizen of India and competent to swear this affidavit.

2. That the facts stated herein are true and correct to the best of my knowledge and belief.

3. [STATE THE FACTS IN NUMBERED PARAGRAPHS]

4. That I am making this affidavit for the purpose of __________.

5. That I have not concealed any material facts relevant to this affidavit.

6. That the contents of this affidavit are true and correct.

VERIFICATION

I, the above-named deponent, do hereby verify that the contents of the above affidavit are true and correct to my knowledge and belief, and nothing material has been concealed therefrom.

Verified at __________ on this _____ day of __________, 20__.

DEPONENT

________________________
(Signature)

BEFORE ME

NOTARY PUBLIC / OATH COMMISSIONER

(Seal)

Name: ____________
Registration No: ____________
Date: ____________`
  },
  { 
    id: 11, 
    name: 'Divorce Petition', 
    downloads: '6.7k', 
    rating: 4.5, 
    category: 'Family Law',
    description: 'Mutual consent divorce petition format under Hindu Marriage Act.',
    content: `IN THE FAMILY COURT AT __________

MATRIMONIAL PETITION NO. _____ OF 20____

IN THE MATTER OF:

[PETITIONER NAME]
Aged ____ years, residing at ___________________________
... PETITIONER/HUSBAND

VERSUS

[RESPONDENT NAME]
Aged ____ years, residing at ___________________________
... RESPONDENT/WIFE

JOINT PETITION FOR DIVORCE BY MUTUAL CONSENT
(Under Section 13-B of the Hindu Marriage Act, 1955)

RESPECTFULLY SHOWETH:

1. That the marriage between the Petitioner and Respondent was solemnized on __________ at __________ as per Hindu rites and customs.

2. That out of the said wedlock, [number] child(ren) was/were born, namely __________.

3. That due to incompatibility and temperamental differences, the parties have been living separately since __________.

4. That the parties have mutually agreed to dissolve their marriage by mutual consent.

5. That the parties have settled all issues including:
   a) Permanent Alimony: Rs. ________/-
   b) Custody of Child(ren): __________
   c) Visitation Rights: __________
   d) Division of Property: __________

6. That there is no collusion or fraud in filing this petition.

7. That this court has jurisdiction to try this petition.

PRAYER

In view of the above, the Petitioners pray that this Hon'ble Court be pleased to:

a) Pass a decree of divorce by mutual consent dissolving the marriage.
b) Grant any other relief as deemed fit.

VERIFICATION

We, the Petitioner and Respondent, do hereby verify that the contents of the above petition are true and correct.

Verified at __________ on __________

PETITIONER                              RESPONDENT
Signature: ____________               Signature: ____________

Through Advocate: ____________`
  },
  { 
    id: 12, 
    name: 'Leave License Agreement', 
    downloads: '8.9k', 
    rating: 4.7, 
    category: 'Rental Agreements',
    description: 'Leave and license agreement for temporary property use.',
    content: `LEAVE AND LICENSE AGREEMENT

This Agreement is made at __________ on this _____ day of __________, 20__

BETWEEN

[LICENSOR NAME], residing at ___________________________ (hereinafter called the "LICENSOR")

AND

[LICENSEE NAME], residing at ___________________________ (hereinafter called the "LICENSEE")

WHEREAS the Licensor is the owner of the premises at ___________________________ and the Licensee has requested to use the same on leave and license basis.

NOW THIS AGREEMENT WITNESSETH:

1. LICENSE PERIOD
From __________ to __________ (_____ months)

2. LICENSE FEE
Rs. ________/- per month, payable by the 5th of each month.

3. SECURITY DEPOSIT
Rs. ________/- paid as security, refundable upon vacating.

4. PURPOSE
Residential use only.

5. TERMS AND CONDITIONS:

a) The Licensee shall not sublet or transfer this license.
b) The Licensee shall use the premises for lawful purposes only.
c) The Licensee shall maintain the premises in good condition.
d) Electricity and water charges shall be borne by the Licensee.
e) No structural alterations without written consent.
f) The Licensor may inspect with prior notice.

6. TERMINATION
Either party may terminate by giving _____ month(s) notice.

7. REGISTRATION
This agreement shall be registered as per the Maharashtra Rent Control Act / applicable state laws.

8. JURISDICTION
Courts at __________ shall have exclusive jurisdiction.

SCHEDULE OF PREMISES
[Description of the property]

IN WITNESS WHEREOF, the parties have signed this Agreement.

LICENSOR                                 LICENSEE
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________

WITNESSES:
1. ____________
2. ____________`
  }
];

const categories = ['All Templates', 'Rental Agreements', 'Employment', 'Business', 'Family Law', 'Property'];

const Documents = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [previewDoc, setPreviewDoc] = useState<DocumentTemplate | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Templates' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsSidebarOpen(false);
  };

  const handleDownload = (doc: DocumentTemplate) => {
    // Create a blob with the document content
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded: ${doc.name}`, {
      description: 'Document saved to your downloads folder'
    });
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Content copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = (doc: DocumentTemplate) => {
    // Create a more formatted version for DOCX-like text
    const formattedContent = `${doc.name}\n${'='.repeat(doc.name.length)}\n\n${doc.content}`;
    const blob = new Blob([formattedContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.name.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    toast.success(`Downloaded: ${doc.name}`, {
      description: 'Word document saved to your downloads folder'
    });
  };

  return (
    <>
      <Helmet>
        <title>Document Templates - LegalCareAI</title>
        <meta name="description" content="100+ legal document templates ready to download and customize. House rental agreements, employment contracts, NDAs, and more." />
      </Helmet>

      <MobileHeader 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onLoginClick={handleLoginClick}
        isMenuOpen={isSidebarOpen}
      />

      <div className="flex h-screen bg-background">
        <Sidebar 
          onLoginClick={handleLoginClick}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 overflow-auto pt-14 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Document Templates</h1>
              <p className="text-muted-foreground mt-1">100+ legal templates ready to download and customize</p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white/5 border-white/20 text-foreground">
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                <Button className="bg-white text-black hover:bg-white/90">
                  <Plus size={16} className="mr-2" />
                  Create New
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat 
                    ? 'bg-white text-black hover:bg-white/90 whitespace-nowrap' 
                    : 'bg-white/5 border-white/20 text-foreground whitespace-nowrap hover:bg-white/10'
                  }
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <div 
                  key={doc.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors">
                    <FileText size={20} className="text-white/70" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{doc.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span>{doc.downloads} downloads</span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      {doc.rating}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 bg-white/5 border-white/20 text-foreground hover:bg-white/10"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye size={14} className="mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-white/10 text-foreground hover:bg-white/20"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download size={14} className="mr-1" />
                      Get
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredDocs.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No templates found matching your criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-background border-white/20 overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-foreground text-xl">{previewDoc?.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">{previewDoc?.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Download size={14} />
                {previewDoc?.downloads} downloads
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {previewDoc?.rating} rating
              </span>
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{previewDoc?.category}</span>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto mt-4">
            <div className="bg-white/5 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed">
              {previewDoc?.content}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10 flex-shrink-0">
            <Button 
              className="flex-1 bg-white text-black hover:bg-white/90"
              onClick={() => previewDoc && handleDownload(previewDoc)}
            >
              <Download size={16} className="mr-2" />
              Download TXT
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 bg-white/5 border-white/20 text-foreground hover:bg-white/10"
              onClick={() => previewDoc && handleDownloadDocx(previewDoc)}
            >
              <FileText size={16} className="mr-2" />
              Download DOC
            </Button>
            <Button 
              variant="outline" 
              className="bg-white/5 border-white/20 text-foreground hover:bg-white/10"
              onClick={() => previewDoc && handleCopyContent(previewDoc.content)}
            >
              {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Documents;
