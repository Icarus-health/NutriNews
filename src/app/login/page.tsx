import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-forest-700 mb-4">
            <span className="text-2xl">🐦</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nutri News</h1>
          <p className="text-slate-500 text-sm mt-1">Für Ernährungstherapeut:innen</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
