import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Settings,
  PanelLeft,
  BarChart,
  Users,
  Library,
  Lightbulb,
  Gift,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import React from 'react';
import { useChangelog } from '@/hooks/useChangelog';
const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/themes', icon: Lightbulb, label: 'Themes' },
  { to: '/prompts', icon: Library, label: 'Prompt Library' },
  { to: '/users', icon: Users, label: 'User Management' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];
const NavContent = () => {
  const { openModal, hasUnread } = useChangelog();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <NavLink to="/" className="flex items-center gap-2 font-display font-semibold text-lg">
          <BarChart className="h-6 w-6 text-primary" />
          <span>BuyersLens</span>
        </NavLink>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                  isActive && 'bg-muted text-primary'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={openModal}>
          <Gift className="mr-2 h-4 w-4" />
          What's New
          {hasUnread && (
            <span className="relative flex h-2 w-2 ml-auto">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};
export function Sidebar() {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-72">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <NavContent />
    </div>
  );
}