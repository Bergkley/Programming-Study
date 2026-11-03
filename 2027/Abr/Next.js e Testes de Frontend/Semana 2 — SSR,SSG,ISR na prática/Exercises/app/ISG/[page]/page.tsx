import { Photo, Props } from '@/app/types';
import axios from 'axios';

export const revalidate = 60;

export async function generateStaticParams() {
  return [
    { page: '1' },
    { page: '2' },
    { page: '3' },
    { page: '4' },
    { page: '5' },
  ];
}

export default async function ISG({ params }: Props) {
  const { page } = await params;

  let photos: Photo[] = [];

  try {
    const { data } = await axios.get<Photo[]>(
      `https://picsum.photos/v2/list?page=${page}&limit=10`
    );

    photos = data;
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Fotos com ISG - Página {page}</h1>

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
