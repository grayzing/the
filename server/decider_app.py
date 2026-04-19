import decider
from flask import Flask, request, jsonify
import base64
import tempfile
import os

app = Flask(__name__)

"""
/check_relevance takes a JSON

data {
'screenshot' : byte64 of screenshot
'objective'  : long string, all objectives collected from the client
}

"""

@app.route('/check_relevance', methods=['POST'])
def check_relevance():
    data = request.get_json()
    if not data or 'screenshot' not in data or 'objective' not in data:
        return jsonify({'error': 'Missing screenshot or objective'}), 400
    
    screenshot_b64 = data['screenshot']
    objective = data['objective']
    
    # Decode base64 to bytes
    try:
        image_bytes = base64.b64decode(screenshot_b64)
    except Exception as e:
        return jsonify({'error': 'Invalid base64'}), 400
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as temp_file:
        temp_file.write(image_bytes)
        temp_path = temp_file.name
    
    try:
        # Call decider function
        relevance = decider.webpage_classify(temp_path, objective)
        return jsonify({'relevance': relevance})
    finally:
        # Clean up temp file
        os.unlink(temp_path)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)