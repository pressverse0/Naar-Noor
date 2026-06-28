# Namespace
resource "kubernetes_namespace" "naar_noor" {
  metadata {
    name = "naar-noor"
    labels = {
      app           = var.project_name
      environment   = var.environment
      managed-by    = "terraform"
    }
  }
}

# Secrets
resource "kubernetes_secret" "database" {
  metadata {
    name      = "naar-noor-db-secret"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }

  data = {
    # Supabase PostgreSQL connection string — inject real values via TF_VAR_database_password
    # and TF_VAR_supabase_host CI environment variables
    "connection-string" = "Host=${var.supabase_host};Port=5432;Database=postgres;User Id=postgres;Password=${var.database_password};Ssl Mode=Require;"
  }

  type = "Opaque"

  depends_on = [kubernetes_namespace.naar_noor]
}

# Service Accounts
resource "kubernetes_service_account" "frontend" {
  metadata {
    name      = "naar-noor-frontend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
    labels = {
      app       = var.project_name
      component = "frontend"
    }
  }
}

resource "kubernetes_service_account" "backend" {
  metadata {
    name      = "naar-noor-backend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
    labels = {
      app       = var.project_name
      component = "backend"
    }
  }
}

resource "kubernetes_service_account" "database" {
  metadata {
    name      = "naar-noor-database"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
    labels = {
      app       = var.project_name
      component = "database"
    }
  }
}

# Roles & RoleBindings for RBAC
resource "kubernetes_role" "frontend" {
  metadata {
    name      = "naar-noor-frontend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }

  rule {
    api_groups = [""]
    resources  = ["configmaps"]
    verbs      = ["get", "list", "watch"]
  }
}

resource "kubernetes_role_binding" "frontend" {
  metadata {
    name      = "naar-noor-frontend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.frontend.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.frontend.metadata[0].name
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }
}

resource "kubernetes_role" "backend" {
  metadata {
    name      = "naar-noor-backend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }

  rule {
    api_groups = [""]
    resources  = ["configmaps", "secrets"]
    verbs      = ["get", "list", "watch"]
  }
}

resource "kubernetes_role_binding" "backend" {
  metadata {
    name      = "naar-noor-backend"
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.backend.metadata[0].name
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.backend.metadata[0].name
    namespace = kubernetes_namespace.naar_noor.metadata[0].name
  }
}

# Import K8s manifests
resource "kubernetes_manifest" "frontend_deployment" {
  manifest = yamldecode(file("${path.module}/../k8s/frontend-deployment.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [
    kubernetes_namespace.naar_noor,
    kubernetes_service_account.frontend,
  ]
}

resource "kubernetes_manifest" "backend_deployment" {
  manifest = yamldecode(file("${path.module}/../k8s/backend-deployment.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [
    kubernetes_namespace.naar_noor,
    kubernetes_service_account.backend,
    kubernetes_secret.database,
  ]
}

resource "kubernetes_manifest" "database_statefulset" {
  manifest = yamldecode(file("${path.module}/../k8s/database-statefulset.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [
    kubernetes_namespace.naar_noor,
    kubernetes_service_account.database,
    kubernetes_secret.database,
  ]
}

resource "kubernetes_manifest" "ingress" {
  manifest = yamldecode(file("${path.module}/../k8s/ingress.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [kubernetes_namespace.naar_noor]
}

# -----------------------------------------------------------------
# Services (multi-document YAML — cannot use yamldecode + kubernetes_manifest)
# kubectl apply is the only reliable way to handle multi-doc YAML files.
# services.yaml contains 6 documents; hpa.yaml contains 2 documents.
# yamldecode() silently drops all but the first document.
# -----------------------------------------------------------------
resource "null_resource" "apply_services" {
  triggers = {
    manifest_hash = filemd5("${path.module}/../k8s/services.yaml")
  }

  provisioner "local-exec" {
    command = "kubectl apply -f ${path.module}/../k8s/services.yaml --kubeconfig ${var.kubernetes_config_path}"
  }

  depends_on = [kubernetes_namespace.naar_noor]
}

resource "null_resource" "apply_hpa" {
  triggers = {
    manifest_hash = filemd5("${path.module}/../k8s/hpa.yaml")
  }

  provisioner "local-exec" {
    # HPAs depend on deployments existing first
    command = "kubectl apply -f ${path.module}/../k8s/hpa.yaml --kubeconfig ${var.kubernetes_config_path}"
  }

  depends_on = [
    kubernetes_manifest.frontend_deployment,
    kubernetes_manifest.backend_deployment,
  ]
}
