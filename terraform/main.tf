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
    "sa-password"        = var.database_password
    "connection-string"  = "Server=naar-noor-database;Database=db54355;User Id=sa;Password=${var.database_password};Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True;"
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

resource "kubernetes_manifest" "services" {
  manifest = yamldecode(file("${path.module}/../k8s/services.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [kubernetes_namespace.naar_noor]
}

resource "kubernetes_manifest" "ingress" {
  manifest = yamldecode(file("${path.module}/../k8s/ingress.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [kubernetes_namespace.naar_noor]
}

resource "kubernetes_manifest" "hpa" {
  manifest = yamldecode(file("${path.module}/../k8s/hpa.yaml"))
  
  computed_fields = [
    "metadata.resourceVersion",
    "metadata.uid",
  ]

  depends_on = [kubernetes_namespace.naar_noor]
}
