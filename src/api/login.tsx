import { createClient } from '@supabase/supabase-js'
import prisma from '../lib/prisma'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const loginUser = async (email: string, password: string) => {
  try {
    // Validate input
    if (!email || !password) {
      throw new Error('Email et mot de passe requis')
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      throw new Error('Identifiants incorrects')
    }

    // Verify password (simple comparison without hashing)
    if (user.password !== password) {
      throw new Error('Identifiants incorrects')
    }

    // Create Supabase session
    const {data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    // Return user info (excluding sensitive data)
    return {
      id: user.id,
      pseudo: user.pseudo,
      email: user.email
    }

  } catch (error) {
    console.error('Erreur de connexion:', error)
    throw error
  }
}

export default loginUser