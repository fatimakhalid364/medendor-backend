const codeMailSub = 'Your Secret Code';
const codeMailHtml = (code) => `Your verification code is: ${code}`;


const verifyDocMailSub = 'New Doctor Registration';
const verifyDocMailHtml = (name, specialization) => `
    <p>Hello Admin,</p>
    <p>A new doctor has completed their profile and requested verification:</p>
    <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Specialization:</strong> ${specialization || 'Not provided'}</li>
        <li><strong>Registration date:</strong> ${new Date(registrationDate).toLocaleString()}</li>
    </ul>
    <p>Please <a href="${adminDashboardUrl}">click here</a> to review and verify this doctor.</p>
    <p>Thanks</p>
`

const resetPasswordMailSub = 'Your password reset token';

const resetPasswordMailHtml = (resetUrl) => `
    <div>
        <h2>Reset your password</h2>

        <p>
            We received a request to reset your password.
        </p>

        <p>
            Click the button below to choose a new password:
        </p>

        <a
            href="${resetUrl}"
            style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
            "
        >
            Reset Password
        </a>

        <p>
            This link will expire in 15 minutes and can only be used once.
        </p>

        <p>
            If you didn't request a password reset, you can safely ignore this email.
        </p>
    </div>
`;


module.exports = {
    codeMailSub, 
    codeMailHtml, 
    verifyDocMailSub, 
    verifyDocMailHtml,
    resetPasswordMailSub,
    resetPasswordMailHtml
};