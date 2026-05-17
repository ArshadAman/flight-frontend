import Image from "next/image";

export function PromoBanner() {
    return (
        <section className="w-[100vw] relative left-1/2 -translate-x-1/2 mt-8 mb-20 shrink-0">
            {/* Full viewport-width Image Container */}
            <div className="w-full relative flex items-center justify-center overflow-hidden">
                <Image
                    src="/pnb.png"
                    alt="PNB Promo Island"
                    width={1920}
                    height={400}
                    quality={100}
                    priority
                    unoptimized
                    className="w-full h-auto object-cover object-center"
                />
            </div>
        </section>
    );
}
