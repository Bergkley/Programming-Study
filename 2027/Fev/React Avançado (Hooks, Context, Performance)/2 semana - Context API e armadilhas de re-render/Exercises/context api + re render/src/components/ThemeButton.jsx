export default function ThemeButton({ theme, setTheme }) {
  console.log('ThemeButton renderizou');

  function handleTheme() {
    setTheme(currentTheme => (currentTheme === 'light' ? 'dark' : 'light'));
  }

  return (
    <div>
      <p>Tema atual: {theme}</p>

      <button onClick={handleTheme}>Alternar tema</button>
    </div>
  );
}
