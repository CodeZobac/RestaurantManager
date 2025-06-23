import { z } from 'zod';

export const tableSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100),
  capacity: z.number().min(1, 'capacityMin').max(50),
  location: z.string().optional().or(z.literal('')),
  status: z.enum(['available', 'maintenance', 'reserved']).default('available')
});

export const onboardingSchema = z.object({
  tableCount: z.number().min(1).max(100)
});

export type TableFormData = z.infer<typeof tableSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
