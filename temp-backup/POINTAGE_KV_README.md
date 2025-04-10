# Pointage KV Data Setup

This directory contains sample data files for setting up the Cloudflare KV store for the Pointage application.

## Sample Data Files

- `users.json`: Contains admin user data
- `user-email-index.json`: Index mapping user emails to IDs
- `employees.json`: Sample employee data
- `employee-ids.json`: List of all employee IDs
- `attendance.json`: Sample attendance records

## Setup Instructions

1. Create KV namespaces using Wrangler (when internet connection is stable):
   ```
   wrangler kv:namespace create POINTAGE_DB
   wrangler kv:namespace create POINTAGE_DB --preview
   ```

2. After creating the namespaces, you'll receive namespace IDs. Update your `wrangler.toml` file with these IDs:
   ```
   kv_namespaces = [
     { binding = "POINTAGE_DB", id = "YOUR_KV_NAMESPACE_ID", preview_id = "YOUR_KV_PREVIEW_ID" }
   ]
   ```

3. Also update the KV namespace IDs in the import script:
   - For Bash/Linux/Mac: Edit `import.sh`
   - For Windows: Edit `import.ps1`

4. Run the import script:
   - On Bash/Linux/Mac: `chmod +x import.sh && ./import.sh`
   - On Windows: `.\import.ps1`

## Troubleshooting

If you encounter issues with the Wrangler authentication through the browser:

1. Generate an API token on the Cloudflare dashboard:
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Create a token with the necessary permissions for Workers and KV

2. Set the token as an environment variable:
   ```
   export CLOUDFLARE_API_TOKEN=your_token  # Bash/Linux/Mac
   $env:CLOUDFLARE_API_TOKEN="your_token"  # PowerShell
   ```

3. Try running the wrangler commands again.

## Manual KV Setup

If you continue to have issues with wrangler, you can also manually upload the data through the Cloudflare Dashboard:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > KV
3. Select your KV namespace
4. Manually add each key-value pair from the JSON files

## Next Steps

After successfully importing the data, update your `wrangler.toml` file in the workers-api directory to include the KV namespace binding, then deploy your Workers API with:

```
cd workers-api
wrangler publish
``` 