'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/lib/types';
import { updateReadinessScoreAction } from '@/app/actions/progress';

interface ProjectsClientProps {
  userId: string;
  initialProjects: Project[];
}

const EMPTY_FORM = {
  title: '',
  description: '',
  technologies: [] as string[],
  github_url: '',
  live_url: '',
};

function TechInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  function add() {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput('');
  }

  return (
    <div className="skills-container">
      {value.map(t => (
        <span key={t} className="skill-tag">
          {t}
          <button type="button" className="skill-tag-remove" onClick={() => onChange(value.filter(x => x !== t))}>&times;</button>
        </span>
      ))}
      <input
        className="skills-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={value.length === 0 ? 'e.g. React, Node.js, PostgreSQL...' : ''}
      />
    </div>
  );
}

export default function ProjectsClient({ userId, initialProjects }: ProjectsClientProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  function openAdd() {
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setForm({
      title: project.title,
      description: project.description ?? '',
      technologies: project.technologies ?? [],
      github_url: project.github_url ?? '',
      live_url: project.live_url ?? '',
    });
    setError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingProject(null);
    setForm({ ...EMPTY_FORM });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError('Project title is required.'); return; }
    setError('');

    startTransition(async () => {
      const supabase = createClient();

      if (editingProject) {
        const { data, error: err } = await supabase
          .from('projects')
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editingProject.id)
          .select()
          .single();

        if (err) { setError(err.message); return; }
        const updatedProjects = projects.map(p => p.id === editingProject.id ? (data as Project) : p);
        try {
          const score = Math.min(updatedProjects.length * 33, 100);
          await updateReadinessScoreAction('projects', score);
        } catch (e) { console.error('Failed to update score', e); }
        setProjects(updatedProjects);
      } else {
        const { data, error: err } = await supabase
          .from('projects')
          .insert({ ...form, user_id: userId })
          .select()
          .single();

        if (err) { setError(err.message); return; }
        const updatedProjects = [...projects, data as Project];
        try {
          const score = Math.min(updatedProjects.length * 33, 100);
          await updateReadinessScoreAction('projects', score);
        } catch (e) { console.error('Failed to update score', e); }
        setProjects(updatedProjects);
      }

      closeModal();
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    const supabase = createClient();
    const { error: err } = await supabase.from('projects').delete().eq('id', id);
    if (!err) {
      setProjects(prev => {
        const updated = prev.filter(p => p.id !== id);
        try {
          const score = Math.min(updated.length * 33, 100);
          updateReadinessScoreAction('projects', score).catch(e => console.error('Failed to update score', e));
        } catch (e) {}
        return updated;
      });
      router.refresh();
    }
    setDeleteId(null);
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button className="btn btn-primary" onClick={openAdd}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-description">Add your first project to showcase your work to mentors and track your progress.</div>
            <button className="btn btn-primary mt-4" onClick={openAdd}>Add your first project</button>
          </div>
        </div>
      ) : (
        <div className="grid-auto">
          {projects.map(project => (
            <div key={project.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-md font-semibold text-primary">{project.title}</h3>
                <div className="flex gap-1">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(project)} title="Edit">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 14, height: 14 }}>
                      <path d="M11 5l4 4-7 7H4v-4l7-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleDelete(project.id)}
                    disabled={deleteId === project.id}
                    title="Delete"
                    style={{ color: 'var(--color-error)' }}
                  >
                    {deleteId === project.id
                      ? <span className="spinner spinner-sm" />
                      : <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" style={{ width: 14, height: 14 }}>
                          <path d="M6 2h8M3 5h14M8 5v9M12 5v9M4 5l1 12h10l1-12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    }
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{project.description}</p>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="badge badge-muted">{tech}</span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" strokeLinecap="round" />
                      <path d="M8 14c0 2 1 3 2 3s2-1 2-3" strokeLinecap="round" />
                    </svg>
                    GitHub
                  </a>
                )}
                {project.live_url && (
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
                      <path d="M11 3h6v6M17 3l-8 8M9 5H5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{editingProject ? 'Edit Project' : 'Add Project'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="form-group">
                  <label className="form-label">Project Title <span className="form-required">*</span></label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="My Portfolio Website" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="input textarea" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this project do? What problem does it solve?" rows={3} />
                </div>

                <div className="form-group">
                  <label className="form-label">Technologies Used</label>
                  <TechInput value={form.technologies} onChange={v => setForm(f => ({ ...f, technologies: v }))} />
                  <span className="form-hint">Type a technology and press Enter to add</span>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input className="input" type="url" value={form.github_url} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Live Demo URL</label>
                    <input className="input" type="url" value={form.live_url} onChange={e => setForm(f => ({ ...f, live_url: e.target.value }))} placeholder="https://myproject.vercel.app" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? <><span className="spinner spinner-sm" />Saving...</> : editingProject ? 'Save changes' : 'Add project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
