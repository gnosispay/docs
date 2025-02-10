import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';
import sidebar from './docs/api-reference/sidebar'
/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  apiSidebar: [
    {
      type: "doc",
      id: "intro",
    },
    {
      type: "category",
      label: "Concepts",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "accounts",
        },
        {
          type: "doc",
          id: "cards",
        },
      ]
    },
    {
      type: "category",
      label: "Guides",
      collapsed: false,
      items: [
        {
          type: "doc",
          id: "create-new-user-flow",
        },
        {
          type: "doc",
          id: "auth",
        },
        {
          type: "doc",
          id: "card-order-flow",
        },
      ]
    },
    {
      type: "category",
      label: "API Reference",
      link: {
        type: "generated-index",
        title: "Gnosis Pay API",
        description: "The first-ever self-custodial Card bridging traditional fintech and crypto",
        slug: "/category/api-reference",
      },
      items: sidebar,
    },
  ]
};

export default sidebars;
