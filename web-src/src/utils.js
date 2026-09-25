// Invoke an App Builder web action with IMS auth headers.
export async function invokeAction(url, ims, body) {
  if (!url) {
    // config.json is empty before deploy / preview
    throw new Error('Action URL not available yet. Deploy the app or run the sandbox.')
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ims.token}`,
      'x-gw-ims-org-id': ims.org
    },
    body: JSON.stringify(body || {})
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(json.error || `Action failed: ${res.status}`)
  }
  return json
}

// Read a File object into a base64 string (without the data URL prefix).
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result || ''
      const comma = result.indexOf(',')
      resolve(comma >= 0 ? result.slice(comma + 1) : result)
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
