import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img
            src="/Gemini_Generated_Image_r9u96tr9u96tr9u9.png"
            alt="NutriNews"
            className="w-full max-w-[280px] mx-auto mb-4 object-contain"
          />
          <p className="text-slate-400 text-[14px] font-medium">Für Ernährungstherapeut:innen</p>
        </div>
        <LoginForm />
        <p className="text-center text-[11px] text-slate-300 mt-8">
          Evidenzbasierte Ernährungsnews &middot; Keine Werbung
        </p>
      </div>
    </div>
  );
}
