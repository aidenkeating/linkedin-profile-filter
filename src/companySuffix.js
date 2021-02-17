import { countryIsoMap } from "./countries";

const commonFactories = [
  { suffix: "gmbh & co kg" },
  { suffix: "gmbh & co.kg" },
  { suffix: "gmbh & co. kg" },
  { suffix: "gmbh & co.kg" },
  { suffix: "ag & co ohg" },
  { suffix: "ltd. & co. kg" },
  { suffix: "ltd. & co kg" },
  { suffix: "ltd. & co.kg" },
  { suffix: "(Pty} Ltd" },
  { suffix: "(Pty} Ltd." },
  { suffix: " emea", endsWith: true },
  { suffix: " germany", endsWith: true },
  { suffix: "mini gmbh" },
  { suffix: "gmbh" },
  { suffix: " ag", endsWith: true },
  { suffix: "a.g." },
  { suffix: " sa", endsWith: true },
  { suffix: "s.l." },
  { suffix: "ltd." },
  { suffix: "ltd" },
  { suffix: "sp z.o.o" },
  { suffix: "sp. z o.o." },
  { suffix: "d.o.o." },
  { suffix: "b.v." },
  { suffix: " limited", endsWith: true },
  { suffix: " oy", endsWith: true },
  { suffix: "llc" },
  { suffix: "s.l." },
  { suffix: "s.p.a." },
  { suffix: " spa", endsWith: true },
  { suffix: "d.o.o." },
  { suffix: " a/s", endsWith: true },
  { suffix: "s.r.o." },
  { suffix: "a.s." },
  { suffix: "a. s." },
  { suffix: " lda", endsWith: true },
  { suffix: " sarl", endsWith: true },
  { suffix: " spol s.r.o.", endsWith: true },
  { suffix: ", PT.", endsWith: true},
  { suffix: "PT. "},
  { suffix: "PT "},
  { suffix: "." },
  { suffix: "," },
];

const GenerateNamesForCompay = (company, location) => {
  if (!company || !location) {
      return []
  } 

  const companies = [];

  companies.push(company);

  // Parse out location from company
  const isoLocation = countryIsoMap[location.toLowerCase()];
  if (isoLocation) {
    company = company.replace(isoLocation, "").replace("  ", " ");

    if (!companies.includes(company)) {
      companies.push(company.trim());
    }
  }

  // Parse out any known suffix from the company name
  commonFactories.forEach((companySuffix) => {
    if (company.includes(companySuffix.suffix)) {
      company = company.replace(companySuffix.suffix, "").replace("  ", " ");
      companies.push(company.trim());
    }
  });

  return companies;
};

export { commonFactories, GenerateNamesForCompay };
