export function formatTaskDate(dateString: string): string {
  if (!dateString) return 'Data inválida';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Data inválida';
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
