export function renderMessageTemplate(body: string, variables: Record<string, string>) {
  return body.replace(/\{\{\s*(nombre_profesional|horario_atencion|proxima_disponibilidad)\s*\}\}/g, (_, key) => variables[key] || '');
}
