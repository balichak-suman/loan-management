// Dashboard Page
async function renderDashboard() {
  const pageContent = document.getElementById('page-content');
  showLoading(pageContent);

  try {
    // Fetch data
    const [loansData, paymentsData, transactionsData, profileData] = await Promise.all([
      apiCall('/loans'),
      apiCall('/payments/pending'),
      apiCall('/transactions/stats'),
      apiCall('/profile')
    ]);

    const activeLoans = loansData.loans.filter(l => l.outstanding_balance > 0 && l.loan_status === 'approved');
    // Use totalDebt directly from profile data to ensure consistency
    const totalDebt = profileData.profile.loanSummary.totalDebt;
    const totalPending = paymentsData.totalPending || 0;

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>Welcome back, ${AppState.user.fullName}! 👋</h2>
          <p class="text-muted">Here's your financial overview</p>
        </div>
        
        <!-- Stats Grid -->
        <div class="grid grid-4" style="margin-bottom: 2rem;">
          <div class="card stats-card">
            <div class="stats-value">${formatCurrency(totalDebt)}</div>
            <div class="stats-label">Total Outstanding</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value">${activeLoans.length}</div>
            <div class="stats-label">Active Loans</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value">${profileData.profile.creditScore}</div>
            <div class="stats-label">Credit Score</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value">${transactionsData.stats.totalTransactions}</div>
            <div class="stats-label">Total Transactions</div>
          </div>
        </div>
        
        <!-- Main Content Grid -->
        <div class="grid grid-2">
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Quick Actions</h3>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 1rem;">
              <button class="btn btn-primary btn-lg" onclick="navigateToPage('loans')">
                💰 Apply for Loan
              </button>
              <button class="btn btn-success btn-lg" onclick="navigateToPage('payments')">
                💳 Make Payment
              </button>
              <button class="btn btn-secondary btn-lg" onclick="navigateToPage('transactions')">
                📜 View Transactions
              </button>
            </div>
          </div>
          
          <!-- Pending Payments -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Pending Payments</h3>
              <p class="card-subtitle">Total: ${formatCurrency(totalPending)}</p>
            </div>
            <div class="card-body">
              ${paymentsData.pendingPayments.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; padding-right: 0.5rem;">
                  ${paymentsData.pendingPayments.slice(0, 3).map(payment => `
                    <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md); border-left: 4px solid ${payment.isOverdue ? 'var(--danger)' : 'var(--primary)'};">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong>${payment.loanPurpose || 'Loan #' + payment.loanId}</strong>
                        ${payment.isOverdue ? '<span class="badge badge-danger">Overdue</span>' : '<span class="badge badge-warning">Due Soon</span>'}
                      </div>
                      <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                        ${formatCurrency(payment.totalDue)}
                      </div>
                      <div style="font-size: 0.875rem; color: var(--text-muted);">
                        ${payment.isOverdue ? `${payment.daysOverdue} days overdue` : `Due: ${formatDate(payment.dueDate)}`}
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="empty-state">
                  <div class="empty-state-icon">✅</div>
                  <div class="empty-state-title">All Caught Up!</div>
                  <div class="empty-state-description">You have no pending payments</div>
                </div>
              `}
            </div>
          </div>
        </div>
        
        <!-- Recent Transactions -->
        <div class="card" style="margin-top: 2rem;">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
          </div>
          <div class="card-body">
            ${transactionsData.stats.recentTransactions.length > 0 ? `
              <div class="table-container">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transactionsData.stats.recentTransactions.map(txn => `
                      <tr>
                        <td>${formatDate(txn.transaction_date)}</td>
                        <td>
                          <span class="badge badge-${txn.transaction_type === 'payment' ? 'success' : 'primary'}">
                            ${txn.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>${txn.description}</td>
                        <td style="font-weight: 600; color: ${txn.transaction_type === 'payment' ? 'var(--success)' : 'var(--primary)'};">
                          ${txn.transaction_type === 'payment' ? '-' : '+'}${formatCurrency(txn.amount)}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">📜</div>
                <div class="empty-state-title">No Transactions Yet</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load dashboard: ${error.message}
      </div>
    `;
  }
}
