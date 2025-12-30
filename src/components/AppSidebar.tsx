import { 
  FileText, 
  Users, 
  Calculator, 
  Home,
  Settings,
  LogIn
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

const AppSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const mainItems = [
    { title: 'AI Assistant', icon: Home, href: '/' },
  ];

  const serviceItems = [
    { title: 'Documents', icon: FileText, href: '/documents' },
    { title: 'Lawyers', icon: Users, href: '/lawyers' },
    { title: 'Tax Services', icon: Calculator, href: '/tax-services' },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/" className="flex flex-col">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">LegalCareAI</h1>
              <p className="text-xs text-muted-foreground">Legal Intelligence</p>
            </Link>
          )}
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
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
                    isActive={currentPath === item.href}
                    className="hover:bg-sidebar-accent"
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon size={18} className="text-muted-foreground" />
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
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
                        <span className="text-sm">{item.title}</span>
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
            <SidebarMenuButton asChild className="hover:bg-sidebar-accent">
              <Link to="/auth" className="flex items-center gap-3">
                <LogIn size={18} className="text-muted-foreground" />
                {!isCollapsed && (
                  <span className="text-sm">Login / Sign Up</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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
