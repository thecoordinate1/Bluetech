import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";

export function Footer() {
    return (
        <footer className="py-16 border-t border-border/50 bg-slate-950 text-slate-200">
            <div className="container px-4 md:px-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="font-bold text-2xl flex items-center gap-2 text-white">
                            <div className="h-8 w-8 rounded-lg bg-primary" />
                            E-Ntemba
                        </Link>
                        <p className="text-slate-400 max-w-sm leading-relaxed">
                            Empowering local vendors with world-class e-commerce tools. Build, manage, and scale your business with ease.
                        </p>
                        <div className="flex gap-4">
                            <Link href="https://twitter.com/entemba.shop" className="bg-slate-900 p-2 rounded-full hover:bg-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="https://facebook.com/entemba.shop" className="bg-slate-900 p-2 rounded-full hover:bg-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="https://instagram.com/entemba.shop" className="bg-slate-900 p-2 rounded-full hover:bg-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="https://linkedin.com/company/entemba.shop" className="bg-slate-900 p-2 rounded-full hover:bg-primary hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Product</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/showcase" className="hover:text-primary transition-colors">Showcase</Link></li>

                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-slate-400">
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                            <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-6">Stay Updated</h4>
                        <p className="text-sm text-slate-400 mb-4">Subscribe to our newsletter for the latest updates.</p>
                        <NewsletterForm />
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div>
                        &copy; {new Date().getFullYear()} E-Ntemba. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
