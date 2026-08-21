import { saveAs } from 'file-saver'

/** Save a blob as a download; append `.zip` when the name lacks it. */
export function saveBlob(blob: Blob, fileName: string): void {
  const name =
    fileName.toLowerCase().endsWith('.zip') ? fileName : `${fileName}.zip`
  saveAs(blob, name)
}
