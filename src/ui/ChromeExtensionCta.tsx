/**
 * Companion Chrome extension CTA for the landing page.
 * Swap `CHROME_WEB_STORE_URL` for the live listing once published.
 */
import { PlateMarks } from './PlateMarks'

export const CHROME_WEB_STORE_URL =
  'https://chromewebstore.google.com/detail/gitdown/placeholder'

function ArrowMark() {
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden="true" fill="none">
      <path
        d="M4.25 11.75 11.75 4.25"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
      />
      <path
        d="M6.5 4.25h5.25V9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

export function ChromeExtensionCta() {
  return (
    <aside
      id="extension"
      className="home-extension"
      aria-labelledby="extension-heading"
    >
      <div className="home-extension-shell">
        <PlateMarks />
        <div className="home-extension-core">
          <p className="m-comment">extension</p>
          <div className="home-extension-split">
            <div className="home-extension-copy">
              <h2 id="extension-heading" className="home-extension-title">
                Skip the paste
              </h2>
              <p className="home-extension-body">
                Already on GitHub? Zip the file, folder, or repo from the
                toolbar. Right-click a github.com link and you're done. Same
                job, still in your browser.
              </p>
            </div>
            <a
              className="home-extension-cta"
              href={CHROME_WEB_STORE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <span className="home-extension-cta-text">Add to Chrome</span>
              <span className="home-extension-cta-mark">
                <ArrowMark />
              </span>
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
