"use client";

import { NDAFormData } from "@/lib/ndaGenerator";

interface Props {
  data: NDAFormData;
  onChange: (data: NDAFormData) => void;
}

export default function NDAForm({ data, onChange }: Props) {
  function set<K extends keyof NDAFormData>(key: K, value: NDAFormData[K]) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-8">

      {/* ── Agreement Terms ── */}
      <section>
        <h3 className="form-section-title">Agreement Terms</h3>
        <div className="space-y-4">

          <div>
            <label className="form-label">Purpose</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="How Confidential Information may be used…"
              value={data.purpose}
              onChange={(e) => set("purpose", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Effective Date</label>
            <input
              type="date"
              className="form-input"
              value={data.effectiveDate}
              onChange={(e) => set("effectiveDate", e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">MNDA Term</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="mndaTermType"
                  value="expires"
                  checked={data.mndaTermType === "expires"}
                  onChange={() => set("mndaTermType", "expires")}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Expires after
                </span>
                <input
                  type="text"
                  className="form-input !w-28 !py-1"
                  placeholder="1 year(s)"
                  value={data.mndaTermDuration}
                  disabled={data.mndaTermType !== "expires"}
                  onChange={(e) => set("mndaTermDuration", e.target.value)}
                />
                <span className="text-gray-500 text-xs">from Effective Date</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="mndaTermType"
                  value="continues"
                  checked={data.mndaTermType === "continues"}
                  onChange={() => set("mndaTermType", "continues")}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  Continues until terminated
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="form-label">Term of Confidentiality</label>
            <div className="flex flex-col gap-2 mt-1">
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  value="fixed"
                  checked={data.confidentialityTermType === "fixed"}
                  onChange={() => set("confidentialityTermType", "fixed")}
                  className="h-4 w-4 accent-brand-600"
                />
                <input
                  type="text"
                  className="form-input !w-28 !py-1"
                  placeholder="1 year(s)"
                  value={data.confidentialityDuration}
                  disabled={data.confidentialityTermType !== "fixed"}
                  onChange={(e) => set("confidentialityDuration", e.target.value)}
                />
                <span className="text-gray-500 text-xs">from Effective Date</span>
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer group">
                <input
                  type="radio"
                  name="confidentialityTermType"
                  value="perpetual"
                  checked={data.confidentialityTermType === "perpetual"}
                  onChange={() => set("confidentialityTermType", "perpetual")}
                  className="h-4 w-4 accent-brand-600"
                />
                <span className="text-gray-600 group-hover:text-gray-900 transition-colors">
                  In perpetuity
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Governing Law</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Delaware"
                value={data.governingLaw}
                onChange={(e) => set("governingLaw", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Jurisdiction</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. New Castle, DE"
                value={data.jurisdiction}
                onChange={(e) => set("jurisdiction", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Modifications <span className="normal-case font-normal text-gray-400">(optional)</span></label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Any modifications to the standard terms…"
              value={data.modifications}
              onChange={(e) => set("modifications", e.target.value)}
            />
          </div>

        </div>
      </section>

      {/* ── Parties ── */}
      <section>
        <h3 className="form-section-title">Parties</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Party 1 */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Party 1</p>
            <div>
              <label className="form-label">Company</label>
              <input type="text" className="form-input" placeholder="Acme Corp"
                value={data.party1Company} onChange={(e) => set("party1Company", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Signer Name</label>
              <input type="text" className="form-input" placeholder="Jane Smith"
                value={data.party1Name} onChange={(e) => set("party1Name", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Title</label>
              <input type="text" className="form-input" placeholder="CEO"
                value={data.party1Title} onChange={(e) => set("party1Title", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Notice Address</label>
              <input type="text" className="form-input" placeholder="jane@acme.com"
                value={data.party1Address} onChange={(e) => set("party1Address", e.target.value)} />
            </div>
          </div>

          {/* Party 2 */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Party 2</p>
            <div>
              <label className="form-label">Company</label>
              <input type="text" className="form-input" placeholder="Beta Inc"
                value={data.party2Company} onChange={(e) => set("party2Company", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Signer Name</label>
              <input type="text" className="form-input" placeholder="John Doe"
                value={data.party2Name} onChange={(e) => set("party2Name", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Title</label>
              <input type="text" className="form-input" placeholder="VP Legal"
                value={data.party2Title} onChange={(e) => set("party2Title", e.target.value)} />
            </div>
            <div>
              <label className="form-label">Notice Address</label>
              <input type="text" className="form-input" placeholder="john@beta.com"
                value={data.party2Address} onChange={(e) => set("party2Address", e.target.value)} />
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
