import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex w-[180px] h-[64px] overflow-hidden mb-5">
            <img src="/Gemini_Generated_Image_r9u96tr9u96tr9u9.png" alt="NutriNews" className="w-full h-full object-contain" />
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
