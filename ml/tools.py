from langchain_core.tools import tool
from typing import Literal
from langchain_core.runnables import RunnableConfig

@tool
def navigateDashboardPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Dashboard page of the website."""
    config["configurable"]["data"].tool_used = True      
    config["configurable"]["data"].page = "Dashboard"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Dashboard page"

@tool
def navigateTransactionsPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Transactions page of the website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Transactions"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Transactions page"

@tool
def navigateBudgetsPage(config: RunnableConfig):
    """Use this when the user wants to navigate to the Budgets page of the website"""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Budgets"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Budgets page"

@tool
def navigateAccountsPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Accounts page of the website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Accounts"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Accounts page"

@tool
def navigateInvestmentsPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Investments page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Investments"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Investments page"

@tool
def navigateMetaPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Meta page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Meta"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Meta page"

@tool
def navigateStatsPage(config: RunnableConfig):
    """Use when the user wants to navigate to the Stats page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Stats"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Stats page"

@tool
def navigateProfilePage(config: RunnableConfig):
    """Use when the user wants to navigate to the Profile page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Profile"
    config["configurable"]["data"].action = ""
    return "Successfully navigated to the Profile page"

@tool
def addBudget(config: RunnableConfig):
    """Navigates to the 'Add Budget' page. This tool triggers the navigation action to open the page where the user can add a new budget. It is used when a user wants to start creating a new budget."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = "handleAddBudgetClick"
    return "Successfully navigated to the Add Budget page."

@tool
def searchBudgets(config: RunnableConfig, search_query: str):
    """Searches for budgets based on a search query. This tool triggers the search functionality for the budget list based on a user-defined search query. It helps filter budgets by their name, month, year, or other related attributes."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"debouncedSearchQuery: {search_query}"
    return f"Successfully triggered search for budgets with query: {search_query}"

@tool
def toggleShowOnlyOpen(config: RunnableConfig, show_only_open: bool):
    """Toggles the filter to show only open budgets. This tool updates the filter state to display only the budgets that are open, allowing users to focus on those budgets."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"setShowOnlyOpen: {show_only_open}" # !
    return f"Successfully set the filter to show only open budgets: {show_only_open}"

@tool
def removeBudget(config: RunnableConfig, budget_id: str):
    """Triggers the removal of a specific budget. This tool shows a confirmation dialog and removes the budget identified by its `budget_id` after confirmation."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleRemoveBudgetClick: {budget_id}"
    return f"Successfully triggered the removal action for budget ID: {budget_id}"

@tool
def viewBudgetDetails(config: RunnableConfig, budget_id: str):
    """Navigates to the 'Budget Details' page. This tool triggers the navigation action to open the page where the user can view and manage the details of a specific budget identified by its `budget_id`."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"goToBudgetDetails: {budget_id}"
    return f"Successfully navigated to the Budget Details page for budget ID: {budget_id}"

@tool
def paginateBudgets(config: RunnableConfig, page: int, page_size: int):
    """Sets the pagination model for the budgets table. This tool adjusts the pagination settings, such as the current page and the page size, for better data management and user experience."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].pagination = {"page": page, "page_size": page_size}
    return f"Successfully set pagination model to page: {page}, page size: {page_size}"


@tool
def addTransaction(config: RunnableConfig):
    """Use this when you want to help the user add a transaction. Opens the form to add a new transaction. This tool triggers the action to display the interface 
    where the user can input details for a new transaction, including the transaction type, amount, 
    description, and related accounts."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = "handleAddTransactionClick"
    return "Successfully opened the form to add a new transaction."

@tool
def importTransactions(config: RunnableConfig):
    """Navigates to the Import Transactions page. This tool triggers the action to redirect the user 
    to the import page, allowing them to upload transaction data from an external file (such as CSV or Excel)."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = "handleImportTransactionsClick"
    return "Successfully navigated to the Import Transactions page."

@tool
def editTransaction(config: RunnableConfig, transaction_id: str):
    """Opens the edit form for an existing transaction. This tool triggers the action to open the 
    edit dialog for a transaction identified by its unique `transaction_id`, allowing the user to modify 
    its details such as amount, description, and associated accounts."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleEditTransactionClick: {transaction_id}"
    return f"Successfully opened the edit form for transaction ID: {transaction_id}"

@tool
def removeTransaction(config: RunnableConfig, transaction_id: str):
    """Removes a transaction after confirmation. This tool triggers the action to show a confirmation 
    dialog asking the user to confirm the deletion of a transaction identified by its `transaction_id`. 
    Upon confirmation, the transaction is permanently deleted."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleRemoveTransactionClick: {transaction_id}"
    return f"Successfully triggered the removal action for transaction ID: {transaction_id}"

@tool
def searchTransactions(config: RunnableConfig, search_query: str):
    """Searches transactions by keywords. This tool triggers a debounced search action to filter the 
    transactions list based on a search query. It allows users to dynamically filter transactions 
    by their descriptions, accounts, or other related fields."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"debouncedSearchQuery: {search_query}"
    return f"Successfully searched for transactions with query: {search_query}"

@tool
def viewTransactionDetails(config: RunnableConfig, transaction_id: str):
    """Views the detailed breakdown of a specific transaction. This tool opens the details page or dialog 
    for a transaction identified by its `transaction_id`, allowing the user to view all information related 
    to the transaction, such as amount, date, category, and tags."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleEditTransactionClick: {transaction_id}"
    return f"Successfully accessed the detailed breakdown for transaction ID: {transaction_id}"

@tool
def editAccount(config: RunnableConfig, account_id: str):
    """Triggers the edit process for a specific account. This tool opens the edit dialog and prepares the account identified by its `account_id` for modification."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleEditButtonClick: {account_id}"
    return f"Successfully triggered the edit action for account ID: {account_id}"

# @tool
# def addBudget(config: RunnableConfig):
#     """Navigates to the 'Add Budget' page. This tool triggers the navigation action to open the page where the user can add a new budget. It is used when a user wants to start creating a new budget."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = "handleAddBudgetClick"
#     return "Successfully navigated to the Add Budget page."

@tool
def searchAccounts(config: RunnableConfig, query: str, delay: int = 300):
    """Triggers a debounced search action with a specified delay. This tool sets a search query and waits for the delay before executing."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "" 
    config["configurable"]["data"].action = f"debouncedSearchQuery: {query}, delay: {delay}"
    return f"Successfully triggered a debounced search for query: '{query}' with a delay of {delay}ms."

@tool
def addAccount(config: RunnableConfig):
    """Use this tool when the user wants help adding a new account. This tool sends a request to add the account"""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = "setAddEditDialogOpen"
    return f"Successfully triggered the addition of action."

@tool
def removeAccount(config: RunnableConfig, account_id: str):
    """Triggers the removal of a specific account. This tool sends a request to remove the account identified by its `account_id` and closes the dialog."""
    if not account_id:
        return "No actionable account provided."
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"removeAccount: {account_id}"
    return f"Successfully triggered the removal action for account ID: {account_id}"


@tool
def changeTab(config: RunnableConfig, new_tab_index: int):
    """Handles the tab change action by updating the selected tab index."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"changeTab: {new_tab_index}"
    return f"Tab changed successfully to index: {new_tab_index}"


@tool
def handleSearchInputChange(config: RunnableConfig, search_query: str):
    """Handles a search input change by triggering a debounced search with the provided query string."""
    if not search_query:
        return "Search query is empty. No action taken."
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = ""
    config["configurable"]["data"].action = f"handleSearchInputChange: {search_query}"
    return f"Successfully triggered a debounced search with query: '{search_query}'"

# @tool
# def toggleShowOnlyOpen(config: RunnableConfig, show_only_open: bool):
#     """Toggles the filter to show only open budgets. This tool updates the filter state to display only the budgets that are open, allowing users to focus on those budgets."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = f"setShowOnlyOpen: {show_only_open}"
#     return f"Successfully set the filter to show only open budgets: {show_only_open}"

# @tool
# def removeBudget(config: RunnableConfig, budget_id: str):
#     """Triggers the removal of a specific budget. This tool shows a confirmation dialog and removes the budget identified by its `budget_id` after confirmation."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = f"handleRemoveBudgetClick: {budget_id}"
#     return f"Successfully triggered the removal action for budget ID: {budget_id}"

# @tool
# def viewBudgetDetails(config: RunnableConfig, budget_id: str):
#     """Navigates to the 'Budget Details' page. This tool triggers the navigation action to open the page where the user can view and manage the details of a specific budget identified by its `budget_id`."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = f"goToBudgetDetails: {budget_id}"
#     return f"Successfully navigated to the Budget Details page for budget ID: {budget_id}"

# @tool
# def paginateBudgets(config: RunnableConfig, page: int, page_size: int):
#     """Sets the pagination model for the budgets table. This tool adjusts the pagination settings, such as the current page and the page size, for better data management and user experience."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].pagination = {"page": page, "page_size": page_size}
#     return f"Successfully set pagination model to page: {page}, page size: {page_size}"

# @tool
# def toggleEssentialTransaction(config: RunnableConfig, transaction_id: str):
#     """Marks a transaction as essential. This tool triggers the action to toggle the 'essential' status 
#     of a transaction identified by its `transaction_id`. This can be used to prioritize or highlight important transactions."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = f"toggleEssentialTransaction: {transaction_id}"
#     return f"Successfully toggled the essential status for transaction ID: {transaction_id}"

# @tool
# def filterTransactionsByTags(config: RunnableConfig, tag: str):
#     """Filters transactions based on tags. This tool triggers the action to filter the transactions 
#     list by a specific tag, allowing users to view only transactions that have the selected tag(s). 
#     This is useful for organizing and analyzing transactions by categories such as 'business', 'personal', etc."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].action = f"filterTransactionsByTags: {tag}"
#     return f"Successfully filtered transactions by tag: {tag}"

# @tool
# def paginateTransactions(config: RunnableConfig, page: int, page_size: int):
#     """Sets pagination model for the transactions table. This tool triggers the action to adjust the 
#     pagination settings, such as the current page and page size, for the transactions table. It ensures that 
#     the transactions list is displayed in manageable chunks for better user experience."""
#     config["configurable"]["data"].tool_used = True
#     config["configurable"]["data"].pagination = {"page": page, "page_size": page_size}
#     return f"Successfully set pagination model to page: {page}, page size: {page_size}"

tools = [navigateDashboardPage, navigateTransactionsPage, navigateBudgetsPage,
        navigateAccountsPage, navigateInvestmentsPage, navigateMetaPage, navigateStatsPage,
        navigateProfilePage, addBudget, searchBudgets, toggleShowOnlyOpen, removeBudget, 
    viewBudgetDetails, paginateBudgets, addTransaction, importTransactions, editTransaction, removeTransaction, 
    searchTransactions, viewTransactionDetails,editAccount,searchAccounts, addAccount, removeAccount, changeTab, handleSearchInputChange]