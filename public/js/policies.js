// Policies Page Logic
function showPoliciesPage() {
    document.getElementById('navbar').style.display = 'none';
    const pageContent = document.getElementById('page-content');
    pageContent.classList.add('full-bleed');
    
    pageContent.innerHTML = `
<!-- TopAppBar -->
<nav class="fixed top-0 w-full z-50 py-3 sm:py-4 backdrop-blur-xl bg-opacity-60 border-b border-[#72dcff]/20 bg-[#090e18] shadow-none">
<div class="max-w-screen-2xl mx-auto flex justify-between items-center px-4 sm:px-6">
<div class="flex items-center gap-2 sm:gap-3" style="cursor: pointer;" onclick="showLandingPage()">
<span class="material-symbols-outlined text-[#72dcff] text-xl sm:text-2xl" data-icon="account_balance">account_balance</span>
<span class="text-lg sm:text-2xl font-bold tracking-tighter text-[#72dcff] font-['Inter']">Nova Credit</span>
</div>
<div class="flex gap-4 items-center">
<button onclick="showAuthPage()" class="px-4 sm:px-5 py-2 rounded-xl bg-surface-variant/40 text-on-surface text-sm font-medium border border-outline-variant/15 active:scale-95 transition-transform">
            Login
        </button>
</div>
</div>
</nav>

<!-- Mobile Tab Navigation (visible only on small screens) -->
<div class="md:hidden fixed top-[52px] left-0 w-full z-40 bg-[#0e131e] border-b border-[#434854]/20 overflow-x-auto">
<div class="flex gap-1 px-2 py-2 min-w-max">
<button onclick="switchPolicySection('terms')" data-section="terms" class="mobile-policy-tab active whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#591adc] text-white transition-all">Terms</button>
<button onclick="switchPolicySection('loan')" data-section="loan" class="mobile-policy-tab whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#a6abb9] bg-transparent transition-all">Loan</button>
<button onclick="switchPolicySection('privacy')" data-section="privacy" class="mobile-policy-tab whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#a6abb9] bg-transparent transition-all">Privacy</button>
<button onclick="switchPolicySection('fees')" data-section="fees" class="mobile-policy-tab whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#a6abb9] bg-transparent transition-all">Fees</button>
</div>
</div>

<div class="pt-[92px] md:pt-16 min-h-screen bg-[#090e18]">
<div class="max-w-screen-2xl mx-auto flex flex-col md:flex-row relative px-4 sm:px-6">
<!-- Desktop NavigationDrawer (hidden on mobile) -->
<aside class="w-64 sticky top-16 hidden md:flex flex-col gap-2 pt-8 h-[calc(100vh-64px)] scrollbar-hide">
<div class="px-6 mb-6">
<h3 class="font-black text-[#72dcff] font-['Inter'] text-sm uppercase tracking-widest">Legal &amp; Compliance</h3>
</div>
<nav id="policies-sidebar" class="flex flex-col gap-2">
<a onclick="switchPolicySection('terms')" class="policy-nav-link active bg-[#591adc] text-white rounded-xl mx-2 px-4 py-3 shadow-[0_0_15px_rgba(89,26,220,0.3)] flex items-center gap-3 cursor-pointer transition-all" data-section="terms">
<span class="material-symbols-outlined" data-icon="gavel">gavel</span>
<span class="font-['Inter'] text-sm uppercase tracking-widest">Terms & Conditions</span>
</a>
<a onclick="switchPolicySection('loan')" class="policy-nav-link text-[#a6abb9] px-4 py-3 mx-2 hover:bg-[#19202d] rounded-xl flex items-center gap-3 cursor-pointer hover:text-[#e4e8f7] transition-all" data-section="loan">
<span class="material-symbols-outlined" data-icon="description">description</span>
<span class="font-['Inter'] text-sm uppercase tracking-widest">Loan Agreement</span>
</a>
<a onclick="switchPolicySection('privacy')" class="policy-nav-link text-[#a6abb9] px-4 py-3 mx-2 hover:bg-[#19202d] rounded-xl flex items-center gap-3 cursor-pointer hover:text-[#e4e8f7] transition-all" data-section="privacy">
<span class="material-symbols-outlined" data-icon="shield">shield</span>
<span class="font-['Inter'] text-sm uppercase tracking-widest">Privacy Policy</span>
</a>
<a onclick="switchPolicySection('fees')" class="policy-nav-link text-[#a6abb9] px-4 py-3 mx-2 hover:bg-[#19202d] rounded-xl flex items-center gap-3 cursor-pointer hover:text-[#e4e8f7] transition-all" data-section="fees">
<span class="material-symbols-outlined" data-icon="payments">payments</span>
<span class="font-['Inter'] text-sm uppercase tracking-widest">Fees & Penalties</span>
</a>
</nav>
</aside>

<!-- Main Content Area -->
<main class="flex-1 px-4 sm:px-8 md:px-16 py-8 sm:py-12 text-[#e4e8f7]">
<div class="max-w-4xl">

<!-- ======================== -->
<!-- TERMS & CONDITIONS       -->
<!-- ======================== -->
<div id="section-terms" class="policy-section">
<header class="mb-10 sm:mb-16">
<div class="inline-block px-3 py-1 mb-4 rounded-full bg-[#591adc]/20 border border-[#a68cff]/20">
<span class="text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[#a68cff] uppercase">Legal Framework</span>
</div>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6 bg-gradient-to-r from-[#72dcff] to-[#a68cff] bg-clip-text text-transparent">
    Terms & Conditions
</h1>
<p class="text-[#a6abb9] text-base sm:text-lg max-w-2xl leading-relaxed">
    By using Nova Credit's services, you agree to the following terms governing loan issuance, repayment, penalties, and platform usage.
</p>
</header>

<article class="space-y-12">

<!-- Section: Eligibility -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#72dcff] rounded-full"></span>
1. Eligibility & Account Registration
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<ul class="space-y-4">
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">01.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Valid Identity Required</span>
<span class="text-[#a6abb9] text-sm">Users must provide a valid PAN Card number, full legal name, email address, and 10-digit phone number during registration.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">02.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Email Verification (OTP)</span>
<span class="text-[#a6abb9] text-sm">A 6-digit One-Time Password will be sent to your registered email. You must verify this OTP to complete registration. OTPs expire after 10 minutes.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">03.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">One Account Per User</span>
<span class="text-[#a6abb9] text-sm">Each user may maintain only one active account. Duplicate accounts will result in suspension of all associated accounts.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">04.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Account Security</span>
<span class="text-[#a6abb9] text-sm">Passwords must be at least 6 characters. You are solely responsible for maintaining the confidentiality of your credentials. Nova Credit will never ask for your password via email.</span>
</div>
</li>
</ul>
</div>
</section>

<!-- Section: Loan Terms -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#a68cff] rounded-full"></span>
2. Loan Terms & Repayment
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<ul class="space-y-4">
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">01.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Fixed 28-Day Loan Period</span>
<span class="text-[#a6abb9] text-sm">All loans issued by Nova Credit have a fixed term of <strong class="text-[#72dcff]">28 days</strong> from the date of approval (not application). There is no option to select longer or shorter tenures.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">02.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Single Full Repayment (No EMI)</span>
<span class="text-[#a6abb9] text-sm">The full outstanding amount (Principal + Interest) must be repaid in a <strong class="text-[#72dcff]">single lump-sum payment</strong> before the due date. Nova Credit does not offer EMI-based repayment.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">03.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Simple Interest Model</span>
<span class="text-[#a6abb9] text-sm">Interest is calculated as <strong class="text-[#72dcff]">simple interest</strong> at the prevailing rate (default: 6.8%) applied to the principal amount. Interest is added to the outstanding balance immediately upon loan approval.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">04.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Admin Approval Required</span>
<span class="text-[#a6abb9] text-sm">All loan applications are subject to admin review and approval. A loan is not considered active until it has been approved by the Nova Credit administrative team.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">05.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Due Date Reminders</span>
<span class="text-[#a6abb9] text-sm">You will receive an automated email reminder <strong class="text-[#72dcff]">24 hours before</strong> your loan due date. It is your responsibility to ensure timely repayment regardless of email delivery.</span>
</div>
</li>
</ul>
</div>
</section>

<!-- Section: Credit Limits -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#81ecff] rounded-full"></span>
3. Credit Limits & Loan Amounts
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-6">
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
<div class="p-6 bg-[#141a26] rounded-xl text-center">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">Minimum Loan</span>
<span class="block text-2xl font-black text-[#72dcff]">₹1,000</span>
</div>
<div class="p-6 bg-[#141a26] rounded-xl text-center">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">Maximum Loan</span>
<span class="block text-2xl font-black text-[#a68cff]">₹10,00,000</span>
</div>
<div class="p-6 bg-[#141a26] rounded-xl text-center">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">Default Credit Limit</span>
<span class="block text-2xl font-black text-[#81ecff]">₹10,000</span>
</div>
</div>
<p class="text-[#a6abb9] text-sm leading-relaxed">
Your available credit is calculated as: <strong class="text-[#e4e8f7]">Credit Limit − Total Outstanding Debt</strong>. Outstanding debt includes all approved/active loans plus any accrued penalties. You cannot apply for a loan exceeding your available credit. Credit limits may be adjusted by the admin at their discretion based on your repayment history.
</p>
</div>
</section>

<!-- Section: Penalties (CRITICAL) -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#ff716c] rounded-full"></span>
4. Late Payment Penalties
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-6 border-l-4 border-[#ff716c]/40">
<div class="p-6 bg-[#1f0a0a] rounded-xl border border-[#ff716c]/20 mb-6">
<div class="flex items-start gap-4">
<span class="material-symbols-outlined text-[#ff716c] text-3xl mt-1" data-icon="warning">warning</span>
<div>
<h4 class="font-bold text-[#ff716c] text-lg mb-2">Penalty Structure — Read Carefully</h4>
<p class="text-[#a6abb9] text-sm leading-relaxed">
If you fail to repay your loan by the due date, a daily penalty will be applied automatically starting from the day after the due date.
</p>
</div>
</div>
</div>
<ul class="space-y-4">
<li class="flex gap-4">
<span class="text-[#ff716c] font-bold">01.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Daily Penalty Rate</span>
<span class="text-[#a6abb9] text-sm">A flat penalty of <strong class="text-[#ff716c]">₹1,250 per day</strong> is charged for every day your payment remains overdue, regardless of the loan amount.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#ff716c] font-bold">02.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Penalty Accrual</span>
<span class="text-[#a6abb9] text-sm">Penalties accumulate daily and are added to your total outstanding balance. The penalty calculation uses IST (Indian Standard Time) midnight as the cutoff for each day.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#ff716c] font-bold">03.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Total Amount Due</span>
<span class="text-[#a6abb9] text-sm">Your total repayment becomes: <strong class="text-[#ff716c]">Outstanding Balance + (₹1,250 × Days Overdue)</strong>. For example, if you are 5 days late, an additional ₹6,250 will be added to your balance.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#ff716c] font-bold">04.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Overdue Email Notifications</span>
<span class="text-[#a6abb9] text-sm">Daily automated overdue penalty alerts are sent to your registered email address once penalties start accruing. These emails will state the current penalty amount and the total balance due.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#ff716c] font-bold">05.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Impact on Credit</span>
<span class="text-[#a6abb9] text-sm">Overdue penalties reduce your available credit. You will not be able to apply for new loans if your total debt (including penalties) exceeds your assigned credit limit.</span>
</div>
</li>
</ul>
</div>
</section>

<!-- Section: Payment Process -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#72dcff] rounded-full"></span>
5. Payment Process
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<ul class="space-y-4">
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">01.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Payment Submission</span>
<span class="text-[#a6abb9] text-sm">To make a payment, submit a payment request through the Nova Credit platform. You may upload a payment receipt or transaction reference for verification.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">02.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Admin Verification</span>
<span class="text-[#a6abb9] text-sm">All payments require <strong class="text-[#72dcff]">admin approval</strong> before they are applied to your loan balance. Payments may be approved or rejected based on verification of funds received.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#72dcff] font-bold">03.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Loan Closure</span>
<span class="text-[#a6abb9] text-sm">Once a payment is approved and the outstanding balance reaches ₹0, the loan status is automatically updated to <strong class="text-[#72dcff]">"Paid"</strong>. No further action is required.</span>
</div>
</li>
</ul>
</div>
</section>

<!-- Section: Platform Rules -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#a68cff] rounded-full"></span>
6. General Platform Rules
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<ul class="space-y-4">
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">01.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Parameter Changes</span>
<span class="text-[#a6abb9] text-sm">Nova Credit reserves the right to change the interest rate, penalty rate, credit limits, and loan amount bounds at any time. Changes apply to new loans only; existing loans retain their original terms.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">02.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Account Termination</span>
<span class="text-[#a6abb9] text-sm">Nova Credit may suspend or terminate accounts that exhibit fraudulent behavior, provide false information, or repeatedly default on loan obligations.</span>
</div>
</li>
<li class="flex gap-4">
<span class="text-[#a68cff] font-bold">03.</span>
<div>
<span class="font-bold block text-[#e4e8f7]">Governing Jurisdiction</span>
<span class="text-[#a6abb9] text-sm">These terms are governed by the laws of India. All times and dates used in penalty and interest calculations follow Indian Standard Time (IST, UTC+5:30).</span>
</div>
</li>
</ul>
</div>
</section>

</article>

<!-- Last Updated -->
<div class="mt-12 sm:mt-20 pt-8 border-t border-[#434854]/15 flex flex-col md:flex-row justify-between items-center gap-4">
<span class="text-[10px] sm:text-xs text-[#a6abb9] font-['Inter']">Last revised: April 16, 2026</span>
<button onclick="showLandingPage()" class="w-full sm:w-auto px-6 py-3 bg-[#1f2634] rounded-xl text-sm font-bold hover:bg-[#19202d] transition-colors active:scale-95 text-white">
    Back to Home
</button>
</div>
</div>

<!-- ======================== -->
<!-- LOAN AGREEMENT           -->
<!-- ======================== -->
<div id="section-loan" class="policy-section" style="display:none;">
<header class="mb-10 sm:mb-16">
<div class="inline-block px-3 py-1 mb-4 rounded-full bg-[#591adc]/20 border border-[#a68cff]/20">
<span class="text-xs font-bold tracking-[0.2em] text-[#a68cff] uppercase">Binding Agreement</span>
</div>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6 bg-gradient-to-r from-[#72dcff] to-[#a68cff] bg-clip-text text-transparent">
    Loan Agreement
</h1>
<p class="text-[#a6abb9] text-base sm:text-lg max-w-2xl leading-relaxed">
    By applying for a loan through Nova Credit, you enter into a binding financial agreement under the following terms.
</p>
</header>
<article class="space-y-12">
<!-- Quick Reference Table -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#72dcff] rounded-full"></span>
Loan Parameter Summary
</h2>
<div class="bg-[#0e131e] rounded-xl overflow-x-auto">
<table class="w-full text-sm min-w-[500px]">
<thead>
<tr class="border-b border-[#434854]/20">
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Parameter</th>
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Value</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Loan Tenure</td>
<td class="p-4 text-[#72dcff] font-bold">28 Days (Fixed)</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Interest Type</td>
<td class="p-4 text-[#72dcff]">Simple Interest (One-time)</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Default Interest Rate</td>
<td class="p-4 text-[#72dcff] font-bold">6.8%</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Repayment Method</td>
<td class="p-4 text-[#72dcff]">Single lump-sum (No EMI)</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Late Payment Penalty</td>
<td class="p-4 text-[#ff716c] font-bold">₹1,250 / day</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Minimum Loan Amount</td>
<td class="p-4">₹1,000</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Maximum Loan Amount</td>
<td class="p-4">₹10,00,000</td>
</tr>
<tr>
<td class="p-4 text-[#e4e8f7] font-semibold">Default Credit Limit</td>
<td class="p-4">₹10,000</td>
</tr>
</tbody>
</table>
</div>
</section>

<!-- Example Calculation -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#a68cff] rounded-full"></span>
Example Calculation
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<p class="text-[#a6abb9] text-sm leading-relaxed mb-4">If you borrow <strong class="text-[#e4e8f7]">₹10,000</strong> at the default rate of <strong class="text-[#72dcff]">6.8%</strong>:</p>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="p-6 bg-[#141a26] rounded-xl">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">Interest Amount</span>
<span class="block text-xl font-bold text-[#72dcff]">₹10,000 × 6.8% = ₹680</span>
</div>
<div class="p-6 bg-[#141a26] rounded-xl">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">Total Repayment Due</span>
<span class="block text-xl font-bold text-[#a68cff]">₹10,680</span>
<span class="block text-xs text-[#a6abb9] mt-1">Due within 28 days of approval</span>
</div>
</div>
<div class="mt-4 p-6 bg-[#1f0a0a] rounded-xl border border-[#ff716c]/20">
<span class="block text-[#a6abb9] text-xs uppercase tracking-widest mb-2">If 5 Days Late</span>
<span class="block text-xl font-bold text-[#ff716c]">₹10,680 + (₹1,250 × 5) = ₹16,930</span>
<span class="block text-xs text-[#a6abb9] mt-1">Penalty of ₹6,250 added to balance</span>
</div>
</div>
</section>

<!-- Disbursement & Bank Details -->
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#81ecff] rounded-full"></span>
Disbursement
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<p class="text-[#a6abb9] text-sm leading-relaxed">
Loan applicants must provide valid bank details (Bank Name, Account Number, and IFSC Code) during the application process. Nova Credit reserves the right to verify these details before disbursement of approved funds.
</p>
</div>
</section>

</article>

<div class="mt-20 pt-8 border-t border-[#434854]/15 flex flex-col md:flex-row justify-between items-center gap-4">
<span class="text-xs text-[#a6abb9] font-['Inter']">Last revised: April 16, 2026</span>
<button onclick="showLandingPage()" class="px-6 py-2 bg-[#1f2634] rounded-full text-xs font-bold hover:bg-[#19202d] transition-colors active:scale-95 text-white">
    Back to Home
</button>
</div>
</div>

<!-- ======================== -->
<!-- PRIVACY POLICY           -->
<!-- ======================== -->
<div id="section-privacy" class="policy-section" style="display:none;">
<header class="mb-10 sm:mb-16">
<div class="inline-block px-3 py-1 mb-4 rounded-full bg-[#591adc]/20 border border-[#a68cff]/20">
<span class="text-xs font-bold tracking-[0.2em] text-[#a68cff] uppercase">Transparency</span>
</div>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6 bg-gradient-to-r from-[#72dcff] to-[#a68cff] bg-clip-text text-transparent">
    Privacy Policy
</h1>
<p class="text-[#a6abb9] text-base sm:text-lg max-w-2xl leading-relaxed">
    Your security is our mandate. This document outlines how Nova Credit handles your financial identity.
</p>
</header>
<article class="space-y-12">
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#72dcff] rounded-full"></span>
1. Data We Collect
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<ul class="space-y-4">
<li class="flex gap-4"><span class="text-[#72dcff] font-bold">01.</span>
<div><span class="font-bold block text-[#e4e8f7]">Identity Information</span><span class="text-[#a6abb9] text-sm">Full name, PAN Card number, email, and phone number provided during registration.</span></div></li>
<li class="flex gap-4"><span class="text-[#72dcff] font-bold">02.</span>
<div><span class="font-bold block text-[#e4e8f7]">Financial Information</span><span class="text-[#a6abb9] text-sm">Loan application details, repayment history, outstanding balances, bank account details (bank name, account number, IFSC code), and transaction records.</span></div></li>
<li class="flex gap-4"><span class="text-[#72dcff] font-bold">03.</span>
<div><span class="font-bold block text-[#e4e8f7]">Usage Data</span><span class="text-[#a6abb9] text-sm">Login timestamps, session data, and platform interaction logs for security auditing and service improvement.</span></div></li>
</ul>
</div>
</section>

<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#a68cff] rounded-full"></span>
2. How We Use Your Data
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<p class="text-[#a6abb9] text-sm leading-relaxed">We use your data solely for: loan processing and credit limit assessment; email notifications (OTP, loan confirmations, due date reminders, and penalty alerts); admin-level account and loan management; and maintaining accurate transaction ledgers.</p>
<p class="text-[#a6abb9] text-sm leading-relaxed">Nova Credit will <strong class="text-[#ff716c]">never sell</strong> your personal data to third-party advertisers or data brokers.</p>
</div>
</section>

<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#81ecff] rounded-full"></span>
3. Data Security
</h2>
<div class="bg-[#0e131e] rounded-xl p-4 sm:p-6 md:p-8 space-y-4">
<p class="text-[#a6abb9] text-sm leading-relaxed">Passwords are hashed using bcrypt. JWT tokens are used for session authentication with configurable expiration. All admin actions are logged with full audit trails including before/after snapshots.</p>
</div>
</section>
</article>

<div class="mt-20 pt-8 border-t border-[#434854]/15 flex flex-col md:flex-row justify-between items-center gap-4">
<span class="text-xs text-[#a6abb9] font-['Inter']">Last revised: April 16, 2026</span>
<button onclick="showLandingPage()" class="px-6 py-2 bg-[#1f2634] rounded-full text-xs font-bold hover:bg-[#19202d] transition-colors active:scale-95 text-white">
    Back to Home
</button>
</div>
</div>

<!-- ======================== -->
<!-- FEES & PENALTIES         -->
<!-- ======================== -->
<div id="section-fees" class="policy-section" style="display:none;">
<header class="mb-10 sm:mb-16">
<div class="inline-block px-3 py-1 mb-4 rounded-full bg-[#591adc]/20 border border-[#a68cff]/20">
<span class="text-xs font-bold tracking-[0.2em] text-[#a68cff] uppercase">Financial Schedule</span>
</div>
<h1 class="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6 bg-gradient-to-r from-[#72dcff] to-[#a68cff] bg-clip-text text-transparent">
    Fees & Penalties
</h1>
<p class="text-[#a6abb9] text-base sm:text-lg max-w-2xl leading-relaxed">
    Complete breakdown of all charges, interest rates, and penalty structures applicable to Nova Credit loans.
</p>
</header>
<article class="space-y-12">
<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#72dcff] rounded-full"></span>
Fee Schedule
</h2>
<div class="bg-[#0e131e] rounded-xl overflow-x-auto">
<table class="w-full text-sm min-w-[500px]">
<thead>
<tr class="border-b border-[#434854]/20">
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Fee Type</th>
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Amount</th>
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">When Applied</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Interest</td>
<td class="p-4 text-[#72dcff] font-bold">6.8% (Default)</td>
<td class="p-4 text-[#a6abb9]">On loan approval, added to principal</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Late Payment Penalty</td>
<td class="p-4 text-[#ff716c] font-bold">₹1,250 / day</td>
<td class="p-4 text-[#a6abb9]">Each day after due date</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Registration Fee</td>
<td class="p-4 text-[#81ecff] font-bold">Free</td>
<td class="p-4 text-[#a6abb9]">No charge</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7] font-semibold">Processing Fee</td>
<td class="p-4 text-[#81ecff] font-bold">Free</td>
<td class="p-4 text-[#a6abb9]">No charge</td>
</tr>
<tr>
<td class="p-4 text-[#e4e8f7] font-semibold">Prepayment Charges</td>
<td class="p-4 text-[#81ecff] font-bold">None</td>
<td class="p-4 text-[#a6abb9]">Pay anytime before due date</td>
</tr>
</tbody>
</table>
</div>
</section>

<section>
<h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
<span class="w-1.5 h-6 bg-[#ff716c] rounded-full"></span>
Penalty Escalation Example
</h2>
<div class="bg-[#0e131e] rounded-xl overflow-x-auto">
<table class="w-full text-sm min-w-[500px]">
<thead>
<tr class="border-b border-[#434854]/20">
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Days Overdue</th>
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Penalty Accrued</th>
<th class="text-left p-4 text-[#a6abb9] font-medium uppercase tracking-widest text-xs">Total Due (₹10K Loan)</th>
</tr>
</thead>
<tbody>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7]">0 (On Time)</td>
<td class="p-4 text-[#81ecff]">₹0</td>
<td class="p-4 text-[#e4e8f7] font-bold">₹10,680</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7]">1 Day</td>
<td class="p-4 text-[#ff716c]">₹1,250</td>
<td class="p-4 text-[#e4e8f7] font-bold">₹11,930</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7]">7 Days</td>
<td class="p-4 text-[#ff716c]">₹8,750</td>
<td class="p-4 text-[#e4e8f7] font-bold">₹19,430</td>
</tr>
<tr class="border-b border-[#434854]/10">
<td class="p-4 text-[#e4e8f7]">14 Days</td>
<td class="p-4 text-[#ff716c]">₹17,500</td>
<td class="p-4 text-[#e4e8f7] font-bold">₹28,180</td>
</tr>
<tr>
<td class="p-4 text-[#e4e8f7]">28 Days</td>
<td class="p-4 text-[#ff716c] font-bold">₹35,000</td>
<td class="p-4 text-[#ff716c] font-bold">₹45,680</td>
</tr>
</tbody>
</table>
</div>
<p class="text-[#a6abb9] text-xs mt-4 italic">* Example assumes ₹10,000 principal with 6.8% interest. Actual amounts depend on your loan principal and the prevailing interest rate at the time of approval.</p>
</section>

</article>

<div class="mt-20 pt-8 border-t border-[#434854]/15 flex flex-col md:flex-row justify-between items-center gap-4">
<span class="text-xs text-[#a6abb9] font-['Inter']">Last revised: April 16, 2026</span>
<button onclick="showLandingPage()" class="px-6 py-2 bg-[#1f2634] rounded-full text-xs font-bold hover:bg-[#19202d] transition-colors active:scale-95 text-white">
    Back to Home
</button>
</div>
</div>

</div>
</main>
</div>
    `;

    // Ensure we start at top
    window.scrollTo(0, 0);

    // Initial section
    switchPolicySection('terms');
}

// Sidebar + Mobile tab navigation switcher
function switchPolicySection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.policy-section').forEach(el => {
        el.style.display = 'none';
    });

    // Show selected section
    const target = document.getElementById('section-' + sectionId);
    if (target) target.style.display = 'block';

    // Update desktop sidebar active states
    document.querySelectorAll('.policy-nav-link').forEach(link => {
        if (link.dataset.section === sectionId) {
            link.className = 'policy-nav-link active bg-[#591adc] text-white rounded-xl mx-2 px-4 py-3 shadow-[0_0_15px_rgba(89,26,220,0.3)] flex items-center gap-3 cursor-pointer transition-all';
        } else {
            link.className = 'policy-nav-link text-[#a6abb9] px-4 py-3 mx-2 hover:bg-[#19202d] rounded-xl flex items-center gap-3 cursor-pointer hover:text-[#e4e8f7] transition-all';
        }
    });

    // Update mobile tab active states
    document.querySelectorAll('.mobile-policy-tab').forEach(tab => {
        if (tab.dataset.section === sectionId) {
            tab.className = 'mobile-policy-tab active whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#591adc] text-white transition-all';
        } else {
            tab.className = 'mobile-policy-tab whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#a6abb9] bg-transparent transition-all';
        }
    });

    // Scroll to top of content
    window.scrollTo(0, 0);
}
