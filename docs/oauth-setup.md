# OAuth Provider Setup Guide

This guide will help you set up OAuth authentication with Google and GitHub for the Sentra Portal.

## Google OAuth Setup

1. **Go to Google Cloud Console**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - Choose "External" for user type
     - Fill in the application name, support email, and other required fields
     - Add your domain to authorized domains
     - Save and continue

4. **Configure OAuth Client**
   - Application type: "Web application"
   - Name: "Sentra Portal"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-domain.com/api/auth/callback/google` (for production)
   - Click "Create"

5. **Save Credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file:
     ```
     GOOGLE_CLIENT_ID="your-client-id"
     GOOGLE_CLIENT_SECRET="your-client-secret"
     ```

## GitHub OAuth Setup

1. **Go to GitHub Settings**
   - Visit your GitHub account settings
   - Navigate to "Developer settings" > "OAuth Apps"

2. **Create New OAuth App**
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: "Sentra Portal"
     - Homepage URL: `http://localhost:3000` (for development) or your production URL
     - Application description: "Secure authentication portal"
     - Authorization callback URL: 
       - `http://localhost:3000/api/auth/callback/github` (for development)
       - `https://your-domain.com/api/auth/callback/github` (for production)
   - Click "Register application"

3. **Generate Client Secret**
   - After creating the app, click "Generate a new client secret"
   - Copy the Client ID and Client Secret immediately (the secret is only shown once)

4. **Save Credentials**
   - Add them to your `.env.local` file:
     ```
     GITHUB_CLIENT_ID="your-client-id"
     GITHUB_CLIENT_SECRET="your-client-secret"
     ```

## Testing OAuth Integration

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Visit the sign-in page**
   - Go to `http://localhost:3000/auth/signin`
   - You should see buttons for "Continue with Google" and "Continue with GitHub"

3. **Test each provider**
   - Click on each OAuth button
   - You should be redirected to the provider's login page
   - After authorization, you should be redirected back to your application

## Security Considerations

1. **Keep secrets secure**
   - Never commit OAuth secrets to version control
   - Use environment variables for all sensitive data
   - Rotate secrets periodically

2. **Configure allowed domains**
   - Only add trusted domains to OAuth redirect URIs
   - Use exact paths, not wildcards
   - Remove development URLs in production

3. **Set appropriate scopes**
   - Only request the minimum necessary user data
   - For this application, we only need basic profile information

## Troubleshooting

### "Redirect URI mismatch" error
- Ensure the callback URL in your OAuth app settings exactly matches the one used by NextAuth
- Check for trailing slashes or protocol differences (http vs https)

### "Invalid client" error
- Verify that your client ID and secret are correctly set in environment variables
- Ensure there are no extra spaces or quotes in the values

### Users can't sign in
- Check that the OAuth APIs are enabled in Google Cloud Console
- Verify that your OAuth consent screen is configured properly
- Ensure your domain is added to authorized domains

## Production Deployment

When deploying to production:

1. Update OAuth app settings with production URLs
2. Use HTTPS for all redirect URIs
3. Set `NEXTAUTH_URL` to your production domain
4. Ensure all environment variables are properly set in your hosting platform
5. Test OAuth flow in production environment