'use client';

import { useEffect, useState } from 'react';
import { Photo } from '../types';

export default function Csr() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<Boolean>(true);

  async function fetchPhotos() {
    try {
      const response = await fetch(
        'https://picsum.photos/v2/list?page=1&limit=10'
      );

      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error ao buscar fotos:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) return <p>Carregando fotos...</p>;

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Fotos com CSR</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div key={photo?.id}>
            <img
              src={photo?.download_url}
              alt={`Foto de ${photo.author}`}
              className="w-full h-48 object-cover rounded"
            />

            <p className="mt-2">{photo?.author}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
