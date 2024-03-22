/* eslint-disable prettier/prettier */
export const resendEmailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resend OTP</title>
</head>
<body>
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Resend OTP for Verification</h2>
        <p>Dear \${name},</p>
        <p>Your new OTP for verification is: <strong>\${otp}</strong></p>
        <p>Please use this OTP to complete your verification process.</p>
        <p>If you didn't request this OTP, please ignore this message.</p>
        <br>
        <p>Best regards,</p>
        <p>Your Company Name</p>
    </div>
</body>
</html>
`;
