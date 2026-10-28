'use client';
import { useParams } from 'next/navigation';
export default function Home() {
  const params = useParams();
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1> Produtos: {params.id} </h1>
    </main>
  );
}
