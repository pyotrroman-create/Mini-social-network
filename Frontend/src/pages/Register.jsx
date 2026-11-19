import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ichgramLogo from '../assets/ichgram-logo.png'
import styles from './Register.module.css'

function Register() {
    const {
        register,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm()

    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')

    const onSubmit = async (data) => {
        setServerError('')

        try {
            await api.post('/auth/register', data)
            navigate('/login', { replace: true })
        } catch (error) {
            const field = error.response?.data?.field
            const message =
                error.response?.data?.message ||
                'Registration failed. Please try again.'

            if (field === 'username' || field === 'email') {
                setError(field, {
                    type: 'server',
                    message,
                })
            } else {
                setServerError(message)
            }
        }
    }

    return (
        <main className={styles.registerPage}>
            <div className={styles.registerCard}>
                <img
                    src={ichgramLogo}
                    alt="ICHGRAM"
                    className={styles.logo}
                />

                <p className={styles.description}>
                    Sign up to see photos and videos
                    <br />
                    from your friends.
                </p>

                <form
                    className={styles.form}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className={styles.field}>
                        <label className={styles.visuallyHidden} htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Email"
                            autoComplete="email"
                            className={styles.input}
                            aria-invalid={!!errors.email}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Enter a valid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className={styles.error} role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.visuallyHidden} htmlFor="fullName">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="Full Name"
                            autoComplete="name"
                            className={styles.input}
                            aria-invalid={!!errors.fullName}
                            {...register('fullName', {
                                required: 'Full name is required',
                            })}
                        />
                        {errors.fullName && (
                            <p className={styles.error} role="alert">
                                {errors.fullName.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.visuallyHidden} htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Username"
                            autoComplete="username"
                            className={styles.input}
                            aria-invalid={!!errors.username}
                            {...register('username', {
                                required: 'Username is required',
                            })}
                        />
                        {errors.username && (
                            <p className={styles.error} role="alert">
                                {errors.username.message}
                            </p>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label className={styles.visuallyHidden} htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Password"
                            autoComplete="new-password"
                            className={styles.input}
                            aria-invalid={!!errors.password}
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 8,
                                    message: 'Password must be at least 8 characters',
                                },
                            })}
                        />
                        {errors.password && (
                            <p className={styles.error} role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <p className={styles.infoText}>
                        <span>
                            People who use our service may have uploaded
                        </span>
                        <br />
                        <span className={styles.infoSecondLine}>
                            your contact information to Instagram.{' '}
                            <span className={styles.registerHighlight}>Learn More</span>
                        </span>
                    </p>

                    <p className={styles.termsText}>
                        By signing up, you agree to our{' '}
                        <span className={styles.registerHighlight}>Terms</span>,{' '}
                        <span className={styles.registerHighlight}>
                            Privacy Policy
                        </span>{' '}
                        and{' '}
                        <span className={styles.registerHighlight}>
                            Cookies Policy
                        </span>.
                    </p>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                    >
                        Sign up
                    </button>

                    {serverError && (
                        <p className={styles.error} role="alert">
                            {serverError}
                        </p>
                    )}
                </form>
            </div>

            <div className={styles.loginCard}>
                <p>
                    Have an account?{' '}
                    <Link to="/login" className={styles.loginLink}>
                        Log in
                    </Link>
                </p>
            </div>
        </main>
    )
}

export default Register