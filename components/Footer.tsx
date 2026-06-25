import Link from 'next/link';
import { Logo } from "@/components/ui/logo";

export function Footer() {
    return (
        <footer className="w-full bg-background py-10 md:py-16 mt-8 border-t border-border">
            <div className="container mx-auto px-6 lg:px-8 max-w-[1450px]">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 lg:gap-16">

                    {/* Logo & Text Column */}
                    <div className="flex flex-col items-start pl-0">
                        {/* Logo from Navbar */}
                        <div className="flex flex-col items-start justify-center select-none mb-6 mt-[-10px]">
                            <Logo />

                            {/* Brand Text Area */}
                            <div className="flex flex-col items-start mt-1">
                                <h1 className="text-[22px] font-black text-brand leading-none tracking-tighter font-sans" style={{ letterSpacing: '-0.04em' }}>
                                    My Travel Deal
                                </h1>

                                {/* Signature Red Arc Underline */}
                                <svg width="120" height="8" viewBox="2 2 120 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand mt-0.5">
                                    <path d="M2 6C35 0 85 0 118 6L118 8C85 2 35 2 2 8Z" fill="currentColor" />
                                </svg>
                            </div>
                        </div>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-left font-medium tracking-wide font-sans max-w-[280px]">
                            Lorem Ipsum Dolor Sit Amet<br />
                            Cotetur. Tincidunt Curabitur Amet<br />
                            Mattis Purus Et Tellus
                        </p>
                    </div>

                    {/* Services Column */}
                    <div className="flex flex-col items-start md:pl-0">
                        <h3 className="text-brand font-bold text-xl md:text-2xl mb-4 md:mb-6 tracking-tight font-sans">Services</h3>
                        <ul className="flex flex-col gap-3 items-start">
                            <li><Link href="/my-booking" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Flight Booking</Link></li>
                            <li><Link href="/group-travel/new" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Group Travel</Link></li>
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="flex flex-col items-start md:pl-0">
                        <h3 className="text-brand font-bold text-xl md:text-2xl mb-4 md:mb-6 tracking-tight font-sans">Company</h3>
                        <ul className="flex flex-col gap-3 items-start">
                            <li><Link href="/about" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">About Us</Link></li>
                            <li><Link href="#" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Career</Link></li>
                            <li><Link href="#" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Need Help Column */}
                    <div className="flex flex-col items-start md:pl-0">
                        <h3 className="text-brand font-bold text-xl md:text-2xl mb-4 md:mb-6 tracking-tight font-sans">Need Help?</h3>
                        <ul className="flex flex-col gap-3 items-start">
                            <li><Link href="/customer-support" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Customer Support</Link></li>
                            <li><Link href="#" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Accessibility Statement</Link></li>
                            <li><Link href="#" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-base md:text-lg font-medium text-muted-foreground hover:text-primary transition-colors font-sans py-0.5">Terms Of Use</Link></li>
                        </ul>
                    </div>

                </div>
            </div>
        </footer>
    );
}
