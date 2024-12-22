from flask import Flask, request, jsonify
import cv2
import numpy as np
import tensorflow as tf
from keras.models import load_model
import base64
from PIL import Image
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

app = Flask(__name__)
CORS(app)

label_dictionary = {0: '0', 1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 
                   10: 'A', 11: 'B', 12: 'C', 13: 'D', 14: 'E', 15: 'F', 16: 'G', 17: 'H', 18: 'I', 
                   19: 'J', 20: 'K', 21: 'L', 22: 'M', 23: 'N', 24: 'O', 25: 'P', 26: 'Q', 27: 'R', 
                   28: 'S', 29: 'T', 30: 'U', 31: 'V', 32: 'W', 33: 'X', 34: 'Y', 35: 'Z', 36: 'a', 
                   37: 'b', 38: 'd', 39: 'e', 40: 'f', 41: 'g', 42: 'h', 43: 'n', 44: 'q', 45: 'r', 46: 't'}

invest_message = '''I am building a finance web app
Here is my objects and methods stored in mysql table
-- CreateTable
CREATE TABLE `accounts` (
    `account_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(45) NOT NULL,
    `description` LONGTEXT NULL,
    `exclude_from_budgets` BOOLEAN NOT NULL,
    `status` VARCHAR(45) NOT NULL,
    `users_user_id` BIGINT NOT NULL,
    `current_balance` BIGINT NULL DEFAULT 0,
    `created_timestamp` BIGINT NULL,
    `updated_timestamp` BIGINT NULL,
    `color_gradient` VARCHAR(45) NULL,

    UNIQUE INDEX `account_id_UNIQUE`(`account_id`),
    INDEX `fk_accounts_users1_idx`(`users_user_id`),
    UNIQUE INDEX `name_UNIQUE`(`name`, `users_user_id`),
    PRIMARY KEY (`account_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `balances` (
    `balance_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `amount` DOUBLE NOT NULL,
    `accounts_account_id` BIGINT NOT NULL,

    INDEX `fk_balances_accounts1_idx`(`accounts_account_id`),
    PRIMARY KEY (`balance_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `balances_snapshot` (
    `accounts_account_id` BIGINT NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `balance` BIGINT NOT NULL DEFAULT 0,
    `created_timestamp` BIGINT NOT NULL,
    `updated_timestamp` BIGINT NULL,

    INDEX `fk_balances_snapshot_accounts1_idx`(`accounts_account_id`),
    PRIMARY KEY (`accounts_account_id`, `month`, `year`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets` (
    `budget_id` BIGINT NOT NULL AUTO_INCREMENT,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `observations` LONGTEXT NULL,
    `is_open` BOOLEAN NOT NULL,
    `initial_balance` BIGINT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `budget_id_UNIQUE`(`budget_id`),
    INDEX `fk_budgets_users1_idx`(`users_user_id`),
    UNIQUE INDEX `uq_month_year_user`(`month`, `year`, `users_user_id`),
    PRIMARY KEY (`budget_id`, `users_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `budgets_has_categories` (
    `budgets_budget_id` BIGINT NOT NULL,
    `budgets_users_user_id` BIGINT NOT NULL,
    `categories_category_id` BIGINT NOT NULL,
    `planned_amount_credit` BIGINT NOT NULL DEFAULT 0,
    `current_amount` BIGINT NOT NULL DEFAULT 0,
    `planned_amount_debit` BIGINT NOT NULL DEFAULT 0,

    INDEX `fk_budgets_has_categories_budgets1_idx`(`budgets_budget_id`, `budgets_users_user_id`),
    INDEX `fk_budgets_has_categories_categories1_idx`(`categories_category_id`),
    PRIMARY KEY (`budgets_budget_id`, `budgets_users_user_id`, `categories_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `category_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` CHAR(1) NOT NULL,
    `users_user_id` BIGINT NOT NULL,
    `description` LONGTEXT NULL,
    `color_gradient` VARCHAR(45) NULL,
    `status` VARCHAR(45) NOT NULL DEFAULT 'Ativa',
    `exclude_from_budgets` TINYINT NOT NULL DEFAULT 0,

    INDEX `fk_category_users_idx`(`users_user_id`),
    UNIQUE INDEX `uq_name_type_user_id`(`users_user_id`, `type`, `name`),
    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `entities` (
    `entity_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `entity_id_UNIQUE`(`entity_id`),
    INDEX `fk_entities_users1_idx`(`users_user_id`),
    INDEX `name`(`name`),
    UNIQUE INDEX `name_UNIQUE`(`name`, `users_user_id`),
    PRIMARY KEY (`entity_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_asset_evo_snapshot` (
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `invested_amount` BIGINT NOT NULL,
    `current_value` BIGINT NOT NULL,
    `invest_assets_asset_id` BIGINT NOT NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NOT NULL,
    `withdrawn_amount` BIGINT NOT NULL,

    INDEX `fk_invest_asset_evo_snapshot_invest_assets1_idx`(`invest_assets_asset_id`),
    UNIQUE INDEX `uq_month_year_invest_assets_asset_id`(`month`, `year`, `invest_assets_asset_id`),
    PRIMARY KEY (`month`, `year`, `invest_assets_asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_assets` (
    `asset_id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(75) NOT NULL,
    `ticker` VARCHAR(45) NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `type` VARCHAR(75) NOT NULL,
    `broker` VARCHAR(45) NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `asset_id_UNIQUE`(`asset_id`),
    INDEX `fk_invest_assets_users1_idx`(`users_user_id`),
    UNIQUE INDEX `users_user_id_type_name_unique`(`name`, `type`, `users_user_id`),
    PRIMARY KEY (`asset_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_desired_allocations` (
    `desired_allocations_id` BIGINT NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(75) NOT NULL,
    `alloc_percentage` FLOAT NULL,
    `users_user_id` BIGINT NOT NULL,

    UNIQUE INDEX `desired_allocations_id_UNIQUE`(`desired_allocations_id`),
    UNIQUE INDEX `type_UNIQUE`(`type`),
    INDEX `fk_invest_desired_allocations_users1_idx`(`users_user_id`),
    PRIMARY KEY (`desired_allocations_id`, `type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invest_transactions` (
    `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `type` ENUM('B', 'S') NOT NULL,
    `note` VARCHAR(100) NULL,
    `total_price` BIGINT NOT NULL,
    `units` DECIMAL(16, 6) NOT NULL,
    `fees_taxes` BIGINT NULL DEFAULT 0,
    `invest_assets_asset_id` BIGINT NOT NULL,
    `created_at` BIGINT NOT NULL,
    `updated_at` BIGINT NOT NULL,

    UNIQUE INDEX `transaction_id_UNIQUE`(`transaction_id`),
    INDEX `fk_invest_transactions_invest_assets1_idx`(`invest_assets_asset_id`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rules` (
    `rule_id` BIGINT NOT NULL AUTO_INCREMENT,
    `matcher_description_operator` VARCHAR(45) NULL,
    `matcher_description_value` VARCHAR(45) NULL,
    `matcher_amount_operator` VARCHAR(45) NULL,
    `matcher_amount_value` BIGINT NULL,
    `matcher_type_operator` VARCHAR(45) NULL,
    `matcher_type_value` VARCHAR(45) NULL,
    `matcher_account_to_id_operator` VARCHAR(45) NULL,
    `matcher_account_to_id_value` BIGINT NULL,
    `matcher_account_from_id_operator` VARCHAR(45) NULL,
    `matcher_account_from_id_value` BIGINT NULL,
    `assign_category_id` BIGINT NULL,
    `assign_entity_id` BIGINT NULL,
    `assign_account_to_id` BIGINT NULL,
    `assign_account_from_id` BIGINT NULL,
    `assign_type` VARCHAR(45) NULL,
    `users_user_id` BIGINT NOT NULL,
    `assign_is_essential` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_rules_users1_idx`(`users_user_id`),
    PRIMARY KEY (`rule_id`, `users_user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `transaction_id` BIGINT NOT NULL AUTO_INCREMENT,
    `date_timestamp` BIGINT NOT NULL,
    `amount` BIGINT NOT NULL,
    `type` CHAR(1) NOT NULL,
    `description` LONGTEXT NULL,
    `entities_entity_id` INTEGER NULL,
    `accounts_account_from_id` BIGINT NULL,
    `accounts_account_to_id` BIGINT NULL,
    `categories_category_id` BIGINT NULL,
    `is_essential` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `transaction_id_UNIQUE`(`transaction_id`),
    INDEX `fk_transactions_accounts1_idx`(`accounts_account_from_id`),
    INDEX `fk_transactions_categories1_idx`(`categories_category_id`),
    INDEX `fk_transactions_entities2_idx`(`entities_entity_id`),
    PRIMARY KEY (`transaction_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(45) NOT NULL,
    `password` MEDIUMTEXT NOT NULL,
    `email` VARCHAR(45) NOT NULL,
    `sessionkey` MEDIUMTEXT NULL,
    `sessionkey_mobile` MEDIUMTEXT NULL,
    `trustlimit` INTEGER NULL,
    `trustlimit_mobile` INTEGER NULL,
    `last_update_timestamp` BIGINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `username_UNIQUE`(`username`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`entities_entity_id`) REFERENCES `entities`(`entity_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`categories_category_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE NO ACTION;
The data is stored in mysql
can u help me write mysql queries to answer my natural language queries
Reply with a mysql query for each of my prompts from now on
'''

@app.route('/predict', methods=['POST'])
def predict_character():
    try:
        # Get the image data from the request
        data = request.json.get('image')
        if not data:
            return jsonify({'error': 'No image data received'}), 400

        # Remove the data URL prefix (e.g., 'data:image/png;base64,')
        image_data = data.split(',')[1]
        
        # Decode base64 string to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Convert bytes to numpy array
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        
        # Decode image array to OpenCV format
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
        
        if img is None:
            return jsonify({'error': 'Failed to decode image'}), 400

        # Preprocess the image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = 255 - gray  # Invert the image
        gray_resized = cv2.resize(gray, (28, 28))
        gray_reshaped = gray_resized.reshape(1, 28, 28, 1) / 255.0

        # Predict the character
        with tf.device('/device:cpu:0'):
            model = load_model("canvas/my_model.h5")
            prediction = model.predict(gray_reshaped)
            predicted_class = prediction.argmax()
            output = label_dictionary[predicted_class]
            print(f"Predicted class: {predicted_class}, Character: {output}")

        return jsonify({'character': output})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

def extract_js_function(text):
    """
    Extracts JavaScript code from text that contains markdown code blocks.
    
    Args:
        text (str): Input text containing markdown-formatted code blocks
        
    Returns:
        str: Extracted JavaScript code, or None if no JavaScript code is found
    """
    # Split the text into lines
    lines = text.split('\n')
    
    # Variables to track parsing state
    in_code_block = False
    is_javascript = False
    js_code = []
    
    for line in lines:
        # Check for code block start
        if line.strip().startswith('```'):
            if in_code_block:
                # End of code block
                in_code_block = False
                is_javascript = False
            else:
                # Start of code block
                in_code_block = True
                # Check if this is a JavaScript block
                if 'sql' in line.strip().lower():
                    is_javascript = True
                continue
        
        # If we're in a JavaScript code block, collect the code
        if in_code_block and is_javascript:
            js_code.append(line)
    
    # Join the collected JavaScript code lines
    if js_code:
        return '\n'.join(js_code)
    return None

@app.route('/givemesqlquery', methods=['POST'])
def generate_sql_query():
    try:
        data = request.json.get('nl_prompt')
        if not data:
            return jsonify({'error': 'No nl_prompt received'}), 400
        
        chat_session = model.start_chat(history=[])
        query = chat_session.send_message(invest_message).text
        final_query = extract_js_function(query)
        print(final_query)    

        return jsonify({'query': final_query})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
