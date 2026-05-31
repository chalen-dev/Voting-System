import { useTheme } from '../../contexts/ThemeContext';

type Props = {
    title?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    showMenuButton?: boolean;
    onMenuClick?: () => void;
};

export default function Header({
                                   title = 'Voting Site',
                                   showBackButton = false,
                                   onBack,
                                   showMenuButton = false,
                                   onMenuClick,
                               }: Props) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <header className="sticky top-0 z-50 flex justify-between items-center h-[64px] px-6 border-b backdrop-blur-md transition-all duration-300
                           bg-[var(--bg-surface)]/80 border-[var(--border-color)]">
            <div className="flex items-center gap-4">
                {showMenuButton && (
                    <button
                        onClick={onMenuClick}
                        className="text-xl text-[var(--text-main)] hover:text-brand-600 transition-colors cursor-pointer"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>
                )}
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="text-xl text-[var(--text-main)] hover:text-brand-600 transition-colors cursor-pointer"
                        aria-label="Go back"
                    >
                        ←
                    </button>
                )}
                <h1 className="m-0 text-lg font-bold text-[var(--text-heading)] tracking-tight">
                    {title}
                </h1>
            </div>

            <button
                onClick={toggleTheme}
                className="relative w-12 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 focus:outline-none overflow-hidden transition-colors duration-300 cursor-pointer border border-[var(--border-color)]"
                aria-label="Toggle theme"
            >
                <div
                    className={`absolute top-0 bottom-0 flex w-6 items-center justify-center text-xs transition-transform duration-300 ease-in-out ${
                        isDark ? 'translate-x-6' : 'translate-x-0'
                    }`}
                >
                    {isDark ? '🌙' : '☀️'}
                </div>
            </button>
        </header>
    );
}