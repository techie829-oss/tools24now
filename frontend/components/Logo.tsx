import React from 'react';

interface LogoProps {
    className?: string; // For sizing like w-8 h-8
    textClassName?: string; // For text styling
    showText?: boolean;
    theme?: 'light' | 'dark'; // Dark theme means white text
}

export const LogoSymbol = ({ className = "w-8 h-8" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4F46E5" /> {/* Indigo-600 */}
                <stop offset="1" stopColor="#9333EA" /> {/* Purple-600 */}
            </linearGradient>
        </defs>
        {/* Abstract T / Document Shape */}
        <rect x="8" y="8" width="24" height="24" rx="6" fill="url(#logoGradient)" />
        <path d="M20 12V28" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M14 12H26" stroke="white" strokeWidth="3" strokeLinecap="round" />
        {/* "24" Hint / Speed Lines */}
        <path d="M28 26L34 32" stroke="url(#logoGradient)" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

export default function Logo({ className = "w-8 h-8", textClassName = "text-xl font-bold", showText = true, theme = 'light' }: LogoProps) {
    return (
        <div className="flex items-center gap-2.5">
            <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logoGradientMain" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#4F46E5" />
                        <stop offset="1" stopColor="#9333EA" />
                    </linearGradient>
                </defs>
                {/* Main Container Shape - Squircle */}
                <path d="M10 4H30C33.3137 4 36 6.68629 36 10V30C36 33.3137 33.3137 36 30 36H10C6.68629 36 4 33.3137 4 30V10C4 6.68629 6.68629 4 10 4Z" fill="url(#logoGradientMain)" />

                {/* White Elements inside */}
                {/* T Shape */}
                <path d="M13 14H27" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                <path d="M20 14V27" stroke="white" strokeWidth="3.5" strokeLinecap="round" />

                {/* Small Accent Dot (24/Now concept) */}
                <circle cx="28" cy="12" r="2.5" fill="#FCD34D" /> {/* Amber Dot for 'Now' */}
            </svg>

            {showText && (
                <span className={`${textClassName} tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Tools<span className="text-blue-600">24</span>Now
                </span>
            )}
        </div>
    );
}
