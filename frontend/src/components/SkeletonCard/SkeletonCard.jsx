import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.image} />
      <div className={styles.info}>
        <div className={styles.titleLine} />
        <div className={styles.titleLineShort} />
        <div className={styles.meta} />
      </div>
    </div>
  )
}