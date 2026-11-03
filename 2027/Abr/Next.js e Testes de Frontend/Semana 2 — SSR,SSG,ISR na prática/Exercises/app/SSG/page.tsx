import { Photo } from '@/app/types';
import axios from 'axios';

export const dynamic = 'force-static';

export default async function SSG() {
  let photos: Photo[] = [];

  try {
    const { data } = await axios.get<Photo[]>(
      'https://picsum.photos/v2/list?page=10&limit=10'
    );

    photos = data;
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Fotos com SSG</h1>

      {photos.length === 0 ? (
        <p>Nenhuma foto encontrada.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id}>
              <img
                src={photo.download_url}
                alt={`Foto de ${photo.author}`}
                className="w-full h-48 object-cover rounded"
              />
              <p className="mt-2">{photo.author}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
