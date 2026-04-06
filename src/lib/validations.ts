export function validarEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
}

export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, "");
  // Brasil: (DDD) 9XXXX-XXXX ou (DDD) XXXX-XXXX
  return /^(?:[1-9][1-9])(?:9[1-9][0-9]{3}|[2-9][0-9]{3})[0-9]{4}$/.test(numeros);
}

export function formatarTelefone(telefone: string): string {
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11)
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}
