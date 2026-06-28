locals {
  common_labels = {
    Application = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    CreatedAt   = timestamp()
  }

  namespace = "naar-noor"

  services = {
    frontend = {
      name      = "naar-noor-frontend"
      component = "frontend"
      port      = 80
    }
    backend = {
      name      = "naar-noor-backend"
      component = "backend"
      port      = 8080
    }
    database = {
      name      = "naar-noor-database"
      component = "database"
      port      = 1433
    }
  }
}
