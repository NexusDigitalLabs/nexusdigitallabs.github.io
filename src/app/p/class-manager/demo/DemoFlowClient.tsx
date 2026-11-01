'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CLASS_MANAGER, MODULES, type ClientType } from '@/lib/class-manager-pricing';

/* Sample data only — shown to prospective clients, never real students. */

type ScreenProps = { done: boolean; onAction: () => void };
type DemoStep = {
  id: string;
  title: string;
  who: string;
  /** Highlighted item in the app's navigation. */
  section: string;
  path: string;
  caption: string;
  /** Quote module this step needs, so the demo never implies a paid feature is included. */
  addOn?: string;
  Screen: (props: ScreenProps) => React.ReactElement;
};

function addOnName(id: string): string {
  return MODULES.find((m) => m.id === id)?.name ?? id;
}

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ndl-accent)]';
const primaryBtn = `rounded-lg bg-[var(--ndl-accent)] px-4 py-2 text-sm font-semibold ndl-on-accent hover:opacity-90 disabled:opacity-50 ${focus}`;
const ghostBtn = `rounded-lg border border-[var(--ndl-border)] px-4 py-2 text-sm font-semibold text-[var(--ndl-text)] hover:bg-[var(--ndl-surface-2)] disabled:opacity-40 ${focus}`;

/* ───────────────────────── Shared bits ───────────────────────── */

function Pill({ tone, children }: { tone: 'ok' | 'warn' | 'bad' | 'info'; children: React.ReactNode }) {
  const tones = {
    ok: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    warn: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    bad: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    info: 'bg-[var(--ndl-accent)]/15 text-[var(--ndl-accent)]',
  };
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]}`}>{children}</span>;
}

function Done({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
      <span aria-hidden="true">✓ </span>
      {children}
    </p>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'bad' }) {
  return (
    <div className="rounded-lg border border-[var(--ndl-border)] p-3">
      <p className="text-[11px] text-[var(--ndl-muted)]">{label}</p>
      <p className={`font-mono text-lg font-semibold tabular-nums ${tone === 'bad' ? 'text-rose-500' : 'text-[var(--ndl-text)]'}`}>{value}</p>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-[var(--ndl-border)] text-[11px] uppercase tracking-wide text-[var(--ndl-muted)]">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-[var(--ndl-border)] last:border-0">
              {r.map((c, j) => (
                <td key={j} className="py-2 pr-3 align-middle tabular-nums text-[var(--ndl-text-secondary)]">{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--ndl-muted)]">{label}</p>
      <p className="rounded-md border border-[var(--ndl-input-border)] bg-[var(--ndl-input-bg)] px-2.5 py-1.5 text-[13px] text-[var(--ndl-text)]">{value}</p>
    </div>
  );
}

/* ───────────────────────── Tutor screens ───────────────────────── */

function RegisterScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-3">
      <p className="text-base font-semibold text-[var(--ndl-text)]">Join Combined Maths 2027 A/L</p>
      <Field label="Student name" value="Nethmi Perera" />
      <Field label="Grade and stream" value="Grade 12 · Physical Science" />
      <Field label="Parent's mobile" value="077 123 4567" />
      <Field label="Class" value="Theory + Paper class · Online" />
      {done ? (
        <Done>Registered. Student ID CM27-0148. Welcome notification sent to parent.</Done>
      ) : (
        <button type="button" className={primaryBtn} onClick={onAction}>Register</button>
      )}
    </div>
  );
}

function PaySlipScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-3">
      <div className="rounded-lg bg-[var(--ndl-surface-2)] p-3">
        <p className="text-[11px] text-[var(--ndl-muted)]">November fee · Combined Maths</p>
        <p className="font-mono text-2xl font-bold tabular-nums text-[var(--ndl-text)]">LKR 2,500</p>
        <p className="text-xs text-[var(--ndl-muted)]">Due 5 November</p>
      </div>
      <div className="text-xs text-[var(--ndl-muted)]">
        Pay to <span className="text-[var(--ndl-text)]">Sample Bank · 1234 5678 9012</span>, then upload the slip.
      </div>
      <div className="grid h-28 place-items-center rounded-lg border-2 border-dashed border-[var(--ndl-border)] text-center text-xs text-[var(--ndl-muted)]">
        <span>
          <span className="block text-2xl" aria-hidden="true">🧾</span>
          slip_nov_nethmi.jpg · 412 KB
        </span>
      </div>
      {done ? (
        <p role="status" className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">Slip sent. Waiting for the tutor to approve.</p>
      ) : (
        <button type="button" className={primaryBtn} onClick={onAction}>Submit slip</button>
      )}
    </div>
  );
}

function ApproveScreen({ done, onAction }: ScreenProps) {
  const rows: Array<[string, string, boolean]> = [
    ['Nethmi Perera', 'Today 9:14 am', done],
    ['Sahan Wickramasinghe', 'Today 8:02 am', false],
    ['Dulani Herath', 'Yesterday', false],
  ];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">Payment slips to check</p>
        <Pill tone="warn">{done ? 2 : 3} waiting</Pill>
      </div>
      <Table
        head={['Student', 'Amount', 'Sent', 'Status', '']}
        rows={rows.map(([name, sent, paid], i) => [
          name,
          'LKR 2,500',
          sent,
          paid ? <Pill tone="ok">Paid</Pill> : <Pill tone="warn">Check slip</Pill>,
          i === 0 && !paid ? (
            <button type="button" className={`${primaryBtn} px-3 py-1 text-xs`} onClick={onAction}>Approve</button>
          ) : (
            ''
          ),
        ])}
      />
      {done && <Done>Nethmi marked paid. Receipt sent: &quot;Payment received for November.&quot;</Done>}
    </div>
  );
}

function ClassAccessScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-3">
      <div className="rounded-lg border border-[var(--ndl-accent)]/50 bg-[var(--ndl-accent)]/10 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-[var(--ndl-muted)]">Today · 6:30 pm</p>
          <Pill tone="ok">Paid</Pill>
        </div>
        <p className="font-semibold text-[var(--ndl-text)]">Integration, part 3</p>
        {done ? (
          <p role="status" className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Opening Zoom… (demo)</p>
        ) : (
          <button type="button" className={`${primaryBtn} mt-2 w-full`} onClick={onAction}>Join class</button>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Coming up</p>
      {[
        ['Sat · 8:00 am', 'Paper 08 discussion'],
        ['Tue · 6:30 pm', 'Integration, part 4'],
        ['Thu · 6:30 pm', 'Differential equations'],
      ].map(([when, name]) => (
        <div key={name} className="flex items-center justify-between rounded-lg bg-[var(--ndl-surface-2)] px-3 py-2 text-[13px] text-[var(--ndl-text)]">
          {name} <span className="text-[11px] text-[var(--ndl-muted)]">{when}</span>
        </div>
      ))}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Notes and papers</p>
      {[
        ['Integration, part 3 · notes', '2.1 MB'],
        ['Paper 08 · questions', '840 KB'],
        ['Paper 07 · marking scheme', '1.3 MB'],
      ].map(([name, size]) => (
        <div key={name} className="flex items-center justify-between rounded-lg bg-[var(--ndl-surface-2)] px-3 py-2 text-[13px] text-[var(--ndl-text)]">
          <span>
            <span className="mr-1.5 rounded bg-rose-500/15 px-1 text-[10px] font-semibold text-rose-500">PDF</span>
            {name}
          </span>
          <span className="text-[11px] text-[var(--ndl-muted)]">{size}</span>
        </div>
      ))}
      <p className="text-[11px] text-[var(--ndl-muted)]">Signed in on this phone only. Logging in elsewhere signs this device out.</p>
      <div className="rounded-lg border border-rose-500/40 p-3 text-xs text-[var(--ndl-muted)]">
        <span className="font-semibold text-rose-500">What an unpaid student sees: </span>
        the class link and notes stay locked until the fee is approved.
      </div>
    </div>
  );
}

function MarksScreen({ done, onAction }: ScreenProps) {
  const marks: Array<[string, number]> = [
    ['Dulani Herath', 92],
    ['Nethmi Perera', 87],
    ['Sahan Wickramasinghe', 81],
    ['Ishara Gunasekara', 76],
    ['Ravindu Senanayake', 68],
  ];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">Paper 08 · Combined Maths</p>
        <span className="text-xs text-[var(--ndl-muted)]">62 students sat · average 71</span>
      </div>
      <Table
        head={['Rank', 'Student', 'Marks', 'Change']}
        rows={marks.map(([n, m], i) => [`#${i + 1}`, n, `${m} / 100`, i % 2 ? <Pill tone="bad">▼ 3</Pill> : <Pill tone="ok">▲ {5 - i}</Pill>])}
      />
      {done ? (
        <Done>Results and ranks sent to 62 students and parents.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Publish results</button>
      )}
    </div>
  );
}

function ReportScreen({ done, onAction }: ScreenProps) {
  const months: Array<[string, number]> = [
    ['Jun', 96000],
    ['Jul', 108500],
    ['Aug', 121000],
    ['Sep', 118000],
    ['Oct', 134500],
    ['Nov', 142500],
  ];
  const max = 150000;
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 @xl:grid-cols-3">
        <Stat label="Collected in November" value="LKR 142,500" />
        <Stat label="Still to collect" value="LKR 17,500" tone="bad" />
        <Stat label="Active students" value="64" />
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Fees collected, last 6 months (LKR)</p>
        <div className="flex h-32 items-end gap-2" role="img" aria-label="Fees collected rose from LKR 96,000 in June to LKR 142,500 in November">
          {months.map(([m, v], i) => (
            <div key={m} className="flex flex-1 flex-col items-center gap-1">
              <span className="font-mono text-[10px] tabular-nums text-[var(--ndl-muted)]">{Math.round(v / 1000)}k</span>
              <div
                className={`w-full rounded-t ${i === months.length - 1 ? 'bg-[var(--ndl-accent)]' : 'bg-[var(--ndl-accent)]/35'}`}
                style={{ height: `${(v / max) * 90}px` }}
              />
              <span className="text-[10px] text-[var(--ndl-muted)]">{m}</span>
            </div>
          ))}
        </div>
      </div>
      {done ? (
        <Done>Fee reminders sent to the 7 students who haven&apos;t paid.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Remind 7 unpaid students</button>
      )}
    </div>
  );
}

/* ───────────────────────── Institute screens ───────────────────────── */

function DashboardScreen({ done, onAction }: ScreenProps) {
  const classes: Array<[string, string, string, string]> = [
    ['8:00 am', 'Physics 2026 A/L', 'Mr. Silva', 'Hall A'],
    ['8:00 am', 'O/L Maths, Grade 11', 'Ms. Ranasinghe', 'Hall B'],
    ['10:30 am', 'Chemistry 2027 A/L', 'Mrs. Jayawardena', 'Hall A'],
    ['1:00 pm', 'Combined Maths 2026', 'Mr. Bandara', 'Hall C'],
  ];
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2 @2xl:grid-cols-4">
        <Stat label="Collected today" value="LKR 186,000" />
        <Stat label="Students present" value="412 / 455" />
        <Stat label="Fees still due" value="LKR 42,500" tone="bad" />
        <Stat label="Classes today" value="14" />
      </div>
      <Table head={['Time', 'Class', 'Teacher', 'Hall']} rows={classes} />
      {done ? (
        <Done>Daily summary sent to the owner&apos;s phone.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Send me today&apos;s summary</button>
      )}
    </div>
  );
}

function CounterScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-4">
      <Field label="Search student, ID or phone" value="Kavindu" />
      <div className="rounded-lg border border-[var(--ndl-border)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-semibold text-[var(--ndl-text)]">Kavindu Rajapaksha</p>
            <p className="text-xs text-[var(--ndl-muted)]">ID IN-2026-0311 · Grade 13</p>
          </div>
          {done ? <Pill tone="ok">All paid</Pill> : <Pill tone="bad">2 fees due</Pill>}
        </div>
        <div className="mt-3">
          <Table
            head={['Class', 'Month', 'Fee']}
            rows={[
              ['Physics 2026 A/L', 'November', 'LKR 2,500'],
              ['Combined Maths 2026', 'November', 'LKR 2,500'],
            ]}
          />
        </div>
      </div>
      {done ? (
        <Done>Receipt R-10482 printed. Parent notified: &quot;LKR 5,000 received for November.&quot;</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Collect LKR 5,000 cash</button>
      )}
    </div>
  );
}

function TimetableScreen({ done, onAction }: ScreenProps) {
  const slots = ['8–10 am', '10:30–12:30', '1–3 pm', '3:30–5:30'];
  const halls: Array<[string, string[]]> = [
    ['Hall A', ['Physics 2026', 'Chemistry 2027', 'Physics 2027', 'Physics revision']],
    ['Hall B', ['O/L Maths', '', 'O/L Science', 'English']],
    ['Hall C', ['', 'ICT 2026', 'Combined Maths', done ? 'Biology 2027' : '']],
  ];
  return (
    <div className="grid gap-4">
      <p className="font-semibold text-[var(--ndl-text)]">Saturday timetable</p>
      <div className="overflow-x-auto">
        <div className="grid min-w-[480px] grid-cols-[70px_repeat(4,minmax(0,1fr))] gap-1 text-[12px]">
          <span />
          {slots.map((s) => (
            <span key={s} className="px-1 text-[11px] text-[var(--ndl-muted)]">{s}</span>
          ))}
          {halls.map(([hall, cells]) => (
            <div key={hall} className="contents">
              <span className="self-center font-semibold text-[var(--ndl-text)]">{hall}</span>
              {cells.map((c, i) => (
                <span
                  key={i}
                  className={`min-h-10 rounded-md px-2 py-1.5 ${
                    c ? (c === 'Biology 2027' ? 'bg-emerald-500/20 text-[var(--ndl-text)]' : 'bg-[var(--ndl-accent)]/15 text-[var(--ndl-text)]') : 'border border-dashed border-[var(--ndl-border)]'
                  }`}
                >
                  {c}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-[13px] text-[var(--ndl-text-secondary)]">
        Biology 2027 asked for Hall A at 3:30 pm. <b className="text-[var(--ndl-text)]">Hall A is taken by Physics revision (Mr. Silva).</b> Hall C is free at that time.
      </div>
      {done ? (
        <Done>Biology 2027 booked in Hall C, 3:30–5:30. Students notified of the hall.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Book Hall C instead</button>
      )}
    </div>
  );
}

function ParentScreen({ done, onAction }: ScreenProps) {
  const msgs = [
    'Kavindu checked in to Physics 2026 at 7:52 am.',
    'Payment of LKR 5,000 received for November. Receipt R-10482.',
    'Paper 08 results: Kavindu scored 84/100, rank 12 of 148.',
  ];
  return (
    <div className="grid gap-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Messages to parent · 077 987 6543</p>
      {msgs.map((m) => (
        <p key={m} className="max-w-[92%] rounded-2xl rounded-tl-sm bg-[var(--ndl-surface-2)] px-3 py-2 text-[13px] text-[var(--ndl-text)]">{m}</p>
      ))}
      {done ? (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Attendance" value="96%" />
          <Stat label="Fees due" value="0" />
          <Stat label="Last paper" value="84" />
        </div>
      ) : (
        <button type="button" className={primaryBtn} onClick={onAction}>Open parent portal</button>
      )}
    </div>
  );
}

/* ───────────────────────── Shared feature screens ───────────────────────── */

type StudentRow = { name: string; id: string; cls: string; phone: string; paid: boolean };

function makeStudentsScreen(rows: StudentRow[], profile: { attendance: string; lastMark: string; since: string }) {
  return function StudentsScreen({ done, onAction }: ScreenProps) {
    const [filter, setFilter] = useState<'all' | 'paid' | 'due'>('all');
    const shown = rows.filter((r) => filter === 'all' || (filter === 'paid' ? r.paid : !r.paid));
    const first = rows[0];
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-[var(--ndl-text)]">Students</p>
          <span className="rounded-md border border-[var(--ndl-input-border)] bg-[var(--ndl-input-bg)] px-3 py-1.5 text-[13px] text-[var(--ndl-muted)]">
            Search name, ID or phone
          </span>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter students">
          {(['all', 'paid', 'due'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${focus} ${
                filter === f ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'bg-[var(--ndl-surface-2)] text-[var(--ndl-muted)]'
              }`}
            >
              {f === 'all' ? `All (${rows.length})` : f === 'paid' ? 'Paid this month' : 'Fee due'}
            </button>
          ))}
        </div>
        <Table
          head={['Student', 'ID', 'Class', 'Parent', 'November']}
          rows={shown.map((r) => [r.name, r.id, r.cls, r.phone, r.paid ? <Pill tone="ok">Paid</Pill> : <Pill tone="bad">Due</Pill>])}
        />
        {done ? (
          <div className="grid gap-3 rounded-lg border border-[var(--ndl-accent)]/40 p-4 @xl:grid-cols-[1fr_2fr]">
            <div>
              <p className="font-semibold text-[var(--ndl-text)]">{first.name}</p>
              <p className="text-xs text-[var(--ndl-muted)]">{first.id} · student since {profile.since}</p>
              <p className="mt-2 text-xs text-[var(--ndl-muted)]">Parent {first.phone}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat label="Attendance" value={profile.attendance} />
              <Stat label="Last paper" value={profile.lastMark} />
              <Stat label="Fees due" value="LKR 0" />
            </div>
          </div>
        ) : (
          <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>
            Open {first.name.split(' ')[0]}&apos;s profile
          </button>
        )}
      </div>
    );
  };
}

type RollRow = [name: string, present: boolean, note: string];

function makeAttendanceScreen(title: string, source: string, rows: RollRow[]) {
  return function AttendanceScreen({ done, onAction }: ScreenProps) {
    const [marks, setMarks] = useState(rows.map((r) => r[1]));
    const absent = marks.filter((m) => !m).length;
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-[var(--ndl-text)]">{title}</p>
          <span className="text-xs text-[var(--ndl-muted)]">{source}</span>
        </div>
        <div className="grid gap-1.5">
          {rows.map(([name, , note], i) => (
            <div key={name} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--ndl-surface-2)] px-3 py-2 text-[13px]">
              <span className="min-w-0 text-[var(--ndl-text)]">
                {name}
                <span className="block text-[11px] text-[var(--ndl-muted)]">{note}</span>
              </span>
              <button
                type="button"
                disabled={done}
                onClick={() => setMarks((m) => m.map((v, j) => (j === i ? !v : v)))}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${focus} ${
                  marks[i] ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {marks[i] ? 'Present' : 'Absent'}
              </button>
            </div>
          ))}
        </div>
        {done ? (
          <Done>Attendance saved. Parents of {absent} absent student{absent === 1 ? '' : 's'} were notified.</Done>
        ) : (
          <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>
            Save attendance ({marks.length - absent} present, {absent} absent)
          </button>
        )}
      </div>
    );
  };
}

function makeExportScreen(month: string) {
  const sets = ['Students and parents', 'Payments and receipts', 'Attendance', 'Exam marks'];
  return function ExportScreen({ done, onAction }: ScreenProps) {
    const [picked, setPicked] = useState(sets);
    const [format, setFormat] = useState<'Excel' | 'CSV'>('Excel');
    const ext = format === 'Excel' ? 'xlsx' : 'csv';
    return (
      <div className="grid gap-4">
        <p className="font-semibold text-[var(--ndl-text)]">Export your data</p>
        <p className="text-[13px] text-[var(--ndl-muted)]">Your data is yours. Download it any time, for your accountant or your own records.</p>
        <div className="grid gap-2 @xl:grid-cols-2">
          {sets.map((s) => (
            <label key={s} className="flex items-center gap-2 rounded-lg border border-[var(--ndl-border)] px-3 py-2 text-[13px] text-[var(--ndl-text)]">
              <input
                type="checkbox"
                checked={picked.includes(s)}
                onChange={() => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))}
                className="h-4 w-4 accent-[var(--ndl-accent)]"
              />
              {s}
            </label>
          ))}
        </div>
        <div className="flex gap-1 self-start rounded-lg border border-[var(--ndl-border)] p-1" role="radiogroup" aria-label="File format">
          {(['Excel', 'CSV'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={format === f}
              onClick={() => setFormat(f)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${focus} ${format === f ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'text-[var(--ndl-muted)]'}`}
            >
              {f}
            </button>
          ))}
        </div>
        {done ? (
          <Done>
            {picked.length} file{picked.length === 1 ? '' : 's'} ready: {picked.map((p) => `${p.split(' ')[0].toLowerCase()}_${month}.${ext}`).join(', ')} (demo, nothing downloads)
          </Done>
        ) : (
          <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction} disabled={picked.length === 0}>
            Export {month} data
          </button>
        )}
      </div>
    );
  };
}

/* ───────────────────────── More tutor screens ───────────────────────── */

function ClassesScreen({ done, onAction }: ScreenProps) {
  const rows: React.ReactNode[][] = [
    ['Combined Maths 2026 · Theory', 'Mon & Wed 6:30 pm', <Pill key="o1" tone="info">Online</Pill>, 38, 'LKR 2,500'],
    ['Combined Maths 2027 · Theory', 'Tue & Thu 6:30 pm', <Pill key="o2" tone="info">Online</Pill>, 26, 'LKR 2,500'],
    ['Paper class 2026', 'Sun 8:00 am', <Pill key="o3" tone="warn">Physical</Pill>, 41, 'LKR 1,500'],
  ];
  rows.push(['One-to-one · Nethmi, Sahan', 'Wed 4 pm, Sat 10 am', <Pill key="o5" tone="ok">One-to-one</Pill>, 2, 'LKR 1,500 / lesson']);
  if (done) rows.push(['Revision 2026 (extra)', 'Sat 4:00 pm', <Pill key="o4" tone="info">Online</Pill>, 38, 'Free']);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">Classes and batches</p>
        <span className="text-xs text-[var(--ndl-muted)]">{done ? 5 : 4} classes · 66 students</span>
      </div>
      <Table head={['Class', 'When', 'Mode', 'Students', 'Monthly fee']} rows={rows} />
      {done ? (
        <Done>Extra revision class added for Saturday 4 pm. All 38 students in the batch were notified.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Add an extra revision class</button>
      )}
    </div>
  );
}

function CardPayScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between rounded-lg bg-[var(--ndl-surface-2)] p-3">
        <div>
          <p className="text-[11px] text-[var(--ndl-muted)]">December fee · Combined Maths</p>
          <p className="font-mono text-xl font-bold tabular-nums text-[var(--ndl-text)]">LKR 2,500</p>
        </div>
        <Pill tone="warn">Due 5 Dec</Pill>
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--ndl-border)] p-1 text-center text-xs font-semibold">
        <span className="rounded-md bg-[var(--ndl-accent)] py-1.5 ndl-on-accent">Card</span>
        <span className="py-1.5 text-[var(--ndl-muted)]">Bank slip</span>
      </div>
      <Field label="Card number (sample)" value="4111 1111 1111 1111" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Expiry" value="12 / 28" />
        <Field label="CVV" value="•••" />
      </div>
      {done ? (
        <Done>Paid. Receipt R-2311 sent and December classes unlocked straight away, no slip to check.</Done>
      ) : (
        <button type="button" className={primaryBtn} onClick={onAction}>Pay LKR 2,500</button>
      )}
      <p className="text-center text-[11px] text-[var(--ndl-muted)]">Card details go to the payment gateway, never to your system.</p>
    </div>
  );
}

function AppNotificationsScreen({ done, onAction }: ScreenProps) {
  const notes = [
    ['now', 'Class in 30 minutes', 'Integration, part 3 starts at 6:30 pm. Tap to join.'],
    ['2h ago', 'Paper 08 results are out', 'You scored 87/100 and ranked 2nd of 62.'],
    ['Yesterday', 'December fee due on 5 Dec', 'Pay LKR 2,500 in the app to keep your class access.'],
  ];
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-3">
        <p className="text-center font-mono text-3xl font-semibold text-white/90" aria-hidden="true">6:00</p>
        <p className="mb-3 text-center text-[11px] text-white/60">Wednesday 3 December</p>
        <div className="grid gap-2">
          {notes.map(([when, title, body]) => (
            <div key={title} className="rounded-xl bg-white/90 p-2.5 text-slate-900">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="grid h-4 w-4 place-items-center rounded bg-blue-600 text-[7px] font-bold text-white">CM</span>
                  {CLASS_MANAGER.productName}
                </span>
                {when}
              </div>
              <p className="mt-1 text-[13px] font-semibold">{title}</p>
              <p className="text-[12px] text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>
      {done ? (
        <Done>Opened the class page in the app, with the Join button ready.</Done>
      ) : (
        <button type="button" className={primaryBtn} onClick={onAction}>Tap the class reminder</button>
      )}
    </div>
  );
}

/* ───────────────────────── More institute screens ───────────────────────── */

function StaffScreen({ done, onAction }: ScreenProps) {
  const rows: React.ReactNode[][] = [
    ['Mrs. Anoma Perera', 'Owner', 'Everything'],
    ['Chamara Kumara', 'Admin', 'Students, classes, timetable'],
    ['Sanduni Alwis', 'Counter staff', 'Fees and receipts only'],
    ['Mr. Silva', 'Teacher', 'His own classes, attendance and marks'],
  ];
  if (done) rows.push(['Nadeesha Fonseka', 'Counter staff', <Pill key="inv" tone="warn">Invite sent</Pill>]);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">Staff and permissions</p>
        <span className="text-xs text-[var(--ndl-muted)]">Every action is logged with who did it</span>
      </div>
      <Table head={['Name', 'Role', 'Can see and change']} rows={rows} />
      {done ? (
        <Done>Invite sent to Nadeesha. She can take payments but can&apos;t see reports or delete records.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Invite new counter staff</button>
      )}
    </div>
  );
}

function BrandingScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-4">
      <p className="font-semibold text-[var(--ndl-text)]">Your brand</p>
      <div className="grid gap-4 @xl:grid-cols-2">
        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-500 text-lg font-bold text-white" aria-hidden="true">BF</span>
            <span className="text-[13px] text-[var(--ndl-text)]">
              Bright Future Institute
              <span className="block text-[11px] text-[var(--ndl-muted)]">Logo shown on the app, receipts and ID cards</span>
            </span>
          </div>
          <div>
            <p className="mb-1 text-[11px] text-[var(--ndl-muted)]">Colours</p>
            <div className="flex gap-2" aria-hidden="true">
              {['bg-amber-500', 'bg-slate-800', 'bg-emerald-600'].map((c) => (
                <span key={c} className={`h-7 w-7 rounded-full ${c} ring-2 ring-[var(--ndl-border)]`} />
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Field label="Your web address" value="classes.brightfuture.lk" />
          {done ? <Pill tone="ok">Connected · secure (https)</Pill> : <Pill tone="warn">Not connected yet</Pill>}
        </div>
      </div>
      {done ? (
        <Done>Live. Students and parents now sign in at classes.brightfuture.lk with your logo.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Connect web address</button>
      )}
    </div>
  );
}

const TutorStudents = makeStudentsScreen(
  [
    { name: 'Nethmi Perera', id: 'CM27-0148', cls: '2027 Theory', phone: '077 123 4567', paid: true },
    { name: 'Sahan Wickramasinghe', id: 'CM26-0091', cls: '2026 Theory', phone: '071 555 0192', paid: true },
    { name: 'Dulani Herath', id: 'CM26-0077', cls: '2026 Theory + Paper', phone: '076 220 8813', paid: false },
    { name: 'Ishara Gunasekara', id: 'CM27-0120', cls: '2027 Theory', phone: '070 441 2290', paid: true },
    { name: 'Ravindu Senanayake', id: 'CM26-0102', cls: 'Paper class', phone: '075 903 1174', paid: false },
  ],
  { attendance: '94%', lastMark: '87', since: 'Oct 2026' },
);

const InstituteStudents = makeStudentsScreen(
  [
    { name: 'Kavindu Rajapaksha', id: 'IN26-0311', cls: 'Physics, Combined Maths', phone: '077 987 6543', paid: true },
    { name: 'Tharushi Wijesinghe', id: 'IN26-0287', cls: 'Physics 2026', phone: '071 330 4521', paid: true },
    { name: 'Kasun Abeysekara', id: 'IN26-0302', cls: 'Physics 2026', phone: '072 118 9034', paid: false },
    { name: 'Hiruni Dissanayake', id: 'IN27-0044', cls: 'Chemistry 2027', phone: '076 772 1408', paid: true },
    { name: 'Pasindu Jayasuriya', id: 'IN-OL-0219', cls: 'O/L Maths, Grade 11', phone: '070 615 3382', paid: false },
  ],
  { attendance: '96%', lastMark: '84', since: 'Jan 2025' },
);

const TutorAttendance = makeAttendanceScreen('Combined Maths 2027 · Wed 26 Nov', 'Filled in from who tapped Join class in the portal', [
  ['Nethmi Perera', true, 'Joined 6:28 pm · stayed 1h 58m'],
  ['Ishara Gunasekara', true, 'Joined 6:31 pm · stayed 2h 01m'],
  ['Sahan Wickramasinghe', false, 'Did not join'],
  ['Dulani Herath', true, 'Joined 6:45 pm · left early, 1h 10m'],
]);

const InstituteAttendance = makeAttendanceScreen('Physics 2026 · Hall A · Sat 29 Nov', 'Teacher marks the roll on a phone or tablet', [
  ['Kavindu Rajapaksha', true, 'Front row'],
  ['Tharushi Wijesinghe', true, ''],
  ['Kasun Abeysekara', false, 'Fee due, sent to counter'],
  ['Hiruni Dissanayake', true, ''],
  ['Pasindu Jayasuriya', false, 'Sick note from parent'],
]);

const TutorExport = makeExportScreen('nov');
const InstituteExport = makeExportScreen('nov');

/* ───────────────────────── Planner screens (from Mentto) ───────────────────────── */

function TodayScreen({ done, onAction }: ScreenProps) {
  const lessons: Array<[string, string, string]> = [
    ['4:00 pm', 'Nethmi Perera', 'One-to-one · Home visit'],
    ['6:30 pm', 'Combined Maths 2027', 'Group · Online · 26 students'],
    ['8:45 pm', 'Sahan Wickramasinghe', 'One-to-one · Online'],
  ];
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Lessons today" value="3" />
        <Stat label="To collect" value="LKR 7,500" tone="bad" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Today, Wednesday 26 November</p>
      {lessons.map(([time, who, what], i) => (
        <div key={time} className="flex items-center gap-3 rounded-lg bg-[var(--ndl-surface-2)] px-3 py-2.5">
          <span className="w-16 shrink-0 font-mono text-[12px] text-[var(--ndl-text)]">{time}</span>
          <span className="min-w-0 flex-1 text-[13px] text-[var(--ndl-text)]">
            {who}
            <span className="block text-[11px] text-[var(--ndl-muted)]">{what}</span>
          </span>
          {i === 0 && done ? <Pill tone="ok">Attended</Pill> : i === 0 ? <Pill tone="info">Next</Pill> : null}
        </div>
      ))}
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ndl-muted)]">Fees to collect</p>
      <div className="flex items-center justify-between rounded-lg border border-rose-500/30 px-3 py-2 text-[13px] text-[var(--ndl-text)]">
        Dulani Herath · 2 months <Pill tone="bad">LKR 5,000</Pill>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[var(--ndl-border)] px-3 py-2 text-[13px] text-[var(--ndl-text)]">
        Ravindu Senanayake · due Friday <Pill tone="warn">LKR 2,500</Pill>
      </div>
      {done ? (
        <Done>Nethmi&apos;s 4 pm lesson marked attended.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Mark 4 pm lesson attended</button>
      )}
    </div>
  );
}

function ScheduleScreen({ done, onAction }: ScreenProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const slots: Record<string, Array<{ t: string; label: string; one?: boolean; moved?: boolean; cancelled?: boolean }>> = {
    Mon: [{ t: '6:30', label: '2026 Theory' }],
    Tue: [{ t: '6:30', label: '2027 Theory' }],
    Wed: [{ t: '4:00', label: 'Nethmi', one: true }, { t: '6:30', label: '2026 Theory' }],
    Thu: [{ t: '6:30', label: '2027 Theory', cancelled: done }],
    Fri: done ? [{ t: '6:30', label: '2027 Theory', moved: true }] : [],
    Sat: [{ t: '10:00', label: 'Sahan', one: true }, { t: '4:00', label: 'Revision' }],
  };
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">This week · 24–29 Nov</p>
        <span className="flex gap-2 text-[11px] text-[var(--ndl-muted)]">
          <Pill tone="info">Group</Pill>
          <Pill tone="ok">One-to-one</Pill>
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[480px] grid-cols-6 gap-1.5">
          {days.map((d) => (
            <div key={d} className="grid content-start gap-1.5">
              <span className="text-center text-[11px] font-semibold text-[var(--ndl-muted)]">{d}</span>
              {slots[d].map((s) => (
                <span
                  key={s.t + s.label}
                  className={`rounded-md px-1.5 py-1.5 text-[11px] leading-tight ${
                    s.cancelled
                      ? 'border border-dashed border-rose-500/50 text-rose-500 line-through'
                      : s.moved
                        ? 'bg-amber-500/20 text-[var(--ndl-text)]'
                        : s.one
                          ? 'bg-emerald-500/15 text-[var(--ndl-text)]'
                          : 'bg-[var(--ndl-accent)]/15 text-[var(--ndl-text)]'
                  }`}
                >
                  <span className="block font-mono">{s.t}</span>
                  {s.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-[var(--ndl-muted)]">Weekly slots repeat on their own. Move or cancel one lesson without touching the rest.</p>
      {done ? (
        <Done>Thursday&apos;s 2027 class moved to Friday this week only. Next week is unchanged, and students were notified.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Move this Thursday&apos;s class to Friday</button>
      )}
    </div>
  );
}

function FeePlansScreen({ done, onAction }: ScreenProps) {
  const [plan, setPlan] = useState<'month' | 'term' | 'lesson'>('month');
  const plans = { month: 'LKR 2,500 a month', term: 'LKR 7,000 a term (3 months)', lesson: 'LKR 1,500 a lesson' };
  return (
    <div className="grid gap-4">
      <p className="font-semibold text-[var(--ndl-text)]">Dulani Herath · fee plan</p>
      <div className="grid gap-2 @xl:grid-cols-3" role="radiogroup" aria-label="Fee plan">
        {(Object.keys(plans) as Array<keyof typeof plans>).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={plan === p}
            onClick={() => setPlan(p)}
            className={`rounded-lg border-2 px-3 py-2 text-left text-[13px] ${focus} ${
              plan === p ? 'border-[var(--ndl-accent)] bg-[var(--ndl-accent)]/10 text-[var(--ndl-text)]' : 'border-[var(--ndl-border)] text-[var(--ndl-muted)]'
            }`}
          >
            <span className="block font-semibold">{p === 'month' ? 'Monthly' : p === 'term' ? 'Per term' : 'Per lesson'}</span>
            {plans[p]}
          </button>
        ))}
      </div>
      <Table
        head={['Month', 'Fee', 'Paid', 'Balance']}
        rows={[
          ['October', 'LKR 2,500', 'LKR 2,500', <Pill key="oc" tone="ok">Settled</Pill>],
          ['November', 'LKR 2,500', done ? 'LKR 1,500' : 'LKR 0', done ? <Pill key="no" tone="warn">LKR 1,000 left</Pill> : <Pill key="no" tone="bad">LKR 2,500</Pill>],
        ]}
      />
      {done ? (
        <Done>Part payment of LKR 1,500 recorded in cash. LKR 1,000 still owed for November.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Record LKR 1,500 part payment</button>
      )}
    </div>
  );
}

function makeReceiptScreen(student: string, cls: string, receiptNo: string) {
  return function ReceiptScreen({ done, onAction }: ScreenProps) {
    const [doc, setDoc] = useState<'receipt' | 'statement'>('receipt');
    return (
      <div className="grid gap-4">
        <div className="flex gap-1 self-start rounded-lg border border-[var(--ndl-border)] p-1" role="radiogroup" aria-label="Document">
          {(['receipt', 'statement'] as const).map((d) => (
            <button
              key={d}
              type="button"
              role="radio"
              aria-checked={doc === d}
              onClick={() => setDoc(d)}
              className={`rounded-md px-3 py-1 text-xs font-semibold ${focus} ${doc === d ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'text-[var(--ndl-muted)]'}`}
            >
              {d === 'receipt' ? 'Receipt' : 'Monthly statement'}
            </button>
          ))}
        </div>
        <div className="mx-auto w-full max-w-sm rounded-md bg-white p-5 text-slate-800 shadow-md ring-1 ring-slate-200">
          <div className="flex items-start justify-between border-b border-slate-200 pb-3">
            <span className="text-sm font-bold">{CLASS_MANAGER.productName}</span>
            <span className="text-right text-[10px] text-slate-500">
              {doc === 'receipt' ? `Receipt ${receiptNo}` : 'Statement · November 2026'}
              <span className="block">PDF</span>
            </span>
          </div>
          <p className="mt-3 text-[12px]">
            {student} · {cls}
          </p>
          <div className="mt-3 grid gap-1 text-[12px]">
            {(doc === 'receipt'
              ? [['November fee', 'LKR 2,500'], ['Paid by', 'Bank transfer'], ['Date', '26 Nov 2026']]
              : [['Brought forward', 'LKR 0'], ['November fee', 'LKR 2,500'], ['Paid 26 Nov', '– LKR 2,500'], ['Lessons attended', '8 of 8']]
            ).map(([k, v]) => (
              <span key={k} className="flex justify-between border-b border-dashed border-slate-200 py-1">
                <span className="text-slate-500">{k}</span>
                <span className="font-mono">{v}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 flex justify-between text-[13px] font-semibold">
            <span>{doc === 'receipt' ? 'Received' : 'Balance'}</span>
            <span className="font-mono">{doc === 'receipt' ? 'LKR 2,500' : 'LKR 0'}</span>
          </p>
        </div>
        {done ? (
          <Done>{doc === 'receipt' ? 'Receipt' : 'Statement'} shared to the parent on WhatsApp as a PDF.</Done>
        ) : (
          <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Share PDF on WhatsApp</button>
        )}
      </div>
    );
  };
}

function makeRemindersScreen(student: string, amount: string, sms: { sender: string; used: number; allowance: number }) {
  const first = student.split(' ')[0];
  return function RemindersScreen({ done, onAction }: ScreenProps) {
  const [lessonMins, setLessonMins] = useState(30);
  const [feeOn, setFeeOn] = useState(true);
  const [smsOn, setSmsOn] = useState(true);
  return (
    <div className="grid gap-4">
      <p className="font-semibold text-[var(--ndl-text)]">Reminders and messages</p>
      <div className="grid gap-2 @xl:grid-cols-2">
        <div className="rounded-lg border border-[var(--ndl-border)] p-3 text-[13px] text-[var(--ndl-text)]">
          Remind me and students before each lesson
          <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Lesson reminder">
            {[15, 30, 60].map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={lessonMins === m}
                onClick={() => setLessonMins(m)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${focus} ${lessonMins === m ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'bg-[var(--ndl-surface-2)] text-[var(--ndl-muted)]'}`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start justify-between gap-3 rounded-lg border border-[var(--ndl-border)] p-3 text-[13px] text-[var(--ndl-text)]">
          On the morning a fee is due
          <input type="checkbox" checked={feeOn} onChange={() => setFeeOn(!feeOn)} className="mt-0.5 h-4 w-4 accent-[var(--ndl-accent)]" />
        </label>
      </div>
      <div className="rounded-lg border border-[var(--ndl-border)] p-3 text-[13px] text-[var(--ndl-text)]">
        <label className="flex items-start justify-between gap-3">
          <span>
            Also send automatically by SMS <Pill tone="info">Add-on</Pill>
            <span className="block text-[11px] text-[var(--ndl-muted)]">Sent as &quot;{sms.sender}&quot; to parents without the app</span>
          </span>
          <input type="checkbox" checked={smsOn} onChange={() => setSmsOn(!smsOn)} className="mt-0.5 h-4 w-4 accent-[var(--ndl-accent)]" />
        </label>
        <div className="mt-2 h-1.5 overflow-hidden rounded bg-[var(--ndl-surface-2)]" role="img" aria-label={`${sms.used} of ${sms.allowance} SMS used this month`}>
          <div className="h-full rounded bg-[var(--ndl-accent)]" style={{ width: `${(sms.used / sms.allowance) * 100}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-[var(--ndl-muted)]">
          {sms.used.toLocaleString('en-LK')} of {sms.allowance.toLocaleString('en-LK')} SMS used this month
        </p>
      </div>
      <div>
        <p className="mb-1 text-[11px] text-[var(--ndl-muted)]">Your wording for fee reminders · {'{student}'}, {'{amount}'} and {'{due}'} fill in automatically</p>
        <p className="rounded-lg border border-[var(--ndl-input-border)] bg-[var(--ndl-input-bg)] p-3 font-mono text-[12px] text-[var(--ndl-text)]">
          Hi, a gentle reminder that {'{student}'}&apos;s fee of {'{amount}'} is due on {'{due}'}. Thank you!
        </p>
      </div>
      {done ? (
        <div className="grid gap-2">
          <p className="max-w-[90%] justify-self-end rounded-2xl rounded-tr-sm bg-emerald-500/15 px-3 py-2 text-[13px] text-[var(--ndl-text)]">
            Hi, a gentle reminder that {first}&apos;s fee of {amount} is due on 5 Dec. Thank you!
          </p>
          <Done>
            WhatsApp opened with the message filled in for {first}&apos;s parent.
            {smsOn && ' The same reminder goes by SMS on the due morning.'}
          </Done>
        </div>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Send reminder to {first} on WhatsApp</button>
      )}
    </div>
  );
}
}

function IncomeScreen({ done, onAction }: ScreenProps) {
  const methods: Array<[string, number]> = [
    ['Bank transfer', 88500],
    ['Card', 32000],
    ['Cash', 22000],
  ];
  const total = methods.reduce((a, [, v]) => a + v, 0);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-[var(--ndl-text)]">Income · November</p>
        <span className="font-mono text-sm tabular-nums text-[var(--ndl-text)]">LKR {total.toLocaleString('en-LK')}</span>
      </div>
      <div className="grid gap-2">
        {methods.map(([m, v]) => (
          <div key={m} className="grid grid-cols-[110px_minmax(0,1fr)_90px] items-center gap-3 text-[13px]">
            <span className="text-[var(--ndl-text-secondary)]">{m}</span>
            <span className="h-3 rounded bg-[var(--ndl-accent)]" style={{ width: `${(v / total) * 100}%` }} />
            <span className="text-right font-mono tabular-nums text-[var(--ndl-text)]">{Math.round(v / 1000)}k</span>
          </div>
        ))}
      </div>
      <Table
        head={['Class or student', 'Students', 'Collected']}
        rows={[
          ['Combined Maths 2026 · Theory', 38, 'LKR 87,500'],
          ['Combined Maths 2027 · Theory', 26, 'LKR 37,500'],
          ['One-to-one lessons', 2, 'LKR 17,500'],
        ]}
      />
      {done ? (
        <Done>November report saved as a PDF for your records.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Save report as PDF</button>
      )}
    </div>
  );
}

function BackupScreen({ done, onAction }: ScreenProps) {
  return (
    <div className="grid gap-4">
      <p className="font-semibold text-[var(--ndl-text)]">Backup</p>
      <div className="flex items-center gap-3 rounded-lg border border-[var(--ndl-border)] p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--ndl-surface-2)] text-lg" aria-hidden="true">☁</span>
        <span className="min-w-0 text-[13px] text-[var(--ndl-text)]">
          Your own Google Drive
          <span className="block text-[11px] text-[var(--ndl-muted)]">Private app folder · only you can restore it</span>
        </span>
        <Pill tone="ok">On</Pill>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="Last backup" value={done ? 'Just now' : 'Today 2:00 am'} />
        <Stat label="Records saved" value="1,284" />
      </div>
      <p className="text-[12px] text-[var(--ndl-muted)]">Backs up every night on its own. Restoring on a new phone or computer takes one tap.</p>
      {done ? (
        <Done>Backed up 1,284 records to Google Drive.</Done>
      ) : (
        <button type="button" className={`${primaryBtn} justify-self-start`} onClick={onAction}>Back up now</button>
      )}
    </div>
  );
}

const TutorReminders = makeRemindersScreen('Dulani Herath', 'LKR 5,000', { sender: 'CMaths2027', used: 412, allowance: 900 });
const InstituteReminders = makeRemindersScreen('Kasun Abeysekara', 'LKR 2,500', { sender: 'BrightFutr', used: 3840, allowance: 6000 });
const TutorReceipt = makeReceiptScreen('Nethmi Perera', 'Combined Maths 2027', 'R-2298');
const InstituteReceipt = makeReceiptScreen('Kavindu Rajapaksha', 'Physics 2026', 'R-10482');

/* ───────────────────────── Flows ───────────────────────── */

const FLOWS: Record<ClientType, DemoStep[]> = {
  tutor: [
    { id: 'register', title: 'Student signs up', who: 'Student', section: 'Home', path: 'join', caption: 'You share one link on WhatsApp. Students fill in their details and the parent is notified.', Screen: RegisterScreen },
    { id: 'today', title: 'Your day at a glance', who: 'Tutor', section: 'Dashboard', path: 'today', caption: "Today's lessons and the fees to collect, the moment you open the app.", Screen: TodayScreen },
    { id: 'students', title: 'You see every student', who: 'Tutor', section: 'Students', path: 'students', caption: 'One list of students, their classes, parent contacts and who has paid. Open anyone for their full record.', Screen: TutorStudents },
    { id: 'classes', title: 'You set up classes', who: 'Tutor', section: 'Classes', path: 'classes', caption: 'Create batches with their days, times, fees and online or physical mode. Students see the schedule straight away.', Screen: ClassesScreen },
    { id: 'schedule', title: 'Your weekly schedule', who: 'Tutor', section: 'Classes', path: 'schedule', caption: 'Weekly slots repeat on their own. Group classes and one-to-one lessons sit side by side.', Screen: ScheduleScreen },
    { id: 'feeplans', title: 'Fee plans and part payments', who: 'Tutor', section: 'Fees', path: 'students/dulani/fees', caption: 'Monthly, per-term or per-lesson fees for each student, with part payments and a running balance.', Screen: FeePlansScreen },
    { id: 'slip', title: 'Student pays by bank slip', who: 'Student', section: 'Fees', path: 'fees', caption: 'Students pay by bank transfer and upload the slip from their phone.', Screen: PaySlipScreen },
    { id: 'approve', title: 'You approve the payment', who: 'Tutor', section: 'Fees', path: 'payments', caption: 'All slips land in one list. One tap marks the student paid and sends them a receipt.', Screen: ApproveScreen },
    { id: 'card', title: 'Or the student pays by card', who: 'Student', section: 'Fees', path: 'fees/pay', caption: 'With online payments, students pay by card and their classes unlock instantly. Nothing for you to check.', addOn: 'payments', Screen: CardPayScreen },
    { id: 'receipt', title: 'Receipts and statements', who: 'Tutor', section: 'Fees', path: 'fees/receipts', caption: 'Every payment gets a PDF receipt, and parents can get a monthly statement.', Screen: TutorReceipt },
    { id: 'access', title: 'Paid students join class', who: 'Student', section: 'My classes', path: 'my-classes', caption: 'The Zoom link and notes open only for students who paid this month, on one device each. No more shared links.', Screen: ClassAccessScreen },
    { id: 'attendance', title: 'Attendance fills itself in', who: 'Tutor', section: 'Attendance', path: 'attendance', caption: 'Attendance comes from who tapped Join class in their portal, whatever meeting app you use. Fix anything by tapping, then save.', Screen: TutorAttendance },
    { id: 'marks', title: 'You publish paper marks', who: 'Tutor', section: 'Exams', path: 'exams/paper-08', caption: 'Enter marks once. Ranks are worked out and results go to students and parents.', addOn: 'exams', Screen: MarksScreen },
    { id: 'reminders', title: 'Reminders in your own words', who: 'Tutor', section: 'Settings', path: 'settings/reminders', caption: 'Choose when reminders go out and write them your way. Send on WhatsApp with one tap, or automatically by SMS.', Screen: TutorReminders },
    { id: 'notify', title: 'Students get app notifications', who: 'Student', section: 'Home', path: 'app', caption: 'With your own mobile app, reminders, results and fee notices arrive as free notifications.', addOn: 'app', Screen: AppNotificationsScreen },
    { id: 'report', title: 'You see the month at a glance', who: 'Tutor', section: 'Reports', path: 'reports', caption: 'See what came in, who still owes, and remind them in one click.', Screen: ReportScreen },
    { id: 'income', title: 'Income by payment method', who: 'Tutor', section: 'Reports', path: 'reports/income', caption: 'See income by bank, card and cash, and by class or student.', Screen: IncomeScreen },
    { id: 'export', title: 'Export your data any time', who: 'Tutor', section: 'Reports', path: 'reports/export', caption: 'Download students, payments, attendance and marks as Excel or CSV whenever you need them.', Screen: TutorExport },
    { id: 'backup', title: 'Automatic backup', who: 'Tutor', section: 'Settings', path: 'settings/backup', caption: 'Everything is backed up to your own Google Drive every night.', Screen: BackupScreen },
  ],
  institute: [
    { id: 'dashboard', title: 'Owner opens the day', who: 'Owner', section: 'Dashboard', path: 'dashboard', caption: "Today's collections, attendance and classes on one screen, from anywhere.", Screen: DashboardScreen },
    { id: 'students', title: 'Admin finds any student', who: 'Admin', section: 'Students', path: 'students', caption: 'Every student across every class and teacher, with fee status and parent contacts.', Screen: InstituteStudents },
    { id: 'counter', title: 'Counter takes a payment', who: 'Counter staff', section: 'Fees', path: 'counter', caption: 'Find any student in seconds, collect cash, print a receipt and notify the parent.', Screen: CounterScreen },
    { id: 'receipt', title: 'Receipts and statements', who: 'Counter staff', section: 'Fees', path: 'fees/receipts', caption: 'Printed or PDF receipts for every payment, and monthly statements for parents.', Screen: InstituteReceipt },
    { id: 'attendance', title: 'Teacher marks the roll', who: 'Teacher', section: 'Attendance', path: 'attendance', caption: 'Teachers mark attendance in class. Absent students are listed so you can message their parents the same day.', Screen: InstituteAttendance },
    { id: 'timetable', title: 'Admin books a hall', who: 'Admin', section: 'Timetable', path: 'timetable', caption: 'The timetable stops double bookings and suggests a free hall.', addOn: 'halls', Screen: TimetableScreen },
    { id: 'marks', title: 'Teacher publishes results', who: 'Teacher', section: 'Exams', path: 'exams/paper-08', caption: 'Marks, ranks and progress for every class, sent to students and parents.', addOn: 'exams', Screen: MarksScreen },
    { id: 'reminders', title: 'Reminders in your own words', who: 'Admin', section: 'Settings', path: 'settings/reminders', caption: 'Set when class and fee reminders go out, and send them on WhatsApp or by SMS in your own wording.', Screen: InstituteReminders },
    { id: 'staff', title: 'Owner manages staff access', who: 'Owner', section: 'Settings', path: 'settings/staff', caption: 'Give each person only what they need. Counter staff take payments, teachers see their own classes.', addOn: 'staff', Screen: StaffScreen },
    { id: 'parent', title: 'Parents stay informed', who: 'Parent', section: 'Home', path: 'parent', caption: 'Parents get attendance, payment and result updates, and can check everything in the parent portal.', addOn: 'parents', Screen: ParentScreen },
    { id: 'branding', title: 'Your name, your web address', who: 'Owner', section: 'Settings', path: 'settings/brand', caption: 'Your logo and colours everywhere, on your own web address.', addOn: 'domain', Screen: BrandingScreen },
    { id: 'export', title: 'Export your data any time', who: 'Owner', section: 'Reports', path: 'reports/export', caption: 'Download everything as Excel or CSV for your accountant or your records.', Screen: InstituteExport },
    { id: 'backup', title: 'Automatic backup', who: 'Owner', section: 'Settings', path: 'settings/backup', caption: "Your institute's records are backed up every night to your own Google Drive.", Screen: BackupScreen },
  ],
};

/* ───────────────────────── Frames ───────────────────────── */

type View = 'phone' | 'tablet' | 'web';

const VIEWS: Array<{ value: View; label: string }> = [
  { value: 'phone', label: 'Phone' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'web', label: 'Web' },
];

const STAFF_NAV = ['Dashboard', 'Students', 'Classes', 'Fees', 'Attendance', 'Timetable', 'Exams', 'Reports', 'Settings'];
const STUDENT_NAV = ['Home', 'My classes', 'Fees', 'Results'];

function isStudentSide(step: DemoStep) {
  return step.who === 'Student' || step.who === 'Parent';
}

/** The web app itself: top bar, sidebar on wide frames, bottom tabs on narrow ones. */
function AppShell({ step, children }: { step: DemoStep; children: React.ReactNode }) {
  const studentSide = isStudentSide(step);
  const nav = studentSide ? STUDENT_NAV : STAFF_NAV;
  const tabs = nav.slice(0, 4);
  if (!tabs.includes(step.section)) tabs[3] = step.section;
  const initials = step.who.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="@container/shell flex h-full min-h-[inherit] flex-col bg-[var(--ndl-bg)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--ndl-border)] bg-[var(--ndl-surface)] px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--ndl-text)]">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--ndl-accent)] text-[11px] font-bold ndl-on-accent" aria-hidden="true">
            CM
          </span>
          {CLASS_MANAGER.productName}
        </span>
        <span className="flex items-center gap-2 text-xs text-[var(--ndl-muted)]">
          <span className="hidden @md/shell:inline">{step.who}</span>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--ndl-surface-2)] text-[11px] font-semibold text-[var(--ndl-text)]">
            {initials}
          </span>
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <nav aria-label="App menu (demo)" className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-[var(--ndl-border)] bg-[var(--ndl-surface)] p-3 @2xl/shell:flex">
          {nav.map((item) => (
            <span
              key={item}
              className={`rounded-md px-3 py-1.5 text-[13px] ${
                item === step.section ? 'bg-[var(--ndl-accent)]/12 font-semibold text-[var(--ndl-accent)]' : 'text-[var(--ndl-muted)]'
              }`}
            >
              {item}
            </span>
          ))}
        </nav>
        <main className="@container min-w-0 flex-1 p-4 @2xl/shell:p-6">
          <div className={studentSide ? 'mx-auto w-full max-w-md' : ''}>{children}</div>
        </main>
      </div>
      <nav aria-label="App tabs (demo)" className="grid grid-cols-4 border-t border-[var(--ndl-border)] bg-[var(--ndl-surface)] @2xl/shell:hidden">
        {tabs.map((item) => (
          <span
            key={item}
            className={`px-1 py-2.5 text-center text-[11px] ${item === step.section ? 'font-semibold text-[var(--ndl-accent)]' : 'text-[var(--ndl-muted)]'}`}
          >
            {item}
          </span>
        ))}
      </nav>
    </div>
  );
}

function StatusBar({ wide = false }: { wide?: boolean }) {
  return (
    <div className="flex items-center justify-between bg-[var(--ndl-surface)] px-6 pt-2.5 pb-1 text-[12px] font-semibold text-[var(--ndl-text)]" aria-hidden="true">
      <span>{wide ? '9:41  Fri 30 Oct' : '9:41'}</span>
      <span className="flex items-center gap-1.5">
        <span className="flex items-end gap-px">
          {[4, 6, 8, 10].map((h) => (
            <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: h }} />
          ))}
        </span>
        <span className="relative h-[11px] w-[22px] rounded-[3px] border border-current p-px">
          <span className="block h-full w-3/4 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  );
}

function AddressBar({ path }: { path: string }) {
  return (
    <div className="flex justify-center bg-[var(--ndl-surface)] px-4 pb-2">
      <span className="min-w-0 truncate rounded-md bg-[var(--ndl-surface-2)] px-3 py-1 font-mono text-[11px] text-[var(--ndl-muted)]">
        yourclasses.lk/{path}
      </span>
    </div>
  );
}

function DeviceFrame({ view, step, children }: { view: View; step: DemoStep; children: React.ReactNode }) {
  const app = <AppShell step={step}>{children}</AppShell>;

  if (view === 'phone') {
    return (
      <div className="mx-auto w-[360px] max-w-full rounded-[2.75rem] bg-slate-900 p-2.5 shadow-2xl ring-1 ring-black/10">
        <div className="relative flex min-h-[640px] flex-col overflow-hidden rounded-[2.25rem]">
          <span className="absolute top-2 left-1/2 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-slate-900" aria-hidden="true" />
          <StatusBar />
          <AddressBar path={step.path} />
          <div className="flex min-h-0 flex-1 flex-col">{app}</div>
          <div className="flex justify-center bg-[var(--ndl-surface)] py-2" aria-hidden="true">
            <span className="h-1 w-28 rounded-full bg-[var(--ndl-text)]/40" />
          </div>
        </div>
      </div>
    );
  }

  if (view === 'tablet') {
    return (
      <div className="mx-auto w-[820px] max-w-full rounded-[2rem] bg-slate-900 p-3 shadow-2xl ring-1 ring-black/10">
        <div className="flex min-h-[560px] flex-col overflow-hidden rounded-[1.4rem]">
          <StatusBar wide />
          <AddressBar path={step.path} />
          <div className="flex min-h-0 flex-1 flex-col">{app}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--ndl-border)] shadow-xl">
      <div className="flex items-center gap-3 border-b border-[var(--ndl-border)] bg-[var(--ndl-surface-2)] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-[var(--ndl-bg)] px-3 py-1 text-center font-mono text-[11px] text-[var(--ndl-muted)]">
          yourclasses.lk/{step.path}
        </span>
        <span className="w-12" aria-hidden="true" />
      </div>
      <div className="flex min-h-[520px] flex-col">{app}</div>
    </div>
  );
}

/* ───────────────────────── Main ───────────────────────── */

export default function DemoFlowClient() {
  const [flow, setFlow] = useState<ClientType>('tutor');
  const [index, setIndex] = useState(0);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [view, setView] = useState<View>('web');

  const steps = FLOWS[flow];
  const step = steps[index];
  const done = doneIds.includes(`${flow}:${step.id}`);
  const isLast = index === steps.length - 1;

  function chooseFlow(next: ClientType) {
    setFlow(next);
    setIndex(0);
    setDoneIds([]);
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--ndl-muted)]">Show me the flow for</span>
        <div className="flex gap-1 rounded-lg border border-[var(--ndl-border)] p-1" role="radiogroup" aria-label="Demo flow">
          {(['tutor', 'institute'] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="radio"
              aria-checked={flow === f}
              onClick={() => chooseFlow(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold ${focus} ${
                flow === f ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'text-[var(--ndl-muted)] hover:text-[var(--ndl-text)]'
              }`}
            >
              {f === 'tutor' ? 'An online tutor' : 'An institute'}
            </button>
          ))}
        </div>
        <Pill tone="info">Sample data</Pill>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ol className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible" aria-label="Demo steps">
          {steps.map((s, i) => {
            const isDone = doneIds.includes(`${flow}:${s.id}`);
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'step' : undefined}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left ${focus} ${
                    i === index ? 'border-[var(--ndl-accent)] bg-[var(--ndl-accent)]/10' : 'border-[var(--ndl-border)] hover:bg-[var(--ndl-surface-2)]'
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] ${
                      isDone ? 'bg-emerald-500 ndl-on-accent' : i === index ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'bg-[var(--ndl-surface-2)] text-[var(--ndl-muted)]'
                    }`}
                  >
                    {isDone ? '✓' : i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block whitespace-nowrap text-sm font-medium text-[var(--ndl-text)] lg:whitespace-normal">{s.title}</span>
                    <span className="text-[11px] text-[var(--ndl-muted)]">
                      {s.who}
                      {s.addOn && ' · Add-on'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <section aria-labelledby="demo-step-title" className="grid min-w-0 gap-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ndl-accent)]">
              Step {index + 1} of {steps.length} · {step.who}
            </p>
            <h2 id="demo-step-title" className="mt-1 text-xl font-semibold text-[var(--ndl-text)]">{step.title}</h2>
            <p className="mt-1 max-w-[65ch] text-[var(--ndl-text-secondary)]">{step.caption}</p>
            {step.addOn && (
              <p className="mt-2 text-sm text-[var(--ndl-muted)]">
                <Pill tone="info">Add-on</Pill> Needs &quot;{addOnName(step.addOn)}&quot; on the quote.
              </p>
            )}
          </div>
            <div className="flex gap-1 rounded-lg border border-[var(--ndl-border)] p-1" role="radiogroup" aria-label="Screen size">
              {VIEWS.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  role="radio"
                  aria-checked={view === v.value}
                  onClick={() => setView(v.value)}
                  className={`rounded-md px-3 py-1 text-sm font-semibold ${focus} ${
                    view === v.value ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'text-[var(--ndl-muted)] hover:text-[var(--ndl-text)]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <DeviceFrame view={view} step={step}>
            <step.Screen done={done} onAction={() => setDoneIds((d) => (d.includes(`${flow}:${step.id}`) ? d : [...d, `${flow}:${step.id}`]))} />
          </DeviceFrame>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" className={ghostBtn} disabled={index === 0} onClick={() => setIndex(index - 1)}>
              ← Back
            </button>
            {isLast ? (
              <Link href="/p/class-manager/quote/" className={primaryBtn}>
                Get a price for this →
              </Link>
            ) : (
              <button type="button" className={primaryBtn} onClick={() => setIndex(index + 1)}>
                Next: {steps[index + 1].title} →
              </button>
            )}
          </div>
          <p className="text-sm text-[var(--ndl-muted)]">
            Questions?{' '}
            <a href={`mailto:${CLASS_MANAGER.contactEmail}`} className={`break-all font-medium text-[var(--ndl-accent)] underline underline-offset-4 ${focus}`}>
              {CLASS_MANAGER.contactEmail}
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
