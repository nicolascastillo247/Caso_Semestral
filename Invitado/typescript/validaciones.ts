type TipoValidacion =
    | "login"
    | "registro"
    | "recuperar"
    | "perfil"
    | "password"
    | "checkout"
    | "devolucion"
    | "ticket"
    | "resena"
    | "catalogo";

function obtenerCampo<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    formulario: HTMLFormElement,
    selector: string
): T | null {
    return formulario.querySelector<T>(selector);
}

function limpiarValidez(formulario: HTMLFormElement): void {
    formulario.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea"
    ).forEach((campo) => {
        campo.setCustomValidity("");
    });
}

function asegurarFeedback(formulario: HTMLFormElement): void {
    formulario.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input[required], select[required], textarea[required]"
    ).forEach((campo) => {
        const contenedor = campo.parentElement;

        if (!contenedor || contenedor.querySelector(".invalid-feedback")) {
            return;
        }

        const mensaje = document.createElement("div");
        mensaje.className = "invalid-feedback";
        mensaje.textContent = "Revisa este campo antes de continuar.";
        contenedor.appendChild(mensaje);
    });
}

function validarRut(rut: string): boolean {
    const limpio = rut
        .replace(/\./g, "")
        .replace(/-/g, "")
        .trim()
        .toUpperCase();

    if (!/^\d{7,8}[0-9K]$/.test(limpio)) {
        return false;
    }

    const cuerpo = limpio.slice(0, -1);
    const dvIngresado = limpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resultado = 11 - (suma % 11);
    let dvCalculado = "";

    if (resultado === 11) {
        dvCalculado = "0";
    } else if (resultado === 10) {
        dvCalculado = "K";
    } else {
        dvCalculado = String(resultado);
    }

    return dvIngresado === dvCalculado;
}

function validarPassword(password: string): boolean {
    return password.length >= 8 &&
           /[A-Za-z]/.test(password) &&
           /\d/.test(password);
}

function validarFormularioEspecifico(
    formulario: HTMLFormElement,
    tipo: TipoValidacion
): void {
    if (tipo === "registro") {
        const password = obtenerCampo<HTMLInputElement>(formulario, "#password");
        const confirmar = obtenerCampo<HTMLInputElement>(formulario, "#confirm_password");

        if (password && !validarPassword(password.value)) {
            password.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres, una letra y un número."
            );
        }

        if (password && confirmar && password.value !== confirmar.value) {
            confirmar.setCustomValidity("Las contraseñas no coinciden.");
        }
    }

    if (tipo === "perfil") {
        const rut = obtenerCampo<HTMLInputElement>(formulario, "#rut");

        if (rut && !validarRut(rut.value)) {
            rut.setCustomValidity("Ingresa un RUT válido.");
        }
    }

    if (tipo === "password") {
        const password = obtenerCampo<HTMLInputElement>(formulario, "#password");
        const confirmar = obtenerCampo<HTMLInputElement>(formulario, "#confirmar");

        if (password && !validarPassword(password.value)) {
            password.setCustomValidity(
                "La contraseña debe tener mínimo 8 caracteres, una letra y un número."
            );
        }

        if (password && confirmar && password.value !== confirmar.value) {
            confirmar.setCustomValidity("Las contraseñas no coinciden.");
        }
    }

    if (tipo === "catalogo") {
        const minimo = obtenerCampo<HTMLInputElement>(formulario, "#precio_min");
        const maximo = obtenerCampo<HTMLInputElement>(formulario, "#precio_max");

        if (minimo && maximo && minimo.value !== "" && maximo.value !== "") {
            if (Number(minimo.value) > Number(maximo.value)) {
                maximo.setCustomValidity(
                    "El precio máximo debe ser mayor o igual al precio mínimo."
                );
            }
        }
    }

    if (tipo === "login") {
        const password = obtenerCampo<HTMLInputElement>(formulario, "#password");

        if (password && password.value.trim().length < 8) {
            password.setCustomValidity(
                "La contraseña debe tener al menos 8 caracteres."
            );
        }
    }
}

function activarValidacion(formulario: HTMLFormElement): void {
    const tipo = (formulario.dataset.validacion || "") as TipoValidacion;

    asegurarFeedback(formulario);

    formulario.addEventListener("submit", (evento: SubmitEvent) => {
        limpiarValidez(formulario);

        if (tipo) {
            validarFormularioEspecifico(formulario, tipo);
        }

        if (!formulario.checkValidity()) {
            evento.preventDefault();
            evento.stopPropagation();
        }

        formulario.classList.add("was-validated");
    });

    formulario.addEventListener("input", () => {
        limpiarValidez(formulario);

        if (tipo) {
            validarFormularioEspecifico(formulario, tipo);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document
        .querySelectorAll<HTMLFormElement>("form[data-validacion]")
        .forEach((formulario) => activarValidacion(formulario));
});
