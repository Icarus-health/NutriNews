import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
         style={{ background: 'linear-gradient(160deg, #f0faf0 0%, #fefce8 100%)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #B8960C 0%, #236829 100%)' }}
          >
            <span className="text-4xl">🐦</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">NutriNews</h1>
          <p className="text-slate-500 text-sm mt-2">Für Ernährungstherapeut:innen</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
