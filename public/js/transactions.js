// Transactions Page
async function renderTransactionsPage() {
  const pageContent = document.getElementById('page-content');
  showLoading(pageContent);

  try {
    const [transactionsData, statsData] = await Promise.all([
      apiCall('/transactions?limit=100'),
      apiCall('/transactions/stats')
    ]);

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>Transaction History</h2>
          <p class="text-muted">View all your financial transactions</p>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-3" style="margin-bottom: 2rem;">
          <div class="card stats-card">
            <div class="stats-value">${statsData.stats.totalTransactions}</div>
            <div class="stats-label">Total Transactions</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value" style="color: var(--primary);">${formatCurrency(statsData.stats.totalLoanAmount)}</div>
            <div class="stats-label">Total Loans Taken</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value" style="color: var(--success);">${formatCurrency(statsData.stats.totalPaymentAmount)}</div>
            <div class="stats-label">Total Payments Made</div>
          </div>
        </div>
        
        <!-- Filters & Statement Generation -->
        <div class="grid grid-2" style="margin-bottom: 2rem;">
          <!-- Filters -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Search & Filter</h3>
            </div>
            <div class="card-body">
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                <input type="text" id="search-transactions" class="form-input" placeholder="🔍 Search description...">
                <div style="display: flex; gap: 1rem;">
                  <select id="filter-type" class="form-select" style="flex: 1;" onchange="filterTransactions()">
                    <option value="">All Types</option>
                    <option value="loan_approved">Loans</option>
                    <option value="payment">Payments</option>
                    <option value="credit">Credits</option>
                  </select>
                  <button class="btn btn-secondary" onclick="exportTransactions()">
                    📥 Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Generate Statement -->
          <div class="card" style="border: 1px solid var(--primary);">
            <div class="card-header">
              <h3 class="card-title" style="color: var(--primary);">📄 Generate Account Statement</h3>
            </div>
            <div class="card-body">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">From Date</label>
                  <input type="date" id="statement-from" class="form-input" value="${new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0]}">
                </div>
                <div>
                  <label class="form-label" style="font-size: 0.75rem;">To Date</label>
                  <input type="date" id="statement-to" class="form-input" value="${new Date().toISOString().split('T')[0]}">
                </div>
              </div>
              <button class="btn btn-primary" style="width: 100%;" onclick="generateBankStatement()">
                📄 Download Genuine Statement
              </button>
            </div>
          </div>
        </div>
        
        <!-- Transactions Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">All Transactions</h3>
            <p class="card-subtitle" id="transaction-count">${transactionsData.transactions.length} transactions</p>
          </div>
          <div class="card-body">
            ${transactionsData.transactions.length > 0 ? `
              <div class="table-container">
                <table class="table" id="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transactionsData.transactions.map(txn => `
                      <tr class="transaction-row" data-type="${txn.transaction_type}" data-description="${txn.description.toLowerCase()}">
                        <td style="white-space: nowrap;">${formatDate(txn.transaction_date)}</td>
                        <td>
                          <span class="badge badge-${txn.transaction_type === 'payment' ? 'success' : 'primary'}">
                            ${txn.transaction_type === 'payment' ? '💳' : '💰'} ${txn.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>${txn.description}</td>
                        <td style="font-weight: 700; color: ${['payment', 'credit'].includes(txn.transaction_type) ? 'var(--success)' : 'var(--danger)'};">
                          ${['payment', 'credit'].includes(txn.transaction_type) ? '+' : '-'}${formatCurrency(txn.amount)}
                        </td>
                        <td style="font-weight: 600;">${formatCurrency(txn.balance_after || 0)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">📜</div>
                <div class="empty-state-title">No Transactions Yet</div>
                <div class="empty-state-description">Your transaction history will appear here</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    // Setup search
    const searchInput = document.getElementById('search-transactions');
    if (searchInput) {
      searchInput.addEventListener('input', debounce(searchTransactions, 300));
    }
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load transactions: ${error.message}
      </div>
    `;
  }
}

function searchTransactions() {
  const searchTerm = document.getElementById('search-transactions').value.toLowerCase();
  const rows = document.querySelectorAll('.transaction-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const description = row.dataset.description;
    if (description.includes(searchTerm)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  document.getElementById('transaction-count').textContent = `${visibleCount} transactions`;
}

function filterTransactions() {
  const filterType = document.getElementById('filter-type').value;
  const rows = document.querySelectorAll('.transaction-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const type = row.dataset.type;
    if (!filterType || type === filterType) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  document.getElementById('transaction-count').textContent = `${visibleCount} transactions`;
}

function exportTransactions() {
  const rows = document.querySelectorAll('.transaction-row');
  const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');

  if (visibleRows.length === 0) {
    showToast('No transactions to export', 'warning');
    return;
  }

  // Create CSV content
  let csv = 'Date,Type,Description,Amount,Balance After\n';

  visibleRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const date = cells[0].textContent;
    const type = cells[1].textContent.trim();
    const description = cells[2].textContent;
    const amount = cells[3].textContent;
    const balance = cells[4].textContent;

    csv += `"${date}","${type}","${description}","${amount}","${balance}"\n`;
  });

  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nova-credit-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  showToast('Transactions exported successfully!', 'success');
}

async function generateBankStatement() {
  const fromDate = document.getElementById('statement-from').value;
  const toDate = document.getElementById('statement-to').value;

  if (!fromDate || !toDate) {
    showToast('Please select a date range', 'warning');
    return;
  }

  showToast('Generating genuine statement...', 'info');

  try {
    const [transactionsData, profileData] = await Promise.all([
      apiCall(`/transactions?limit=500`),
      apiCall('/profile')
    ]);

    const user = profileData.profile;
    const allTxns = transactionsData.transactions;

    // Filter by date range
    const start = new Date(fromDate);
    const end = new Date(toDate);
    end.setHours(23, 59, 59);

    const filtered = allTxns.filter(t => {
      const d = new Date(t.transaction_date);
      return d >= start && d <= end;
    }).sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

    if (filtered.length === 0) {
      showToast('No transactions found in this range', 'warning');
      return;
    }

    // Calculate Summary
    let totalCredits = 0;
    let totalDebits = 0;
    filtered.forEach(t => {
      const amt = parseFloat(t.amount);
      if (['payment', 'credit'].includes(t.transaction_type)) {
        totalCredits += amt;
      } else {
        totalDebits += amt;
      }
    });

    const closingBalance = filtered[filtered.length - 1].balance_after || 0;
    const openingBalance = (filtered[0].balance_after || 0) - (['payment', 'credit'].includes(filtered[0].transaction_type) ? parseFloat(filtered[0].amount) : -parseFloat(filtered[0].amount));

    // Generate Statement HTML
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Account Statement - ${user.fullName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; color: #1a1a1a; padding: 40px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0052cc; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 800; color: #0052cc; letter-spacing: -1px; }
          .bank-info { text-align: right; font-size: 12px; color: #666; }
          
          .statement-title { font-size: 20px; font-weight: 700; text-align: center; margin-bottom: 30px; text-transform: uppercase; letter-spacing: 2px; }
          
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; font-size: 13px; }
          .info-section h4 { margin: 0 0 10px 0; color: #0052cc; text-transform: uppercase; font-size: 11px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
          
          .summary-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          .summary-table th { background: #0052cc; color: white; padding: 10px; text-align: left; }
          .summary-table td { border: 1px solid #eee; padding: 10px; }
          
          .txn-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .txn-table th { background: #f1f3f5; padding: 12px 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
          .txn-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
          .txn-table tr:nth-child(even) { background: #fafafa; }
          
          .amount-pos { color: #28a745; font-weight: 600; }
          .amount-neg { color: #dc3545; font-weight: 600; }
          
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0052cc; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <div class="logo">NOVA CREDIT</div>
          <div class="bank-info">
            <strong>Nova Credit Financial Services Ltd.</strong><br>
            Level 12, Cyber Tower, Sector 44<br>
            Gurugram, Haryana - 122003<br>
            Support: support@novacredit.com | 1800-200-NOVA
          </div>
        </div>

        <div class="statement-title">Account Statement</div>

        <div class="info-grid">
          <div class="info-section">
            <h4>Customer Details</h4>
            <div class="info-box">
              <strong>${user.fullName}</strong><br>
              Phone: ${user.phone}<br>
              Email: ${user.email}<br>
              Account ID: NC-${user.id.toString().padStart(6, '0')}
            </div>
          </div>
          <div class="info-section">
            <h4>Statement Summary</h4>
            <div class="info-box">
              Period: ${formatDate(fromDate)} to ${formatDate(toDate)}<br>
              Currency: INR (₹)<br>
              Statement Date: ${formatDate(new Date())}
            </div>
          </div>
        </div>

        <table class="summary-table">
          <tr>
            <th>Opening Balance</th>
            <th>Total Credits (+)</th>
            <th>Total Debits (-)</th>
            <th>Closing Balance</th>
          </tr>
          <tr>
            <td>₹${openingBalance.toLocaleString('en-IN')}</td>
            <td style="color: #28a745;">+₹${totalCredits.toLocaleString('en-IN')}</td>
            <td style="color: #dc3545;">-₹${totalDebits.toLocaleString('en-IN')}</td>
            <td style="font-weight: 700;">₹${closingBalance.toLocaleString('en-IN')}</td>
          </tr>
        </table>

        <h4>Transaction Details</h4>
        <table class="txn-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>Description</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td>${formatDate(t.transaction_date)}</td>
                <td>#TXN-${t.id.toString().padStart(8, '0')}</td>
                <td>${t.description}</td>
                <td><span style="text-transform: uppercase; font-size: 10px;">${t.transaction_type.replace('_', ' ')}</span></td>
                <td style="text-align: right;" class="${['payment', 'credit'].includes(t.transaction_type) ? 'amount-pos' : 'amount-neg'}">
                  ${['payment', 'credit'].includes(t.transaction_type) ? '+' : '-'}₹${parseFloat(t.amount).toLocaleString('en-IN')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Important: This is a computer generated document and does not require a physical signature. Nova Credit Financial Services Ltd is a registered NBFC with RBI. Please report any discrepancies within 15 days.</p>
          <p>© 2026 Nova Credit. All Rights Reserved.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

  } catch (error) {
    showToast('Failed to generate statement: ' + error.message, 'danger');
  }
}
