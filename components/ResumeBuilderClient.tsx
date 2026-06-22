'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveFullResumeDetailsAction } from '@/app/actions/student';
import { Profile } from '@/lib/types';
import { Certificate, ExtraProfileDetails } from '@/lib/supabase/hybrid-db';

interface ResumeBuilderClientProps {
  initialProfile: Profile;
  initialProjects: any[];
  initialCertificates: Certificate[];
  initialExtra: ExtraProfileDetails;
}

export default function ResumeBuilderClient({
  initialProfile,
  initialProjects,
  initialCertificates,
  initialExtra,
}: ResumeBuilderClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'templates' | 'personal' | 'experience' | 'projects' | 'certificates' | 'achievements'>('personal');
  const [isPending, startTransition] = useTransition();

  // ----------------------------------------------------
  // PROFILE & RESUME FORM DATA STATES
  // ----------------------------------------------------
  const [profileForm, setProfileForm] = useState({
    full_name: initialProfile.full_name || '',
    college: initialProfile.college || '',
    department: initialProfile.department || '',
    graduation_year: initialProfile.graduation_year?.toString() || '',
    skills: initialProfile.skills || [],
    github_username: initialProfile.github_username || '',
    linkedin_url: initialProfile.linkedin_url || '',
  });

  const [extraForm, setExtraForm] = useState({
    phone: initialExtra.phone || '',
    education: initialExtra.education || [],
    experience: initialExtra.experience || [],
    achievements: initialExtra.achievements || [],
  });

  const [projectsForm, setProjectsForm] = useState<any[]>(
    initialProjects.map(p => ({
      title: p.title || '',
      technologies: p.technologies || [],
      github_url: p.github_url || '',
      live_url: p.live_url || '',
      description: p.description || '',
    }))
  );

  const [certificatesForm, setCertificatesForm] = useState<any[]>(
    initialCertificates.map(c => ({
      name: c.name || '',
      issuing_organization: c.issuing_organization || '',
      issue_date: c.issue_date || '',
      credential_url: c.credential_url || '',
      file_url: c.file_url || '',
    }))
  );

  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ----------------------------------------------------
  // ACTIONS HANDLERS
  // ----------------------------------------------------

  function handleSave() {
    startTransition(async () => {
      const res = await saveFullResumeDetailsAction({
        profile: {
          ...profileForm,
          graduation_year: profileForm.graduation_year ? parseInt(profileForm.graduation_year) : null,
        },
        extra: extraForm,
        projects: projectsForm,
        certificates: certificatesForm,
      });

      if (res.success) {
        setMessage({ type: 'success', text: 'Resume builder changes saved successfully!' });
        router.refresh();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save changes.' });
      }
    });
  }

  function handlePrint() {
    window.print();
  }

  // Form manipulation helpers
  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !profileForm.skills.includes(trimmed)) {
      setProfileForm(p => ({ ...p, skills: [...p.skills, trimmed] }));
    }
    setSkillInput('');
  }

  function removeSkill(skill: string) {
    setProfileForm(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  }

  function addExperience() {
    setExtraForm(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', duration: '', description: '' }],
    }));
  }

  function updateExperience(index: number, field: string, value: string) {
    setExtraForm(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }

  function removeExperience(index: number) {
    setExtraForm(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function addProject() {
    setProjectsForm(prev => [
      ...prev,
      { title: '', technologies: [], github_url: '', live_url: '', description: '' },
    ]);
  }

  function updateProject(index: number, field: string, value: any) {
    setProjectsForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeProject(index: number) {
    setProjectsForm(prev => prev.filter((_, i) => i !== index));
  }

  function addCertificate() {
    setCertificatesForm(prev => [
      ...prev,
      { name: '', issuing_organization: '', issue_date: '', credential_url: '', file_url: '' },
    ]);
  }

  function updateCertificate(index: number, field: string, value: string) {
    setCertificatesForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  function removeCertificate(index: number) {
    setCertificatesForm(prev => prev.filter((_, i) => i !== index));
  }

  function addAchievement() {
    setExtraForm(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  }

  function updateAchievement(index: number, value: string) {
    setExtraForm(prev => {
      const updated = [...prev.achievements];
      updated[index] = value;
      return { ...prev, achievements: updated };
    });
  }

  function removeAchievement(index: number) {
    setExtraForm(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  }

  // ----------------------------------------------------
  // TEMPLATES RENDER PIPELINE
  // ----------------------------------------------------

  function renderSkillsBlock() {
    if (profileForm.skills.length === 0) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Skills
        </h3>
        <p style={{ margin: 0, fontSize: '10.5px', color: '#111', lineHeight: 1.4 }}>
          <strong>Core Technologies & Tools:</strong> {profileForm.skills.join(', ')}
        </p>
      </div>
    );
  }

  function renderEducationBlock() {
    const hasEdu = extraForm.education && extraForm.education.length > 0;
    if (!profileForm.college && !hasEdu) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Education
        </h3>
        {hasEdu ? (
          extraForm.education.map((edu: any, index: number) => (
            <div key={index} style={{ marginBottom: '0.3rem', fontSize: '10.5px', color: '#111' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.institution || 'College / University'}</span>
                <span>{edu.graduationYear}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#222' }}>
                {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}
              </div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: '10.5px', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{profileForm.college || 'College / University'}</span>
              <span>{profileForm.graduation_year || 'Year'}</span>
            </div>
            <div style={{ fontStyle: 'italic', color: '#222' }}>
              {profileForm.department || 'Department'}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderExperienceBlock() {
    if (extraForm.experience.length === 0) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Work Experience
        </h3>
        {extraForm.experience.map((exp: any, index: number) => (
          <div key={index} style={{ marginBottom: '0.4rem', fontSize: '10.5px', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>{exp.company}</span>
              <span style={{ fontWeight: 'normal' }}>{exp.duration}</span>
            </div>
            <div style={{ fontStyle: 'italic', color: '#222', fontWeight: '600' }}>{exp.role}</div>
            <p style={{ margin: '0.15rem 0 0 0', color: '#222', whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{exp.description}</p>
          </div>
        ))}
      </div>
    );
  }

  function renderProjectsBlock() {
    if (projectsForm.length === 0) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Projects
        </h3>
        {projectsForm.map((proj, index) => (
          <div key={index} style={{ marginBottom: '0.4rem', fontSize: '10.5px', color: '#111' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>
                {proj.title}
                {proj.technologies?.length > 0 && (
                  <span style={{ fontWeight: 'normal', color: '#333', fontSize: '9.5px', marginLeft: '0.4rem' }}>
                    ({proj.technologies.join(', ')})
                  </span>
                )}
              </span>
              <span style={{ fontWeight: 'normal', fontSize: '9.5px' }}>
                {proj.github_url && <a href={proj.github_url} style={{ color: '#111', textDecoration: 'underline', marginRight: '0.4rem' }}>Code</a>}
                {proj.live_url && <a href={proj.live_url} style={{ color: '#111', textDecoration: 'underline' }}>Live</a>}
              </span>
            </div>
            <p style={{ margin: '0.15rem 0 0 0', color: '#222', lineHeight: 1.4 }}>{proj.description}</p>
          </div>
        ))}
      </div>
    );
  }

  function renderCertificationsBlock() {
    if (certificatesForm.length === 0) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Certifications
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1rem', listStyleType: 'square', fontSize: '10.5px', color: '#111' }}>
          {certificatesForm.map((cert, index) => (
            <li key={index} style={{ marginBottom: '0.2rem' }}>
              <strong>{cert.name}</strong> ({cert.issuing_organization}) {cert.issue_date && `– ${cert.issue_date}`}
              {cert.credential_url && (
                <a href={cert.credential_url} style={{ color: '#111', textDecoration: 'underline', marginLeft: '0.4rem', fontSize: '9.5px' }}>
                  Verify
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function renderAchievementsBlock() {
    const cleanAchievements = extraForm.achievements.filter(Boolean);
    if (cleanAchievements.length === 0) return null;
    return (
      <div className="section-block" style={{ marginBottom: '1rem' }}>
        <h3 className="section-header" style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #111', paddingBottom: '2px', marginBottom: '0.3rem', color: 'black' }}>
          Achievements
        </h3>
        <ul style={{ margin: 0, paddingLeft: '1rem', listStyleType: 'disc', fontSize: '10.5px', color: '#111' }}>
          {cleanAchievements.map((ach: string, index: number) => (
            <li key={index} style={{ marginBottom: '0.2rem' }}>{ach}</li>
          ))}
        </ul>
      </div>
    );
  }

  function renderSection(sectionName: string) {
    switch (sectionName) {
      case 'education':
        return renderEducationBlock();
      case 'skills':
        return renderSkillsBlock();
      case 'experience':
        return renderExperienceBlock();
      case 'projects':
        return renderProjectsBlock();
      case 'certifications':
        return renderCertificationsBlock();
      case 'achievements':
        return renderAchievementsBlock();
      default:
        return null;
    }
  }

  function renderResumeSheet() {
    const sequentialSections = ['education', 'skills', 'experience', 'projects', 'certifications', 'achievements'];

    return (
      <div
        className="resume-sheet"
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '11px',
          width: '100%',
          backgroundColor: 'white',
          color: 'black',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-sm)',
          lineHeight: 1.4,
        }}
      >
        <div className="resume-header" style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 className="resume-name" style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: 'black', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {profileForm.full_name || 'Your Name'}
          </h2>
          <div className="resume-contact" style={{ fontSize: '10px', color: '#333', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.4rem', alignItems: 'center' }}>
            <span>{initialProfile.email}</span>
            {extraForm.phone && <span>• {extraForm.phone}</span>}
            {profileForm.linkedin_url && <span>• <a href={profileForm.linkedin_url} style={{ color: '#111', textDecoration: 'underline' }}>LinkedIn</a></span>}
            {profileForm.github_username && <span>• <a href={`https://github.com/${profileForm.github_username}`} style={{ color: '#111', textDecoration: 'underline' }}>GitHub</a></span>}
          </div>
        </div>

        {sequentialSections.map(secName => (
          <div key={secName}>{renderSection(secName)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in no-print-wrapper" style={{ minHeight: 'calc(100vh - var(--header-height))', display: 'flex', flexDirection: 'column' }}>
      {/* Dynamic Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, html {
            background-color: white !important;
            color: black !important;
          }
          .sidebar, .page-header, .no-print, button, nav, .alert {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: black !important;
          }
          .page-body {
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 !important;
          }
          .resume-preview-container {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .resume-preview-container * {
            color: black !important;
            border-color: #333 !important;
          }
          .resume-sheet {
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            background: white !important;
          }
        }
      `}} />

      <div className="page-header no-print">
        <div className="page-header-left">
          <h1 className="page-header-title">Resume Builder</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" style={{ height: '32px' }} onClick={handleSave} disabled={isPending}>
            Save Resume
          </button>
          <button className="btn btn-secondary" style={{ height: '32px' }} onClick={handlePrint}>
            Download PDF
          </button>
          <button className="btn btn-primary" style={{ height: '32px' }} onClick={handlePrint}>
            Print Resume
          </button>
        </div>
      </div>

      <div className="page-body" style={{ flex: 1, display: 'flex', gap: 'var(--space-6)', minHeight: 0 }}>
        {/* Left Form Panels */}
        <div className="no-print" style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: 0 }}>
          {message && (
            <div className={`alert alert-${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="card card-sm flex" style={{ flexDirection: 'row', gap: '0.25rem', overflowX: 'auto', padding: '0.5rem' }}>
            <button onClick={() => setActiveTab('templates')} className={`btn btn-sm ${activeTab === 'templates' ? 'btn-primary' : 'btn-ghost'}`}>
              Choose Template
            </button>
            <button onClick={() => setActiveTab('personal')} className={`btn btn-sm ${activeTab === 'personal' ? 'btn-primary' : 'btn-ghost'}`}>
              1. Personal Info
            </button>
            <button onClick={() => setActiveTab('experience')} className={`btn btn-sm ${activeTab === 'experience' ? 'btn-primary' : 'btn-ghost'}`}>
              2. Work & Skills
            </button>
            <button onClick={() => setActiveTab('projects')} className={`btn btn-sm ${activeTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}>
              3. Projects
            </button>
            <button onClick={() => setActiveTab('certificates')} className={`btn btn-sm ${activeTab === 'certificates' ? 'btn-primary' : 'btn-ghost'}`}>
              4. Certifications
            </button>
            <button onClick={() => setActiveTab('achievements')} className={`btn btn-sm ${activeTab === 'achievements' ? 'btn-primary' : 'btn-ghost'}`}>
              5. Achievements
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
            {/* TAB 0: TEMPLATES SELECTOR GRID */}
            {activeTab === 'templates' && (
              <div className="card flex flex-col gap-4">
                <h3 className="text-md font-semibold text-primary">Choose Template</h3>
                <p className="text-xs text-muted">A clean, high-performance ATS friendly template is selected by default for maximum compatibility.</p>
                <div style={{ border: '2px solid var(--color-brand)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', backgroundColor: 'var(--color-brand-subtle)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Clean ATS Basic Resume</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Highly optimized for automated applicant tracking systems. Uses standard structure, professional spacing, and standard styling.</div>
                  <button type="button" className="btn btn-xs btn-primary" style={{ width: 'fit-content', pointerEvents: 'none' }}>Active & Selected</button>
                </div>
              </div>
            )}

            {/* TAB 1: PERSONAL */}
            {activeTab === 'personal' && (
              <div className="card flex flex-col gap-4">
                <h3 className="text-md font-semibold text-primary">Personal Details</h3>
                <div className="form-group">
                  <label className="form-label" htmlFor="p-name">Full Name</label>
                  <input id="p-name" className="input" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-phone">Phone Number</label>
                    <input id="p-phone" className="input" value={extraForm.phone} onChange={e => setExtraForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-grad">Graduation Year</label>
                    <input id="p-grad" className="input" value={profileForm.graduation_year} onChange={e => setProfileForm(p => ({ ...p, graduation_year: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-college">College / University</label>
                    <input id="p-college" className="input" value={profileForm.college} onChange={e => setProfileForm(p => ({ ...p, college: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-dept">Department</label>
                    <input id="p-dept" className="input" value={profileForm.department} onChange={e => setProfileForm(p => ({ ...p, department: e.target.value }))} />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-github">GitHub Username</label>
                    <input id="p-github" className="input" value={profileForm.github_username} onChange={e => setProfileForm(p => ({ ...p, github_username: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="p-linkedin">LinkedIn URL</label>
                    <input id="p-linkedin" className="input" value={profileForm.linkedin_url} onChange={e => setProfileForm(p => ({ ...p, linkedin_url: e.target.value }))} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WORK & SKILLS */}
            {activeTab === 'experience' && (
              <div className="card flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-primary">Work Experience</h3>
                  <button className="btn btn-secondary btn-sm" onClick={addExperience}>+ Add Experience</button>
                </div>

                {extraForm.experience.map((exp: any, index: number) => (
                  <div key={index} style={{ border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Company Name</label>
                        <input className="input" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <input className="input" value={exp.role} onChange={e => updateExperience(index, 'role', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (e.g. June 2024 - Present)</label>
                      <input className="input" value={exp.duration} onChange={e => updateExperience(index, 'duration', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description & Achievements</label>
                      <textarea className="input" rows={3} value={exp.description} onChange={e => updateExperience(index, 'description', e.target.value)} />
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => removeExperience(index)}>Remove Experience</button>
                  </div>
                ))}

                <div className="card-divider" />

                <h3 className="text-md font-semibold text-primary">Core Skills</h3>
                <div className="flex gap-2">
                  <input className="input" placeholder="e.g. React" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} />
                  <button className="btn btn-secondary" onClick={addSkill}>Add Skill</button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {profileForm.skills.map((skill: string) => (
                    <span key={skill} className="badge badge-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      {skill}
                      <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: 10 }}>&times;</button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PROJECTS */}
            {activeTab === 'projects' && (
              <div className="card flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-primary">Projects</h3>
                  <button className="btn btn-secondary btn-sm" onClick={addProject}>+ Add Project</button>
                </div>

                {projectsForm.map((proj, index) => (
                  <div key={index} style={{ border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Project Title</label>
                        <input className="input" value={proj.title} onChange={e => updateProject(index, 'title', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Technologies (comma separated)</label>
                        <input className="input" value={proj.technologies.join(', ')} onChange={e => updateProject(index, 'technologies', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))} />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">GitHub Link</label>
                        <input className="input" value={proj.github_url} onChange={e => updateProject(index, 'github_url', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Live Preview Link</label>
                        <input className="input" value={proj.live_url} onChange={e => updateProject(index, 'live_url', e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Description</label>
                      <textarea className="input" rows={3} value={proj.description} onChange={e => updateProject(index, 'description', e.target.value)} />
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => removeProject(index)}>Remove Project</button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: CERTIFICATIONS */}
            {activeTab === 'certificates' && (
              <div className="card flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-primary">Certifications</h3>
                  <button className="btn btn-secondary btn-sm" onClick={addCertificate}>+ Add Certification</button>
                </div>

                {certificatesForm.map((cert, index) => (
                  <div key={index} style={{ border: '1px solid var(--color-border)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Certification Name</label>
                        <input className="input" value={cert.name} onChange={e => updateCertificate(index, 'name', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issuing Organization</label>
                        <input className="input" value={cert.issuing_organization} onChange={e => updateCertificate(index, 'issuing_organization', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Issue Date</label>
                        <input className="input" value={cert.issue_date} onChange={e => updateCertificate(index, 'issue_date', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Verification Credential URL</label>
                        <input className="input" value={cert.credential_url} onChange={e => updateCertificate(index, 'credential_url', e.target.value)} />
                      </div>
                    </div>
                    <button className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => removeCertificate(index)}>Remove Certification</button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 5: ACHIEVEMENTS */}
            {activeTab === 'achievements' && (
              <div className="card flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-semibold text-primary">Achievements</h3>
                  <button className="btn btn-secondary btn-sm" onClick={addAchievement}>+ Add Achievement</button>
                </div>
                {extraForm.achievements.map((ach: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input className="input" placeholder="e.g. Smart India Hackathon Winner" value={ach} onChange={e => updateAchievement(index, e.target.value)} />
                    <button className="btn btn-danger btn-sm" onClick={() => removeAchievement(index)}>Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Sheet */}
        <div style={{ flex: '1.8', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="resume-preview-container" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-tertiary)', display: 'flex', justifyContent: 'center', height: '100%', overflowY: 'auto' }}>
            {renderResumeSheet()}
          </div>
        </div>
      </div>
    </div>
  );
}
