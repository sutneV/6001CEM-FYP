import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

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

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images allowed' },
        { status: 400 }
      )
    }

    const uploadedUrls: string[] = []

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pets')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    for (const file of files) {
      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
          { status: 400 }
        )
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 5MB` },
          { status: 400 }
        )
      }

      // Generate unique filename
      const fileExtension = path.extname(file.name)
      const timestamp = Date.now()
      const randomString = randomBytes(8).toString('hex')
      const fileName = `${timestamp}-${randomString}${fileExtension}`
      const filePath = path.join(uploadsDir, fileName)
      
      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      await writeFile(filePath, buffer)
      
      // Store the public URL
      const publicUrl = `/uploads/pets/${fileName}`
      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({
      message: 'Images uploaded successfully',
      urls: uploadedUrls
    })
  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}