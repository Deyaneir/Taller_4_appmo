export type EstadoProyecto = 'En Progreso' | 'Completado' | 'Suspendido';
 
export interface ProyectoTesis {
  id: string;
  titulo: string;
  descripcion: string;
  autores: string;               // Ej: "Ana Torres, Luis Pérez"
  tutor_docente: string;         // Ej: "Ing. Sergio Granizo García"
  tecnologias_utilizadas: string; // Ej: "React Native, Node.js, PostgreSQL"
  fecha_inicio: string;          // Formato: "YYYY-MM-DD"
  fecha_fin?: string;            // Opcional: puede estar aún en progreso
  repositorio_github?: string;   // Ej: "https://github.com/usuario/repo"
  estado: EstadoProyecto;
  created_at: string;
}
 
// DTO para crear un nuevo proyecto (sin id ni created_at, los genera Supabase)
export type CreateProyectoDto = Omit<ProyectoTesis, 'id' | 'created_at'>;
 
// DTO para actualizar (todos los campos opcionales excepto el id)
export type UpdateProyectoDto = Partial<CreateProyectoDto>;