'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

interface NavItem {
  label: string;
  href: string;
}

interface CardNavProps {
  role: 'student' | 'mentor' | 'admin';
}

const navStructures: Record<'student' | 'mentor' | 'admin', NavItem[]> = {
  admin: [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Mentor Assignment', href: '/admin/mentor-assignment' },
    { label: 'Analytics', href: '/admin/analytics' },
  ],
  mentor: [
    { label: 'Dashboard', href: '/mentor' },
    { label: 'My Students', href: '/mentor/students' },
    { label: 'Feedback', href: '/mentor/feedback' },
    { label: 'Course Suggestions', href: '/mentor/course-suggestions' },
  ],
  student: [
    { label: 'Dashboard', href: '/student' },
    { label: 'Tasks', href: '/student/tasks' },
    { label: 'Progress', href: '/student/progress' },
    { label: 'Projects', href: '/student/projects' },
  ],
};

export default function CardNav({ role }: CardNavProps) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverBgRef = useRef<HTMLDivElement>(null);
  const navItems = navStructures[role] || [];

  useEffect(() => {
    const container = containerRef.current;
    const hoverBg = hoverBgRef.current;
    if (!container || !hoverBg) return;

    const ctx = gsap.context(() => {
      const items = container.querySelectorAll('.card-nav-link');
      
      items.forEach((item) => {
        const el = item as HTMLElement;
        
        el.addEventListener('mouseenter', () => {
          gsap.to(hoverBg, {
            left: el.offsetLeft,
            width: el.offsetWidth,
            opacity: 1,
            duration: 0.35,
            ease: 'power3.out',
          });
        });
      });

      container.addEventListener('mouseleave', () => {
        // Return to active item or hide
        const activeEl = container.querySelector('.card-nav-link.active') as HTMLElement;
        if (activeEl) {
          gsap.to(hoverBg, {
            left: activeEl.offsetLeft,
            width: activeEl.offsetWidth,
            opacity: 0.6,
            duration: 0.35,
            ease: 'power3.out',
          });
        } else {
          gsap.to(hoverBg, {
            opacity: 0,
            duration: 0.35,
            ease: 'power3.out',
          });
        }
      });

      // Initial active tab state
      const initialActive = container.querySelector('.card-nav-link.active') as HTMLElement;
      if (initialActive) {
        gsap.set(hoverBg, {
          left: initialActive.offsetLeft,
          width: initialActive.offsetWidth,
          opacity: 0.6,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [pathname, navItems]);

  return (
    <div ref={containerRef} className="card-nav-container no-print">
      <div ref={hoverBgRef} className="card-nav-hover-bg" />
      <div style={{ display: 'flex', gap: '4px', zIndex: 2, width: '100%' }}>
        {navItems.map((item) => {
          const isActive =
            item.href === `/${role}`
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`card-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
