// ==========================================================================
// LÓGICA DE LA PÁGINA PRINCIPAL (index.html)
// ==========================================================================

// 1. Selección rápida de curso al presionar "Inscribirme"
function seleccionarCurso(nombreCurso) {
    const section = document.getElementById('certificador');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// 2. Lógica para el cambio de tema (Claro / Oscuro) con persistencia en localStorage
const themeBtn = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('eduskill_theme');

// Aplicar tema guardado al cargar la página
if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    if (themeBtn) themeBtn.innerText = '☀️';
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');

        let theme = 'dark';
        if (document.body.classList.contains('light-theme')) {
            theme = 'light';
            themeBtn.innerText = '☀️';
        } else {
            themeBtn.innerText = '🌙';
        }

        // Guardar preferencia en el navegador
        localStorage.setItem('eduskill_theme', theme);
    });
}