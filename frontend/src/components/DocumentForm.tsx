"use client";

import { DocumentTypeConfig, FieldConfig, FormData } from "@/lib/documentTypes";

interface Props {
  config: DocumentTypeConfig;
  data: FormData;
  onChange: (data: FormData) => void;
}

function Field({ field, value, disabled, onChange }: {
  field: FieldConfig;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  if (field.type === "choice" && field.choices) {
    return (
      <div className="flex flex-col gap-2 mt-1">
        {field.choices.map((choice) => (
          <label key={choice.value} className="flex items-center gap-3 text-sm cursor-pointer group">
            <input
              type="radio"
              name={field.key}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              className="h-4 w-4 accent-brand-600"
            />
            <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
              {choice.label}
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        className="form-textarea"
        rows={3}
        placeholder={field.placeholder}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type={field.type === "date" ? "date" : "text"}
      className="form-input"
      placeholder={field.placeholder}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export default function DocumentForm({ config, data, onChange }: Props) {
  function set(key: string, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-8">
      {config.sections.map((section) => (
        <section key={section.title}>
          <h3 className="form-section-title">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((field) => {
              const isDisabled = !!(
                field.dependsOn && data[field.dependsOn.key] !== field.dependsOn.value
              );
              return (
                <div key={field.key}>
                  <label className="form-label">
                    {field.label}
                    {field.optional && (
                      <span className="normal-case font-normal text-gray-400 ml-1">(optional)</span>
                    )}
                  </label>
                  <Field
                    field={field}
                    value={data[field.key] ?? ""}
                    disabled={isDisabled}
                    onChange={(v) => set(field.key, v)}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
