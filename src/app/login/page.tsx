import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br from-forest-600 to-forest-800 mb-5 shadow-lg shadow-forest-700/20">
            <span className="text-white font-bold text-2xl tracking-tight">NN</span>
          </div>
          <h1 className="text-[26px] font-bold text-slate-900 tracking-[-0.03em]">NutriNews</h1>
          <p className="text-slate-400 text-[14px] mt-1.5 font-medium">Für Ernährungstherapeut:innen</p>
        </div>
        <LoginForm />
        <p className="text-center text-[11px] text-slate-300 mt-8">
          Evidenzbasierte Ernährungsnews &middot; Keine Werbung
        </p>
      </div>
    </div>
  );
}
