# Notion Daily Memo

A Raycast extension to quickly add timestamped memos to today's Notion page.

## Features

- Search for pages created today in your Notion database
- Auto-select if only one page exists for today
- Add timestamped memos (format: `[HH:MM] memo content`)
- Memos are appended to the bottom of the page

## Setup

### 1. Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click "New integration"
3. Give it a name (e.g., "Raycast Memo")
4. Select the workspace
5. Copy the "Internal Integration Token"

### 2. Share Database with Integration

1. Open your daily pages database in Notion
2. Click "..." menu → "Connections" → "Connect to" → Select your integration
3. Copy the Database ID from the URL:
   - URL format: `https://www.notion.so/{workspace}/{database_id}?v=...`
   - The database_id is the 32-character string before `?v=`

### 3. Configure Extension

1. Open Raycast
2. Search for "Add Memo to Today's Page"
3. On first run, you'll be prompted to enter:
   - **Notion Integration Token**: The token from step 1
   - **Database ID**: The ID from step 2

## Usage

1. Open Raycast (default: `⌘ + Space`)
2. Type "Add Memo" or "Today's Page"
3. If multiple pages exist for today, select one from the list
4. Enter your memo in the text area
5. Press Enter to submit

The memo will be added to the bottom of the page with a timestamp like `[14:30] Your memo here`.

## Requirements

- Raycast
- Notion account with API access
- A database containing your daily pages

## Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## License

MIT
