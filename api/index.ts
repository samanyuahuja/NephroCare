import type { Request, Response } from "express";
import { createApplication } from "../server/app";

const application = createApplication();

export default async function handler(req: Request, res: Response) {
  const rewrittenUrl = new URL(req.url, "http://vercel.local");
  const route = rewrittenUrl.searchParams.get("route");

  if (route) {
    rewrittenUrl.searchParams.delete("route");
    const query = rewrittenUrl.searchParams.toString();
    req.url = `/api/${route}${query ? `?${query}` : ""}`;
  }

  const { app } = await application;
  return app(req, res);
}
