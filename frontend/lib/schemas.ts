import { z } from 'zod';

export const tableSchema = z.object({
  name: z.string().min(1, 'nameRequired').max(100),
  capacity: z.number().min(1, 'capacityMin').max(50),
  location: z.string().optional().or(z.literal('')),
  status: z.enum(['available', 'maintenance', 'pending', 'confirmed', 'occupied'])
});

export const onboardingSchema = z.object({
  tableCount: z.number().min(1).max(100)
});

export const reservationSchema = z.object({
  customer_name: z.string().min(2, 'nameMinLength').max(200, 'nameMaxLength'),
  customer_email: z.string().email('invalidEmail').optional().or(z.literal('')),
  customer_phone: z.string().min(10, 'phoneMinLength').max(20, 'phoneMaxLength').optional().or(z.literal('')),
  restaurant_id: z.string().min(1, 'restaurantRequired'),
  reservation_date: z.string().min(1, 'dateRequired'),
  reservation_time: z.string().min(1, 'timeRequired'),
  party_size: z.number().min(1, 'partySizeMin').max(20, 'partySizeMax'),
  special_requests: z.string().max(500, 'specialRequestsMaxLength').optional().or(z.literal(''))
}).refine(
  (data) => data.customer_email || data.customer_phone,
  {
    message: 'contactRequired',
    path: ['customer_email']
  }
);

export type TableFormData = z.infer<typeof tableSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
export type ReservationFormData = z.infer<typeof reservationSchema>;
