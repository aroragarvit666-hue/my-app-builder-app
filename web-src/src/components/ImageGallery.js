import React from 'react'
import {
  Flex,
  Heading,
  Content,
  View,
  Text,
  Button,
  ProgressCircle,
  InlineAlert,
  IllustratedMessage,
  Divider,
  DialogTrigger,
  AlertDialog
} from '@adobe/react-spectrum'
import Download from '@spectrum-icons/workflow/Download'
import Delete from '@spectrum-icons/workflow/Delete'
import NotFound from '@spectrum-icons/illustrations/NotFound'
import { formatBytes } from '../utils'

export default function ImageGallery({ images, isLoading, error, onDelete }) {
  if (isLoading) {
    return (
      <Flex alignItems="center" justifyContent="center" height="size-3000">
        <ProgressCircle aria-label="Loading images" isIndeterminate size="L" />
      </Flex>
    )
  }

  if (error) {
    return (
      <InlineAlert variant="negative">
        <Heading>Could not load images</Heading>
        <Content>{error}</Content>
      </InlineAlert>
    )
  }

  if (!images || images.length === 0) {
    return (
      <IllustratedMessage>
        <NotFound />
        <Heading>No images yet</Heading>
        <Content>Upload an image to see it appear here.</Content>
      </IllustratedMessage>
    )
  }

  return (
    <Flex direction="column" gap="size-200">
      <Heading level={2}>Your images ({images.length})</Heading>
      <Divider size="S" />
      <Flex direction="row" gap="size-250" wrap>
        {images.map((img) => (
          <View
            key={img.name}
            borderWidth="thin"
            borderColor="dark"
            borderRadius="medium"
            padding="size-150"
            width="size-2400"
            backgroundColor="gray-50"
          >
            <Flex direction="column" gap="size-100" height="100%">
              <div
                style={{
                  height: 140,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: 'var(--spectrum-global-color-gray-100)',
                  borderRadius: 6
                }}
              >
                <img
                  src={img.url}
                  alt={img.displayName}
                  style={{ maxWidth: '100%', maxHeight: 140, objectFit: 'contain' }}
                />
              </div>
              <Text UNSAFE_style={{ fontWeight: 600, wordBreak: 'break-all', fontSize: 13 }}>
                {img.displayName}
              </Text>
              <Text UNSAFE_style={{ fontSize: 12, opacity: 0.7 }}>
                {formatBytes(img.contentLength)}
              </Text>
              <Flex gap="size-100" marginTop="auto">
                <Button
                  variant="primary"
                  style="outline"
                  onPress={() => window.open(img.url, '_blank')}
                >
                  <Download />
                  <Text>Download</Text>
                </Button>
                <DialogTrigger>
                  <Button variant="negative" style="outline" aria-label="Delete image">
                    <Delete />
                  </Button>
                  <AlertDialog
                    title="Delete image"
                    variant="destructive"
                    primaryActionLabel="Delete"
                    cancelLabel="Cancel"
                    onPrimaryAction={() => onDelete(img.name)}
                  >
                    Delete “{img.displayName}”? This cannot be undone.
                  </AlertDialog>
                </DialogTrigger>
              </Flex>
            </Flex>
          </View>
        ))}
      </Flex>
    </Flex>
  )
}
