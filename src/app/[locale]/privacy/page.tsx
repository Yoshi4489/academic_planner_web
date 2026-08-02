import {LegalPage} from "@/components/legal-page";
export default async function PrivacyPage({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return <LegalPage locale={locale} type="privacy"/>;}
