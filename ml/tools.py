from langchain_core.tools import tool
from typing import Literal
from langchain_core.runnables import RunnableConfig

@tool
def navigateDashboardPage(config: RunnableConfig):
    """Use this to navigate to the Dashboard page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Dashboard"
    return "Successfully navigated to the Dashboard page"

@tool
def navigateTransactionsPage(config: RunnableConfig):
    """Use this to navigate to the Transactions page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Transactions"
    return "Successfully navigated to the Transactions page"

@tool
def navigateBudgetsPage(config: RunnableConfig):
    """Use this to navigate to the Budgets page of a website"""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Budgets"
    return "Successfully navigated to the Budgets page"

@tool
def navigateAccountsPage(config: RunnableConfig):
    """Use this to navigate to the Accounts page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Accounts"
    return "Successfully navigated to the Accounts page"

@tool
def navigateInvestmentsPage(config: RunnableConfig):
    """Use this to navigate to the Investments page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Investments"
    return "Successfully navigated to the Investments page"

@tool
def navigateMetaPage(config: RunnableConfig):
    """Use this to navigate to the Meta page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Meta"
    return "Successfully navigated to the Meta page"

@tool
def navigateStatsPage(config: RunnableConfig):
    """Use this to navigate to the Stats page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Stats"
    return "Successfully navigated to the Stats page"

@tool
def navigateProfilePage(config: RunnableConfig):
    """Use this to navigate to the Profile page of a website."""
    config["configurable"]["data"].tool_used = True
    config["configurable"]["data"].page = "Profile"
    return "Successfully navigated to the Profile page"

tools = [navigateDashboardPage, navigateTransactionsPage, navigateBudgetsPage,
        navigateAccountsPage, navigateInvestmentsPage, navigateMetaPage, navigateStatsPage,
        navigateProfilePage]