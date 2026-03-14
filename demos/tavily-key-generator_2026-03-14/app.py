"""
Simple API Key Generation Service
Demonstrates basic Flask API for generating and managing API keys using UUID.
"""

import os
import json
import uuid
from datetime import datetime
from flask import Flask, jsonify, request

app = Flask(__name__)

# Configuration
KEYS_FILE = 'api_keys.json'
KEY_PREFIX = 'tvly-'  # Tavily-style prefix

def load_keys():
    """Load existing keys from JSON file."""
    if os.path.exists(KEYS_FILE):
        try:
            with open(KEYS_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}

def save_keys(keys):
    """Save keys to JSON file."""
    with open(KEYS_FILE, 'w') as f:
        json.dump(keys, f, indent=2)

def generate_key():
    """Generate a new API key using UUID4."""
    unique_id = uuid.uuid4()
    return f"{KEY_PREFIX}{unique_id}"

@app.route('/api/keys/generate', methods=['POST'])
def api_generate_key():
    """Generate a new API key."""
    try:
        data = request.get_json()
        email = data.get('email', 'unknown')
        
        # Generate new key
        key = generate_key()
        
        # Load existing keys
        keys = load_keys()
        
        # Store new key
        keys[key] = {
            'email': email,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'active'
        }
        
        # Save keys
        save_keys(keys)
        
        return jsonify({
            'key': key,
            'email': email,
            'created_at': keys[key]['created_at'],
            'status': 'active'
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/keys', methods=['GET'])
def api_list_keys():
    """List all generated API keys."""
    try:
        keys = load_keys()
        keys_list = []
        
        for key, data in keys.items():
            keys_list.append({
                'key': key,
                'email': data.get('email', 'unknown'),
                'created_at': data['created_at'],
                'status': data.get('status', 'active')
            })
        
        return jsonify({
            'keys': keys_list,
            'total': len(keys_list)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/keys/validate/<key_to_validate>', methods=['GET'])
def api_validate_key(key_to_validate):
    """Validate if a key exists."""
    try:
        keys = load_keys()
        
        if key_to_validate in keys:
            return jsonify({
                'valid': True,
                'key': key_to_validate,
                'email': keys[key_to_validate].get('email', 'unknown')
            })
        else:
            return jsonify({
                'valid': False,
                'key': key_to_validate
            }), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Index page with API documentation."""
    return jsonify({
        'message': 'API Key Generation Service Demo',
        'version': '1.0.0',
        'endpoints': {
            'POST /api/keys/generate': 'Generate a new API key',
            'GET /api/keys': 'List all API keys',
            'GET /api/keys/validate/<key>': 'Validate a key'
        }
    })

if __name__ == '__main__':
    print('🚀 Starting API Key Generation Service...')
    print('📍 API endpoints available at http://localhost:5000')
    print('📖 API documentation at http://localhost:5000')
    print('')
    app.run(debug=True, host='0.0.0.0', port=5000)
