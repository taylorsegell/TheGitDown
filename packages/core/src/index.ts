export { parseGitHubUrl, buildZipNames } from './githubUrl'
export { downloadGitHubPath } from './download'
export { createGitHubHttp, classifyGitHubFailure } from './githubHttp'
export { resolveRef } from './resolveRef'
export { generateZip } from './zip'
export { createLocalStorageCredentialStore } from './credentials'
export { mapDownloadErrorMessage } from './downloadErrorMessage'
export type {
  DownloadParams,
  DownloadEvent,
  DownloadError,
  DownloadErrorKind,
  RepoRef,
  GitHubHttp,
  CredentialStore,
} from './types'
