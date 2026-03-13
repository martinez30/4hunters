import { SignUp } from '@clerk/nextjs'

export default function SignUpCatchAllPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>
            4<em style={{ color: 'var(--gold)' }}>hunters</em>
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>Crie sua conta grátis</p>
        </div>
        <SignUp />
      </div>
    </div>
  )
}
