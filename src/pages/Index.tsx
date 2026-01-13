import SEOHead from '@/components/SEOHead';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import MainContent from '@/components/MainContent';
import ChatHeader from '@/components/ChatHeader';
import DisclaimerPopup from '@/components/DisclaimerPopup';

const Index = () => {
  // FAQ Schema for rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is LegalCareAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LegalCareAI is an AI-powered legal intelligence platform that provides instant legal guidance for Indian law including BNS, IPC, Civil Law, Labour Law, and Tax Services.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I get legal advice in my language?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, LegalCareAI supports multiple Indian languages including Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, and Odia.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is LegalCareAI free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'LegalCareAI offers free access to basic legal guidance and AI-powered consultations. Premium features like lawyer connections may require additional services.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I file my ITR using LegalCareAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, LegalCareAI provides comprehensive tax services including ITR filing, Form 16 upload, CA-assisted filing, and tax planning assistance.',
        },
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="LegalCareAI - AI-Powered Legal Intelligence for Indian Law"
        description="Get instant legal guidance with LegalCareAI. Ask questions about BNS, IPC, Civil Laws, Labour Law, Tax Filing and more. Access 100+ document templates and connect with verified lawyers across India."
        keywords="legal AI India, BNS legal advice, IPC sections, civil law help, labour law consultation, tax filing online, ITR filing, legal documents, lawyer consultation India, AI legal assistant"
        canonicalUrl="/"
        structuredData={faqSchema}
      />
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          
          <SidebarInset className="flex flex-col flex-1">
            <ChatHeader />
            <main role="main" aria-label="Legal AI Chat Interface">
              <MainContent />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      
      <DisclaimerPopup />
    </>
  );
};

export default Index;
