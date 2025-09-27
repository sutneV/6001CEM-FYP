import { NextRequest, NextResponse } from 'next/server'
import { supabaseStorageService } from '@/lib/services/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('images') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      )
    }

    // Validate images using Supabase Storage service
    const validation = supabaseStorageService.validateImages(files)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    try {
      // Ensure bucket exists (this is safe to call multiple times)
      // Note: We don't fail here because the bucket might exist but we can't list it due to permissions
      await supabaseStorageService.ensureBucketExists()

      // Upload images to Supabase Storage
      const uploadedUrls = await supabaseStorageService.uploadImages(files, 'pets')

      return NextResponse.json({
        message: 'Images uploaded successfully',
        urls: uploadedUrls
      })
    } catch (uploadError) {
      console.error('Upload error:', uploadError)

      // Provide helpful error messages
      let errorMessage = 'Failed to upload images'

      if (uploadError instanceof Error) {
        if (uploadError.message.includes('Bucket not found')) {
          errorMessage = 'Storage bucket not found. Please create a "pet-images" bucket in your Supabase dashboard and set it as public.'
        } else if (uploadError.message.includes('row-level security policy')) {
          errorMessage = 'Storage permissions issue. Please check your Supabase storage policies.'
        } else {
          errorMessage = uploadError.message
        }
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}