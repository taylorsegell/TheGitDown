import { useEffect, useRef, useState } from 'react'

/**
 * Schematic companion: a square CRT face whose eyes track the pointer.
 * Lives in the hero, drawn in the same square language as the download instrument.
 */

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width={22} height={22} aria-hidden="true" fill="currentColor">
      <path d="M12 20.5 4.7 13.2A5 5 0 1 1 12 6.4a5 5 0 1 1 7.3 6.8Z" />
    </svg>
  )
}

const EYE_TRAVEL_PX = 5

function useCanTrackPointer() {
  const [canTrack, setCanTrack] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointer = window.matchMedia('(pointer: fine)')

    function update() {
      setCanTrack(!motion.matches && pointer.matches)
    }

    update()
    motion.addEventListener('change', update)
    pointer.addEventListener('change', update)
    return () => {
      motion.removeEventListener('change', update)
      pointer.removeEventListener('change', update)
    }
  }, [])

  return canTrack
}

function useTrackedEyeOffset(
  faceRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) {
      setOffset({ x: 0, y: 0 })
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
  }, [enabled, faceRef])

  return offset
}

function RobotFace({
  isLoved,
  onTap,
  trackPointer,
}: {
  isLoved: boolean
  onTap: () => void
  trackPointer: boolean
}) {
  const faceRef = useRef<HTMLButtonElement>(null)
  const eyeOffset = useTrackedEyeOffset(faceRef, trackPointer)
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

export function RobotHero() {
  const [isLoved, setIsLoved] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackPointer = useCanTrackPointer()

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

  const hint = isLoved
    ? 'Aw, thanks!'
    : trackPointer
      ? 'Tap the face to say hi'
      : 'Tap the face to say hi'

  return (
    <section className="robot-hero" aria-label="TheGitDown's robot">
      <RobotFace isLoved={isLoved} onTap={handleTap} trackPointer={trackPointer} />
      <p className="robot-hero-hint">{hint}</p>
    </section>
  )
}

export default RobotHero
