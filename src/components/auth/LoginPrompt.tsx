import Link from 'next/link';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function LoginPrompt({ title, description, icon }: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-24 pb-32">
      <div className="w-20 h-20 rounded-full bg-forest-50 flex items-center justify-center mb-5">
        <span className="text-3xl">{icon}</span>
      </div>
      <h2 className="text-[18px] font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-[14px] text-slate-400 text-center leading-relaxed max-w-xs mb-8">
        {description}
      </p>
      <Link
        href="/login"
        className="bg-forest-700 text-white px-8 py-3 rounded-xl text-[14px] font-semibold hover:bg-forest-800 active:bg-forest-900 transition-all shadow-sm shadow-forest-700/20"
      >
        Anmelden
      </Link>
    </div>
  );
}
