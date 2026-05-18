// ==========================================
// CONFIGURACIÓN DE IMÁGENES (Por defecto)
// ==========================================
const DEFAULT_IMG_X = 'images/yo.png';
const DEFAULT_IMG_O = 'images/ia.png';

let imgX_URL = DEFAULT_IMG_X;
let imgO_URL = DEFAULT_IMG_O;

const getIconX = () => `<img src="${imgX_URL}" alt="X" class="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] shadow-img-x pointer-events-none">`;
const getIconO = () => `<img src="${imgO_URL}" alt="O" class="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] shadow-img-o pointer-events-none">`;

// ==========================================
// ESTADO DEL JUEGO
// ==========================================
let tablero = ["", "", "", "", "", "", "", "", ""];
let turno = "X";
let jugadorInicial = "X";
let juegoActivo = true;
let modoMaquina = false;
let puntuacionX = 0;
let puntuacionO = 0;

const combinacionesGanadoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// ==========================================
// LÓGICA DEL MOTOR (Evaluación)
// ==========================================
function evaluarTablero(tableroActual) {
    for (let combinacion of combinacionesGanadoras) {
        const [a, b, c] = combinacion;
        if (tableroActual[a] && tableroActual[a] === tableroActual[b] && tableroActual[a] === tableroActual[c]) {
            return { ganador: tableroActual[a], line: combinacion };
        }
    }
    if (!tableroActual.includes("")) return { ganador: "Empate", line: [] };
    return null;
}

// ==========================================
// ALGORITMO MINIMAX (IA Invencible)
// ==========================================
function minimax(tableroSimulado, profundidad, esMaximizando) {
    let estado = evaluarTablero(tableroSimulado);

    if (estado !== null) {
        if (estado.ganador === "O") return 10 - profundidad;
        if (estado.ganador === "X") return profundidad - 10;
        return 0;
    }

    if (esMaximizando) {
        let mejorPuntuacion = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (tableroSimulado[i] === "") {
                tableroSimulado[i] = "O";
                let puntuacion = minimax(tableroSimulado, profundidad + 1, false);
                tableroSimulado[i] = "";
                mejorPuntuacion = Math.max(puntuacion, mejorPuntuacion);
            }
        }
        return mejorPuntuacion;
    } else {
        let mejorPuntuacion = Infinity;
        for (let i = 0; i < 9; i++) {
            if (tableroSimulado[i] === "") {
                tableroSimulado[i] = "X";
                let puntuacion = minimax(tableroSimulado, profundidad + 1, true);
                tableroSimulado[i] = "";
                mejorPuntuacion = Math.min(puntuacion, mejorPuntuacion);
            }
        }
        return mejorPuntuacion;
    }
}

function movimientoMaquinaImparable() {
    let mejorPuntuacion = -Infinity;
    let mejorMovimiento;

    if (tablero.filter(c => c === "").length === 9 || (tablero.filter(c => c === "").length === 8 && tablero[4] === "")) {
        mejorMovimiento = 4;
    } else {
        for (let i = 0; i < 9; i++) {
            if (tablero[i] === "") {
                tablero[i] = "O";
                let puntuacion = minimax(tablero, 0, false);
                tablero[i] = "";
                if (puntuacion > mejorPuntuacion) {
                    mejorPuntuacion = puntuacion;
                    mejorMovimiento = i;
                }
            }
        }
    }
    realizarMovimiento(mejorMovimiento);
}

// ==========================================
// INTERFAZ DE USUARIO (DOM)
// ==========================================
function actualizarPuntuacionDisplay() {
    $("#score-x").text(puntuacionX);
    $("#score-o").text(puntuacionO);

    const labelX = modoMaquina ? 'TÚ' : 'JUGADOR 1';
    const labelO = modoMaquina ? 'MÁQUINA' : 'JUGADOR 2';

    $('#marcador div:first-child span:first-child').text(labelX);
    $('#marcador div:last-child span:first-child').text(labelO);
}

function actualizarIndicadorTurno() {
    let textoTurno = "";
    const textColorClass = turno === "X" ? "text-player-x" : "text-player-o";

    if (modoMaquina) {
        textoTurno = turno === "X" ? "Tu turno" : "Turno de la máquina";
    } else {
        textoTurno = turno === "X" ? "Turno del Jugador 1" : "Turno del Jugador 2";
    }

    $("#indicador-turno").html(`<span class="${textColorClass} font-bold">${textoTurno}</span>`);
}

function cambiarTurno() {
    turno = turno === "X" ? "O" : "X";
    actualizarIndicadorTurno();

    if (modoMaquina && juegoActivo && turno === "O") {
        setTimeout(movimientoMaquinaImparable, 500);
    }
}

function manejarFinDelJuego(estado) {
    juegoActivo = false;

    $("#indicador-turno").addClass('hidden');
    $("#mensaje-resultado").removeClass('hidden text-player-x text-player-o text-gray-400');
    $("#reiniciar, #reset-score, #volver-menu").removeClass('hidden').css('display', 'flex');

    if (estado.ganador === "Empate") {
        $("#mensaje-resultado").text("Empate").addClass('text-gray-400 animate-fade-in');
    } else {
        if (estado.ganador === "X") {
            puntuacionX++;
            const textoWinX = modoMaquina ? "Has ganado" : "Jugador 1 gana";
            $("#mensaje-resultado").text(textoWinX).addClass('text-player-x animate-fade-in');
        } else {
            puntuacionO++;
            const textoWinO = modoMaquina ? "La máquina gana" : "Jugador 2 gana";
            $("#mensaje-resultado").text(textoWinO).addClass('text-player-o animate-fade-in');
        }

        actualizarPuntuacionDisplay();

        const bgWinClass = estado.ganador === "X" ? "win-cell-x" : "win-cell-o";
        estado.line.forEach(index => {
            $(`#c${index}`).addClass(bgWinClass);
        });
    }
}

function realizarMovimiento(index) {
    if (juegoActivo && tablero[index] === "") {
        tablero[index] = turno;

        // Aquí generamos el HTML con la imagen actual (sea la subida o la por defecto)
        const iconoHTML = turno === "X" ? getIconX() : getIconO();
        const celda = $(`#c${index}`);

        celda.html(iconoHTML).addClass("ocupada p-0 relative");

        celda.find('img').css({ opacity: 0, transform: 'scale(0.8)' }).animate(
            { opacity: 1 },
            {
                duration: 200,
                step: function (now, fx) {
                    if (fx.prop === "opacity") { $(this).css('transform', `scale(${0.8 + (now * 0.2)})`); }
                }
            }
        );

        let estado = evaluarTablero(tablero);
        if (estado) {
            manejarFinDelJuego(estado);
        } else {
            cambiarTurno();
        }
    }
}

function reiniciarJuego() {
    tablero = ["", "", "", "", "", "", "", "", ""];

    jugadorInicial = jugadorInicial === "X" ? "O" : "X";
    turno = jugadorInicial;
    juegoActivo = true;

    $(".celda").empty().removeClass("ocupada p-0 relative win-cell-x win-cell-o");

    $("#mensaje-resultado").addClass('hidden').removeClass('text-player-x text-player-o text-gray-400');
    $("#indicador-turno").removeClass('hidden');

    actualizarIndicadorTurno();
    $("#reiniciar").addClass('hidden');

    if (modoMaquina && turno === "O") {
        setTimeout(movimientoMaquinaImparable, 500);
    }
}

function resetearPuntuacion() {
    puntuacionX = 0;
    puntuacionO = 0;
    jugadorInicial = "O";
    actualizarPuntuacionDisplay();
    reiniciarJuego();
}

function volverAlMenu() {
    resetearPuntuacion();

    // Restaurar imágenes por defecto al volver al menú principal
    imgX_URL = DEFAULT_IMG_X;
    imgO_URL = DEFAULT_IMG_O;
    $("#preview-x").attr("src", DEFAULT_IMG_X);
    $("#preview-o").attr("src", DEFAULT_IMG_O);
    $("#upload-x, #upload-o").val('');

    $("#juego-contenedor, #config-local").fadeOut(300, function () {
        $("#modo-selector").fadeIn(300);
        $("#reset-score, #volver-menu, #reiniciar").addClass('hidden');
    });
}

// ==========================================
// INICIALIZACIÓN Y EVENTOS DE CARGA DE FOTOS
// ==========================================
$(document).ready(function () {
    actualizarPuntuacionDisplay();

    // 1. Manejo de subida de imagen para Jugador 1 (X)
    $("#upload-x").on("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                imgX_URL = event.target.result; // Guarda la imagen convertida en código
                $("#preview-x").attr("src", imgX_URL); // Actualiza la vista previa
            }
            reader.readAsDataURL(file);
        }
    });

    // 2. Manejo de subida de imagen para Jugador 2 (O)
    $("#upload-o").on("change", function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                imgO_URL = event.target.result;
                $("#preview-o").attr("src", imgO_URL);
            }
            reader.readAsDataURL(file);
        }
    });

    // 3. Evento clic en las celdas
    $(".celda").on("click", function () {
        if (!juegoActivo || (modoMaquina && turno === "O")) return;
        const index = parseInt($(this).attr("id").substring(1));
        realizarMovimiento(index);
    });

    $("#reiniciar").on("click", reiniciarJuego);
    $("#volver-menu").on("click", volverAlMenu);
    $("#volver-menu-config").on("click", volverAlMenu); // Botón de atrás en la config
    $("#reset-score").on("click", resetearPuntuacion);

    // 4. Flujo de pantallas
    $("#modo-2-jugadores").on("click", function () {
        modoMaquina = false;
        // En lugar de ir directo al juego, vamos a la pantalla de subir fotos
        $("#modo-selector").fadeOut(300, function () {
            $("#config-local").fadeIn(300).css('display', 'flex');
        });
    });

    $("#modo-vs-maquina").on("click", function () {
        modoMaquina = true;
        // Contra la IA no subimos fotos, va directo al juego con las de defecto
        iniciarPantallaJuego();
    });

    $("#iniciar-duelo-btn").on("click", function () {
        // Ocultar config y mostrar juego
        $("#config-local").fadeOut(300, function () {
            iniciarPantallaJuego();
        });
    });

    function iniciarPantallaJuego() {
        $("#modo-selector").hide();
        $("#juego-contenedor").fadeIn(300);
        resetearPuntuacion();
        $("#reset-score, #volver-menu").removeClass('hidden').css('display', 'flex');
    }
});