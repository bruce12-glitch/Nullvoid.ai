$urls = @(
    "http://localhost:3000/",
    "http://localhost:3000/sign-in",
    "http://localhost:3000/sign-up",
    "http://localhost:3000/api/health",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/editor"
)

foreach ($url in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
        Write-Output ("OK $url -> " + $res.StatusCode + " (" + $res.Content.Length + " bytes)")
    } catch {
        Write-Output ("FAIL $url -> " + $_.Exception.Message)
    }
}
