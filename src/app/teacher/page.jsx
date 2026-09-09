import { redirect } from 'next/navigation'

export default async function TeacherDashboardPage({ searchParams }) {
  const params = await searchParams
  const queryString = params ? new URLSearchParams(params).toString() : ''
  redirect(queryString ? `/dashboard?${queryString}` : '/dashboard')
}
