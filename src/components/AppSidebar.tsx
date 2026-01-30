import { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  Calculator, 
  Home,
  Settings,
  LogIn,
  LogOut,
  LayoutDashboard,
  User,
  MessageSquare,
  Globe
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const AppSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleAIAssistantClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force page reload to reset chat state
    window.location.href = '/';
  };

  const mainItems = [
    { title: 'AI Assistant', icon: Home, href: '/', onClick: handleAIAssistantClick },
  ];

  const serviceItems = [
    { title: 'Documents', icon: FileText, href: '/documents' },
    { title: 'Lawyers', icon: Users, href: '/lawyers' },
    { title: 'Tax Services', icon: Calculator, href: '/tax-services' },
    { title: 'Discussion', icon: MessageSquare, href: '/discussion' },
    { title: 'Community', icon: Globe, href: '/community' },
  ];

  // Dashboard items - only shown when logged in
  const dashboardItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  ];

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-2">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed && (
            <Link to="/" className="flex flex-col pl-1">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">LegalCareAI</h1>
              <p className="text-xs text-muted-foreground">Legal Intelligence</p>
            </Link>
          )}
          <SidebarTrigger className={`text-muted-foreground hover:text-foreground ${isCollapsed ? 'h-8 w-8' : ''}`} />
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
                    <a 
                      href={item.href} 
                      onClick={item.onClick}
                      className="flex items-center gap-3"
                    >
                      <item.icon size={18} className="text-muted-foreground" />
                      {!isCollapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Dashboard - Only visible when logged in */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-muted-foreground px-2">
              {!isCollapsed && 'MY ACCOUNT'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {dashboardItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={currentPath === item.href || currentPath.startsWith('/dashboard')}
                      className="hover:bg-sidebar-accent"
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <item.icon size={18} className="text-primary" />
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

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

      <SidebarFooter className="p-3">
        <SidebarMenu>
          {/* User info when logged in */}
          {user && !isCollapsed && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-sidebar-accent/50">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-[10px] text-muted-foreground">Logged in</p>
              </div>
            </div>
          )}
          
          {user ? (
            // Logged in: Show sign out
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={handleSignOut}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut size={18} className="text-muted-foreground" />
                {!isCollapsed && <span className="text-sm">Sign Out</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            // Not logged in: Show login
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
          )}
          
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
