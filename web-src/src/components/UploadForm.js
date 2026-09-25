import React, { useState } from 'react'
import {
  Flex,
  Heading,
  Content,
  View,
  Button,
  Text,
  InlineAlert,
  ProgressCircle,
  Divider
} from '@adobe/react-spectrum'
import UploadToCloud from '@spectrum-icons/workflow/UploadToCloud'
import { invokeAction, fileToBase64, formatBytes } from '../utils'

const ALLOWED = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_BYTES = 5 * 1024 * 1024

export default function UploadForm({ ims, uploadUrl, onUploaded }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  function handleSelect(e) {
    setError(null)
    const selected = e.target.files && e.target.files[0]
    if (!selected) return
    if (!ALLOWED.includes(selected.type)) {
      setError(`Unsupported file type: ${selected.type || 'unknown'}`)
      return
    }
    if (selected.size > MAX_BYTES) {
      setError('File exceeds the 5 MB limit')
      return
    }
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
  }

  async function handleUpload() {
    if (!file) return
    setIsUploading(true)
    setError(null)
    try {
      const data = await fileToBase64(file)
      await invokeAction(uploadUrl, ims, {
        fileName: file.name,
        contentType: file.type,
        data
      })
      setFile(null)
      setPreviewUrl(null)
      onUploaded && onUploaded()
    } catch (e) {
      setError(e.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <View
      borderWidth="thin"
      borderColor="dark"
      borderRadius="medium"
      padding="size-300"
      backgroundColor="gray-50"
      width="size-3600"
    >
      <Heading level={2}>Upload an image</Heading>
      <Divider size="S" marginBottom="size-200" />

      <Flex direction="column" gap="size-200">
        {/* React Spectrum has no file input yet — use a styled native input */}
        <label
          htmlFor="image-file-input"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: 24,
            border: '2px dashed var(--spectrum-global-color-gray-400)',
            borderRadius: 8,
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <UploadToCloud size="L" />
          <Text>Click to choose an image</Text>
          <Text UNSAFE_style={{ fontSize: 12, opacity: 0.7 }}>
            PNG, JPEG, GIF, WebP, SVG · up to 5 MB
          </Text>
          <input
            id="image-file-input"
            type="file"
            accept={ALLOWED.join(',')}
            onChange={handleSelect}
            style={{ display: 'none' }}
          />
        </label>

        {previewUrl && (
          <View>
            <img
              src={previewUrl}
              alt="preview"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 6,
                display: 'block',
                margin: '0 auto'
              }}
            />
            <Content>
              <Text>
                {file.name} · {formatBytes(file.size)}
              </Text>
            </Content>
          </View>
        )}

        {error && (
          <InlineAlert variant="negative">
            <Heading>Upload error</Heading>
            <Content>{error}</Content>
          </InlineAlert>
        )}

        <Flex gap="size-100" alignItems="center">
          <Button
            variant="accent"
            onPress={handleUpload}
            isDisabled={!file || isUploading}
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </Button>
          {isUploading && <ProgressCircle aria-label="Uploading" isIndeterminate size="S" />}
        </Flex>
      </Flex>
    </View>
  )
}
