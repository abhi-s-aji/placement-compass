export default function Unauthorized() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-primary, #0a0a0a)',
        fontFamily: 'var(--font-family, system-ui)',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          backgroundColor: 'var(--color-bg-secondary, #111)',
          border: '1px solid var(--color-error, #ef4444)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '2.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 700,
            color: 'var(--color-error, #ef4444)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          403
        </div>
        <h1
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #fff)',
            marginBottom: '0.75rem',
          }}
        >
          Access Denied
        </h1>
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #aaa)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          You do not have permission to access this area. Admin privileges are
          required.
        </p>
        <a
          href="/student"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1.25rem',
            backgroundColor: 'var(--color-primary, #6366f1)',
            color: '#fff',
            borderRadius: 'var(--radius-md, 8px)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  );
}
