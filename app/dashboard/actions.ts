'use server'

import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'

const MAX_PHOTO_BYTES = 8 * 1024 * 1024

export type MaintenanceRequest = {
  id: string
  description: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  status: 'submitted' | 'in_progress' | 'done'
  created_at: string
}

export async function submitMaintenanceRequest(formData: FormData) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in.' }

  const description = formData.get('description') as string
  const urgency = formData.get('urgency') as string
  const photo = formData.get('photo') as File | null

  if (!description?.trim()) {
    return { error: 'Please describe the issue.' }
  }

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    if (photo.size > MAX_PHOTO_BYTES) {
      return { error: 'Photo is too large. Please choose one under 8MB.' }
    }
    const path = `${user.id}/${Date.now()}-${photo.name}`
    const { error: uploadError } = await supabase.storage
      .from('maintenance-photos')
      .upload(path, photo)
    if (uploadError) {
      return { error: 'Photo upload failed. Please try again.' }
    }
    photo_url = path
  }

  const { error: insertError } = await supabase.from('maintenance_requests').insert({
    tenant_id: user.id,
    description: description.trim(),
    urgency,
    photo_url,
  })

  if (insertError) {
    return { error: 'Could not submit your request. Please try again.' }
  }

  return {}
}

export async function getMyRequests(): Promise<MaintenanceRequest[]> {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('maintenance_requests')
    .select('id, description, urgency, status, created_at')
    .eq('tenant_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect('/login')
}
