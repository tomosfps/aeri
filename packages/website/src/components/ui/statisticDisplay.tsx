import { formatNumber } from "../utils/formatUtils";

export const StatisticDisplay = ({ value, label }: { value: number  | any, label: string }) => {
  const formattedValue = typeof value === 'object' 
      ? formatNumber(Number(value)) 
      : (typeof value === 'number' ? formatNumber(value) : '0');

  return (
      <div className="text-center">
        <p className="text-lg md:text-3xl font-bold text-cprimary-light">
          {formattedValue}
        </p>
        <p className="text-xs md:text-sm text-ctext-light/60">{label}</p>
      </div>
    );
};
