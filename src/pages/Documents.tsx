import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Plus, FileText, Eye, Download, Star, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PageLayout from '@/components/PageLayout';

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
The standard working hours are from _____ AM to _____ PM, Monday to Friday/Saturday.

5. PROBATION PERIOD
The Employee shall be on probation for a period of _____ months from the date of joining.

6. LEAVE ENTITLEMENT
a) Earned Leave: ____ days per year
b) Sick Leave: ____ days per year
c) Casual Leave: ____ days per year

7. TERMINATION
Either party may terminate this contract by giving _____ days' written notice.

IN WITNESS WHEREOF, the parties have executed this Employment Contract.

EMPLOYER                                 EMPLOYEE
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________`
  },
  { 
    id: 3, 
    name: 'NDA Agreement', 
    downloads: '15.3k', 
    rating: 4.7, 
    category: 'Business',
    description: 'Non-Disclosure Agreement for protecting confidential business information.',
    content: `NON-DISCLOSURE AGREEMENT (NDA)

This Non-Disclosure Agreement is entered into as of __________, 20__

BETWEEN

[DISCLOSING PARTY NAME] (hereinafter referred to as the "Disclosing Party")

AND

[RECEIVING PARTY NAME] (hereinafter referred to as the "Receiving Party")

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means any information disclosed by the Disclosing Party including business plans, financial information, technical data, trade secrets, and proprietary processes.

2. OBLIGATIONS
The Receiving Party agrees to hold and maintain the Confidential Information in strict confidence and not disclose to any third parties without prior written consent.

3. TERM
This Agreement shall remain in effect for _____ years from the date of execution.

IN WITNESS WHEREOF, the parties have executed this Agreement.

DISCLOSING PARTY                        RECEIVING PARTY
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
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

I, [PRINCIPAL NAME], do hereby appoint [ATTORNEY NAME] as my true and lawful Attorney to act in my name and on my behalf.

AUTHORITY GRANTED:
1. Property matters
2. Banking operations
3. Legal proceedings
4. Government matters

This Power of Attorney shall remain in force until revoked by me in writing.

PRINCIPAL                               ATTORNEY
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________`
  },
  { 
    id: 5, 
    name: 'Sale Deed', 
    downloads: '9.1k', 
    rating: 4.8, 
    category: 'Property',
    description: 'Sale deed template for property transfer and registration.',
    content: `SALE DEED

This Sale Deed is made on __________, 20__

BETWEEN [SELLER NAME] (VENDOR) AND [BUYER NAME] (VENDEE)

The Vendor hereby sells, transfers, and conveys the property described in the Schedule for Rs. ________/-.

SCHEDULE OF PROPERTY:
[Property details]

VENDOR                                   VENDEE
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________`
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

BETWEEN [LENDER NAME] AND [BORROWER NAME]

TERMS:
1. Loan Amount: Rs. ________/-
2. Interest Rate: ____% per annum
3. Repayment Period: ____ months

LENDER                                   BORROWER
Signature: ____________               Signature: ____________
Name: ____________                    Name: ____________
Date: ____________                    Date: ____________`
  },
];

const categories = ['All', 'Rental Agreements', 'Employment', 'Business', 'Family Law', 'Property'];

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDocument, setSelectedDocument] = useState<DocumentTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCopy = async (doc: DocumentTemplate) => {
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopiedId(doc.id);
      toast.success('Document copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy document');
    }
  };

  const handleDownload = (doc: DocumentTemplate) => {
    const blob = new Blob([doc.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Document downloaded');
  };

  return (
    <PageLayout>
      <Helmet>
        <title>Legal Documents - LegalCareAI</title>
        <meta name="description" content="Access 100+ legal document templates. Download rental agreements, employment contracts, NDAs, and more." />
      </Helmet>

      <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <FileText size={24} className="text-white sm:hidden" />
            <FileText size={28} className="text-white hidden sm:block" />
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-foreground">Legal Documents</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">100+ professional legal templates</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 mb-4 sm:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-foreground text-sm sm:text-base"
            />
          </div>
          
          {/* Horizontal scrolling category filters */}
          <div className="relative -mx-3 sm:mx-0">
            <div className="flex gap-2 overflow-x-auto pb-2 px-3 sm:px-0 scrollbar-hide">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 text-xs sm:text-sm ${selectedCategory === cat 
                    ? 'bg-white text-black hover:bg-white/90' 
                    : 'bg-white/5 border-white/20 text-foreground hover:bg-white/10'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <FileText size={16} className="text-white/70 sm:hidden" />
                  <FileText size={20} className="text-white/70 hidden sm:block" />
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <Star size={12} className="text-yellow-500 fill-yellow-500 sm:hidden" />
                  <Star size={14} className="text-yellow-500 fill-yellow-500 hidden sm:block" />
                  <span className="text-foreground">{doc.rating}</span>
                </div>
              </div>
              
              <h3 className="font-medium text-foreground text-sm sm:text-base mb-1 line-clamp-1">{doc.name}</h3>
              <p className="text-xs text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{doc.description}</p>
              
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">
                <span className="truncate">{doc.category}</span>
                <span className="shrink-0 ml-2">{doc.downloads} downloads</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 bg-white/5 border-white/20 text-foreground hover:bg-white/10 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <Eye size={12} className="mr-1 sm:hidden" />
                  <Eye size={14} className="mr-1 hidden sm:block" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 bg-white text-black hover:bg-white/90 text-xs sm:text-sm h-8 sm:h-9"
                  onClick={() => handleDownload(doc)}
                >
                  <Download size={12} className="mr-1 sm:hidden" />
                  <Download size={14} className="mr-1 hidden sm:block" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <FileText size={36} className="mx-auto text-muted-foreground mb-3 sm:mb-4 sm:hidden" />
            <FileText size={48} className="mx-auto text-muted-foreground mb-3 sm:mb-4 hidden sm:block" />
            <p className="text-sm sm:text-base text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>

      {/* Document Preview Dialog - Mobile optimized */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[85vh] bg-background border-white/20 p-3 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-sm sm:text-base text-foreground pr-8">
              {selectedDocument?.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedDocument && handleCopy(selectedDocument)}
                className="flex-1 sm:flex-none bg-white/5 border-white/20 text-foreground hover:bg-white/10 text-xs sm:text-sm h-8"
              >
                {copiedId === selectedDocument?.id ? (
                  <><Check size={12} className="mr-1" /> Copied</>
                ) : (
                  <><Copy size={12} className="mr-1" /> Copy</>
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => selectedDocument && handleDownload(selectedDocument)}
                className="flex-1 sm:flex-none bg-white text-black hover:bg-white/90 text-xs sm:text-sm h-8"
              >
                <Download size={12} className="mr-1" />
                Download
              </Button>
            </div>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh] bg-white/5 rounded-lg p-3 sm:p-4 mt-3">
            <pre className="text-xs sm:text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {selectedDocument?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default Documents;
