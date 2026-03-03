$bundle = Get-Content js\bundle.js -Raw
$html = Get-Content index.html -Raw
$html = [regex]::Replace($html, '(?s)(<script>).*?(</script>)', "$1`n$bundle`n$2")
Set-Content index.html -Value $html -Encoding utf8
