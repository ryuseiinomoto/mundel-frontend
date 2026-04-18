export function getApiBase(): string {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  if (API_URL && API_URL.trim()) return API_URL.replace(/\/$/, "")
  if (typeof window === "undefined") return "http://localhost:8080"
  const hostname = window.location.hostname
  if (hostname === "localhost" || hostname === "127.0.0.1") return "http://localhost:8080"
  return "https://mundel-backend-490996932437.europe-west1.run.app"
}
