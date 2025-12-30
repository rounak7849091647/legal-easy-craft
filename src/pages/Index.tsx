import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import LoginModal from '@/components/LoginModal';

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>LegalCareAI - AI-Powered Legal Intelligence</title>
        <meta name="description" content="Get instant legal guidance with LegalCareAI. Ask questions about BNS, IPC, Civil Laws, Labour Law and more. Access 100+ document templates and connect with verified lawyers." />
      </Helmet>
      
      <div className="flex h-screen bg-background">
        <Sidebar onLoginClick={() => setIsLoginOpen(true)} />
        <MainContent onLoginClick={() => setIsLoginOpen(true)} />
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default Index;
