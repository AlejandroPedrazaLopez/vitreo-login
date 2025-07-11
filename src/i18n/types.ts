import { sidebar as enSidebar } from "./locales/en/sidebar";
import { sidebar as esSidebar } from "./locales/es/sidebar";

export interface CommonTranslations {
  // General actions
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  view: string;
  close: string;
  open: string;
  submit: string;
  update: string;
  refresh: string;
  home: string;
  back: string;
  settings: string;
  logout: string;
  
  // Status
  status: string;
  active: string;
  inactive: string;
  pending: string;
  completed: string;
  
  // Error pages
  not_found_title: string;
  not_found_description: string;
  
  // Time related
  date: string;
  time: string;
  duration: string;
  
  // Quantities
  total: string;
  amount: string;
  
  // Navigation
  navigation_dashboard: string;
  navigation_user_management: string;
  navigation_asset_information: string;
  navigation_fiduciary: string;
  navigation_treasury: string;
  navigation_token_allocation: string;
  navigation_process_document: string;
}

export type SidebarTranslations = typeof enSidebar | typeof esSidebar;

export interface AuthTranslations {
  welcome: string;
  enter_credentials: string;
  email: string;
  password: string;
  remember_me: string;
  forgot_password: string;
  sign_in: string;
  sign_in_loading: string;
  sign_up: string;
  sign_up_loading: string;
  sign_up_success: string;
  sign_up_error: string;
  sign_up_error_title: string;
  sign_up_error_description: string;
  sign_up_error_button: string; 
}

export interface TwoFATranslations {
  setup: {
    title: string;
    description: string;
    start: string;
    error: string;
    success: string;
  };
  verify: {
    title: string;
    description: string;
    manual: string;
    code: string;
    verify: string;
    error: string;
    recovery: string;
  };
  recovery: {
    title: string;
    description: string;
    warning: string;
    continue: string;
  };
}

export interface TranslationKeys {
  common: CommonTranslations;
  sidebar: SidebarTranslations;
  auth: AuthTranslations;
  twoFA: TwoFATranslations;
  // Aquí puedes agregar más namespaces como:
  // users: UserTranslations;
  // projects: ProjectTranslations;
}

export type TranslationKey = {
  [K in keyof TranslationKeys]: {
    [P in keyof TranslationKeys[K]]: string;
  };
};

export type TFunction = {
  (key: string): string;  // Allow any string key to support nested paths
}; 