export type changeErrorMessageData = {
  contraintKey: string;
  property: string;
};

export function changeErrorMessage({
  contraintKey,
  property,
}: changeErrorMessageData): string | null {
  switch (contraintKey) {
    case 'isEmail':
      return 'Email inválido.';
    case 'isNotEmpty':
      return `${property} não pode estar vazio.`;
    case 'isString':
      return `${property} precisa ser uma string.`;
    case 'minLength':
      return `${property} deve ter mais caracteres.`;
    case 'maxLength':
      return `${property} deve ter menos caracteres.`;
    default:
      return null;
  }
}
