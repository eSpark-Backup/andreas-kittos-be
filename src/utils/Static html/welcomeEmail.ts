/* eslint-disable prettier/prettier */
export const welcomeEmailTemplate = ` 
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        text-align: center;
    }
    .container {
        max-width: 600px;
        margin: 50px auto;
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    h1 {
        color: #333;
    }
    p {
        color: #666;
        margin-bottom: 20px;
    }
    .otp {
        font-size: 24px;
        font-weight: bold;
        color: #007bff;
        margin-top: 20px;
    }
    .note {
        color: #999;
        font-size: 12px;
        margin-top: 10px;
    }
</style>
</head>
<body>
<div class="container">
    <h1>Welcome to Mpougadalaundry</h1>
    <p>Your OTP for verification is:</p>
    <p class="otp">\${otp}</p>
    <p class="note">Note: This OTP is valid for a limited time.</p>
</div>
</body>
</html>
`;