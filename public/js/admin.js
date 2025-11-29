// Admin Panel Page
async function renderAdminPage() {
  const pageContent = document.getElementById('page-content');

  // Check if user is admin
  if (!AppState.user.isAdmin) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        <strong>Access Denied</strong><br>
        You do not have permission to access the admin panel.
      </div>
    `;
    return;
  }

  showLoading(pageContent);

  try {
    const [parametersData, usersData, loansData] = await Promise.all([
      apiCall('/admin/parameters'),
      apiCall('/admin/users'),
      apiCall('/admin/loans')
    ]);

    const params = parametersData.parameters;
    // Store loans data globally or pass it around
    window.allLoans = loansData.loans;
    window.allUsers = usersData.users;

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>🔧 Admin Panel</h2>
          <p class="text-muted">Manage system parameters and user accounts</p>
        </div>
        
        <!-- System Parameters -->
        <div class="card card-gradient" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title">System Parameters</h3>
            <p class="card-subtitle">Modify interest rates and loan limits</p>
          </div>
          <div class="card-body">
            <form id="admin-parameters-form">
              <div class="grid grid-2">
                <div class="form-group">
                  <label class="form-label" style="color: white;">Interest Rate (% per month)</label>
                  <input type="number" id="interest-rate" class="form-input" value="${params.interest_rate}" step="0.01" min="0" max="100" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label" style="color: white;">Penalty Rate (₹ per ₹10,000 per day)</label>
                  <input type="number" id="penalty-rate" class="form-input" value="${params.penalty_rate_per_10k}" step="1" min="0" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label" style="color: white;">Maximum Loan Amount (₹)</label>
                  <input type="number" id="max-loan" class="form-input" value="${params.max_loan_amount}" step="1000" min="1000" required>
                </div>
                
                <div class="form-group">
                  <label class="form-label" style="color: white;">Minimum Loan Amount (₹)</label>
                  <input type="number" id="min-loan" class="form-input" value="${params.min_loan_amount}" step="100" min="0" required>
                </div>
              </div>
              
              <button type="submit" class="btn btn-secondary" style="background: white; color: #667eea; font-weight: 700; margin-top: 1rem;">
                💾 Save Parameters
              </button>
            </form>
          </div>
        </div>
        
        <!-- Statistics -->
        <div class="grid grid-3" style="margin-bottom: 2rem;">
          <div class="card stats-card">
            <div class="stats-value">${usersData.users.length}</div>
            <div class="stats-label">Total Users</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value">${loansData.loans.length}</div>
            <div class="stats-label">Total Loans</div>
          </div>
          
          <div class="card stats-card">
            <div class="stats-value">${formatCurrency(loansData.loans.reduce((sum, l) => sum + l.loan_amount, 0))}</div>
            <div class="stats-label">Total Loan Amount</div>
          </div>
        </div>
        
        <!-- Loan Requests -->
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title">💰 Loan Requests</h3>
            <p class="card-subtitle">Approve or reject pending loan applications</p>
          </div>
          <div class="card-body" id="loan-requests-container">
            Loading requests...
          </div>
        </div>

        <!-- Payment Requests -->
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title">🔔 Payment Requests</h3>
            <p class="card-subtitle">Approve or reject pending payments</p>
          </div>
          <div class="card-body" id="payment-requests-container">
            Loading requests...
          </div>
        </div>

        <!-- All Users -->
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-header">
            <h3 class="card-title">User Management</h3>
            <p class="card-subtitle">Click on a username to edit profile and manage loans</p>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Credit Score</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${usersData.users.map(user => `
                    <tr>
                      <td>#${user.id}</td>
                      <td>
                        <button class="btn-link" onclick="viewUserDetails(${user.id})" style="font-weight: 700; color: var(--primary); text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">
                          ${user.username}
                        </button>
                      </td>
                      <td>${user.full_name}</td>
                      <td>${user.email}</td>
                      <td>${user.phone || 'N/A'}</td>
                      <td><span class="badge badge-${user.credit_score >= 750 ? 'success' : 'warning'}">${user.credit_score}</span></td>
                      <td>${user.is_admin ? '<span class="badge badge-danger">Admin</span>' : '<span class="badge badge-secondary">User</span>'}</td>
                      <td>
                        <button class="btn btn-sm btn-primary" onclick="viewUserDetails(${user.id})">
                          👤 Manage User
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add All Loans Section
    pageContent.innerHTML += `
      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 class="card-title">All Loans Management</h3>
            <p class="card-subtitle">View and filter all loans in the system</p>
          </div>
          <div class="form-group" style="margin-bottom: 0; min-width: 200px;">
            <select id="loan-status-filter" class="form-select">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="active">Active</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div class="card-body">
          <div class="table-container" id="all-loans-table-container">
            <!-- Table will be rendered here -->
          </div>
        </div>
      </div>
    `;

    // Load payment requests
    loadPaymentRequests();
    loadLoanRequests();

    // Render initial all loans table
    renderAllLoansTable(window.allLoans);

    // Setup filter listener
    document.getElementById('loan-status-filter').addEventListener('change', (e) => {
      const status = e.target.value;
      const filteredLoans = status === 'all'
        ? window.allLoans
        : window.allLoans.filter(l => l.loan_status === status);
      renderAllLoansTable(filteredLoans);
    });

    // Setup form submission
    document.getElementById('admin-parameters-form').addEventListener('submit', handleParametersUpdate);
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load admin panel: ${error.message}
      </div>
    `;
  }
}

async function handleParametersUpdate(e) {
  e.preventDefault();

  const interestRate = parseFloat(document.getElementById('interest-rate').value);
  const penaltyRate = parseFloat(document.getElementById('penalty-rate').value);
  const maxLoanAmount = parseFloat(document.getElementById('max-loan').value);
  const minLoanAmount = parseFloat(document.getElementById('min-loan').value);

  try {
    await apiCall('/admin/parameters', {
      method: 'PUT',
      body: JSON.stringify({
        interestRate,
        penaltyRate,
        maxLoanAmount,
        minLoanAmount
      })
    });

    showToast('System parameters updated successfully!', 'success');
  } catch (error) {
    showToast(error.message || 'Failed to update parameters', 'danger');
  }
}

async function loadPaymentRequests() {
  const container = document.getElementById('payment-requests-container');
  try {
    const data = await apiCall('/admin/payments/pending');
    const payments = data.payments;

    if (payments.length === 0) {
      container.innerHTML = '<p class="text-muted">No pending payment requests.</p>';
      return;
    }

    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${payments.map(p => `
              <tr>
                <td>${p.username}</td>
                <td>${formatCurrency(p.payment_amount)}</td>
                <td>${new Date(p.payment_date).toLocaleDateString()}</td>
                <td>
                  <span class="badge badge-secondary">📷 ${p.proof_image || 'Attached'}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-success" onclick="handlePaymentAction(${p.id}, 'approve')">Approve</button>
                  <button class="btn btn-sm btn-danger" onclick="handlePaymentAction(${p.id}, 'reject')">Reject</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<p class="text-danger">Failed to load requests: ${error.message}</p>`;
  }
}

async function handlePaymentAction(paymentId, action) {
  const actionText = action === 'approve' ? 'Approve' : 'Reject';
  const actionColor = action === 'approve' ? 'success' : 'danger';

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${action === 'approve' ? '✅' : '❌'}</div>
      <h3>${actionText} Payment?</h3>
      <p>Are you sure you want to <strong>${actionText.toLowerCase()}</strong> this payment request?</p>
      ${action === 'approve' ? '<p class="text-muted">This will update the user\'s loan balance.</p>' : ''}
    </div>
  `;

  createModal(`Confirm ${actionText}`, content, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: `Yes, ${actionText}`,
      className: `btn btn-${actionColor}`,
      onClick: () => executePaymentAction(paymentId, action)
    }
  ]);
}

async function executePaymentAction(paymentId, action) {
  try {
    await apiCall(`/admin/payments/${paymentId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action })
    });
    showToast(`Payment ${action}ed successfully`, 'success');
    loadPaymentRequests(); // Refresh
  } catch (error) {
    showToast(error.message, 'danger');
  }
}

// View User Details (Profile + Loans)
function viewUserDetails(userId) {
  const user = window.allUsers.find(u => u.id === userId);
  const userLoans = window.allLoans.filter(l => l.user_id === userId);

  if (!user) return;

  const content = `
    <div style="display: flex; flex-direction: column; gap: 2rem;">
      <!-- User Profile Section -->
      <div class="card" style="background: var(--bg-tertiary);">
        <h3 style="margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Edit Profile</h3>
        <form id="edit-user-form-${userId}">
          <div class="grid grid-2">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="edit-user-name-${userId}" class="form-input" value="${user.full_name}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" id="edit-user-email-${userId}" class="form-input" value="${user.email}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="tel" id="edit-user-phone-${userId}" class="form-input" value="${user.phone || ''}" placeholder="10-digit phone">
            </div>
            
            <div class="form-group">
              <label class="form-label">Credit Score</label>
              <input type="number" id="edit-user-credit-${userId}" class="form-input" value="${user.credit_score}" min="300" max="900" required>
            </div>

            <div class="form-group">
              <label class="form-label">Credit Limit (₹)</label>
              <input type="number" id="edit-user-limit-${userId}" class="form-input" value="${user.credit_limit || 10000}" min="0" required>
            </div>
          </div>
          <button type="button" class="btn btn-primary" onclick="saveUserChanges(${userId})">💾 Save Profile Changes</button>
        </form>
      </div>

      <!-- User Loans Section -->
      <div class="card" style="background: var(--bg-tertiary);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <h3 style="margin: 0;">User Loans</h3>
          <div style="text-align: right;">
             <span class="text-muted" style="font-size: 0.9rem;">Total Outstanding:</span>
             <strong style="font-size: 1.1rem; color: var(--primary); margin-left: 0.5rem;">
               ${formatCurrency(userLoans.reduce((sum, l) => sum + (l.totalDue || l.outstanding_balance), 0))}
             </strong>
          </div>
          <button class="btn btn-sm btn-success" onclick="showCreateLoanModal(${userId})">➕ Create Loan</button>
        </div>
        
        ${userLoans.length > 0 ? `
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Outstanding</th>
                  <th>Interest</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${userLoans.map(loan => `
                  <tr>
                    <td>#${loan.id}</td>
                    <td style="font-weight: 600;">${formatCurrency(loan.loan_amount)}</td>
                    <td style="color: ${loan.outstanding_balance > 0 ? 'var(--warning)' : 'var(--success)'};">
                      ${formatCurrency(loan.outstanding_balance)}
                    </td>
                    <td>${loan.interest_rate}%</td>
                    <td><span class="badge badge-${getLoanStatusBadge(loan.loan_status)}">${loan.loan_status}</span></td>
                    <td>
                      <button class="btn btn-sm btn-primary" onclick='editLoan(${JSON.stringify(loan).replace(/'/g, "&apos;")})'>
                        ✏️ Edit
                      </button>
                      <button class="btn btn-sm btn-danger" onclick="deleteLoan(${loan.id}, ${userId})">
                        🗑️
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : '<p class="text-muted">No loans found for this user.</p>'}
      </div>
    </div>
  `;

  createModal(`Manage User: ${user.username}`, content, [
    { text: 'Close', className: 'btn btn-secondary' }
  ]);
}

async function saveUserChanges(userId) {
  const fullName = document.getElementById(`edit-user-name-${userId}`).value;
  const email = document.getElementById(`edit-user-email-${userId}`).value;
  const phone = document.getElementById(`edit-user-phone-${userId}`).value;
  const creditScore = parseInt(document.getElementById(`edit-user-credit-${userId}`).value);
  const creditLimit = parseFloat(document.getElementById(`edit-user-limit-${userId}`).value);

  try {
    await apiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ fullName, email, phone, creditScore, creditLimit })
    });

    showToast('User profile updated successfully!', 'success');

    // Update local data and re-render
    const userIndex = window.allUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      window.allUsers[userIndex] = { ...window.allUsers[userIndex], full_name: fullName, email, phone, credit_score: creditScore, credit_limit: creditLimit };
    }
    renderAdminPage(); // Refresh main table
  } catch (error) {
    showToast(error.message || 'Failed to update user', 'danger');
  }
}

// Edit Loan
function editLoan(loan) {
  // Close previous modal if needed or stack them. 
  // Simple modal implementation might replace content, so let's check.
  // Ideally we want to keep the user details modal open, but for simplicity let's just open the loan edit modal.
  // The user can go back to user details by clicking the username again.

  const formContent = `
    <form id="edit-loan-form">
      <div class="grid grid-2">
        <div class="form-group">
          <label class="form-label">Loan Amount (₹)</label>
          <input type="number" id="edit-loan-amount" class="form-input" value="${loan.loan_amount}" min="0" step="100" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Outstanding Balance (₹)</label>
          <input type="number" id="edit-loan-balance" class="form-input" value="${loan.outstanding_balance}" min="0" step="100" required>
          <small class="text-muted">Includes principal + full interest</small>
        </div>
        
        <div class="form-group">
          <label class="form-label">Interest Rate (%)</label>
          <input type="number" id="edit-loan-interest" class="form-input" value="${loan.interest_rate}" min="0" max="100" step="0.001" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Monthly Payment (₹)</label>
          <input type="number" id="edit-loan-payment" class="form-input" value="${loan.monthly_payment}" min="0" step="100" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Penalty Amount (₹)</label>
          <input type="number" id="edit-loan-penalty" class="form-input" value="${loan.penalty_amount || 0}" min="0" step="100">
        </div>
        
        <div class="form-group">
          <label class="form-label">Days Overdue</label>
          <input type="number" id="edit-loan-overdue" class="form-input" value="${loan.days_overdue || 0}" min="0">
        </div>
        
        <div class="form-group">
          <label class="form-label">Loan Purpose</label>
          <input type="text" id="edit-loan-purpose" class="form-input" value="${loan.loan_purpose || ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label">Loan Status</label>
          <select id="edit-loan-status" class="form-select" required>
            <option value="pending" ${loan.loan_status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="approved" ${loan.loan_status === 'approved' ? 'selected' : ''}>Approved</option>
            <option value="active" ${loan.loan_status === 'active' ? 'selected' : ''}>Active</option>
            <option value="paid" ${loan.loan_status === 'paid' ? 'selected' : ''}>Paid</option>
            <option value="rejected" ${loan.loan_status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
        
        <div class="form-group">
          <label class="form-label">Application Date</label>
          <input type="datetime-local" id="edit-loan-app-date" class="form-input" value="${formatDateForInput(loan.application_date)}">
        </div>
        
        <div class="form-group">
          <label class="form-label">Approval Date</label>
          <input type="datetime-local" id="edit-loan-approval-date" class="form-input" value="${loan.approval_date ? formatDateForInput(loan.approval_date) : ''}">
        </div>
        
        <div class="form-group">
          <label class="form-label">Due Date</label>
          <input type="datetime-local" id="edit-loan-due-date" class="form-input" value="${loan.due_date ? formatDateForInput(loan.due_date) : ''}">
        </div>
      </div>
    </form>
  `;

  createModal('Edit Loan #' + loan.id, formContent, [
    { text: 'Cancel', className: 'btn btn-secondary', onClick: () => viewUserDetails(loan.user_id) }, // Go back to user details
    {
      text: 'Save Changes',
      className: 'btn btn-primary',
      onClick: () => saveLoanChanges(loan.id, loan.user_id)
    }
  ]);

  // Add event listeners for real-time calculation
  const amountInput = document.getElementById('edit-loan-amount');
  const interestInput = document.getElementById('edit-loan-interest');
  const paymentInput = document.getElementById('edit-loan-payment');
  const balanceInput = document.getElementById('edit-loan-balance');
  const penaltyInput = document.getElementById('edit-loan-penalty');
  const overdueInput = document.getElementById('edit-loan-overdue');

  function recalculateValues() {
    const amount = parseFloat(amountInput.value) || 0;
    const rate = parseFloat(interestInput.value) || 0;
    const penalty = parseFloat(penaltyInput.value) || 0;

    // Calculate Monthly Payment (Simple 1 month interest logic for now)
    // Rate is percentage
    const rateDecimal = rate / 100;
    const interestAmount = amount * rateDecimal;
    const totalWithInterest = amount + interestAmount;

    // Update Monthly Payment
    paymentInput.value = totalWithInterest.toFixed(2);

    // Update Outstanding Balance (Base + Penalty)
    // Note: The backend calculateLoanDetails adds penalty dynamically.
    // But here we are editing the "Stored" outstanding balance.
    // Usually we store the Base Balance (Principal + Interest).
    // The user sees Total Due (Base + Penalty).
    // If we update the field here, we should probably show the Base Balance?
    // Or if the user expects to see the Total, we show Total.
    // Let's stick to Base Balance (Principal + Interest) for the input, 
    // because Penalty is separate.
    // Wait, the user sees "Outstanding: 28,800" which includes penalty.
    // If they edit it, they might be confused.
    // But `edit-loan-balance` input usually maps to the DB column `outstanding_balance`.
    // My backend logic `calculateLoanDetails` ADDS penalty to it.
    // So the DB column should hold `21,000` (for 5%).
    // And display shows `21,000 + 7,800 = 28,800`.

    // Let's set the Balance Input to the Base Amount (Principal + Interest)
    // so the DB gets the correct base value.
    balanceInput.value = totalWithInterest.toFixed(2);
  }

  amountInput.addEventListener('input', recalculateValues);
  interestInput.addEventListener('input', recalculateValues);
}

function showCreateLoanModal(userId) {
  const content = `
    <form id="admin-create-loan-form">
      <div class="form-group">
        <label class="form-label">Loan Amount (₹)</label>
        <input type="number" id="create-loan-amount" class="form-input" placeholder="e.g. 50000" required>
      </div>
      <div class="form-group">
        <label class="form-label">Purpose</label>
        <input type="text" id="create-loan-purpose" class="form-input" placeholder="e.g. Personal" required>
      </div>
      <div class="form-group">
        <label class="form-label">Tenure (Months)</label>
        <input type="number" id="create-loan-tenure" class="form-input" value="12" required>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Create Loan</button>
    </form>
  `;

  const overlay = createModal('Create Loan for User', content);

  document.getElementById('admin-create-loan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const loanAmount = document.getElementById('create-loan-amount').value;
    const loanPurpose = document.getElementById('create-loan-purpose').value;
    const tenure = document.getElementById('create-loan-tenure').value;

    try {
      await apiCall(`/admin/users/${userId}/loans`, {
        method: 'POST',
        body: JSON.stringify({ loanAmount, loanPurpose, tenure })
      });
      showToast('Loan created successfully', 'success');
      closeModal(overlay);

      // Refresh
      const [loansData] = await Promise.all([apiCall('/admin/loans')]);
      window.allLoans = loansData.loans;
      viewUserDetails(userId);
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });
}

function renderAllLoansTable(loans) {
  const container = document.getElementById('all-loans-table-container');

  if (!container) return; // Ensure container exists

  if (!loans || loans.length === 0) {
    container.innerHTML = '<p class="text-muted">No loans found matching the selected criteria.</p>';
    return;
  }

  // Sort by date descending (newest first)
  const sortedLoans = [...loans].sort((a, b) => new Date(b.application_date) - new Date(a.application_date));

  container.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>User</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${sortedLoans.map(loan => {
    const user = window.allUsers.find(u => u.id === loan.user_id);
    const username = user ? user.username : 'Unknown';
    return `
            <tr>
              <td>#${loan.id}</td>
              <td>
                <button class="btn-link" onclick="viewUserDetails(${loan.user_id})" style="font-weight: 700; color: var(--primary); text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">
                  ${username}
                </button>
              </td>
              <td>${formatCurrency(loan.loan_amount)}</td>
              <td><span class="badge badge-${getLoanStatusBadge(loan.loan_status)}">${loan.loan_status}</span></td>
              <td>${new Date(loan.application_date).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-sm btn-primary" onclick="viewUserDetails(${loan.user_id})">
                  Manage
                </button>
              </td>
            </tr>
          `;
  }).join('')}
      </tbody>
    </table>
  `;
}

async function deleteLoan(loanId, userId) {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">🗑️</div>
      <h3>Delete Loan?</h3>
      <p>Are you sure you want to delete this loan? This action cannot be undone.</p>
    </div>
  `;

  createModal('Delete Loan', content, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: 'Delete',
      className: 'btn btn-danger',
      onClick: async () => {
        try {
          await apiCall(`/admin/loans/${loanId}`, { method: 'DELETE' });
          showToast('Loan deleted successfully', 'success');
          // closeModal(); // Handled by wrapper

          // Refresh
          const [loansData] = await Promise.all([apiCall('/admin/loans')]);
          window.allLoans = loansData.loans;
          viewUserDetails(userId);
        } catch (error) {
          showToast(error.message, 'danger');
        }
      }
    }
  ]);
}

async function saveLoanChanges(loanId, userId) {
  const loanAmount = parseFloat(document.getElementById('edit-loan-amount').value);
  const outstandingBalance = parseFloat(document.getElementById('edit-loan-balance').value);
  const interestRate = parseFloat(document.getElementById('edit-loan-interest').value);
  const monthlyPayment = parseFloat(document.getElementById('edit-loan-payment').value);
  const penaltyAmount = parseFloat(document.getElementById('edit-loan-penalty').value);
  const daysOverdue = parseInt(document.getElementById('edit-loan-overdue').value);
  const loanPurpose = document.getElementById('edit-loan-purpose').value;
  const loanStatus = document.getElementById('edit-loan-status').value;
  const applicationDate = document.getElementById('edit-loan-app-date').value;
  const approvalDate = document.getElementById('edit-loan-approval-date').value;
  const dueDate = document.getElementById('edit-loan-due-date').value;

  try {
    await apiCall(`/admin/loans/${loanId}`, {
      method: 'PUT',
      body: JSON.stringify({
        loanAmount,
        outstandingBalance,
        interestRate,
        monthlyPayment,
        penaltyAmount,
        daysOverdue,
        loanPurpose,
        loanStatus,
        applicationDate: applicationDate ? new Date(applicationDate).toISOString() : null,
        approvalDate: approvalDate ? new Date(approvalDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      })
    });

    showToast('Loan updated successfully!', 'success');

    // Refresh data and return to user details
    const [loansData] = await Promise.all([apiCall('/admin/loans')]);
    window.allLoans = loansData.loans;

    viewUserDetails(userId);
  } catch (error) {
    showToast(error.message || 'Failed to update loan', 'danger');
  }
}

// Helper to format date for datetime-local input
function formatDateForInput(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Load loan requests
function loadLoanRequests() {
  const container = document.getElementById('loan-requests-container');
  if (!container) return;

  const pendingLoans = window.allLoans.filter(l => l.loan_status === 'pending');

  if (pendingLoans.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-title">No Pending Loans</div>
        <div class="empty-state-description">All loan applications have been processed</div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pendingLoans.map(loan => `
            <tr>
              <td>#${loan.id}</td>
              <td>
                <div style="font-weight: 600;">${loan.full_name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${loan.email}</div>
              </td>
              <td style="font-weight: 700; color: var(--primary);">${formatCurrency(loan.loan_amount)}</td>
              <td>${loan.loan_purpose}</td>
              <td>${formatDate(loan.application_date)}</td>
              <td>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-sm btn-success" onclick="handleLoanAction(${loan.id}, 'approve')">
                    ✅ Approve
                  </button>
                  <button class="btn btn-sm btn-danger" onclick="handleLoanAction(${loan.id}, 'reject')">
                    ❌ Reject
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Handle loan action (approve/reject)
function handleLoanAction(loanId, action) {
  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve Loan' : 'Reject Loan';
  const message = isApprove
    ? `Are you sure you want to approve Loan #${loanId}? This will disburse the funds immediately.`
    : `Are you sure you want to reject Loan #${loanId}?`;

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 3rem; margin-bottom: 1rem;">${isApprove ? '💰' : '❌'}</div>
      <p style="margin-bottom: 1.5rem; font-size: 1.125rem;">${message}</p>
    </div>
  `;

  createModal(title, content, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: isApprove ? 'Approve Loan' : 'Reject Loan',
      className: isApprove ? 'btn btn-success' : 'btn btn-danger',
      onClick: () => executeLoanAction(loanId, action)
    }
  ]);
}

async function executeLoanAction(loanId, action) {
  try {
    if (action === 'approve') {
      await apiCall(`/admin/loans/${loanId}/approve`, { method: 'POST' });
    } else {
      await apiCall(`/admin/loans/${loanId}`, {
        method: 'PUT',
        body: JSON.stringify({ loanStatus: 'rejected' })
      });
    }

    showToast(`Loan ${action}d successfully`, 'success');
    // closeModal(); // Removed because createModal handles closing automatically

    // Refresh data
    const [loansData] = await Promise.all([apiCall('/admin/loans')]);
    window.allLoans = loansData.loans;
    loadLoanRequests();

    // Also refresh user details if open (optional, but good practice)
    // We don't know which user is open easily, but that's fine.
  } catch (error) {
    showToast(error.message || `Failed to ${action} loan`, 'danger');
  }
}
