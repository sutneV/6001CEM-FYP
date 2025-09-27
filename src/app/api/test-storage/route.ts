import { NextRequest, NextResponse } from 'next/server'
import { supabaseStorageService } from '@/lib/services/storage'

export async function GET() {
  try {
    // Test bucket creation
    const bucketReady = await supabaseStorageService.ensureBucketExists()

    if (bucketReady) {
      return NextResponse.json({
        success: true,
        message: 'Supabase Storage is ready! Bucket "pet-images" exists.',
        bucketName: 'pet-images'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to setup Supabase Storage bucket',
        error: 'Bucket creation failed'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Storage test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Error testing Supabase Storage',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}