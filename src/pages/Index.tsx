import { Helmet } from 'react-helmet-async';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import MainContent from '@/components/MainContent';
import ChatHeader from '@/components/ChatHeader';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LegalCareAI - AI-Powered Legal Intelligence</title>
        <meta name="description" content="Get instant legal guidance with LegalCareAI. Ask questions about BNS, IPC, Civil Laws, Labour Law and more. Access 100+ document templates and connect with verified lawyers." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Helmet>
      
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          
          <SidebarInset className="flex flex-col flex-1">
            <ChatHeader />
            <MainContent />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Index;
