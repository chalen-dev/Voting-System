// File: src/components/ui/LoadingScreen.tsx
import { ClipLoader } from 'react-spinners';

export default function LoadingScreen() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0f172a]">

            <ClipLoader
                color="#6366f1"
                size={60}
                speedMultiplier={0.8}
            />

            <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
                Initializing...
            </p>
        </div>
    );
}