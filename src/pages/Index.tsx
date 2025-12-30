import { Helmet } from 'react-helmet-async';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LegalCareAI - AI-Powered Legal Intelligence</title>
        <meta name="description" content="Get instant legal guidance with LegalCareAI. Ask questions about BNS, IPC, Civil Laws, Labour Law and more. Access 100+ document templates and connect with verified lawyers." />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <Sidebar />
        <MainContent />
      </div>
    </>
  );
};

export default Index;
