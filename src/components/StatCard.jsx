// Themed stat card (Confetti Pop). tone: blue | green | amber | purple
export default function StatCard({ title, value, icon, tone = "blue" }) {
  return (
    <div className="adm-stat">
      <span className={"ic ic-" + tone}>{icon}</span>
      <div>
        <div className="k">{title}</div>
        <div className={"v v-" + tone}>{value}</div>
      </div>
    </div>
  );
}
