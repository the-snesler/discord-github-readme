import React from "react";
import { CardOptions, ColorTheme } from "../types";
import { bannerHeight, isNitroProfile } from "../helpers/card";
import { UserProperties } from "../helpers/discord";

interface Props {
  colors: ColorTheme;
  options: CardOptions;
  totalHeight: number;
  banner: string | null;
  user: UserProperties;
}
export default function cardBackground({
  colors,
  options,
  totalHeight,
  banner,
  user,
}: Props) {
  const bgColor = colors.colorB1;
  const nitro = isNitroProfile(options.theme);
  const bannerFill = banner ? colors.colorB2 : 
    options.bannerColor ? options.bannerColor :
    user.accentColor || bgColor;
  
  if (nitro) {
    return (
      <g>
        <rect
          x="0"
          y="0"
          width="700"
          height={totalHeight}
          rx="35px"
          style={{ fill: "url(#nitroGradient)" }}
        />
        <g clipPath="url(#innerBackground)">
          <mask id="not-banner">
            <circle cx="100" cy={bannerHeight} r="93" fill="white" />
            <rect
              x="5"
              y={bannerHeight}
              width="690"
              height={totalHeight - bannerHeight - 5}
              fill="white"
            />
          </mask>
          <rect
            x="5"
            y="5"
            width="690"
            height={totalHeight - 5}
            style={{ fill: "url(#nitroOverlay)", mask: "url(#not-banner)" }}
          />
          <g>
            <mask id="banner">
              <rect x="0" y="0" width="700" height={bannerHeight} fill="white" />
              <circle cx="100" cy={bannerHeight} r="93" fill="black" />
            </mask>
            <g mask="url(#banner)">
              <rect
                x="5"
                y="5"
                width="690"
                height={bannerHeight}
                style={{
                  fill: bannerFill,
                }}
              />
              {banner && (
                <image
                  x="5"
                  y="5"
                  xlinkHref={banner}
                  height={bannerHeight - 5}
                  width={690}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
            </g>
          </g>
        </g>
      </g>
    );
  } else {
    return (
      <g>
        <rect x="0" y="0" width="700" height={totalHeight} rx="35px" style={{ fill: bgColor }} />
        <g clipPath="url(#background)">
          <g>
            <mask id="banner">
              <rect x="0" y="0" width="700" height={bannerHeight} fill="white" />
              <circle cx="100" cy={bannerHeight} r="93" fill="black" />
            </mask>
            <g mask="url(#banner)">
              <rect
                x="0"
                y="0"
                width="700"
                height={bannerHeight}
                style={{
                  fill: bannerFill,
                }}
              />
              {banner && (
                <image
                  xlinkHref={banner}
                  height={bannerHeight}
                  width={700}
                  preserveAspectRatio="xMidYMid slice"
                />
              )}
            </g>
          </g>
        </g>
      </g>
    );
  }
}
