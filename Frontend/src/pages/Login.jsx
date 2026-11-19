import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { setCredentials } from '../store/authSlice'
import ichgramLogo from '../assets/ichgram-logo.png'
import loginPhones from '../assets/login-phones.png'
import styles from './Login.module.css'

function Login() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm()

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const onSubmit = async (data) => {
        setServerError('')

        try {
            const response = await api.post('/auth/login', data)

            localStorage.setItem('token', response.data.token)

            dispatch(
                setCredentials({
                    token: response.data.token,
                    user: response.data.user,
                })
            )

            navigate('/', { replace: true })
        } catch (error) {
            const message =
                error.response?.data?.message ||
                'Login failed. Please try again.'

            setServerError(message)
        }
    }

    return (
        <main className={styles.loginPage}>
            <div className={styles.loginLayout}>
                <div className={styles.phonesSection}>
                    <img
                        src={loginPhones}
                        alt="ICHGRAM mobile app preview"
                        className={styles.phonesImage}
                    />
                </div>

                <div className={styles.rightSection}>
                    <section className={styles.loginCard}>
                        <img
                            src={ichgramLogo}
                            alt="ICHGRAM"
                            className={styles.logo}
                        />

                        <form
                            className={styles.form}
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                        >
                            <div className={styles.field}>
                                <label
                                    htmlFor="identifier"
                                    className={styles.visuallyHidden}
                                >
                                    Username or email
                                </label>

                                <input
                                    id="identifier"
                                    type="text"
                                    placeholder="Username, or email"
                                    autoComplete="username"
                                    className={styles.input}
                                    aria-invalid={Boolean(errors.identifier)}
                                    {...register('identifier', {
                                        required: 'Username or email is required',
                                    })}
                                />

                                {errors.identifier && (
                                    <p className={styles.error} role="alert">
                                        {errors.identifier.message}
                                    </p>
                                )}
                            </div>

                            <div className={styles.field}>
                                <label
                                    htmlFor="password"
                                    className={styles.visuallyHidden}
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    className={styles.input}
                                    aria-invalid={Boolean(errors.password)}
                                    {...register('password', {
                                        required: 'Password is required',
                                    })}
                                />

                                {errors.password && (
                                    <p className={styles.error} role="alert">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Logging in...' : 'Log in'}
                            </button>

                            {serverError && (
                                <p className={styles.error} role="alert">
                                    {serverError}
                                </p>
                            )}
                        </form>
                        <div className={styles.divider}>
                            <span className={styles.dividerLine} />
                            <span className={styles.dividerText}>OR</span>
                            <span className={styles.dividerLine} />
                        </div>

                        <p className={styles.forgotPassword}>
                            Forgot password?
                        </p>
                    </section>

                    <section className={styles.registerCard}>
                        <p>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className={styles.registerLink}
                            >
                                Sign up
                            </Link>
                        </p>
                    </section>
                </div>
            </div>
        </main>
    )
}

export default Login