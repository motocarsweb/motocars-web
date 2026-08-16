export type MonedaImporte =
  | "ARS"
  | "USD";

const UNIDADES = [
  "",
  "uno",
  "dos",
  "tres",
  "cuatro",
  "cinco",
  "seis",
  "siete",
  "ocho",
  "nueve",
];

const ESPECIALES: Record<number, string> = {
  10: "diez",
  11: "once",
  12: "doce",
  13: "trece",
  14: "catorce",
  15: "quince",
  16: "dieciséis",
  17: "diecisiete",
  18: "dieciocho",
  19: "diecinueve",
  20: "veinte",
  21: "veintiuno",
  22: "veintidós",
  23: "veintitrés",
  24: "veinticuatro",
  25: "veinticinco",
  26: "veintiséis",
  27: "veintisiete",
  28: "veintiocho",
  29: "veintinueve",
};

const DECENAS = [
  "",
  "",
  "veinte",
  "treinta",
  "cuarenta",
  "cincuenta",
  "sesenta",
  "setenta",
  "ochenta",
  "noventa",
];

const CENTENAS = [
  "",
  "ciento",
  "doscientos",
  "trescientos",
  "cuatrocientos",
  "quinientos",
  "seiscientos",
  "setecientos",
  "ochocientos",
  "novecientos",
];

function convertirMenorMil(
  numero: number
): string {
  if (numero === 0) {
    return "";
  }

  if (numero === 100) {
    return "cien";
  }

  let resultado = "";

  const centenas =
    Math.floor(
      numero / 100
    );

  const restoCentenas =
    numero % 100;

  if (centenas > 0) {
    resultado =
      CENTENAS[centenas];
  }

  if (
    restoCentenas === 0
  ) {
    return resultado;
  }

  if (resultado) {
    resultado += " ";
  }

  if (
    restoCentenas < 10
  ) {
    return (
      resultado +
      UNIDADES[
        restoCentenas
      ]
    );
  }

  if (
    restoCentenas <= 29
  ) {
    return (
      resultado +
      ESPECIALES[
        restoCentenas
      ]
    );
  }

  const decena =
    Math.floor(
      restoCentenas / 10
    );

  const unidad =
    restoCentenas % 10;

  resultado +=
    DECENAS[decena];

  if (unidad > 0) {
    resultado +=
      ` y ${UNIDADES[unidad]}`;
  }

  return resultado;
}

function apocoparUno(
  texto: string
): string {
  return texto
    .replace(
      /veintiuno$/u,
      "veintiún"
    )
    .replace(
      / y uno$/u,
      " y un"
    )
    .replace(
      /uno$/u,
      "un"
    );
}

function convertirEntero(
  numero: number
): string {
  if (numero === 0) {
    return "cero";
  }

  if (numero < 0) {
    return `menos ${convertirEntero(
      Math.abs(numero)
    )}`;
  }

  if (numero < 1000) {
    return convertirMenorMil(
      numero
    );
  }

  if (
    numero <
    1_000_000
  ) {
    const miles =
      Math.floor(
        numero / 1000
      );

    const resto =
      numero % 1000;

    const textoMiles =
      miles === 1
        ? "mil"
        : `${apocoparUno(
            convertirEntero(
              miles
            )
          )} mil`;

    return resto
      ? `${textoMiles} ${convertirMenorMil(
          resto
        )}`
      : textoMiles;
  }

  if (
    numero <
    1_000_000_000_000
  ) {
    const millones =
      Math.floor(
        numero /
          1_000_000
      );

    const resto =
      numero %
      1_000_000;

    const textoMillones =
      millones === 1
        ? "un millón"
        : `${apocoparUno(
            convertirEntero(
              millones
            )
          )} millones`;

    return resto
      ? `${textoMillones} ${convertirEntero(
          resto
        )}`
      : textoMillones;
  }

  throw new Error(
    "El importe es demasiado grande para convertirlo a letras."
  );
}

export function numeroALetras(
  numero: number
): string {
  if (
    !Number.isFinite(
      numero
    )
  ) {
    return "";
  }

  const entero =
    Math.trunc(
      Math.abs(numero)
    );

  return convertirEntero(
    entero
  );
}

export function importeEnLetras(
  importe: number,
  moneda: MonedaImporte = "ARS"
): string {
  if (
    !Number.isFinite(
      importe
    )
  ) {
    return "";
  }

  const absoluto =
    Math.abs(importe);

  const entero =
    Math.trunc(
      absoluto
    );

  const centavos =
    Math.round(
      (
        absoluto -
        entero
      ) * 100
    );

  let texto =
    apocoparUno(
      convertirEntero(
        entero
      )
    );

  texto =
    moneda === "USD"
      ? `dólares estadounidenses ${texto}`
      : `pesos ${texto}`;

  if (centavos > 0) {
    texto +=
      ` con ${centavos
        .toString()
        .padStart(
          2,
          "0"
        )}/100`;
  }

  if (importe < 0) {
    texto =
      `menos ${texto}`;
  }

  return texto;
}

export function formatearImporteCompleto(
  importe: number,
  moneda: MonedaImporte = "ARS"
): string {
  if (
    !Number.isFinite(
      importe
    )
  ) {
    return "—";
  }

  const numero =
    new Intl.NumberFormat(
      "es-AR",
      {
        style:
          "currency",

        currency:
          moneda,

        minimumFractionDigits:
          Number.isInteger(
            importe
          )
            ? 0
            : 2,

        maximumFractionDigits:
          2,
      }
    ).format(
      importe
    );

  return `${numero} (${importeEnLetras(
    importe,
    moneda
  )})`;
}