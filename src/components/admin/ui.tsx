'use client'
import clsx from 'clsx'

export function Card({ title, action, children, className, noPad }: {
  title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; noPad?: boolean
}) {
  return (
    <div className={clsx('bg-card border border-border rounded-xl shadow-sm mb-4 overflow-hidden', className)}>
      {title && (
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-2.5 flex-wrap bg-bg/40">
          <div className="text-[13px] font-bold tracking-tight">{title}</div>
          {action}
        </div>
      )}
      <div className={noPad ? '' : 'p-5'}>{children}</div>
    </div>
  )
}

const btnVariants = {
  primary: 'bg-maroon text-white hover:bg-maroon2 shadow-sm',
  gold:    'bg-gold text-white hover:brightness-95 shadow-sm',
  outline: 'bg-white text-ink border border-border hover:bg-bg hover:border-ink/20',
  green:   'bg-ok text-white hover:brightness-95 shadow-sm',
  red:     'bg-danger text-white hover:brightness-95 shadow-sm',
  ghost:   'bg-transparent text-muted hover:bg-bg hover:text-ink',
}

export function Btn({ variant = 'outline', className, children, ...props }:
  { variant?: keyof typeof btnVariants } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-none cursor-pointer text-[11.5px] font-semibold whitespace-nowrap transition-all active:scale-[.96] disabled:opacity-40 disabled:cursor-not-allowed',
        btnVariants[variant], className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const iconBtnVariants = {
  default: 'text-muted hover:text-ink hover:bg-bg',
  primary: 'text-info hover:bg-blue-50',
  green:   'text-ok hover:bg-green-50',
  red:     'text-danger hover:bg-red-50',
  gold:    'text-gold hover:bg-gold/10',
}

/** Icon-only action button for repetitive per-row actions (tables, cards). Always pass `label` — it becomes the tooltip and screen-reader text. */
export function IconBtn({ icon, label, variant = 'default', className, ...props }:
  { icon: React.ReactNode; label: string; variant?: keyof typeof iconBtnVariants } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      title={label}
      aria-label={label}
      className={clsx(
        'inline-flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer text-[14px] transition-all active:scale-[.92] disabled:opacity-30 disabled:cursor-not-allowed',
        iconBtnVariants[variant], className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}

const badgeVariants = {
  gray:   'bg-bg text-muted',
  green:  'bg-green-100 text-ok',
  red:    'bg-red-100 text-danger',
  blue:   'bg-blue-100 text-info',
  amber:  'bg-amber-100 text-warn',
  purple: 'bg-purple-100 text-accent',
}

export function Badge({ variant = 'gray', children }: { variant?: keyof typeof badgeVariants; children: React.ReactNode }) {
  return (
    <span className={clsx('inline-block text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide', badgeVariants[variant])}>
      {children}
    </span>
  )
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] font-semibold text-muted mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full box-border border border-border rounded-lg px-3.5 py-2.5 text-[13px] outline-none transition-all bg-white focus:border-gold focus:ring-2 focus:ring-gold/15'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputClass, props.className)} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(inputClass, 'resize-y', props.className)} />
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputClass, 'cursor-pointer', props.className)} />
}

const accentVariants = {
  gray:   'bg-bg text-muted',
  green:  'bg-green-100 text-ok',
  red:    'bg-red-100 text-danger',
  blue:   'bg-blue-100 text-info',
  amber:  'bg-amber-100 text-warn',
  purple: 'bg-purple-100 text-accent',
}

export function StatCard({ label, value, tag, tagVariant = 'gray', icon, accent = 'blue' }: {
  label: string; value: React.ReactNode; tag?: string; tagVariant?: keyof typeof badgeVariants; icon?: string; accent?: keyof typeof accentVariants
}) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center text-base flex-shrink-0', accentVariants[accent])}>
            {icon}
          </div>
        )}
        {tag && <Badge variant={tagVariant}>{tag}</Badge>}
      </div>
      <div className="text-[1.85rem] font-bold leading-none tracking-tight">{value}</div>
      <div className="text-[.68rem] text-muted mt-2 font-semibold uppercase tracking-wider">{label}</div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="font-bold text-sm">{title}</div>
          <IconBtn icon="✕" label="Close" onClick={onClose} />
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border flex justify-end gap-2 bg-bg/40">{footer}</div>}
      </div>
    </div>
  )
}

/** Consistent table header row — use with a plain <table><thead><tr>{...}</tr></thead>.
 * Padding is self-contained (first/last column gets the outer gutter) so header cells
 * always line up with their body cells regardless of the parent Card's own padding. */
/** Pass `shrink` on short/categorical columns (phone, date, status, actions…) so they hug their
 * content instead of stretching — leave the one or two columns with genuinely variable-length
 * content (name, description…) unshrunk so they soak up the leftover width. Without this, a table
 * with few short columns spreads evenly across the full card width and looks sparse/clumsy. */
export function Th({ children, align = 'left', shrink }: { children: React.ReactNode; align?: 'left' | 'right' | 'center'; shrink?: boolean }) {
  return (
    <th className={clsx('px-3 first:pl-5 last:pr-5 pb-2.5 text-[10px] font-bold uppercase tracking-wider text-muted whitespace-nowrap', shrink && 'w-px', {
      'text-left': align === 'left', 'text-right': align === 'right', 'text-center': align === 'center',
    })}>
      {children}
    </th>
  )
}

export function Td({ children, align = 'left', muted, className, shrink }: {
  children: React.ReactNode; align?: 'left' | 'right' | 'center'; muted?: boolean; className?: string; shrink?: boolean
}) {
  return (
    <td className={clsx('px-3 first:pl-5 last:pr-5 py-3 text-[12.5px]', muted && 'text-muted', shrink && 'whitespace-nowrap', {
      'text-left': align === 'left', 'text-right': align === 'right', 'text-center': align === 'center',
    }, className)}>
      {children}
    </td>
  )
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  )
}

/** Small pulsing status indicator — replaces text badges like "live"/"draft" to keep rows scannable. */
const statusDotColor = { on: 'bg-ok', off: 'bg-danger', warn: 'bg-warn' }
export function StatusDot({ status, label }: { status: 'on' | 'off' | 'warn'; label?: string }) {
  return (
    <span className="relative inline-flex h-2 w-2 flex-shrink-0" title={label}>
      <span className={clsx('animate-ping absolute inline-flex h-full w-full rounded-full opacity-60', statusDotColor[status])} />
      <span className={clsx('relative inline-flex rounded-full h-2 w-2', statusDotColor[status])} />
    </span>
  )
}

export function EmptyState({ icon = '📭', text }: { icon?: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
      <div className="text-3xl opacity-30">{icon}</div>
      <div className="text-[13px] text-muted">{text}</div>
    </div>
  )
}
