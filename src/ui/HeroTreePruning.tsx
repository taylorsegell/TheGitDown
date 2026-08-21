import { useEffect, useState } from 'react'
import { PlateMarks } from './PlateMarks'

const DIM_ROWS = [
  { prefix: '├──', name: 'src/', delay: '0s' },
  { prefix: '├──', name: 'tests/', delay: '0.15s' },
  { prefix: '├──', name: 'node_modules/', delay: '0.3s' },
] as const

export function HeroTreePruning() {
  const [expanded, setExpanded] = useState(false)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return
    }
    const media = window.matchMedia('(max-width: 44rem)')
    const sync = () => setNarrow(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const targetRow = (
    <>
      <span className="hero-prune-prefix hero-prune-prefix-accent">├──</span>
      <span>assets/</span>
    </>
  )

  return (
    <header className="hero-prune">
      <PlateMarks />
      <div className="hero-prune-bar">
        <p className="hero-prune-wordmark">
          gitdown<span className="hero-prune-wordmark-cursor">_</span>
        </p>
        <p className="m-comment">surgical repo downloads</p>
      </div>

      <div className="hero-prune-body">
        <div className="hero-prune-copy">
          <p className="m-comment">tree pruning</p>
          <h1 className="hero-prune-headline">
            Grab the branch.
            <br />
            Skip the forest.
          </h1>
          <p className="hero-prune-lede">
            Paste any GitHub link. Gitdown takes the folder you need and leaves
            the forest behind, then zips it in this browser.
          </p>
        </div>

        <div className="hero-prune-visual">
          <div
            className={
              expanded ? 'hero-prune-tree is-expanded' : 'hero-prune-tree'
            }
          >
            <p className="hero-prune-root">gitdown-app/</p>
            {DIM_ROWS.map((row) => (
              <div
                key={row.name}
                className="hero-prune-row"
                style={{ animationDelay: row.delay }}
              >
                <span className="hero-prune-prefix">{row.prefix}</span>
                <span>{row.name}</span>
              </div>
            ))}
            {narrow ? (
              <button
                type="button"
                className="hero-prune-target"
                aria-expanded={expanded}
                aria-controls="hero-prune-zip"
                onClick={() => setExpanded((open) => !open)}
              >
                {targetRow}
              </button>
            ) : (
              <div className="hero-prune-target">{targetRow}</div>
            )}
            <div
              className="hero-prune-row"
              style={{ animationDelay: '0.45s' }}
            >
              <span className="hero-prune-prefix">└──</span>
              <span>.github/</span>
            </div>
            <div id="hero-prune-zip" className="hero-prune-zip">
              <span className="hero-prune-zip-arrow" aria-hidden="true">
                ↓
              </span>
              <span className="hero-prune-zip-pill">assets.zip</span>
            </div>
          </div>
        </div>
      </div>

      <p className="hero-prune-foot t-small">
        Public GitHub URLs only. The zip is built in this browser. No clone, no
        backend.
      </p>
    </header>
  )
}
