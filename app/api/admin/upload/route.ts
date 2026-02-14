import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

async function ensureAdmin() {
  const { user, isAdmin } = await getCurrentUserAndAdminStatus()
  if (!user) {
    return { ok: false as const, status: 401, error: 'Unauthorized' }
  }
  if (!isAdmin) {
    return { ok: false as const, status: 403, error: 'Admin access required' }
  }
  return { ok: true as const }
}

export async function POST(request: Request) {
  const admin = await ensureAdmin()
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = String(formData.get('folder') || 'misc')
  const safeFolder = folder === 'products' || folder === 'categories' ? folder : 'misc'
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images'

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file upload' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg'
  const objectPath = `${safeFolder}/${crypto.randomUUID()}.${fileExt || 'jpg'}`

  const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(objectPath, file, {
    contentType: file.type,
    upsert: false,
  })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(objectPath)
  return NextResponse.json({ path: objectPath, publicUrl: data.publicUrl }, { status: 201 })
}
