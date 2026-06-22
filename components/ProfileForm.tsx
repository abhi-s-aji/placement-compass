'use client';

import { useState, useTransition } from 'react';
import { Profile } from '@/lib/types';
import { updateProfileAction } from '@/app/actions/student';

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [input, setInput] = useState('');

  function addSkill() {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  }

  function removeSkill(skill: string) {
    onChange(skills.filter(s => s !== skill));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
    if (e.key === 'Backspace' && !input && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  }

  return (
    <div
      className="skills-container"
      onClick={() => document.getElementById('skill-input')?.focus()}
    >
      {skills.map(skill => (
        <span key={skill} className="skill-tag">
          {skill}
          <button className="skill-tag-remove" onClick={() => removeSkill(skill)} type="button">
            &times;
          </button>
        </span>
      ))}
      <input
        id="skill-input"
        className="skills-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addSkill}
        placeholder={skills.length === 0 ? 'Type a skill and press Enter...' : ''}
      />
    </div>
  );
}

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name ?? '',
    college: profile.college ?? '',
    department: profile.department ?? '',
    graduation_year: profile.graduation_year?.toString() ?? '',
    skills: profile.skills ?? [],
    resume_url: profile.resume_url ?? '',
    github_username: profile.github_username ?? '',
    linkedin_url: profile.linkedin_url ?? '',
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const CURRENT_YEAR = new Date().getFullYear();
  const GRAD_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

  function handleChange(field: string, value: string | string[]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await updateProfileAction({
        full_name: formData.full_name,
        college: formData.college,
        department: formData.department,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        skills: formData.skills,
        resume_url: formData.resume_url,
        github_username: formData.github_username,
        linkedin_url: formData.linkedin_url,
      });

      if (!res.success) {
        setMessage({ type: 'error', text: res.error || 'Failed to save. Please try again.' });
      } else {
        setMessage({ type: 'success', text: 'Profile saved successfully.' });
        setTimeout(() => setMessage(null), 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {message && (
        <div className={`alert alert-${message.type} mb-5`}>
          {message.type === 'success'
            ? <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            : <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          }
          {message.text}
        </div>
      )}

      {/* Personal Info */}
      <div className="card mb-5">
        <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="card-title">Personal Information</div>
            <div className="card-subtitle">Your basic profile details</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              className="input"
              value={formData.full_name}
              onChange={e => handleChange('full_name', e.target.value)}
              placeholder="Arjun Sharma"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="college">College / University</label>
              <input
                id="college"
                className="input"
                value={formData.college}
                onChange={e => handleChange('college', e.target.value)}
                placeholder="IIT Bombay"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                id="department"
                className="input"
                value={formData.department}
                onChange={e => handleChange('department', e.target.value)}
                placeholder="Computer Science and Engineering"
              />
            </div>
          </div>

          <div className="form-group" style={{ maxWidth: 200 }}>
            <label className="form-label" htmlFor="graduation_year">Graduation Year</label>
            <select
              id="graduation_year"
              className="input select"
              value={formData.graduation_year}
              onChange={e => handleChange('graduation_year', e.target.value)}
            >
              <option value="">Select year</option>
              {GRAD_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Career Info */}
      <div className="card mb-5">
        <div className="card-header" style={{ marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="card-title">Career Information</div>
            <div className="card-subtitle">Links and skills for placement</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Skills</label>
            <SkillsInput
              skills={formData.skills}
              onChange={skills => handleChange('skills', skills)}
            />
            <span className="form-hint">Type a skill and press Enter or comma to add</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="resume_url">Resume URL</label>
            <input
              id="resume_url"
              className="input"
              type="url"
              value={formData.resume_url}
              onChange={e => handleChange('resume_url', e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
            />
            <span className="form-hint">Link to your resume (Google Drive, Notion, etc.)</span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="github_username">GitHub Username</label>
              <div className="relative">
                <span style={{
                  position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', pointerEvents: 'none'
                }}>github.com/</span>
                <input
                  id="github_username"
                  className="input"
                  style={{ paddingLeft: '7.5rem' }}
                  value={formData.github_username}
                  onChange={e => handleChange('github_username', e.target.value)}
                  placeholder="yourusername"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="linkedin_url">LinkedIn URL</label>
              <input
                id="linkedin_url"
                className="input"
                type="url"
                value={formData.linkedin_url}
                onChange={e => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? <><span className="spinner spinner-sm" />Saving...</> : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
