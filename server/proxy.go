package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
)

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

	proxyReq, err := http.NewRequest(r.Method, targetURL, r.Body)
	if err != nil {
		http.Error(w, `{"error":"invalid target URL"}`, http.StatusBadRequest)
		return
	}

	for key, value := range forwardHeaders {
		proxyReq.Header.Set(key, value)
	}

	client := &http.Client{}
	resp, err := client.Do(proxyReq)
	if err != nil {
		log.Printf("proxy error: %v", err)
		http.Error(w, `{"error":"failed to reach target API"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	setCORSHeaders(w)
	for key, values := range resp.Header {
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
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
