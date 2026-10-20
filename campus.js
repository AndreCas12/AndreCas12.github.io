// ==========================================================================
// LÓGICA COMPLETA DEL CAMPUS VIRTUAL (campus.html)
// ==========================================================================

let usuariosGuardados = JSON.parse(localStorage.getItem('eduskill_usuarios')) || [];
let usuarioActual = null;
let moduloVideoActivo = null;

// Enlaces de YouTube exactos para cada uno de los 3 cursos
const videosCursos = {
    "Ensamble de PC y Hardware": [
        "https://www.youtube.com/embed/0zkX6nlpiSk", // Lección 1: Nate Gentile
        "https://www.youtube.com/embed/A08VOjSa-5w"  // Lección 2: Viccio Tech
    ],
    "Marketing Digital y Redes": [
        "https://www.youtube.com/embed/Ctd6BTuZmjA", // Lección 1: Emprende Aprendiendo (Fórmula)
        "https://www.youtube.com/embed/3AU5sQH3qpU"  // Lección 2: Emprende Aprendiendo (Tendencias)
    ],
    "Seguridad y Salud en el Trabajo": [
        "https://www.youtube.com/embed/y6jhr7QLNug", // Lección 1: Conceptos SG-SST (Udearroba)
        "https://www.youtube.com/embed/78P2KwFJdkI"  // Lección 2: Definición + Ejemplos (info hseQ)
    ]
};

// Cuestionario de 5 preguntas por tema
const bancoPreguntas = {
    "Ensamble de PC y Hardware": [
        { q: "1. ¿Qué componente realiza los cálculos principales del sistema?", options: ["CPU (Procesador)", "Memoria RAM", "Disco Duro"], correct: 0 },
        { q: "2. ¿Qué memoria almacena datos temporales de ejecución?", options: ["ROM", "Memoria RAM", "Disco SSD"], correct: 1 },
        { q: "3. ¿Qué componente suministra energía eléctrica a las piezas?", options: ["Fuente de Poder", "Tarjeta de Video", "Gabinete"], correct: 0 },
        { q: "4. ¿Qué elemento disipa el calor generado por el procesador?", options: ["Cooler / Disipador", "Tarjeta Madre", "Pila CMOS"], correct: 0 },
        { q: "5. ¿Qué interfaz conecta discos de estado sólido M.2 modernos?", options: ["NVMe PCIe", "IDE", "Floppy"], correct: 0 }
    ],
    "Marketing Digital y Redes": [
        { q: "1. ¿Qué representa el concepto de Atención en el marketing digital?", options: ["Captar los ojos del público objetivo", "Comprar seguidores falsos", "Imprimir volantes"], correct: 0 },
        { q: "2. ¿Qué significa la métrica CTR en anuncios publicitarios?", options: ["Click-Through Rate (Porcentaje de clics)", "Cost Per Target", "Conversion Total Rate"], correct: 0 },
        { q: "3. ¿Qué plataforma se utiliza para gestionar pauta publicitaria en Instagram?", options: ["Meta Ads Manager", "Google Search", "TikTok Ads"], correct: 0 },
        { q: "4. ¿Qué representa un Lead en un embudo de ventas?", options: ["Un cliente potencial que dejó sus datos", "Una venta realizada", "Un anuncio pausado"], correct: 0 },
        { q: "5. ¿Qué mide el indicador ROI en una campaña?", options: ["Retorno de Inversión", "Riesgo Operativo", "Radio de Impacto"], correct: 0 }
    ],
    "Seguridad y Salud en el Trabajo": [
        { q: "1. ¿Qué significan las siglas SG-SST?", options: ["Sistema de Gestión de la Seguridad y Salud en el Trabajo", "Servicio General de Salud", "Sistemas Globales de Seguridad"], correct: 0 },
        { q: "2. ¿Qué elemento de protección personal es obligatorio para proteger la cabeza?", options: ["Casco de seguridad", "Gafas de sol", "Tapones auditivos"], correct: 0 },
        { q: "3. ¿Quiénes integran el comité COPASST en la empresa?", options: ["Representantes de los trabajadores y del empleador", "Solo la dirección general", "Clientes externos"], correct: 0 },
        { q: "4. ¿Qué tipo de riesgo abarca las malas posturas y sobreesfuerzos físicos?", options: ["Riesgo ergonómico", "Riesgo eléctrico", "Ruido excesivo"], correct: 0 },
        { q: "5. ¿Cuál es el objetivo principal del SG-SST?", options: ["Prevenir accidentes y enfermedades laborales", "Aumentar impuestos", "Registrar ventas"], correct: 0 }
    ]
};

// 1. TEMA CLARO / OSCURO EN EL CAMPUS
const themeBtn = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('eduskill_theme');

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
        localStorage.setItem('eduskill_theme', theme);
    });
}

// 2. RECUPERACIÓN DE CONTRASEÑA
const forgotLink = document.getElementById('forgotPasswordLink');
if (forgotLink) {
    forgotLink.addEventListener('click', function (e) {
        e.preventDefault();
        const emailPrompt = prompt("🔑 Recuperación de Credenciales:\nIngresa el correo electrónico registrado:");

        if (emailPrompt) {
            const emailLowerCase = emailPrompt.trim().toLowerCase();
            const usuarioEncontrado = usuariosGuardados.find(u => u.email === emailLowerCase);

            if (usuarioEncontrado) {
                const clave = usuarioEncontrado.password || usuarioEncontrado.pass || "123456";
                alert(`✅ ¡Usuario Verificado!\nHola ${usuarioEncontrado.nombre}, tu contraseña registrada es: "${clave}"`);

                const loginEmailInput = document.getElementById('loginEmail');
                const loginPassInput = document.getElementById('loginPass');

                if (loginEmailInput) loginEmailInput.value = usuarioEncontrado.email;
                if (loginPassInput) loginPassInput.value = clave;
            } else {
                alert("❌ No encontramos ninguna cuenta registrada con ese correo electrónico.");
            }
        }
    });
}

// 3. REGISTRO DE USUARIOS
const regForm = document.getElementById('registerForm');
if (regForm) {
    regForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim().toLowerCase();
        const pass = document.getElementById('regPass').value;
        const course = document.getElementById('regCourse').value;

        if (usuariosGuardados.some(u => u.email === email)) {
            alert('⚠️ Este correo ya está registrado. Ingresa en "Iniciar Sesión".');
            return;
        }

        const nuevoUsuario = { nombre: name, email: email, password: pass, curso: course, progreso: 0 };
        usuariosGuardados.push(nuevoUsuario);
        localStorage.setItem('eduskill_usuarios', JSON.stringify(usuariosGuardados));

        alert(`🎉 ¡Cuenta creada con éxito para ${name}!\nPor favor inicia sesión para ingresar.`);
        document.getElementById('registerForm').reset();
        document.getElementById('loginEmail').value = email;
    });
}

// 4. INICIO DE SESIÓN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const pass = document.getElementById('loginPass').value;

        usuarioActual = usuariosGuardados.find(u => u.email === email && (u.password === pass || u.pass === pass));

        if (usuarioActual) {
            actualizarVistaDashboard();
        } else {
            alert('❌ Correo o contraseña incorrectos.');
        }
    });
}

// 5. MOSTRAR PANEL DE CURSO (DASHBOARD)
function actualizarVistaDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'block';

    document.getElementById('userNameDisplay').innerText = usuarioActual.nombre;
    document.getElementById('userCourseDisplay').innerText = usuarioActual.curso;

    const progressBar = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');

    if (progressBar && progressText) {
        progressBar.style.width = usuarioActual.progreso + '%';
        progressText.innerText = `Progreso del curso: ${usuarioActual.progreso}% completado`;
    }

    renderizarModulos(usuarioActual.curso);

    if (usuarioActual.progreso >= 100) {
        mostrarCertificado();
    } else {
        document.getElementById('certificateCanvas').style.display = 'none';
    }
}

// 6. RENDERIZAR MÓDULOS DEL CURSO
function renderizarModulos(curso) {
    const container = document.getElementById('modulesContainer');
    if (!container) return;

    const mod1Estado = usuarioActual.progreso >= 35 ? "Completado ✅" : "Pendiente ⏳";
    const mod2Estado = usuarioActual.progreso >= 70 ? "Completado ✅" : "Pendiente ⏳";
    const mod3Estado = usuarioActual.progreso >= 100 ? "Completado ✅" : "Pendiente ⏳";

    container.innerHTML = `
    <div class="module-item">
      <div class="module-info">
        <h4>Módulo 1: Conceptos Teóricos y Video Lección</h4>
        <small class="${mod1Estado.includes('Completado') ? 'status-completed' : 'status-pending'}">${mod1Estado}</small>
      </div>
      <button class="btn-enroll" onclick="abrirVideoModal(0)">Ver Video Lección 1 🎥</button>
    </div>

    <div class="module-item">
      <div class="module-info">
        <h4>Módulo 2: Procedimientos Prácticos</h4>
        <small class="${mod2Estado.includes('Completado') ? 'status-completed' : 'status-pending'}">${mod2Estado}</small>
      </div>
      <button class="btn-enroll" onclick="abrirVideoModal(1)">Ver Video Lección 2 🎥</button>
    </div>

    <div class="module-item">
      <div class="module-info">
        <h4>Módulo 3: Evaluación Final (5 Preguntas)</h4>
        <small class="${mod3Estado.includes('Completado') ? 'status-completed' : 'status-pending'}">${mod3Estado}</small>
      </div>
      ${usuarioActual.progreso >= 100
            ? `<button class="btn-ai" style="padding: 0.4rem 0.8rem;" onclick="mostrarCertificado()">Ver Mi Certificado 📜</button>`
            : `<button class="btn-ai" style="padding: 0.4rem 0.8rem;" onclick="abrirQuizModal()">Realizar Evaluación 📝</button>`
        }
    </div>
  `;
}

// 7. CONTROL DE VIDEOS MODALES
function abrirVideoModal(index) {
    moduloVideoActivo = index;
    const listado = videosCursos[usuarioActual.curso] || videosCursos["Ensamble de PC y Hardware"];
    const urlVideo = listado[index] || listado[0];

    document.getElementById('videoIframe').src = urlVideo;
    document.getElementById('videoModalTitle').innerText = `Video Lección ${index + 1} - ${usuarioActual.curso}`;
    document.getElementById('videoModal').style.display = 'flex';
}

function cerrarVideoModal() {
    document.getElementById('videoIframe').src = '';
    document.getElementById('videoModal').style.display = 'none';
}

function marcarVideoVisto() {
    if (moduloVideoActivo === 0 && usuarioActual.progreso < 35) usuarioActual.progreso = 35;
    if (moduloVideoActivo === 1 && usuarioActual.progreso < 70) usuarioActual.progreso = 70;

    guardarProgreso();
    cerrarVideoModal();
    actualizarVistaDashboard();
}

// 8. CONTROL DEL CUESTIONARIO (5 PREGUNTAS)
function abrirQuizModal() {
    const preguntas = bancoPreguntas[usuarioActual.curso] || bancoPreguntas["Ensamble de PC y Hardware"];
    const quizContainer = document.getElementById('quizQuestionsContainer');
    quizContainer.innerHTML = '';

    preguntas.forEach((p, idx) => {
        let opcionesHTML = '';
        p.options.forEach((opt, optIdx) => {
            opcionesHTML += `
        <label>
          <input type="radio" name="p${idx}" value="${optIdx}" required /> ${opt}
        </label>
      `;
        });

        quizContainer.innerHTML += `
      <div class="quiz-q-box">
        <p>${p.q}</p>
        ${opcionesHTML}
      </div>
    `;
    });

    document.getElementById('quizModal').style.display = 'flex';
}

function cerrarQuizModal() {
    document.getElementById('quizModal').style.display = 'none';
}

document.getElementById('quizForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const preguntas = bancoPreguntas[usuarioActual.curso] || bancoPreguntas["Ensamble de PC y Hardware"];
    let aciertos = 0;

    preguntas.forEach((p, idx) => {
        const seleccion = document.querySelector(`input[name="p${idx}"]:checked`);
        if (seleccion && parseInt(seleccion.value) === p.correct) {
            aciertos++;
        }
    });

    const puntajeFinal = Math.round((aciertos / 5) * 100);

    if (aciertos >= 4) { // Requiere mínimo 80% (4 de 5)
        alert(`🎉 ¡Excelente trabajo! Tuviste ${aciertos}/5 aciertos (${puntajeFinal}%).\nTu certificado por IA se ha liberado automáticamente.`);
        usuarioActual.progreso = 100;
        usuarioActual.notaFinal = puntajeFinal;
        guardarProgreso();
        cerrarQuizModal();
        actualizarVistaDashboard();
    } else {
        alert(`⚠️ Obtuviste ${aciertos}/5 aciertos (${puntajeFinal}%).\nNecesitas al menos 4 de 5 para aprobar. ¡Repasa los videos e inténtalo de nuevo!`);
    }
});

function guardarProgreso() {
    const index = usuariosGuardados.findIndex(u => u.email === usuarioActual.email);
    if (index !== -1) {
        usuariosGuardados[index] = usuarioActual;
        localStorage.setItem('eduskill_usuarios', JSON.stringify(usuariosGuardados));
    }
}

// 9. MOSTRAR DIPLOMA AL LLEGAR AL 100%
function mostrarCertificado() {
    document.getElementById('outName').innerText = usuarioActual.nombre;
    document.getElementById('outCourse').innerText = usuarioActual.curso;
    document.getElementById('outDate').innerText = new Date().toLocaleDateString('es-CO');
    document.getElementById('outHash').innerText = 'EDUSKILL-' + Math.floor(100000 + Math.random() * 900000) + '-IA';

    const nota = usuarioActual.notaFinal || "100";
    document.getElementById('outAiSummary').innerText = `[IA Analysis]: El estudiante ${usuarioActual.nombre} aprobó la evaluación final con un puntaje de ${nota}%, demostrando dominio completo en ${usuarioActual.curso}.`;

    const certBox = document.getElementById('certificateCanvas');
    certBox.style.display = 'block';
    certBox.scrollIntoView({ behavior: 'smooth' });
}

// 10. DESCARGAR DIPLOMA PDF CON NOMBRE DE CUENTA
document.getElementById('btnDownloadPDF').addEventListener('click', function () {
    const { jsPDF } = window.jspdf;
    const certificateElement = document.getElementById('certificateCanvas');
    const btnDownload = document.getElementById('btnDownloadPDF');

    btnDownload.style.display = 'none';

    html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#172116'
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight - 20);

        const studentName = usuarioActual.nombre.trim().replace(/\s+/g, '_');
        pdf.save(`Certificado_EduSkill_${studentName}.pdf`);

        btnDownload.style.display = 'block';
    });
});

// 11. CERRAR SESIÓN
document.getElementById('btnLogout').addEventListener('click', function () {
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    usuarioActual = null;
});