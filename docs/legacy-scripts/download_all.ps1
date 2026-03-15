$ErrorActionPreference = "Stop"
$UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

$logos = @(
    @{ Name = "nissan.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_2020_logo.svg/512px-Nissan_2020_logo.svg.png" },
    @{ Name = "renault.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Renault_2021_logo.svg/512px-Renault_2021_logo.svg.png" },
    @{ Name = "kia.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_logo_2021.svg/512px-Kia_logo_2021.svg.png" },
    @{ Name = "mg.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/MG_logo.svg/512px-MG_logo.svg.png" },
    @{ Name = "maruti-suzuki.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Maruti_Suzuki_logo.svg/512px-Maruti_Suzuki_logo.svg.png" },
    @{ Name = "skoda.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/%C5%A0koda_Auto_logo_%282022%29.svg/512px-%C5%A0koda_Auto_logo_%282022%29.svg.png" },
    @{ Name = "jeep.png"; Url = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Jeep_logo.svg/512px-Jeep_logo.svg.png" }
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
