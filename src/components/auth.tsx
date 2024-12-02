
import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
// import Canvas from './Canvas';


interface User {
  pseudo: string;
  email: string;
  password: string;
}



const AuthSystem: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [pseudo, setPseudo] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [user, setUser] = useState<User | null>(null);

  
    const USERS: User[] = [
        {pseudo: 'test', email: 'user@example.com', password: 'password123' }
    ];

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const foundUser = USERS.find(u => u.pseudo === pseudo && u.email === email && u.password === password);
    
        if (foundUser) {
            setUser(foundUser);
            setError('');
        } else {
            setError('Pseudo Email or password is incorrect');
        }
    };

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
    
        if (USERS.some(u => u.pseudo === pseudo)) {
            setError('Pseudo is already used');
            return;
        }

        if (password !== confirmPassword) {
            setError('Password does\'nt match');
        return;
    }

    if (USERS.some(u => u.email === email)) {
        setError('This mail is already used');
        return;
    }

    
    const newUser: User = { pseudo, email, password };
        USERS.push(newUser);
        setUser(newUser);
        setError('');
    };

    const handleLogout = () => {
        setUser(null);
        setEmail('');
        setPassword('');
  };
  const GoCanvas = () => {
    // Terminer la fonction GoCanvas, quand on est connecter a son compte le bouton apparait
    // Quand on click dessus ça nous emmène vers la page du Canvas
  }

  // page de connexion
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 h-[550px]">
        <Card className="flex flex-col w-[550px] justify-center items-center">
          <CardHeader>
            <CardTitle>{isLogin ? 'Connexion' : 'Inscription'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleSignup}>
              <div className="grid w-full justify-center items-center gap-4">
                <div className="flex flex-col justify-center items-center space-y-1.5">
                  <label htmlFor="pseudo">Pseudo</label>
                  <Input 
                    type="text" 
                    id="pseudo" 
                    placeholder="your pseudo" 
                    value={pseudo}
                    onChange={(e) => setPseudo(e.target.value)}
                    required
                  />
                  <label htmlFor="email">Email</label>
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder="your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="flex flex-col justify-center items-center space-y-1.5">
                  <label htmlFor="password">Password</label>
                  <Input 
                    type="password" 
                    id="password" 
                    placeholder="your password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
                {!isLogin && (
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="confirm-password">Confirm password</label>
                    <Input 
                      type="password" 
                      id="confirm-password" 
                      placeholder="Confirm your password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                )}
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
              <CardFooter className="flex justify-between mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Create an account' : 'I\'m already a member'}
                </Button>
                <Button type="submit">
                  {isLogin ? 'Connexion' : 'Inscription'}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Écran après connexion

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 h-[550px]">
            <Card className="flex flex-col w-[550px] justify-center items-center">
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                </CardHeader>
            <CardContent>
              <p>Connected on : {user.pseudo}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogout} className="w-full">
            Déconnexion
          </Button>
          <Button onClick={GoCanvas} className='w-full'>
            Let's Start
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default AuthSystem;