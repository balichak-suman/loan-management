const { executeSQL, dbHelpers } = require('./database');
const { calculateLoanDetails } = require('./loans');
const { sendDueDateReminder, sendPenaltyAlert } = require('./email');

async function checkUpcomingDueDates() {
    console.log('⏰ Checking for upcoming loan due dates (24h reminder)...');
    try {
        // Find loans due in the next 24-30 hours that haven't been notified (or just send if due tomorrow)
        // For simplicity, we'll find active loans where due_date is tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const { rows: loans } = await executeSQL(`
            SELECT l.*, u.email, u.full_name 
            FROM loans l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.loan_status = 'approved' 
            AND l.outstanding_balance > 0
            AND TO_CHAR(l.due_date, 'YYYY-MM-DD') = ?
        `, [tomorrowStr]);

        console.log(`Found ${loans.length} loans due tomorrow.`);

        for (const loan of loans) {
            const details = calculateLoanDetails(loan);
            try {
                await sendDueDateReminder(loan.email, {
                    id: loan.id,
                    balance: details.totalDue.toFixed(2),
                    dueDate: new Date(loan.due_date).toLocaleDateString()
                });
                console.log(`Sent due date reminder to ${loan.email} for loan #${loan.id}`);
            } catch (err) {
                console.error(`Failed to send reminder for loan #${loan.id}:`, err);
            }
        }
    } catch (error) {
        console.error('Error in checkUpcomingDueDates:', error);
    }
}

async function checkOverdueLoans() {
    console.log('🚨 Checking for overdue loans (penalty alerts)...');
    try {
        const now = new Date();
        const { rows: loans } = await executeSQL(`
            SELECT l.*, u.email, u.full_name 
            FROM loans l 
            JOIN users u ON l.user_id = u.id 
            WHERE l.loan_status = 'approved' 
            AND l.outstanding_balance > 0
            AND l.due_date < ?
        `, [now.toISOString()]);

        console.log(`Found ${loans.length} overdue loans.`);

        for (const loan of loans) {
            const details = calculateLoanDetails(loan);
            if (details.penaltyAmount > 0) {
                try {
                    await sendPenaltyAlert(loan.email, {
                        balance: details.totalDue.toFixed(2),
                        daysOverdue: details.daysOverdue,
                        penalty: details.penaltyAmount.toFixed(2)
                    });
                    console.log(`Sent penalty alert to ${loan.email} for loan #${loan.id}`);
                } catch (err) {
                    console.error(`Failed to send penalty alert for loan #${loan.id}:`, err);
                }
            }
        }
    } catch (error) {
        console.error('Error in checkOverdueLoans:', error);
    }
}

function startScheduler() {
    console.log('🚀 Starting loan notification scheduler...');

    // Check every hour (or once a day)
    // For this app, let's check daily at 10 AM
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 10 && now.getMinutes() === 0) {
            checkUpcomingDueDates();
            checkOverdueLoans();
        }
    }, 60000); // Check every minute

    // Optional: Run immediately on start for testing/immediate coverage
    // checkUpcomingDueDates();
    // checkOverdueLoans();
}

module.exports = { startScheduler, checkUpcomingDueDates, checkOverdueLoans };
