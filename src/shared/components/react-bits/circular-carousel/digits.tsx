export const Digits = ({ value }: { value: number }) => (
  <span className="circular-carousel__digits">
    {String(value)
      .padStart(2, "0")
      .split("")
      .map((digit, index) => (
        <span key={index} className="circular-carousel__digit">
          <span
            className="circular-carousel__reel"
            style={{ transform: `translateY(${-Number(digit) * 10}%)` }}
          >
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
  </span>
)
