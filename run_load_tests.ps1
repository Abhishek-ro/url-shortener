# Load Testing Runner (PowerShell) - Execute all tests sequentially
# Usage: .\run_load_tests.ps1 -Environment staging -TestType all

param(
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging",
    
    [ValidateSet("all", "baseline", "rampup", "spike", "mixed", "chaos", "soak", "stress")]
    [string]$TestType = "all"
)

# Configuration
$baseUrl = "http://localhost"
$apiKey = "test-key-$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$resultsDir = "results"
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$logFile = "$resultsDir/load_test_${timestamp}.log"

# Create results directory if it doesn't exist
if (-not (Test-Path $resultsDir)) {
    New-Item -ItemType Directory -Path $resultsDir | Out-Null
}

# Color output
function Write-Header {
    param([string]$Message)
    Write-Host "`n════════════════════════════════════════════════════════" -ForegroundColor Blue
    Write-Host $Message -ForegroundColor Blue
    Write-Host "════════════════════════════════════════════════════════`n" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    Add-Content -Path $logFile -Value "[$timestamp] $Message"
}

# Initialize log
Write-Log "=============== Load Testing Session Started ==============="
Write-Log "Environment: $Environment"
Write-Log "Test Type: $TestType"
Write-Log "Base URL: $baseUrl"

# Pre-flight checks
function Test-Prerequisites {
    Write-Header "Pre-Flight Checks"
    
    # Check if k6 is installed
    $k6Path = Get-Command k6 -ErrorAction SilentlyContinue
    if (-not $k6Path) {
        Write-Error-Custom "k6 is not installed. Download from https://k6.io/"
        exit 1
    }
    Write-Success "k6 is installed"
    
    # Check if test files exist
    if (-not (Test-Path "k6" -PathType Container)) {
        Write-Error-Custom "k6 directory not found. Are you in the project root?"
        exit 1
    }
    Write-Success "K6 test directory found"
    
    # Check if backend is running
    try {
        $null = Invoke-WebRequest -Uri "$baseUrl/health" -ErrorAction Stop
        Write-Success "Backend is responding at $baseUrl"
    } catch {
        Write-Warning "Backend at $baseUrl is not responding"
        Write-Warning "Make sure your backend is running (docker-compose up)"
        $response = Read-Host "Continue anyway? (y/n)"
        if ($response -ne 'y') {
            exit 1
        }
    }
}

# Function to run a test
function Invoke-Test {
    param(
        [string]$TestName,
        [string]$TestFile,
        [string]$Duration
    )
    
    Write-Header "Running: $TestName ($Duration)"
    Write-Log "Starting test: $TestName"
    
    $resultsFile = "$resultsDir/${TestName}_${timestamp}.json"
    $startTime = Get-Date
    
    Write-Host "Command: k6 run $TestFile --out json=$resultsFile`n" -ForegroundColor Blue
    
    # Run the test
    & k6 run $TestFile `
        --out json=$resultsFile `
        --env BASE_URL=$baseUrl `
        --env API_KEY=$apiKey
    
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $elapsed = $endTime - $startTime
        
        Write-Success "$TestName completed in $($elapsed.ToString('hh\:mm\:ss'))"
        Write-Log "✅ $TestName completed successfully"
        
        # Extract key metrics
        Get-TestMetrics -ResultsFile $resultsFile -TestName $TestName
        
        return $true
    } else {
        Write-Error-Custom "$TestName failed"
        Write-Log "❌ $TestName failed"
        return $false
    }
}

# Function to extract and display key metrics
function Get-TestMetrics {
    param(
        [string]$ResultsFile,
        [string]$TestName
    )
    
    if (-not (Test-Path $ResultsFile)) {
        return
    }
    
    Write-Host "`nKey Metrics:" -ForegroundColor Blue
    
    try {
        $json = Get-Content $ResultsFile | ConvertFrom-Json
        
        if ($json.metrics) {
            $p95 = $json.metrics.http_req_duration.values.p_95
            $p99 = $json.metrics.http_req_duration.values.p_99
            $errorRate = $json.metrics.http_req_failed.values.rate
            $totalReqs = $json.metrics.http_reqs.values.count
            
            if ($p95) { Write-Host "  P95 Latency:    ${p95}ms" }
            if ($p99) { Write-Host "  P99 Latency:    ${p99}ms" }
            if ($errorRate) { Write-Host "  Error Rate:     ${errorRate}%" }
            if ($totalReqs) { Write-Host "  Total Requests: $totalReqs" }
        }
    } catch {
        # Silently ignore JSON parsing errors
    }
    
    Write-Host ""
}

# Function to run all tests
function Invoke-AllTests {
    Write-Header "Load Testing Suite - $Environment"
    Write-Host "Total Estimated Duration: ~5.5 hours`n"
    Write-Host "Results will be saved to: $resultsDir/`n"
    
    $passedTests = @()
    $failedTests = @()
    $startTime = Get-Date
    
    $tests = @(
        @{Name="baseline"; File="k6/baseline.js"; Duration="10 minutes"}
        @{Name="rampup"; File="k6/ramp_up.js"; Duration="42 minutes"}
        @{Name="spike"; File="k6/spike_test.js"; Duration="10 minutes"}
        @{Name="mixed"; File="k6/mixed_scenarios.js"; Duration="20 minutes"}
        @{Name="chaos"; File="k6/chaos_test.js"; Duration="25 minutes"}
        @{Name="soak"; File="k6/soak_test.js"; Duration="4 hours"}
        @{Name="stress"; File="k6/stress_test.js"; Duration="15 minutes"}
    )
    
    foreach ($test in $tests) {
        if ($TestType -ne "all" -and $TestType -ne $test.Name) {
            continue
        }
        
        if (Invoke-Test -TestName $test.Name -TestFile $test.File -Duration $test.Duration) {
            $passedTests += $test.Name
        } else {
            $failedTests += $test.Name
        }
        
        Write-Host ""
        
        if ($failedTests.Count -gt 0) {
            $response = Read-Host "Test failed. Continue with remaining tests? (y/n)"
            if ($response -ne 'y') {
                break
            }
        }
    }
    
    # Print summary
    Write-Header "Load Testing Summary"
    
    $endTime = Get-Date
    $totalElapsed = $endTime - $startTime
    
    if ($passedTests.Count -gt 0) {
        Write-Host "Passed Tests ($($passedTests.Count)):" -ForegroundColor Green
        foreach ($test in $passedTests) {
            Write-Host "  ✅ $test"
        }
    }
    
    if ($failedTests.Count -gt 0) {
        Write-Host "`nFailed Tests ($($failedTests.Count)):" -ForegroundColor Red
        foreach ($test in $failedTests) {
            Write-Host "  ❌ $test"
        }
    }
    
    Write-Host ""
    Write-Host "Total Duration: $($totalElapsed.ToString('hh\:mm\:ss'))" -ForegroundColor Blue
    Write-Host "Results Location: $resultsDir/" -ForegroundColor Blue
    Write-Host "Log File: $logFile" -ForegroundColor Blue
    
    Write-Log "=============== Load Testing Session Completed ==============="
    
    # Suggest next steps
    Write-Header "Next Steps"
    Write-Host "1. Review results: Get-Content $logFile"
    Write-Host "2. Analyze metrics: Review $resultsDir/*.json files"
    Write-Host "3. Check LOAD_TESTING_ANALYSIS.md for interpretation guide"
    Write-Host "4. Compare against performance thresholds"
    Write-Host "5. Document breaking point and safe capacity`n"
    
    if ($failedTests.Count -gt 0) {
        Write-Error-Custom "Some tests failed. Review $logFile for details."
        return $false
    } else {
        Write-Success "All tests completed successfully!"
        return $true
    }
}

# Function to show help
function Show-Help {
    $helpText = @"
Usage: .\run_load_tests.ps1 -Environment staging -TestType all

ENVIRONMENT:
  staging       Run tests against staging backend (default)
  production    Run tests against production backend (use with caution!)

TEST_TYPE:
  all           Run all tests sequentially (default)
  baseline      Run baseline performance test (10 min)
  rampup        Run ramp-up to breaking point (42 min)
  spike         Run spike test (10 min)
  mixed         Run mixed scenarios test (20 min)
  chaos         Run chaos engineering test (25 min)
  soak          Run soak test - 4 hours (4 hours)
  stress        Run stress test to breaking point (15 min)

EXAMPLES:
  # Run all tests on staging
  .\run_load_tests.ps1 -Environment staging -TestType all

  # Run just the baseline test
  .\run_load_tests.ps1 -Environment staging -TestType baseline

  # Run ramp-up test on staging
  .\run_load_tests.ps1 -Environment staging -TestType rampup

  # Run chaos test to verify failover
  .\run_load_tests.ps1 -Environment staging -TestType chaos

REQUIREMENTS:
  - k6 must be installed (https://k6.io/)
  - Backend must be running at http://localhost
  - Results directory must be writable
  - At least 1GB free disk space

RESULTS:
  - JSON results saved to: $resultsDir/
  - Log file: $logFile
  - View analysis guide: LOAD_TESTING_ANALYSIS.md
"@
    Write-Host $helpText
}

# Main execution
if ($Environment -eq "help" -or $TestType -eq "help") {
    Show-Help
    exit 0
}

# Run pre-flight checks
Test-Prerequisites

Write-Host ""

# Run tests
if ($TestType -eq "all") {
    Invoke-AllTests
} else {
    # Run single test
    switch ($TestType) {
        "baseline" { Invoke-Test -TestName "baseline" -TestFile "k6/baseline.js" -Duration "10 minutes" }
        "rampup" { Invoke-Test -TestName "rampup" -TestFile "k6/ramp_up.js" -Duration "42 minutes" }
        "spike" { Invoke-Test -TestName "spike" -TestFile "k6/spike_test.js" -Duration "10 minutes" }
        "mixed" { Invoke-Test -TestName "mixed" -TestFile "k6/mixed_scenarios.js" -Duration "20 minutes" }
        "chaos" { Invoke-Test -TestName "chaos" -TestFile "k6/chaos_test.js" -Duration "25 minutes" }
        "soak" { Invoke-Test -TestName "soak" -TestFile "k6/soak_test.js" -Duration "4 hours" }
        "stress" { Invoke-Test -TestName "stress" -TestFile "k6/stress_test.js" -Duration "15 minutes" }
        default {
            Write-Error-Custom "Unknown test type: $TestType"
            Show-Help
            exit 1
        }
    }
}
