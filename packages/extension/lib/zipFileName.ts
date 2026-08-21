import { buildZipNames, type RepoRef } from '@gitdown/core'

export function withZipExtension(fileName: string): string {
  return fileName.toLowerCase().endsWith('.zip') ? fileName : `${fileName}.zip`
}

/** Suggested save name for a detected GitHub path (folder → `docs.zip`). */
export function zipFileNameFor(ref: RepoRef): string {
  const { downloadFileName } = buildZipNames(ref, {})
  return withZipExtension(downloadFileName)
}

export function kindLabel(kind: RepoRef['kind']): string {
  switch (kind) {
    case 'dir':
      return 'Folder'
    case 'file':
      return 'File'
    case 'repo':
      return 'Repository'
    default:
      return 'Path'
  }
}
