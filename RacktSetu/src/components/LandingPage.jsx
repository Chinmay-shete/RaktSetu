import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setNavScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('counter-scale')) {
                        entry.target.classList.add('active');
                    }
                    if (entry.target.hasAttribute('data-count')) {
                        animateCounter(entry.target);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.counter-scale, [data-count]').forEach(el => observer.observe(el));

        function animateCounter(el) {
            // Read initial text to determine suffix BEFORE animation overwrites it
            const initialText = el.innerText;
            const target = parseFloat(el.getAttribute('data-count'));
            const duration = 2000;
            const startTime = performance.now();
            const startValue = 0;
            const suffix = initialText.includes('%') ? '%' : (initialText.includes('x') ? 'x' : (initialText.includes('Days') ? ' Days' : ''));

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 4); // Ease out Quart
                const currentVal = (startValue + (target - startValue) * easedProgress);
                
                el.innerText = suffix === ' Days' ? Math.floor(currentVal) + suffix : currentVal.toFixed(target % 1 === 0 ? 0 : 1) + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            requestAnimationFrame(update);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-bone-bg text-on-surface font-body-md overflow-x-hidden min-h-screen">
            <div className="noise-filter"></div>
            {/* Top Navigation */}
            <nav className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl border-b border-border-subtle transition-all duration-300 ${navScrolled ? 'shadow-sm' : ''}`}>
                <div className="flex justify-between items-center h-[10vh] px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
                    <a className="font-serif text-headline-lg font-bold text-crimson-accent tracking-tight" href="#">RaktSetu</a>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#features">Features</a>
                        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#process">How it works</a>
                        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#who">Who uses it</a>
                        <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#pilot">Pilot</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2 font-label-md text-label-md text-primary hover:opacity-80 transition-all spring-transition">Login</button>
                        <button className="bg-crimson-accent text-white px-6 py-2 rounded-full font-label-md text-label-md spring-transition hover:scale-105 active:scale-95" onClick={() => setIsModalOpen(true)}>Register as Donor</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 md:pt-60 md:pb-32 aceternity-grid min-h-[921px] flex items-center overflow-hidden">
                <div className="absolute inset-0 radial-glow pointer-events-none"></div>
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">Now Scaling in Maharashtra</span>
                    </div>
                    <h1 className="font-serif text-[60px] md:text-[100px] leading-[0.9] text-charcoal-card mb-8 max-w-4xl mx-auto">
                        The smartest way to <br /> manage <span className="text-primary italic">blood</span> in India
                    </h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-12">
                        AI-driven logistics layer for India's blood supply chain. Reducing wastage by 40% using real-time predictive demand sensing.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button className="bg-charcoal-card text-white px-10 py-5 rounded-full font-label-md text-label-md spring-transition hover:bg-black group">
                            Request Emergency Access
                            <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                        <button className="bg-white border border-border-subtle px-10 py-5 rounded-full font-label-md text-label-md spring-transition hover:border-primary/40">
                            Watch Product Pilot
                        </button>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-white border-y border-border-subtle overflow-hidden">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="relative pt-8">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10">
                                <div className="h-full bg-primary counter-scale active" style={{ width: "100%" }}></div>
                            </div>
                            <div className="font-serif text-[64px] text-charcoal-card leading-none mb-2" data-count="10">10%</div>
                            <p className="font-label-md text-label-md text-text-muted">Avg. Wastage Reduced</p>
                        </div>
                        <div className="relative pt-8">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10">
                                <div className="h-full bg-primary counter-scale active" style={{ width: "100%" }}></div>
                            </div>
                            <div className="font-serif text-[64px] text-charcoal-card leading-none mb-2" data-count="5">5 Days</div>
                            <p className="font-label-md text-label-md text-text-muted">Stock Forecasting Precision</p>
                        </div>
                        <div className="relative pt-8">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10">
                                <div className="h-full bg-primary counter-scale active" style={{ width: "100%" }}></div>
                            </div>
                            <div className="font-serif text-[64px] text-charcoal-card leading-none mb-2" data-count="6">6x</div>
                            <p className="font-label-md text-label-md text-text-muted">Unique Logistics Features</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Dark Marquee */}
            <div className="bg-charcoal-card py-6 overflow-hidden flex whitespace-nowrap border-y border-white/5">
                <div className="flex animate-marquee gap-12 items-center">
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">PREDICTIVE ANALYTICS <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">COLD CHAIN MONITORING <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">DONOR RETENTION <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">REAL-TIME INVENTORY <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">INTER-HOSPITAL TRANSFER <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                </div>
                <div className="flex animate-marquee gap-12 items-center">
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">PREDICTIVE ANALYTICS <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">COLD CHAIN MONITORING <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">DONOR RETENTION <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">REAL-TIME INVENTORY <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                    <span className="text-white/40 font-label-md text-label-md flex items-center gap-4">INTER-HOSPITAL TRANSFER <span className="w-1.5 h-1.5 rounded-full bg-primary"></span></span>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-32" id="features">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Large Dashboard Card */}
                        <div className="bg-charcoal-card rounded-xl p-10 md:row-span-2 relative overflow-hidden flex flex-col justify-between min-h-[500px]">
                            <div className="relative z-10">
                                <span className="text-primary font-label-sm tracking-widest uppercase mb-4 block">Central Intelligence</span>
                                <h3 className="text-white font-serif text-headline-lg mb-6">Unified Supply Dashboard</h3>
                                <p className="text-white/60 font-body-md max-w-sm">Every unit tracked, from collection to transfusion. Zero blind spots in the national grid.</p>
                            </div>
                            <div className="mt-12 bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-white font-label-md">Real-time Stock (Pune Cluster)</span>
                                    <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-label-sm">LIVE</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/40 w-12 text-label-sm">O+</span>
                                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-3/4"></div>
                                        </div>
                                        <span className="text-white font-mono text-label-sm">742u</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/40 w-12 text-label-sm">A-</span>
                                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-yellow-500 w-1/4"></div>
                                        </div>
                                        <span className="text-white font-mono text-label-sm">118u</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/40 w-12 text-label-sm">AB+</span>
                                        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary w-1/2"></div>
                                        </div>
                                        <span className="text-white font-mono text-label-sm">340u</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Smaller Grid Features */}
                        <div className="bg-white border border-border-subtle rounded-xl p-8 spring-transition hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-12">
                                <span className="font-serif text-headline-md text-primary/20">01</span>
                                <span className="material-symbols-outlined text-primary">analytics</span>
                            </div>
                            <h4 className="font-headline-md text-charcoal-card mb-4">AI Forecasting</h4>
                            <p className="text-on-surface-variant">Predict demand surges based on historical events, weather, and hospital data.</p>
                        </div>
                        <div className="bg-white border border-border-subtle rounded-xl p-8 spring-transition hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-12">
                                <span className="font-serif text-headline-md text-primary/20">02</span>
                                <span className="material-symbols-outlined text-primary">local_shipping</span>
                            </div>
                            <h4 className="font-headline-md text-charcoal-card mb-4">Optimized Routing</h4>
                            <p className="text-on-surface-variant">Dynamic transit paths for life-saving units between banks and surgical units.</p>
                        </div>
                        <div className="bg-white border border-border-subtle rounded-xl p-8 spring-transition hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-12">
                                <span className="font-serif text-headline-md text-primary/20">03</span>
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                            </div>
                            <h4 className="font-headline-md text-charcoal-card mb-4">Chain of Custody</h4>
                            <p className="text-on-surface-variant">QR-based verification at every touchpoint ensures unit integrity and safety.</p>
                        </div>
                        <div className="bg-white border border-border-subtle rounded-xl p-8 spring-transition hover:translate-y-[-4px]">
                            <div className="flex justify-between items-start mb-12">
                                <span className="font-serif text-headline-md text-primary/20">04</span>
                                <span className="material-symbols-outlined text-primary">notifications_active</span>
                            </div>
                            <h4 className="font-headline-md text-charcoal-card mb-4">Smart Alerts</h4>
                            <p className="text-on-surface-variant">Automated SMS and App triggers for rare blood type donors in specific zones.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Process Section */}
            <section className="py-32 bg-surface-container-low border-y border-border-subtle relative" id="process">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <h2 className="font-serif text-headline-lg text-center mb-24">The Lifecycle of a <span className="text-primary italic">Life</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                        {/* Connectors for Desktop */}
                        <div className="hidden md:block absolute top-10 left-0 w-full h-[1px] bg-primary/20 z-0">
                            <div className="absolute top-1/2 left-1/4 w-3 h-3 -mt-1.5 rounded-full bg-primary/30"></div>
                            <div className="absolute top-1/2 left-2/4 w-3 h-3 -mt-1.5 rounded-full bg-primary/30"></div>
                            <div className="absolute top-1/2 left-3/4 w-3 h-3 -mt-1.5 rounded-full bg-primary/30"></div>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="font-serif text-[120px] leading-none text-primary/5 absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none">1</div>
                            <div className="w-20 h-20 rounded-full bg-white border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-primary">volunteer_activism</span>
                            </div>
                            <h5 className="font-headline-md mb-4">Sourcing</h5>
                            <p className="text-body-md text-on-surface-variant px-4">Strategic donor mapping and mobile camp optimization.</p>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="font-serif text-[120px] leading-none text-primary/5 absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none">2</div>
                            <div className="w-20 h-20 rounded-full bg-white border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-primary">science</span>
                            </div>
                            <h5 className="font-headline-md mb-4">Validation</h5>
                            <p className="text-body-md text-on-surface-variant px-4">Digital documentation of testing and cross-matching results.</p>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="font-serif text-[120px] leading-none text-primary/5 absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none">3</div>
                            <div className="w-20 h-20 rounded-full bg-white border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-primary">inventory_2</span>
                            </div>
                            <h5 className="font-headline-md mb-4">Optimized Storage</h5>
                            <p className="text-body-md text-on-surface-variant px-4">AI-suggested stocking based on localized demand heatmaps.</p>
                        </div>
                        <div className="relative z-10 text-center">
                            <div className="font-serif text-[120px] leading-none text-primary/5 absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none">4</div>
                            <div className="w-20 h-20 rounded-full bg-white border border-primary/20 flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <span className="material-symbols-outlined text-primary">emergency_share</span>
                            </div>
                            <h5 className="font-headline-md mb-4">Transfusion</h5>
                            <p className="text-body-md text-on-surface-variant px-4">Real-time matching and priority delivery to operating rooms.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who Uses It Section */}
            <section className="py-32" id="who">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="max-w-xl">
                            <h2 className="font-serif text-[48px] leading-tight mb-6 text-charcoal-card">Built for the <span className="italic text-primary">entire</span> ecosystem</h2>
                            <p className="text-body-lg text-on-surface-variant">A modular platform that scales across organizational roles and requirements.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center hover:bg-white transition-colors">
                                <span className="material-symbols-outlined">west</span>
                            </button>
                            <button className="w-12 h-12 rounded-full border border-border-subtle flex items-center justify-center hover:bg-white transition-colors">
                                <span className="material-symbols-outlined">east</span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* User Card 1 */}
                        <div className="group relative bg-white border border-border-subtle p-8 rounded-xl spring-transition hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-surface-container mb-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">medical_services</span>
                            </div>
                            <h6 className="font-headline-md mb-2">Hospital Staff</h6>
                            <p className="text-body-md text-on-surface-variant mb-8">Request units in seconds and track transit real-time.</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-label-md">
                                Learn more <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
                            </div>
                        </div>
                        {/* User Card 2 */}
                        <div className="group relative bg-white border border-border-subtle p-8 rounded-xl spring-transition hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-surface-container mb-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">admin_panel_settings</span>
                            </div>
                            <h6 className="font-headline-md mb-2">Health Officer</h6>
                            <p className="text-body-md text-on-surface-variant mb-8">District-wide oversight and crisis management tools.</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-label-md">
                                Learn more <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
                            </div>
                        </div>
                        {/* User Card 3 */}
                        <div className="group relative bg-white border border-border-subtle p-8 rounded-xl spring-transition hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-surface-container mb-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                            </div>
                            <h6 className="font-headline-md mb-2">Bank Admin</h6>
                            <p className="text-body-md text-on-surface-variant mb-8">Digital inventory logs and automated compliance reporting.</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-label-md">
                                Learn more <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
                            </div>
                        </div>
                        {/* User Card 4 */}
                        <div className="group relative bg-white border border-border-subtle p-8 rounded-xl spring-transition hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-surface-container mb-6 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-surface-variant">favorite</span>
                            </div>
                            <h6 className="font-headline-md mb-2">Life Donor</h6>
                            <p className="text-body-md text-on-surface-variant mb-8">Digital donor card, health history, and reward points.</p>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-primary font-label-md">
                                Learn more <span className="material-symbols-outlined text-[20px] ml-1">arrow_forward</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pilot Section */}
            <section className="py-32 overflow-hidden" id="pilot">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="font-serif text-[48px] leading-tight mb-8">Ready to modernize your <span className="italic">blood logistics?</span></h2>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                                    </span>
                                    <p className="text-body-md">Onboard your hospital in under 48 hours.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                                    </span>
                                    <p className="text-body-md">Zero upfront capital expenditure for government banks.</p>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                        <span className="material-symbols-outlined text-primary text-[16px]">check</span>
                                    </span>
                                    <p className="text-body-md">24/7 technical support and on-site training.</p>
                                </li>
                            </ul>
                            <div className="mt-12 flex items-center gap-8">
                                <div>
                                    <div className="font-headline-md font-bold">14+</div>
                                    <div className="text-label-sm text-text-muted">Active Pilots</div>
                                </div>
                                <div className="w-px h-10 bg-border-subtle"></div>
                                <div>
                                    <div className="font-headline-md font-bold">120k+</div>
                                    <div className="text-label-sm text-text-muted">Units Tracked</div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
                            <div className="relative bg-charcoal-card rounded-2xl p-10 border border-white/10 shadow-2xl">
                                <div className="flex gap-2 mb-8 flex-wrap">
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-label-sm">Maharashtra Pilot</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-label-sm">NABH Compliant</span>
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-label-sm">AI-Enabled</span>
                                </div>
                                <h4 className="text-white font-serif text-headline-lg mb-4">Request Demo Access</h4>
                                <p className="text-white/60 mb-10">See how RaktSetu can optimize your district's blood supply levels through real-time predictive data.</p>
                                <div className="space-y-4">
                                    <input className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all" placeholder="Your work email" type="email" />
                                    <button className="w-full bg-crimson-accent text-white font-label-md py-4 rounded-lg hover:bg-primary transition-colors">Start Pilot Discussion</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-charcoal-card py-24 border-t border-white/10 overflow-hidden">
                <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-20">
                        <div className="col-span-1 md:col-span-2">
                            <a className="font-serif text-headline-lg font-bold text-white tracking-tight mb-6 block" href="#">RaktSetu</a>
                            <p className="text-white/40 text-body-md max-w-sm mb-8">
                                Precision blood logistics for India's 1.4 billion people. Building the digital infrastructure for a healthier tomorrow.
                            </p>
                            <div className="flex gap-6 items-center">
                                <span className="text-white/60 font-label-sm flex items-center gap-2">
                                    Made with pride in India <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                </span>
                            </div>
                        </div>
                        <div>
                            <h6 className="text-white font-label-md mb-8 uppercase tracking-widest text-[12px]">Platform</h6>
                            <ul className="space-y-4">
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Features</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Impact Metrics</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Security</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">API Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h6 className="text-white font-label-md mb-8 uppercase tracking-widest text-[12px]">Company</h6>
                            <ul className="space-y-4">
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Mission</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Partner Hospitals</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Contact Support</a></li>
                                <li><a className="text-white/60 hover:text-white transition-colors text-label-md" href="#">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-white/40 text-label-sm">
                        <span>© 2024 RaktSetu AI. Precision Blood Logistics.</span>
                        <div className="flex gap-8">
                            <a className="hover:text-white" href="#">Twitter</a>
                            <a className="hover:text-white" href="#">LinkedIn</a>
                            <a className="hover:text-white" href="#">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Role Selection Modal */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-6 bg-charcoal-card/40 backdrop-blur-md transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-white rounded-2xl w-full max-w-4xl p-12 relative transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isModalOpen ? 'scale-100' : 'scale-[0.9]'}`}>
                    <button className="absolute top-8 right-8 text-on-surface-variant hover:text-charcoal-card" onClick={() => setIsModalOpen(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-headline-lg mb-4">Choose your journey</h2>
                        <p className="text-body-md text-on-surface-variant">Select the role that matches your intent to continue.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div 
                            className="p-6 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                            onClick={() => navigate('/register-donor')}
                        >
                            <span className="material-symbols-outlined text-primary mb-4">volunteer_activism</span>
                            <h6 className="font-label-md mb-2">Individual Donor</h6>
                            <p className="text-label-sm text-text-muted">Register to donate blood and track impact.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                            <span className="material-symbols-outlined text-primary mb-4">local_hospital</span>
                            <h6 className="font-label-md mb-2">Medical Center</h6>
                            <p className="text-label-sm text-text-muted">Request blood units for patients.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                            <span className="material-symbols-outlined text-primary mb-4">food_bank</span>
                            <h6 className="font-label-md mb-2">Blood Bank</h6>
                            <p className="text-label-sm text-text-muted">Manage inventory and supply logic.</p>
                        </div>
                        <div className="p-6 rounded-xl border border-border-subtle hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
                            <span className="material-symbols-outlined text-primary mb-4">shield</span>
                            <h6 className="font-label-md mb-2">Government</h6>
                            <p className="text-label-sm text-text-muted">District or State level monitoring.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
