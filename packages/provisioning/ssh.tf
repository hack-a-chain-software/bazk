# This block defines a ssh public key.
resource "azurerm_ssh_public_key" "bazk" {
  name                = "bazk-ssh"
  resource_group_name = azurerm_resource_group.bazk.name
  location            = "${var.azure_region}"
  public_key          = file(var.pub_key)
}
