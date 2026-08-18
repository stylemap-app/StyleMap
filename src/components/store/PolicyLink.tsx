import Link from "next/link";

export default function PolicyLink() {
  return (
    <Link
      href="/policy"
      className="block text-center text-[11px] text-gray-600 py-1 active:opacity-70"
    >
      掲載について
    </Link>
  );
}
