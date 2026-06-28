terraform {
  required_version = ">= 1.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
    # null provider required for kubectl local-exec provisioners
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }
}

# Kubernetes Provider
provider "kubernetes" {
  config_path = var.kubernetes_config_path
}

# Helm Provider — must share the same cluster config as the kubernetes provider
provider "helm" {
  kubernetes {
    config_path = var.kubernetes_config_path
  }
}
