import React from "react";
import { CardOptions } from "../types";
import { bannerHeight, isNitroProfile } from "../helpers/card";

interface Props {
  options: CardOptions;
  banner: string | null;
}
export default function Banner({
  options,
  banner,
}: Props) {
  const nitro = isNitroProfile(options.theme);
  
  if (nitro) {
    return (
      <g clipPath="url(#innerBackground)">
        <g mask="url(#banner)">
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
    );
  } else {
    return (
      <g clipPath="url(#background)">
        <g mask="url(#banner)">
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
    );
  }
}
