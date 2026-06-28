variable "project_name" {
  description = "Project name"
  type        = string
  default     = "naar-noor"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "region" {
  description = "Cloud region"
  type        = string
  default     = "us-east-1"
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.27"
}

variable "frontend_replicas" {
  description = "Frontend pod replicas"
  type        = number
  default     = 3
  validation {
    condition     = var.frontend_replicas >= 1 && var.frontend_replicas <= 10
    error_message = "Frontend replicas must be between 1 and 10."
  }
}

variable "backend_replicas" {
  description = "Backend pod replicas"
  type        = number
  default     = 3
  validation {
    condition     = var.backend_replicas >= 1 && var.backend_replicas <= 15
    error_message = "Backend replicas must be between 1 and 15."
  }
}

variable "frontend_cpu_request" {
  description = "Frontend CPU request"
  type        = string
  default     = "100m"
}

variable "frontend_memory_request" {
  description = "Frontend memory request"
  type        = string
  default     = "128Mi"
}

variable "backend_cpu_request" {
  description = "Backend CPU request"
  type        = string
  default     = "200m"
}

variable "backend_memory_request" {
  description = "Backend memory request"
  type        = string
  default     = "256Mi"
}

variable "database_storage_size" {
  description = "Database storage size"
  type        = string
  default     = "10Gi"
}

variable "database_password" {
  description = "Database SA password"
  type        = string
  sensitive   = true
}

variable "enable_monitoring" {
  description = "Enable Prometheus monitoring"
  type        = bool
  default     = true
}

variable "enable_logging" {
  description = "Enable ELK logging"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Domain name for Ingress"
  type        = string
  default     = "naar-noor.example.com"
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default = {
    Application = "Naar-Noor"
    ManagedBy   = "Terraform"
  }
}

variable "kubernetes_config_path" {
  description = "Path to Kubernetes config file"
  type        = string
  default     = "~/.kube/config"
}
