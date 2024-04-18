
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

{{/*
Create deployment name as used by the service name label.
*/}}
{{- define "deployment.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "deployment" | indent 1 }}
{{- end }}

{{/*
Create configmap name as used by the service name label.
*/}}
{{- define "configmap.fullname" -}}
{{- printf "%s-%s-%s" .Release.Name .Chart.Name "configmap" | indent 1 }}
{{- end }}