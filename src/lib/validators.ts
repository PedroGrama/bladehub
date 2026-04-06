/**
 * Validadores e máscaras para campos do sistema
 * Reutilizável em todo o projeto
 */

// ────────────────────────────────────────────────────────────
// VALIDADORES
// ────────────────────────────────────────────────────────────

export const validators = {
  /**
   * Valida email no padrão RFC 5322 simplificado
   */
  email: (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim()) && email.length <= 255;
  },

  /**
   * Valida telefone brasileiro (11) 99999-9999 ou (11) 3999-9999
   */
  phone: (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    // Brasil: (DDD) 9XXXX-XXXX ou (DDD) XXXX-XXXX
    return /^(?:[1-9][1-9])(?:9[1-9][0-9]{3}|[2-9][0-9]{3})[0-9]{4}$/.test(cleaned);
  },

  /**
   * Valida CNPJ (formato: XX.XXX.XXX/XXXX-XX)
   */
  cnpj: (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, "");
    if (cleaned.length !== 14) return false;

    let size = cleaned.length - 2;
    let numbers = cleaned.substring(0, size);
    let digits = cleaned.substring(size);
    let sum = 0;
    let pos = 0;

    for (let i = size - 7; i >= 0; i--) {
      sum += parseInt(numbers.charAt(size - 7 - i), 10) * (pos + 2);
      if (++pos % 8 === 0) pos = 0;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0), 10)) return false;

    size = size - 1;
    numbers = cleaned.substring(0, size);
    sum = 0;
    pos = 0;

    for (let i = size - 7; i >= 0; i--) {
      sum += parseInt(numbers.charAt(size - 7 - i), 10) * (pos + 2);
      if (++pos % 8 === 0) pos = 0;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1), 10);
  },

  /**
   * Valida data (DD/MM/YYYY)
   */
  date: (dateStr: string): boolean => {
    const parts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!parts) return false;

    const day = parseInt(parts[1]);
    const month = parseInt(parts[2]);
    const year = parseInt(parts[3]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    return !isNaN(date.getTime());
  },

  /**
   * Valida data ISO (YYYY-MM-DD)
   */
  dateIso: (dateStr: string): boolean => {
    const parts = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!parts) return false;

    const year = parseInt(parts[1]);
    const month = parseInt(parts[2]);
    const day = parseInt(parts[3]);

    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    return !isNaN(date.getTime());
  },

  /**
   * Valida senha (mínimo 8 caracteres, 1 maiúscula, 1 número)
   */
  password: (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  },

  text: (value: string): boolean => {
    return value.trim().length > 0;
  },

  /**
   * Valida CPF (formato: XXX.XXX.XXX-XX)
   */
  cpf: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, "");
    if (cleaned.length !== 11 || /^(\d)\1+$/.test(cleaned)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleaned.substring(10, 11));
  },

  /**
   * Valida URL
   */
  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Valida se é uma data futura
   */
  dateFuture: (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date > new Date();
  },

  /**
   * Valida se é uma data passada
   */
  datePast: (dateStr: string): boolean => {
    const date = new Date(dateStr);
    return date < new Date();
  },
};

// ────────────────────────────────────────────────────────────
// MÁSCARAS (FORMATAÇAO)
// ────────────────────────────────────────────────────────────

export const masks = {
  /**
   * Máscara para telefone: (XX) 9XXXX-XXXX
   */
  phone: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    if (cleaned.length <= 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  },

  /**
   * Máscara para CNPJ: XX.XXX.XXX/XXXX-XX
   */
  cnpj: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    if (cleaned.length <= 12)
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  },

  /**
   * Máscara para data: DD/MM/YYYY
   */
  date: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  },

  /**
   * Máscara para CPF: XXX.XXX.XXX-XX
   */
  cpf: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  },

  /**
   * Máscara para valor monetário: R$ 1.234,56
   */
  currency: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "R$ 0,00";

    const num = parseInt(cleaned) / 100;
    return `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  },

  /**
   * Máscara para percentual: 99,99%
   */
  percent: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length === 1) return cleaned;
    if (cleaned.length === 2) return `${cleaned.slice(0, 1)},${cleaned.slice(1)}`;
    return `${cleaned.slice(0, -2)},${cleaned.slice(-2)}`.replace(/^,/, "0,");
  },

  /**
   * Máscara para time: HH:MM
   */
  time: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  },

  /**
   * Máscara para CEP: XXXXX-XXX
   */
  cep: (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  },
};

// ────────────────────────────────────────────────────────────
// MENSAGENS DE ERRO
// ────────────────────────────────────────────────────────────

export const errorMessages = {
  email: "E-mail inválido",
  phone: "Telefone deve ser (XX) 9XXXX-XXXX ou (XX) XXXX-XXXX",
  cnpj: "CNPJ inválido",
  cpf: "CPF inválido",
  date: "Data inválida (use DD/MM/YYYY)",
  dateIso: "Data inválida",
  password: "Senha deve ter 8+ caracteres, 1 maiúscula e 1 número",
  url: "URL inválida",
  dateFuture: "Data deve ser no futuro",
  datePast: "Data deve ser no passado",
  required: "Campo obrigatório",
  text: "Campo obrigatório",
  minLength: (len: number) => `Mínimo ${len} caracteres`,
  maxLength: (len: number) => `Máximo ${len} caracteres`,
  cep: "CEP inválido",
};

// ────────────────────────────────────────────────────────────
// HELPER: Validar e retornar erro
// ────────────────────────────────────────────────────────────

export function validateField(
  field: string,
  value: string,
  type: keyof typeof validators | "text"
): string | null {
  if (!value && type !== "url") {
    return errorMessages.required;
  }

  if (value === "") return null;

  const validator = validators[type];
  if (!validator) return null;

  return validator(value) ? null : errorMessages[type] || "Campo inválido";
}
