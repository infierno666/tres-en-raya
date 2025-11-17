// Definiciones de Iconos de Font Awesome
const X_ICON = '<i class="fa-solid fa-xmark"></i>';
const O_ICON = '<i class="fa-regular fa-circle"></i>';
const X_COLOR_CLASS = 'color-x';
const O_COLOR_CLASS = 'color-o';

// Clases de Brillo
const X_GLOW_CLASS = 'glow-pink';
const O_GLOW_CLASS = 'glow-cyan';
const WINNER_ICON_CLASS = 'winner-icon-glow';

// Clases para el resaltado limpio de las celdas ganadoras 
const WIN_CELL_X_CLASS = 'win-cell-x';
const WIN_CELL_O_CLASS = 'win-cell-o';

// Variables de Estado del Juego
let tablero = ["", "", "", "", "", "", "", "", ""];
let turno = "X";
let juegoActivo = true;
let modoMaquina = false;

// Variables de Puntuación
let puntuacionX = 0;
let puntuacionO = 0;

// Combinaciones ganadoras (índices del array 'tablero')
const combinacionesGanadoras = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Función para actualizar el marcador en la interfaz
function actualizarPuntuacionDisplay() {
    $("#score-x").text(puntuacionX);
    $("#score-o").text(puntuacionO);

    const labelO = modoMaquina ? 'MÁQUINA' : 'JUGADOR O';
    const playerOLabel = $('#marcador .text-center').eq(2).find('.text-sm');
    playerOLabel.text(labelO);
}

// Función para verificar si hay un ganador
function comprobarGanador() {
    for (const combinacion of combinacionesGanadoras) {
        const [a, b, c] = combinacion;
        if (tablero[a] && tablero[a] === tablero[b] && tablero[a] === tablero[c]) {
            juegoActivo = false;

            // 1. Aumentar puntuación
            const ganadorSimbolo = tablero[a];
            if (ganadorSimbolo === "X") {
                puntuacionX++;
            } else {
                puntuacionO++;
            }
            actualizarPuntuacionDisplay();

            // 2. Destacar las celdas ganadoras con el fondo suave y el brillo del icono
            const cellWinClass = ganadorSimbolo === "X" ? WIN_CELL_X_CLASS : WIN_CELL_O_CLASS;
            const ganadorGlowClass = ganadorSimbolo === "X" ? X_GLOW_CLASS : O_GLOW_CLASS;

            $(`#c${a}, #c${b}, #c${c}`)
                .find('i').addClass(WINNER_ICON_CLASS).addClass(ganadorGlowClass)
                .end()
                .addClass(cellWinClass);

            // 3. Mostrar resultado
            const ganadorTexto = ganadorSimbolo === "X" ? "Jugador X" : (modoMaquina ? "Máquina (O)" : "Jugador O");
            const mensajeColorClass = ganadorSimbolo === "X" ? X_COLOR_CLASS : O_COLOR_CLASS;

            // Sombra de énfasis en el tablero (Neon)
            const cleanShadowClass = ganadorSimbolo === "X" ?
                'shadow-[0_0_30px_rgba(255,56,112,0.5)]' :
                'shadow-[0_0_30px_rgba(0,240,255,0.6)]';

            $("#mensaje-resultado").html(`<i class="fa-solid fa-trophy mr-2"></i> ¡${ganadorTexto} ha ganado!`).removeClass('hidden').addClass(mensajeColorClass);
            $("#reiniciar, #volver-menu, #reset-score").removeClass('hidden');
            $("#indicador-turno").addClass('hidden');

            // 4. Resaltar el tablero con la sombra
            $('#tablero').addClass(cleanShadowClass);
            return true;
        }
    }
    return false;
}

// Función para verificar si hay empate
function comprobarEmpate() {
    if (!comprobarGanador() && tablero.every(celda => celda !== "")) {
        juegoActivo = false;
        $("#mensaje-resultado").html(`<i class="fa-solid fa-handshake mr-2"></i> ¡Empate!`).removeClass('hidden').addClass('text-text-primary');
        $("#reiniciar, #volver-menu, #reset-score").removeClass('hidden');
        $("#indicador-turno").addClass('hidden');
        // Sombra de empate sutil (gris neutro)
        $('#tablero').addClass('shadow-[0_0_15px_rgba(0,0,0,0.15)]');
        return true;
    }
    return false;
}

// Función para cambiar el turno
function cambiarTurno() {
    turno = turno === "X" ? "O" : "X";

    const colorClass = turno === "X" ? X_COLOR_CLASS : O_COLOR_CLASS;
    const turnoHTML = `<span id="turno-actual" class="${colorClass}">${turno}</span>`;

    if (modoMaquina && juegoActivo && turno === "O") {
        $("#indicador-turno").html(`CPU Pensando... <i class="fa-solid fa-hourglass-half ml-1 animate-spin cpu-thinking"></i>`);
        setTimeout(movimientoMaquina, 1000);
    } else {
        $("#indicador-turno").html(`Turno: ${turnoHTML}`);
    }
}

// Lógica de la Máquina (IA Simple) - Mantenida
function obtenerJugada(simbolo) {
    for (const combinacion of combinacionesGanadoras) {
        const [a, b, c] = combinacion;
        const celdas = [tablero[a], tablero[b], tablero[c]];
        if (celdas.filter(val => val === simbolo).length === 2) {
            const indiceVacio = combinacion.find(i => tablero[i] === "");
            if (indiceVacio !== undefined) {
                return indiceVacio;
            }
        }
    }
    return -1;
}

function movimientoMaquina() {
    let jugadaGanadora = obtenerJugada("O");
    if (jugadaGanadora !== -1) {
        realizarMovimiento(jugadaGanadora);
        return;
    }

    let jugadaBloqueo = obtenerJugada("X");
    if (jugadaBloqueo !== -1) {
        realizarMovimiento(jugadaBloqueo);
        return;
    }

    if (tablero[4] === "") {
        realizarMovimiento(4);
        return;
    }

    const esquinas = [0, 2, 6, 8].filter(index => tablero[index] === "");
    if (esquinas.length > 0) {
        let jugadaEsquina = esquinas[Math.floor(Math.random() * esquinas.length)];
        realizarMovimiento(jugadaEsquina);
        return;
    }

    let celdasDisponibles = tablero.map((val, index) => val === "" ? index : -1).filter(index => index !== -1);
    if (celdasDisponibles.length > 0) {
        let jugadaAleatoria = celdasDisponibles[Math.floor(Math.random() * celdasDisponibles.length)];
        realizarMovimiento(jugadaAleatoria);
        return;
    }
}


// ----------------------------------------------------
// Manejo de Movimiento y Eventos
// ----------------------------------------------------

function realizarMovimiento(index) {
    const celda = $(`#c${index}`);

    if (juegoActivo && tablero[index] === "") {

        tablero[index] = turno;

        const icono = turno === "X" ? X_ICON : O_ICON;
        const colorClass = turno === "X" ? X_COLOR_CLASS : O_COLOR_CLASS;
        const glowClass = turno === "X" ? X_GLOW_CLASS : O_GLOW_CLASS;

        // Añadir la clase glow al ícono
        celda.html(icono).addClass(colorClass).addClass(glowClass).addClass("ocupada").css('opacity', '0').animate({ opacity: 1 }, 300);

        if (comprobarGanador() || comprobarEmpate()) {
            return;
        }

        cambiarTurno();
    }
}

// Función para reiniciar el tablero, NO los puntos
function reiniciarJuego() {
    tablero = ["", "", "", "", "", "", "", "", ""];
    turno = "X";
    juegoActivo = true;

    // Limpiar celdas, incluyendo las clases de color y brillo
    $(".celda")
        .empty()
        .removeClass(`ocupada ${X_COLOR_CLASS} ${O_COLOR_CLASS} ${WIN_CELL_X_CLASS} ${WIN_CELL_O_CLASS} ${X_GLOW_CLASS} ${O_GLOW_CLASS}`);

    // Limpiar el efecto de pulso del icono
    $(".celda i").removeClass(WINNER_ICON_CLASS);

    // Restablecer estilos del tablero (eliminar sombras de ganador/empate)
    $('#tablero').removeClass('shadow-[0_0_30px_rgba(255,56,112,0.5)] shadow-[0_0_30px_rgba(0,240,255,0.6)] shadow-[0_0_15px_rgba(0,0,0,0.15)]');

    // Restablecer mensajes y botones
    $("#mensaje-resultado").addClass('hidden').removeClass('color-x color-o text-text-primary');

    $("#indicador-turno").removeClass('hidden');

    // Resetear indicador de turno a X (rosa)
    const initialColorClass = X_COLOR_CLASS;
    const turnoHTML = `<span id="turno-actual" class="${initialColorClass}">X</span>`;
    $("#indicador-turno").html(`Turno: ${turnoHTML}`);

    if (modoMaquina && turno === "O") {
        cambiarTurno();
    }
}

// Función para resetear solo la puntuación
function resetearPuntuacion() {
    puntuacionX = 0;
    puntuacionO = 0;
    actualizarPuntuacionDisplay();
    reiniciarJuego(); // Reinicia el tablero también
    $("#reset-score").addClass('hidden');
}

// Función para volver al menú principal
function volverAlMenu() {
    resetearPuntuacion();
    $("#juego-contenedor").fadeOut(300, function () {
        $("#modo-selector").fadeIn(300);
    });
}

// Lógica de inicialización al cargar el documento
$(document).ready(function () {

    actualizarPuntuacionDisplay();

    $(".celda").on("click", function () {
        if (!juegoActivo) return;

        const id = $(this).attr("id");
        const index = parseInt(id.substring(1));

        if (modoMaquina && turno === "O") return;

        realizarMovimiento(index);
    });

    $("#reiniciar").on("click", reiniciarJuego);
    $("#volver-menu").on("click", volverAlMenu);
    $("#reset-score").on("click", resetearPuntuacion);

    $("#modo-2-jugadores").on("click", function () {
        modoMaquina = false;
        $("#modo-selector").fadeOut(300, function () {
            $("#juego-contenedor").fadeIn(300);
            resetearPuntuacion();
            $("#volver-menu, #reset-score").removeClass('hidden');
            actualizarPuntuacionDisplay();
        });
    });

    $("#modo-vs-maquina").on("click", function () {
        modoMaquina = true;
        $("#modo-selector").fadeOut(300, function () {
            $("#juego-contenedor").fadeIn(300);
            resetearPuntuacion();
            $("#volver-menu, #reset-score").removeClass('hidden');
            actualizarPuntuacionDisplay();
        });
    });

});