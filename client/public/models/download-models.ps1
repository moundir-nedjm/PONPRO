# PowerShell script to download face-api.js models
# Run this script in PowerShell: .\download-models.ps1

Write-Host "Starting download of face-api.js models..." -ForegroundColor Green

# Base URL for the models
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/"

# List of models to download
$models = @(
    # SSD Mobilenet
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    
    # Tiny Face Detector
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    
    # Face Recognition
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2",
    
    # Face Landmark Detection
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    
    # Face Expression
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

# Current directory
$currentDir = Get-Location

# Download each model
foreach ($model in $models) {
    $url = $baseUrl + $model
    $outFile = Join-Path -Path $currentDir -ChildPath $model
    
    Write-Host "Downloading $model..." -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $outFile
        Write-Host "Downloaded: $model" -ForegroundColor Green
    } catch {
        Write-Host "Error downloading $model. See error above." -ForegroundColor Red
    }
}

Write-Host "Download process completed!" -ForegroundColor Green
Write-Host "Please verify that all model files are present in the current directory." -ForegroundColor Yellow 