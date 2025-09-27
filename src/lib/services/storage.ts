import { supabase } from '@/lib/db/config'

export class SupabaseStorageService {
  private bucketName = 'pet-images'

  /**
   * Upload image to Supabase Storage
   * @param file - File to upload
   * @param folder - Optional folder path (e.g., 'pets', 'profiles')
   * @returns Public URL of uploaded image
   */
  async uploadImage(file: File, folder: string = 'pets'): Promise<string> {
    try {
      console.log(`Uploading image: ${file.name} (${file.size} bytes)`)

      // Generate unique filename
      const fileExtension = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileName = `${folder}/${timestamp}-${randomString}.${fileExtension}`

      console.log(`Generated filename: ${fileName}`)

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Supabase storage upload error:', error)

        // Provide specific error messages based on error type
        if (error.message?.includes('new row violates row-level security policy')) {
          throw new Error('Storage permissions issue. Please check your Supabase RLS policies for the storage bucket.')
        } else if (error.message?.includes('Bucket not found')) {
          throw new Error('Storage bucket "pet-images" not found. Please create it in your Supabase dashboard.')
        } else {
          throw new Error(`Failed to upload image: ${error.message}`)
        }
      }

      console.log('Upload successful, getting public URL...')

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path)

      console.log(`Public URL: ${urlData.publicUrl}`)
      return urlData.publicUrl
    } catch (error) {
      console.error('Error uploading to Supabase Storage:', error)
      throw error
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of files to upload
   * @param folder - Optional folder path
   * @returns Array of public URLs
   */
  async uploadImages(files: File[], folder: string = 'pets'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder))
    return Promise.all(uploadPromises)
  }

  /**
   * Delete image from Supabase Storage
   * @param imageUrl - Public URL of the image to delete
   * @returns boolean indicating success
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from public URL
      const urlParts = imageUrl.split(`/storage/v1/object/public/${this.bucketName}/`)
      if (urlParts.length !== 2) {
        throw new Error('Invalid image URL format')
      }

      const filePath = urlParts[1]

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        console.error('Supabase storage delete error:', error)
        throw new Error(`Failed to delete image: ${error.message}`)
      }

      return true
    } catch (error) {
      console.error('Error deleting from Supabase Storage:', error)
      return false
    }
  }

  /**
   * Delete multiple images
   * @param imageUrls - Array of public URLs to delete
   * @returns Array of boolean results
   */
  async deleteImages(imageUrls: string[]): Promise<boolean[]> {
    const deletePromises = imageUrls.map(url => this.deleteImage(url))
    return Promise.all(deletePromises)
  }

  /**
   * Check if bucket exists and create if needed
   * This should be called during setup/initialization
   */
  async ensureBucketExists(): Promise<boolean> {
    try {
      console.log('Checking if bucket exists...')

      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()

      if (listError) {
        console.error('Error listing buckets:', listError)
        console.error('This might be due to insufficient permissions. You may need to manually create the bucket in Supabase Dashboard.')

        // Try to continue anyway - the bucket might exist but we can't list it
        return true
      }

      console.log('Available buckets:', buckets?.map(b => b.name))
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName)

      if (!bucketExists) {
        console.log(`Bucket "${this.bucketName}" doesn't exist, attempting to create...`)

        // Create bucket if it doesn't exist
        const { data, error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
          fileSizeLimit: 5242880 // 5MB in bytes
        })

        if (createError) {
          console.error('Error creating bucket:', createError)
          console.error('You may need to:')
          console.error('1. Go to Supabase Dashboard > Storage')
          console.error('2. Create a bucket named "pet-images"')
          console.error('3. Set it as public')
          console.error('4. Set file size limit to 5MB')

          // Return true anyway - we'll try to upload and let it fail gracefully
          return true
        }

        console.log('Bucket created successfully:', data)
      } else {
        console.log(`Bucket "${this.bucketName}" already exists`)
      }

      return true
    } catch (error) {
      console.error('Error ensuring bucket exists:', error)
      // Return true to allow upload attempt - better error handling there
      return true
    }
  }

  /**
   * Validate image file
   * @param file - File to validate
   * @returns Validation result
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed types: JPG, PNG, WEBP`
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large: ${file.name}. Maximum size is 5MB`
      }
    }

    return { valid: true }
  }

  /**
   * Validate multiple images
   * @param files - Array of files to validate
   * @returns Validation result
   */
  validateImages(files: File[]): { valid: boolean; error?: string } {
    const MAX_FILES = 5

    if (files.length === 0) {
      return { valid: false, error: 'Please select at least one image' }
    }

    if (files.length > MAX_FILES) {
      return { valid: false, error: `Maximum ${MAX_FILES} images allowed` }
    }

    for (const file of files) {
      const validation = this.validateImage(file)
      if (!validation.valid) {
        return validation
      }
    }

    return { valid: true }
  }
}

// Export singleton instance
export const supabaseStorageService = new SupabaseStorageService()