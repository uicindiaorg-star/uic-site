'use client';

import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FolderKanban,
  Inbox,
  LayoutTemplate,
  LogOut,
  Mail,
  MessageSquareQuote,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import {
  DEFAULT_NFC_FINISHES,
  DEFAULT_NFC_STYLES,
  DEFAULT_SITE_SETTINGS,
  type CmsNfcStyle,
  type CmsProject,
  type CmsService,
  type CmsTestimonial,
  type ContactInquiry,
  type NfcFontVariant,
  type NfcLayoutVariant,
  type SiteSettings,
} from '@/lib/cms-types';
import type { Project } from '@/data/projects';
import styles from './AdminDashboard.module.css';

type TabKey =
  | 'inquiries'
  | 'site'
  | 'branding'
  | 'nfc'
  | 'projects'
  | 'services'
  | 'testimonials';

interface AdminDashboardProps {
  adminEmail: string;
  initialInquiries: ContactInquiry[];
  initialSettings: SiteSettings;
  initialProjects: CmsProject[];
  initialServices: CmsService[];
  initialTestimonials: CmsTestimonial[];
  initialNfcStyles: CmsNfcStyle[];
}

const NFC_LAYOUT_OPTIONS: { value: NfcLayoutVariant; label: string }[] = [
  { value: 'minimal', label: 'Minimal (Clean)' },
  { value: 'orbit', label: 'Orbit (Radar Rings)' },
  { value: 'statement', label: 'Statement (Editorial Monogram)' },
  { value: 'framed', label: 'Framed (Inset Technical Border)' },
  { value: 'split', label: 'Split (Header Rule)' },
  { value: 'grid', label: 'Grid (Blueprint Matrix)' },
];

const NFC_FONT_OPTIONS: { value: NfcFontVariant; label: string }[] = [
  { value: 'sans', label: 'Modern Sans' },
  { value: 'serif', label: 'Editorial Serif' },
  { value: 'mono', label: 'Technical Mono' },
];

type NfcColorSettingKey =
  | 'nfc_page_bg'
  | 'nfc_preview_bg'
  | 'nfc_panel_bg'
  | 'nfc_page_ink';

const NFC_COLOR_FIELDS: { key: NfcColorSettingKey; label: string; hint: string }[] = [
  { key: 'nfc_page_bg', label: '/nfc Page Background', hint: 'Outer canvas background' },
  { key: 'nfc_preview_bg', label: 'Card Preview Stage', hint: 'Radial surface behind 3D card' },
  { key: 'nfc_panel_bg', label: 'Controls Panel Bg', hint: 'Customizer form card surface' },
  { key: 'nfc_page_ink', label: '/nfc Primary Text', hint: 'Headings & labels on /nfc' },
];

const MOCKUP_TYPES: Project['mockupType'][] = [
  'pixpil',
  'dafy',
  'ankithmadhav',
  'luvcutlet',
  'forma',
  'connect',
  'flow',
];

type ColorSettingKey =
  | 'color_accent'
  | 'color_paper'
  | 'color_ink'
  | 'color_muted'
  | 'color_dark_bg'
  | 'color_dark_text'
  | 'color_header_bg'
  | 'color_header_text'
  | 'color_footer_bg'
  | 'color_footer_text'
  | 'color_work_bg'
  | 'color_nfc_bg'
  | 'color_contact_bg';

const COLOR_FIELDS: { key: ColorSettingKey; label: string; hint: string }[] = [
  { key: 'color_accent', label: 'Primary Accent', hint: 'Logo, buttons, highlights & focus rings' },
  { key: 'color_paper', label: 'Page Background (Light)', hint: 'Base paper surface color' },
  { key: 'color_ink', label: 'Primary Ink (Light)', hint: 'Body & heading text on light sections' },
  { key: 'color_muted', label: 'Muted Text', hint: 'Secondary captions & metadata' },
  { key: 'color_dark_bg', label: 'Dark Stage Background', hint: 'Hero portal & dark cards' },
  { key: 'color_dark_text', label: 'Dark Stage Text', hint: 'Bone typography on dark stages' },
  { key: 'color_header_bg', label: 'Header Background', hint: 'Frosted navbar backdrop tint' },
  { key: 'color_header_text', label: 'Header Text', hint: 'Nav links & CTA outline' },
  { key: 'color_footer_bg', label: 'Footer Background', hint: 'Bottom footer bar surface' },
  { key: 'color_footer_text', label: 'Footer Text', hint: 'Footer tagline & links' },
  { key: 'color_work_bg', label: 'Work Section Bg', hint: 'Portfolio showcase rail surface' },
  { key: 'color_nfc_bg', label: 'NFC Section Bg', hint: 'UIC Connect hardware stage' },
  { key: 'color_contact_bg', label: 'Contact Section Bg', hint: 'Bottom contact band surface' },
];

function createEmptyProject(): CmsProject {
  return {
    id: '',
    kind: 'client',
    client: '',
    title: '',
    subtitle: '',
    category: 'DIGITAL / WEB ARCHITECTURE',
    tags: '',
    description: '',
    coverImage: '',
    challenge: '',
    solution: '',
    deliverables: [],
    metrics: [],
    externalUrl: '',
    externalLabel: 'Visit Live Website',
    badge: 'LIVE CLIENT WEBSITE',
    year: String(new Date().getFullYear()),
    accent: '#2CFF05',
    mockupType: 'pixpil',
    sort_order: 0,
    is_published: true,
  };
}

function createEmptyService(): CmsService {
  return {
    id: '',
    number_label: '05',
    title: '',
    description: '',
    tags: '',
    is_default_open: false,
    sort_order: 0,
    is_published: true,
  };
}

function createEmptyTestimonial(): CmsTestimonial {
  return {
    id: '',
    name: '',
    role: '',
    company: '',
    quote: '',
    tag: '',
    initials: '',
    avatar_url: '',
    row_group: 1,
    sort_order: 0,
    is_published: true,
  };
}

function createEmptyNfcStyle(nextOrder = 4): CmsNfcStyle {
  return {
    id: '',
    name: '',
    description: '',
    layout_variant: 'framed',
    font_variant: 'sans',
    default_bg: '#1c2420',
    default_ink: '#e3ff97',
    corner_radius: 16,
    card_footer_text: 'A CONNECTION WORTH MAKING.',
    card_badge_text: 'uic / connect',
    back_headline: 'A little tap.\nA whole new connection.',
    back_footer_text: 'HOLD NEAR AN NFC-ENABLED PHONE.',
    artwork_url: '',
    show_signal: true,
    sort_order: nextOrder,
    is_published: true,
  };
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminDashboard({
  adminEmail,
  initialInquiries,
  initialSettings,
  initialProjects,
  initialServices,
  initialTestimonials,
  initialNfcStyles = DEFAULT_NFC_STYLES,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('inquiries');
  const [toast, setToast] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const [inquiries, setInquiries] = useState<ContactInquiry[]>(initialInquiries);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'reviewed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [projects, setProjects] = useState<CmsProject[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<CmsProject | null>(null);
  const [deliverablesText, setDeliverablesText] = useState('');
  const [metricsText, setMetricsText] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const [services, setServices] = useState<CmsService[]>(initialServices);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<CmsService | null>(null);
  const [savingService, setSavingService] = useState(false);

  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>(initialTestimonials);
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<CmsTestimonial | null>(null);
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  const [nfcStyles, setNfcStyles] = useState<CmsNfcStyle[]>(initialNfcStyles);
  const [selectedNfcStyleId, setSelectedNfcStyleId] = useState<string | null>(null);
  const [editingNfcStyle, setEditingNfcStyle] = useState<CmsNfcStyle | null>(null);
  const [savingNfcStyle, setSavingNfcStyle] = useState(false);

  function notify(kind: 'success' | 'error', text: string) {
    setToast({ kind, text });
    setTimeout(() => {
      setToast((current) => (current?.text === text ? null : current));
    }, 3600);
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function uploadImageFile(
    file: File,
    folder: string,
    fieldKey: string,
    onUrl: (url: string) => void
  ) {
    setUploadingField(fieldKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        notify('error', json.error ?? 'Image upload failed.');
        return;
      }
      onUrl(json.url);
      notify('success', 'Image uploaded to Supabase Storage.');
    } catch {
      notify('error', 'Upload failed due to a network error.');
    } finally {
      setUploadingField(null);
    }
  }

  const newInquiryCount = useMemo(
    () => inquiries.filter((i) => i.status === 'new').length,
    [inquiries]
  );

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return inquiries.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.service.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    });
  }, [inquiries, searchQuery, statusFilter]);

  async function handleInquiryStatus(id: number, status: 'new' | 'reviewed' | 'archived') {
    const res = await fetch('/api/admin/inquiries', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    const json = (await res.json()) as { error?: string; inquiry?: ContactInquiry };
    if (!res.ok || !json.inquiry) {
      notify('error', json.error ?? 'Failed to update inquiry status.');
      return;
    }
    setInquiries((prev) => prev.map((row) => (row.id === id ? json.inquiry! : row)));
    notify('success', `Inquiry marked as ${status}.`);
  }

  async function handleDeleteInquiry(id: number) {
    const res = await fetch(`/api/admin/inquiries?id=${id}`, { method: 'DELETE' });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify('error', json.error ?? 'Failed to delete inquiry.');
      return;
    }
    setInquiries((prev) => prev.filter((row) => row.id !== id));
    notify('success', 'Inquiry deleted.');
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = (await res.json()) as { error?: string; settings?: SiteSettings };
      if (!res.ok) {
        notify('error', json.error ?? 'Failed to save website content.');
        return;
      }
      if (json.settings) setSettings(json.settings);
      router.refresh();
      notify('success', 'Website content updated and published.');
    } finally {
      setSavingSettings(false);
    }
  }

  function openProjectForm(project: CmsProject, existingId: string | null) {
    setSelectedProjectId(existingId);
    setEditingProject({ ...project });
    setDeliverablesText((project.deliverables ?? []).join('\n'));
    setMetricsText(
      (project.metrics ?? []).map((m) => `${m.label}: ${m.value}`).join('\n')
    );
  }

  function toggleEditProject(project: CmsProject) {
    if (selectedProjectId === project.id) {
      setSelectedProjectId(null);
      setEditingProject(null);
      return;
    }
    openProjectForm(project, project.id);
  }

  function closeProjectEditor() {
    setSelectedProjectId(null);
    setEditingProject(null);
  }

  function toggleEditService(service: CmsService) {
    const key = String(service.id);
    if (selectedServiceId === key) {
      setSelectedServiceId(null);
      setEditingService(null);
      return;
    }
    setSelectedServiceId(key);
    setEditingService({ ...service });
  }

  function toggleEditTestimonial(testimonial: CmsTestimonial) {
    const key = String(testimonial.id);
    if (selectedTestimonialId === key) {
      setSelectedTestimonialId(null);
      setEditingTestimonial(null);
      return;
    }
    setSelectedTestimonialId(key);
    setEditingTestimonial({ ...testimonial });
  }

  async function handleSeedProjects() {
    setSavingProject(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'seed' }),
      });
      const json = (await res.json()) as { error?: string; projects?: CmsProject[] };
      if (!res.ok || !json.projects) {
        notify('error', json.error ?? 'Failed to import default projects.');
        return;
      }
      setProjects(json.projects);
      router.refresh();
      notify('success', `Imported ${json.projects.length} portfolio projects.`);
    } finally {
      setSavingProject(false);
    }
  }

  async function handleSaveProject(e: FormEvent) {
    e.preventDefault();
    if (!editingProject) return;
    setSavingProject(true);

    const deliverables = deliverablesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const metrics = metricsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const idx = line.indexOf(':');
        if (idx === -1) return { label: 'Metric', value: line };
        return {
          label: line.slice(0, idx).trim(),
          value: line.slice(idx + 1).trim(),
        };
      });

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingProject, deliverables, metrics }),
      });
      const json = (await res.json()) as { error?: string; project?: CmsProject };
      if (!res.ok || !json.project) {
        notify('error', json.error ?? 'Failed to save project.');
        return;
      }
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === json.project!.id);
        const next = exists
          ? prev.map((p) => (p.id === json.project!.id ? json.project! : p))
          : [...prev, json.project!];
        return [...next].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      });
      setSelectedProjectId(null);
      setEditingProject(null);
      router.refresh();
      notify('success', 'Project saved to CMS.');
    } finally {
      setSavingProject(false);
    }
  }

  async function handleDeleteProject(id: string) {
    const res = await fetch(`/api/admin/projects?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify('error', json.error ?? 'Failed to delete project.');
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id || editingProject?.id === id) {
      setSelectedProjectId(null);
      setEditingProject(null);
    }
    router.refresh();
    notify('success', 'Project removed.');
  }

  async function handleSaveService(e: FormEvent) {
    e.preventDefault();
    if (!editingService) return;
    setSavingService(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });
      const json = (await res.json()) as { error?: string; service?: CmsService };
      if (!res.ok || !json.service) {
        notify('error', json.error ?? 'Failed to save service.');
        return;
      }
      setServices((prev) => {
        const exists = prev.some((s) => String(s.id) === String(json.service!.id));
        const next = exists
          ? prev.map((s) => (String(s.id) === String(json.service!.id) ? json.service! : s))
          : [...prev, json.service!];
        return [...next].sort((a, b) => a.sort_order - b.sort_order);
      });
      setSelectedServiceId(null);
      setEditingService(null);
      router.refresh();
      notify('success', 'Service saved.');
    } finally {
      setSavingService(false);
    }
  }

  async function handleDeleteService(id: number | string) {
    const res = await fetch(`/api/admin/services?id=${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify('error', json.error ?? 'Failed to delete service.');
      return;
    }
    setServices((prev) => prev.filter((s) => String(s.id) !== String(id)));
    if (selectedServiceId === String(id) || (editingService && String(editingService.id) === String(id))) {
      setSelectedServiceId(null);
      setEditingService(null);
    }
    router.refresh();
    notify('success', 'Service deleted.');
  }

  async function handleSaveTestimonial(e: FormEvent) {
    e.preventDefault();
    if (!editingTestimonial) return;
    setSavingTestimonial(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTestimonial),
      });
      const json = (await res.json()) as { error?: string; testimonial?: CmsTestimonial };
      if (!res.ok || !json.testimonial) {
        notify('error', json.error ?? 'Failed to save testimonial.');
        return;
      }
      setTestimonials((prev) => {
        const exists = prev.some((t) => String(t.id) === String(json.testimonial!.id));
        const next = exists
          ? prev.map((t) =>
              String(t.id) === String(json.testimonial!.id) ? json.testimonial! : t
            )
          : [...prev, json.testimonial!];
        return [...next].sort((a, b) => a.row_group - b.row_group || a.sort_order - b.sort_order);
      });
      setSelectedTestimonialId(null);
      setEditingTestimonial(null);
      router.refresh();
      notify('success', 'Testimonial saved.');
    } finally {
      setSavingTestimonial(false);
    }
  }

  async function handleDeleteTestimonial(id: number | string) {
    const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify('error', json.error ?? 'Failed to delete testimonial.');
      return;
    }
    setTestimonials((prev) => prev.filter((t) => String(t.id) !== String(id)));
    if (
      selectedTestimonialId === String(id) ||
      (editingTestimonial && String(editingTestimonial.id) === String(id))
    ) {
      setSelectedTestimonialId(null);
      setEditingTestimonial(null);
    }
    router.refresh();
    notify('success', 'Testimonial deleted.');
  }

  function startNewNfcStyle() {
    setSelectedNfcStyleId(null);
    setEditingNfcStyle(createEmptyNfcStyle(nfcStyles.length + 1));
  }

  function toggleEditNfcStyle(styleItem: CmsNfcStyle) {
    const idStr = String(styleItem.id);
    if (selectedNfcStyleId === idStr) {
      setSelectedNfcStyleId(null);
      setEditingNfcStyle(null);
      return;
    }
    setSelectedNfcStyleId(idStr);
    setEditingNfcStyle({ ...styleItem });
  }

  async function handleSaveNfcStyle(event: FormEvent) {
    event.preventDefault();
    if (!editingNfcStyle) return;
    setSavingNfcStyle(true);
    try {
      const res = await fetch('/api/admin/nfc-styles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingNfcStyle),
      });
      const json = (await res.json()) as { error?: string; nfcStyle?: CmsNfcStyle };
      if (!res.ok || !json.nfcStyle) {
        notify('error', json.error ?? 'Failed to save NFC card style.');
        return;
      }
      setNfcStyles((prev) => {
        const exists = prev.some((s) => String(s.id) === String(json.nfcStyle!.id));
        const next = exists
          ? prev.map((s) =>
              String(s.id) === String(json.nfcStyle!.id) ? json.nfcStyle! : s
            )
          : [...prev, json.nfcStyle!];
        return [...next].sort((a, b) => a.sort_order - b.sort_order);
      });
      setSelectedNfcStyleId(null);
      setEditingNfcStyle(null);
      router.refresh();
      notify('success', 'NFC card style saved.');
    } finally {
      setSavingNfcStyle(false);
    }
  }

  async function handleDeleteNfcStyle(id: number | string) {
    const res = await fetch(`/api/admin/nfc-styles?id=${encodeURIComponent(String(id))}`, {
      method: 'DELETE',
    });
    const json = (await res.json()) as { error?: string };
    if (!res.ok) {
      notify('error', json.error ?? 'Failed to delete NFC card style.');
      return;
    }
    setNfcStyles((prev) => prev.filter((s) => String(s.id) !== String(id)));
    if (
      selectedNfcStyleId === String(id) ||
      (editingNfcStyle && String(editingNfcStyle.id) === String(id))
    ) {
      setSelectedNfcStyleId(null);
      setEditingNfcStyle(null);
    }
    router.refresh();
    notify('success', 'NFC card style deleted.');
  }

  const navItems: { key: TabKey; label: string; count: number; icon: typeof Inbox }[] = [
    { key: 'inquiries', label: 'Inquiries', count: newInquiryCount, icon: Inbox },
    { key: 'site', label: 'Site Content', count: 7, icon: LayoutTemplate },
    { key: 'branding', label: 'Brand & Colors', count: 13, icon: Palette },
    { key: 'nfc', label: 'NFC Studio', count: nfcStyles.length, icon: CreditCard },
    { key: 'projects', label: 'Projects', count: projects.length, icon: FolderKanban },
    { key: 'services', label: 'Services', count: services.length, icon: Briefcase },
    { key: 'testimonials', label: 'Testimonials', count: testimonials.length, icon: MessageSquareQuote },
  ];

  function renderNfcStyleForm(inline: boolean) {
    if (!editingNfcStyle) return null;
    return (
      <form
        onSubmit={handleSaveNfcStyle}
        className={inline ? styles.inlineEditor : styles.card}
        style={inline ? undefined : { marginBottom: 20 }}
      >
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>
              {selectedNfcStyleId
                ? `Editing Style: ${editingNfcStyle.name}`
                : 'New NFC Card Style'}
            </h2>
            <p className={styles.cardDesc}>
              Customize layout preset, typography, signature colors, corner radius, and card artwork for /nfc.
            </p>
          </div>
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setSelectedNfcStyleId(null);
                setEditingNfcStyle(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={savingNfcStyle}>
              <Save size={15} />
              {savingNfcStyle ? 'Saving...' : 'Save Style'}
            </button>
          </div>
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Style Name</span>
            <input
              className={styles.input}
              required
              placeholder="e.g. Emerald Frame, Obsidian Grid"
              value={editingNfcStyle.name}
              onChange={(e) =>
                setEditingNfcStyle((prev) => (prev ? { ...prev, name: e.target.value } : prev))
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Layout Pattern</span>
            <select
              className={styles.select}
              value={editingNfcStyle.layout_variant}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev
                    ? { ...prev, layout_variant: e.target.value as NfcLayoutVariant }
                    : prev
                )
              }
            >
              {NFC_LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Typography Style</span>
            <select
              className={styles.select}
              value={editingNfcStyle.font_variant}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, font_variant: e.target.value as NfcFontVariant } : prev
                )
              }
            >
              {NFC_FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Corner Radius (px, 0–32)</span>
            <input
              type="number"
              min={0}
              max={32}
              className={styles.input}
              value={editingNfcStyle.corner_radius}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, corner_radius: Number(e.target.value) || 0 } : prev
                )
              }
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Signature Card Background</span>
            <div className={styles.colorInputs}>
              <input
                type="color"
                className={styles.colorPicker}
                value={
                  /^#[0-9a-f]{6}$/i.test(editingNfcStyle.default_bg)
                    ? editingNfcStyle.default_bg
                    : '#222b28'
                }
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, default_bg: e.target.value } : prev
                  )
                }
              />
              <input
                type="text"
                className={styles.input}
                maxLength={7}
                value={editingNfcStyle.default_bg}
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, default_bg: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Signature Card Text Ink</span>
            <div className={styles.colorInputs}>
              <input
                type="color"
                className={styles.colorPicker}
                value={
                  /^#[0-9a-f]{6}$/i.test(editingNfcStyle.default_ink)
                    ? editingNfcStyle.default_ink
                    : '#e3ff97'
                }
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, default_ink: e.target.value } : prev
                  )
                }
              />
              <input
                type="text"
                className={styles.input}
                maxLength={7}
                value={editingNfcStyle.default_ink}
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, default_ink: e.target.value } : prev
                  )
                }
              />
            </div>
          </div>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Short Description (shown on /nfc)</span>
            <input
              className={styles.input}
              placeholder="e.g. Fine architectural inset frame with clean sans typography."
              value={editingNfcStyle.description}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, description: e.target.value } : prev
                )
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Front Footer Caption</span>
            <input
              className={styles.input}
              value={editingNfcStyle.card_footer_text}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, card_footer_text: e.target.value } : prev
                )
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Corner Brand Badge</span>
            <input
              className={styles.input}
              value={editingNfcStyle.card_badge_text}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, card_badge_text: e.target.value } : prev
                )
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Back Side Headline</span>
            <textarea
              className={styles.textarea}
              rows={2}
              value={editingNfcStyle.back_headline}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, back_headline: e.target.value } : prev
                )
              }
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Back Side Footer Caption</span>
            <input
              className={styles.input}
              value={editingNfcStyle.back_footer_text}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, back_footer_text: e.target.value } : prev
                )
              }
            />
          </label>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>Default Style Artwork / Texture (Optional)</span>
            <div className={styles.uploadRow}>
              <input
                className={styles.input}
                placeholder="https://... or upload below"
                value={editingNfcStyle.artwork_url}
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, artwork_url: e.target.value } : prev
                  )
                }
              />
              <label className={styles.uploadBtn}>
                <Upload size={14} />
                {uploadingField === 'nfc_style_artwork' ? 'Uploading...' : 'Upload Texture'}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void uploadImageFile(file, 'nfc-styles', 'nfc_style_artwork', (url) => {
                      setEditingNfcStyle((prev) => (prev ? { ...prev, artwork_url: url } : prev));
                    });
                    e.target.value = '';
                  }}
                />
              </label>
              {editingNfcStyle.artwork_url ? (
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() =>
                    setEditingNfcStyle((prev) => (prev ? { ...prev, artwork_url: '' } : prev))
                  }
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Sort Order</span>
            <input
              type="number"
              className={styles.input}
              value={editingNfcStyle.sort_order}
              onChange={(e) =>
                setEditingNfcStyle((prev) =>
                  prev ? { ...prev, sort_order: Number(e.target.value) || 0 } : prev
                )
              }
            />
          </label>
          <div className={styles.field} style={{ display: 'flex', gap: 18, alignItems: 'center', paddingTop: 22 }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={editingNfcStyle.show_signal}
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, show_signal: e.target.checked } : prev
                  )
                }
              />
              <span className={styles.fieldLabel}>Show NFC Signal )))</span>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={editingNfcStyle.is_published}
                onChange={(e) =>
                  setEditingNfcStyle((prev) =>
                    prev ? { ...prev, is_published: e.target.checked } : prev
                  )
                }
              />
              <span className={styles.fieldLabel}>Published on /nfc</span>
            </label>
          </div>
        </div>
      </form>
    );
  }

  function renderProjectForm(inline: boolean) {
    if (!editingProject) return null;
    return (
      <form
        onSubmit={handleSaveProject}
        className={inline ? styles.inlineEditor : styles.card}
        style={inline ? undefined : { marginBottom: 20 }}
      >
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>
              {selectedProjectId ? `Editing: ${editingProject.title}` : 'New Project'}
            </h2>
            <p className={styles.cardDesc}>
              Upload a cover photo or choose an interactive studio mockup card.
            </p>
          </div>
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={closeProjectEditor}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={savingProject}>
              <Save size={15} />
              {savingProject ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Slug / ID (auto-slugified if blank)</label>
            <input
              className={styles.input}
              placeholder="e.g. pixpil"
              value={editingProject.id}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, id: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Client Name *</label>
            <input
              required
              className={styles.input}
              value={editingProject.client}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, client: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Project Title *</label>
            <input
              required
              className={styles.input}
              value={editingProject.title}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, title: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Subtitle</label>
            <input
              className={styles.input}
              value={editingProject.subtitle}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, subtitle: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <input
              className={styles.input}
              value={editingProject.category}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, category: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Tags</label>
            <input
              className={styles.input}
              value={editingProject.tags}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, tags: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Kind</label>
            <select
              className={styles.select}
              value={editingProject.kind}
              onChange={(e) =>
                setEditingProject((p) =>
                  p ? { ...p, kind: e.target.value === 'concept' ? 'concept' : 'client' } : p
                )
              }
            >
              <option value="client">Client Case Study</option>
              <option value="concept">Studio Concept</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Mockup Style Fallback</label>
            <select
              className={styles.select}
              value={editingProject.mockupType}
              onChange={(e) =>
                setEditingProject((p) =>
                  p ? { ...p, mockupType: e.target.value as Project['mockupType'] } : p
                )
              }
            >
              {MOCKUP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Badge</label>
            <input
              className={styles.input}
              value={editingProject.badge}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, badge: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Year &amp; Accent Hex</label>
            <div className={styles.btnRow}>
              <input
                className={styles.input}
                value={editingProject.year}
                onChange={(e) =>
                  setEditingProject((p) => (p ? { ...p, year: e.target.value } : p))
                }
                placeholder="2025"
              />
              <input
                className={styles.input}
                value={editingProject.accent}
                onChange={(e) =>
                  setEditingProject((p) => (p ? { ...p, accent: e.target.value } : p))
                }
                placeholder="#2CFF05"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>External URL</label>
            <input
              className={styles.input}
              value={editingProject.externalUrl ?? ''}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, externalUrl: e.target.value } : p))
              }
              placeholder="https://..."
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Sort Order &amp; Visibility</label>
            <div className={styles.btnRow}>
              <input
                type="number"
                className={styles.input}
                style={{ width: 100 }}
                value={editingProject.sort_order ?? 0}
                onChange={(e) =>
                  setEditingProject((p) =>
                    p ? { ...p, sort_order: Number(e.target.value) || 0 } : p
                  )
                }
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingProject.is_published !== false}
                  onChange={(e) =>
                    setEditingProject((p) => (p ? { ...p, is_published: e.target.checked } : p))
                  }
                />
                Published
              </label>
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Project Cover Image (Optional)</label>
            <div className={styles.mediaRow}>
              <div className={styles.previewBox}>
                {editingProject.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editingProject.coverImage}
                    alt="Project cover preview"
                    className={styles.previewImg}
                  />
                ) : (
                  'Mockup fallback'
                )}
              </div>
              <div className={styles.uploadControls}>
                <input
                  className={styles.input}
                  value={editingProject.coverImage ?? ''}
                  onChange={(e) =>
                    setEditingProject((p) => (p ? { ...p, coverImage: e.target.value } : p))
                  }
                  placeholder="Paste image URL or upload below"
                />
                <label className={styles.fileLabel}>
                  <Upload size={14} />
                  {uploadingField === 'project-cover'
                    ? 'Uploading image...'
                    : 'Upload Cover Image'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className={styles.hiddenInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadImageFile(file, 'projects', 'project-cover', (url) =>
                          setEditingProject((p) => (p ? { ...p, coverImage: url } : p))
                        );
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Description *</label>
            <textarea
              required
              className={styles.textarea}
              value={editingProject.description}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, description: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Challenge</label>
            <textarea
              className={styles.textarea}
              value={editingProject.challenge ?? ''}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, challenge: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Solution</label>
            <textarea
              className={styles.textarea}
              value={editingProject.solution ?? ''}
              onChange={(e) =>
                setEditingProject((p) => (p ? { ...p, solution: e.target.value } : p))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Deliverables (One per line)</label>
            <textarea
              className={styles.textarea}
              value={deliverablesText}
              onChange={(e) => setDeliverablesText(e.target.value)}
              placeholder={'Editorial Strategy\nCustom WebGL Interface'}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Metrics (One `Label: Value` per line)</label>
            <textarea
              className={styles.textarea}
              value={metricsText}
              onChange={(e) => setMetricsText(e.target.value)}
              placeholder={'Conversion Lift: +42%\nLighthouse: 99/100'}
            />
          </div>
        </div>
      </form>
    );
  }

  function renderServiceForm(inline: boolean) {
    if (!editingService) return null;
    return (
      <form
        onSubmit={handleSaveService}
        className={inline ? styles.inlineEditor : styles.card}
        style={inline ? undefined : { marginBottom: 20 }}
      >
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            {selectedServiceId ? `Editing: ${editingService.title}` : 'New Service'}
          </h2>
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setSelectedServiceId(null);
                setEditingService(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={savingService}>
              <Save size={15} />
              {savingService ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Number Label *</label>
            <input
              required
              className={styles.input}
              value={editingService.number_label}
              onChange={(e) =>
                setEditingService((s) => (s ? { ...s, number_label: e.target.value } : s))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input
              required
              className={styles.input}
              value={editingService.title}
              onChange={(e) =>
                setEditingService((s) => (s ? { ...s, title: e.target.value } : s))
              }
            />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Tags (Dot-separated)</label>
            <input
              className={styles.input}
              value={editingService.tags}
              onChange={(e) =>
                setEditingService((s) => (s ? { ...s, tags: e.target.value } : s))
              }
            />
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Description *</label>
            <textarea
              required
              className={styles.textarea}
              value={editingService.description}
              onChange={(e) =>
                setEditingService((s) => (s ? { ...s, description: e.target.value } : s))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Sort Order</label>
            <input
              type="number"
              className={styles.input}
              value={editingService.sort_order}
              onChange={(e) =>
                setEditingService((s) =>
                  s ? { ...s, sort_order: Number(e.target.value) || 0 } : s
                )
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Options</label>
            <div className={styles.btnRow} style={{ paddingTop: 6 }}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingService.is_default_open}
                  onChange={(e) =>
                    setEditingService((s) =>
                      s ? { ...s, is_default_open: e.target.checked } : s
                    )
                  }
                />
                Open by default
              </label>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingService.is_published}
                  onChange={(e) =>
                    setEditingService((s) => (s ? { ...s, is_published: e.target.checked } : s))
                  }
                />
                Published
              </label>
            </div>
          </div>
        </div>
      </form>
    );
  }

  function renderTestimonialForm(inline: boolean) {
    if (!editingTestimonial) return null;
    return (
      <form
        onSubmit={handleSaveTestimonial}
        className={inline ? styles.inlineEditor : styles.card}
        style={inline ? undefined : { marginBottom: 20 }}
      >
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>
            {selectedTestimonialId ? `Editing: ${editingTestimonial.name}` : 'New Testimonial'}
          </h2>
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => {
                setSelectedTestimonialId(null);
                setEditingTestimonial(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className={styles.primaryBtn} disabled={savingTestimonial}>
              <Save size={15} />
              {savingTestimonial ? 'Saving...' : 'Save Testimonial'}
            </button>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Client Name *</label>
            <input
              required
              className={styles.input}
              value={editingTestimonial.name}
              onChange={(e) =>
                setEditingTestimonial((t) => (t ? { ...t, name: e.target.value } : t))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Role *</label>
            <input
              required
              className={styles.input}
              value={editingTestimonial.role}
              onChange={(e) =>
                setEditingTestimonial((t) => (t ? { ...t, role: e.target.value } : t))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Company *</label>
            <input
              required
              className={styles.input}
              value={editingTestimonial.company}
              onChange={(e) =>
                setEditingTestimonial((t) => (t ? { ...t, company: e.target.value } : t))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Topic Tag *</label>
            <input
              required
              className={styles.input}
              value={editingTestimonial.tag}
              onChange={(e) =>
                setEditingTestimonial((t) => (t ? { ...t, tag: e.target.value } : t))
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Initials (auto if blank)</label>
            <input
              maxLength={3}
              className={styles.input}
              value={editingTestimonial.initials}
              onChange={(e) =>
                setEditingTestimonial((t) =>
                  t ? { ...t, initials: e.target.value.toUpperCase() } : t
                )
              }
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Marquee Row, Order &amp; Status</label>
            <div className={styles.btnRow}>
              <select
                className={styles.select}
                style={{ width: 'auto' }}
                value={editingTestimonial.row_group}
                onChange={(e) =>
                  setEditingTestimonial((t) =>
                    t ? { ...t, row_group: Number(e.target.value) === 2 ? 2 : 1 } : t
                  )
                }
              >
                <option value={1}>Row 1</option>
                <option value={2}>Row 2</option>
              </select>
              <input
                type="number"
                className={styles.input}
                style={{ width: 90 }}
                value={editingTestimonial.sort_order}
                onChange={(e) =>
                  setEditingTestimonial((t) =>
                    t ? { ...t, sort_order: Number(e.target.value) || 0 } : t
                  )
                }
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={editingTestimonial.is_published}
                  onChange={(e) =>
                    setEditingTestimonial((t) =>
                      t ? { ...t, is_published: e.target.checked } : t
                    )
                  }
                />
                Published
              </label>
            </div>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Client Photo / Avatar (Optional)</label>
            <div className={styles.mediaRow}>
              <div className={styles.previewBox}>
                {editingTestimonial.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editingTestimonial.avatar_url}
                    alt={editingTestimonial.name || 'Client avatar'}
                    className={styles.previewImg}
                  />
                ) : (
                  editingTestimonial.initials || 'Initials fallback'
                )}
              </div>
              <div className={styles.uploadControls}>
                <input
                  className={styles.input}
                  value={editingTestimonial.avatar_url ?? ''}
                  onChange={(e) =>
                    setEditingTestimonial((t) =>
                      t ? { ...t, avatar_url: e.target.value } : t
                    )
                  }
                  placeholder="Paste image URL or upload below"
                />
                <label className={styles.fileLabel}>
                  <Upload size={14} />
                  {uploadingField === 'testimonial-avatar'
                    ? 'Uploading photo...'
                    : 'Upload Client Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className={styles.hiddenInput}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        uploadImageFile(file, 'testimonials', 'testimonial-avatar', (url) =>
                          setEditingTestimonial((t) => (t ? { ...t, avatar_url: url } : t))
                        );
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
          <div className={`${styles.field} ${styles.fieldFull}`}>
            <label className={styles.label}>Quote *</label>
            <textarea
              required
              className={styles.textarea}
              value={editingTestimonial.quote}
              onChange={(e) =>
                setEditingTestimonial((t) => (t ? { ...t, quote: e.target.value } : t))
              }
            />
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.brandRow}>
            <span className={styles.brand}>
              <span className={styles.brandDot} />
              UIC STUDIO
            </span>
            <span className={styles.cmsTag}>CMS</span>
          </div>

          <nav className={styles.nav} aria-label="CMS Sections">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`${styles.navBtn} ${isActive ? styles.navBtnActive : ''}`}
                >
                  <span className={styles.navLeft}>
                    <Icon size={16} />
                    {item.label}
                  </span>
                  <span className={styles.navCount}>{item.count}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userLabel}>Signed in admin</div>
            <div className={styles.userEmail} title={adminEmail}>
              {adminEmail}
            </div>
          </div>
          <Link href="/" target="_blank" className={styles.sideActionLink}>
            <ExternalLink size={14} />
            View Live Website
          </Link>
          <button type="button" onClick={handleSignOut} className={styles.signOutBtn}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.eyebrow}>Unique Identity Craft — Studio Control</div>
            <h1 className={styles.pageTitle}>
              {activeTab === 'inquiries' && 'Client Contact Inquiries'}
              {activeTab === 'site' && 'Global Website Content & Media'}
              {activeTab === 'branding' && 'Logo, Header, Footer & Theme Colors'}
              {activeTab === 'nfc' && 'NFC Studio (/nfc) Card Styles & Design'}
              {activeTab === 'projects' && 'Portfolio Case Studies'}
              {activeTab === 'services' && 'Services Accordion'}
              {activeTab === 'testimonials' && 'Client Testimonials'}
            </h1>
            <p className={styles.pageSub}>
              Changes publish directly to your Supabase backend and reflect live on the site.
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>New Inquiries</div>
            <div className={styles.statValue}>{newInquiryCount}</div>
            <div className={styles.statHint}>{inquiries.length} total submissions</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>CMS Projects</div>
            <div className={styles.statValue}>{projects.length}</div>
            <div className={styles.statHint}>
              {projects.length === 0 ? 'Using built-in showcase' : 'Managed in Supabase'}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Active Services</div>
            <div className={styles.statValue}>
              {services.filter((s) => s.is_published).length}
            </div>
            <div className={styles.statHint}>{services.length} total items</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Testimonials</div>
            <div className={styles.statValue}>
              {testimonials.filter((t) => t.is_published).length}
            </div>
            <div className={styles.statHint}>Marquee &amp; /testimonials</div>
          </div>
        </div>

        {activeTab === 'inquiries' && (
          <section>
            <div className={styles.toolbar}>
              <div className={styles.filterGroup}>
                {(['all', 'new', 'reviewed', 'archived'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`${styles.filterPill} ${
                      statusFilter === status ? styles.filterPillActive : ''
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="search"
                placeholder="Search name, email, service, message..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredInquiries.length === 0 ? (
              <div className={styles.emptyState}>
                No inquiries match the current filter. Submissions from your website contact form
                appear here automatically.
              </div>
            ) : (
              <div className={styles.inquiryList}>
                {filteredInquiries.map((inq) => (
                  <article key={inq.id} className={styles.inquiryCard}>
                    <div className={styles.inquiryTop}>
                      <div>
                        <div className={styles.inquiryName}>{inq.name}</div>
                        <div className={styles.inquiryMeta}>
                          <span>{inq.email}</span>
                          <span>•</span>
                          <span>{formatDate(inq.created_at)}</span>
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <span className={styles.serviceChip}>{inq.service}</span>
                        <span
                          className={`${styles.statusBadge} ${
                            inq.status === 'new'
                              ? styles.statusNew
                              : inq.status === 'reviewed'
                                ? styles.statusReviewed
                                : styles.statusArchived
                          }`}
                        >
                          {inq.status}
                        </span>
                      </div>
                    </div>

                    <div className={styles.inquiryMsg}>{inq.message}</div>

                    <div className={styles.cardActions}>
                      <div className={styles.btnRow}>
                        <label htmlFor={`status-${inq.id}`} className={styles.label}>
                          Status
                        </label>
                        <select
                          id={`status-${inq.id}`}
                          className={styles.select}
                          style={{ width: 'auto' }}
                          value={inq.status}
                          onChange={(e) =>
                            handleInquiryStatus(
                              inq.id,
                              e.target.value as 'new' | 'reviewed' | 'archived'
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className={styles.btnRow}>
                        <a
                          href={`mailto:${inq.email}?subject=${encodeURIComponent(
                            `Re: UIC Studio — ${inq.service}`
                          )}`}
                          className={styles.secondaryBtn}
                        >
                          <Mail size={14} />
                          Reply
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className={styles.dangerBtn}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === 'site' && (
          <form onSubmit={handleSaveSettings} className={styles.panelGrid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Hero Banner &amp; Background Image</h2>
                  <p className={styles.cardDesc}>
                    Controls the opening cinematic section copy and atmospheric hero photograph.
                  </p>
                </div>
                <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
                  <Save size={15} />
                  {savingSettings ? 'Saving...' : 'Save Site Content'}
                </button>
              </div>

              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Hero Kicker</label>
                  <input
                    className={styles.input}
                    value={settings.hero_kicker}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, hero_kicker: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Hero Headline</label>
                  <input
                    className={styles.input}
                    value={settings.hero_headline}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, hero_headline: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Highlighted Phrase (Lime)</label>
                  <input
                    className={styles.input}
                    value={settings.hero_highlight}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, hero_highlight: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Contact Section Kicker</label>
                  <input
                    className={styles.input}
                    value={settings.contact_kicker}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, contact_kicker: e.target.value }))
                    }
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Hero Supporting Copy</label>
                  <textarea
                    className={styles.textarea}
                    value={settings.hero_copy}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, hero_copy: e.target.value }))
                    }
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Hero Background Photo</label>
                  <div className={styles.mediaRow}>
                    <div className={styles.previewBox}>
                      {settings.hero_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.hero_image_url}
                          alt="Hero background preview"
                          className={styles.previewImg}
                        />
                      ) : (
                        'No image'
                      )}
                    </div>
                    <div className={styles.uploadControls}>
                      <input
                        className={styles.input}
                        value={settings.hero_image_url}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, hero_image_url: e.target.value }))
                        }
                        placeholder="/images/hero-noir-figure.jpg or uploaded URL"
                      />
                      <label className={styles.fileLabel}>
                        <Upload size={14} />
                        {uploadingField === 'hero'
                          ? 'Uploading to Supabase...'
                          : 'Upload New Hero Image'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                          className={styles.hiddenInput}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadImageFile(file, 'hero', 'hero', (url) =>
                                setSettings((s) => ({ ...s, hero_image_url: url }))
                              );
                            }
                            e.target.value = '';
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Studio Introduction</h2>
                    <p className={styles.cardDesc}>Editorial manifesto &amp; positioning copy.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Studio Kicker</label>
                    <input
                      className={styles.input}
                      value={settings.studio_kicker}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, studio_kicker: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Prefix</label>
                    <input
                      className={styles.input}
                      value={settings.studio_headline_prefix}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, studio_headline_prefix: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Emphasis (Italic)</label>
                    <input
                      className={styles.input}
                      value={settings.studio_headline_em}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, studio_headline_em: e.target.value }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Paragraph 1</label>
                    <textarea
                      className={styles.textarea}
                      value={settings.studio_p1}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, studio_p1: e.target.value }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Paragraph 2</label>
                    <textarea
                      className={styles.textarea}
                      value={settings.studio_p2}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, studio_p2: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>UIC Connect (NFC Card Section)</h2>
                    <p className={styles.cardDesc}>Smart business card showcase copy.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>NFC Eyebrow</label>
                    <input
                      className={styles.input}
                      value={settings.nfc_eyebrow}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_eyebrow: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Prefix</label>
                    <input
                      className={styles.input}
                      value={settings.nfc_headline_prefix}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_headline_prefix: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Emphasis</label>
                    <input
                      className={styles.input}
                      value={settings.nfc_headline_em}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_headline_em: e.target.value }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>NFC Description</label>
                    <textarea
                      className={styles.textarea}
                      value={settings.nfc_copy}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_copy: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Selected Work Section Heading</h2>
                    <p className={styles.cardDesc}>Portfolio rail header &amp; subheading.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Prefix</label>
                    <input
                      className={styles.input}
                      value={settings.portfolio_headline_prefix}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          portfolio_headline_prefix: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Headline Emphasis (Italic)</label>
                    <input
                      className={styles.input}
                      value={settings.portfolio_headline_em}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          portfolio_headline_em: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Subtitle Line 1</label>
                    <input
                      className={styles.input}
                      value={settings.portfolio_sub_1}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, portfolio_sub_1: e.target.value }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Subtitle Line 2</label>
                    <input
                      className={styles.input}
                      value={settings.portfolio_sub_2}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, portfolio_sub_2: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Process &amp; Testimonials Headers</h2>
                    <p className={styles.cardDesc}>Workflow and social-proof section labels.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Process Kicker</label>
                    <input
                      className={styles.input}
                      value={settings.process_kicker}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, process_kicker: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Process Headline Prefix</label>
                    <textarea
                      className={styles.textarea}
                      style={{ minHeight: 68 }}
                      value={settings.process_headline_prefix}
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          process_headline_prefix: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Process Headline Emphasis</label>
                    <input
                      className={styles.input}
                      value={settings.process_headline_em}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, process_headline_em: e.target.value }))
                      }
                    />
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Testimonials Section Kicker</label>
                    <input
                      className={styles.input}
                      value={settings.testimonials_kicker}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, testimonials_kicker: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'branding' && (
          <form onSubmit={handleSaveSettings} className={styles.panelGrid}>
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Logo &amp; Brand Wordmark</h2>
                  <p className={styles.cardDesc}>
                    Upload an image logo (shown in Header &amp; Footer) or customize the text wordmark.
                  </p>
                </div>
                <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
                  <Save size={15} />
                  {savingSettings ? 'Saving...' : 'Save Brand & Colors'}
                </button>
              </div>

              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Custom Logo Image (Optional)</label>
                  <div className={styles.mediaRow}>
                    <div className={styles.previewBox}>
                      {settings.logo_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.logo_image_url}
                          alt="Brand logo preview"
                          className={styles.previewImg}
                          style={{ objectFit: 'contain', padding: 8 }}
                        />
                      ) : (
                        `${settings.logo_text || 'uic'}${settings.logo_mark || ''}`
                      )}
                    </div>
                    <div className={styles.uploadControls}>
                      <input
                        className={styles.input}
                        value={settings.logo_image_url}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, logo_image_url: e.target.value }))
                        }
                        placeholder="Leave empty to use stylized text logo or upload SVG/PNG/WebP"
                      />
                      <div className={styles.btnRow}>
                        <label className={styles.fileLabel}>
                          <Upload size={14} />
                          {uploadingField === 'logo'
                            ? 'Uploading logo...'
                            : 'Upload Logo Image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                            className={styles.hiddenInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                uploadImageFile(file, 'branding', 'logo', (url) =>
                                  setSettings((s) => ({ ...s, logo_image_url: url }))
                                );
                              }
                              e.target.value = '';
                            }}
                          />
                        </label>
                        {settings.logo_image_url ? (
                          <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={() =>
                              setSettings((s) => ({ ...s, logo_image_url: '' }))
                            }
                          >
                            Use Text Logo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Logo Text (Fallback)</label>
                  <input
                    className={styles.input}
                    value={settings.logo_text}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, logo_text: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Registered / Mark Symbol</label>
                  <input
                    className={styles.input}
                    value={settings.logo_mark}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, logo_mark: e.target.value }))
                    }
                  />
                </div>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label}>Header Brand Wordmark (Two lines supported)</label>
                  <textarea
                    className={styles.textarea}
                    style={{ minHeight: 68 }}
                    value={settings.brand_wordmark}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, brand_wordmark: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Header Navigation &amp; CTA</h2>
                    <p className={styles.cardDesc}>Edit menu links and top-right action button.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 1 Label</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_1_label}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_1_label: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 1 URL</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_1_href}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_1_href: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 2 Label</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_2_label}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_2_label: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 2 URL</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_2_href}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_2_href: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 3 Label</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_3_label}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_3_label: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Link 3 URL</label>
                    <input
                      className={styles.input}
                      value={settings.nav_link_3_href}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_link_3_href: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>CTA Button Label</label>
                    <input
                      className={styles.input}
                      value={settings.nav_cta_label}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_cta_label: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>CTA Button URL</label>
                    <input
                      className={styles.input}
                      value={settings.nav_cta_href}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nav_cta_href: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>Footer Content</h2>
                    <p className={styles.cardDesc}>Tagline, copyright owner &amp; top link.</p>
                  </div>
                </div>
                <div className={styles.fieldGrid}>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Footer Tagline (Line breaks preserved)</label>
                    <textarea
                      className={styles.textarea}
                      value={settings.footer_tagline}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, footer_tagline: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Copyright Brand Name</label>
                    <input
                      className={styles.input}
                      value={settings.footer_copyright}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, footer_copyright: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Back-to-Top Label</label>
                    <input
                      className={styles.input}
                      value={settings.footer_top_label}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, footer_top_label: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <h2 className={styles.cardTitle}>Global Theme &amp; Section Colors</h2>
                  <p className={styles.cardDesc}>
                    Full access to accent, background, header, footer, and section colors across the site.
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      color_accent: DEFAULT_SITE_SETTINGS.color_accent,
                      color_paper: DEFAULT_SITE_SETTINGS.color_paper,
                      color_ink: DEFAULT_SITE_SETTINGS.color_ink,
                      color_muted: DEFAULT_SITE_SETTINGS.color_muted,
                      color_dark_bg: DEFAULT_SITE_SETTINGS.color_dark_bg,
                      color_dark_text: DEFAULT_SITE_SETTINGS.color_dark_text,
                      color_header_bg: DEFAULT_SITE_SETTINGS.color_header_bg,
                      color_header_text: DEFAULT_SITE_SETTINGS.color_header_text,
                      color_footer_bg: DEFAULT_SITE_SETTINGS.color_footer_bg,
                      color_footer_text: DEFAULT_SITE_SETTINGS.color_footer_text,
                      color_work_bg: DEFAULT_SITE_SETTINGS.color_work_bg,
                      color_nfc_bg: DEFAULT_SITE_SETTINGS.color_nfc_bg,
                      color_contact_bg: DEFAULT_SITE_SETTINGS.color_contact_bg,
                    }))
                  }
                >
                  <RotateCcw size={14} />
                  Reset Studio Defaults
                </button>
              </div>

              <div className={styles.colorGrid}>
                {COLOR_FIELDS.map((field) => {
                  const value = settings[field.key] || DEFAULT_SITE_SETTINGS[field.key];
                  return (
                    <div key={field.key} className={styles.colorItem}>
                      <label className={styles.label}>{field.label}</label>
                      <div className={styles.colorInputRow}>
                        <input
                          type="color"
                          className={styles.colorPicker}
                          aria-label={field.label}
                          value={/^#([0-9a-fA-F]{6})$/.test(value) ? value : '#2CFF05'}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              [field.key]: e.target.value,
                            }))
                          }
                        />
                        <input
                          className={styles.input}
                          value={value}
                          onChange={(e) =>
                            setSettings((s) => ({
                              ...s,
                              [field.key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <span className={styles.colorHint}>{field.hint}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        )}

        {activeTab === 'nfc' && (
          <section>
            <div className={styles.toolbar}>
              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={startNewNfcStyle}
                >
                  <Plus size={15} />
                  Add Card Style
                </button>
                <Link
                  href="/nfc"
                  target="_blank"
                  className={styles.secondaryBtn}
                >
                  <ExternalLink size={14} />
                  Open /nfc Studio
                </Link>
              </div>
              <span className={styles.cardDesc}>
                {nfcStyles.length} card styles · Click Edit on any card to customize its design inline
              </span>
            </div>

            {editingNfcStyle && selectedNfcStyleId === null ? renderNfcStyleForm(false) : null}

            <div className={styles.listStack} style={{ marginBottom: 28 }}>
              {nfcStyles.map((styleItem) => {
                const isSelected = selectedNfcStyleId === String(styleItem.id);
                return (
                  <article
                    key={styleItem.id}
                    className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ''}`}
                  >
                    <div className={styles.itemRow}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 68,
                            height: 44,
                            borderRadius: Math.min(12, Math.max(4, Math.round((styleItem.corner_radius ?? 16) / 2))),
                            background: styleItem.default_bg,
                            color: styleItem.default_ink,
                            border: '1px solid rgba(255,255,255,0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.04em',
                            flexShrink: 0,
                          }}
                        >
                          {styleItem.layout_variant.slice(0, 3).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.itemTitle}>{styleItem.name}</div>
                          <div className={styles.inquiryMeta}>
                            <span>Layout: {styleItem.layout_variant}</span>
                            <span>•</span>
                            <span>Font: {styleItem.font_variant}</span>
                            <span>•</span>
                            <span>Radius: {styleItem.corner_radius}px</span>
                          </div>
                          {styleItem.description ? (
                            <p className={styles.cardDesc} style={{ marginTop: 4 }}>
                              {styleItem.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <span className={styles.serviceChip}>
                          {styleItem.is_published ? 'Live on /nfc' : 'Hidden'}
                        </span>
                        <button
                          type="button"
                          className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                          onClick={() => toggleEditNfcStyle(styleItem)}
                        >
                          {isSelected ? 'Close' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleDeleteNfcStyle(styleItem.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {isSelected ? renderNfcStyleForm(true) : null}
                  </article>
                );
              })}
            </div>

            <form onSubmit={handleSaveSettings}>
              <div className={styles.card} style={{ marginBottom: 20 }}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>01 Choose Your Color — Swatch Presets</h2>
                    <p className={styles.cardDesc}>
                      Add, rename, recolor, or remove the preset finish circles shown on /nfc.
                    </p>
                  </div>
                  <div className={styles.btnRow}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          nfc_finishes_json: DEFAULT_NFC_FINISHES,
                        }))
                      }
                    >
                      <RotateCcw size={14} />
                      Reset Swatches
                    </button>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          nfc_finishes_json: [
                            ...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES),
                            { name: 'Custom Finish', background: '#1c2420', ink: '#e3ff97' },
                          ],
                        }))
                      }
                    >
                      <Plus size={14} />
                      Add Swatch
                    </button>
                    <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
                      <Save size={15} />
                      {savingSettings ? 'Saving...' : 'Save /nfc Design'}
                    </button>
                  </div>
                </div>

                <div className={styles.listStack}>
                  {(settings.nfc_finishes_json ?? DEFAULT_NFC_FINISHES).map((swatch, idx) => (
                    <div
                      key={`${swatch.name}-${idx}`}
                      className={styles.formGrid}
                      style={{
                        alignItems: 'end',
                        paddingBottom: 14,
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>Swatch Name</span>
                        <input
                          className={styles.input}
                          value={swatch.name}
                          onChange={(e) =>
                            setSettings((s) => {
                              const next = [...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES)];
                              next[idx] = { ...next[idx], name: e.target.value };
                              return { ...s, nfc_finishes_json: next };
                            })
                          }
                        />
                      </label>
                      <div className={styles.field}>
                        <span className={styles.fieldLabel}>Card Color</span>
                        <div className={styles.colorInputs}>
                          <input
                            type="color"
                            className={styles.colorPicker}
                            value={
                              /^#[0-9a-f]{6}$/i.test(swatch.background)
                                ? swatch.background
                                : '#222b28'
                            }
                            onChange={(e) =>
                              setSettings((s) => {
                                const next = [...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES)];
                                next[idx] = { ...next[idx], background: e.target.value };
                                return { ...s, nfc_finishes_json: next };
                              })
                            }
                          />
                          <input
                            className={styles.input}
                            maxLength={7}
                            value={swatch.background}
                            onChange={(e) =>
                              setSettings((s) => {
                                const next = [...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES)];
                                next[idx] = { ...next[idx], background: e.target.value };
                                return { ...s, nfc_finishes_json: next };
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.field}>
                        <span className={styles.fieldLabel}>Text Ink Color</span>
                        <div className={styles.colorInputs}>
                          <input
                            type="color"
                            className={styles.colorPicker}
                            value={/^#[0-9a-f]{6}$/i.test(swatch.ink) ? swatch.ink : '#ffffff'}
                            onChange={(e) =>
                              setSettings((s) => {
                                const next = [...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES)];
                                next[idx] = { ...next[idx], ink: e.target.value };
                                return { ...s, nfc_finishes_json: next };
                              })
                            }
                          />
                          <input
                            className={styles.input}
                            maxLength={7}
                            value={swatch.ink}
                            onChange={(e) =>
                              setSettings((s) => {
                                const next = [...(s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES)];
                                next[idx] = { ...next[idx], ink: e.target.value };
                                return { ...s, nfc_finishes_json: next };
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          disabled={(settings.nfc_finishes_json ?? []).length <= 1}
                          onClick={() =>
                            setSettings((s) => {
                              const current = s.nfc_finishes_json ?? DEFAULT_NFC_FINISHES;
                              if (current.length <= 1) return s;
                              return {
                                ...s,
                                nfc_finishes_json: current.filter((_, itemIdx) => itemIdx !== idx),
                              };
                            })
                          }
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <h2 className={styles.cardTitle}>/nfc Page Copy & Theme Surfaces</h2>
                    <p className={styles.cardDesc}>
                      Customize the /nfc studio headline, taglines, and surface palette.
                    </p>
                  </div>
                  <div className={styles.btnRow}>
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() =>
                        setSettings((s) => ({
                          ...s,
                          nfc_page_bg: DEFAULT_SITE_SETTINGS.nfc_page_bg,
                          nfc_preview_bg: DEFAULT_SITE_SETTINGS.nfc_preview_bg,
                          nfc_panel_bg: DEFAULT_SITE_SETTINGS.nfc_panel_bg,
                          nfc_page_ink: DEFAULT_SITE_SETTINGS.nfc_page_ink,
                          nfc_page_tagline: DEFAULT_SITE_SETTINGS.nfc_page_tagline,
                          nfc_page_title_prefix: DEFAULT_SITE_SETTINGS.nfc_page_title_prefix,
                          nfc_page_title_em: DEFAULT_SITE_SETTINGS.nfc_page_title_em,
                          nfc_page_subtitle: DEFAULT_SITE_SETTINGS.nfc_page_subtitle,
                          nfc_page_footer_tagline: DEFAULT_SITE_SETTINGS.nfc_page_footer_tagline,
                        }))
                      }
                    >
                      <RotateCcw size={14} />
                      Reset /nfc Defaults
                    </button>
                    <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
                      <Save size={15} />
                      {savingSettings ? 'Saving...' : 'Save /nfc Design'}
                    </button>
                  </div>
                </div>

                <div className={styles.formGrid} style={{ marginBottom: 22 }}>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Header Product Tagline</span>
                    <input
                      className={styles.input}
                      value={settings.nfc_page_tagline}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_page_tagline: e.target.value }))
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Footer Tagline</span>
                    <input
                      className={styles.input}
                      value={settings.nfc_page_footer_tagline}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_page_footer_tagline: e.target.value }))
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Hero Title Line 1</span>
                    <input
                      className={styles.input}
                      value={settings.nfc_page_title_prefix}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_page_title_prefix: e.target.value }))
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.fieldLabel}>Hero Title Highlight</span>
                    <input
                      className={styles.input}
                      value={settings.nfc_page_title_em}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_page_title_em: e.target.value }))
                      }
                    />
                  </label>
                  <label className={`${styles.field} ${styles.fieldFull}`}>
                    <span className={styles.fieldLabel}>Hero Subtitle</span>
                    <input
                      className={styles.input}
                      value={settings.nfc_page_subtitle}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, nfc_page_subtitle: e.target.value }))
                      }
                    />
                  </label>
                </div>

                <div className={styles.colorGrid}>
                  {NFC_COLOR_FIELDS.map((field) => {
                    const value = settings[field.key] ?? DEFAULT_SITE_SETTINGS[field.key];
                    return (
                      <div key={field.key} className={styles.colorItem}>
                        <span className={styles.fieldLabel}>{field.label}</span>
                        <div className={styles.colorInputs}>
                          <input
                            type="color"
                            className={styles.colorPicker}
                            value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#f4f3ee'}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                          <input
                            className={styles.input}
                            value={value}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <span className={styles.colorHint}>{field.hint}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'projects' && (
          <section>
            <div className={styles.toolbar}>
              <div className={styles.btnRow}>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => openProjectForm(createEmptyProject(), null)}
                >
                  <Plus size={15} />
                  Add Project
                </button>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  disabled={savingProject}
                  onClick={handleSeedProjects}
                >
                  <Sparkles size={15} />
                  Import Default 7 Projects
                </button>
              </div>
            </div>

            {projects.length === 0 && (
              <div className={styles.noticeBanner}>
                <span>
                  Your Supabase <code>cms_projects</code> table is currently empty, so the live
                  website displays the 7 built-in portfolio showcase items as fallback. Click{' '}
                  <strong>Import Default 7 Projects</strong> to load them for editing, or add a new
                  project.
                </span>
              </div>
            )}

            {selectedProjectId === null && editingProject ? renderProjectForm(false) : null}

            <div className={styles.itemList}>
              {projects.map((project) => {
                const isSelected = selectedProjectId === project.id;
                return (
                  <article
                    key={project.id}
                    className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ''}`}
                  >
                    <div className={styles.cardActions}>
                      <div>
                        <div className={styles.inquiryName}>
                          {project.client} — {project.title}
                        </div>
                        <div className={styles.inquiryMeta}>
                          <span>{project.category}</span>
                          <span>•</span>
                          <span>{project.year}</span>
                          <span>•</span>
                          <span>Order #{project.sort_order ?? 0}</span>
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <span className={styles.serviceChip}>
                          {project.is_published === false ? 'Draft' : project.kind}
                        </span>
                        <button
                          type="button"
                          className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                          onClick={() => toggleEditProject(project)}
                        >
                          {isSelected ? 'Close' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {isSelected ? renderProjectForm(true) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'services' && (
          <section>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  setSelectedServiceId(null);
                  setEditingService(createEmptyService());
                }}
              >
                <Plus size={15} />
                Add Service
              </button>
            </div>

            {selectedServiceId === null && editingService ? renderServiceForm(false) : null}

            <div className={styles.itemList}>
              {services.map((service) => {
                const key = String(service.id);
                const isSelected = selectedServiceId === key;
                return (
                  <article
                    key={key}
                    className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ''}`}
                  >
                    <div className={styles.cardActions}>
                      <div>
                        <div className={styles.inquiryName}>
                          {service.number_label} · {service.title}
                        </div>
                        <div className={styles.inquiryMeta}>
                          <span>{service.tags}</span>
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <span className={styles.serviceChip}>
                          {service.is_published ? 'Published' : 'Hidden'}
                        </span>
                        <button
                          type="button"
                          className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                          onClick={() => toggleEditService(service)}
                        >
                          {isSelected ? 'Close' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {isSelected ? renderServiceForm(true) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'testimonials' && (
          <section>
            <div className={styles.toolbar}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => {
                  setSelectedTestimonialId(null);
                  setEditingTestimonial(createEmptyTestimonial());
                }}
              >
                <Plus size={15} />
                Add Testimonial
              </button>
            </div>

            {selectedTestimonialId === null && editingTestimonial
              ? renderTestimonialForm(false)
              : null}

            <div className={styles.itemList}>
              {testimonials.map((t) => {
                const key = String(t.id);
                const isSelected = selectedTestimonialId === key;
                return (
                  <article
                    key={key}
                    className={`${styles.itemCard} ${isSelected ? styles.itemCardSelected : ''}`}
                  >
                    <div className={styles.cardActions}>
                      <div className={styles.rowIdentity}>
                        <div className={styles.thumbAvatar}>
                          {t.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={t.avatar_url}
                              alt={t.name}
                              className={styles.thumbAvatarImg}
                            />
                          ) : (
                            t.initials
                          )}
                        </div>
                        <div>
                          <div className={styles.inquiryName}>
                            {t.name} — {t.role}, {t.company}
                          </div>
                          <div className={styles.inquiryMeta}>
                            <span>{t.tag}</span>
                            <span>•</span>
                            <span>Row {t.row_group}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.btnRow}>
                        <span className={styles.serviceChip}>
                          {t.is_published ? 'Published' : 'Hidden'}
                        </span>
                        <button
                          type="button"
                          className={isSelected ? styles.primaryBtn : styles.secondaryBtn}
                          onClick={() => toggleEditTestimonial(t)}
                        >
                          {isSelected ? 'Close' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          className={styles.dangerBtn}
                          onClick={() => handleDeleteTestimonial(t.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    {isSelected ? renderTestimonialForm(true) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>

      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.kind === 'success' ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
        >
          <CheckCircle2 size={16} />
          <span>{toast.text}</span>
        </div>
      ) : null}
    </div>
  );
}
