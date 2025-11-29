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
        
        <!-- Filters -->
        <div class="card" style="margin-bottom: 2rem;">
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;">
              <input type="text" id="search-transactions" class="form-input" placeholder="🔍 Search transactions...">
            </div>
            <select id="filter-type" class="form-select" style="width: 200px;" onchange="filterTransactions()">
              <option value="">All Types</option>
              <option value="loan_approved">Loans</option>
              <option value="payment">Payments</option>
            </select>
            <button class="btn btn-secondary" onclick="exportTransactions()">
              📥 Export CSV
            </button>
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
                      <th>Date & Time</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Balance After</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${transactionsData.transactions.map(txn => `
                      <tr class="transaction-row" data-type="${txn.transaction_type}" data-description="${txn.description.toLowerCase()}">
                        <td style="white-space: nowrap;">${formatDateTime(txn.transaction_date)}</td>
                        <td>
                          <span class="badge badge-${txn.transaction_type === 'payment' ? 'success' : 'primary'}">
                            ${txn.transaction_type === 'payment' ? '💳' : '💰'} ${txn.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td>${txn.description}</td>
                        <td style="font-weight: 700; color: ${txn.transaction_type === 'payment' ? 'var(--success)' : 'var(--primary)'};">
                          ${txn.transaction_type === 'payment' ? '-' : '+'}${formatCurrency(txn.amount)}
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
