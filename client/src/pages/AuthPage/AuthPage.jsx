import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// ==============================================================
import restController from '../../api/rest/restController';
// ==============================================================
import LoginForm from '../../components/LoginForm/LoginForm';
import RegistrationForm from '../../components/RegistrationForm/RegistrationForm';

function AuthPage({ checkAuthentication }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleAuth = useCallback(
    async (action, ...args) => {
      try {
        setErrorMessage('');
        if (action === 'login') {
          await restController.login(...args);
        } else {
          await restController.registration(...args);
        }
        checkAuthentication();
        navigate('/');
      } catch (error) {
        console.error(
          `${action === 'login' ? 'Авторизація' : 'Реєстрація'} неуспішна:`,
          error.message
        );
        setErrorMessage(
          action === 'login'
            ? 'Авторизація неуспішна. Перевірте облікові дані.'
            : 'Реєстрація неуспішна. Спробуйте знову.'
        );
      }
    },
    [checkAuthentication, navigate]
  );

  return (
    <div className='auth-container'>
      {errorMessage && <div className='error'>{errorMessage}</div>}
      {isLoginMode ? (
        <LoginForm
          onSubmit={({ email, password }) =>
            handleAuth('login', email, password)
          }
        />
      ) : (
        <RegistrationForm
          onSubmit={({ fullName, email, password }) =>
            handleAuth('registration', fullName, email, password)
          }
        />
      )}
      <button
        id='switch-button'
        onClick={() => {
          setIsLoginMode(!isLoginMode);
          setErrorMessage('');
        }}
      >
        Перейти до
        {isLoginMode ? ' реєстрації користувача' : ' авторизації користувача'}
      </button>
    </div>
  );
}

export default AuthPage;
