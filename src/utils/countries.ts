export interface CountryInfo {
  code: string
  label: string
  iconUrl: string
  regionLabel: string
  cityLabel: string
  dialCode: string
}

export const COUNTRIES: CountryInfo[] = [
  // Europe
  { code: 'ES', label: 'España', iconUrl: 'https://flagcdn.com/w40/es.png', regionLabel: 'Provincia', cityLabel: 'Localidad', dialCode: '+34' },
  { code: 'DE', label: 'Alemania', iconUrl: 'https://flagcdn.com/w40/de.png', regionLabel: 'Estado / Bundesland', cityLabel: 'Ciudad / Stadt', dialCode: '+49' },
  { code: 'FR', label: 'Francia', iconUrl: 'https://flagcdn.com/w40/fr.png', regionLabel: 'Región / Région', cityLabel: 'Ciudad / Ville', dialCode: '+33' },
  { code: 'IT', label: 'Italia', iconUrl: 'https://flagcdn.com/w40/it.png', regionLabel: 'Provincia', cityLabel: 'Ciudad / Città', dialCode: '+39' },
  { code: 'PT', label: 'Portugal', iconUrl: 'https://flagcdn.com/w40/pt.png', regionLabel: 'Distrito', cityLabel: 'Ciudad / Localidade', dialCode: '+351' },
  { code: 'NL', label: 'Países Bajos', iconUrl: 'https://flagcdn.com/w40/nl.png', regionLabel: 'Provincia / Provincie', cityLabel: 'Ciudad / Stad', dialCode: '+31' },
  { code: 'BE', label: 'Bélgica', iconUrl: 'https://flagcdn.com/w40/be.png', regionLabel: 'Provincia / Province', cityLabel: 'Ciudad / Ville', dialCode: '+32' },
  { code: 'PL', label: 'Polonia', iconUrl: 'https://flagcdn.com/w40/pl.png', regionLabel: 'Voivodato / Województwo', cityLabel: 'Ciudad / Miasto', dialCode: '+48' },
  { code: 'GB', label: 'Reino Unido', iconUrl: 'https://flagcdn.com/w40/gb.png', regionLabel: 'Condado / County', cityLabel: 'Ciudad / Town', dialCode: '+44' },
  { code: 'AT', label: 'Austria', iconUrl: 'https://flagcdn.com/w40/at.png', regionLabel: 'Estado / Bundesland', cityLabel: 'Ciudad / Stadt', dialCode: '+43' },
  { code: 'CH', label: 'Suiza', iconUrl: 'https://flagcdn.com/w40/ch.png', regionLabel: 'Cantón', cityLabel: 'Ciudad', dialCode: '+41' },
  { code: 'SE', label: 'Suecia', iconUrl: 'https://flagcdn.com/w40/se.png', regionLabel: 'Provincia / Län', cityLabel: 'Ciudad / Stad', dialCode: '+46' },
  { code: 'NO', label: 'Noruega', iconUrl: 'https://flagcdn.com/w40/no.png', regionLabel: 'Provincia / Fylke', cityLabel: 'Ciudad / By', dialCode: '+47' },
  { code: 'DK', label: 'Dinamarca', iconUrl: 'https://flagcdn.com/w40/dk.png', regionLabel: 'Región', cityLabel: 'Ciudad / By', dialCode: '+45' },
  { code: 'FI', label: 'Finlandia', iconUrl: 'https://flagcdn.com/w40/fi.png', regionLabel: 'Región / Maakunta', cityLabel: 'Ciudad / Kaupunki', dialCode: '+358' },
  { code: 'IE', label: 'Irlanda', iconUrl: 'https://flagcdn.com/w40/ie.png', regionLabel: 'Condado / County', cityLabel: 'Ciudad / Town', dialCode: '+353' },
  { code: 'GR', label: 'Grecia', iconUrl: 'https://flagcdn.com/w40/gr.png', regionLabel: 'Región', cityLabel: 'Ciudad', dialCode: '+30' },
  
  // Americas
  { code: 'US', label: 'Estados Unidos', iconUrl: 'https://flagcdn.com/w40/us.png', regionLabel: 'Estado / State', cityLabel: 'Ciudad / City', dialCode: '+1' },
  { code: 'CA', label: 'Canadá', iconUrl: 'https://flagcdn.com/w40/ca.png', regionLabel: 'Provincia / Province', cityLabel: 'Ciudad / City', dialCode: '+1' },
  { code: 'MX', label: 'México', iconUrl: 'https://flagcdn.com/w40/mx.png', regionLabel: 'Estado', cityLabel: 'Ciudad / Municipio', dialCode: '+52' },
  { code: 'AR', label: 'Argentina', iconUrl: 'https://flagcdn.com/w40/ar.png', regionLabel: 'Provincia', cityLabel: 'Ciudad / Localidad', dialCode: '+54' },
  { code: 'CL', label: 'Chile', iconUrl: 'https://flagcdn.com/w40/cl.png', regionLabel: 'Región', cityLabel: 'Comuna / Ciudad', dialCode: '+56' },
  { code: 'CO', label: 'Colombia', iconUrl: 'https://flagcdn.com/w40/co.png', regionLabel: 'Departamento', cityLabel: 'Municipio / Ciudad', dialCode: '+57' },
  { code: 'PE', label: 'Perú', iconUrl: 'https://flagcdn.com/w40/pe.png', regionLabel: 'Departamento', cityLabel: 'Provincia / Distrito', dialCode: '+51' },
  { code: 'BR', label: 'Brasil', iconUrl: 'https://flagcdn.com/w40/br.png', regionLabel: 'Estado', cityLabel: 'Ciudad / Cidade', dialCode: '+55' },
  
  // Asia & Oceania
  { code: 'AU', label: 'Australia', iconUrl: 'https://flagcdn.com/w40/au.png', regionLabel: 'Estado / State', cityLabel: 'Ciudad / City', dialCode: '+61' },
  { code: 'NZ', label: 'Nueva Zelanda', iconUrl: 'https://flagcdn.com/w40/nz.png', regionLabel: 'Región / Region', cityLabel: 'Ciudad / City', dialCode: '+64' },
  { code: 'JP', label: 'Japón', iconUrl: 'https://flagcdn.com/w40/jp.png', regionLabel: 'Prefectura / Prefecture', cityLabel: 'Ciudad / City', dialCode: '+81' },
]

export function getCountryByCode(code: string): CountryInfo | undefined {
  return COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase())
}
