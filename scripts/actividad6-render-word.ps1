param([Parameter(Mandatory=$true)][string]$InputDocument, [Parameter(Mandatory=$true)][string]$OutputPdf)
$wordAudit = New-Object -ComObject Word.Application
if ($wordAudit.Documents.Count -ne 0) { throw 'No se utilizará una instancia con documentos ajenos abiertos.' }
$wordAudit.Visible = $false
$wordAudit.DisplayAlerts = 0
$wordAudit.AutomationSecurity = 3
$documentAudit = $null
try {
  $documentAudit = $wordAudit.Documents.Open($InputDocument, $false, $true)
  $documentAudit.ExportAsFixedFormat($OutputPdf, 17)
} finally {
  if ($null -ne $documentAudit) { $documentAudit.Close(0) }
  $wordAudit.Quit()
}
