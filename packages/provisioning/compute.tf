resource "azurerm_ssh_public_key" "bazk" {
  name                = "bazk-ssh"
  resource_group_name = azurerm_resource_group.bazk.name
  location            = "${var.azure_region}"
  public_key          = file(var.pub_key)
}

# This block defines a virtual machine in Azure.
resource "azurerm_virtual_machine" "bazk" {
  name                  = "bazk"
  vm_size               = "Standard_DC2s_v2"
  resource_group_name   = azurerm_resource_group.bazk.name
  location              = azurerm_resource_group.bazk.location
  network_interface_ids = [azurerm_network_interface.bazk.id]

  # Specifies the image to be used for the virtual machine's OS.
  storage_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  # Defines the operating system profile for the virtual machine.
  os_profile {
    computer_name  = "hostname"
    admin_username = "${var.machine_admin_username}"
    admin_password = "${var.machine_admin_password}"
  }

  # Configures specific Linux settings for the virtual machine's OS profile.
  os_profile_linux_config {
    disable_password_authentication = false
  }

  # Configures the OS disk for the virtual machine.
  storage_os_disk {
    name              = "osdisk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  connection {
    type        = "ssh"
    user        = "${var.machine_admin_username}"
    password    = "${var.machine_admin_password}"
    host        = azurerm_public_ip.bazk.ip_address
  }

  # Provisioner block for send file
  provisioner "file" {
    source = "../indexer/chainweb-node"
    destination = "."
  }


  # Provisioner block for remote-exec
  provisioner "remote-exec" {
    inline = [
      "echo 'Remote execution successful!' >> ~/test.txt"
    ]
  }
}
