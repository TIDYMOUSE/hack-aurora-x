from flask import Flask, request, jsonify
import numpy as np
from flask_cors import CORS
import io

import google.generativeai as genai
genai.configure(api_key='AIzaSyCzOoGkR0NcKgKFJcXEtFDmxwpgK8TFR3I')
generation_config = {
    "temperature": 0.7,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

account = """
Welcome to the Accounts Page. Manage and monitor all your financial accounts in one place.

Header:
    - Title: "Accounts"
    - Metrics Display: Key financial figures, including:
        - Operating Funds: Total liquid assets available.
        - Investing: Total investment value.
        - Debt: Total outstanding liabilities.
        - Net Worth: Total assets minus liabilities.
    - Button: "Add Account" allows the creation of a new financial account.

Account Categories:
    - Tabbed Navigation for filtering accounts:
        - All: Displays all accounts in a consolidated view.
        - Operating Funds: Accounts with liquid cash or current balances.
        - Debt: Credit or loan accounts.
        - Investments: Accounts holding investment assets.
        - Others: Any uncategorized accounts.

Accounts Table:
    - Displays detailed information for each account:
        - Columns:
            - Color: Indicates account type (e.g., red for credit, green for current accounts).
            - Name: Account name or label.
            - Balance: Current balance, showing positive or negative amounts.
            - Status: Displays if the account is "Active" or "Inactive."
            - Actions:
                - Edit: Modify account details.
                - Delete: Remove the account from the list.
    - Rows Per Page Selector: Choose the number of accounts to display per page.
    - Search Bar: Quickly locate a specific account by name or other details.

Actions:
    - Add Account: Opens a form to create a new account entry.
    - Edit Account: Update details of an existing account.
    - Delete Account: Permanently remove an account from the system.

concise_description = 
Manage and track all financial accounts easily.

Header:
    - Title: "Accounts"
    - Metrics: Operating Funds, Investing, Debt, and Net Worth.
    - Button: Add new financial accounts.

Account Categories:
    - Tabs: All, Operating Funds, Debt, Investments, and Others.

Accounts Table:
    - Columns:
        - Color: Represents account type.
        - Name: Account name.
        - Balance: Current amount (positive or negative).
        - Status: Active/Inactive.
        - Actions: Edit or Delete.
    - Search Bar: Locate accounts quickly.
    - Rows Selector: Adjust visible rows per page.

Actions:
    - Add Account: Create new financial entries.
    - Edit Account: Modify existing accounts.
    - Delete Account: Remove unnecessary accounts.

page_header = 
Title: "Accounts"
Metrics Display: Operating Funds, Investing, Debt, and Net Worth.
Button: Add Account to create new financial entries.
account_categories =
Tabbed navigation for filtering accounts:
    - All: Displays all accounts.
    - Operating Funds: Liquid assets or current balances.
    - Debt: Credit or loan accounts.
    - Investments: Accounts holding investment assets.
    - Others: Uncategorized accounts.
accounts_table =
Detailed view of financial accounts:
    - Columns:
        - Color: Visual indicator for account type (e.g., red for credit).
        - Name: Account name or label.
        - Balance: Current account balance.
        - Status: "Active" or "Inactive."
        - Actions: Edit and Delete options.
    - Search Bar: Quickly find accounts by name.
    - Rows Selector: Adjust the number of visible rows.
actions =
Available actions:
    - Add Account: Open a form to create a new account entry.
    - Edit Account: Modify details for existing accounts.
    - Delete Account: Remove an account permanently.
"""
default = "#Based on the description of the page and the data available on the page output an accurate description of the entire page along with the data such that a blind person could make sense of the page along with the data."
  
app = Flask(__name__)
CORS(app)

@app.route('/describe/account', methods=['POST'])
def describe():
    try:
        # Get the image data from the request
        data = request.json.get('message')
        if not data:
            return jsonify({'error': 'No data received'}), 400
        print(data)
        message = default + account + "\nData:" + str(data)
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(message)        
        print(response.text)
        return {'response': response.text}

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500
transaction = ""
@app.route('/describe/transaction', methods=['POST'])
def describetrans():
    try:
        # Get the image data from the request
        data = request.json.get('message')
        if not data:
            return jsonify({'error': 'No data received'}), 400
        print(data)
        message = default + transaction + "\nData:" + str(data)
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(message)        
        print(response.text)
        return jsonify({'response': response.text})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500    
# @app.route('/describe/accounts', methods=['POST'])
# def describe():
#     try:
#         # Get the image data from the request
#         data = request.json.get('question')
#         if not data:
#             return jsonify({'error': 'No question received'}), 400
        
        
    
#         return jsonify({'character': output})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)