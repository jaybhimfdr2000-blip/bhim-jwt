export interface ToolItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: 'violet' | 'orange' | 'green' | 'pink' | 'blue' | 'yellow';
  href: string;
  isInternal: boolean;
  category: 'game' | 'ai' | 'developer' | 'maps';
  badge?: string;
}

export interface AssetCategory {
  k: string; // name
  v: string; // version
}

export interface AssetFile {
  filename: string;
  url: string;
}

export interface CountryTz {
  timezone: string;
  flag: string;
  name: string;
  code: string;
}
