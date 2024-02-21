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
pinata_api_key = "YOUR_PINATA_API_KEY"
azure_tenant_id = "YOUR_AZURE_TENANT_ID"
ias_spid = "YOUR_IAS_API_KEY_GOT_FROM_INTEL"
pinata_api_secret = "YOUR_PINATA_API_SECRET"
ias_api_key = "YOUR_IAS_API_KEY_GOT_FROM_INTEL"
azure_subscription_id = "YOUR_AZURE_SUBSCRIPTION_ID"
machine_admin_password="YOUR_MACHINE_ADMIN_PASSWORD!"
phala_account_mnemonic = "YOUR_ACCOUNT_MNEMONIC_WITH_ENOUGH_BALANCE"
```

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
After the deployment is successful, you can acess your virtual machine with ssh:

```bash
ssh {YOUR_MACHINE_USARNAME_DEFAULT_=_adminuser}@{YOUR_MACHINE_IP}
```

If necessary, enter the machine password.

After connecting, you can enter the already initialized Bazk App container by executing this command:

```bash
docker exec -it sad_goldstine /bin/bash
cd /dist
```

Or whenever you need to initialize a new one, you just need to execute this command:

```bash
cd bazk-build/
sudo docker run --env-file .env --rm --device /dev/sgx_enclave --device /dev/sgx_provision -v $(pwd)/dist:/dist -it gramineproject/gramine
cd /dist
```

Within the app you can execute [basic bazk commands](../../README.md)

## Additional Information

- The Terraform code uses the Azure provider, which is defined in the *required_providers* block in the *terraform* configuration section.

- The SSH key paths, Azure Tenant Id and Subscription Id are defined as variables in the *variable* blocks. You can customize these values in the *variables.tf* file or by using command-line flags when executing Terraform commands.

- The code provisions a Azure SSH key named *bazk-ssh* using the public key located at the path specified in the *pub_key* variable. Make sure the file exists and contains the correct public key.

- The Virtual Machine is provisioned using the vm size Standard_DC2s_v2 with Linux kernel v5.13 and SGX enabled. Adjust the image, region, size, and other configurations in the *resource "azurerm_virtual_machine" "bazk"* blocks to fit your requirements.

