import { cookies } from "next/headers";
import { ADMIN_LANG_COOKIE, DEFAULT_ADMIN_LANG, adminMessages, isAdminLang, type AdminLang } from "./i18n";

/** The dashboard language chosen with the switcher (cookie), Arabic by default. */
export async function getAdminLang(): Promise<AdminLang> {
  const value = (await cookies()).get(ADMIN_LANG_COOKIE)?.value;
  return isAdminLang(value) ? value : DEFAULT_ADMIN_LANG;
}

/** The dashboard text in the chosen language. */
export async function getAdminT() {
  return adminMessages[await getAdminLang()];
}
