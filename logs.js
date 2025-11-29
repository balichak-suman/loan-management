const { executeSQL } = require('./database');

// Get admin logs (admin only, read-only)
async function getAdminLogs(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const limit = parseInt(req.query.limit) || 100;
        const actionType = req.query.actionType;
        const adminUsername = req.query.adminUsername;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let query = 'SELECT * FROM admin_logs WHERE 1=1';
        const params = [];

        if (actionType && actionType !== 'all') {
            query += ' AND action_type = ?';
            params.push(actionType);
        }

        if (adminUsername && adminUsername !== 'all') {
            query += ' AND admin_username = ?';
            params.push(adminUsername);
        }

        if (startDate) {
            query += ' AND timestamp >= ?';
            params.push(startDate);
        }

        if (endDate) {
            query += ' AND timestamp <= ?';
            params.push(endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT ?';
        params.push(limit);

        const { rows: logs } = await executeSQL(query, params);

        // Parse JSON strings back to objects for old_values and new_values
        const parsedLogs = logs.map(log => ({
            ...log,
            old_values: log.old_values ? JSON.parse(log.old_values) : null,
            new_values: log.new_values ? JSON.parse(log.new_values) : null
        }));

        res.json({
            success: true,
            logs: parsedLogs
        });
    } catch (error) {
        console.error('Get admin logs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// Get unique admin usernames for filter dropdown
async function getAdminUsernames(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { rows: admins } = await executeSQL(
            'SELECT DISTINCT admin_username FROM admin_logs ORDER BY admin_username'
        );

        res.json({
            success: true,
            admins: admins.map(a => a.admin_username)
        });
    } catch (error) {
        console.error('Get admin usernames error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    getAdminLogs,
    getAdminUsernames
};
