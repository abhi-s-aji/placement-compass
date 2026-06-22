'use client';

import { useState } from 'react';
import Link from 'next/link';
import { register } from '@/app/actions/auth';

const CURRENT_YEAR = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR + i);

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await register(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className="auth-card animate-slide-up" style={{ maxWidth: '460px' }}>
        <div className="auth-logo">
          <div className="auth-logo-mark">
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M10 5v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="auth-logo-text">
            <h1>Placement Compass</h1>
            <p>Track. Improve. Get Placement Ready.</p>
          </div>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Start tracking your placement readiness today</p>

        {error && (
          <div className="alert alert-error mb-4">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full name <span className="form-required">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="input"
              placeholder="Arjun Sharma"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address <span className="form-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="arjun@college.edu"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="college">College</label>
              <input
                id="college"
                name="college"
                type="text"
                className="input"
                placeholder="IIT Bombay"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                className="input"
                placeholder="Computer Science"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="graduationYear">Graduation Year</label>
            <select id="graduationYear" name="graduationYear" className="input select">
              <option value="">Select year</option>
              {GRAD_YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>


          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password <span className="form-required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm password <span className="form-required">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              placeholder="Repeat your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
