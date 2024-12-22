from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

@tool
def addBudget(config: RunnableConfig):
    """Navigates to the 'Add Budget' page. This tool triggers the navigation action to open the page where the user can add a new budget. It is used when a user wants to start creating a new budget."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].action = "handleAddBudgetClick"
    return "Successfully navigated to the Add Budget page."

@tool
def searchBudgets(config: RunnableConfig, search_query: str):
    """Searches for budgets based on a search query. This tool triggers the search functionality for the budget list based on a user-defined search query. It helps filter budgets by their name, month, year, or other related attributes."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].action = f"debouncedSearchQuery: {search_query}"
    return f"Successfully triggered search for budgets with query: {search_query}"

@tool
def toggleShowOnlyOpen(config: RunnableConfig, show_only_open: bool):
    """Toggles the filter to show only open budgets. This tool updates the filter state to display only the budgets that are open, allowing users to focus on those budgets."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].action = f"setShowOnlyOpen: {show_only_open}"
    return f"Successfully set the filter to show only open budgets: {show_only_open}"

@tool
def removeBudget(config: RunnableConfig, budget_id: str):
    """Triggers the removal of a specific budget. This tool shows a confirmation dialog and removes the budget identified by its `budget_id` after confirmation."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].action = f"handleRemoveBudgetClick: {budget_id}"
    return f"Successfully triggered the removal action for budget ID: {budget_id}"

@tool
def viewBudgetDetails(config: RunnableConfig, budget_id: str):
    """Navigates to the 'Budget Details' page. This tool triggers the navigation action to open the page where the user can view and manage the details of a specific budget identified by its `budget_id`."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].action = f"goToBudgetDetails: {budget_id}"
    return f"Successfully navigated to the Budget Details page for budget ID: {budget_id}"

@tool
def paginateBudgets(config: RunnableConfig, page: int, page_size: int):
    """Sets the pagination model for the budgets table. This tool adjusts the pagination settings, such as the current page and the page size, for better data management and user experience."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].pagination = {"page": page, "page_size": page_size}
    return f"Successfully set pagination model to page: {page}, page size: {page_size}"

budget_tools = [
    addBudget, searchBudgets, toggleShowOnlyOpen, removeBudget, 
    viewBudgetDetails, paginateBudgets
]