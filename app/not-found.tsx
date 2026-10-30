import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-head">
      <div className="kicker">404</div>
      <h1>No such sheet</h1>
      <p className="sub">
        <Link href="/">Back to the sheets</Link>
      </p>
    </div>
  );
}
