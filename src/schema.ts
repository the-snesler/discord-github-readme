import * as z from "zod/v4";

const isHex = (input: string) => !isNaN(parseInt(input, 16)) && input.length >= 3 && input.length <= 8;
const hexMessage = { error: "Colors must be in hexadecimal format without a leading #" };

export const ParamsSchema = z
  .object({
    width: z.coerce.number().default(500),
    animate: z.coerce.boolean().default(true),
    banner: z
      .url({
        protocol: /^https?$/,
        hostname: z.regexes.domain,
        error: "Banner URL must be a valid HTTP or HTTPS URL.",
      })
      .optional(),
    bannerColor: z
      .string()
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val)
      .optional(),
    aboutMe: z.string().optional(),
    pronouns: z.string().max(30).optional(),
    hideDecoration: z.coerce.boolean().default(false),
    hideSpotify: z.coerce.boolean().default(false),
    layout: z.enum(["standard", "compact", "badge"]).default("standard"),
    theme: z
      .enum([
        "dark",
        "light",
        "custom",
        "nitroDark",
        "nitroLight",
        // Named presets
        "catppuccinMocha",
        "catppuccinLatte",
        "catppuccinFrappe",
        "dracula",
        "nord",
        "tokyoNight",
        "githubDark",
        "gruvbox",
        "solarized",
      ])
      .default("dark"),
    primaryColor: z
      .string()
      .default("ecaff3")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    accentColor: z
      .string()
      .default("44a17a")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    colorB1: z
      .string()
      .default("111214")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    colorB2: z
      .string()
      .default("313338")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    colorB3: z
      .string()
      .default("505059")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    colorT1: z
      .string()
      .default("fff")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
    colorT2: z
      .string()
      .default("d2d6d8")
      .refine(isHex, hexMessage)
      .transform((val) => "#" + val),
  })
  .check((ctx) => {
    const data = ctx.value;
    if (data.theme === "nitroDark" || data.theme === "nitroLight") {
      if (!data.primaryColor || !data.accentColor) {
        ctx.issues.push({
          code: "custom",
          error: "Primary and accent colors must be provided for nitro themes.",
          input: ctx.value,
        });
      }
    }
    if (data.theme === "custom") {
      if (!data.colorB1 || !data.colorB2 || !data.colorB3 || !data.colorT1 || !data.colorT2) {
        ctx.issues.push({
          code: "custom",
          error: "Custom theme colors must be provided when theme is 'custom'.",
          input: ctx.value,
        });
      }
    }
  });

export type CardOptions = z.infer<typeof ParamsSchema>;
