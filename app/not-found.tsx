import Link from "next/link";

export default function NotFound() {
  return <section className="section container reading">
    <h1>Page not found</h1>
    <p>Find the services, programmes and contact details from the homepage.</p>
    <Link href="/" className="button">Return home</Link>
  </section>;
}
