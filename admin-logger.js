const { dbHelpers } = require('./database');

/**
 * Log admin action to audit trail
 * @param {Object} req - Express request object (contains user info)
 * @param {string} actionType - Type of action (UPDATE_USER, DELETE_LOAN, etc.)
 * @param {string} targetEntity - Entity type (user, loan, transaction, etc.)
 * @param {number} targetId - ID of the target entity
 * @param {Object} oldValues - Previous values (before change)
 * @param {Object} newValues - New values (after change)
 */
async function logAdminAction(req, actionType, targetEntity, targetId, oldValues = null, newValues = null) {
    try {
        const adminId = req.user.userId;
        const adminUsername = req.user.username;
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

        await dbHelpers.createAdminLog(
            adminId,
            adminUsername,
            actionType,
            targetEntity,
            targetId,
            oldValues,
            newValues,
            ipAddress
        );
    } catch (error) {
        // Log error but don't fail the main operation
        console.error('Failed to create admin log:', error);
    }
}

module.exports = { logAdminAction };
