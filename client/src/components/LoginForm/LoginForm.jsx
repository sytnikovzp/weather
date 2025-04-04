import { Formik, Form, Field, ErrorMessage } from 'formik';
// ==============================================================
import { AUTH_FORM_INITIAL } from '../../constants';
import { AUTH_VALIDATION_SCHEME } from '../../utils/validationSchemes';

function LoginForm({ onSubmit }) {
  const renderForm = ({ isValid }) => {
    return (
      <Form id='auth-form'>
        <h2>Авторизація</h2>
        <div className='inputField'>
          <Field
            type='email'
            name='email'
            id='email'
            required
            placeholder='E-mail'
          />
        </div>
        <ErrorMessage name='email'>
          {(msg) => <div className='error'>{msg}</div>}
        </ErrorMessage>
        <div className='inputField'>
          <Field
            type='password'
            name='password'
            id='password'
            required
            placeholder='Пароль'
          />
        </div>
        <ErrorMessage name='password'>
          {(msg) => <div className='error'>{msg}</div>}
        </ErrorMessage>
        <button type='submit' className='submitButton' disabled={!isValid}>
          Увійти
        </button>
      </Form>
    );
  };
  return (
    <Formik
      initialValues={AUTH_FORM_INITIAL}
      validationSchema={AUTH_VALIDATION_SCHEME}
      onSubmit={onSubmit}
      validateOnMount
    >
      {renderForm}
    </Formik>
  );
}

export default LoginForm;
