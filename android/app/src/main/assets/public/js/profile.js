// Profile Page
async function renderProfilePage() {
  const pageContent = document.getElementById('page-content');
  showLoading(pageContent);

  try {
    const data = await apiCall('/profile');
    const profile = data.profile;

    pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>Profile & Settings</h2>
          <p class="text-muted">Manage your account information and credit cards</p>
        </div>
        
        <div class="grid grid-2">
          <!-- Profile Information -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Personal Information</h3>
            </div>
            <div class="card-body">
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Full Name</div>
                  <div style="font-size: 1.125rem; font-weight: 600;">${profile.fullName}</div>
                </div>
                
                <div>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Email</div>
                  <div style="font-size: 1.125rem; font-weight: 600;">${profile.email}</div>
                </div>
                
                <div>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Phone</div>
                  <div style="font-size: 1.125rem; font-weight: 600;">${profile.phone || 'Not provided'}</div>
                </div>
                
                <div>
                  <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Member Since</div>
                  <div style="font-size: 1.125rem; font-weight: 600;">${formatDate(profile.createdAt)}</div>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary" onclick="showEditProfileForm()">
                ✏️ Edit Profile
              </button>
            </div>
          </div>
          
          <!-- Credit Score -->
          <div class="card card-gradient">
            <div style="text-align: center;">
              <h3 style="margin-bottom: 1rem;">Credit Score</h3>
              <div style="font-size: 5rem; font-weight: 800; margin-bottom: 1rem;">
                ${profile.creditScore}
              </div>
              <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; margin-bottom: 1rem;">
                <div style="width: ${(profile.creditScore / 900) * 100}%; height: 100%; background: white; border-radius: 4px; transition: width 1s ease-out;"></div>
              </div>
              <p style="opacity: 0.9;">
                ${profile.creditScore >= 750 ? 'Excellent' : profile.creditScore >= 650 ? 'Good' : 'Fair'} Credit Rating
              </p>
            </div>
          </div>
        </div>
        
        <!-- Loan Summary -->
        <div class="card" style="margin-top: 2rem;">
          <div class="card-header">
            <h3 class="card-title">Loan Summary</h3>
          </div>
          <div class="card-body">
            <div class="grid grid-3">
              <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">
                  ${profile.loanSummary.totalLoans}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">Total Loans</div>
              </div>
              
              <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--warning); margin-bottom: 0.5rem;">
                  ${profile.loanSummary.activeLoans}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">Active Loans</div>
              </div>
              
              <div style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem; font-weight: 700; color: var(--danger); margin-bottom: 0.5rem;">
                  ${formatCurrency(parseFloat(profile.loanSummary.totalDebt))}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">Total Debt</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Credit Cards -->
        <div class="card" style="margin-top: 2rem;">
          <div class="card-header">
            <h3 class="card-title">My Credit Cards</h3>
            <p class="card-subtitle">${profile.creditCards.length} card(s)</p>
          </div>
          <div class="card-body">
            ${profile.creditCards.length > 0 ? `
              <div class="grid grid-2">
                ${profile.creditCards.map(card => `
                  <div class="credit-card-visual" style="cursor: pointer;" onclick="showEditCardModal('${card.id}', '${card.card_holder}', '${card.expiry_date}', '${card.card_type}', '${card.cardNumber}')">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                      <div class="card-chip"></div>
                      <div style="font-size: 1.5rem; font-weight: 700;">${card.card_type}</div>
                    </div>
                    
                    <div class="card-number">${card.cardNumber}</div>
                    
                    <div class="card-details">
                      <div class="card-holder">
                        <div class="card-label">Card Holder</div>
                        <div style="font-weight: 600;">${card.card_holder}</div>
                      </div>
                      <div class="card-expiry">
                        <div class="card-label">Expires</div>
                        <div style="font-weight: 600;">${card.expiry_date}</div>
                      </div>
                    </div>
                    <div style="position: absolute; top: 1rem; right: 1rem; opacity: 0.8;">✏️</div>
                  </div>
                `).join('')}
              </div>
              
              <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Credit Limit</div>
                    <div style="font-size: 1.25rem; font-weight: 700;">${formatCurrency(profile.creditLimit)}</div>
                  </div>
                  <div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">Available Credit</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--success);">${formatCurrency(profile.creditLimit - parseFloat(profile.loanSummary.totalDebt))}</div>
                  </div>
                </div>
              </div>
            ` : `
              <div class="empty-state">
                <div class="empty-state-icon">💳</div>
                <div class="empty-state-title">No Credit Cards</div>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load profile: ${error.message}
      </div>
    `;
  }
}

function showEditProfileForm() {
  const user = AppState.user;

  const formContent = `
    <form id="edit-profile-form">
      <div class="form-group">
        <label class="form-label">Full Name</label>
        <input type="text" id="edit-fullname" class="form-input" value="${user.fullName}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">Phone</label>
        <input type="tel" id="edit-phone" class="form-input" value="${user.phone || ''}" placeholder="10-digit phone number">
      </div>
      
      <div class="form-group">
        <label class="form-label">Email</label>
        <input type="email" class="form-input" value="${user.email}" disabled>
        <small class="text-muted">Email cannot be changed</small>
      </div>
    </form>
  `;

  createModal('Edit Profile', formContent, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: 'Save Changes',
      className: 'btn btn-primary',
      onClick: saveProfileChanges
    }
  ]);
}

async function saveProfileChanges() {
  const fullName = document.getElementById('edit-fullname').value;
  const phone = document.getElementById('edit-phone').value;

  if (!fullName) {
    showToast('Full name is required', 'danger');
    return;
  }

  if (phone && !isValidPhone(phone)) {
    showToast('Please enter a valid 10-digit phone number', 'danger');
    return;
  }

  try {
    await apiCall('/profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName, phone })
    });

    // Update local user data
    AppState.user.fullName = fullName;
    AppState.user.phone = phone;
    localStorage.setItem('nova_credit_user', JSON.stringify(AppState.user));

    showToast('Profile updated successfully!', 'success');
    renderProfilePage();
  } catch (error) {
    showToast(error.message || 'Failed to update profile', 'danger');
  }
}

function showEditCardModal(cardId, holder, expiry, type, maskedNumber) {
  const formContent = `
    <form id="edit-card-form">
      <div class="form-group">
        <label class="form-label">Card Number</label>
        <input type="text" id="edit-card-number" class="form-input" value="${maskedNumber}" placeholder="Enter new card number">
        <small class="text-muted">Enter new number to update, or leave as is.</small>
      </div>

      <div class="form-group">
        <label class="form-label">Card Holder Name</label>
        <input type="text" id="edit-card-holder" class="form-input" value="${holder}" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">Expiry Date (MM/YY)</label>
        <input type="text" id="edit-card-expiry" class="form-input" value="${expiry}" placeholder="MM/YY" required>
      </div>
      
      <div class="form-group">
        <label class="form-label">Card Type</label>
        <select id="edit-card-type" class="form-select">
          <option value="VISA" ${type === 'VISA' ? 'selected' : ''}>VISA</option>
          <option value="MasterCard" ${type === 'MasterCard' ? 'selected' : ''}>MasterCard</option>
          <option value="Amex" ${type === 'Amex' ? 'selected' : ''}>Amex</option>
          <option value="Rupay" ${type === 'Rupay' ? 'selected' : ''}>Rupay</option>
        </select>
      </div>
    </form>
  `;

  createModal('Edit Credit Card', formContent, [
    {
      text: 'Cancel',
      className: 'btn btn-secondary'
    },
    {
      text: 'Save Changes',
      className: 'btn btn-primary',
      onClick: () => saveCardChanges(cardId, maskedNumber)
    }
  ]);
}

async function saveCardChanges(cardId, originalMaskedNumber) {
  const cardHolder = document.getElementById('edit-card-holder').value;
  const expiryDate = document.getElementById('edit-card-expiry').value;
  const cardType = document.getElementById('edit-card-type').value;
  const cardNumberInput = document.getElementById('edit-card-number').value;

  if (!cardHolder || !expiryDate) {
    showToast('Please fill all fields', 'danger');
    return;
  }

  const payload = { cardHolder, expiryDate, cardType };

  // Only send card number if it's different from the original masked number
  // and looks like a real number (no asterisks)
  if (cardNumberInput && cardNumberInput !== originalMaskedNumber && !cardNumberInput.includes('*')) {
    // Strip spaces for cleaner storage
    payload.cardNumber = cardNumberInput.replace(/\s/g, '');
    console.log('Updating card number to:', payload.cardNumber);
  } else {
    console.log('Card number not updated. Input:', cardNumberInput, 'Original:', originalMaskedNumber);
  }

  try {
    await apiCall(`/profile/cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    showToast('Card updated successfully!', 'success');
    renderProfilePage();
  } catch (error) {
    showToast(error.message || 'Failed to update card', 'danger');
  }
}
