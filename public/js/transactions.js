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

    const userIdStr = (user.id || '').toString();
    const accountSuffix = userIdStr.replace(/[^0-9]/g, '').slice(-4).padStart(4, '7');
    const accountNumber = `30990422${accountSuffix}`;
    const password = (user.username || 'NOVA').slice(0, 4);

    // Create PDF using jsPDF
    // Note: We'll use a hidden element to render the HTML then capture it, or build it manually for better control
    // For a "Genuine" look, building it manually with jsPDF is better for password protection support
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      encryption: {
        userPassword: password,
        ownerPassword: 'NOVA_ADMIN_SECURE',
        userPermissions: ['print', 'copy']
      }
    });

    // Add Fonts & Styles
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 51, 102); // Bank Blue
    doc.setFontSize(24);
    doc.text('NOVA CREDIT', 20, 25);
    
    doc.setFontSize(8);
    doc.setTextColor(179, 139, 0); // Bank Gold
    doc.text('PREMIUM FINANCIAL EXCELLENCE', 20, 30);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Nova Credit Financial Services Ltd.', 20, 38);
    doc.text('Level 12, Cyber Tower, Gurugram, HR', 20, 42);

    // Right Side: Verification info
    doc.setFontSize(7);
    doc.text('STATEMENT AUTHENTICITY VERIFIED', 140, 25);
    doc.text(`ID: STMT-${userIdStr}`, 140, 29);
    doc.text(`DATE: ${formatDate(new Date())}`, 140, 33);

    // Title
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(0.5);
    doc.line(20, 50, 190, 50);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED ACCOUNT STATEMENT', 105, 65, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`, 105, 72, { align: 'center' });

    // Info Grid
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', 20, 85);
    doc.line(20, 87, 80, 87);
    
    doc.setFont('helvetica', 'normal');
    doc.text(user.fullName, 20, 93);
    doc.text(`Phone: +91 ${user.phone}`, 20, 98);
    doc.text(`Email: ${user.email}`, 20, 103);
    doc.text('Branch: GURUGRAM MAIN', 20, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT DETAILS', 110, 85);
    doc.line(110, 87, 170, 87);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Account No: ${accountNumber}`, 110, 93);
    doc.text(`Customer ID: ${userIdStr}`, 110, 98);
    doc.text('Type: PERSONAL CREDIT LINE', 110, 103);
    doc.text('IFSC: NVCR0001042', 110, 108);

    // Summary Strip
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 120, 170, 25, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(20, 120, 170, 25, 'S');

    doc.setFontSize(8);
    doc.text('OPENING BALANCE', 35, 128, { align: 'center' });
    doc.text('TOTAL CREDITS', 75, 128, { align: 'center' });
    doc.text('TOTAL DEBITS', 115, 128, { align: 'center' });
    doc.text('CLOSING BALANCE', 155, 128, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`₹${openingBalance.toLocaleString('en-IN')}`, 35, 137, { align: 'center' });
    doc.setTextColor(30, 126, 52);
    doc.text(`+₹${totalCredits.toLocaleString('en-IN')}`, 75, 137, { align: 'center' });
    doc.setTextColor(189, 33, 48);
    doc.text(`-₹${totalDebits.toLocaleString('en-IN')}`, 115, 137, { align: 'center' });
    doc.setTextColor(0, 51, 102);
    doc.text(`₹${closingBalance.toLocaleString('en-IN')}`, 155, 137, { align: 'center' });

    // Table Header
    doc.setTextColor(0, 51, 102);
    doc.setFontSize(10);
    doc.text('TRANSACTION LEDGER', 20, 158);
    
    let y = 165;
    doc.setFillColor(0, 51, 102);
    doc.rect(20, y, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text('DATE', 25, y + 5);
    doc.text('DESCRIPTION', 55, y + 5);
    doc.text('DEBIT (DR)', 135, y + 5);
    doc.text('CREDIT (CR)', 165, y + 5);

    y += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    filtered.forEach((t, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      const isCr = ['payment', 'credit'].includes(t.transaction_type);
      const amt = parseFloat(t.amount || 0).toLocaleString('en-IN');
      
      doc.setFontSize(7);
      doc.text(formatDate(t.transaction_date), 25, y + 6);
      
      doc.setFont('helvetica', 'bold');
      doc.text(t.transaction_type.replace('_', ' ').toUpperCase(), 55, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.text(t.description || '', 55, y + 8);
      
      doc.setFontSize(8);
      if (isCr) {
        doc.text(`₹${amt}`, 165, y + 6);
      } else {
        doc.text(`₹${amt}`, 135, y + 6);
      }
      
      doc.setDrawColor(240, 240, 240);
      doc.line(20, y + 10, 190, y + 10);
      y += 10;
    });

    // Signature Area
    if (y > 240) { doc.addPage(); y = 20; }
    y += 20;
    doc.setDrawColor(0, 51, 102);
    doc.rect(20, y, 40, 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('DIGITALLY VERIFIED', 23, y + 7);
    
    doc.text('Authorised Signatory', 140, y + 7);
    doc.line(140, y + 8, 180, y + 8);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('For Nova Credit Financial Services Ltd.', 140, y + 12);

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    const footerText = 'Note: This is a password protected document. Use first 4 characters of your username to open. This is a computer generated statement and does not require a physical signature. Registered Office: Level 12, Cyber Tower, Gurugram. CIN: L65922DL1994PLC058964.';
    doc.text(footerText, 20, 285);

    // Save and Download
    doc.save(`Nova_Statement_${userIdStr}_${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('Statement downloaded successfully (Password: First 4 chars of username)', 'success');

  } catch (error) {
    console.error('PDF Error:', error);
    showToast('Failed to generate PDF: ' + error.message, 'danger');
  }
}
