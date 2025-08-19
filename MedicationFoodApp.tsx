import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Utensils, Pill, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const API_URL = import.meta.env.VITE_API_URL;

interface UnderMedicationPayload {
  choice: "a";
  medicine: string | string[];
  foods: string[];
}

interface NotUnderMedicationPayload {
  choice: "b";
  foodItems: string[];
  cookingMethod: string;
}

type OutboundPayload = UnderMedicationPayload | NotUnderMedicationPayload;

const pretty = (obj: any) => JSON.stringify(obj, null, 2);

function RadioTile({ selected, onClick, title, description, icon: Icon }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={\`group relative w-full rounded-2xl border p-5 text-left transition-all shadow-sm hover:shadow-md focus:outline-none \${selected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}\`}
    >
      <div className="flex items-start gap-4">
        <div className="rounded-xl p-3 bg-gray-50 group-hover:bg-gray-100">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-lg">{title}</p>
            {selected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

function JsonBlock({ title, data }: { title: string; data: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Inspect JSON</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-xs whitespace-pre-wrap bg-gray-50 rounded-xl p-4 overflow-auto max-h-80">
{pretty(data)}
        </pre>
      </CardContent>
    </Card>
  );
}

export default function MedicationFoodApp() {
  const [step, setStep] = useState<"choose" | "under" | "not" | "result">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outbound, setOutbound] = useState<OutboundPayload | null>(null);
  const [response, setResponse] = useState<any>(null);

  const [medicines, setMedicines] = useState("");
  const [foodsA, setFoodsA] = useState("");
  const [foodsB, setFoodsB] = useState("");
  const [cookingMethod, setCookingMethod] = useState("");

  const canSubmitUnder = useMemo(() => medicines.trim().length > 0 && foodsA.trim().length > 0, [medicines, foodsA]);
  const canSubmitNot = useMemo(() => foodsB.trim().length > 0 && cookingMethod.trim().length > 0, [foodsB, cookingMethod]);

  async function callBackend(payload: OutboundPayload) {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      const json = await res.json();
      setResponse(json);
      setStep("result");
    } catch (e: any) {
      setError(e.message || "Error calling backend");
    } finally {
      setLoading(false);
    }
  }

  function submitUnder() {
    const meds = medicines.split(",").map((m) => m.trim()).filter(Boolean);
    const foods = foodsA.split(",").map((f) => f.trim()).filter(Boolean);
    const payload: UnderMedicationPayload = {
      choice: "a",
      medicine: meds.length > 1 ? meds : meds[0],
      foods,
    };
    setOutbound(payload);
    callBackend(payload);
  }

  function submitNot() {
    const foodItems = foodsB.split(",").map((f) => f.trim()).filter(Boolean);
    const payload: NotUnderMedicationPayload = {
      choice: "b",
      foodItems,
      cookingMethod: cookingMethod.trim(),
    };
    setOutbound(payload);
    callBackend(payload);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-3xl p-6 md:p-10">
        <header className="mb-6 flex items-center gap-3">
          {step !== "choose" && (
            <Button variant="ghost" size="icon" onClick={() => setStep("choose")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Medication & Food Intake Checker
          </h1>
        </header>

        {step === "choose" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Select an option</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <RadioTile onClick={() => setStep("under")} title="Under Medication" description="Enter medicine and foods" icon={Pill} />
                <RadioTile onClick={() => setStep("not")} title="Not Under Medication" description="Enter foods and cooking method" icon={Utensils} />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === "under" && (
          <Card>
            <CardHeader><CardTitle>Under Medication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Medicines (comma separated)</Label>
                <Input value={medicines} onChange={(e) => setMedicines(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Foods (comma separated)</Label>
                <Input value={foodsA} onChange={(e) => setFoodsA(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-3">
              <Button onClick={submitUnder} disabled={!canSubmitUnder || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit
              </Button>
              {error && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertTriangle className="h-4 w-4" /><span>{error}</span></div>}
            </CardFooter>
          </Card>
        )}

        {step === "not" && (
          <Card>
            <CardHeader><CardTitle>Not Under Medication</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Foods (comma separated)</Label>
                <Input value={foodsB} onChange={(e) => setFoodsB(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Cooking Method</Label>
                <Input value={cookingMethod} onChange={(e) => setCookingMethod(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-3">
              <Button onClick={submitNot} disabled={!canSubmitNot || loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Submit
              </Button>
              {error && <div className="flex items-center gap-2 text-red-600 text-sm"><AlertTriangle className="h-4 w-4" /><span>{error}</span></div>}
            </CardFooter>
          </Card>
        )}

        {step === "result" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {response && <JsonBlock title="Backend Response" data={response} />}
            {outbound && <JsonBlock title="Request Sent" data={outbound} />}
            <Button variant="secondary" onClick={() => setStep("choose")}>New check</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
