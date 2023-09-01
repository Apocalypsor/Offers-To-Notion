# Offers-To-Notion

[![Scheduled yarn start](https://github.com/Apocalypsor/Offers-To-Notion/actions/workflows/schedule.yaml/badge.svg)](https://github.com/Apocalypsor/Offers-To-Notion/actions/workflows/schedule.yaml)

## Introduction

This script is used to fetch job positions from various websites and save them to Notion.

## Setup

GitHub Action is recommended to run this script periodically.

To use GitHub Action, you need to fork this repository and enable GitHub Action in the forked repository.

### 1. Add Database in Notion

Add a new Database in Notion with the following headers:
![Database Header](./docs/header.png)
```text
Name        -   Title
Company     -   Multi-select
Date        -   Date
Link        -   URL
Submitted?  -   Checkbox
Won't Apply -   Checkbox
Ignored?    -   Checkbox
```

You can find the Database ID in the URL of the Database according to [this documentation](https://developers.notion.com/reference/retrieve-a-database#:~:text=To%20find%20a%20database%20ID,a%2032%20characters%20alphanumeric%20string.).

Also, you need to add a new Integration in Notion and get the Internal Integration Secret according to [this documentation](https://www.notion.so/help/create-integrations-with-the-notion-api).

### 2. Run

#### GitHub Action

Add the following secrets in the forked repository:
```
NOTION_TOKEN=<YOUR_INTEGRATION_INTEGRATION_SECRET>
DATABASE_ID=<YOUR_NOTION_DATABASE_ID>
TELEGRAM_BOT_TOKEN=<OPTIONAL_TELEGRAM_BOT_TOKEN>
TELEGRAM_CHAT_ID=<OPTIONAL_TELEGRAM_CHAT_ID>
```

Telegram is used to send notifications when the script fails.

If you configure GitHub Action correctly, the script will run automatically, and you can see new jobs in your notion database.

#### Local

If you want to run the script locally, you need to also add the above secrets in the `.env` file.

Then, run the following commands:

```bash
yarn install
yarn start
```
