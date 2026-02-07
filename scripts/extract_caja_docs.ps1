$baseDir = "C:\PROYECTOS\les\docs\z_docs_consultoria\docs_les_modulo_caja"
$outputDir = "C:\PROYECTOS\les\docs\extracted_text_caja"
$docs = Get-ChildItem (Join-Path $baseDir "*.docx")

if (-not (Test-Path $outputDir)) { 
    New-Item -ItemType Directory $outputDir
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false

foreach ($doc in $docs) {
    $txtName = $doc.Name -replace '\.docx$', '.txt'
    $txtPath = Join-Path $outputDir $txtName
    Write-Host "Extracting $($doc.Name)..."
    try {
        $document = $word.Documents.Open($doc.FullName, $false, $true)
        $content = $document.Content.Text
        $content | Out-File -FilePath $txtPath -Encoding utf8
        $document.Close()
        Write-Host "Saved to $txtName"
    } catch {
        Write-Host "Error reading $($doc.Name): $($_.Exception.Message)"
        "Error reading $($doc.Name): $($_.Exception.Message)" | Out-File -FilePath $txtPath -Encoding utf8
    }
}
$word.Quit()
