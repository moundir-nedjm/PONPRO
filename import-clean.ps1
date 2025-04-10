# KV Import Script for Pointage API (PowerShell version)
# Generated: 2025-04-06T22:45:00.000Z

# KV namespace IDs
$KV_ID = "c10599bf6a58430c949804b474341a6f"
$KV_PREVIEW_ID = "9df50ec6f59a42c48641b86d584339cf"

# Import into production KV namespace
Write-Host "Importing to production KV namespace..."
wrangler kv:bulk put --namespace-id=$KV_ID users.json
wrangler kv:bulk put --namespace-id=$KV_ID user-email-index.json
wrangler kv:bulk put --namespace-id=$KV_ID employees.json
wrangler kv:bulk put --namespace-id=$KV_ID employee-ids.json
wrangler kv:bulk put --namespace-id=$KV_ID attendance.json

# Import into preview KV namespace
Write-Host "Importing to preview KV namespace..."
wrangler kv:bulk put --namespace-id=$KV_PREVIEW_ID --preview users.json
wrangler kv:bulk put --namespace-id=$KV_PREVIEW_ID --preview user-email-index.json
wrangler kv:bulk put --namespace-id=$KV_PREVIEW_ID --preview employees.json
wrangler kv:bulk put --namespace-id=$KV_PREVIEW_ID --preview employee-ids.json
wrangler kv:bulk put --namespace-id=$KV_PREVIEW_ID --preview attendance.json

Write-Host "Import complete!" 