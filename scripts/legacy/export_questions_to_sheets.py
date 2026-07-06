"""
Fetches all questions + answer options from the ReNo/TestPersonal API
and writes them to a new Google Spreadsheet.

Run once: python3 export_questions_to_sheets.py
It will open a browser for Google authorization on first run.
"""

import json
import os
import urllib.request
import warnings
warnings.filterwarnings("ignore")

# ── 1. Fetch data from the API ─────────────────────────────────────────────

API_URL = "http://159.194.222.35:3010/api/methodologies/testpersonal"

print("Fetching questions from API...")
with urllib.request.urlopen(API_URL) as resp:
    data = json.loads(resp.read().decode())

questions = data["versions"][0]["questions"]
print(f"  Got {len(questions)} questions.")

# ── 2. Build rows ──────────────────────────────────────────────────────────

# Find max number of options across all questions
max_opts = max(len(q["options"]) for q in questions)

# Header row
option_headers = []
for i in range(1, max_opts + 1):
    letter = chr(ord("A") + i - 1)
    option_headers += [
        f"Option {letter} Code",
        f"Option {letter} Text",
        f"Option {letter} Key",
        f"Option {letter} Score",
    ]

headers = ["#", "Question Code", "Question Text"] + option_headers
rows = [headers]

for q in questions:
    row = [q["order"], q["code"], q["text"]]
    for opt in q["options"]:
        key_scores = opt.get("keyScores", [])
        key_code = key_scores[0]["key"]["code"] if key_scores else ""
        score = key_scores[0]["score"] if key_scores else ""
        row += [opt["code"], opt["text"], key_code, score]
    # Pad missing options
    while len(row) < len(headers):
        row.append("")
    rows.append(row)

print(f"  Built {len(rows) - 1} data rows × {len(headers)} columns.")

# ── 3. Authorize with Google and create the spreadsheet ───────────────────

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import google.oauth2.credentials

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]
TOKEN_FILE = os.path.expanduser("~/.reno_sheets_token.json")
CREDS_FILE = os.path.expanduser("~/reno_google_credentials.json")

if not os.path.exists(CREDS_FILE):
    print(
        "\nERROR: Google credentials file not found.\n"
        f"Expected: {CREDS_FILE}\n"
        "See the instructions printed by the setup script."
    )
    raise SystemExit(1)

creds = None
if os.path.exists(TOKEN_FILE):
    with open(TOKEN_FILE) as f:
        token_data = json.load(f)
    creds = google.oauth2.credentials.Credentials(
        token=token_data.get("token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=token_data.get("client_id"),
        client_secret=token_data.get("client_secret"),
        scopes=SCOPES,
    )

if not creds or not creds.valid:
    flow = InstalledAppFlow.from_client_secrets_file(CREDS_FILE, SCOPES)
    creds = flow.run_local_server(port=0, open_browser=True)
    token_data = {
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
    }
    with open(TOKEN_FILE, "w") as f:
        json.dump(token_data, f)
    print("  Google authorization saved.")

sheets_service = build("sheets", "v4", credentials=creds)
drive_service  = build("drive",  "v3", credentials=creds)

# ── 4. Create spreadsheet ──────────────────────────────────────────────────

print("\nCreating Google Spreadsheet...")
spreadsheet = sheets_service.spreadsheets().create(body={
    "properties": {"title": "ReNo — TestPersonal Questions & Answers"},
    "sheets": [{"properties": {"title": "Questions"}}],
}).execute()

spreadsheet_id = spreadsheet["spreadsheetId"]
sheet_id = spreadsheet["sheets"][0]["properties"]["sheetId"]
url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}"
print(f"  Created: {url}")

# ── 5. Write data ──────────────────────────────────────────────────────────

print("Writing data...")
sheets_service.spreadsheets().values().update(
    spreadsheetId=spreadsheet_id,
    range="Questions!A1",
    valueInputOption="RAW",
    body={"values": rows},
).execute()

# ── 6. Format: freeze header row, bold it, auto-resize columns ────────────

requests = [
    # Freeze header row
    {"updateSheetProperties": {
        "properties": {"sheetId": sheet_id, "gridProperties": {"frozenRowCount": 1}},
        "fields": "gridProperties.frozenRowCount",
    }},
    # Bold header
    {"repeatCell": {
        "range": {"sheetId": sheet_id, "startRowIndex": 0, "endRowIndex": 1},
        "cell": {"userEnteredFormat": {"textFormat": {"bold": True}}},
        "fields": "userEnteredFormat.textFormat.bold",
    }},
    # Auto-resize all columns
    {"autoResizeDimensions": {
        "dimensions": {
            "sheetId": sheet_id,
            "dimension": "COLUMNS",
            "startIndex": 0,
            "endIndex": len(headers),
        }
    }},
]
sheets_service.spreadsheets().batchUpdate(
    spreadsheetId=spreadsheet_id,
    body={"requests": requests},
).execute()

print("\nDone!")
print(f"Open your spreadsheet: {url}")
