import { 
  Sparkles, 
  FileText, 
  Users, 
  Calculator, 
  Home,
  Plus,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const mainItems = [
    { title: 'AI Assistant', icon: Home, href: '/', sublabel: 'Ask legal questions' },
    { title: 'Legal Intelligence', icon: Sparkles, href: '/', sublabel: '' },
  ];

  const serviceItems = [
    { title: 'Documents', icon: FileText, href: '/documents', sublabel: '100+ templates' },
    { title: 'Lawyers', icon: Users, href: '/lawyers', sublabel: 'Verified directory' },
    { title: 'Tax Services', icon: Calculator, href: '/tax-services', sublabel: 'Comprehensive solutions' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex flex-col">
              <h1 className="font-serif text-lg font-bold text-foreground">LegalCareAI</h1>
              <p className="text-xs text-muted-foreground">Legal Intelligence</p>
            </Link>
          )}
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
        
        {/* New Chat Button */}
        <Button 
          variant="outline" 
          className={`mt-3 w-full justify-start gap-2 bg-sidebar-accent border-sidebar-border hover:bg-sidebar-accent/80 ${isCollapsed ? 'px-2' : ''}`}
        >
          <Plus size={18} />
          {!isCollapsed && <span>New Chat</span>}
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Recent Chats (placeholder) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
            {!isCollapsed && 'TODAY'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={currentPath === '/'}
                  className="hover:bg-sidebar-accent"
                >
                  <Link to="/" className="flex items-center gap-3">
                    <MessageSquare size={18} className="text-muted-foreground" />
                    {!isCollapsed && <span className="truncate text-sm">New conversation</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
            {!isCollapsed && 'MAIN'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={currentPath === item.href && item.title === 'AI Assistant'}
                    className="hover:bg-sidebar-accent"
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon size={18} className="text-muted-foreground" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          {item.sublabel && (
                            <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Services */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
            {!isCollapsed && 'SERVICES'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {serviceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={currentPath === item.href}
                    className="hover:bg-sidebar-accent"
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon size={18} className="text-muted-foreground" />
                      {!isCollapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          {item.sublabel && (
                            <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                          )}
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="hover:bg-sidebar-accent">
              <Settings size={18} className="text-muted-foreground" />
              {!isCollapsed && <span className="text-sm">Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
