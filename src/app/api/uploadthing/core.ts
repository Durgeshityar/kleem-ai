import { currentUser } from '@/lib/auth-util'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      const user = await currentUser()

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized')

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id! }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Image upload complete for userId:', metadata.userId)

      console.log('file url', file.url)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { url: file.url }
    }),

  // Video uploader route
  videoUploader: f({
    video: {
      maxFileSize: '32MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await currentUser()
      if (!user) throw new UploadThingError('Unauthorized')
      return { userId: user.id! }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Video upload complete for userId:', metadata.userId)
      console.log('file url', file.url)
      return { url: file.url }
    }),

  // PDF uploader route
  pdfUploader: f({
    pdf: {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const user = await currentUser()
      if (!user) throw new UploadThingError('Unauthorized')
      return { userId: user.id! }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('PDF upload complete for userId:', metadata.userId)
      console.log('file url', file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
