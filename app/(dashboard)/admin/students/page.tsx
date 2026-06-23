import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StudentManagementClient from '@/components/StudentManagementClient';

export const metadata = { title: 'Student Management - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    redirect(`/${auth.role}`);
  }

  return <StudentManagementClient />;
}
