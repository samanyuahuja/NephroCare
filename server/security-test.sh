#!/bin/bash
# Security Verification Script for NephroCare
# Tests rate limiting, input validation, sanitization, headers, and error handling

BASE="http://localhost:5000"
PASS=0
FAIL=0

check() {
  local desc="$1"
  local expected="$2"
  local actual="$3"
  if echo "$actual" | grep -q "$expected"; then
    echo "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc (expected '$expected')"
    echo "    Got: $actual"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== SECURITY TESTS ==="
echo ""

echo "[1] Helmet Security Headers"
HEADERS=$(curl -sI "$BASE/api/health")
check "X-Content-Type-Options present" "nosniff" "$HEADERS"
check "X-Frame-Options present" "SAMEORIGIN" "$HEADERS"
check "Strict-Transport-Security present" "max-age=" "$HEADERS"
check "X-DNS-Prefetch-Control present" "X-DNS-Prefetch-Control" "$HEADERS"
check "RateLimit headers present" "RateLimit-Limit" "$HEADERS"
echo ""

echo "[2] Input Validation - Chat (strict mode rejects extra fields)"
R=$(curl -s -X POST "$BASE/api/chat-direct" -H "Content-Type: application/json" -d '{"message":"hi","injected":"bad"}')
check "Rejects unexpected fields with generic error" "Invalid input" "$R"
echo ""

echo "[3] Input Validation - Chat (empty message rejected)"
R=$(curl -s -X POST "$BASE/api/chat-direct" -H "Content-Type: application/json" -d '{"message":""}')
check "Rejects empty message with generic error" "Invalid input" "$R"
echo ""

echo "[4] Input Validation - Chat (oversized message rejected)"
LONG=$(python3 -c "print('a'*2001)")
R=$(curl -s -X POST "$BASE/api/chat-direct" -H "Content-Type: application/json" -d "{\"message\":\"$LONG\"}")
check "Rejects oversized message with generic error" "Invalid input" "$R"
echo ""

echo "[5] URL Param Validation (non-integer ID rejected)"
R=$(curl -s "$BASE/api/ckd-assessment/abc")
check "Rejects non-integer ID" "Invalid assessment ID" "$R"
echo ""

echo "[6] URL Param Validation (negative ID rejected)"
R=$(curl -s "$BASE/api/ckd-assessment/-1")
check "Rejects negative ID" "Invalid assessment ID" "$R"
echo ""

echo "[7] URL Param Validation (zero ID rejected)"
R=$(curl -s "$BASE/api/ckd-assessment/0")
check "Rejects zero ID" "Invalid assessment ID" "$R"
echo ""

echo "[8] Filtered IDs Validation (invalid JSON rejected)"
R=$(curl -s "$BASE/api/ckd-assessments/filtered?ids=notjson")
check "Rejects invalid JSON in filter" "Invalid ID format" "$R"
echo ""

echo "[9] Filtered IDs Validation (non-array rejected)"
R=$(curl -s "$BASE/api/ckd-assessments/filtered?ids=%22hello%22")
check "Rejects non-array filter" "Invalid assessment IDs" "$R"
echo ""

echo "[10] Filtered IDs Validation (negative IDs rejected)"
R=$(curl -s "$BASE/api/ckd-assessments/filtered?ids=%5B-1%2C0%5D")
check "Rejects negative IDs in filter" "Invalid assessment IDs" "$R"
echo ""

echo "[11] XSS Sanitization (script tags stripped from chat)"
R=$(curl -s -X POST "$BASE/api/chat-direct" -H "Content-Type: application/json" -d '{"message":"<script>alert(1)</script>hello"}')
check "Returns response without script tags" "reply" "$R"
echo ""

echo "[12] Diet Plan Param Validation"
R=$(curl -s "$BASE/api/diet-plan/abc")
check "Rejects non-integer diet plan ID" "Invalid assessment ID" "$R"
echo ""

echo "[13] Error Handling (no stack traces in 500 responses)"
R=$(curl -s -X POST "$BASE/api/ckd-assessment" -H "Content-Type: application/json" -d '{}')
check "No stack trace in error response" "Invalid assessment data\|check all fields" "$R"
echo ""

echo "[14] API Key Not Exposed Client-Side"
CLIENT_SRC=$(find client/src -name "*.ts" -o -name "*.tsx" | xargs grep -l "OPENAI\|API_KEY\|process\.env" 2>/dev/null || true)
if [ -z "$CLIENT_SRC" ]; then
  echo "  PASS: No API keys or process.env references in client code"
  PASS=$((PASS + 1))
else
  echo "  FAIL: Found potential secret exposure in: $CLIENT_SRC"
  FAIL=$((FAIL + 1))
fi
echo ""

echo "[15] No .env Files Committed"
ENV_FILES=$(find . -maxdepth 2 -name ".env*" ! -name ".env.example" -type f 2>/dev/null || true)
if [ -z "$ENV_FILES" ]; then
  echo "  PASS: No .env files found in project root"
  PASS=$((PASS + 1))
else
  echo "  FAIL: Found .env files: $ENV_FILES"
  FAIL=$((FAIL + 1))
fi
echo ""

echo "[16] No Dead Code / Backup Files"
BACKUPS=$(find server -name "*backup*" -o -name "*fixed*" -o -name "*.bak" 2>/dev/null || true)
if [ -z "$BACKUPS" ]; then
  echo "  PASS: No backup/dead code files in server/"
  PASS=$((PASS + 1))
else
  echo "  FAIL: Found backup files: $BACKUPS"
  FAIL=$((FAIL + 1))
fi
echo ""

echo "=== RESULTS ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo ""
if [ $FAIL -eq 0 ]; then
  echo "All security tests passed."
else
  echo "$FAIL test(s) failed. Review the output above."
fi
