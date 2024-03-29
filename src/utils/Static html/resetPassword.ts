export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset OTP</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Hi, \${name}</h2>
        <p>We received a request to reset your password. Please enter the following One Time PIN in the mpougadalaundry app to proceed:</p>
        <div style="border: 1px solid #ccc; padding: 10px; text-align: center; font-size: 24px; font-weight: bold;">
            \${otp}
        </div>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If this wasn't you:</p>
        <p>Please call mpougadalaundry Customer Service at <a href="tel:+12346789">(021) 000-000-000</a> immediately to help protect your account.</p>
        <p>Thank You,</p>
        <p>mpougadalaundry</p>
    </div>
</body>
</html>
`;
