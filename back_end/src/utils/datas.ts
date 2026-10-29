// Data de hoje (AAAA-MM-DD) no fuso de São Paulo, independente do fuso do servidor
export function hojeNoBrasil() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

// mes de 1 a 12
export function ultimoDiaDoMes(ano: number, mes: number):number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}
