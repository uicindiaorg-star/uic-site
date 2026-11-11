import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/cms';
import { LoginForm } from '@/components/admin/LoginForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Login — UIC Studio CMS',
  description: 'Sign in to manage UIC Studio content, media, and client inquiries.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage() {
  const { user } = await requireAdminSession();

  if (user) {
    redirect('/admin');
  }

  return <LoginForm />;
}

