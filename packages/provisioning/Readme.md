# Provisioning

This repository contains Terraform code for deploying the bazk infrastructure on Azure.

The code provisions resources such as Virtual Machines and a Virtual network. The infrastructure is designed to support the deployment of a Bazk App.

## Prerequisites

Before running this Terraform code, make sure you have the following prerequisites set up:

- Terraform: Install Terraform on your local machine. You can download it from the official website: [Terraform Downloads](https://developer.hashicorp.com/terraform/downloads).

- Azure CLI: Create an account on [Azure](https://portal.azure.com//). You will need an Account for authentication and more data

- Azure Storage: Create a new storage [new storage](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Storage%2FStorageAccounts). Set up your storage with the following specifications: Resource Group = bazk, Storage Account Name = bazkinfra, and create a new container named bazk-terraform-container

- Intel IAS API key and SPID. (You can get it from [here](https://api.portal.trustedservices.intel.com/EPID-attestation))

## Usage

Follow the steps below to use this Terraform code:

- Clone the repository: Clone this repository to your local machine.

- Set up Terraform variables: Create a file named .tfvars in the root directory as the Terraform code. Add the following content to the file and replace the placeholder values with your own:
```bash
# Required variables
IAS_SPID="YOUR_INTEL_IAS_SPID"
IAS_API_KEY="YOUR_INTEL_IAS_API_KEY"
PINATA_API_KEY="YOUR_PINATA_API_KEY"
PINATA_API_SECRET="YOUR_PINATA_SECRET"
azure_tenant_id="YOUR_AZURE_TENANT_ID"
ACCOUNT_MNEMONIC="VALIDATOR_CONTRACT_ACCOUNT"
azure_subscription_id="AZURE_SUBSCRIPTION_ID"

# Variables with defaults
SGX_ENABLED=true
azure_region="East US"
machine_admin_username="ubuntu"
pvt_key="~/.ssh/id_rsa" # Path to your private SSH key
pub_key="~/.ssh/id_rsa.pub" # Path to your public SSH key
```
** You can configure your SSH heres: [macOS](https://mdl.library.utoronto.ca/technology/tutorials/generating-ssh-key-pairs-mac) [linux](https://docs.oracle.com/en/cloud/cloud-at-customer/occ-get-started/generate-ssh-key-pair.html#GUID-8B9E7FCB-CEA3-4FB3-BF1A-FD3406A2432F)

- Initialize Terraform: Open a terminal or command prompt, navigate to the cloned repository directory, and run the following command to initialize Terraform:

```bash
pnpm provisioner start
```

- Review the execution plan: Run the following command to see the execution plan and ensure that everything looks correct:

```bash
pnpm provisioner plan
```
Verify that the planned changes match your expectations.

- Apply the Terraform configuration: Once you're ready to provision the infrastructure, run the following command:

```bash
pnpm provisioner apply
```

- Wait for the deployment: Terraform will start provisioning the resources on Azure. Wait for the process to complete.

- Access the deployed infrastructure: After the deployment is successful, you can access the deployed resources, such as the Virtual Machines, using SSH/user+password. Make sure to use the appropriate SSH key and the IP addresses of the created Virtual Machines.

- Cleanup and destroy: To clean up and destroy the created infrastructure, run the following command:

```bash
pnpm provisioner destroy
```

## How to access BAZK App
After the deployment is successful, the provisioning will download the latest version of BAZK and start the server automatically, you can interact with the API using any [command available](../../README.md):

```bash
curl -X POST http://${YOUR_MACHINE_PUBLIC_IP}:3000/execute -H "Content-Type: application/json" -d '["/app/bin/new_constrained", "challenge", 10, 256, "my ceremony name", "my ceremony description", 1709221725]'
```

If necessary, enter the machine password.

After connecting, you can start the bazk with:

```bash
sh start.sh
```

Or whenever you need update your version, you just need to execute this command:

```bash
sh update.sh
```

## Additional Information

- The Terraform code uses the Azure provider, which is defined in the *required_providers* block in the *terraform* configuration section.

- The SSH key paths, Azure Tenant Id and Subscription Id are defined as variables in the *variable* blocks. You can customize these values in the *variables.tf* file or by using command-line flags when executing Terraform commands.

- The code provisions a Azure SSH key named *bazk-ssh* using the public key located at the path specified in the *pub_key* variable. Make sure the file exists and contains the correct public key.

- The Virtual Machine is provisioned using the vm size Standard_DC2s_v2 with Linux kernel v5.13 and SGX enabled. Adjust the image, region, size, and other configurations in the *resource "azurerm_virtual_machine" "bazk"* blocks to fit your requirements.

