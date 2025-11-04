import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/config'

export async function POST(request: NextRequest) {
  try {
    const userHeader = request.headers.get('x-user-data')
    if (!userHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(userHeader)
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string
    const bucket = formData.get('bucket') as string || 'avatars'

    console.log('Upload request - User:', user.id, 'File:', fileName, 'Bucket:', bucket)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!fileName) {
      return NextResponse.json({ error: 'No file name provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Uploading to Supabase Storage...')

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({
        error: 'Failed to upload file',
        details: error.message
      }, { status: 500 })
    }

    console.log('Upload successful, getting public URL...')

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    console.log('Public URL:', urlData.publicUrl)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
