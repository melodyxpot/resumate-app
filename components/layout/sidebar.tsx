'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, FolderOpen, Settings, Sparkles, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Sparkles },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Generate Resume', href: '/generate', icon: FileText },
  { name: 'Saved Resumes', href: '/resumes', icon: Save },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col gap-4 p-6 w-64 h-screen border-r bg-sidebar border-sidebar-border">
      <Link href="/dashboard" className="flex items-center gap-2 mb-4">
        <div className="flex justify-center items-center w-8 h-8 rounded-lg bg-sidebar-primary">
          <Sparkles className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        <span className="text-xl font-bold text-sidebar-foreground">Resumate</span>
      </Link>

      <nav className="flex flex-col flex-1 gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
