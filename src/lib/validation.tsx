import { z } from 'zod'

export const UserSchema = z.object({
  pseudo: z.string().min(3, "Pseudo doit contenir au moins 3 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe doit contenir au moins 4 caractères")
})