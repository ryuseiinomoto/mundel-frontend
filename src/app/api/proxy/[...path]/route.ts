import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.API_URL ?? "http://localhost:8080"
const API_KEY = process.env.API_KEY ?? ""

type Params = { path: string[] }

async function handler(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { path } = await params
  const targetPath = path.join("/")
  const search = req.nextUrl.search
  const targetUrl = `${BACKEND_URL}/${targetPath}${search}`

  const headers = new Headers()
  const contentType = req.headers.get("Content-Type")
  if (contentType) headers.set("Content-Type", contentType)
  if (API_KEY) headers.set("X-API-Key", API_KEY)

  const body =
    req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const resContentType = res.headers.get("Content-Type") ?? "application/json"
  const data = await res.text()
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": resContentType },
  })
}

export { handler as GET, handler as POST, handler as DELETE }
