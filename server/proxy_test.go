package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestProxy_ForwardsRequest(t *testing.T) {
	target := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer test-key" {
			t.Errorf("expected Authorization header forwarded, got %q", r.Header.Get("Authorization"))
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		io.WriteString(w, `{"data":[{"b64_json":"abc"}]}`)
	}))
	defer target.Close()

	req := httptest.NewRequest("POST", "/api/proxy", strings.NewReader(`{"prompt":"test"}`))
	req.Header.Set("X-Target-URL", target.URL+"/v1/images/generations")
	req.Header.Set("X-Forward-Headers", `{"Authorization":"Bearer test-key","Content-Type":"application/json"}`)

	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Origin") != "*" {
		t.Errorf("expected CORS header, got %q", rec.Header().Get("Access-Control-Allow-Origin"))
	}
	body := rec.Body.String()
	if body != `{"data":[{"b64_json":"abc"}]}` {
		t.Errorf("unexpected response body: %s", body)
	}
}

func TestProxy_MissingTargetURL(t *testing.T) {
	req := httptest.NewRequest("POST", "/api/proxy", strings.NewReader(`{}`))
	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestProxy_AllowsCORSPreflight(t *testing.T) {
	req := httptest.NewRequest("OPTIONS", "/api/proxy", nil)
	rec := httptest.NewRecorder()
	handleProxy(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", rec.Code)
	}
	if rec.Header().Get("Access-Control-Allow-Headers") == "" {
		t.Error("expected CORS allow-headers")
	}
}
