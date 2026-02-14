import LoginForm from '@/components/features/auth/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const params = await searchParams
  const nextPath = params.next && params.next.startsWith('/') ? params.next : '/dashboard'

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">NexStore Login</h1>
        <LoginForm nextPath={nextPath} />
      </div>
    </div>
  )
}