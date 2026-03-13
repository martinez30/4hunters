import { SignIn } from '@clerk/nextjs'

export default function LoginCatchAllPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
            4<em style={{ color: 'var(--gold)' }}>hunters</em>
          </div>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
