// Payments Page
async function renderPaymentsPage() {
  const pageContent = document.getElementById('page-content');
  showLoading(pageContent);

  try {
    const [pendingData, historyData] = await Promise.all([
      apiCall('/payments/pending'),
      apiCall('/payments/history')
    ]);

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>Payment Management</h2>
          <p class="text-muted">View pending payments and make payments on your loans</p>
        </div>
        
        <!-- Total Pending Card -->
        ${pendingData.pendingPayments.length > 0 ? `
          <div class="card card-gradient" style="margin-bottom: 2rem; text-align: center; padding: 2rem;">
            <h3 style="margin-bottom: 0.5rem;">Total Amount Due</h3>
            <div style="font-size: 3rem; font-weight: 800; margin-bottom: 1rem;">
              ${formatCurrency(pendingData.totalPending)}
            </div>
            <p style="opacity: 0.9;">Across ${pendingData.pendingPayments.length} loan(s)</p>
          </div>
        ` : ''}
        
        <!-- Pending Payments -->
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title">Pending Loans</h3>
            <p class="card-subtitle">Make payments to reduce your outstanding balance</p>
          </div>
          <div class="card-body">
            ${pendingData.pendingPayments.length > 0 ? `
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${pendingData.pendingPayments.map(payment => `
                  <div class="card" style="background: var(--bg-tertiary); border-left: 4px solid ${payment.isOverdue ? 'var(--danger)' : 'var(--warning)'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                      <div>
                        <h4 style="margin-bottom: 0.5rem;">${payment.loanPurpose || 'Loan #' + payment.loanId}</h4>
                        ${payment.isOverdue ?
        `<span class="badge badge-danger">⚠️ ${payment.daysOverdue} days overdue</span>` :
        `<span class="badge badge-warning">Due: ${formatDate(payment.dueDate)}</span>`
      }
                      </div>
                      <div style="text-align: right;">
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Total Due</div>
                        <div style="font-size: 2rem; font-weight: 800; color: ${payment.isOverdue ? 'var(--danger)' : 'var(--warning)'};">
                          ${formatCurrency(payment.totalDue)}
                        </div>
                      </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: var(--radius-md);">
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Principal</div>
                        <div style="font-weight: 600;">${formatCurrency(payment.outstandingBalance)}</div>
                      </div>
                      ${payment.penaltyAmount > 0 ? `
                        <div>
                          <div style="font-size: 0.875rem; color: var(--text-muted);">Penalty</div>
                          <div style="font-weight: 600; color: var(--danger);">${formatCurrency(payment.penaltyAmount)}</div>
                        </div>
                      ` : ''}
                      <div>
                        <div style="font-size: 0.875rem; color: var(--text-muted);">Monthly Payment</div>
                        <div style="font-weight: 600;">${formatCurrency(payment.monthlyPayment)}</div>
                      </div>
                    </div>
                    
                    ${payment.isOverdue && payment.penaltyAmount > 0 ? `
                      <div class="alert alert-danger" style="margin-bottom: 1rem;">
                        <strong>⚠️ Late Payment Penalty Applied</strong><br>
                        Penalty: ₹1,300 per ₹10,000 per day (${payment.daysOverdue} days overdue)<br>
                        Total Penalty: ${formatCurrency(payment.penaltyAmount)}
                      </div>
                    ` : ''}
                    
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-success" onclick="showPaymentForm(${payment.loanId}, ${payment.totalDue}, '${payment.loanPurpose || 'Loan #' + payment.loanId}')" style="flex: 1;">
                        💳 Make Payment
                      </button>
                      <button class="btn btn-secondary" onclick="viewLoanDetails(${payment.loanId})">
                        View Details
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-title">No Pending Payments</div>
                <div class="empty-state-description">You're all caught up! No outstanding loan payments.</div>
              </div>
            `}
          </div>
        </div>
        
        <!-- Payment History -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Payment History</h3>
            <p class="card-subtitle">${historyData.payments.length} payments made</p>
          </div>
          <div class="card-body">
            ${historyData.payments.length > 0 ? `
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Loan ID</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${historyData.payments.map(payment => `
                      <tr>
                        <td>${formatDateTime(payment.payment_date)}</td>
                        <td>#${payment.loan_id || 'N/A'}</td>
                        <td style="font-weight: 600; color: var(--success);">${formatCurrency(payment.payment_amount)}</td>
                        <td><span class="badge badge-primary">${payment.payment_type}</span></td>
                        <td><span class="badge badge-success">${payment.payment_status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">💳</div>
                <div class="empty-state-title">No Payment History</div>
                <div class="empty-state-description">Your payment history will appear here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load payments: ${error.message}
      </div>
    `;
  }
}

function showPaymentForm(loanId, amount, loanName) {
  // Assuming 'loan' object is available or can be fetched/constructed
  // For this example, we'll use the 'amount' passed and a dummy 'loan' object for max value
  const loan = {
    id: loanId,
    outstandingBalance: amount // Use the totalDue as outstandingBalance for max input
  };

  const content = `
    <div style="text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <p style="margin-bottom: 0.5rem; color: var(--text-secondary);">Scan to Pay</p>
        <div style="background: white; padding: 1rem; display: inline-block; border-radius: 1rem;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=novacredit@upi&pn=NovaCredit&am=${amount}&cu=INR" alt="Payment QR" style="width: 150px; height: 150px;">
        </div>
        <p style="margin-top: 0.5rem; font-size: 0.9rem;">Amount: ${formatCurrency(amount)}</p>
      </div>

      <form id="payment-form">
        <div class="form-group" style="text-align: left;">
          <label class="form-label">Payment Amount (₹)</label>
          <input type="number" id="payment-amount" class="form-input" value="${amount}" readonly style="background-color: var(--bg-secondary); cursor: not-allowed;">
        </div>
        
        <div class="form-group" style="text-align: left;">
          <label class="form-label">Attach Screenshot (Proof)</label>
          <input type="file" id="payment-proof" class="form-input" accept="image/*" required>
          <small class="text-muted">Please upload the payment success screenshot.</small>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
          Submit Payment Request
        </button>
      </form>
    </div>
  `;

  createModal('Make Payment', content, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    }
  ]);

  // Add event listener to form
  setTimeout(() => {
    const form = document.getElementById('payment-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        handlePaymentSubmit(loanId);
      };
    }
  }, 100);
}

async function handlePaymentSubmit(loanId) {
  const paymentAmount = parseFloat(document.getElementById('payment-amount').value);
  const proofFile = document.getElementById('payment-proof').files[0];

  if (!paymentAmount || paymentAmount <= 0) {
    showToast('Please enter a valid payment amount', 'danger');
    return;
  }

  if (!proofFile) {
    showToast('Please attach a payment proof screenshot', 'danger');
    return;
  }

  // Simulate file upload by using the filename
  // In a real app, we would use FormData to upload the file
  const proofImage = proofFile.name;

  try {
    const data = await apiCall('/payments', {
      method: 'POST',
      body: JSON.stringify({ loanId, paymentAmount, proofImage })
    });

    // Show success message
    const successMessage = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
        <h3>Payment Submitted!</h3>
        <p>Your payment of <strong>${formatCurrency(paymentAmount)}</strong> has been submitted for approval.</p>
        <p class="text-muted">An admin will review your proof and update your balance shortly.</p>
      </div>
    `;

    createModal('Payment Pending Approval', successMessage, [
      {
        text: 'Back to Dashboard',
        className: 'btn btn-primary',
        onClick: () => navigateToPage('dashboard')
      },
      {
        text: 'View Payments',
        className: 'btn btn-secondary',
        onClick: () => renderPaymentsPage()
      }
    ]);

    showToast('Payment submitted successfully!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to submit payment', 'danger');
  }
}
