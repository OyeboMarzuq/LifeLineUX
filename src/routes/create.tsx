import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { campaignsApi } from "@/lib/api/campaigns";
import { ApiError } from "@/lib/api/client";
import { RoleGuard } from "@/components/role-guard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/create")({
  component: () => (
    <RoleGuard roles={["CampaignCreator", "Organization", "SuperAdmin"]}>
      <CreatePage />
    </RoleGuard>
  ),
  head: () => ({ meta: [{ title: "Start a fundraiser — LifeLine" }] }),
});

function CreatePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    patientName: "",
    medicalCondition: "",
    story: "",
    goalAmount: 500000,
    surgeryDate: "",
    bankCode: "",
    accountNumber: "",
    accountName: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<Array<{ file: File; type: "hospital_bill" | "medical_report" | "doctor_letter" | "other" }>>([]);
  const [busy, setBusy] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);

  const { data: banks = [], isLoading: banksLoading } = useQuery({
    queryKey: ["banks"],
    queryFn: () => campaignsApi.banks(),
    staleTime: 1000 * 60 * 60,
  });
  const selectedBank = useMemo(() => banks.find((b) => b.code === form.bankCode), [banks, form.bankCode]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = useMutation({
    mutationFn: async () => {
      setBusy(true);
      const created = await campaignsApi.create({
        title: form.title,
        patientName: form.patientName,
        medicalCondition: form.medicalCondition,
        story: form.story,
        goalAmount: Number(form.goalAmount),
        surgeryDate: form.surgeryDate || undefined,
        bankCode: form.bankCode,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
      });
      if (coverFile) await campaignsApi.uploadCoverImage(created.id, coverFile);
      for (const d of docs) await campaignsApi.uploadDocument(created.id, d.file, d.type);
      return created;
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created. It is now pending verification.");
      navigate({ to: "/campaigns/$slug", params: { slug: c.slug } });
    },
    onError: (err: unknown) => {
      const m = err instanceof ApiError ? err.message : "Could not create campaign.";
      toast.error(m);
      if (err instanceof ApiError && err.fieldErrors?.length) {
        err.fieldErrors.forEach((e) => toast.error(e));
      }
    },
    onSettled: () => setBusy(false),
  });

  return (
    <div className="container-page py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold">Start a fundraiser</h1>
      <p className="text-muted-foreground mt-2">Verification typically completes within 24 hours.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); submit.mutate(); }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-soft mt-6 space-y-5"
      >
        <Field label="Campaign title" hint="10–150 characters">
          <input required minLength={10} maxLength={150} className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Help Amaka through open-heart surgery" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Patient full name">
            <input required maxLength={100} className={inputCls} value={form.patientName} onChange={(e) => set("patientName", e.target.value)} />
          </Field>
          <Field label="Medical condition" hint="Max 200 characters">
            <input required maxLength={200} className={inputCls} value={form.medicalCondition} onChange={(e) => set("medicalCondition", e.target.value)} />
          </Field>
        </div>

        <Field label="Story" hint="100–5,000 characters">
          <textarea required minLength={100} maxLength={5000} rows={6} className={inputCls + " resize-y"} value={form.story} onChange={(e) => set("story", e.target.value)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Goal amount (₦)" hint="Min ₦1,000 · Max ₦100,000,000">
            <input required type="number" min={1000} max={100000000} className={inputCls} value={form.goalAmount} onChange={(e) => set("goalAmount", Number(e.target.value) as never)} />
          </Field>
          <Field label="Surgery date (optional)">
            <input type="date" className={inputCls} value={form.surgeryDate} onChange={(e) => set("surgeryDate", e.target.value)} />
          </Field>
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="font-semibold text-sm mb-3">Payout bank account</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Bank name">
              <Popover open={bankOpen} onOpenChange={setBankOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    role="combobox"
                    aria-expanded={bankOpen}
                    className={cn(inputCls, "flex items-center justify-between text-left")}
                    disabled={banksLoading}
                  >
                    <span className={cn("truncate", !selectedBank && "text-muted-foreground")}>
                      {selectedBank ? selectedBank.name : banksLoading ? "Loading banks…" : "Select bank"}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start">
                  <Command
                    filter={(value, search) =>
                      value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                    }
                  >
                    <CommandInput placeholder="Search bank…" />
                    <CommandList>
                      <CommandEmpty>No bank found.</CommandEmpty>
                      <CommandGroup>
                        {banks.map((b) => (
                          <CommandItem
                            key={b.code}
                            value={b.name}
                            onSelect={() => {
                              set("bankCode", b.code);
                              setBankOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", form.bankCode === b.code ? "opacity-100" : "opacity-0")} />
                            {b.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {/* Native required validation via a hidden input */}
              <input tabIndex={-1} aria-hidden className="sr-only" required value={form.bankCode} onChange={() => {}} />
            </Field>
            <Field label="Account number" hint="10 digits">
              <input required pattern="\d{10}" maxLength={10} className={inputCls} value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Account name">
              <input required maxLength={100} className={inputCls} value={form.accountName} onChange={(e) => set("accountName", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="font-semibold text-sm mb-3">Cover image (optional)</h2>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} className="text-sm" />
          {coverFile && <p className="text-xs text-muted-foreground mt-1">{coverFile.name}</p>}
          <p className="text-xs text-muted-foreground mt-1">Max 5MB. JPG, PNG, or WebP.</p>
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="font-semibold text-sm mb-3">Medical documents (optional)</h2>
          <p className="text-xs text-muted-foreground mb-3">PDF / JPG / PNG up to 10MB each. These speed up verification.</p>
          <div className="space-y-2">
            {docs.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate">{d.file.name}</span>
                <select
                  value={d.type}
                  onChange={(e) => setDocs((arr) => arr.map((x, j) => (j === i ? { ...x, type: e.target.value as typeof d.type } : x)))}
                  className="h-9 px-2 rounded-md border border-border bg-background text-xs"
                >
                  <option value="hospital_bill">Hospital bill</option>
                  <option value="medical_report">Medical report</option>
                  <option value="doctor_letter">Doctor letter</option>
                  <option value="other">Other</option>
                </select>
                <button type="button" onClick={() => setDocs((arr) => arr.filter((_, j) => j !== i))} className="text-xs text-destructive">Remove</button>
              </div>
            ))}
          </div>
          <label className="mt-3 inline-block">
            <span className="h-9 px-3 inline-flex items-center rounded-md border border-border bg-background text-xs font-medium cursor-pointer hover:bg-muted">+ Add document</span>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setDocs((arr) => [...arr, { file: f, type: "hospital_bill" }]);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Cancel</Link>
          <button disabled={busy || submit.isPending} className="h-11 px-6 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50">
            {busy || submit.isPending ? "Submitting…" : "Submit for verification"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-11 px-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring text-sm";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
