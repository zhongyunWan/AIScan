import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main style={{ padding: "40px 16px", maxWidth: 720, margin: "0 auto" }}>
      <h1>页面不存在</h1>
      <p>请检查日期格式，或返回今天的日报页面。</p>
      <Link href="/">返回首页</Link>
    </main>
  );
}
