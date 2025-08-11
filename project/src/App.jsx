import { useMemo, useState } from "react";
import { generatePlan } from "./api/generatePlan";

// ——————————————————————————
// Small primitives
// ——————————————————————————
function Card({ className = "", children }) {
  return (
    <div className={`backdrop-blur-md bg-white/5 border border-white/10 rounded-card shadow-glass p-6 md:p-10 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", className = "", disabled }) {
  const base =
    "px-5 py-2 rounded-full font-medium transition active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-white/70";
  const styles =
    variant === "primary"
      ? " bg-violet-600 hover:bg-violet-500"
      : variant === "secondary"
      ? " bg-white/10 hover:bg-white/20"
      : "";
  return (
    <button className={`${base} ${styles} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-full bg-white/95 text-slate-900 placeholder-slate-500 px-4 py-2 outline-none focus:ring-4 focus:ring-violet-400/40 shadow-inner ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-xl bg-white/95 text-slate-900 placeholder-slate-500 px-4 py-3 outline-none focus:ring-4 focus:ring-violet-400/40 shadow-inner ${className}`}
      rows={4}
      {...props}
    />
  );
}

function Checkbox({ label, checked, onChange, disabled }) {
  return (
    <label className={`flex items-center gap-2 select-none ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        className="size-4 rounded border-slate-400 bg-white/90 text-violet-600 focus:ring-violet-500"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        disabled={disabled}
      />
      <span className="text-sm md:text-base">{label}</span>
    </label>
  );
}

function Radio({ name, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 select-none">
      <input
        type="radio"
        name={name}
        className="size-4 rounded-full border-slate-400 bg-white/90 text-violet-600 focus:ring-violet-500"
        checked={checked}
        onChange={() => onChange?.()}
      />
      <span className="text-sm md:text-base">{label}</span>
    </label>
  );
}

// ——————————————————————————
// Background & Progress
// ——————————————————————————
function Starfield() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#302e81_0%,_#0b0721_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,.45))]" />
      {[...Array(60)].map((_, i) => (
        <span
          key={i}
          className="absolute block bg-white/90 rounded-full shadow-[0_0_6px_2px_rgba(255,255,255,.25)]"
          style={{
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random() * 0.8 + 0.2,
          }}
        />
      ))}
    </div>
  );
}

function ProgressBar({ step, total }) {
  const pct = (step / Math.max(1, total - 1)) * 100;
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/80 px-1">
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} className={`w-6 text-center ${i <= step ? "text-white" : "text-white/50"}`}>{i + 1}</span>
        ))}
      </div>
      <div className="relative mt-2 h-2 rounded-full bg-white/15 overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-white/40" style={{ width: pct + "%" }} />
        <div className="absolute -top-3 size-8 grid place-items-center transition-all" style={{ left: `calc(${pct}% - 16px)` }}>
          <span className="size-8 rounded-full bg-violet-600 text-white grid place-items-center shadow-lg">🚀</span>
        </div>
      </div>
    </div>
  );
}

// ——————————————————————————
// App (Wizard)
// ——————————————————————————
export default function App() {
  // Steps 0..11 are the form (progress bar shows for these).
  // Loading and Results are separate screens without progress.
  const [step, setStep] = useState(0);
  const totalSteps = 12;

  const [form, setForm] = useState({
    businessName: "",
    mainCustomers: [],
    customCustomer: "",

    mainGoal: "",
    customGoal: "",
    specialOffer: "",

    tone: "",
    unique: "",

    channels: [], // choose up to 3
    budget: "",
    timeframe: "",
  });

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const next = () => setStep((s) => Math.min(s + 1, totalSteps - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const canNext = useMemo(() => {
    switch (step) {
      case 1:
        return form.businessName.trim().length > 2;
      case 2:
        return form.mainCustomers.length > 0 || form.customCustomer.trim().length > 0;
      case 4:
        return form.mainGoal || form.customGoal.trim().length > 0;
      case 5:
        return form.specialOffer.trim().length > 0;
      case 7:
        return !!form.tone;
      case 8:
        return form.unique.trim().length > 0;
      case 10:
        return form.channels.length > 0 && form.channels.length <= 3;
      case 11:
        return !!form.budget && !!form.timeframe;
      default:
        return true;
    }
  }, [step, form]);

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]); // results (3 strings)
  const [activePlan, setActivePlan] = useState(0);

  const launch = async () => {
    setLoading(true);
    setPlans([]);

    const payload = {
      business: {
        nameAndOffer: form.businessName,
        customers: [
          ...form.mainCustomers,
          ...(form.customCustomer ? [form.customCustomer] : []),
        ],
      },
      campaign: {
        goal: form.mainGoal || form.customGoal,
        offer: form.specialOffer,
      },
      brand: { tone: form.tone, unique: form.unique },
      delivery: {
        channels: form.channels,
        budget: form.budget,
        timeframe: form.timeframe,
      },
    };

    try {
      const data = await generatePlan(payload); // swap for your API
      setPlans(data.plans || []);
      setActivePlan(0);
    } catch (e) {
      console.error(e);
      alert("There was an error generating the plan. Check console.");
    } finally {
      setLoading(false);
      setStep(totalSteps); // navigate to results screen
    }
  };

  const exportText = () => {
    const blob = new Blob([plans[activePlan] || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marketing-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative min-h-screen text-white">
      <Starfield />

      <div className="relative z-10 min-h-screen">
        {step < totalSteps && (
          <>
            <header className="pt-8">
              <ProgressBar step={step} total={totalSteps} />
            </header>

            <main className="max-w-4xl mx-auto px-6 pb-28">
              {step === 0 && (
                <div className="grid place-items-center h-[60vh]">
                  <div className="text-center space-y-6">
                    <div className="text-7xl">🚀</div>
                    <h1 className="text-2xl md:text-3xl font-bold">Welcome to Your Rocketship</h1>
                    <Button onClick={next}>Next</Button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Business Name & What You Offer</h2>
                  <Input
                    placeholder="Ex: Joe's Coffee — small-batch local coffee shop"
                    value={form.businessName}
                    onChange={(e) => update({ businessName: e.target.value })}
                  />
                  <div className="mt-6 flex justify-end">
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 2 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Your Main Customers <span className="text-white/70 text-sm">(select one or more)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                    {["Families/Parents","Students","Professionals","Seniors","Tourists","Online Shoppers"].map((c) => (
                      <Checkbox
                        key={c}
                        label={c}
                        checked={form.mainCustomers.includes(c)}
                        onChange={(checked) =>
                          update({
                            mainCustomers: checked
                              ? [...form.mainCustomers, c]
                              : form.mainCustomers.filter((x) => x !== c),
                          })
                        }
                      />
                    ))}
                    <div className="sm:col-span-2 mt-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          label="Other (specify)"
                          checked={!!form.customCustomer}
                          onChange={(checked) => !checked && update({ customCustomer: "" })}
                        />
                        <Input
                          className="max-w-xs"
                          placeholder="Enter customer"
                          value={form.customCustomer}
                          onChange={(e) => update({ customCustomer: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 3 && (
                <div className="grid place-items-center h-[50vh]">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">Your Campaign Goals</h2>
                    <Button onClick={next}>Next</Button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Main Goal</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Get new customers","Increase online sales","Promote an event","Grow my social media following","Promote a sale or special offer"].map((g) => (
                      <Radio key={g} name="mainGoal" label={g} checked={form.mainGoal === g} onChange={() => update({ mainGoal: g, customGoal: "" })} />
                    ))}
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <Radio name="mainGoal" label="Other" checked={!form.mainGoal && !!form.customGoal} onChange={() => update({ mainGoal: "", customGoal: form.customGoal || "" })} />
                      <Input className="max-w-xs" placeholder="Enter goal" value={form.customGoal} onChange={(e) => update({ customGoal: e.target.value, mainGoal: "" })} />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 5 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Special Offer or Event to Highlight?</h2>
                  <Input
                    placeholder="Ex: 20% off all drinks this week"
                    value={form.specialOffer}
                    onChange={(e) => update({ specialOffer: e.target.value })}
                  />
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 6 && (
                <div className="grid place-items-center h-[50vh]">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">Your Brand Personality</h2>
                    <Button onClick={next}>Next</Button>
                  </div>
                </div>
              )}

              {step === 7 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Tone & Style</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {["Friendly & casual","Professional & trustworthy","Premium & luxury","Fun & creative"].map((t) => (
                      <Radio key={t} name="tone" label={t} checked={form.tone === t} onChange={() => update({ tone: t })} />
                    ))}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 8 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">What Makes You Unique?</h2>
                  <Input
                    placeholder="Ex: Only organic beans roasted in‑house"
                    value={form.unique}
                    onChange={(e) => update({ unique: e.target.value })}
                  />
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 9 && (
                <div className="grid place-items-center h-[50vh]">
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl md:text-3xl font-bold">Delivery Details</h2>
                    <Button onClick={next}>Next</Button>
                  </div>
                </div>
              )}

              {step === 10 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Where Should We Promote This? <span className="text-white/70 text-sm">(select up to 3)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                    {["Instagram","Facebook","Local press/flyers","Email newsletter","Google Business/Maps","TikTok"].map((c) => {
                      const selected = form.channels.includes(c);
                      const disabled = !selected && form.channels.length >= 3;
                      return (
                        <Checkbox
                          key={c}
                          label={c}
                          checked={selected}
                          disabled={disabled}
                          onChange={(checked) =>
                            update({
                              channels: checked
                                ? [...form.channels, c]
                                : form.channels.filter((x) => x !== c),
                            })
                          }
                        />
                      );
                    })}
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={next} disabled={!canNext}>Next →</Button>
                  </div>
                </Card>
              )}

              {step === 11 && (
                <Card className="mt-16">
                  <h2 className="text-center text-xl md:text-2xl font-bold mb-6">Budget & Time‑frame</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2">Budget</label>
                      <Input placeholder="Ex: $500" value={form.budget} onChange={(e) => update({ budget: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Timeframe</label>
                      <Input placeholder="Ex: 1 month" value={form.timeframe} onChange={(e) => update({ timeframe: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between">
                    <Button variant="secondary" onClick={prev}>← Previous</Button>
                    <Button onClick={launch} disabled={!canNext}>Launch It →</Button>
                  </div>
                </Card>
              )}
            </main>
          </>
        )}

        {/* Loading screen */}
        {loading && (
          <div className="absolute inset-0 grid place-items-center">
            <Card className="w-[92vw] max-w-3xl text-center py-16">
              <div className="text-6xl mb-2 animate-bounce">🚀</div>
              <div className="text-lg">Launching your idea…</div>
            </Card>
          </div>
        )}

        {/* Results screen */}
        {!loading && step >= totalSteps && (
          <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl md:text-2xl font-bold">Rocket Ship</h1>
              <Button onClick={exportText} className="">Export</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-6">
              <div className="space-y-3">
                {[0,1,2].map((i) => (
                  <button
                    key={i}
                    onClick={() => setActivePlan(i)}
                    className={`w-full text-left px-4 py-3 rounded-card bg-white/5 hover:bg-white/10 border border-white/10 ${activePlan===i?"ring-2 ring-white/60":""}`}
                  >
                    {`Marketing strategy ${i+1}`}
                  </button>
                ))}
              </div>

              <Card className="">
                {plans.length === 0 ? (
                  <div className="opacity-80">No content yet.</div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm leading-6">{plans[activePlan]}</pre>
                )}
              </Card>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}