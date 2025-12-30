import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Plus, FileText, Eye, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Sidebar from '@/components/Sidebar';
import MobileHeader from '@/components/MobileHeader';
import LoginModal from '@/components/LoginModal';

const documents = [
  { id: 1, name: 'House Rental Agreement', downloads: '12.5k', rating: 4.8, category: 'Rental Agreements' },
  { id: 2, name: 'Employment Contract', downloads: '8.2k', rating: 4.9, category: 'Employment' },
  { id: 3, name: 'NDA Agreement', downloads: '15.3k', rating: 4.7, category: 'Business' },
  { id: 4, name: 'Power of Attorney', downloads: '6.8k', rating: 4.6, category: 'Family Law' },
  { id: 5, name: 'Sale Deed', downloads: '9.1k', rating: 4.8, category: 'Property' },
  { id: 6, name: 'Loan Agreement', downloads: '7.4k', rating: 4.5, category: 'Business' },
  { id: 7, name: 'Will Template', downloads: '5.2k', rating: 4.9, category: 'Family Law' },
  { id: 8, name: 'Commercial Lease', downloads: '4.8k', rating: 4.7, category: 'Property' },
  { id: 9, name: 'Partnership Deed', downloads: '3.9k', rating: 4.6, category: 'Business' },
  { id: 10, name: 'Affidavit Format', downloads: '11.2k', rating: 4.8, category: 'All Templates' },
  { id: 11, name: 'Divorce Petition', downloads: '6.7k', rating: 4.5, category: 'Family Law' },
  { id: 12, name: 'Leave License Agreement', downloads: '8.9k', rating: 4.7, category: 'Rental Agreements' },
];

const categories = ['All Templates', 'Rental Agreements', 'Employment', 'Business', 'Family Law', 'Property'];

const Documents = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [previewDoc, setPreviewDoc] = useState<typeof documents[0] | null>(null);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Templates' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsSidebarOpen(false);
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
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mb-3">
                    <FileText size={20} className="text-white/70" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{doc.name}</h3>
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
        <DialogContent className="max-w-2xl bg-background border-white/20">
          <DialogHeader>
            <DialogTitle className="text-foreground">{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="bg-white/5 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <FileText size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Document preview would appear here</p>
              <p className="text-xs text-muted-foreground mt-2">Downloaded {previewDoc?.downloads} times</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="flex-1 bg-white text-black hover:bg-white/90">
              <Download size={16} className="mr-2" />
              Download Template
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/20 text-foreground">
              Customize
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
};

export default Documents;
