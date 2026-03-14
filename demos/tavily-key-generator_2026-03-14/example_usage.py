#!/usr/bin/env python3
"""
Example usage of the Tavily Key Generator API
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000"
ADMIN_TOKEN = "demo-admin-token-change-in-production"

HEADERS = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json"
}


def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def main():
    print("Tavily Key Generator - Example Usage")
    print("="*60)

    # 1. Health Check
    print("\n1. Health Check")
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)

    # 2. Generate a single key
    print("\n2. Generate Single Key")
    payload = {
        "email": "user@example.com",
        "note": "Example key for demonstration"
    }
    response = requests.post(
        f"{BASE_URL}/api/generate",
        headers=HEADERS,
        json=payload
    )
    print_response("Generate Single Key", response)

    # Save the generated key for later use
    if response.status_code == 201:
        generated_key = response.json()['key']['key']
        print(f"\n✓ Generated key: {generated_key}")

    # 3. Batch generate keys
    print("\n3. Batch Generate Keys")
    batch_payload = {
        "keys": [
            {"email": "user1@example.com", "note": "Batch key 1"},
            {"email": "user2@example.com", "note": "Batch key 2"},
            {"email": "user3@example.com", "note": "Batch key 3"}
        ]
    }
    response = requests.post(
        f"{BASE_URL}/api/batch-generate",
        headers=HEADERS,
        json=batch_payload
    )
    print_response("Batch Generate Keys", response)

    # 4. List all keys
    print("\n4. List All Keys")
    response = requests.get(
        f"{BASE_URL}/api/keys",
        headers=HEADERS
    )
    print_response("List All Keys", response)

    # 5. Get statistics
    print("\n5. Get Statistics")
    response = requests.get(
        f"{BASE_URL}/api/stats",
        headers=HEADERS
    )
    print_response("Statistics", response)

    # 6. Revoke a key (using partial key match)
    print("\n6. Revoke a Key")
    if response.status_code == 200 and response.json()['total'] > 0:
        # Get first key ID (partial match works)
        key_id = generated_key[:8]  # Use first 8 characters
        response = requests.delete(
            f"{BASE_URL}/api/keys/{key_id}",
            headers=HEADERS
        )
        print_response("Revoke Key", response)

    # 7. Verify statistics after revocation
    print("\n7. Verify Statistics After Revocation")
    response = requests.get(
        f"{BASE_URL}/api/stats",
        headers=HEADERS
    )
    print_response("Updated Statistics", response)

    print("\n" + "="*60)
    print("Example usage completed!")
    print("="*60)


if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to the API server.")
        print("Make sure the Flask server is running:")
        print("  python app.py")
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
