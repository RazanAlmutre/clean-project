// Graduation-cap-on-initial avatar
export default function CapAvatar({ name = "", size = 40, tone = "blue" }) {
  const letter = (name || "?").trim().charAt(0).toUpperCase() || "?";
  const circleBg =
    tone === "amber"
      ? "#f4f1ea"
      : tone === "soft"
        ? "linear-gradient(150deg,#eef5fc,#cfe3f7)"
        : "#eef5fc";
  const circleColor = tone === "amber" ? "#b08442" : "#0B3D91";
  return (
    <span className="cap-avatar" style={{ width: size, height: size }}>
      <span
        className="cap-avatar__circle"
        style={{
          height: Math.round(size * 0.87),
          fontSize: Math.round(size * 0.4),
          background: circleBg,
          color: circleColor,
        }}
      >
        {letter}
      </span>
      <img
        className="cap-avatar__cap"
        src="/sticker-cap.png"
        alt=""
        style={{
          width: Math.round(size * 0.78),
          top: -Math.round(size * 0.2),
          opacity: tone === "amber" ? 0.6 : 1,
        }}
      />
    </span>
  );
}
