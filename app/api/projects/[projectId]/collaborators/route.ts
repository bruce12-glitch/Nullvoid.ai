type RouteContext = { params: Promise<{ projectId: string }> }

export async function GET(
  _request: Request,
  _ctx: RouteContext
) {
  return Response.json({ error: "Not Implemented" }, { status: 501 })
}

export async function POST(
  _request: Request,
  _ctx: RouteContext
) {
  return Response.json({ error: "Not Implemented" }, { status: 501 })
}

export async function DELETE(
  _request: Request,
  _ctx: RouteContext
) {
  return Response.json({ error: "Not Implemented" }, { status: 501 })
}
