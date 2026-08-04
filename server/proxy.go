package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

var proxyClient = &http.Client{
	Timeout: 300 * time.Second,
}

func handleProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		setCORSHeaders(w)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	targetURL := r.Header.Get("X-Target-URL")
	if targetURL == "" {
		http.Error(w, `{"error":"missing X-Target-URL header"}`, http.StatusBadRequest)
		return
	}

	var forwardHeaders map[string]string
	headersJSON := r.Header.Get("X-Forward-Headers")
	if headersJSON != "" {
		if err := json.Unmarshal([]byte(headersJSON), &forwardHeaders); err != nil {
			http.Error(w, `{"error":"invalid X-Forward-Headers JSON"}`, http.StatusBadRequest)
			return
		}
	}

	bodyBytes, _ := io.ReadAll(r.Body)
	log.Printf("[PROXY] %s %s (body=%d bytes)", r.Method, targetURL, len(bodyBytes))

	proxyReq, err := http.NewRequest(r.Method, targetURL, strings.NewReader(string(bodyBytes)))
	if err != nil {
		errMsg := fmt.Sprintf("invalid request: %s", err.Error())
		log.Printf("[PROXY ERROR] %s", errMsg)
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, errMsg), http.StatusBadRequest)
		return
	}

	for key, value := range forwardHeaders {
		proxyReq.Header.Set(key, value)
	}
	proxyReq.Header.Set("Host", proxyReq.URL.Host)

	log.Printf("[PROXY] headers: %v", forwardHeaders)

	resp, err := proxyClient.Do(proxyReq)
	if err != nil {
		errMsg := fmt.Sprintf("target API unreachable: %s", err.Error())
		log.Printf("[PROXY ERROR] %s -> %s", targetURL, errMsg)
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, errMsg), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	log.Printf("[PROXY] %s -> %d (body=%d bytes)", targetURL, resp.StatusCode, len(respBody))

	setCORSHeaders(w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)
}

func setCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Target-URL, X-Forward-Headers, Authorization")
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, `{"status":"ok"}`)
}
