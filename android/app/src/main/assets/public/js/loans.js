// Global variable to store system params
let systemParams = {
  interest_rate: 6.8,
  max_loan_amount: 1000000,
  min_loan_amount: 1000
};

// Loans Page
async function renderLoansPage() {
  const pageContent = document.getElementById('page-content');
  showLoading(pageContent);

  try {
    // Fetch system parameters and loans in parallel
    const [loansData, paramsData] = await Promise.all([
      apiCall('/loans'),
      apiCall('/parameters') // Public endpoint
    ]);

    if (paramsData.success) {
      systemParams = paramsData.parameters;
    }

    const data = loansData;

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2>Loan Management</h2>
            <p class="text-muted">Apply for loans and manage existing ones</p>
          </div>
          <button class="btn btn-primary" onclick="showLoanApplicationForm()">
            💰 Apply for New Loan
          </button>
        </div>
        
        <!-- Loan Calculator Card -->
        <div class="card card-gradient" style="margin-bottom: 2rem;">
          <h3 style="margin-bottom: 1rem;">Loan Calculator</h3>
          <div class="grid grid-3">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; opacity: 0.9;">Loan Amount</label>
              <input type="number" id="calc-amount" class="form-input" placeholder="₹50,000" value="50000" onchange="calculateLoan()">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; opacity: 0.9;">Term</label>
              <input type="text" class="form-input" value="28 Days (Fixed)" disabled>
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; opacity: 0.9;">Charges</label>
              <input type="text" class="form-input" value="3% App Fee + 3.8% Interest" disabled>
            </div>
          </div>
          <div id="loan-calculation" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.2);">
            <!-- Calculation results will appear here -->
          </div>
        </div>
        
        <!-- Active Loans -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Your Loans</h3>
            <p class="card-subtitle">${data.loans.length} total loans</p>
          </div>
          <div class="card-body">
            ${data.loans.length > 0 ? `
              <div class="grid grid-2">
                ${data.loans.map(loan => `
                  <div class="card" style="background: var(--bg-tertiary);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                      <div>
                        <h4 style="margin-bottom: 0.5rem;">${loan.loan_purpose || 'Personal Loan'}</h4>
                        <span class="badge badge-${getLoanStatusBadge(loan.loan_status)}">${loan.loan_status}</span>
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Loan Amount</div>
                        <div style="font-size: 1.5rem; font-weight: 700;">${formatCurrency(loan.loan_amount)}</div>
                      </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Outstanding</div>
                        <div style="font-weight: 600; color: var(--primary);">${formatCurrency(loan.outstandingBalance || loan.outstanding_balance)}</div>
                      </div>
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Total Due</div>
                        <div style="font-weight: 600;">${formatCurrency(loan.monthly_payment)}</div>
                      </div>
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">App Fee</div>
                        <div style="font-weight: 600;">${formatCurrency(loan.applicationFee || Math.round(parseFloat(loan.loan_amount) * 0.03))}</div>
                      </div>
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Interest (28 Days)</div>
                        <div style="font-weight: 600;">${formatCurrency(loan.interestAmount || Math.round(parseFloat(loan.loan_amount) * 0.038))}</div>
                      </div>
                      ${loan.penaltyAmount > 0 ? `
                        <div>
                          <div style="font-size: 0.875rem; color: var(--text-muted);">Penalty</div>
                          <div style="font-weight: 600; color: var(--danger);">${formatCurrency(loan.penaltyAmount)}</div>
                        </div>
                        <div>
                          <div style="font-size: 0.875rem; color: var(--text-muted);">Days Overdue</div>
                          <div style="font-weight: 600; color: var(--danger);">${loan.daysOverdue}</div>
                        </div>
                      ` : ''}
                      ${loan.comments ? `
                        <div style="grid-column: span 2; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255,255,255,0.1);">
                          <div style="font-size: 0.875rem; color: var(--text-muted);">Comments</div>
                          <div style="font-size: 0.9rem; font-style: italic;">"${loan.comments}"</div>
                        </div>
                      ` : ''}

                    </div>
                    
                    <div style="padding-top: 1rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.5rem;">
                      <button class="btn btn-sm btn-primary" onclick="viewLoanDetails(${loan.id})" style="flex: 1;">View Details</button>
                      ${AppState.user.isAdmin && loan.loan_status === 'pending' ? `
                        <button class="btn btn-sm btn-success" onclick="approveLoan(${loan.id})" style="flex: 1;">Approve</button>
                      ` : ''}
                      ${loan.outstanding_balance > 0 ? `
                        <button class="btn btn-sm btn-success" onclick="navigateToPage('payments')" style="flex: 1;">Make Payment</button>
                      ` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">💰</div>
                <div class="empty-state-title">No Loans Yet</div>
                <div class="empty-state-description">Apply for your first loan to get started</div>
                <button class="btn btn-primary" onclick="showLoanApplicationForm()">Apply Now</button>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    calculateLoan();
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load loans: ${error.message}
      </div>
    `;
  }
}

function calculateLoan() {
  const amount = parseFloat(document.getElementById('calc-amount')?.value || 50000);

  // Fee breakdown: 3% application fee + 3.8% interest for 28 days = 6.8% total
  const applicationFee = Math.round(amount * 0.03);
  const interestAmount = Math.round(amount * 0.038);
  const totalDue = amount + applicationFee + interestAmount;

  const resultDiv = document.getElementById('loan-calculation');
  if (resultDiv) {
    resultDiv.innerHTML = `
      <div class="grid grid-3">
        <div>
          <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Application Fee</div>
          <div style="font-size: 2rem; font-weight: 800;">${formatCurrency(applicationFee)}</div>
        </div>
        <div>
          <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Interest (28 Days)</div>
          <div style="font-size: 2rem; font-weight: 800;">${formatCurrency(interestAmount)}</div>
        </div>
        <div>
          <div style="font-size: 0.875rem; opacity: 0.9; margin-bottom: 0.5rem;">Total Repayment</div>
          <div style="font-size: 2rem; font-weight: 800;">${formatCurrency(totalDue)}</div>
        </div>
      </div>
    `;
  }
}

function showLoanApplicationForm() {
  const formContent = `
    <form id="loan-application-form">
      <div class="form-group">
        <label class="form-label">Loan Amount (₹)</label>
        <input type="number" id="loan-amount" class="form-input" placeholder="Enter amount" min="1000" max="1000000" required>
        <small class="text-muted">Maximum: ₹10,00,000</small>
      </div>
      
      <div class="form-group">
        <label class="form-label">Loan Purpose</label>
        <select id="loan-purpose" class="form-select" required>
          <option value="">Select purpose</option>
          <option value="Personal">Personal</option>
          <option value="Education">Education</option>
          <option value="Medical">Medical</option>
          <option value="Business">Business</option>
          <option value="Home Improvement">Home Improvement</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="form-label">Comments (Optional)</label>
        <textarea id="loan-comments" class="form-textarea" placeholder="Add any notes or comments here..."></textarea>
      </div>

      <div class="card" style="background: var(--bg-tertiary); margin-bottom: 1rem;">
        <h4 style="margin-bottom: 1rem;">Bank Details for Disbursement</h4>
        <div class="form-group">
          <label class="form-label">Bank Name</label>
          <input type="text" id="bank-name" class="form-input" placeholder="e.g. HDFC Bank" required>
        </div>
        <div class="form-group">
          <label class="form-label">Account Number</label>
          <input type="text" id="account-number" class="form-input" placeholder="Enter account number" required>
        </div>
        <div class="form-group">
          <label class="form-label">IFSC Code</label>
          <input type="text" id="ifsc-code" class="form-input" placeholder="e.g. HDFC0001234" required>
        </div>
      </div>
      
      <div class="alert alert-info">
        <strong>Application Fee:</strong> 3% of loan amount (one-time)<br>
        <strong>Interest (28 Days):</strong> 3.8% of loan amount<br>
        <strong>Term:</strong> Fixed 28 Days (Single Repayment)<br>
        <strong>Note:</strong> Full amount + fees is due at the end of the term.
      </div>
    </form>
  `;

  const overlay = createModal('Apply for Loan', formContent, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: 'Submit Application',
      className: 'btn btn-primary',
      onClick: async () => {
        const amount = document.getElementById('loan-amount').value;
        const purpose = document.getElementById('loan-purpose').value;
        const comments = document.getElementById('loan-comments').value;
        const bankName = document.getElementById('bank-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const ifscCode = document.getElementById('ifsc-code').value;

        if (!amount || !purpose || !bankName || !accountNumber || !ifscCode) {
          showToast('Please fill in all required fields', 'danger');
          return;
        }

        try {
          await apiCall('/loans/apply', {
            method: 'POST',
            body: JSON.stringify({
              loanAmount: parseFloat(amount),
              loanPurpose: purpose,
              comments,
              bankName,
              accountNumber,
              ifscCode
            })
          });

          showToast('Loan application submitted successfully!', 'success');
          closeModal(overlay);
          renderLoansPage(); // Refresh
        } catch (error) {
          showToast(error.message, 'danger');
        }
      }
    }
  ]);
}

async function approveLoan(loanId) {
  try {
    await apiCall(`/loans/${loanId}/approve`, { method: 'POST' });
    showToast('Loan approved successfully!', 'success');
    renderLoansPage();
  } catch (error) {
    showToast(error.message || 'Failed to approve loan', 'danger');
  }
}

async function viewLoanDetails(loanId) {
  try {
    const data = await apiCall(`/loans/${loanId}`);
    const loan = data.loan;

    // Fee breakdown
    const principal = parseFloat(loan.loan_amount);
    const appFee = loan.applicationFee || Math.round(principal * 0.03);
    const interest = loan.interestAmount || Math.round(principal * 0.038);

    const content = `
      <div style="display: grid; gap: 1rem;">
        <div>
          <strong>Loan Amount:</strong> ${formatCurrency(loan.loan_amount)}
        </div>
        <div style="padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-md);">
          <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Charges Breakdown</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span>Application Fee</span>
            <strong>${formatCurrency(appFee)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
            <span>Interest (28 Days)</span>
            <strong>${formatCurrency(interest)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); margin-top: 0.5rem; padding-top: 0.5rem;">
            <span>Total Due</span>
            <strong style="color: var(--primary);">${formatCurrency(loan.monthly_payment)}</strong>
          </div>
        </div>
        <div>
          <strong>Outstanding Balance:</strong> ${formatCurrency(loan.outstandingBalance || loan.outstanding_balance)}
        </div>
        <div>
          <strong>Status:</strong> <span class="badge badge-${getLoanStatusBadge(loan.loan_status)}">${loan.loan_status}</span>
        </div>
        <div>
          <strong>Application Date:</strong> ${formatDate(loan.application_date)}
        </div>
        ${loan.approval_date ? `<div><strong>Approval Date:</strong> ${formatDate(loan.approval_date)}</div>` : ''}
        ${loan.due_date ? `<div><strong>Due Date:</strong> ${formatDate(loan.due_date)}</div>` : ''}
        ${loan.penaltyAmount > 0 ? `
          <div class="alert alert-danger">
            <strong>Penalty:</strong> ${formatCurrency(loan.penaltyAmount)}<br>
            <strong>Days Overdue:</strong> ${loan.daysOverdue}
          </div>
        ` : ''}
      </div>
    `;

    createModal('Loan Details', content, [
      { text: 'Close', className: 'btn btn-secondary' }
    ]);
  } catch (error) {
    showToast(error.message || 'Failed to load loan details', 'danger');
  }
}

function getLoanStatusBadge(status) {
  const badges = {
    'pending': 'warning',
    'approved': 'success',
    'active': 'primary',
    'paid': 'success',
    'rejected': 'danger'
  };
  return badges[status] || 'secondary';
}
