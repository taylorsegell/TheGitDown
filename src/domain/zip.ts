/**
 * Build a zip Blob from path/data pairs. Persistence (saveAs) stays in the UI layer.
 * JSZip is loaded on demand so the idle SPA does not pay for it.
 */
export async function generateZip(
  files: { path: string; data: ArrayBuffer }[],
): Promise<Blob> {
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const file of files) {
    // Uint8Array view — JSZip rejects some raw ArrayBuffer hosts in jsdom
    zip.file(file.path, new Uint8Array(file.data))
  }
  return zip.generateAsync({ type: 'blob' })
}
