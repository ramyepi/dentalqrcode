import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const PrintQR: React.FC = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const query = useQuery();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<any>(null);

  // Load clinic data from query params (or could use state/navigation)
  useEffect(() => {
    const c = {
      clinic_name: query.get('clinic_name') || '',
      license_number: query.get('license_number') || '',
      doctor_name: query.get('doctor_name') || '',
      specialization: query.get('specialization') || '',
      governorate: query.get('governorate') || '',
      city: query.get('city') || '',
      address: query.get('address') || '',
    };
    setClinic(c);
  }, [window.location.search]);

  // Get print settings
  const getSetting = (key: string, def = '') => settings?.find(s => s.key === key)?.value || def;
  const getSettingStrict = (key: string) => {
    const found = settings?.find(s => s.key === key);
    return found ? found.value : undefined;
  };
  const headerLine1 = getSettingStrict('print_header_line1');
  const headerLine2 = getSettingStrict('print_header_line2');
  const footerLine1 = getSettingStrict('print_footer_line1');
  const footerLine2 = getSettingStrict('print_footer_line2');
  // fallback to legacy only if undefined
  const legacyHeader = getSetting('print_header', '');
  const legacyFooter = getSetting('print_footer', '');
  const headerLine1Final = headerLine1 !== undefined ? headerLine1 : legacyHeader.split('<br/>')[0] || '';
  const headerLine2Final = headerLine2 !== undefined ? headerLine2 : legacyHeader.split('<br/>')[1] || '';
  const footerLine1Final = footerLine1 !== undefined ? footerLine1 : legacyFooter.split('<br/>')[0] || '';
  const footerLine2Final = footerLine2 !== undefined ? footerLine2 : legacyFooter.split('<br/>')[1] || '';
  const headerColor = getSetting('print_header_color', '#d60000');
  const footerColor = getSetting('print_footer_color', '#000000');
  const fontSize = parseInt(getSetting('print_font_size', '18'), 10);
  const logoSize = parseInt(getSetting('print_logo_size', '80'), 10);
  const logo = getSetting('print_logo_url', '');
  const titleColor = getSetting('print_title_color', '#d60000'); // legacy
  const textColor = getSetting('print_text_color', '#000');
  const bgColor = getSetting('print_bg_color', '#fff');
  const qrSize = parseInt(getSetting('print_qr_size', '320'), 10);
  const headerLine1Size = parseInt(getSetting('print_header_line1_size', '22'), 10);
  const headerLine2Size = parseInt(getSetting('print_header_line2_size', '18'), 10);
  const footerLine1Size = parseInt(getSetting('print_footer_line1_size', '16'), 10);
  const footerLine2Size = parseInt(getSetting('print_footer_line2_size', '14'), 10);
  const clinicNameSize = parseInt(getSetting('print_clinic_name_size', '20'), 10);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading || !settings || !clinic) return <div className="text-center py-12">جاري تحميل إعدادات الطباعة...</div>;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-area, #print-area * {
            visibility: visible !important;
          }
          #print-area {
            position: absolute;
            left: 0; top: 0; width: 100vw; min-height: 100vh; background: white !important;
            z-index: 9999;
          }
        }
      `}</style>
      <div
        id="print-area"
        dir="rtl"
        style={{ background: bgColor, color: textColor, minHeight: '100vh', padding: 0, margin: 0 }}
        className="flex flex-col items-center justify-center print:bg-white print:text-black"
      >
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-0 print:p-0">
          {/* Header */}
          <div className="w-full text-center mt-8 print:mt-0">
            {logo && <img src={logo} alt="شعار" className="mx-auto mb-2" style={{ maxHeight: logoSize, maxWidth: '100%' }} />}
            {headerLine1Final && (
              <div
                className="font-bold print:text-xl"
                style={{ color: headerColor, fontSize: headerLine1Size, marginBottom: Math.max(headerLine1Size * 0.3, 6), lineHeight: 1.3 }}
                dangerouslySetInnerHTML={{ __html: headerLine1Final }}
              />
            )}
            {headerLine2Final && (
              <div
                className="font-bold print:text-lg"
                style={{ color: headerColor, fontSize: headerLine2Size, marginBottom: Math.max(headerLine2Size * 0.3, 6), lineHeight: 1.3 }}
                dangerouslySetInnerHTML={{ __html: headerLine2Final }}
              />
            )}
          </div>
          {/* QR Code */}
          <div className="my-8 print:my-4 flex flex-col items-center">
            <QRCodeGenerator
              value={JSON.stringify({ type: 'clinic', license: clinic.license_number })}
              size={qrSize}
              showDownload={false}
            />
          </div>
          {/* Clinic Info (optional) */}
          <div className="text-center font-bold mb-4 print:mb-2" style={{ fontSize: clinicNameSize }}>
            {clinic.clinic_name}
          </div>
          {/* Footer */}
          <div className="w-full text-center mt-8 print:mt-4">
            {footerLine1Final && (
              <div
                className="print:text-base"
                style={{ color: footerColor, fontSize: footerLine1Size, marginBottom: Math.max(footerLine1Size * 0.3, 6), lineHeight: 1.3 }}
                dangerouslySetInnerHTML={{ __html: footerLine1Final }}
              />
            )}
            {footerLine2Final && (
              <div
                className="print:text-base"
                style={{ color: footerColor, fontSize: footerLine2Size, marginBottom: Math.max(footerLine2Size * 0.3, 6), lineHeight: 1.3 }}
                dangerouslySetInnerHTML={{ __html: footerLine2Final }}
              />
            )}
          </div>
          {/* Print Button (hide on print) */}
          <div className="mt-8 print:hidden">
            <Button onClick={handlePrint} className="px-8 py-3 text-lg">طباعة</Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="ml-4">عودة</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintQR; 