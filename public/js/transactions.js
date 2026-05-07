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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          
          :root {
            --bank-blue: #003366;
            --bank-gold: #b38b00;
            --text-main: #1a1a1a;
            --text-muted: #4a4a4a;
            --border-light: #e0e0e0;
          }

          body { 
            font-family: 'Inter', sans-serif; 
            color: var(--text-main); 
            padding: 0; 
            margin: 0;
            background: #f0f2f5;
          }

          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
          }

          /* Watermark */
          .page::before {
            content: "NOVA CREDIT OFFICIAL";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(0, 51, 102, 0.03);
            white-space: nowrap;
            pointer-events: none;
            z-index: 0;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid var(--bank-blue);
            padding-bottom: 20px;
            margin-bottom: 30px;
            position: relative;
            z-index: 1;
          }

          .logo-area .bank-name {
            font-size: 28px;
            font-weight: 800;
            color: var(--bank-blue);
            letter-spacing: -1.5px;
            line-height: 1;
          }

          .logo-area .bank-tagline {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: var(--bank-gold);
            font-weight: 700;
            margin-top: 5px;
          }

          .verify-qr {
            text-align: right;
          }

          .verify-qr img {
            width: 80px;
            height: 80px;
            border: 1px solid #eee;
            padding: 5px;
          }

          .verify-qr p {
            font-size: 8px;
            color: #888;
            margin: 5px 0 0 0;
          }

          .statement-header {
            text-align: center;
            margin-bottom: 40px;
            position: relative;
          }

          .statement-header h1 {
            font-size: 22px;
            margin: 0;
            color: var(--bank-blue);
            text-transform: uppercase;
            letter-spacing: 4px;
          }

          .statement-header p {
            font-size: 12px;
            color: var(--text-muted);
            margin: 5px 0;
          }

          .details-grid {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
            font-size: 13px;
            position: relative;
            z-index: 1;
          }

          .section-title {
            font-size: 11px;
            font-weight: 700;
            color: var(--bank-blue);
            text-transform: uppercase;
            border-bottom: 1px solid var(--bank-blue);
            padding-bottom: 5px;
            margin-bottom: 15px;
          }

          .info-card {
            background: #fff;
            line-height: 1.8;
          }

          .summary-strip {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1px;
            background: var(--bank-blue);
            border: 1px solid var(--bank-blue);
            margin-bottom: 40px;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
            z-index: 1;
          }

          .summary-item {
            background: white;
            padding: 15px;
            text-align: center;
          }

          .summary-label {
            font-size: 10px;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 5px;
            font-weight: 600;
          }

          .summary-value {
            font-size: 15px;
            font-weight: 700;
            color: var(--bank-blue);
          }

          .txn-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            position: relative;
            z-index: 1;
          }

          .txn-table th {
            background: #f8f9fa;
            color: var(--bank-blue);
            padding: 12px 8px;
            text-align: left;
            border-bottom: 2px solid var(--bank-blue);
            font-weight: 700;
            text-transform: uppercase;
          }

          .txn-table td {
            padding: 12px 8px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
          }

          .txn-table tr:nth-child(even) { background: #fafafa; }

          .mono { font-family: 'JetBrains Mono', monospace; font-size: 10px; }
          
          .amt-cr { color: #1e7e34; font-weight: 700; }
          .amt-dr { color: #bd2130; font-weight: 700; }

          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 10px;
            color: #888;
            position: relative;
            z-index: 1;
          }

          .signature-area {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 40px;
          }

          .stamp {
            border: 2px double #003366;
            color: #003366;
            padding: 5px 15px;
            font-weight: 900;
            transform: rotate(-10deg);
            opacity: 0.6;
            font-size: 14px;
            text-transform: uppercase;
            display: inline-block;
          }

          @media print {
            body { background: white; padding: 0; margin: 0; }
            .page { margin: 0; box-shadow: none; width: 100%; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
          <button onclick="window.print()" style="padding: 12px 24px; background: #003366; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🖨️ Print Statement / Save PDF</button>
        </div>

        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="bank-name">NOVA CREDIT</div>
              <div class="bank-tagline">Premium Financial Excellence</div>
              <div style="font-size: 11px; margin-top: 15px; color: var(--text-muted);">
                <strong>Nova Credit Financial Services Ltd.</strong><br>
                Corporate Office: Level 12, Cyber Tower, Sector 44<br>
                Gurugram, HR - 122003, India
              </div>
            </div>
            <div class="verify-qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VERIFIED-STMT-${user.id}-${Date.now()}" alt="Verify">
              <p>Scan to Verify Authenticity</p>
            </div>
          </div>

          <div class="statement-header">
            <h1>Detailed Account Statement</h1>
            <p>For the period <strong>${formatDate(fromDate)}</strong> to <strong>${formatDate(toDate)}</strong></p>
            <p>Generated on ${formatDate(new Date())} at ${new Date().toLocaleTimeString()}</p>
          </div>

          <div class="details-grid">
            <div class="info-card">
              <div class="section-title">Customer Information</div>
              <strong>${user.fullName}</strong><br>
              Phone: +91 ${user.phone}<br>
              Email: ${user.email}<br>
              <div style="margin-top: 10px; color: var(--text-muted);">
                Branch: GURUGRAM MAIN BRANCH<br>
                IFSC: NVCR0001042<br>
                MICR: 110024002
              </div>
            </div>
            <div class="info-card">
              <div class="section-title">Account Details</div>
              Customer ID: <span class="mono">${user.id}</span><br>
              Account No: <span class="mono">30990422${user.id.replace(/[^0-9]/g, '').slice(-4).padStart(4, '7')}</span><br>
              Account Type: PERSONAL CREDIT LINE<br>
              Currency: INDIAN RUPEE (INR)
            </div>
          </div>

          <div class="summary-strip">
            <div class="summary-item">
              <div class="summary-label">Opening Balance</div>
              <div class="summary-value">₹${openingBalance.toLocaleString('en-IN')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Credits</div>
              <div class="summary-value" style="color: #1e7e34;">+₹${totalCredits.toLocaleString('en-IN')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Total Debits</div>
              <div class="summary-value" style="color: #bd2130;">-₹${totalDebits.toLocaleString('en-IN')}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Closing Balance</div>
              <div class="summary-value">₹${closingBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="section-title">Transaction Ledger</div>
          <table class="txn-table">
            <thead>
              <tr>
                <th width="12%">Date</th>
                <th width="15%">Ref Number</th>
                <th width="43%">Description / Remarks</th>
                <th width="15%" style="text-align: right;">Debit (DR)</th>
                <th width="15%" style="text-align: right;">Credit (CR)</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(t => {
                const isCredit = ['payment', 'credit'].includes(t.transaction_type);
                return `
                  <tr>
                    <td class="mono">${formatDate(t.transaction_date)}</td>
                    <td class="mono">NC-${t.id.toString().padStart(8, '0')}</td>
                    <td>
                      <strong style="text-transform: uppercase; font-size: 10px;">${t.transaction_type.replace('_', ' ')}</strong><br>
                      <span style="color: #666;">${t.description}</span>
                    </td>
                    <td style="text-align: right;" class="amt-dr">
                      ${!isCredit ? '₹' + parseFloat(t.amount).toLocaleString('en-IN') : ''}
                    </td>
                    <td style="text-align: right;" class="amt-cr">
                      ${isCredit ? '₹' + parseFloat(t.amount).toLocaleString('en-IN') : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="signature-area">
            <div>
              <div class="stamp">DIGITALLY VERIFIED</div>
              <p style="font-size: 9px; color: #888; margin-top: 10px;">System Generated Statement - No physical signature required</p>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 700; color: var(--bank-blue); border-top: 1px solid #333; display: inline-block; padding-top: 5px; min-width: 150px;">Authorised Signatory</div>
              <p style="font-size: 9px; color: #888;">For Nova Credit Financial Services Ltd.</p>
            </div>
          </div>

          <div class="footer">
            <p><strong>Note:</strong> This is a computer-generated statement and does not require a physical signature. If you find any discrepancies, please inform the bank within 15 days of the generation date. <strong>Registered Office:</strong> Level 12, Cyber Tower, Gurugram. <strong>CIN:</strong> L65922DL1994PLC058964. <strong>RBI Registration:</strong> B-14.00422.</p>
            <p style="text-align: center; margin-top: 20px;">End of Statement</p>
          </div>
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
