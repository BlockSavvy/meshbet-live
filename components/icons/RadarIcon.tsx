import Svg, { Path, Circle } from "react-native-svg";

interface RadarIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function RadarIcon({ size = 24, color = "currentColor", strokeWidth = 2 }: RadarIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.07 4.93A10 10 0 1 0 4.93 19.07"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16.24 7.76A6 6 0 1 0 7.76 16.24"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="12"
        r="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2v4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
