package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

type ProxyConfig struct {
	Enabled  bool   `json:"enabled"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
}

var (
	proxyConfig     ProxyConfig
	proxyConfigMu   sync.RWMutex
	proxyClient     *http.Client
	proxyConfigured bool
)

func init() {
	// Default: no proxy
	proxyConfig = ProxyConfig{Enabled: false}
	proxyClient = &http.Client{Timeout: 300 * time.Second}
}

func getProxyConfig() ProxyConfig {
	proxyConfigMu.RLock()
	defer proxyConfigMu.RUnlock()
	return proxyConfig
}

func setProxyConfig(config ProxyConfig) {
	proxyConfigMu.Lock()
	defer proxyConfigMu.Unlock()
	proxyConfig = config
	proxyConfigured = config.Enabled && config.Host != "" && config.Port > 0
	if proxyConfigured {
		proxyURL := fmt.Sprintf("http://%s:%d", config.Host, config.Port)
		transport := &http.Transport{
			Proxy: http.ProxyURL(&url.URL{
				Scheme: "http",
				Host:   fmt.Sprintf("%s:%d", config.Host, config.Port),
			}),
		}
		proxyClient = &http.Client{
			Timeout:   300 * time.Second,
			Transport: transport,
		}
		log.Printf("[PROXY] HTTP proxy enabled: %s", proxyURL)
	} else {
		proxyClient = &http.Client{Timeout: 300 * time.Second}
		log.Printf("[PROXY] HTTP proxy disabled")
	}
}

func handleProxyConfig(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		setCORSHeaders(w)
		w.WriteHeader(http.StatusNoContent)
		return
	}

	switch r.Method {
	case http.MethodGet:
		setCORSHeaders(w)
		w.Header().Set("Content-Type", "application/json")
		config := getProxyConfig()
		json.NewEncoder(w).Encode(config)

	case http.MethodPost:
		var config ProxyConfig
		body, _ := io.ReadAll(r.Body)
		if err := json.Unmarshal(body, &config); err != nil {
			http.Error(w, `{"error":"invalid JSON"}`, http.StatusBadRequest)
			return
		}
		setProxyConfig(config)
		setCORSHeaders(w)
		w.Header().Set("Content-Type", "application/json")
		io.WriteString(w, `{"status":"ok"}`)

	default:
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	}
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
	// Only set Content-Type from incoming request if not already provided via forwardHeaders
	if _, ok := forwardHeaders["Content-Type"]; !ok {
		if ct := r.Header.Get("Content-Type"); ct != "" {
			proxyReq.Header.Set("Content-Type", ct)
		}
	}
	proxyReq.Header.Set("Host", proxyReq.URL.Host)

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
