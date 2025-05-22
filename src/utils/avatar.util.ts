export const avatarFunc = {
  // funcion para obtener el color del avatar
  getAvatarColor(identifier?: string): string {
    
    if (!identifier) return '#C0C0C0';
    
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // El nombre color fue eliminado al usar return directo (más limpio si no se reutiliza).
    return '#' + [0, 1, 2]
    // substr(-2) fue reemplazado por padStart(2, '0'), que es más explícito y moderno.
    // El segundo bucle se redujo a una expresión con .map() y .join('') para mayor claridad y concisión.
      .map(i => ((hash >> (i * 8)) & 0xFF).toString(16).padStart(2, '0'))
      .join('');
  },

  // funcion para obtener las iniciales apartir del nombre
  getInitials(name?: string): string {
    // name?.trim() asegura que no retorne letras de un string vacío o solo con espacios.
    if (!name?.trim()) return '?';
    
    // split(/\s+/) divide por cualquier cantidad de espacios, evitando errores con nombres mal formateados.
    const parts = name.trim().split(/\s+/);
    // Se usa un enfoque más seguro con charAt(0) para evitar errores si alguna parte está vacía.
    const first = parts[0]?.charAt(0) || '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    
    // Garantiza que, si no se logra generar ninguna letra, se devuelva '?'.
    return (first + last).toUpperCase() || '?';
  }
} 