$ErrorActionPreference = "Stop"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

$logos = @(
    @{ Name = "renault.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/b/b7/Renault_2021_logo.svg" },
    @{ Name = "kia.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/4/47/Kia_logo_2021.svg" },
    @{ Name = "mg.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/1/1d/MG_logo.svg" },
    @{ Name = "jeep.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/5/52/Jeep_logo.svg" },
    @{ Name = "skoda.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/2/2e/%C5%A0koda_Auto_logo_%282022%29.svg" },
    @{ Name = "nissan.svg"; Url = "https://upload.wikimedia.org/wikipedia/commons/2/23/Nissan_2020_logo.svg" }
)

$destDir = "d:\Ram\spareblaze.com\images"

foreach ($logo in $logos) {
    $dest = Join-Path -Path $destDir -ChildPath $logo.Name
    Write-Host "Downloading $($logo.Name) from $($logo.Url)..."
    try {
        Invoke-WebRequest -Uri $logo.Url -OutFile $dest -UserAgent $UserAgent
        Write-Host "Success!"
    } catch {
        Write-Host "Failed to download $($logo.Name): $_"
    }
}
