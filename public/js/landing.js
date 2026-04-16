// Landing Page Logic
function showLandingPage() {
    document.getElementById('navbar').style.display = 'none';
    const pageContent = document.getElementById('page-content');
    pageContent.classList.add('full-bleed');
    
    pageContent.innerHTML = `
<!-- TopAppBar -->
<nav class="fixed top-0 w-full z-50 bg-[#090e18]/80 backdrop-blur-xl border-b border-[#434854]/15 py-3 sm:py-4">
<div class="max-w-screen-2xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-12">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#72dcff]" data-icon="account_balance_wallet">account_balance_wallet</span>
<span class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-[#72dcff] to-[#a68cff] bg-clip-text text-transparent font-['Inter'] tracking-tight">Nova Credit</span>
</div>
<button onclick="showAuthPage()" class="px-4 sm:px-5 py-2 rounded-xl bg-surface-variant/40 text-on-surface text-sm font-medium border border-outline-variant/15 active:scale-95 transition-transform">
            Login
        </button>
</div>
</nav>
<div class="pt-16 sm:pt-20">
<!-- Hero Section -->
<section class="relative px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden hero-gradient">
<div class="relative z-10 max-w-lg mx-auto text-center">
<span class="inline-block px-3 py-1 mb-4 sm:mb-6 text-xs font-bold tracking-widest uppercase rounded-full bg-secondary-container/30 text-secondary border border-secondary/20">
                    The Future of Finance
                </span>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.1] text-on-surface">
                    Your Credit, <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Reimagined</span>
</h1>
<p class="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-md mx-auto">
                    Experience cloud-native financial management. Instant approvals, real-time insights, and vault-grade security for the modern age.
                </p>
<div class="flex flex-col gap-4 items-center">
<button onclick="showAuthPage()" class="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                        Get Started
                    </button>
<button onclick="showAuthPage()" class="w-full max-w-xs py-4 rounded-xl bg-surface-variant/40 text-on-surface font-semibold border border-outline-variant/20 active:scale-95 transition-all">
                        View Demo
                    </button>
</div>
</div>
<!-- Abstract Hero Asset -->
<div class="mt-16 relative h-64 w-full flex justify-center items-center">
<div class="absolute w-72 h-72 bg-primary/20 rounded-full blur-[80px]"></div>
<div class="glass-card w-64 h-40 rounded-2xl relative z-10 p-6 flex flex-col justify-between overflow-hidden">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-tertiary text-3xl" data-icon="contactless">contactless</span>
<span class="text-on-surface-variant font-medium text-xs">NOVA PLATINUM</span>
</div>
<div class="space-y-1">
<div class="text-on-surface/60 text-[10px] tracking-widest">#### #### #### 8824</div>
<div class="text-on-surface font-medium">ALEXANDER NOVA</div>
</div>
<div class="absolute -right-8 -bottom-8 w-24 h-24 bg-secondary/20 rounded-full blur-2xl"></div>
</div>
</div>
</section>
<!-- Features Section -->
<section class="px-4 sm:px-6 py-12 sm:py-20 bg-surface-container-low">
<div class="max-w-screen-xl mx-auto">
<div class="mb-8 sm:mb-12">
<h2 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 tracking-tight">Smarter Features.</h2>
<p class="text-on-surface-variant text-sm sm:text-base">Designed for the speed of digital life.</p>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<!-- Feature Card 1 -->
<div class="p-6 sm:p-8 rounded-xl bg-surface-container border border-outline-variant/10 group hover:bg-surface-container-high transition-colors">
<div class="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 sm:mb-6">
<span class="material-symbols-outlined text-primary text-2xl" data-icon="bolt">bolt</span>
</div>
<h3 class="text-xl font-bold mb-3">Instant Loan Processing</h3>
<p class="text-on-surface-variant text-sm leading-relaxed">
                            Our proprietary AI algorithms approve financing in under 60 seconds, eliminating wait times.
                        </p>
</div>
<!-- Feature Card 2 -->
<div class="p-6 sm:p-8 rounded-xl bg-surface-container border border-outline-variant/10 group hover:bg-surface-container-high transition-colors">
<div class="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 sm:mb-6">
<span class="material-symbols-outlined text-secondary text-2xl" data-icon="monitoring">monitoring</span>
</div>
<h3 class="text-xl font-bold mb-3">Real-time Transaction Tracking</h3>
<p class="text-on-surface-variant text-sm leading-relaxed">
                            Monitor every cent with millisecond precision and detailed categorical insights.
                        </p>
</div>
<!-- Feature Card 3 -->
<div class="p-6 sm:p-8 rounded-xl bg-surface-container border border-outline-variant/10 group hover:bg-surface-container-high transition-colors">
<div class="w-10 sm:w-12 h-10 sm:h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-4 sm:mb-6">
<span class="material-symbols-outlined text-tertiary text-2xl" data-icon="verified_user">verified_user</span>
</div>
<h3 class="text-xl font-bold mb-3">Secure Payment Verification</h3>
<p class="text-on-surface-variant text-sm leading-relaxed">
                            Biometric-locked transactions ensuring your assets remain yours and yours alone.
                        </p>
</div>
</div>
</div>
</section>
<!-- Credit Score Section -->
<section class="px-4 sm:px-6 py-12 sm:py-20 relative overflow-hidden">
<div class="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px]"></div>
<div class="max-w-md mx-auto text-center relative z-10">
<h2 class="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 tracking-tight">Your Score, Live.</h2>
<div class="relative w-48 sm:w-64 h-48 sm:h-64 mx-auto mb-8 sm:mb-12 flex items-center justify-center">
<!-- Progress Ring (SVG) -->
<svg class="w-full h-full transform -rotate-90">
<circle class="text-surface-container" cx="50%" cy="50%" fill="transparent" r="42%" stroke="currentColor" stroke-width="10"></circle>
<circle cx="50%" cy="50%" fill="transparent" r="42%" stroke="url(#gradient)" stroke-dasharray="264%" stroke-dashoffset="66%" stroke-linecap="round" stroke-width="10"></circle>
<defs>
<lineargradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
<stop offset="0%" stop-color="#72dcff"></stop>
<stop offset="100%" stop-color="#a68cff"></stop>
</lineargradient>
</defs>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-4xl sm:text-5xl font-black text-on-surface">782</span>
<span class="text-primary font-bold text-xs sm:text-sm tracking-widest mt-1 uppercase">Excellent</span>
</div>
</div>
<div class="space-y-6">
<p class="text-on-surface-variant px-4 text-xs sm:text-sm">
                        Updated 2 minutes ago. Your score has improved by <span class="text-tertiary font-bold">+14 points</span> since last month.
                    </p>
<button onclick="showAuthPage()" class="w-full py-4 rounded-xl bg-surface-container-high text-on-surface font-semibold border border-primary/20 shadow-[0_0_15px_rgba(114,220,255,0.1)] active:scale-95 transition-all">
                        Check Your Score
                    </button>
</div>
</div>
</section>
<!-- Social Proof/Trust Section -->
<section class="px-4 sm:px-6 py-12 sm:py-16 bg-surface-container">
<div class="max-w-md mx-auto text-center">
<div class="flex justify-center gap-2 mb-6 sm:mb-8 opacity-60 grayscale brightness-200">
<span class="material-symbols-outlined text-2xl sm:text-3xl" data-icon="shield">shield</span>
<span class="material-symbols-outlined text-2xl sm:text-3xl" data-icon="lock">lock</span>
<span class="material-symbols-outlined text-2xl sm:text-3xl" data-icon="account_balance">account_balance</span>
</div>
<h3 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-on-surface">Bank-Grade Security</h3>
<p class="text-on-surface-variant text-xs sm:text-sm px-4 sm:px-6">
                     Trusted by over <span class="text-on-surface font-bold">500,000+ users</span> worldwide. Protected by 256-bit AES encryption and SOC2 compliance.
                </p>
</div>
</section>
<!-- CTA Footer -->
<section class="px-4 sm:px-6 py-16 sm:py-24 text-center bg-[#0e131e] relative">
<div class="relative z-10">
<h2 class="text-2xl sm:text-3xl font-extrabold mb-6 sm:mb-8 leading-tight">Ready to unlock your <br class="hidden sm:block"/>financial potential?</h2>
<button onclick="showAuthPage()" class="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-lg active:scale-95 transition-all mb-6 sm:mb-8">
                    Create Free Account
                </button>

<p class="text-on-surface-variant text-xs">No credit card required to sign up.</p>
</div>
</section>
</div>
<!-- Footer Component -->
<footer class="w-full border-t border-[#434854]/15 bg-[#0e131e] py-6 md:py-8">
<div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 md:px-12">
<div class="mb-4 md:mb-0 text-center md:text-left">
<span class="text-lg font-bold text-[#e4e8f7]">Nova Credit</span>
<p class="font-['Inter'] text-sm leading-relaxed text-[#a6abb9] mt-2">© 2024 Nova Credit. The Ethereal Vault.</p>
</div>
<div class="flex flex-wrap justify-center gap-4 md:gap-6">
<a class="text-[#a6abb9] text-sm font-['Inter'] hover:text-white transition-colors" href="#" onclick="showPoliciesPage(); return false;">Privacy Policy</a>
<a class="text-[#a6abb9] text-sm font-['Inter'] hover:text-white transition-colors" href="#" onclick="showPoliciesPage(); return false;">Terms of Service</a>
<a class="text-[#a6abb9] text-sm font-['Inter'] hover:text-white transition-colors" href="#">Security</a>
<a class="text-[#a6abb9] text-sm font-['Inter'] hover:text-white transition-colors" href="#">Contact Support</a>
</div>
</div>
</footer>
    `;

    // Ensure we start at top
    window.scrollTo(0, 0);
}
