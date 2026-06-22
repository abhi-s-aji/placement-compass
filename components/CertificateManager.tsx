'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  getCertificatesAction,
  addCertificateAction,
  updateCertificateAction,
  deleteCertificateAction,
} from '@/app/actions/student';
import { Certificate } from '@/lib/supabase/hybrid-db';

export default function CertificateManager() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    credential_url: '',
    file_url: '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setIsLoading(true);
    const res = await getCertificatesAction();
    if (res.success && res.data) {
      setCertificates(res.data);
    }
    setIsLoading(false);
  }

  function handleOpenAdd() {
    setEditingId(null);
    setFormData({
      name: '',
      issuing_organization: '',
      issue_date: '',
      credential_url: '',
      file_url: '',
    });
    setIsFormOpen(true);
  }

  function handleOpenEdit(cert: Certificate) {
    setEditingId(cert.id);
    setFormData({
      name: cert.name,
      issuing_organization: cert.issuing_organization,
      issue_date: cert.issue_date || '',
      credential_url: cert.credential_url || '',
      file_url: cert.file_url || '',
    });
    setIsFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!formData.name || !formData.issuing_organization) {
      setMessage({ type: 'error', text: 'Certificate Name and Issuing Organization are required.' });
      return;
    }

    startTransition(async () => {
      let res;
      if (editingId) {
        res = await updateCertificateAction(editingId, formData);
      } else {
        res = await addCertificateAction(
          formData.name,
          formData.issuing_organization,
          formData.issue_date,
          formData.credential_url,
          formData.file_url
        );
      }

      if (res.success) {
        setMessage({
          type: 'success',
          text: editingId ? 'Certificate updated successfully.' : 'Certificate added successfully.',
        });
        setIsFormOpen(false);
        fetchCertificates();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Operation failed.' });
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this certificate?')) return;

    const res = await deleteCertificateAction(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Certificate deleted successfully.' });
      fetchCertificates();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete.' });
    }
  }

  return (
    <div className="card mb-5">
      <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div>
          <div className="card-title">Certificates</div>
          <div className="card-subtitle">Manage your verified achievements and credentials</div>
        </div>
        {!isFormOpen && (
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" type="button">
            + Add Certificate
          </button>
        )}
      </div>

      {message && (
        <div className={`alert alert-${message.type} mb-4`}>
          {message.type === 'success' ? (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-5 p-4" style={{ backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-md font-semibold mb-4 text-primary">
            {editingId ? 'Edit Certificate' : 'Add New Certificate'}
          </h3>
          <div className="flex flex-col gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="cert-name">
                Certificate Name <span className="form-required">*</span>
              </label>
              <input
                id="cert-name"
                className="input"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Google Cloud Certified Professional Architect"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="cert-org">
                  Issuing Organization <span className="form-required">*</span>
                </label>
                <input
                  id="cert-org"
                  className="input"
                  value={formData.issuing_organization}
                  onChange={e => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
                  placeholder="Google Cloud"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cert-date">
                  Issue Date (e.g., June 2026)
                </label>
                <input
                  id="cert-date"
                  className="input"
                  value={formData.issue_date}
                  onChange={e => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                  placeholder="June 2026"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cert-url">
                Credential URL
              </label>
              <input
                id="cert-url"
                className="input"
                type="url"
                value={formData.credential_url}
                onChange={e => setFormData(prev => ({ ...prev, credential_url: e.target.value }))}
                placeholder="https://credentials.google.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cert-file-url">
                Description or PDF Link
              </label>
              <input
                id="cert-file-url"
                className="input"
                value={formData.file_url}
                onChange={e => setFormData(prev => ({ ...prev, file_url: e.target.value }))}
                placeholder="AWS Solution Architect Associate Certification details..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFormOpen(false)}
                disabled={isPending}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Certificate'}
              </button>
            </div>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-6">
          <span className="spinner spinner-md" />
        </div>
      ) : certificates.length === 0 ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          No certificates uploaded yet. Click "+ Add Certificate" to upload your achievements.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map(cert => (
            <div
              key={cert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                <h4 className="text-sm font-semibold text-primary">{cert.name}</h4>
                <p className="text-xs text-secondary mt-1">
                  Issued by: <strong className="text-primary">{cert.issuing_organization}</strong>
                  {cert.issue_date && ` • ${cert.issue_date}`}
                </p>
                {cert.file_url && (
                  <p className="text-xs text-muted mt-2" style={{ fontStyle: 'italic' }}>
                    {cert.file_url}
                  </p>
                )}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <span>View Credential</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 12, height: 12 }}>
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => handleOpenEdit(cert)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '4px 8px' }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
