output "namespace" {
  description = "Kubernetes namespace"
  value       = kubernetes_namespace.naar_noor.metadata[0].name
}

output "frontend_deployment" {
  description = "Frontend deployment name"
  value       = kubernetes_manifest.frontend_deployment.manifest.metadata.name
}

output "backend_deployment" {
  description = "Backend deployment name"
  value       = kubernetes_manifest.backend_deployment.manifest.metadata.name
}

output "database_statefulset" {
  description = "Database StatefulSet name"
  value       = kubernetes_manifest.database_statefulset.manifest.metadata.name
}

output "frontend_service" {
  description = "Frontend service endpoint"
  value       = "naar-noor-frontend.naar-noor.svc.cluster.local:80"
}

output "backend_service" {
  description = "Backend service endpoint"
  value       = "naar-noor-backend.naar-noor.svc.cluster.local:8080"
}

output "database_service" {
  description = "Database service endpoint"
  value       = "naar-noor-database.naar-noor.svc.cluster.local:1433"
}

output "ingress_host" {
  description = "Ingress hostname"
  value       = var.domain_name
}

output "kubectl_commands" {
  description = "Useful kubectl commands"
  value = {
    view_pods      = "kubectl get pods -n naar-noor"
    view_services  = "kubectl get services -n naar-noor"
    view_logs      = "kubectl logs -n naar-noor -f deployment/naar-noor-frontend"
    port_forward   = "kubectl port-forward -n naar-noor svc/naar-noor-backend 8080:8080"
  }
}
