export interface FieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: "text" | "textarea" | "date" | "choice";
  choices?: { value: string; label: string }[];
  optional?: boolean;
  dependsOn?: { key: string; value: string };
}

export interface SectionConfig {
  title: string;
  fields: FieldConfig[];
}

export interface PartySignatoryFields {
  name?: string;
  title?: string;
  company?: string;
  address?: string;
}

export interface DocumentTypeConfig {
  key: string;
  name: string;
  description: string;
  intro: string;
  sections: SectionConfig[];
  hasSignatureBlock: boolean;
  party1Label?: string;
  party2Label?: string;
  party1Fields?: PartySignatoryFields;
  party2Fields?: PartySignatoryFields;
  sourceUrl?: string;
  sourceName?: string;
}

export type FormData = Record<string, string>;

export function defaultFormData(config: DocumentTypeConfig): FormData {
  const data: FormData = {};
  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === "choice" && field.choices?.length) {
        data[field.key] = field.choices[0].value;
      } else {
        data[field.key] = "";
      }
    }
  }
  return data;
}

export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  "mutual-nda": {
    key: "mutual-nda",
    name: "Mutual Non-Disclosure Agreement",
    description: "A mutual (bilateral) NDA protecting confidential information shared between two parties exploring a potential business relationship.",
    intro: "This Mutual Non-Disclosure Agreement (the \"MNDA\") consists of: (1) this Cover Page and (2) the Common Paper Mutual NDA Standard Terms Version 1.0, identical to those posted at commonpaper.com/standards/mutual-nda/1.0. Any modifications of the Standard Terms should be made on the Cover Page.",
    hasSignatureBlock: true,
    party1Label: "Party 1",
    party2Label: "Party 2",
    party1Fields: { name: "party1Name", title: "party1Title", company: "party1Company", address: "party1Address" },
    party2Fields: { name: "party2Name", title: "party2Title", company: "party2Company", address: "party2Address" },
    sourceUrl: "https://commonpaper.com/standards/mutual-nda/1.0",
    sourceName: "Common Paper Mutual NDA v1.0",
    sections: [
      {
        title: "Agreement Terms",
        fields: [
          { key: "purpose", label: "Purpose", placeholder: "Evaluating whether to enter into a business relationship with the other party.", type: "textarea" },
          { key: "effectiveDate", label: "Effective Date", placeholder: "", type: "date" },
          { key: "mndaTermType", label: "MNDA Term", placeholder: "", type: "choice", choices: [{ value: "expires", label: "Expires after fixed period" }, { value: "continues", label: "Continues until terminated" }] },
          { key: "mndaTermDuration", label: "Term Duration", placeholder: "1 year(s)", type: "text", dependsOn: { key: "mndaTermType", value: "expires" } },
          { key: "confidentialityTermType", label: "Term of Confidentiality", placeholder: "", type: "choice", choices: [{ value: "fixed", label: "Fixed period" }, { value: "perpetual", label: "In perpetuity" }] },
          { key: "confidentialityDuration", label: "Confidentiality Duration", placeholder: "1 year(s)", type: "text", dependsOn: { key: "confidentialityTermType", value: "fixed" } },
          { key: "governingLaw", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "jurisdiction", label: "Jurisdiction", placeholder: "e.g. New Castle, DE", type: "text" },
          { key: "modifications", label: "Modifications", placeholder: "Any changes to standard terms (optional)", type: "textarea", optional: true },
        ],
      },
      {
        title: "Parties",
        fields: [
          { key: "party1Company", label: "Party 1 Company", placeholder: "Acme Corp", type: "text" },
          { key: "party1Name", label: "Party 1 Signer Name", placeholder: "Jane Smith", type: "text" },
          { key: "party1Title", label: "Party 1 Title", placeholder: "CEO", type: "text" },
          { key: "party1Address", label: "Party 1 Notice Address", placeholder: "jane@acme.com", type: "text" },
          { key: "party2Company", label: "Party 2 Company", placeholder: "Beta Inc", type: "text" },
          { key: "party2Name", label: "Party 2 Signer Name", placeholder: "John Doe", type: "text" },
          { key: "party2Title", label: "Party 2 Title", placeholder: "VP Legal", type: "text" },
          { key: "party2Address", label: "Party 2 Notice Address", placeholder: "john@beta.com", type: "text" },
        ],
      },
    ],
  },

  "mutual-nda-coverpage": {
    key: "mutual-nda-coverpage",
    name: "Mutual NDA Cover Page",
    description: "The fillable cover page for the Common Paper Mutual NDA. Fill in the business terms and sign with your counterparty.",
    intro: "This Cover Page incorporates the Common Paper Mutual NDA Standard Terms Version 1.0 by reference. Fill in all fields below and sign with your counterparty.",
    hasSignatureBlock: true,
    party1Label: "Party 1",
    party2Label: "Party 2",
    party1Fields: { name: "party1Name", title: "party1Title", company: "party1Company", address: "party1Address" },
    party2Fields: { name: "party2Name", title: "party2Title", company: "party2Company", address: "party2Address" },
    sourceUrl: "https://commonpaper.com/standards/mutual-nda/1.0",
    sourceName: "Common Paper Mutual NDA v1.0",
    sections: [
      {
        title: "Agreement Terms",
        fields: [
          { key: "purpose", label: "Purpose", placeholder: "Evaluating whether to enter into a business relationship with the other party.", type: "textarea" },
          { key: "effectiveDate", label: "Effective Date", placeholder: "", type: "date" },
          { key: "mndaTermType", label: "MNDA Term", placeholder: "", type: "choice", choices: [{ value: "expires", label: "Expires after fixed period" }, { value: "continues", label: "Continues until terminated" }] },
          { key: "mndaTermDuration", label: "Term Duration", placeholder: "1 year(s)", type: "text", dependsOn: { key: "mndaTermType", value: "expires" } },
          { key: "confidentialityTermType", label: "Term of Confidentiality", placeholder: "", type: "choice", choices: [{ value: "fixed", label: "Fixed period" }, { value: "perpetual", label: "In perpetuity" }] },
          { key: "confidentialityDuration", label: "Confidentiality Duration", placeholder: "1 year(s)", type: "text", dependsOn: { key: "confidentialityTermType", value: "fixed" } },
          { key: "governingLaw", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "jurisdiction", label: "Jurisdiction", placeholder: "e.g. New Castle, DE", type: "text" },
          { key: "modifications", label: "Modifications", placeholder: "Any changes to standard terms (optional)", type: "textarea", optional: true },
        ],
      },
      {
        title: "Parties",
        fields: [
          { key: "party1Company", label: "Party 1 Company", placeholder: "Acme Corp", type: "text" },
          { key: "party1Name", label: "Party 1 Signer Name", placeholder: "Jane Smith", type: "text" },
          { key: "party1Title", label: "Party 1 Title", placeholder: "CEO", type: "text" },
          { key: "party1Address", label: "Party 1 Notice Address", placeholder: "jane@acme.com", type: "text" },
          { key: "party2Company", label: "Party 2 Company", placeholder: "Beta Inc", type: "text" },
          { key: "party2Name", label: "Party 2 Signer Name", placeholder: "John Doe", type: "text" },
          { key: "party2Title", label: "Party 2 Title", placeholder: "VP Legal", type: "text" },
          { key: "party2Address", label: "Party 2 Notice Address", placeholder: "john@beta.com", type: "text" },
        ],
      },
    ],
  },

  "csa": {
    key: "csa",
    name: "Cloud Service Agreement",
    description: "A standard agreement for SaaS and cloud software vendors covering subscription terms, service levels, data handling, and liability.",
    intro: "This Cloud Service Agreement (\"CSA\") governs the subscription to and use of the Provider's cloud services. It consists of these Key Terms, an Order Form, and the Common Paper CSA Standard Terms.",
    hasSignatureBlock: true,
    party1Label: "Provider",
    party2Label: "Customer",
    party1Fields: { company: "provider_name", address: "provider_notice_address" },
    party2Fields: { company: "customer_name", address: "customer_notice_address" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme SaaS Inc.", type: "text" },
          { key: "customer_name", label: "Customer Name", placeholder: "Beta Corp", type: "text" },
          { key: "provider_notice_address", label: "Provider Notice Address", placeholder: "legal@acme.com", type: "text" },
          { key: "customer_notice_address", label: "Customer Notice Address", placeholder: "legal@beta.com", type: "text" },
        ],
      },
      {
        title: "Key Terms",
        fields: [
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. Delaware Court of Chancery", type: "text" },
          { key: "general_cap_amount", label: "General Liability Cap", placeholder: "e.g. fees paid in the prior 12 months", type: "text" },
          { key: "increased_cap_amount", label: "Increased Liability Cap", placeholder: "e.g. 2× fees paid in the prior 12 months", type: "text" },
          { key: "increased_claims", label: "Claims with Increased Cap", placeholder: "e.g. IP infringement, data breach", type: "textarea" },
          { key: "unlimited_claims", label: "Uncapped Claims", placeholder: "e.g. fraud, willful misconduct", type: "textarea" },
          { key: "provider_covered_claims", label: "Provider Indemnification", placeholder: "e.g. third-party IP infringement claims", type: "textarea" },
          { key: "customer_covered_claims", label: "Customer Indemnification", placeholder: "e.g. misuse of customer data", type: "textarea" },
          { key: "additional_warranties", label: "Additional Warranties", placeholder: "Any additional warranty obligations", type: "textarea", optional: true },
          { key: "dpa", label: "Data Processing Agreement", placeholder: "e.g. Exhibit A", type: "text", optional: true },
        ],
      },
      {
        title: "Order Form",
        fields: [
          { key: "subscription_period", label: "Subscription Period", placeholder: "e.g. 12 months starting from Order Date", type: "text" },
          { key: "order_date", label: "Order Date", placeholder: "", type: "date" },
          { key: "non_renewal_notice_date", label: "Non-Renewal Notice", placeholder: "e.g. 30 days before end of Subscription Period", type: "text" },
          { key: "technical_support", label: "Technical Support", placeholder: "e.g. Standard email support, 9–5 PT", type: "textarea" },
          { key: "use_limitations", label: "Use Limitations", placeholder: "e.g. Up to 50 users", type: "text" },
          { key: "payment_process", label: "Payment Process", placeholder: "e.g. Annual invoice, net 30", type: "text" },
          { key: "scheduled_downtime", label: "Scheduled Downtime", placeholder: "e.g. Sundays 2–4 AM PT", type: "text", optional: true },
        ],
      },
    ],
  },

  "design-partner": {
    key: "design-partner",
    name: "Design Partner Agreement",
    description: "An agreement for early-stage product partnerships, allowing a vendor to work with a design partner to shape product development.",
    intro: "This Design Partner Agreement (the \"Agreement\") governs the relationship between the Provider and the Design Partner for the purposes of early-stage product development collaboration.",
    hasSignatureBlock: true,
    party1Label: "Provider",
    party2Label: "Design Partner",
    party1Fields: { company: "provider_name", address: "notice_address" },
    party2Fields: { company: "partner_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme Inc.", type: "text" },
          { key: "partner_name", label: "Design Partner Name", placeholder: "Beta Corp", type: "text" },
        ],
      },
      {
        title: "Agreement Terms",
        fields: [
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "term", label: "Term", placeholder: "e.g. 6 months", type: "text" },
          { key: "program", label: "Program Description", placeholder: "Description of the design partner program and partner's expected participation", type: "textarea" },
          { key: "fees", label: "Fees", placeholder: "e.g. No fees — product access provided in exchange for feedback", type: "text", optional: true },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. California", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. San Francisco Superior Court", type: "text" },
          { key: "notice_address", label: "Notice Addresses", placeholder: "Provider: legal@acme.com; Partner: legal@beta.com", type: "textarea" },
        ],
      },
    ],
  },

  "sla": {
    key: "sla",
    name: "Service Level Agreement",
    description: "Defines uptime, performance commitments, and remedies a cloud service provider makes to its customers.",
    intro: "This Service Level Agreement (\"SLA\") is incorporated into and forms part of the Cloud Service Agreement between the Provider and Customer. It defines the service levels and remedies for failure to meet those levels.",
    hasSignatureBlock: false,
    party1Label: "Provider",
    party2Label: "Customer",
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme SaaS Inc.", type: "text" },
          { key: "customer_name", label: "Customer Name", placeholder: "Beta Corp", type: "text" },
          { key: "subscription_period", label: "Subscription Period", placeholder: "e.g. 12 months from Order Date", type: "text" },
        ],
      },
      {
        title: "Uptime Commitment",
        fields: [
          { key: "target_uptime", label: "Target Uptime", placeholder: "e.g. 99.9%", type: "text" },
          { key: "uptime_credit", label: "Uptime Credit", placeholder: "e.g. 10% of monthly fee per 0.1% below target", type: "textarea" },
          { key: "scheduled_downtime", label: "Scheduled Downtime", placeholder: "e.g. Sundays 2–4 AM PT (excluded from uptime calc)", type: "text", optional: true },
        ],
      },
      {
        title: "Support Commitment",
        fields: [
          { key: "target_response_time", label: "Target Response Time", placeholder: "e.g. 4 business hours for critical issues", type: "text" },
          { key: "response_time_credit", label: "Response Time Credit", placeholder: "e.g. 5% of monthly fee per missed SLA", type: "textarea" },
          { key: "support_channel", label: "Support Channel", placeholder: "e.g. support@acme.com or in-app ticket", type: "text" },
        ],
      },
    ],
  },

  "psa": {
    key: "psa",
    name: "Professional Services Agreement",
    description: "A standard agreement for professional and consulting services engagements covering scope, deliverables, payment, IP, and confidentiality.",
    intro: "This Professional Services Agreement (\"PSA\") governs the provision of professional services by the Provider to the Customer. It consists of these Key Terms and one or more Statements of Work (SOWs).",
    hasSignatureBlock: true,
    party1Label: "Provider",
    party2Label: "Customer",
    party1Fields: { company: "provider_name", address: "notice_address" },
    party2Fields: { company: "customer_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme Consulting Inc.", type: "text" },
          { key: "customer_name", label: "Customer Name", placeholder: "Beta Corp", type: "text" },
          { key: "notice_address", label: "Notice Addresses", placeholder: "Provider: legal@acme.com; Customer: legal@beta.com", type: "textarea" },
        ],
      },
      {
        title: "Key Terms",
        fields: [
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. New York", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. New York Supreme Court", type: "text" },
          { key: "general_cap_amount", label: "General Liability Cap", placeholder: "e.g. fees paid in the prior 12 months", type: "text" },
          { key: "increased_cap_amount", label: "Increased Liability Cap", placeholder: "e.g. 2× fees paid", type: "text" },
          { key: "increased_claims", label: "Claims with Increased Cap", placeholder: "e.g. IP infringement, data breach", type: "textarea" },
          { key: "unlimited_claims", label: "Uncapped Claims", placeholder: "e.g. fraud, willful misconduct", type: "textarea" },
          { key: "provider_covered_claims", label: "Provider Indemnification", placeholder: "e.g. third-party IP claims against deliverables", type: "textarea" },
          { key: "customer_covered_claims", label: "Customer Indemnification", placeholder: "e.g. misuse of deliverables", type: "textarea" },
          { key: "security_policy", label: "Security Policy", placeholder: "e.g. ISO 27001 / SOC 2 Type II", type: "text" },
          { key: "insurance_minimums", label: "Insurance Minimums", placeholder: "e.g. $2M commercial general liability", type: "text" },
          { key: "additional_warranties", label: "Additional Warranties", placeholder: "Optional", type: "textarea", optional: true },
          { key: "customer_policies", label: "Customer Policies", placeholder: "Internal policies provider must follow (optional)", type: "textarea", optional: true },
          { key: "dpa", label: "Data Processing Agreement", placeholder: "e.g. Exhibit A", type: "text", optional: true },
        ],
      },
      {
        title: "Statement of Work",
        fields: [
          { key: "deliverables", label: "Deliverables", placeholder: "What is being delivered", type: "textarea" },
          { key: "fees", label: "Fees", placeholder: "e.g. $15,000 fixed fee or $200/hr", type: "text" },
          { key: "payment_period", label: "Payment Period", placeholder: "e.g. 30 days from invoice", type: "text" },
          { key: "rejection_period", label: "Rejection Period", placeholder: "e.g. 10 business days to review and reject", type: "text" },
          { key: "resubmission_period", label: "Resubmission Period", placeholder: "e.g. 10 business days to resubmit", type: "text" },
          { key: "time_of_assignment", label: "IP Assignment", placeholder: "e.g. Upon final payment", type: "text" },
          { key: "customer_obligations", label: "Customer Obligations", placeholder: "e.g. Provide timely feedback and access to systems", type: "textarea" },
          { key: "sow_term", label: "SOW Term", placeholder: "e.g. 3 months from execution", type: "text" },
        ],
      },
    ],
  },

  "dpa": {
    key: "dpa",
    name: "Data Processing Agreement",
    description: "A GDPR-compliant DPA defining the obligations of a data processor on behalf of a data controller.",
    intro: "This Data Processing Agreement (\"DPA\") is incorporated into and forms part of the agreement between the Processor (Provider) and Controller (Customer). It governs the processing of personal data in accordance with applicable data protection law.",
    hasSignatureBlock: true,
    party1Label: "Processor (Provider)",
    party2Label: "Controller (Customer)",
    party1Fields: { company: "provider_name" },
    party2Fields: { company: "customer_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Processor Name (Provider)", placeholder: "Acme Inc.", type: "text" },
          { key: "customer_name", label: "Controller Name (Customer)", placeholder: "Beta Corp", type: "text" },
          { key: "agreement", label: "Underlying Agreement", placeholder: "e.g. Cloud Service Agreement dated 2024-01-01", type: "text" },
        ],
      },
      {
        title: "Processing Details",
        fields: [
          { key: "categories_of_personal_data", label: "Categories of Personal Data", placeholder: "e.g. names, email addresses, usage logs", type: "textarea" },
          { key: "categories_of_data_subjects", label: "Categories of Data Subjects", placeholder: "e.g. employees, end users of the platform", type: "textarea" },
          { key: "nature_and_purpose_of_processing", label: "Nature and Purpose of Processing", placeholder: "e.g. storage and processing for SaaS platform operation", type: "textarea" },
          { key: "frequency_of_transfer", label: "Frequency of Transfer", placeholder: "e.g. continuous / real-time", type: "text" },
          { key: "duration_of_processing", label: "Duration of Processing", placeholder: "e.g. term of services plus 90 days", type: "text" },
          { key: "special_category_data", label: "Special Category Data", placeholder: "Any GDPR Article 9 data (health, biometrics, etc.) — leave blank if none", type: "text", optional: true },
          { key: "special_category_data_restrictions", label: "Special Category Safeguards", placeholder: "Required safeguards for special category data", type: "textarea", optional: true },
          { key: "approved_subprocessors", label: "Approved Sub-processors", placeholder: "e.g. AWS (infrastructure), Stripe (payments)", type: "textarea", optional: true },
        ],
      },
      {
        title: "Governance",
        fields: [
          { key: "governing_member_state", label: "Governing EU Member State", placeholder: "e.g. Ireland", type: "text" },
          { key: "security_policy", label: "Security Policy Reference", placeholder: "e.g. ISO 27001 / SOC 2 Type II", type: "text" },
          { key: "provider_security_contact", label: "Security Contact", placeholder: "e.g. security@acme.com", type: "text" },
        ],
      },
    ],
  },

  "software-license": {
    key: "software-license",
    name: "Software License Agreement",
    description: "A standard agreement for licensing on-premise or downloadable software covering license grants, restrictions, support, warranties, and liability.",
    intro: "This Software License Agreement (\"SLA\") governs the license of software from the Licensor to the Licensee. It consists of these Key Terms, an Order Form, and the Common Paper Software License Standard Terms.",
    hasSignatureBlock: true,
    party1Label: "Licensor (Provider)",
    party2Label: "Licensee (Customer)",
    party1Fields: { company: "provider_name", address: "provider_notice_address" },
    party2Fields: { company: "customer_name", address: "customer_notice_address" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Licensor Name", placeholder: "Acme Software Inc.", type: "text" },
          { key: "customer_name", label: "Licensee Name", placeholder: "Beta Corp", type: "text" },
          { key: "provider_notice_address", label: "Licensor Notice Address", placeholder: "legal@acme.com", type: "text" },
          { key: "customer_notice_address", label: "Licensee Notice Address", placeholder: "legal@beta.com", type: "text" },
        ],
      },
      {
        title: "Key Terms",
        fields: [
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. Delaware Court of Chancery", type: "text" },
          { key: "general_cap_amount", label: "General Liability Cap", placeholder: "e.g. fees paid in the prior 12 months", type: "text" },
          { key: "increased_cap_amount", label: "Increased Liability Cap", placeholder: "e.g. 2× fees paid", type: "text" },
          { key: "increased_claims", label: "Claims with Increased Cap", placeholder: "e.g. IP infringement, data breach", type: "textarea" },
          { key: "unlimited_claims", label: "Uncapped Claims", placeholder: "e.g. fraud, willful misconduct", type: "textarea" },
          { key: "provider_covered_claims", label: "Licensor Indemnification", placeholder: "e.g. third-party IP infringement claims", type: "textarea" },
          { key: "customer_covered_claims", label: "Licensee Indemnification", placeholder: "e.g. misuse of software", type: "textarea" },
          { key: "additional_warranties", label: "Additional Warranties", placeholder: "Optional", type: "textarea", optional: true },
        ],
      },
      {
        title: "Order Form",
        fields: [
          { key: "subscription_period", label: "License Period", placeholder: "e.g. 12 months", type: "text" },
          { key: "order_date", label: "Order Date", placeholder: "", type: "date" },
          { key: "non_renewal_notice_date", label: "Non-Renewal Notice", placeholder: "e.g. 30 days before end of License Period", type: "text" },
          { key: "permitted_uses", label: "Permitted Uses", placeholder: "e.g. Internal business operations only", type: "textarea" },
          { key: "license_limits", label: "License Limits", placeholder: "e.g. Up to 100 named users", type: "text" },
          { key: "payment_process", label: "Payment Process", placeholder: "e.g. Annual invoice, net 30", type: "text" },
          { key: "warranty_period", label: "Warranty Period", placeholder: "e.g. 90 days from delivery", type: "text" },
          { key: "deletion_procedure", label: "Deletion Procedure", placeholder: "e.g. Uninstall and certify deletion within 30 days of termination", type: "textarea" },
        ],
      },
    ],
  },

  "partnership": {
    key: "partnership",
    name: "Partnership Agreement",
    description: "A standard agreement governing a business partnership including referral arrangements, co-sell commitments, and revenue sharing.",
    intro: "This Partnership Agreement (the \"Agreement\") governs the business partnership between the Company and the Partner, including brand licensing, referral arrangements, and revenue sharing.",
    hasSignatureBlock: true,
    party1Label: "Company",
    party2Label: "Partner",
    party1Fields: { company: "company_name" },
    party2Fields: { company: "partner_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "company_name", label: "Company Name", placeholder: "Acme Inc.", type: "text" },
          { key: "partner_name", label: "Partner Name", placeholder: "Beta Corp", type: "text" },
        ],
      },
      {
        title: "Key Terms",
        fields: [
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "end_date", label: "End Date", placeholder: "", type: "date" },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. Delaware Court of Chancery", type: "text" },
          { key: "general_cap_amount", label: "General Liability Cap", placeholder: "e.g. fees paid in the prior 12 months", type: "text" },
          { key: "increased_cap_amount", label: "Increased Liability Cap", placeholder: "e.g. 2× fees paid", type: "text" },
          { key: "increased_claims", label: "Claims with Increased Cap", placeholder: "e.g. IP infringement, data breach", type: "textarea" },
          { key: "unlimited_claims", label: "Uncapped Claims", placeholder: "e.g. fraud, willful misconduct", type: "textarea" },
          { key: "company_covered_claim", label: "Company Indemnification", placeholder: "e.g. third-party claims related to Company's products", type: "textarea" },
          { key: "partner_covered_claims", label: "Partner Indemnification", placeholder: "e.g. third-party claims related to Partner's marketing", type: "textarea" },
          { key: "brand_guidelines", label: "Brand Guidelines", placeholder: "e.g. Licensor brand guidelines at acme.com/brand", type: "text" },
          { key: "additional_warranties", label: "Additional Warranties", placeholder: "Optional", type: "textarea", optional: true },
          { key: "dpa", label: "Data Processing Agreement", placeholder: "e.g. Exhibit A", type: "text", optional: true },
        ],
      },
      {
        title: "Business Terms",
        fields: [
          { key: "obligations", label: "Party Obligations", placeholder: "Describe each party's commitments (referrals, co-sell, integration, etc.)", type: "textarea" },
          { key: "territory", label: "Territory", placeholder: "e.g. Worldwide or North America", type: "text" },
          { key: "payment_process", label: "Payment Process", placeholder: "e.g. Monthly invoices, net 30", type: "text" },
          { key: "payment_schedule", label: "Payment Schedule", placeholder: "e.g. 30 days after end of each calendar quarter", type: "text" },
        ],
      },
    ],
  },

  "pilot": {
    key: "pilot",
    name: "Pilot Agreement",
    description: "A short-term trial or evaluation agreement allowing a prospective customer to test a product or service before committing.",
    intro: "This Pilot Agreement (the \"Agreement\") governs a short-term evaluation of the Provider's product or service by the Customer. It is a lightweight agreement intended for pilot use only.",
    hasSignatureBlock: true,
    party1Label: "Provider",
    party2Label: "Customer",
    party1Fields: { company: "provider_name", address: "notice_address" },
    party2Fields: { company: "customer_name" },
    sections: [
      {
        title: "Parties & Terms",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme Inc.", type: "text" },
          { key: "customer_name", label: "Customer Name", placeholder: "Beta Corp", type: "text" },
          { key: "effective_date", label: "Effective Date", placeholder: "", type: "date" },
          { key: "pilot_period", label: "Pilot Period", placeholder: "e.g. 30 days", type: "text" },
          { key: "governing_law", label: "Governing Law", placeholder: "e.g. Delaware", type: "text" },
          { key: "chosen_courts", label: "Chosen Courts", placeholder: "e.g. Delaware Court of Chancery", type: "text" },
          { key: "general_cap_amount", label: "Liability Cap", placeholder: "e.g. USD 10,000", type: "text" },
          { key: "notice_address", label: "Notice Addresses", placeholder: "Provider: legal@acme.com; Customer: legal@beta.com", type: "textarea" },
        ],
      },
    ],
  },

  "baa": {
    key: "baa",
    name: "Business Associate Agreement",
    description: "A HIPAA-compliant agreement for vendors who handle protected health information (PHI) on behalf of a covered entity.",
    intro: "This Business Associate Agreement (\"BAA\") is entered into pursuant to the Health Insurance Portability and Accountability Act (HIPAA) and governs the handling of Protected Health Information (PHI) by the Business Associate on behalf of the Covered Entity.",
    hasSignatureBlock: true,
    party1Label: "Business Associate (Provider)",
    party2Label: "Covered Entity",
    party1Fields: { company: "provider_name" },
    party2Fields: { company: "company_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Business Associate Name", placeholder: "Acme Health Tech Inc.", type: "text" },
          { key: "company_name", label: "Covered Entity Name", placeholder: "Beta Health System", type: "text" },
          { key: "agreement", label: "Underlying Agreement", placeholder: "e.g. Cloud Service Agreement dated 2024-01-01", type: "text" },
        ],
      },
      {
        title: "BAA Terms",
        fields: [
          { key: "baa_effective_date", label: "BAA Effective Date", placeholder: "", type: "date" },
          { key: "breach_notification_period", label: "Breach Notification Period", placeholder: "e.g. without unreasonable delay and no later than 60 days after discovery", type: "textarea" },
          { key: "limitations", label: "Limitations", placeholder: "Any restrictions on offshoring PHI, de-identification, or data aggregation (optional)", type: "textarea", optional: true },
        ],
      },
    ],
  },

  "ai-addendum": {
    key: "ai-addendum",
    name: "AI Addendum",
    description: "An addendum covering AI-specific provisions including data usage for model training, AI output disclaimers, and acceptable use restrictions.",
    intro: "This AI Addendum (the \"Addendum\") supplements and is incorporated into the agreement between Provider and Customer. It governs the use of AI-powered features and any use of Customer Data for AI model training or improvement.",
    hasSignatureBlock: true,
    party1Label: "Provider",
    party2Label: "Customer",
    party1Fields: { company: "provider_name" },
    party2Fields: { company: "customer_name" },
    sections: [
      {
        title: "Parties",
        fields: [
          { key: "provider_name", label: "Provider Name", placeholder: "Acme AI Inc.", type: "text" },
          { key: "customer_name", label: "Customer Name", placeholder: "Beta Corp", type: "text" },
        ],
      },
      {
        title: "AI Data Usage",
        fields: [
          { key: "training_data", label: "Training Data Definition", placeholder: "Definition of Customer Data that may be used for training (or leave blank if none)", type: "textarea", optional: true },
          { key: "training_purposes", label: "Permitted Training Purposes", placeholder: "e.g. Improving the Provider's AI models for general use", type: "textarea", optional: true },
          { key: "training_restrictions", label: "Training Restrictions", placeholder: "e.g. Provider may not use Customer Data to train models for third parties or competitors", type: "textarea" },
          { key: "improvement_restrictions", label: "Product Improvement Restrictions", placeholder: "e.g. Aggregated anonymized data may be used for model quality improvements", type: "textarea" },
        ],
      },
    ],
  },
};
