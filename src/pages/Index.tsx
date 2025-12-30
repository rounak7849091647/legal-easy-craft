import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import LoginModal from '@/components/LoginModal';
import MobileHeader from '@/components/MobileHeader';

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoginClick = () => {
    setIsLoginOpen(true);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>LegalCareAI - AI-Powered Legal Intelligence</title>
        <meta name="description" content="Get instant legal guidance with LegalCareAI. Ask questions about BNS, IPC, Civil Laws, Labour Law and more. Access 100+ document templates and connect with verified lawyers." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Helmet>
      
      {/* Mobile Header */}
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
        <MainContent 
          onLoginClick={handleLoginClick}
          isMobile={isMobile}
        />
      </div>

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default Index;
