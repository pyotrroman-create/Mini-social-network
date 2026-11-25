import styles from './PostOptionsModal.module.css'

function PostOptionsModal({
    isOpen,
    isOwnPost,
    onClose,
    onDelete,
    deleting = false,
}) {
    if (!isOpen) return null

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className={styles.overlay}
            onMouseDown={handleOverlayClick}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="Post options"
            >
                {isOwnPost && (
                    <>
                        <button
                            type="button"
                            className={`${styles.option} ${styles.delete}`}
                            onClick={onDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>

                        <button
                            type="button"
                            className={styles.option}
                            disabled
                        >
                            Edit
                        </button>
                    </>
                )}

                <button
                    type="button"
                    className={styles.option}
                    disabled
                >
                    Go to post
                </button>

                <button
                    type="button"
                    className={styles.option}
                    disabled
                >
                    Copy link
                </button>

                <button
                    type="button"
                    className={styles.option}
                    onClick={onClose}
                    disabled={deleting}
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}

export default PostOptionsModal
