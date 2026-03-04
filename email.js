const SibApiV3Sdk = require('sib-api-v3-sdk');
require('dotenv').config();

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmail({ to, subject, htmlContent }) {
    try {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.htmlContent = htmlContent;
        sendSmtpEmail.sender = { name: "Nova Credit", email: process.env.BREVO_SENDER_EMAIL || "noreply@novacredit.com" };
        sendSmtpEmail.to = [{ email: to }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✉️ Email sent successfully:', data.messageId);
        return data;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

async function sendOTP(email, otp) {
    return sendEmail({
        to: email,
        subject: "Your Nova Credit OTP",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #4a90e2;">Nova Credit Verification</h2>
                <p>Hello,</p>
                <p>Your one-time password (OTP) for verification is:</p>
                <div style="font-size: 24px; font-weight: bold; padding: 10px; background: #f4f4f4; text-align: center; border-radius: 4px; letter-spacing: 2px;">
                    ${otp}
                </div>
                <p>This OTP will expire in 10 minutes. Please do not share it with anyone.</p>
                <p>Thank you,<br>The Nova Credit Team</p>
            </div>
        `
    });
}

async function sendLoanConfirmation(email, loanDetails) {
    return sendEmail({
        to: email,
        subject: "Loan Created - Nova Credit",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
                <h2 style="color: #4a90e2;">Loan Successful</h2>
                <p>Hello,</p>
                <p>An admin has created a new loan for your account. Here are the details:</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4a90e2; margin: 20px 0;">
                    <p><strong>Amount:</strong> ₹${loanDetails.amount}</p>
                    <p><strong>Purpose:</strong> ${loanDetails.purpose}</p>
                    <p><strong>Due Date:</strong> ${loanDetails.dueDate}</p>
                    <p><strong>Comments:</strong> ${loanDetails.comments || 'N/A'}</p>
                </div>
                <p>Please login to your dashboard to view full details.</p>
                <p>Thank you,<br>The Nova Credit Team</p>
            </div>
        `
    });
}

async function sendDueDateReminder(email, loanDetails) {
    return sendEmail({
        to: email,
        subject: "Upcoming Loan Due Date - Nova Credit",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; border-top: 5px solid #ff9800;">
                <h2 style="color: #ff9800;">Payment Due Reminder</h2>
                <p>Hello,</p>
                <p>Your loan payment is due in <strong>24 hours</strong>.</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
                    <p><strong>Loan ID:</strong> #${loanDetails.id}</p>
                    <p><strong>Outstanding Balance:</strong> ₹${loanDetails.balance}</p>
                    <p><strong>Due Date:</strong> ${loanDetails.dueDate}</p>
                </div>
                <p>Please make your payment via the portal to avoid penalties.</p>
                <p>Thank you,<br>The Nova Credit Team</p>
            </div>
        `
    });
}

async function sendPenaltyAlert(email, loanDetails) {
    return sendEmail({
        to: email,
        subject: "Overdue Loan Penalty Notice - Nova Credit",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 5px; border-top: 5px solid #f44336;">
                <h2 style="color: #f44336;">Overdue Payment Alert</h2>
                <p>Hello,</p>
                <p>Your loan payment is overdue, and a penalty has been applied.</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
                    <p><strong>Outstanding Balance:</strong> ₹${loanDetails.balance}</p>
                    <p><strong>Days Overdue:</strong> ${loanDetails.daysOverdue}</p>
                    <p><strong>Penalty Applied:</strong> ₹${loanDetails.penalty}</p>
                </div>
                <p>Please clear your dues immediately to prevent further penalties.</p>
                <p>Thank you,<br>The Nova Credit Team</p>
            </div>
        `
    });
}

module.exports = { sendEmail, sendOTP, sendLoanConfirmation, sendDueDateReminder, sendPenaltyAlert };
