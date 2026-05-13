import React from "react";
import { UserProperties } from "../helpers/discord";
import { CardOptions, ColorTheme } from "../types";
import { GG_SANS_FONT_FACE } from "../helpers/fonts";
import { statusColors } from "../helpers/themes";

interface CompactCardProps {
  user: UserProperties;
  options: CardOptions;
  colors: ColorTheme;
  avatar: string | null;
  activityText: string;
  activityImage: string | null;
}

export const CompactCard: React.FC<CompactCardProps> = ({
  user,
  options,
  colors,
  avatar,
  activityText,
  activityImage,
}) => {
  const statusString = (
    user.presence?.status && statusColors.hasOwnProperty(user.presence.status)
      ? user.presence.status
      : "offline"
  ) as keyof typeof statusColors;

  const secondLine = activityText
    ? `@${user.username} · ${activityText}`.slice(0, 55)
    : `@${user.username}`;

  return (
    <svg
      width={`${options.width}px`}
      height="100%"
      viewBox="0 0 500 64"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      style={{ fillRule: "evenodd", clipRule: "evenodd" }}
    >
      <title>{`${user.username} on Discord`}</title>
      <defs>
        <style>{GG_SANS_FONT_FACE}</style>
        <clipPath id="compact-bg">
          <rect x="0" y="0" width="500" height="64" rx="16" />
        </clipPath>
        <mask id="compact-avatar-mask">
          <circle cx="32" cy="32" r="20" fill="white" />
          <circle cx="46" cy="46" r="10" fill="black" />
        </mask>
        <mask id="status-online" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
          <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
        </mask>
        <mask id="status-idle" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
          <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
          <circle fill="black" cx="0.25" cy="0.25" r="0.375" />
        </mask>
        <mask id="status-dnd" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
          <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
          <rect fill="black" x="0.125" y="0.375" width="0.75" height="0.25" rx="0.125" ry="0.125" />
        </mask>
        <mask id="status-offline" maskContentUnits="objectBoundingBox" viewBox="0 0 1 1">
          <circle fill="white" cx="0.5" cy="0.5" r="0.5" />
          <circle fill="black" cx="0.5" cy="0.5" r="0.25" />
        </mask>
        {activityImage && (
          <clipPath id="compact-activity-icon">
            <rect x="460" y="18" width="28" height="28" rx="6" />
          </clipPath>
        )}
      </defs>

      {/* Background */}
      <g clipPath="url(#compact-bg)">
        <rect x="0" y="0" width="500" height="64" fill={colors.colorB1} />
      </g>

      {/* Avatar with status cutout */}
      <g mask="url(#compact-avatar-mask)">
        {avatar && <image xlinkHref={avatar} x="12" y="12" width="40" height="40" />}
      </g>

      {/* Status indicator */}
      <rect
        x="39"
        y="39"
        width="14"
        height="14"
        style={{
          fill: statusColors[statusString],
          mask: `url('#status-${statusString}')`,
        }}
      />

      {/* Display name */}
      <text
        x="62"
        y="26"
        fontFamily="'gg sans', 'Noto Sans', Arial, sans-serif"
        fontSize="18"
        fontWeight="800"
        fill={colors.colorT1}
      >
        {user.displayName || user.username}
      </text>

      {/* Username + activity */}
      <text
        x="62"
        y="46"
        fontFamily="'gg sans', 'Noto Sans', Arial, sans-serif"
        fontSize="13"
        fill={colors.colorT2}
      >
        {secondLine}
      </text>

      {/* Activity image thumbnail */}
      {activityImage && (
        <g clipPath="url(#compact-activity-icon)">
          <image xlinkHref={activityImage} x="460" y="18" width="28" height="28" />
        </g>
      )}
    </svg>
  );
};
