import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";

const config: Config = {
  title: "Gnosis Pay Docs",
  tagline: "The first-ever self-custodial Card bridging traditional fintech and crypto",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://docs.gnosispay.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
          docItemComponent: "@theme/ApiItem", // Derived from docusaurus-theme-openapi
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Docs",
      logo: {
        alt: "Gnosis Pay logo",
        src: "img/logo.svg",
      },
      items: [
        {
          href: "https://github.com/gnosispay",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Community",
          items: [
            {
              label: "X",
              href: "https://x.com/gnosispay",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Gnosis Pay",
              href: "https://gnosispay.com",
            },
            {
              label: "GitHub",
              href: "https://github.com/gnosispay",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Gnosis Pay Co Ltd.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "api",
        docsPluginId: "classic",
        config: {
          api: {
            specPath: "https://api.gnosispay.com/api-docs/spec.json",
            outputDir: "docs/api-reference",
            sidebarOptions: {
              groupPathsBy: "tag",
              categoryLinkSource: "tag",
              sidebarCollapsible: true,
            },
            hideSendButton: false,
            showSchemas: true,
          } satisfies OpenApiPlugin.Options
        },
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs"],
};

export default config;
