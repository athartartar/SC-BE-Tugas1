#!/bin/bash

BASE_URL="${BASE_URL:-http://localhost:3000}"

pass_count=0
fail_count=0

assert_status() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ "$expected" -eq "$actual" ]; then
    echo "[PASS] $label (Expected: $expected, Got: $actual)"
    pass_count=$((pass_count + 1))
  else
    echo "[FAIL] $label (Expected: $expected, Got: $actual)"
    fail_count=$((fail_count + 1))
  fi
}

res=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/health")
code=$(echo "$res" | tail -n1)
body=$(echo "$res" | sed '$d')
assert_status "GET /health" 200 "$code"

res=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/books" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buku Uji Bash", "author": "Penulis Uji", "year": 2024, "stock": 10}')
code=$(echo "$res" | tail -n1)
body=$(echo "$res" | sed '$d')
assert_status "POST /books" 201 "$code"

BOOK_ID=$(echo "$body" | grep -o '"id":[0-9]*' | head -n1 | cut -d: -f2)
if [ -z "$BOOK_ID" ]; then
  BOOK_ID=1
fi

res=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/books")
code=$(echo "$res" | tail -n1)
assert_status "GET /books" 200 "$code"

res=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/books/$BOOK_ID")
code=$(echo "$res" | tail -n1)
assert_status "GET /books/$BOOK_ID" 200 "$code"

res=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/books/$BOOK_ID" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buku Uji Updated", "author": "Penulis Uji", "year": 2025, "stock": 15}')
code=$(echo "$res" | tail -n1)
assert_status "PUT /books/$BOOK_ID" 200 "$code"

res=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/books/$BOOK_ID")
code=$(echo "$res" | tail -n1)
assert_status "DELETE /books/$BOOK_ID" 200 "$code"

res=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/books/$BOOK_ID")
code=$(echo "$res" | tail -n1)
assert_status "GET /books/$BOOK_ID (deleted)" 404 "$code"

echo ""
echo "Summary: $pass_count passed, $fail_count failed"
if [ "$fail_count" -gt 0 ]; then
  exit 1
fi
exit 0
