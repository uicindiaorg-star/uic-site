'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import styles from './LoginForm.module.css';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg(
            'Invalid email or password. Make sure you created this account in Supabase Dashboard -> Authentication -> Users with Auto Confirm User enabled.'
          );
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      router.replace('/admin');
      router.refresh();
    } catch {
      setErrorMsg('Unable to reach authentication service. Check Supabase environment keys.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandDot} />
          <span>UIC STUDIO</span>
        </Link>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          Back to website
        </Link>
      </header>

      <main className={styles.center}>
        <section className={styles.card}>
          <div className={styles.badge}>
            <Lock size={12} />
            CMS Admin Access
          </div>
          <h1 className={styles.title}>Sign in to UIC Studio</h1>
          <p className={styles.subtitle}>
            Manage client inquiries, update website copy, publish portfolio case studies, and
            upload media directly to Supabase.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="admin-email" className={styles.label}>
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@uic.studio"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`${styles.input} ${styles.inputWithBtn}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {errorMsg ? <div className={styles.errorBox}>{errorMsg}</div> : null}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Signing in...' : 'Enter Dashboard'}
              <ArrowRight size={16} />
            </button>
          </form>
        </section>
      </main>

      <footer className={styles.footerNote}>
        Protected by Supabase Auth &amp; Row-Level Security
      </footer>
    </div>
  );
}

