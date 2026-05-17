export function Logo() {
    return (
        <span className="inline-block select-none relative" style={{ verticalAlign: 'middle', width: '28px', height: '30px', marginBottom: '2px' }}>
            <span className="absolute left-1/2 -translate-x-1/2 top-[-11px]">
                <svg width="14" height="14" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                    <path d="M7 12V4C7 2.34315 8.34315 1 10 1H14C15.6569 1 17 2.34315 17 4V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </span>
            <span className="absolute inset-0 bg-primary rounded-[4px] flex items-center justify-center">
                <span className="text-white font-[500] leading-none normal-case" style={{ fontSize: '17px', letterSpacing: '-0.05em' }}>My</span>
            </span>
            <span className="absolute -bottom-[5px] left-[3px] w-[7px] h-[7px] bg-primary rounded-full border-[1.5px] border-white" />
            <span className="absolute -bottom-[5px] right-[3px] w-[7px] h-[7px] bg-primary rounded-full border-[1.5px] border-white" />
        </span>
    );
}

