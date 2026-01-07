import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Tools24Now - Professional File & Business Tools';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Image generation
export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Logo Container */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                    {/* Icon Shape */}
                    <div
                        style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '24px',
                            marginRight: '40px',
                            boxShadow: '0 20px 50px rgba(79, 70, 229, 0.3)',
                        }}
                    >
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 7H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            <path d="M12 7V19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                        </svg>
                    </div>

                    {/* Text */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 90, fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center' }}>
                            Tools<span style={{ color: '#4F46E5' }}>24</span>Now
                        </div>
                    </div>
                </div>

                {/* Subtitle */}
                <div style={{ fontSize: 40, color: '#94A3B8', fontWeight: 500, maxWidth: '800px', textAlign: 'center' }}>
                    Free Professional PDF, Image, Business & Developer Tools
                </div>

                {/* Tag pill */}
                <div style={{
                    marginTop: '60px',
                    padding: '16px 40px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50px',
                    fontSize: 28,
                    color: '#E2E8F0',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    100% Free & Secure
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
