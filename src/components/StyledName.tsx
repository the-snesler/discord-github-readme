import React from "react";
import { CardOptions, ColorTheme } from "../types";
import { nameFontFamily } from "../helpers/fonts";

interface StyledNameProps {
  text: string;
  options: CardOptions;
  colors: ColorTheme;
  x: number | string;
  y: number | string;
  fontSize: number;
  fontWeight?: number;
  /** Stable key so gradient/filter IDs don't collide across cards */
  idKey: string;
}

const NEON_BLUR = 4;
const TOON_STROKE = 6;
const POP_STROKE = 4;
const POP_OFFSET = { x: 4, y: 6 };

export const StyledName: React.FC<StyledNameProps> = ({
  text,
  options,
  colors,
  x,
  y,
  fontSize,
  fontWeight = 800,
  idKey,
}) => {
  const family = nameFontFamily(options.font);
  const effect = options.effect ?? "solid";
  const c1 = options.nameColor1 ?? colors.colorT1;
  const c2 = options.nameColor2 ?? colors.colorT1;

  const baseStyle: React.CSSProperties = {
    fontFamily: family,
    fontSize: `${fontSize}px`,
    fontWeight,
    whiteSpace: "pre",
  };

  if (effect === "gradient") {
    const gradId = `name-grad-${idKey}`;
    return (
      <g>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <text x={x} y={y} style={{ ...baseStyle, fill: `url(#${gradId})` }}>
          {text}
        </text>
      </g>
    );
  }

  if (effect === "neon") {
    const filterId = `name-neon-${idKey}`;
    return (
      <g>
        <defs>
          <filter id={filterId} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={NEON_BLUR} result="blur" />
            <feFlood floodColor={c1} floodOpacity="1" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text x={x} y={y} style={{ ...baseStyle, fill: colors.colorT1 }} filter={`url(#${filterId})`}>
          {text}
          {options.animate && (
            <animate
              attributeName="opacity"
              values="1;1;0.55;1;1;1;0.85;1"
              dur="4s"
              repeatCount="indefinite"
            />
          )}
        </text>
      </g>
    );
  }

  if (effect === "toon") {
    return (
      <text
        x={x}
        y={y}
        style={{
          ...baseStyle,
          fill: colors.colorT1,
          stroke: c1,
          strokeWidth: TOON_STROKE,
          // @ts-ignore — valid SVG attribute, missing from CSSProperties
          paintOrder: "stroke fill",
          strokeLinejoin: "round",
        }}
      >
        {text}
      </text>
    );
  }

  if (effect === "pop") {
    return (
      <g>
        <text
          x={x}
          y={y}
          transform={`translate(${POP_OFFSET.x}, ${POP_OFFSET.y})`}
          style={{ ...baseStyle, fill: c1 }}
        >
          {text}
        </text>
        <text
          x={x}
          y={y}
          style={{
            ...baseStyle,
            fill: colors.colorT1,
            stroke: "#000",
            strokeWidth: POP_STROKE,
            // @ts-ignore
            paintOrder: "stroke fill",
            strokeLinejoin: "round",
          }}
        >
          {text}
        </text>
      </g>
    );
  }

  return (
    <text x={x} y={y} style={{ ...baseStyle, fill: c1 }}>
      {text}
    </text>
  );
};
