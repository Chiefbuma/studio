'use client';

import Link from 'next/link';
import { Cake } from 'lucide-react';

export function AppFooter() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto py-6 px-4 md:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <Cake className="h-6 w-6" />
            <span>WhiskeDelights</span>
          </div>
          <div className="text-sm text-muted-foreground text-center sm:text-right">
            <p>© {new Date().getFullYear()} WhiskeDelights. All Rights Reserved.</p>
            <p>
              <Link href="/admin" className="hover:text-primary transition-colors text-xs">
                Admin Panel
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
