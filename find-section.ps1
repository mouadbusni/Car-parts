$lines = Get-Content 'c:\Users\DELL\Downloads\Compressed\Car parts\Car parts\app\login\page.tsx'
$lineNum = 0
foreach($line in $lines) {
    if($line -match 'Account Type') {
        Write-Host "Found at line $($lineNum + 1)"
        Write-Host "Context:"
        for($i = [Math]::Max(0, $lineNum - 5); $i -lt [Math]::Min($lines.Count, $lineNum + 25); $i++) {
            Write-Host "$($i + 1): $($lines[$i])"
        }
        break
    }
    $lineNum++
}
