variable "pvt_key" {
  description = "Path for SSH"
  type        = string
  default     = "~/.ssh/id_rsa"
}

variable "pub_key" {
  description = "Path for Pub SSH"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}

variable "azure_tenant_id" {
  description = "Azure tenant id"
  type        = string
}

variable "azure_subscription_id" {
  description = "Azure subscription id"
  type        = string
}

variable "azure_region" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "machine_admin_username" {
  description = "Bazk machine admin username"
  type        = string
  default     = "adminuser"
}

variable "machine_admin_password" {
  description = "Bazk machine admin password"
  type        = string
}

variable "pinata_api_key" {
  description = "Bazk machine admin password"
  type        = string
}

variable "pinata_api_secret" {
  description = "Bazk machine admin password"
  type        = string
}

variable "phala_account_mnemonic" {
  description = "Bazk machine admin password"
  type        = string
}

variable "ias_spid" {
  description = "Bazk machine admin password"
  type        = string
}

variable "ias_api_key" {
  description = "Bazk machine admin password"
  type        = string
}


