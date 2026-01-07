import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
    width: 32,
    height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 24,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 100%)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: 8, // Rounded square
                }}
            >
                {/* T symbol */}
                <div style={{
                    display: 'flex',
                    position: 'relative',
                    width: '20px',
                    height: '20px',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 7H19" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M12 7V19" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        ),
        // ImageResponse options
        {
            ...size,
        }
    );
}
