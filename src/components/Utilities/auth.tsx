import React, { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import axios from 'axios'
import * as z from 'zod'

// Schéma de validation
const UserSchema = z.object({
  pseudo: z.string()
    .min(3, { message: "Le pseudo doit contenir au moins 3 caractères" })
    .max(20, { message: "Le pseudo ne doit pas dépasser 20 caractères" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Le pseudo ne peut contenir que des lettres, des chiffres et des underscores" }),
  email: z.string().email({ message: "Format d'email invalide" }),
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
      message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
    })
})

interface User {
  id: number
  pseudo: string
  email: string
  createdAt: Date
}

const AuthSystem: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [pseudo, setPseudo] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [user, setUser] = useState<User | null>(null)

  const validateForm = () => {
    try {
      if (!isLogin) {
        UserSchema.parse({ pseudo, email, password })
        if (password !== confirmPassword) {
          setError('Les mots de passe ne correspondent pas')
          return false
        }
      } else {
        z.object({
          email: z.string().email(),
          password: z.string().min(1)
        }).parse({ email, password })
      }
      return true
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0].message)
        return false
      }
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    try {
      const response = await axios.post('http://localhost:3000/api/login', { email, password })
      setUser(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erreur de connexion')
      } else {
        setError('Erreur inattendue')
      }
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
  
    if (!validateForm()) return
  
    try {
      const response = await axios.post('http://localhost:3000/api/signup', {
        pseudo,
        email,
        password
      })
      setUser(response.data)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
      } else {
        setError('Erreur inattendue')
      }
    }
  }

  const handleLogout = () => {
    setUser(null)
    setPseudo('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
  }

  const proceedToNextStep = () => {
    console.log('Navigating to next step')
  }

  // Rendu du formulaire d'authentification
  if (!user) {
    return (
      <div className="flex justify-center items-center bg-gray-100 h-screen">
        <Card className="w-[400px] shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{isLogin ? 'Connexion' : 'Inscription'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="pseudo" className="block mb-2">Pseudo</label>
                  <Input
                    id="pseudo"
                    type="text"
                    placeholder="Choisissez un pseudo"
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Votre email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2">Mot de passe</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {!isLogin && (
                <div>
                  <label htmlFor="confirm-password" className="block mb-2">Confirmez le mot de passe</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirmez votre mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              <div className="flex justify-between space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full"
                >
                  {isLogin ? 'Créer un compte' : 'J\'ai déjà un compte'}
                </Button>
                <Button type="submit" className="w-full">
                  {isLogin ? 'Connexion' : 'S\'inscrire'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Rendu de l'écran après connexion
  return (
    <div className="flex justify-center items-center bg-gray-100 h-screen">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle>Bienvenue</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-xl mb-4">Connecté en tant que :</p>
          <p className="font-bold text-2xl">{user.pseudo}</p>
          <p className="text-gray-600 mt-2">{user.email}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleLogout} className="w-full mr-2">
            Déconnexion
          </Button>
          <Button onClick={proceedToNextStep} className="w-full">
            Continuer
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AuthSystem