'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { Profile } from '@/lib/types';

interface SidebarProps {
  profile: Profile;
  onClose?: () => void;
  isOpen?: boolean;
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const studentNav = [
  {
    label: 'Overview',
    href: '/student',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="11" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Profile',
    href: '/student/profile',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="10" cy="7" r="3" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
      </svg>
    ),
  },
  {
    label: 'Resume Builder',
    href: '/student/resume-builder',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M7 3h6a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 7h2M9 10h2M9 13h2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Resource Hub',
    href: '/student/resources',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Skill Tracker',
    href: '/student/skills',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Pathways',
    href: '/student/pathways',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    label: 'Progress',
    href: '/student/progress',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 17l4-8 4 4 4-6 2 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Projects',
    href: '/student/projects',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 6h14M3 10h14M3 14h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: '/student/github',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 14c0 2 1 3 2 3s2-1 2-3M7 10c-.5 0-2-.5-2-2s1.5-2 2-2M13 10c.5 0 2-.5 2-2s-1.5-2-2-2M10 3a7 7 0 100 14A7 7 0 0010 3z" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Placement Readiness Analytics',
    href: '/student/ai-analysis',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M10 3L4 10l6 7 6-7-6-7z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 8v4M10 14h.01" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    href: '/student/tasks',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="14" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Mentor Panel',
    href: '/student/mentor-request',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Mock Interview',
    href: '/student/mock-interview',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const mentorNav = [
  {
    label: 'Overview',
    href: '/mentor',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="11" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Students',
    href: '/mentor/students',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 17c0-3.314 2.686-6 6-6M14 10a3 3 0 110-6 3 3 0 010 6M17 17c0-2.761-1.791-5-4-5" />
      </svg>
    ),
  },
  {
    label: 'Tasks',
    href: '/mentor/tasks',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M5 10l3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3" y="3" width="14" height="14" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Feedback',
    href: '/mentor/feedback',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 4h12v10H4zM4 14l2 3 2-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Mentor Panel',
    href: '/mentor/panel',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="14" height="14" rx="2" />
        <path d="M9 3v14M3 9h14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const adminNav = [
  {
    label: 'Overview',
    href: '/admin',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="11" y="3" width="6" height="6" rx="1" />
        <rect x="3" y="11" width="6" height="6" rx="1" />
        <rect x="11" y="11" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="8" cy="7" r="3" />
        <path d="M2 17c0-3.314 2.686-6 6-6M14 10a3 3 0 110-6 3 3 0 010 6M17 17c0-2.761-1.791-5-4-5" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M3 17V10M7 17V7M11 17V12M15 17V4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Invites',
    href: '/admin/invites',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="4" y="3" width="12" height="14" rx="1.5" />
        <path d="M7 7h6M7 10h6M7 13h3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Admin Mentor Requests',
    href: '/admin/mentor-requests',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Students',
    href: '/admin/students',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0-.001h6v-1a6 6 0 00-9-5.197" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Sidebar({ profile, onClose, isOpen }: SidebarProps) {
  const pathname = usePathname();
  const nav = profile.role === 'mentor' ? mentorNav : profile.role === 'admin' ? adminNav : studentNav;

  const initials = (profile.full_name || profile.email)
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <CompassIcon />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">Placement Compass</span>
          <span className="sidebar-logo-subtitle">Readiness Platform</span>
        </div>
        {onClose && (
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu" type="button">
            &times;
          </button>
        )}
      </div>

      <div className="sidebar-section" style={{ flex: 1 }}>
        <span className="sidebar-section-label">Navigation</span>
        <nav className="sidebar-nav">
          {nav.map(item => {
            const isActive =
              item.href === `/${profile.role}`
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onClose?.()}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile.full_name || profile.email}</div>
            <div className="sidebar-user-role">{profile.role}</div>
          </div>
        </div>
        <form action={logout} style={{ marginTop: '4px' }}>
          <button type="submit" className="sidebar-nav-item" style={{ color: 'var(--color-error)', width: '100%' }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 16, height: 16 }}>
              <path d="M13 7l3 3-3 3M16 10H8M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
