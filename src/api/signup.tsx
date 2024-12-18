import { createClient } from '@supabase/supabase-js'
import prisma from '../lib/prisma'

// Initialize Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const signupUser = async (pseudo: string, email: string, password: string) => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { pseudo }
        ]
      }
    })

    if (existingUser) {
      throw new Error(existingUser.email === email 
        ? 'Un compte avec cet email existe déjà' 
        : 'Ce pseudo est déjà utilisé')
    }

    // Create user in Supabase
    const { data: supabaseUser, error: supabaseError } = await supabase.auth.signUp({
      email,
      password
    })

    if (supabaseError) {
      throw new Error(supabaseError.message)
    }

    // Create user in Prisma
    const newUser = await prisma.user.create({
      data: {
        pseudo,
        email,
        password // Storing plain text password (not recommended for production)
      }
    })

    // Return user info (excluding sensitive data)
    return {
      id: newUser.id,
      pseudo: newUser.pseudo,
      email: newUser.email
    }

  } catch (error) {
    console.error('Erreur d\'inscription:', error)
    throw error
  }
}

export default signupUser