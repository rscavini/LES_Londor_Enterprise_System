$docs = Get-ChildItem 'c:\PROYECTOS\les\les_modulo_inventario\z_docs_consultoria\*.docx'
if (-not (Test-Path 'c:\PROYECTOS\les\les_modulo_inventario\extracted_text')) { 
    New-Item -ItemType Directory 'c:\PROYECTOS\les\les_modulo_inventario\extracted_text' 
}
$word = New-Object -ComObject Word.Application
$word.Visible = $false
foreach ($doc in $docs) {
    $txtName = $doc.Name -replace '\.docx$', '.txt'
    $txtPath = Join-Path 'c:\PROYECTOS\les\les_modulo_inventario\extracted_text' $txtName
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
