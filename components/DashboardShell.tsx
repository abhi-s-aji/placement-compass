'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Profile } from '@/lib/types';

interface DashboardShellProps {
  profile: Profile;
  children: React.ReactNode;
  isOffline: boolean;
}

export default function DashboardShell({ profile, children, isOffline }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Mobile Top Bar */}
      <header
        className="mobile-header no-print"
        style={{
          height: 'var(--header-height)',
          borderBottom: '1px solid var(--color-border)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          backgroundColor: 'var(--color-bg-secondary)',
          position: 'sticky',
          top: 0,
          zIndex: 90,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
            }}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <span style={{ fontWeight: 'bold', fontSize: 'var(--font-size-base)', color: 'var(--color-text-primary)' }}>
            Placement Compass
          </span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sidebar */}
        <Sidebar
          profile={profile}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="main-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {isOffline && (
            <div
              style={{
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid #eab308',
                color: '#eab308',
                padding: '0.75rem 1.25rem',
                borderRadius: '6px',
                margin: '1rem',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-family)',
              }}
            >
              <span>Alert:</span>
              <span>Supabase connection temporarily unavailable. Limited mode enabled.</span>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="sidebar-overlay no-print"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 95,
          }}
        />
      )}
    </div>
  );
}
