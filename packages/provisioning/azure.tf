# The "azurerm" provider block establishes the connection with Azure. It specifies the region, access key, and secret key to authenticate and connect with AWS.
provider "azurerm" {
  features {}

  tenant_id       = "${vars.tenant_id}"
  subscription_id = "${vars.subscription_id}"
}
