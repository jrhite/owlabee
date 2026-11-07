#!/usr/bin/env bash
# Run Grants.gov API & SAM.gov Scraper — Federal Grants Feed
# (owlabee/grants-gov-api) once and print its dataset items as JSON.
# Needs curl 7.76+ and your Apify API token in APIFY_TOKEN.
# Short runs only: the sync endpoint waits up to 300 seconds. Use python.py or node.mjs for longer runs.
set -euo pipefail
: "${APIFY_TOKEN:?Set APIFY_TOKEN to your Apify API token}"
cd "$(dirname "$0")"

curl -sS --fail-with-body -X POST \
  "https://api.apify.com/v2/acts/owlabee~grants-gov-api/run-sync-get-dataset-items" \
  -H "Authorization: Bearer ${APIFY_TOKEN}" \
  -H "Content-Type: application/json" \
  --data @input.json
