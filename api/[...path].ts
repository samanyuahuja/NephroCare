import type { Request, Response } from "express";
import { createApplication } from "../server/app";

const application = createApplication();

export default async function handler(req: Request, res: Response) {
  const { app } = await application;
  return app(req, res);
}
