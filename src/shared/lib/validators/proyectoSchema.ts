import { z } from 'zod/v3';

const ESTADOS = ['En Progreso', 'Completado', 'Suspendido'] as const;

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function noContieneNumeros(value: string): boolean {
  return !/\d/.test(value);
}

export const proyectoSchema = z
  .object({
    titulo: z
      .string()
      .trim()
      .min(3, 'El titulo debe tener al menos 3 caracteres')
      .refine(noContieneNumeros, {
        message: 'El titulo no puede contener numeros',
      }),
    descripcion: z.string().trim().min(10, 'La descripcion debe tener al menos 10 caracteres'),
    autores: z
      .string()
      .trim()
      .min(1, 'Los autores son obligatorios')
      .refine(noContieneNumeros, {
        message: 'Los autores no pueden contener numeros',
      }),
    tutor_docente: z
      .string()
      .trim()
      .min(1, 'El tutor docente es obligatorio')
      .refine(noContieneNumeros, {
        message: 'El nombre del tutor no puede contener numeros',
      }),
    tecnologias_utilizadas: z.string().trim().min(1, 'Las tecnologias utilizadas son obligatorias'),
    fecha_inicio: z.string().trim().min(1, 'La fecha de inicio es obligatoria').refine(isValidIsoDate, {
      message: 'La fecha de inicio debe tener formato AAAA-MM-DD',
    }),
    fecha_fin: z.string().trim().optional().or(z.literal('')),
    repositorio_github: z.string().trim().optional().or(z.literal('')),
    documento_url: z.string().trim().optional().or(z.literal('')),
    estado: z.enum(ESTADOS),
  })
  .superRefine((data, ctx) => {
    if (data.fecha_fin && !isValidIsoDate(data.fecha_fin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha_fin'],
        message: 'La fecha de fin debe tener formato AAAA-MM-DD',
      });
      return;
    }

    if (data.fecha_fin && new Date(`${data.fecha_fin}T00:00:00`) <= new Date(`${data.fecha_inicio}T00:00:00`)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha_fin'],
        message: 'La fecha de fin debe ser mayor a la fecha de inicio',
      });
    }

    if (data.repositorio_github && !isValidHttpUrl(data.repositorio_github)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['repositorio_github'],
        message: 'El repositorio debe ser una URL valida (https://...)',
      });
    }
  });

export type ProyectoFormValues = z.infer<typeof proyectoSchema>;