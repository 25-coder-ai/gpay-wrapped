import { useDataStore } from '../stores/dataStore';
import { useNavigate } from 'react-router-dom';
import styles from './Story.module.css';

export default function Story() {
  const navigate = useNavigate();
  const { parsedData, insights, selectedYear } = useDataStore();

  if (!parsedData) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.story}>
      <div className={styles.container}>
        <h1 className={styles.title}>Your GPay Wrapped {selectedYear === 'all' ? '(All Time)' : selectedYear}</h1>

        <div className={styles.debugInfo}>
          <h2>Data Loaded Successfully! 🎉</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>{parsedData.transactions.length}</div>
              <div className={styles.statLabel}>Transactions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>{parsedData.groupExpenses.length}</div>
              <div className={styles.statLabel}>Group Expenses</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>{parsedData.cashbackRewards.length}</div>
              <div className={styles.statLabel}>Cashback Rewards</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>{parsedData.voucherRewards.length}</div>
              <div className={styles.statLabel}>Vouchers</div>
            </div>
          </div>

          <p className={styles.message}>
            Story mode UI will be implemented in Phase 3!<br />
            For now, you can see your data has been successfully processed.
          </p>

          <button onClick={() => navigate('/')} className={styles.backButton}>
            Upload Another File
          </button>
        </div>
      </div>
    </div>
  );
}
