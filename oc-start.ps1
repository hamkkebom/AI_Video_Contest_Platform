# OpenCode 실행 스크립트 (.env 파일 Bun 크래시 우회)
# 사용법: powershell -ExecutionPolicy Bypass -File oc-start.ps1

Write-Host ""
Write-Host "  [OpenCode 시작]" -ForegroundColor Cyan

# 1) .env 파일 숨기기
$envFiles = Get-ChildItem -Path . -Filter ".env*" -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '\.oc-hidden$' }
foreach ($f in $envFiles) {
    Rename-Item -Path $f.FullName -NewName "$($f.Name).oc-hidden" -Force
}
Write-Host "  .env 파일 $($envFiles.Count)개 임시 숨김" -ForegroundColor DarkYellow

# 2) 숨겨진 것 확인
Start-Sleep -Milliseconds 500

# 3) OpenCode 실행
Write-Host "  OpenCode 실행 중..." -ForegroundColor Green
Write-Host ""
opencode $args

# 4) .env 파일 복원
$hiddenFiles = Get-ChildItem -Path . -Filter "*.oc-hidden" -Force -ErrorAction SilentlyContinue
foreach ($f in $hiddenFiles) {
    $originalName = $f.Name -replace '\.oc-hidden$', ''
    Rename-Item -Path $f.FullName -NewName $originalName -Force
}
Write-Host ""
Write-Host "  .env 파일 $($hiddenFiles.Count)개 복원 완료" -ForegroundColor Green
Write-Host "  OpenCode 종료됨" -ForegroundColor Red
