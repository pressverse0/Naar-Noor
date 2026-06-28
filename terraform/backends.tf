# S3 Backend for Terraform State
# Configure this AFTER creating S3 bucket and DynamoDB table

# Uncomment and configure when ready to use S3 backend:
/*
terraform {
  backend "s3" {
    bucket         = "naar-noor-terraform-state"
    key            = "kubernetes/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
*/

# For local development, use default local backend (terraform.tfstate in current directory)
# This is the default behavior when no backend configuration is provided
