# Budget Page Descriptions

extensive_description = """
Welcome to the Budget Page. Manage and track your monthly finances efficiently.

Header:
    - Title: "Budget"
    - Month Selector: Dropdown to select the desired budget month.
    - Button: "Clone Another Budget" allows duplication of an existing budget for reuse.

Summary Section:
    - Displays financial highlights with metrics:
        - Estimated Expenses: Planned expenses for the month.
        - Estimated Balance: Remaining balance after expenses.
        - Initial Balance: Starting balance for the month.
        - Status: Indicates if the budget is open or closed.
        - Estimated Income: Total expected income.
        - Final Balance: Projected closing balance after adjustments.

Debit Section:
    - Tracks spending by category (e.g., Groceries, Loan Payments).
    - Each category includes:
        - Estimated Value: Planned expenditure.
        - Current Value: Actual expenditure.
    - Progress bars visually track spending against the estimated values.

Credit Section:
    - Tracks income sources (e.g., Wages, Auto Maintenance).
    - Each source includes:
        - Estimated Value: Planned income.
        - Current Value: Received income.
    - Progress bars visually track income collection against estimates.

Actions:
    - Update Budget: Opens a form to modify entries for categories and values.
    - Close Budget: Locks the budget, preventing further changes.
"""

concise_description = """
Manage and track monthly budgets efficiently.

Header:
    - Title: "Budget"
    - Month Selector: Select the budget month.
    - Button: Clone another budget for reuse.

Summary:
    - Estimated Expenses, Balance, Income, and Status metrics.

Debit Section:
    - Categories: Groceries, Loan Payments, etc.
    - Tracks: Estimated and Current values with progress bars.

Credit Section:
    - Income Sources: Wages, Auto Maintenance, etc.
    - Tracks: Estimated and Current values with progress bars.

Actions:
    - Update Budget: Edit budget categories and amounts.
    - Close Budget: Finalize budget to prevent modifications.
"""

page_header = """
Title: "Budget"
Month Selector: Dropdown for selecting the budget month.
Clone Another Budget: Duplicate an existing budget template.
"""

summary_section = """
Displays key financial metrics:
    - Estimated Expenses: Planned spending.
    - Estimated Balance: Remaining balance after expenses.
    - Initial Balance: Starting balance for the month.
    - Estimated Income: Total expected income.
    - Final Balance: Projected ending balance.
    - Status: Current state of the budget (e.g., Opened).
"""

debit_section = """
Tracks spending by categories:
    - Categories: Groceries, Loan Payments, etc.
    - Fields: Estimated (planned) and Current (actual) expenditures.
    - Progress bars: Visualize spending progress for each category.
"""

credit_section = """
Tracks income by sources:
    - Sources: Wages, Auto Maintenance, etc.
    - Fields: Estimated (planned) and Current (actual) income.
    - Progress bars: Visualize income progress for each source.
"""

actions = """
Available actions:
    - Update Budget: Modify entries for expenses and income categories.
    - Close Budget: Finalize and lock the budget, preventing further edits.
"""
