# Supabase Authentication Setup

To ensure the "Forgot Password" and "Sign Up" flows work correctly, you need to configure your Supabase project settings.

## 1. URL Configuration

Go to **Authentication > URL Configuration** in your Supabase Dashboard.

### Site URL
Set your **Site URL** to your production domain or localhost for development.
- **Example:** `http://localhost:3000` (for local dev) or `https://entemba.shop` (for production)

### Redirect URLs
Add the following paths to your **Redirect URLs** allow list. This ensures Supabase allows redirects to these specific pages after authentication events.

```text
http://localhost:3000/auth/callback
http://localhost:3000/update-password
https://entemba.shop/auth/callback
https://entemba.shop/update-password
```

> **Important:** The `resetPasswordForEmail` function in our code specifically requests a redirect to `/update-password`. If this is not in your allow list, the user may be redirected to the home page or encounter an error.

## 2. Email Templates

Go to **Authentication > Email Templates** in your Supabase Dashboard.

### Reset Password
**Subject:** `Reset Your Password - E-Ntemba`

**Body:**
Use the following HTML template to match the premium dark theme of the application.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .logo { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 24px; }
    .logo-icon { width: 32px; height: 32px; background-color: #2563eb; border-radius: 8px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ffffff; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; font-size: 16px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; transition: background-color 0.2s; }
    .button:hover { background-color: #1d4ed8; }
    .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 14px; }
    .divider { height: 1px; background-color: #1e293b; margin: 32px 0; }
    .link { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span>E-Ntemba</span>
      </div>
      
      <h1>Reset Your Password</h1>
      <p>Hello,</p>
      <p>We received a request to reset the password for your E-Ntemba account. If you didn't make this request, you can safely ignore this email.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </div>
      
      <p>This link will expire in 24 hours for security reasons.</p>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; margin-bottom: 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" class="link" style="word-break: break-all;">{{ .ConfirmationURL }}</a>
      </p>
    </div>
    
    <div class="footer">
      &copy; 2026 E-Ntemba. All rights reserved.<br>
      Lusaka, Zambia
    </div>
  </div>
</body>
</html>
```

### Confirmation Email (Sign Up)
**Subject:** `Confirm Your Email - E-Ntemba`

**Body:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Email</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .logo { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #ffffff; }
    p { color: #94a3b8; line-height: 1.6; margin-bottom: 24px; font-size: 16px; }
    .button { display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; text-align: center; transition: background-color 0.2s; }
    .button:hover { background-color: #1d4ed8; }
    .footer { text-align: center; margin-top: 32px; color: #64748b; font-size: 14px; }
    .divider { height: 1px; background-color: #1e293b; margin: 32px 0; }
    .link { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span>E-Ntemba</span>
      </div>
      
      <h1>Welcome to E-Ntemba</h1>
      <p>Hello,</p>
      <p>Thank you for joining E-Ntemba. To get started, please confirm your email address by clicking the button below.</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Email</a>
      </div>
      
      <div class="divider"></div>
      
      <p style="font-size: 14px; margin-bottom: 0;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{{ .ConfirmationURL }}" class="link" style="word-break: break-all;">{{ .ConfirmationURL }}</a>
      </p>
    </div>
    
    <div class="footer">
      &copy; 2026 E-Ntemba. All rights reserved.<br>
      Lusaka, Zambia
    </div>
  </div>
</body>
</html>
```
