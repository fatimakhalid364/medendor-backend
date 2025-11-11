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

module.exports = {
    codeMailSub, 
    codeMailHtml, 
    verifyDocMailSub, 
    verifyDocMailHtml
};