"""Run PDF & Document to JSON Extractor (AI) — Invoices, Forms (owlabee/pdf-to-json) once and print each dataset item.

Setup:  pip install apify-client
Token:  export APIFY_TOKEN=<your Apify API token>
"""
import json
import os
from pathlib import Path

from apify_client import ApifyClient

ACTOR_ID = "owlabee/pdf-to-json"

token = os.environ.get("APIFY_TOKEN")
if not token:
    raise SystemExit("Set APIFY_TOKEN to your Apify API token")

run_input = json.loads((Path(__file__).parent / "input.json").read_text(encoding="utf-8"))

client = ApifyClient(token)
run = client.actor(ACTOR_ID).call(run_input=run_input)
if run is None:
    raise SystemExit("The run did not start")
print(f"Run {run['id']} finished with status {run['status']}")

for item in client.dataset(run["defaultDatasetId"]).iterate_items():
    print(json.dumps(item, ensure_ascii=False))
