"""
Simple API Key Generation Service Demo
Demonstrates basic Flask API for generating and managing API keys using UUID.

## Features

- 🔑 Generate unique API keys using UUID4
- 💾 Store keys in a JSON file
- ✅ Validate existing API keys
- 📧 Associate keys with email addresses
- 📋 List all generated keys

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables (Optional)

```bash
export FLASK_APP=app.py
export FLASK_ENV=development
```

## Run

### Start the Server

```bash
python3 app.py
```

The server will start on `http://localhost:5000`

### Test the API

```bash
# Generate a new key
curl -X POST http://localhost:5000/api/keys/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# List all keys
curl http://localhost:5000/api/keys

# Validate a key
curl http://localhost:5000/api/keys/validate/tvly-xxx-xxx-xxx
```

## Project Structure

```
tavily-key-generator/
├── app.py              # Flask application
├── requirements.txt     # Python dependencies
├── api_keys.json       # Generated keys storage (auto-created)
└── README.md          # This file
```

## API Endpoints

### POST /api/keys/generate
Generate a new API key.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "key": "tvly-xxxxxxxx-xxxx-xxxx",
  "email": "user@example.com",
  "created_at": "2026-03-14T13:30:00Z",
  "status": "active"
}
```

### GET /api/keys
List all generated API keys.

**Response:**
```json
{
  "keys": [
    {
      "key": "tvly-xxx-xxx-xxx",
      "email": "user@example.com",
      "created_at": "2026-03-14T13:30:00Z"
    }
  ],
  "total": 1
}
```

### GET /api/keys/validate/<key>
Validate if a key exists.

**Response:**
```json
{
  "valid": true,
  "key": "tvly-xxx-xxx-xxx",
  "email": "user@example.com"
}
```

## Notes

- Keys are stored in `api_keys.json` in the same directory
- Keys use UUID4 format for uniqueness
- Email association is optional
- No authentication required for this demo

---

*Demo created for GitHub Trending analysis - 2026-03-14*
