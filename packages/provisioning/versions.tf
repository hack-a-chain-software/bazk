# This code defines the required provider and backend configurations for a Terraform project.

# The "terraform" block specifies the required providers and the backend configuration.
terraform {
  # The "required_providers" block specifies that the project requires the hashicorp/aws provider.
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }

  # The "backend" block configures the backend to store the Terraform state. In this case, it is configured to use the azurerm backend.
  # docs: https://developer.hashicorp.com/terraform/language/settings/backends/azurerm
  backend "azurerm" {
    resource_group_name  = "bazk"
    storage_account_name = "bazkinfra"
    key                  = "bazk.terraform.tfstate"
    container_name       = "bazk-terraform-container"
  }
}
