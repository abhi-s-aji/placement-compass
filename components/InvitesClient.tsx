'use client';

import { useState, useTransition } from 'react';
import { createMentorInviteAction } from '@/app/actions/auth';
import { formatDate } from '@/lib/score';

interface Invite {
  id: string;
  token: string;
  role: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

interface InvitesClientProps {
  initialInvites: Invite[];
}

export default function InvitesClient({ initialInvites }: InvitesClientProps) {
  const [invites, setInvites] = useState<Invite[]>(initialInvites);
  const [newInviteLink, setNewInviteLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreateInvite() {
    setError(null);
    setNewInviteLink(null);
    startTransition(async () => {
      const res = await createMentorInviteAction();
      if (res.success && res.inviteLink) {
        const fullLink = window.location.origin + res.inviteLink;
        setNewInviteLink(fullLink);
        if (res.data) {
          setInvites(prev => [res.data as Invite, ...prev]);
        }
      } else {
        setError(res.error || 'Failed to generate invite token');
      }
    });
  }

  function handleCopy(link: string, token: string) {
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Invites</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Generate Invite Card */}
        <div className="card mb-6" style={{ maxWidth: '600px' }}>
          <h2 className="card-title mb-2">Generate Invitation</h2>
          <p className="card-subtitle mb-4">Create a secure registration link to invite faculty or industry mentors.</p>
          
          {error && <div className="alert alert-error mb-4">{error}</div>}
          
          {newInviteLink && (
            <div className="alert alert-success mb-4" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-2)' }}>
              <div className="font-semibold text-xs">Invite link created successfully!</div>
              <div className="flex gap-2 items-center">
                <input 
                  type="text" 
                  readOnly 
                  value={newInviteLink} 
                  className="input text-xs" 
                  style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-primary)' }}
                />
                <button 
                  onClick={() => handleCopy(newInviteLink, 'new')} 
                  className="btn btn-secondary btn-sm"
                >
                  {copiedToken === 'new' ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={handleCreateInvite} 
            disabled={isPending}
            className="btn btn-primary"
            style={{ display: 'flex', gap: 'var(--space-2)' }}
          >
            {isPending ? 'Generating...' : 'Generate Invite Link'}
          </button>
        </div>

        {/* Existing Invites Table */}
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>TOKEN / INVITE LINK</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ROLE</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>EXPIRES</th>
                <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CREATED</th>
              </tr>
            </thead>
            <tbody>
              {invites.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No invites generated yet.
                  </td>
                </tr>
              ) : (
                invites.map((invite) => {
                  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/accept-invite?token=${invite.token}`;
                  const isExpired = new Date(invite.expires_at) < new Date();
                  const status = invite.used 
                    ? 'used' 
                    : isExpired 
                    ? 'expired' 
                    : 'active';

                  return (
                    <tr key={invite.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }} className="table-row-hover">
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div className="flex gap-2 items-center">
                          <code style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px', backgroundColor: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                            {invite.token.substring(0, 8)}...
                          </code>
                          {!invite.used && !isExpired && (
                            <button 
                              onClick={() => handleCopy(inviteUrl, invite.token)}
                              className="btn btn-ghost btn-xs"
                              style={{ fontSize: '10px' }}
                            >
                              {copiedToken === invite.token ? 'Copied!' : 'Copy Link'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                        {invite.role}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span className={`badge ${
                          status === 'used' 
                            ? 'badge-muted' 
                            : status === 'expired' 
                            ? 'badge-error' 
                            : 'badge-success'
                        }`}>
                          {status === 'used' ? 'Used' : status === 'expired' ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                        {formatDate(invite.expires_at)}
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                        {formatDate(invite.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
