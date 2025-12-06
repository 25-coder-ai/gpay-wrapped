import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DropZone from '../components/upload/DropZone';
import styles from './Landing.module.css';

export default function Landing() {
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    // Store the file in sessionStorage (we'll extract it in Processing page)
    try {
      // We can't store File directly, so we'll pass it via navigation state
      navigate('/processing', { state: { file } });
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert('Failed to process file. Please try again.');
    }
  };

  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <h1 className={styles.title}>GPay Wrapped 🎁</h1>
        <p className={styles.subtitle}>Your year in payments, privacy-first</p>
      </header>

      <main className={styles.main}>
        <DropZone onUpload={handleFileUpload} disabled={uploading} />
      </main>

      <footer className={styles.footer}>
        <div className={styles.privacyBadge}>
          <span className={styles.badgeIcon}>🔒</span>
          <div className={styles.badgeContent}>
            <strong className={styles.badgeTitle}>100% Private & Offline</strong>
            <p className={styles.badgeText}>Your data never leaves your browser</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
