import { Link } from 'react-router-dom'
import { GridPattern } from '../ui/GridPattern'
import { PlateMarks } from '../ui/PlateMarks'
import {
  PRIVACY_SECTIONS,
  PRIVACY_UPDATED,
  type PrivacyBlock,
} from '../privacy/policy'

function Block({ block }: { block: PrivacyBlock }) {
  if (block.type === 'ul') {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  return <p>{block.text}</p>
}

export function PrivacyPage() {
  return (
    <main className="home-page legal-page">
      <GridPattern />
      <header className="home-hero">
        <Link to="/home" className="home-brand legal-brand">
          <img
            className="home-logo"
            src="/logo.svg"
            alt=""
            width={56}
            height={56}
          />
          <span className="home-wordmark">
            <span className="home-wordmark-primary">The</span>
            <span className="home-wordmark-accent">GitDown</span>
          </span>
        </Link>
      </header>

      <section
        className="home-schematic legal-schematic"
        aria-labelledby="privacy-heading"
      >
        <PlateMarks />
        <div className="legal-copy">
          <p className="m-comment">privacy</p>
          <h1 id="privacy-heading" className="legal-title">
            Privacy policy
          </h1>
          <p className="legal-updated">Updated {PRIVACY_UPDATED}</p>

          {PRIVACY_SECTIONS.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id}>{section.title}</h2>
              {section.blocks.map((block, index) => (
                <Block key={`${section.id}-${index}`} block={block} />
              ))}
            </section>
          ))}
        </div>
      </section>

      <footer className="home-footer">
        <p className="m-comment">open source</p>
        <p className="home-footer-copy">
          <Link to="/home">Home</Link>
          <span aria-hidden="true"> · </span>
          <a
            href="https://github.com/taylorsegell/TheGitDown"
            target="_blank"
            rel="noreferrer"
          >
            Source
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </p>
      </footer>
    </main>
  )
}
