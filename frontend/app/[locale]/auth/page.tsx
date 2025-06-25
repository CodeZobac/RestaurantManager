'use client';

import { useState, useRef } from 'react';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import ValidationRequirements from '@/components/ValidationRequirements';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const LoginSignupForm = () => {
  const t = useTranslations('Auth');
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reference to main container for class manipulation with proper HTML type
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRegisterClick = () => {
    setIsActive(true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('somethingWentWrong'));
      }

      // Automatically sign in the user after successful registration
      const signInResponse = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResponse?.error) {
        throw new Error(signInResponse.error);
      }

      // Redirect to onboarding page
      const locale = window.location.pathname.split('/')[1];
      window.location.href = `/${locale}/onboarding`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('unknownError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsActive(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const signInResponse = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResponse?.error) {
        throw new Error(signInResponse.error);
      }

      // Get current session to check restaurant status
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      const locale = window.location.pathname.split('/')[1];
      
      if (session?.user?.restaurant_id) {
        // User has a restaurant, redirect to admin tables
        window.location.href = `/${locale}/admin/tables`;
      } else {
        // User doesn't have a restaurant, redirect to onboarding
        window.location.href = `/${locale}/onboarding`;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(t('unknownError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
      setIsLoading(true);
      try {
        await signIn('google', { callbackUrl: '/' });
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <>
      <Head>
        <title>{t('loginTitle')}/{t('registrationTitle')}</title>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </Head>
      
      <style jsx>{`
        /* Container transitions */
        .container {
          position: relative;
          width: 850px;
          height: 550px;
          background: #fff;
          margin: 20px;
          border-radius: 30px;
          box-shadow: 0 0 30px rgba(0, 0, 0, .2);
          overflow: hidden;
        }
        
        /* Form box styling */
        .form-box {
          position: absolute;
          width: 50%;
          height: 100%;
          background: #fff;
          display: flex;
          align-items: center;
          color: #333;
          text-align: center;
          padding: 40px;
          z-index: 1;
        }
        
        .form-box.login {
          right: 0;
          transition: .6s ease-in-out;
        }
        
        .form-box.register {
          right: -50%;
          opacity: 0;
          transition: .6s ease-in-out;
        }
        
        .container.active .form-box.login {
          right: 50%;
          opacity: 0;
        }
        
        .container.active .form-box.register {
          right: 50%;
          opacity: 1;
          transition-delay: .6s;
        }
        
        /* Toggle Box Styling */
        .toggle-box {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .toggle-box::before {
          content: '';
          position: absolute;
          left: -250%;
          width: 300%;
          height: 100%;
          background: linear-gradient(135deg, #ea580c, #dc2626);
          border-radius: 150px;
          z-index: 2;
          transition: 1.8s ease-in-out;
        }
        
        .container.active .toggle-box::before {
          left: 50%;
        }
        
        /* Media Queries */
        @media screen and (max-width: 650px) {
          .toggle-box::before {
            left: 0;
            top: ${isActive ? '70%' : '-270%'};
            width: 100%;
            height: 300%;
            border-radius: 20vw;
          }
          
          .active .form-box {
            right: 0;
            bottom: 30%;
          }
          
          .form-box {
            bottom: 0;
            width: 100%;
            height: 70%;
          }
          
          .toggle-panel {
            width: 100%;
            height: 30%;
          }
          
          .toggle-panel.toggle-left {
            top: 0;
          }
          
          .active .toggle-panel.toggle-left {
            left: 0;
            top: -30%;
          }
          
          .toggle-panel.toggle-right {
            right: 0;
            bottom: -30%;
          }
          
          .active .toggle-panel.toggle-right {
            bottom: 0;
          }
        }
        
        @media screen and (max-width: 400px) {
          .form-box {
            padding: 20px;
          }
          
          .toggle-panel h1 {
            font-size: 30px;
          }
        }
      `}</style>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
        {/* Back to Home Button */}
        <div className="absolute top-6 left-6 z-50">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-center items-center min-h-screen">
        <div 
          ref={containerRef}
          className={`relative w-[850px] h-[550px] bg-white mx-5 rounded-[30px] shadow-md overflow-hidden container ${isActive ? 'active' : ''}`}
        >
          {/* Login Form */}
          <div className="form-box login">
            <form className="w-full" onSubmit={handleLogin}>
              <h1 className="text-4xl mb-4">{t('loginTitle')}</h1>
              {error && <p className="text-red-500">{error}</p>}
              <div className="relative my-[30px]">
                <input 
                  type="email" 
                  placeholder={t('emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-[13px] pl-5 pr-[50px] bg-[#eee] rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                />
                <i className='bx bxs-user absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
              </div>
              <div className="relative my-[30px]">
                <input 
                  type="password" 
                  placeholder={t('passwordPlaceholder')}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-[13px] pl-5 pr-[50px] bg-[#eee] rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                />
                <i className='bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-xl'></i>
              </div>
              <div className="-mt-[15px] mb-[15px]">
                <a href="#" className="text-sm text-gray-800">{t('forgotPassword')}</a>
              </div>
              <button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg shadow-sm border-none cursor-pointer text-base text-white font-semibold transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? t('loggingInButton') : t('loginButton')}
              </button>
              <p className="text-sm my-[15px]">{t('orLoginWithSocial')}</p>
              <div className="flex justify-center">
                <a onClick={handleSignIn} className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-google'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-facebook'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-github'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-linkedin'></i>
                </a>
              </div>
            </form>
          </div>

          {/* Register Form */}
          <div className="form-box register">
            <form className="w-full" onSubmit={handleRegister}>
              <h1 className="text-4xl mb-4">{t('registrationTitle')}</h1>
              {error && <p className="text-red-500">{error}</p>}
              <div className="relative my-[30px]">
                <input
                  type="text"
                  placeholder={t('usernamePlaceholder')}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-[13px] pl-5 pr-[50px] bg-[#eee] rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                />
                <i className="bx bxs-user absolute right-5 top-1/2 transform -translate-y-1/2 text-xl"></i>
              </div>
              <div className="relative my-[30px]">
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-[13px] pl-5 pr-[50px] bg-[#eee] rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                />
                <i className="bx bxs-envelope absolute right-5 top-1/2 transform -translate-y-1/2 text-xl"></i>
              </div>
              <div className="relative my-[30px]">
                <Popover>
                  <PopoverTrigger asChild>
                    <div className="relative w-full">
                      <input
                        type="password"
                        placeholder={t('passwordPlaceholder')}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-[13px] pl-5 pr-[50px] bg-[#eee] rounded-lg border-none outline-none text-base text-gray-800 font-medium"
                      />
                      <i className="bx bxs-lock-alt absolute right-5 top-1/2 transform -translate-y-1/2 text-xl"></i>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <ValidationRequirements password={password} />
                  </PopoverContent>
                </Popover>
              </div>
              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 rounded-lg shadow-sm border-none cursor-pointer text-base text-white font-semibold transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? t('registeringButton') : t('registerButton')}
              </button>
              <p className="text-sm my-[15px]">{t('orRegisterWithSocial')}</p>
              <div className="flex justify-center">
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-google'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-facebook'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-github'></i>
                </a>
                <a href="#" className="inline-flex p-[10px] border-2 border-[#ccc] rounded-lg text-2xl text-gray-800 mx-2">
                  <i className='bx bxl-linkedin'></i>
                </a>
              </div>
            </form>
          </div>

          {/* Toggle Box */}
          <div className="absolute w-full h-full">
            <div className="toggle-box">
              {/* Left Toggle Panel */}
              <div 
                className={`absolute left-0 w-1/2 h-full text-white flex flex-col justify-center items-center z-20 transition-all duration-600 ease-in-out ${
                  isActive ? 'left-[-50%] delay-[600ms]' : 'delay-[1200ms]'
                }`}
              >
                <h1 className="text-4xl">{t('welcomeBackTitle')}</h1>
                <p className="text-sm my-5 mb-5">{t('noAccountQuestion')}</p>
                <button 
                  onClick={handleRegisterClick}
                  className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-white font-semibold"
                >
                  {t('registerLink')}
                </button>
              </div>
              
              {/* Right Toggle Panel */}
              <div 
                className={`absolute w-1/2 h-full text-white flex flex-col justify-center items-center z-20 transition-all duration-600 ease-in-out ${
                  isActive ? 'right-0 delay-[1200ms]' : 'right-[-50%] delay-[600ms]'
                }`}
              >
                <h1 className="text-4xl">{t('helloWelcomeTitle')}</h1>
                <p className="text-sm my-5 mb-5">{t('alreadyAccountQuestion')}</p>
                <button 
                  onClick={handleLoginClick}
                  className="w-40 h-[46px] bg-transparent border-2 border-white rounded-lg text-white font-semibold"
                >
                  {t('loginLink')}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      {/* Media Queries */}
    </>
  );
}

export default LoginSignupForm;
