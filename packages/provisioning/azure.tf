# The "azurerm" provider block establishes the connection with Azure. It specifies the region, access key, and secret key to authenticate and connect with AWS.
provider "azurerm" {
  features {}

  tenant_id       = "${var.azure_tenant_id}"
  subscription_id = "${var.azure_subscription_id}"
}
