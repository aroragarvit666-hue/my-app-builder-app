import React, { useState, useEffect, useCallback } from 'react'
import {
  Provider,
  defaultTheme,
  Flex,
  View,
  Heading,
  Text,
  Button,
  InlineAlert,
  Content
} from '@adobe/react-spectrum'
import Refresh from '@spectrum-icons/workflow/Refresh'
import actions from '../config.json'
import UploadForm from './UploadForm'
import ImageGallery from './ImageGallery'
import { invokeAction } from '../utils'

export default function App({ runtime, ims }) {
  // Do NOT call runtime.done() here — index.js handles it in the ready handler.
  const uploadUrl = actions['upload-image']
  const listUrl = actions['list-images']
  const deleteUrl = actions['delete-image']

  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const configured = Boolean(listUrl)

  const loadImages = useCallback(async () => {
    if (!configured) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const res = await invokeAction(listUrl, ims, {})
      setImages(res.images || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }, [configured, listUrl, ims])

  useEffect(() => {
    loadImages()
  }, [loadImages])

  async function handleDelete(name) {
    try {
      await invokeAction(deleteUrl, ims, { name })
      await loadImages()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View padding="size-400" minHeight="100vh">
        <Flex direction="column" gap="size-300">
          <Flex direction="row" justifyContent="space-between" alignItems="center">
            <Flex direction="column" gap="size-50">
              <Heading level={1} margin={0}>
                Image Vault
              </Heading>
              <Text>Upload images and download them anywhere.</Text>
            </Flex>
            <Button variant="secondary" onPress={loadImages} isDisabled={!configured}>
              <Refresh />
              <Text>Refresh</Text>
            </Button>
          </Flex>

          {!configured && (
            <InlineAlert variant="info">
              <Heading>Backend not connected yet</Heading>
              <Content>
                Action URLs are empty. Run the sandbox preview or deploy with{' '}
                <code>aio app deploy</code> to enable uploads and downloads.
              </Content>
            </InlineAlert>
          )}

          <Flex direction={{ base: 'column', M: 'row' }} gap="size-400" alignItems="start">
            <UploadForm ims={ims} uploadUrl={uploadUrl} onUploaded={loadImages} />
            <View flex="1" minWidth="size-3600">
              <ImageGallery
                images={images}
                isLoading={isLoading}
                error={error}
                onDelete={handleDelete}
              />
            </View>
          </Flex>
        </Flex>
      </View>
    </Provider>
  )
}
