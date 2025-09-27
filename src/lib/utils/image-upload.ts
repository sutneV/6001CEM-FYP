import { supabaseStorageService } from '@/lib/services/storage'

export interface ImageUploadResponse {
  urls: string[]
  message: string
}

export class ImageUploadService {
  private async handleResponse(response: Response): Promise<ImageUploadResponse> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Upload failed')
    }
    return response.json()
  }

  /**
   * Upload images via API endpoint (for web form uploads)
   */
  async uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData()

    files.forEach(file => {
      formData.append('images', file)
    })

    const response = await fetch('/api/upload/images', {
      method: 'POST',
      body: formData,
    })

    const result = await this.handleResponse(response)
    return result.urls
  }

  /**
   * Direct upload to Supabase Storage (alternative method)
   */
  async uploadImagesDirectly(files: File[], folder: string = 'pets'): Promise<string[]> {
    // Validate files first
    const validation = this.validateImages(files)
    if (!validation.valid) {
      throw new Error(validation.error!)
    }

    // Upload directly to Supabase Storage
    return await supabaseStorageService.uploadImages(files, folder)
  }

  /**
   * Delete images from storage
   */
  async deleteImages(imageUrls: string[]): Promise<boolean[]> {
    return await supabaseStorageService.deleteImages(imageUrls)
  }

  /**
   * Delete a single image from storage
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    return await supabaseStorageService.deleteImage(imageUrl)
  }

  validateImages(files: File[]): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const MAX_FILES = 5

    if (files.length === 0) {
      return { valid: false, error: 'Please select at least one image' }
    }

    if (files.length > MAX_FILES) {
      return { valid: false, error: `Maximum ${MAX_FILES} images allowed` }
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return {
          valid: false,
          error: `Invalid file type: ${file.name}. Allowed types: JPG, PNG, WEBP`
        }
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `File too large: ${file.name}. Maximum size is 5MB`
        }
      }
    }

    return { valid: true }
  }

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

  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Get file size in a human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Check if a URL is a Supabase Storage URL
   */
  isSupabaseStorageUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/') ||
           url.includes('/storage/v1/object/public/')
  }

  /**
   * Check if a URL is a local file system URL
   */
  isLocalFileUrl(url: string): boolean {
    return url.startsWith('/uploads/')
  }
}

export const imageUploadService = new ImageUploadService()