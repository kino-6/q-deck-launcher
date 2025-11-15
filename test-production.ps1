# プロダクションモードでアプリケーションを起動するテストスクリプト
# エラーログ機能を検証するため

Write-Host "=== Q-Deck Launcher - Production Mode Test ===" -ForegroundColor Cyan
Write-Host ""

# 環境変数を設定
$env:NODE_ENV = "production"
$env:NO_DEVTOOLS = "true"

Write-Host "環境設定:" -ForegroundColor Yellow
Write-Host "  NODE_ENV = $env:NODE_ENV"
Write-Host "  NO_DEVTOOLS = $env:NO_DEVTOOLS"
Write-Host ""

Write-Host "アプリケーションを起動しています..." -ForegroundColor Green
Write-Host "  - 開発者ツールは無効化されています（F12を押しても開きません）"
Write-Host "  - エラーログは %APPDATA%\q-deck-launcher\logs\ に記録されます"
Write-Host ""

# Electronを起動
npm run electron:dev

Write-Host ""
Write-Host "アプリケーションが終了しました" -ForegroundColor Cyan
