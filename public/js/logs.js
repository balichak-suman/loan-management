// Logs Page
async function renderLogsPage() {
    const pageContent = document.getElementById('page-content');

    // Check if user is admin
    if (!AppState.user.isAdmin) {
        pageContent.innerHTML = `
      <div class="alert alert-danger">
        <strong>Access Denied</strong><br>
        You do not have permission to access the logs.
      </div>
    `;
        return;
    }

    showLoading(pageContent);

    try {
        // Fetch admin usernames for filter
        const adminsData = await apiCall('/admin/logs/admins');

        pageContent.innerHTML = `
      <div class="fade-in">
        <div style="margin-bottom: 2rem;">
          <h2>📋 Admin Activity Logs</h2>
          <p class="text-muted">Tamper-proof audit trail of all administrative actions</p>
        </div>

        <!-- Filters -->
        <div class="card" style="margin-bottom: 2rem;">
          <div class="card-body">
            <div class="grid grid-4">
              <div class="form-group">
                <label class="form-label">Action Type</label>
                <select id="log-action-filter" class="form-select">
                  <option value="all">All Actions</option>
                  <option value="UPDATE_USER">Update User</option>
                  <option value="UPDATE_LOAN">Update Loan</option>
                  <option value="DELETE_LOAN">Delete Loan</option>
                  <option value="CREATE_LOAN">Create Loan</option>
                  <option value="APPROVE_LOAN">Approve Loan</option>
                  <option value="REJECT_LOAN">Reject Loan</option>
                  <option value="APPROVE_PAYMENT">Approve Payment</option>
                  <option value="REJECT_PAYMENT">Reject Payment</option>
                  <option value="UPDATE_SYSTEM_PARAMS">Update System Parameters</option>
                  <option value="UPDATE_TRANSACTION">Update Transaction</option>
                  <option value="DELETE_TRANSACTION">Delete Transaction</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Admin User</label>
                <select id="log-admin-filter" class="form-select">
                  <option value="all">All Admins</option>
                  ${adminsData.admins.map(admin => `<option value="${admin}">${admin}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" id="log-start-date" class="form-input">
              </div>

              <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="date" id="log-end-date" class="form-input">
              </div>
            </div>

            <button id="apply-log-filters" class="btn btn-primary" style="margin-top: 1rem;">
              🔍 Apply Filters
            </button>
            <button id="reset-log-filters" class="btn btn-secondary" style="margin-top: 1rem;">
              🔄 Reset
            </button>
          </div>
        </div>

        <!-- Logs Table -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Activity Log</h3>
            <p class="card-subtitle">Read-only audit trail (cannot be modified or deleted)</p>
          </div>
          <div class="card-body" id="logs-container">
            Loading logs...
          </div>
        </div>
      </div>
    `;

        // Load initial logs
        loadLogs();

        // Setup filter listeners
        document.getElementById('apply-log-filters').addEventListener('click', loadLogs);
        document.getElementById('reset-log-filters').addEventListener('click', () => {
            document.getElementById('log-action-filter').value = 'all';
            document.getElementById('log-admin-filter').value = 'all';
            document.getElementById('log-start-date').value = '';
            document.getElementById('log-end-date').value = '';
            loadLogs();
        });

    } catch (error) {
        pageContent.innerHTML = `
      <div class="alert alert-danger">
        Failed to load logs page: ${error.message}
      </div>
    `;
    }
}

async function loadLogs() {
    const container = document.getElementById('logs-container');
    container.innerHTML = '<p class="text-muted">Loading...</p>';

    try {
        const actionType = document.getElementById('log-action-filter').value;
        const adminUsername = document.getElementById('log-admin-filter').value;
        const startDate = document.getElementById('log-start-date').value;
        const endDate = document.getElementById('log-end-date').value;

        let url = '/admin/logs?limit=200';
        if (actionType !== 'all') url += `&actionType=${actionType}`;
        if (adminUsername !== 'all') url += `&adminUsername=${adminUsername}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;

        const data = await apiCall(url);
        const logs = data.logs;

        if (logs.length === 0) {
            container.innerHTML = '<p class="text-muted">No logs found matching the selected criteria.</p>';
            return;
        }

        container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td style="white-space: nowrap;">${new Date(log.timestamp).toLocaleString()}</td>
                <td><span class="badge badge-primary">${log.admin_username}</span></td>
                <td><span class="badge badge-${getActionTypeBadge(log.action_type)}">${formatActionType(log.action_type)}</span></td>
                <td>${log.target_entity ? `${log.target_entity} #${log.target_id}` : 'N/A'}</td>
                <td>
                  ${log.old_values || log.new_values ? `
                    <button class="btn btn-sm btn-secondary" onclick='showLogDetails(${JSON.stringify(log).replace(/'/g, "&apos;")})'>
                      👁️ View
                    </button>
                  ` : 'N/A'}
                </td>
                <td style="font-family: monospace; font-size: 0.85rem;">${log.ip_address || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <p class="text-muted" style="margin-top: 1rem; font-size: 0.9rem;">
        🔒 Showing ${logs.length} log entries. Logs are immutable and cannot be edited or deleted.
      </p>
    `;
    } catch (error) {
        container.innerHTML = `<p class="text-danger">Failed to load logs: ${error.message}</p>`;
    }
}

function getActionTypeBadge(actionType) {
    const badges = {
        'UPDATE_USER': 'primary',
        'UPDATE_LOAN': 'primary',
        'DELETE_LOAN': 'danger',
        'CREATE_LOAN': 'success',
        'APPROVE_LOAN': 'success',
        'REJECT_LOAN': 'danger',
        'APPROVE_PAYMENT': 'success',
        'REJECT_PAYMENT': 'danger',
        'UPDATE_SYSTEM_PARAMS': 'warning',
        'UPDATE_TRANSACTION': 'primary',
        'DELETE_TRANSACTION': 'danger'
    };
    return badges[actionType] || 'secondary';
}

function formatActionType(actionType) {
    return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

function showLogDetails(log) {
    const content = `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div>
        <h4 style="margin-bottom: 0.5rem;">Log Information</h4>
        <div class="grid grid-2" style="gap: 0.5rem;">
          <div><strong>Timestamp:</strong> ${new Date(log.timestamp).toLocaleString()}</div>
          <div><strong>Admin:</strong> ${log.admin_username}</div>
          <div><strong>Action:</strong> ${formatActionType(log.action_type)}</div>
          <div><strong>Target:</strong> ${log.target_entity ? `${log.target_entity} #${log.target_id}` : 'N/A'}</div>
          <div style="grid-column: 1 / -1;"><strong>IP Address:</strong> ${log.ip_address || 'N/A'}</div>
        </div>
      </div>

      ${log.old_values ? `
        <div>
          <h4 style="margin-bottom: 0.5rem;">Previous Values</h4>
          <pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; font-size: 0.9rem;">${JSON.stringify(log.old_values, null, 2)}</pre>
        </div>
      ` : ''}

      ${log.new_values ? `
        <div>
          <h4 style="margin-bottom: 0.5rem;">New Values</h4>
          <pre style="background: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); overflow-x: auto; font-size: 0.9rem;">${JSON.stringify(log.new_values, null, 2)}</pre>
        </div>
      ` : ''}
    </div>
  `;

    createModal('Log Details', content, [
        { text: 'Close', className: 'btn btn-secondary' }
    ]);
}
