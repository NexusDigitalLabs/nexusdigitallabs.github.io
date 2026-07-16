'use client';

type Props = {
  signedIn: boolean;
  optIn: boolean;
  status: string;
  message: string | null;
  loginHref: string;
  onEnable: () => void;
  onDisable: (deleteRemote: boolean) => void;
  onSaveNow: () => void;
};

/** Compact opt-in bar for Invoice / Debt cloud drafts. */
export default function CloudDraftBar({
  signedIn,
  optIn,
  status,
  message,
  loginHref,
  onEnable,
  onDisable,
  onSaveNow,
}: Props) {
  return (
    <div
      className="mb-6 p-4 border text-sm"
      style={{
        borderColor: 'var(--ndl-border)',
        background: 'var(--ndl-surface-2)',
        color: 'var(--ndl-muted)',
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--ndl-faint)' }}>
            Cloud draft
          </p>
          <p className="text-xs font-light leading-relaxed m-0" style={{ color: 'var(--ndl-muted)' }}>
            Off by default. When on (signed in), a copy of this form syncs to your account so you can resume on another device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {signedIn && (
            <span
              className="text-[10px] font-semibold tracking-wide uppercase px-2 py-1"
              style={{ color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)' }}
            >
              Signed in
            </span>
          )}
          {!signedIn && (
            <a
              href={loginHref}
              className="no-underline px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
              style={{
                color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.45)',
                background: 'rgba(99,102,241,0.12)',
              }}
            >
              Sign in
            </a>
          )}
          {signedIn && !optIn && (
            <button
              type="button"
              onClick={onEnable}
              className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase cursor-pointer border-0"
              style={{ color: '#fff', background: '#6366f1' }}
            >
              Enable cloud draft
            </button>
          )}
          {signedIn && optIn && (
            <>
              <button
                type="button"
                onClick={onSaveNow}
                disabled={status === 'saving'}
                className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase cursor-pointer border-0"
                style={{
                  color: '#fff',
                  background: '#4ade80',
                  opacity: status === 'saving' ? 0.6 : 1,
                }}
              >
                {status === 'saving' ? 'Saving…' : 'Save now'}
              </button>
              <button
                type="button"
                onClick={() => onDisable(false)}
                className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase cursor-pointer bg-transparent"
                style={{ color: 'var(--ndl-muted)', border: '1px solid var(--ndl-border)' }}
              >
                Turn off
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Delete the cloud copy of this draft from your account?')) {
                    onDisable(true);
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold tracking-wide uppercase cursor-pointer bg-transparent"
                style={{ color: '#fca5a5', border: '1px solid rgba(248,113,113,0.35)' }}
              >
                Delete cloud draft
              </button>
            </>
          )}
        </div>
      </div>
      {message && (
        <p className="text-[11px] mt-2 mb-0" style={{ color: status === 'error' ? '#f87171' : 'var(--ndl-faint)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
