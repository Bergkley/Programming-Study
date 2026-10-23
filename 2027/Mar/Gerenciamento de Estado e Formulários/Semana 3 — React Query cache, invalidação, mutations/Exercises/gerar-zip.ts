import JSZip from 'jszip';

const zip = new JSZip();

async function gerarZip() {
  zip.file('README.txt', 'ZIP de teste criado no StackBlitz.');

  const conteudo = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
  });

  const url = URL.createObjectURL(conteudo);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'projeto.zip';
  link.click();

  URL.revokeObjectURL(url);

  console.log('Download iniciado!');
}

gerarZip();
