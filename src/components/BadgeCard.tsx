import React from "react";
import { UserProperties } from "../helpers/discord";
import { ColorTheme } from "../types";
import { statusColors } from "../helpers/themes";

interface BadgeCardProps {
  user: UserProperties;
  colors: ColorTheme;
  avatar: string | null;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ user, colors, avatar }) => {
  const statusString = (
    user.presence?.status && statusColors.hasOwnProperty(user.presence.status)
      ? user.presence.status
      : "offline"
  ) as keyof typeof statusColors;

  return (
    <svg
      width="50px"
      height="50px"
      viewBox="0 0 50 50"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      xmlSpace="preserve"
      style={{ fillRule: "evenodd", clipRule: "evenodd" }}
    >
      <title>{`${user.username}'s Discord status`}</title>
      <defs>
        <clipPath id="badge-bg">
          <rect x="0" y="0" width="50" height="50" rx="12" />
        </clipPath>
        <mask id="badge-avatar-mask">
          <circle cx="25" cy="25" r="18" fill="white" />
          <circle cx="38" cy="38" r="8" fill="black" />
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
      </defs>

      {/* Background */}
      <g clipPath="url(#badge-bg)">
        <rect x="0" y="0" width="50" height="50" fill={colors.colorB1} />
      </g>

      {/* Avatar with status cutout */}
      <g mask="url(#badge-avatar-mask)">
        {avatar && <image xlinkHref={avatar} x="7" y="7" width="36" height="36" />}
      </g>

      {/* Status indicator */}
      <rect
        x="32"
        y="32"
        width="12"
        height="12"
        style={{
          fill: statusColors[statusString],
          mask: `url('#status-${statusString}')`,
        }}
      />
    </svg>
  );
};
