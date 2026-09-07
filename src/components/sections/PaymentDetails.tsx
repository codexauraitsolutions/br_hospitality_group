'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { SiteSettings } from '@/types'
import Reveal from '@/components/motion/Reveal'

/** Bank transfer details + UPI QR for guests settling advances and final bills.
 * Everything is driven from Site Settings so the account can be changed without a deploy. */
export default function PaymentDetails({ settings }: { settings: SiteSettings }) {
  const { bankAccountName, bankAccountNumber, bankIfsc, bankName, bankBranch, upiId, upiQrUrl } = settings

  const hasBank = Boolean(bankAccountNumber && bankIfsc)
  const hasUpi = Boolean(upiId || upiQrUrl)
  if (!hasBank && !hasUpi) return null

  // Static intent link — no amount, so the payer types whatever they're settling.
  const upiLink = upiId
    ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(bankAccountName || settings.siteName)}&cu=INR`
    : ''

  return (
    <div className="bg-cream2 border-t border-border">
      <div className="max-w-[1100px] mx-auto px-6 py-16">
        <Reveal className="text-center mb-10" direction="none">
          <div className="text-[.7rem] tracking-[.3em] uppercase text-gold mb-3">Payments</div>
          <h2 className="font-serif text-[clamp(26px,3.5vw,38px)] font-light mb-3">Bank &amp; UPI Details</h2>
          <p className="max-w-xl mx-auto text-muted text-sm leading-relaxed">
            Advances and final settlements can be paid by bank transfer or any UPI app.
            Please share the payment reference with your event coordinator once done.
          </p>
        </Reveal>

        <div className={`grid grid-cols-1 gap-6 ${hasBank && hasUpi ? 'md:grid-cols-[1.3fr_1fr]' : 'max-w-md mx-auto'}`}>
          {hasBank && (
            <Reveal direction="left">
              <div className="h-full bg-white border border-border rounded-lg p-6">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="text-lg">🏦</div>
                  <div className="font-serif text-lg font-semibold">Bank Transfer / NEFT</div>
                </div>

                <div className="flex flex-col divide-y divide-border">
                  {bankAccountName && <DetailRow label="Account Name" value={bankAccountName} />}
                  {bankAccountNumber && <DetailRow label="Account Number" value={bankAccountNumber} mono copyable />}
                  {bankIfsc && <DetailRow label="IFSC Code" value={bankIfsc} mono copyable />}
                  {bankName && <DetailRow label="Bank" value={bankName} />}
                  {bankBranch && <DetailRow label="Branch" value={bankBranch} />}
                </div>

                <p className="mt-5 text-[.68rem] leading-relaxed text-muted border-l-2 border-gold/50 pl-3">
                  Before transferring, please confirm the beneficiary name shows as
                  <strong className="text-ink"> {bankAccountName || settings.siteName}</strong>.
                  We never ask for OTPs, card numbers or UPI PINs.
                </p>
              </div>
            </Reveal>
          )}

          {hasUpi && (
            <Reveal direction="right" delay={0.1}>
              <div className="h-full bg-white border border-border rounded-lg p-6 flex flex-col items-center text-center">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="text-lg">📱</div>
                  <div className="font-serif text-lg font-semibold">Scan &amp; Pay</div>
                </div>

                {upiQrUrl && (
                  <div className="bg-white border border-border rounded-lg p-3 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={upiQrUrl}
                      alt={`UPI payment QR code for ${bankAccountName || settings.siteName}`}
                      width={200}
                      height={200}
                      className="w-[200px] h-[200px] object-contain block"
                    />
                  </div>
                )}

                <div className="text-[.68rem] text-muted mt-4 mb-1">
                  Scan with GPay, PhonePe, Paytm, BHIM or any UPI app
                </div>

                {upiId && (
                  <button
                    type="button"
                    onClick={() => copy(upiId, 'UPI ID')}
                    className="group max-w-full text-[.62rem] font-mono text-ink/70 break-all px-2 py-1 rounded transition-colors hover:bg-cream2"
                    title="Tap to copy UPI ID"
                  >
                    {upiId}
                    <span className="ml-1 text-gold opacity-0 group-hover:opacity-100 transition-opacity">copy</span>
                  </button>
                )}

                {upiLink && (
                  <a
                    href={upiLink}
                    className="md:hidden mt-4 w-full bg-gradient-to-br from-maroon to-maroon2 text-white text-[.72rem] tracking-[.15em] uppercase rounded-lg py-3 transition-transform active:scale-[.98]"
                  >
                    Pay via UPI App
                  </a>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  )
}

async function copy(value: string, label: string) {
  if (await writeToClipboard(value)) toast.success(`${label} copied`)
  else toast.error(`Couldn't copy — please select the ${label} manually`)
}

/** The async Clipboard API needs a secure context and an un-denied permission; older mobile
 * browsers give neither, so fall back to the legacy selection-based copy before giving up. */
async function writeToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value)
      return true
    }
  } catch {
    // fall through to the legacy path
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = value
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}

function DetailRow({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="text-[.62rem] text-muted uppercase tracking-wider shrink-0">{label}</div>
      <div className="flex items-center gap-2 min-w-0">
        <div className={`text-[.82rem] truncate ${mono ? 'font-mono tracking-wide' : ''}`}>{value}</div>
        {copyable && (
          <button
            type="button"
            onClick={() => copy(value, label)}
            aria-label={`Copy ${label}`}
            className={`shrink-0 text-[.6rem] uppercase tracking-wider text-gold border border-gold/40 rounded px-1.5 py-0.5 transition-opacity hover:bg-gold/10 ${hovered ? 'opacity-100' : 'opacity-60'}`}
          >
            Copy
          </button>
        )}
      </div>
    </div>
  )
}
