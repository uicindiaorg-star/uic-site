'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Copy, ExternalLink, LogOut, RefreshCw } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from './AdminDashboard.module.css';

interface AdminSetupCardProps {
  userId: string;
  email: string;
  schemaReady: boolean;
}

export function AdminSetupCard({ userId, email, schemaReady }: AdminSetupCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const sqlSnippet = `insert into public.admin_users (user_id, email)
values ('${userId}', '${email}')
on conflict (user_id) do nothing;`;

  async function handleCopy() {
    await navigator.clipboard.writeText(sqlSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className={styles.setupPage}>
      <section className={styles.setupCard}>
        <div className={styles.eyebrow}>
          {schemaReady ? 'Admin Authorization Needed' : 'Supabase Setup Required'}
        </div>
        <h1 className={styles.pageTitle}>
          {schemaReady
            ? 'Grant CMS Admin Role to Your Account'
            : 'Apply CMS Database Migrations'}
        </h1>
        <p className={styles.pageSub}>
          Signed in as <strong>{email}</strong> (<code>{userId}</code>).
        </p>

        {!schemaReady ? (
          <p className={styles.pageSub} style={{ marginTop: 14 }}>
            Run <code>supabase/migrations/0001_create_contact_inquiries.sql</code> and{' '}
            <code>supabase/migrations/0002_create_cms_schema.sql</code> in your Supabase Dashboard
            SQL Editor first, then run the SQL statement below to grant admin privileges.
          </p>
        ) : (
          <p className={styles.pageSub} style={{ marginTop: 14 }}>
            Your CMS tables are ready, and your account is signed in. Run this SQL once in Supabase
            Dashboard -&gt; SQL Editor to authorize this user as a studio admin:
          </p>
        )}

        <pre className={styles.codeBlock}>{sqlSnippet}</pre>

        <div className={styles.btnRow}>
          <button type="button" className={styles.primaryBtn} onClick={handleCopy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied SQL' : 'Copy Promote SQL'}
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => router.refresh()}
          >
            <RefreshCw size={15} />
            Check Again
          </button>
          <Link href="/" className={styles.secondaryBtn}>
            <ExternalLink size={15} />
            View Website
          </Link>
          <button type="button" className={styles.dangerBtn} onClick={handleSignOut}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </section>
    </div>
  );
}

