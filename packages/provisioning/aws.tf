# The "azurerm" provider block establishes the connection with Azure. It specifies the region, access key, and secret key to authenticate and connect with AWS.
provider "azurerm" {
  features {}

  tenant_id       = "cb84bad5-bc00-4dbb-b576-4f91446cceb5"
  subscription_id = "12942c46-20bd-4894-a01b-d18cce7d8326"
}
