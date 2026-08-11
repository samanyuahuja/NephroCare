import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <span>404 / NOT FOUND</span>
      <h1 id="not-found-title">This page is not part of NephroCare.</h1>
      <p>The address may have changed, or the link may be incomplete.</p>
      <Button asChild><Link href="/">Return home</Link></Button>
    </section>
  );
}
