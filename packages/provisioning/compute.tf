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
    computer_name  = "bazk"
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
    managed_disk_type = "Premium_LRS"
  }

  connection {
    type        = "ssh"
    user        = "${var.machine_admin_username}"
    password    = "${var.machine_admin_password}"
    host        = azurerm_public_ip.bazk.ip_address
  }

  provisioner "file" {
    source      = "../gramine/scripts/"
    destination = "."
  }

  # Provisioner block for remote-exec
  provisioner "remote-exec" {
    inline = [
        "echo 'y' | sudo ufw enable",
        "sudo ufw allow 3000/tcp",
        "sudo ufw allow 22/tcp",
        "sudo ufw status",
        "sudo apt-get update",
        "sudo apt-get install -y curl",
        "curl -fsSL https://get.docker.com -o get-docker.sh",
        "sudo sh get-docker.sh",
        "sudo groupadd docker",
        "sudo apt install -y unzip",
        "echo 'IAS_SPID=${var.ias_spid}' >> .env",
        "echo 'SGX_ENABLED=${var.sgx_enabled}' >> .env",
        "echo 'IAS_API_KEY=${var.ias_api_key}' >> .env",
        "echo 'PINATA_API_KEY=${var.pinata_api_key}' >> .env",
        "echo 'PINATA_API_SECRET=${var.pinata_api_secret}' >> .env",
        "echo 'ACCOUNT_MNEMONIC=${var.phala_account_mnemonic}' >> .env",
        "chmod +x start.sh",
        "chmod +x start-dev.sh",
        "sh start.sh",
    ]
  }
}
