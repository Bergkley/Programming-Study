type Photo = {
  id: string;
  author: string;
  download_url: string;
};

type Props = {
  params: Promise<{ page: string }>;
};

export type { Photo, Props };
