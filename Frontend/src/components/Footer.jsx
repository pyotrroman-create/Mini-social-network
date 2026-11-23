import { NavLink } from 'react-router-dom'
import styles from './Footer.module.css'

const footerLinks = [
    { label: 'Home', path: '/' },
    { label: 'Search', path: '/search' },
    { label: 'Explore', path: '/explore' },
    { label: 'Messages', path: '/messages' },
    { label: 'Notifications', path: '/notifications' },
    { label: 'Create', path: '/create' },
]

function Footer() {
    return (
        <footer className={styles.footer}>
            <nav className={styles.navigation}>
                {footerLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={styles.link}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <p className={styles.copyright}>
                © 2024 ICHgram
            </p>
        </footer>
    )
}

export default Footer