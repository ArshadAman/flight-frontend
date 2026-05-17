export function RedUnderline({ className }: { className?: string }) {
    return (
        <div className={`absolute -bottom-1 left-[62%] w-[42%] h-[6px] hidden sm:block ${className || ''}`}>
            <div
                className="w-full h-full"
                style={{
                    background: '#cc0f2b',
                    clipPath: 'polygon(0% 50%, 15% 15%, 50% 0%, 85% 15%, 100% 50%, 85% 85%, 50% 100%, 15% 85%)',
                    transform: 'rotate(-1.5deg) scaleY(0.8)',
                    borderRadius: '50% / 100%'
                }}
            ></div>
        </div>
    );
}
