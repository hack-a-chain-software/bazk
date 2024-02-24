resource "azurerm_resource_group" "bazk" {
  name     = "bazk-resources"
  location = "${var.azure_region}"
}
