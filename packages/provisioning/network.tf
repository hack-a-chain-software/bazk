# The "azurerm_virtual_network" block defines a virtual network with a specified address space and subnet.
# It is associated with a specific resource group and deployed in a particular location.
resource "azurerm_virtual_network" "bazk" {
  name                = "bazk-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.bazk.location
  resource_group_name = azurerm_resource_group.bazk.name
}

# The "azurerm_subnet" block defines a subnet within the previously created virtual network.
# It specifies the address prefix for the subnet and links it to the virtual network and resource group.
resource "azurerm_subnet" "bazk" {
  name                 = "bazk-subnet"
  resource_group_name  = azurerm_resource_group.bazk.name
  virtual_network_name = azurerm_virtual_network.bazk.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_public_ip" "bazk" {
  allocation_method   = "Static"
  name                = "bazk-publicip"
  location            = "${var.azure_region}"
  resource_group_name = azurerm_resource_group.bazk.name
}

# The "azurerm_network_interface" block defines a network interface with specified settings.
# It is associated with a specific resource group and deployed in a particular location.
resource "azurerm_network_interface" "bazk" {
  name                = "bazk-nic"
  location            = azurerm_resource_group.bazk.location
  resource_group_name = azurerm_resource_group.bazk.name

  ip_configuration {
    private_ip_address_allocation = "Dynamic"
    name                          = "internal"
    subnet_id                     = azurerm_subnet.bazk.id
    public_ip_address_id          = azurerm_public_ip.bazk.id
  }
}

output "instance_ip_addr" {
  value = azurerm_public_ip.bazk.ip_address
}
