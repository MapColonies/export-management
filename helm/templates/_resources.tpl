
{{/*
Create export-management nginx configmap name as used by the service name label.
*/}}
{{- define "nginx-configmap.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "nginx-configmap" | indent 1 }}
{{- end }}

{{/*
Create export-management envoy configmap name as used by the service name label.
*/}}
{{- define "envoy-configmap.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "envoy-configmap" | indent 1 }}
{{- end }}