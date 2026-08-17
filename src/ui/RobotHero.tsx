import { useEffect, useRef, useState } from 'react'

/**
 * A small companion robot face that tracks the pointer, standing in for a
 * larger 3D robot that turned out to be an unreliable dependency for a
 * static, client-only site (WebGL context loss under long dev sessions,
 * ~380KB of extra JS for a purely decorative element).
 */

export interface RobotHeroProps {
  backgroundText?: string
  repoHref?: string
  onDownloadClick?: () => void
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={16}
      height={16}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={14}
      height={14}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true" fill="currentColor">
      <path d="M12 20.5 4.7 13.2A5 5 0 1 1 12 6.4a5 5 0 1 1 7.3 6.8Z" />
    </svg>
  )
}

const EYE_TRAVEL_PX = 5

function useTrackedEyeOffset(faceRef: React.RefObject<HTMLElement | null>) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    if (!window.matchMedia('(pointer: fine)').matches) {
      return
    }

    let frame = 0

    function handlePointerMove(event: PointerEvent) {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const el = faceRef.current
        if (!el) return

        const rect = el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = event.clientX - cx
        const dy = event.clientY - cy
        const dist = Math.max(Math.hypot(dx, dy), 1)
        const pull = Math.min(1, dist / 400)

        setOffset({
          x: (dx / dist) * EYE_TRAVEL_PX * pull,
          y: (dy / dist) * EYE_TRAVEL_PX * pull,
        })
      })
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [faceRef])

  return offset
}

function RobotFace({ isLoved, onTap }: { isLoved: boolean; onTap: () => void }) {
  const faceRef = useRef<HTMLButtonElement>(null)
  const eyeOffset = useTrackedEyeOffset(faceRef)
  const eyeStyle = { transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)` }

  return (
    <button ref={faceRef} type="button" className="robot-face" onClick={onTap} aria-label="Say hi to the robot">
      <span className="robot-face-ear robot-face-ear-l" aria-hidden="true" />
      <span className="robot-face-ear robot-face-ear-r" aria-hidden="true" />
      <span className="robot-face-head">
        <span className="robot-face-screen" data-loved={isLoved}>
          {isLoved ? (
            <span className="robot-face-heart">
              <HeartIcon />
            </span>
          ) : (
            <>
              <span className="robot-face-eye" style={eyeStyle} />
              <span className="robot-face-eye" style={eyeStyle} />
            </>
          )}
        </span>
      </span>
    </button>
  )
}

function RobotNav({
  repoHref,
  onDownloadClick,
}: {
  repoHref: string
  onDownloadClick?: () => void
}) {
  return (
    <nav className="robot-nav">
      <div className="robot-nav-inner">
        <div className="robot-nav-row">
          <a className="robot-nav-pill robot-nav-pill-ghost" href={repoHref} target="_blank" rel="noreferrer">
            GitHub
            <ExternalLinkIcon />
          </a>
          <button type="button" className="robot-nav-pill robot-nav-pill-cta" onClick={onDownloadClick}>
            Download
            <DownloadIcon />
          </button>
        </div>

        <div className="robot-nav-divider" />
      </div>
    </nav>
  )
}

export function RobotHero({
  backgroundText = 'GITDOWN',
  repoHref = 'https://github.com/Taylorsegell/TheGitDown',
  onDownloadClick,
}: RobotHeroProps = {}) {
  const [isLoved, setIsLoved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleTap() {
    setIsLoved(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsLoved(false), 2000)
  }

  return (
    <section className="robot-hero" aria-label="GitDown's robot">
      <div className="robot-hero-bgtext" aria-hidden="true">
        <h2>{backgroundText}</h2>
      </div>

      <div className="robot-hero-overlay">
        <RobotNav repoHref={repoHref} onDownloadClick={onDownloadClick} />

        <div className="robot-face-wrap">
          <RobotFace isLoved={isLoved} onTap={handleTap} />
        </div>

        <p className="robot-hero-hint">
          {isLoved ? 'Aw, thanks!' : 'Move your mouse — the robot is watching'}
        </p>
      </div>
    </section>
  )
}

export default RobotHero
