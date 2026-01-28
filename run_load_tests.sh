#!/bin/bash
# Load Testing Runner - Execute all tests sequentially
# Usage: ./run_load_tests.sh [staging|production] [all|baseline|rampup|spike|mixed|chaos|soak|stress]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
TEST_TYPE=${2:-all}
BASE_URL="http://localhost"
API_KEY="test-key-$(date +%s)"
RESULTS_DIR="results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${RESULTS_DIR}/load_test_${TIMESTAMP}.log"

# Create results directory
mkdir -p ${RESULTS_DIR}

# Function to print headers
print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log message
log_message() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> ${LOG_FILE}
}

# Initialize log
log_message "=============== Load Testing Session Started ==============="
log_message "Environment: ${ENVIRONMENT}"
log_message "Test Type: ${TEST_TYPE}"
log_message "Base URL: ${BASE_URL}"

# Pre-flight checks
check_prerequisites() {
    print_header "Pre-Flight Checks"
    
    # Check if k6 is installed
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Install it from https://k6.io/"
        exit 1
    fi
    print_success "k6 is installed"
    
    # Check if test files exist
    if [ ! -d "k6" ]; then
        print_error "k6 directory not found. Are you in the project root?"
        exit 1
    fi
    print_success "K6 test directory found"
    
    # Check if backend is running
    if ! curl -s ${BASE_URL}/health > /dev/null 2>&1; then
        print_warning "Backend at ${BASE_URL} is not responding"
        print_warning "Make sure your backend is running (docker-compose up)"
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "Backend is responding at ${BASE_URL}"
    fi
    
    # Check disk space
    available=$(df ${RESULTS_DIR} | awk 'NR==2 {print $4}')
    if [ $available -lt 1048576 ]; then  # Less than 1GB
        print_warning "Low disk space available ($(echo $available | numfmt --to=iec-i --suffix=B 2>/dev/null || echo $available)KB)"
    else
        print_success "Sufficient disk space available"
    fi
}

# Function to run a test
run_test() {
    local test_name=$1
    local test_file=$2
    local duration=$3
    
    print_header "Running: ${test_name} (${duration})"
    log_message "Starting test: ${test_name}"
    
    local results_file="${RESULTS_DIR}/${test_name}_${TIMESTAMP}.json"
    local start_time=$(date +%s)
    
    echo -e "${BLUE}Command:${NC} k6 run ${test_file} --out json=${results_file}"
    echo ""
    
    # Run the test
    if k6 run ${test_file} \
        --out json=${results_file} \
        --env BASE_URL=${BASE_URL} \
        --env API_KEY=${API_KEY}; then
        
        local end_time=$(date +%s)
        local elapsed=$((end_time - start_time))
        
        print_success "${test_name} completed in $(date -d@${elapsed} -u +%H:%M:%S)"
        log_message "✅ ${test_name} completed successfully"
        
        # Extract key metrics
        extract_metrics "${results_file}" "${test_name}"
        
        return 0
    else
        print_error "${test_name} failed"
        log_message "❌ ${test_name} failed"
        return 1
    fi
}

# Function to extract and display key metrics
extract_metrics() {
    local results_file=$1
    local test_name=$2
    
    if [ ! -f "${results_file}" ]; then
        return
    fi
    
    echo ""
    echo -e "${BLUE}Key Metrics:${NC}"
    
    # Using jq to extract metrics if available
    if command -v jq &> /dev/null; then
        local p95=$(jq -r '.metrics.http_req_duration.values.p_95 // "N/A"' ${results_file})
        local p99=$(jq -r '.metrics.http_req_duration.values.p_99 // "N/A"' ${results_file})
        local error_rate=$(jq -r '.metrics.http_req_failed.values.rate // "N/A"' ${results_file})
        local total_reqs=$(jq -r '.metrics.http_reqs.values.count // "N/A"' ${results_file})
        
        echo "  P95 Latency:    ${p95}ms"
        echo "  P99 Latency:    ${p99}ms"
        echo "  Error Rate:     ${error_rate}%"
        echo "  Total Requests: ${total_reqs}"
    fi
    
    echo ""
}

# Function to run all tests
run_all_tests() {
    local start_time=$(date +%s)
    local failed_tests=()
    local passed_tests=()
    
    print_header "Load Testing Suite - ${ENVIRONMENT}"
    echo -e "Total Estimated Duration: ~5.5 hours"
    echo -e "Results will be saved to: ${RESULTS_DIR}/"
    echo ""
    
    # Run each test
    local tests=(
        "baseline:k6/baseline.js:10 minutes"
        "rampup:k6/ramp_up.js:42 minutes"
        "spike:k6/spike_test.js:10 minutes"
        "mixed:k6/mixed_scenarios.js:20 minutes"
        "chaos:k6/chaos_test.js:25 minutes"
        "soak:k6/soak_test.js:4 hours"
        "stress:k6/stress_test.js:15 minutes"
    )
    
    for test_spec in "${tests[@]}"; do
        IFS=':' read -r test_name test_file duration <<< "$test_spec"
        
        if [ "${TEST_TYPE}" != "all" ] && [ "${TEST_TYPE}" != "${test_name}" ]; then
            continue
        fi
        
        if run_test "${test_name}" "${test_file}" "${duration}"; then
            passed_tests+=("${test_name}")
        else
            failed_tests+=("${test_name}")
        fi
        
        echo ""
        
        # Offer to skip remaining tests
        if [ ${#failed_tests[@]} -gt 0 ]; then
            read -p "Test failed. Continue with remaining tests? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                break
            fi
        fi
    done
    
    # Print summary
    print_header "Load Testing Summary"
    
    local end_time=$(date +%s)
    local total_elapsed=$((end_time - start_time))
    
    echo -e "${GREEN}Passed Tests (${#passed_tests[@]}):${NC}"
    for test in "${passed_tests[@]}"; do
        echo -e "  ✅ $test"
    done
    
    if [ ${#failed_tests[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}Failed Tests (${#failed_tests[@]}):${NC}"
        for test in "${failed_tests[@]}"; do
            echo -e "  ❌ $test"
        done
    fi
    
    echo ""
    echo -e "${BLUE}Total Duration:${NC} $(date -d@${total_elapsed} -u +%H:%M:%S)"
    echo -e "${BLUE}Results Location:${NC} ${RESULTS_DIR}/"
    echo -e "${BLUE}Log File:${NC} ${LOG_FILE}"
    
    log_message "=============== Load Testing Session Completed ==============="
    
    # Suggest next steps
    echo ""
    print_header "Next Steps"
    echo "1. Review results: cat ${LOG_FILE}"
    echo "2. Analyze metrics: Review ${RESULTS_DIR}/ JSON files"
    echo "3. Check LOAD_TESTING_ANALYSIS.md for interpretation guide"
    echo "4. Compare against performance thresholds"
    echo "5. Document breaking point and safe capacity"
    echo ""
    
    if [ ${#failed_tests[@]} -gt 0 ]; then
        print_error "Some tests failed. Review ${LOG_FILE} for details."
        return 1
    else
        print_success "All tests completed successfully!"
        return 0
    fi
}

# Function to show help
show_help() {
    cat << EOF
Usage: ./run_load_tests.sh [ENVIRONMENT] [TEST_TYPE]

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
  ./run_load_tests.sh staging all

  # Run just the baseline test
  ./run_load_tests.sh staging baseline

  # Run ramp-up test on staging
  ./run_load_tests.sh staging rampup

  # Run chaos test to verify failover
  ./run_load_tests.sh staging chaos

REQUIREMENTS:
  - k6 must be installed (https://k6.io/)
  - Backend must be running at http://localhost
  - Results directory must be writable
  - At least 1GB free disk space

RESULTS:
  - JSON results saved to: ${RESULTS_DIR}/
  - Log file: ${LOG_FILE}
  - View analysis guide: LOAD_TESTING_ANALYSIS.md

EOF
}

# Main execution
main() {
    # Show help if requested
    if [ "${1}" = "help" ] || [ "${1}" = "-h" ] || [ "${1}" = "--help" ]; then
        show_help
        exit 0
    fi
    
    # Run pre-flight checks
    check_prerequisites
    
    echo ""
    
    # Run tests
    if [ "${TEST_TYPE}" = "all" ]; then
        run_all_tests
    else
        # Run single test
        case ${TEST_TYPE} in
            baseline)
                run_test "baseline" "k6/baseline.js" "10 minutes"
                ;;
            rampup)
                run_test "rampup" "k6/ramp_up.js" "42 minutes"
                ;;
            spike)
                run_test "spike" "k6/spike_test.js" "10 minutes"
                ;;
            mixed)
                run_test "mixed" "k6/mixed_scenarios.js" "20 minutes"
                ;;
            chaos)
                run_test "chaos" "k6/chaos_test.js" "25 minutes"
                ;;
            soak)
                run_test "soak" "k6/soak_test.js" "4 hours"
                ;;
            stress)
                run_test "stress" "k6/stress_test.js" "15 minutes"
                ;;
            *)
                print_error "Unknown test type: ${TEST_TYPE}"
                show_help
                exit 1
                ;;
        esac
    fi
}

# Run main
main "$@"
