
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import loginPhones from '../assets/login-phones.png'
import styles from './NotFound.module.css'

function NotFound() {
    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.main}>
                <div className={styles.content}>
                    <img
                        className={styles.phones}
                        src={loginPhones}
                        alt="Instagram mobile application preview"
                    />

                    <div className={styles.message}>
                        <h1 className={styles.title}>
                            Oops! Page Not Found (404 Error)
                        </h1>

                        <p>
                            We're sorry, but the page you're looking for doesn't seem to exist.
                            <br />
                            If you typed the URL manually, please double-check the spelling.
                            <br />
                            If you clicked on a link, it may be outdated or broken.
                        </p>

                    </div>

                </div>
            </main>

            <Footer />
        </div>
    )
}

export default NotFound
