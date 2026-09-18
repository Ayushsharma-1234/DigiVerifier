"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/shared/PageHeader";
import { INSTRUMENT_CATEGORIES, getRouting } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Check, ChevronsUpDown, UploadCloud } from "lucide-react";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";

const instrumentSchema = z.object({
  category: z.string().min(1, "Instrument category is required"),
  subCategory: z.string().optional(),
  manufacturer: z.string().min(1, "Manufacturer is required"),
  model: z.string().min(1, "Model is required"),
  serialNo: z.string().min(1, "Serial Number is required"),
  accuracyClass: z.string().min(1, "Accuracy class is required"),
  purchaseYear: z.string().regex(/^\d{4}$/, "Must be a valid year").min(1, "Purchase year is required"),
  capacity: z.string().min(1, "Capacity/Range is required"),
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  pincode: z.string().regex(/^\d{6}$/, "Must be a valid 6-digit pincode").min(1, "Pincode is required"),
});

type InstrumentFormValues = z.infer<typeof instrumentSchema>;

const mockStates = ["Maharashtra", "Karnataka", "Delhi", "Gujarat"];
const mockDistricts: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur"],
  "Karnataka": ["Bengaluru", "Mysuru", "Hubballi"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara"],
};

export default function RegisterInstrumentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [openCategory, setOpenCategory] = useState(false);

  const form = useForm<InstrumentFormValues>({
    resolver: zodResolver(instrumentSchema),
    defaultValues: {
      category: "",
      subCategory: "",
      manufacturer: "",
      model: "",
      serialNo: "",
      accuracyClass: "",
      purchaseYear: "",
      capacity: "",
      address1: "",
      address2: "",
      state: "",
      district: "",
      pincode: "",
    },
  });

  const selectedCategory = form.watch("category");
  const isGATC = selectedCategory ? getRouting(selectedCategory) === "GATC" : false;
  const selectedState = form.watch("state");

  const onNext = async () => {
    const isValid = await form.trigger();
    if (isValid) setStep(2);
  };

  const onSubmit = async () => {
    // Mock API Call
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Registering instrument...',
        success: () => {
          router.push('/instruments');
          return 'Instrument registered successfully!';
        },
        error: 'Failed to register instrument.',
      }
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader
        title="Register New Instrument"
        subtitle="Step 1 of 2: Instrument Details"
        breadcrumbs={[
          { label: "My Instruments", href: "/instruments" },
          { label: "Register New Instrument" }
        ]}
      />

      {/* Stepper Visual */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={twMerge("flex items-center justify-center w-8 h-8 rounded-full font-bold", step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>1</div>
        <div className={twMerge("h-1 w-16", step >= 2 ? "bg-primary" : "bg-gray-200")}></div>
        <div className={twMerge("flex items-center justify-center w-8 h-8 rounded-full font-bold", step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500")}>2</div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            {step === 1 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                {/* Category Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Instrument Classification</h3>

                  <div className="space-y-2 flex flex-col">
                    <Label>Instrument Category <span className="text-red-500">*</span></Label>
                    <Popover open={openCategory} onOpenChange={setOpenCategory}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCategory}
                          className={twMerge("justify-between", !selectedCategory && "text-muted-foreground", form.formState.errors.category && "border-danger")}
                        >
                          {selectedCategory
                            ? INSTRUMENT_CATEGORIES.find((cat) => cat === selectedCategory)
                            : "Select category..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {INSTRUMENT_CATEGORIES.map((cat) => (
                                <CommandItem
                                  key={cat}
                                  value={cat}
                                  onSelect={(currentValue) => {
                                    form.setValue("category", currentValue === selectedCategory ? "" : currentValue, { shouldValidate: true });
                                    setOpenCategory(false);
                                  }}
                                >
                                  <Check className={twMerge("mr-2 h-4 w-4", selectedCategory === cat ? "opacity-100" : "opacity-0")} />
                                  {cat}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.category && <p className="text-xs text-danger">{form.formState.errors.category.message}</p>}
                  </div>

                  {isGATC && (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-900">
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertDescription>
                        <strong>Note:</strong> This instrument category is verified by Government Approved Test Centres (GATCs) as per the Legal Metrology GATC Rules, 2025.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sub-category (Optional)</Label>
                      <Input placeholder="E.g., Electronic, Mechanical" {...form.register("subCategory")} />
                    </div>
                  </div>
                </div>

                {/* Specifics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Make/Manufacturer <span className="text-red-500">*</span></Label>
                      <Input placeholder="Enter manufacturer name" {...form.register("manufacturer")} className={form.formState.errors.manufacturer ? "border-danger" : ""} />
                      {form.formState.errors.manufacturer && <p className="text-xs text-danger">{form.formState.errors.manufacturer.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Model Number <span className="text-red-500">*</span></Label>
                      <Input placeholder="Enter model number" {...form.register("model")} className={form.formState.errors.model ? "border-danger" : ""} />
                      {form.formState.errors.model && <p className="text-xs text-danger">{form.formState.errors.model.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Serial Number <span className="text-red-500">*</span></Label>
                      <Input placeholder="Enter unique serial number" {...form.register("serialNo")} className={form.formState.errors.serialNo ? "border-danger" : ""} />
                      {form.formState.errors.serialNo && <p className="text-xs text-danger">{form.formState.errors.serialNo.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Accuracy Class <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(val) => form.setValue("accuracyClass", val)} defaultValue={form.watch("accuracyClass")}>
                        <SelectTrigger className={form.formState.errors.accuracyClass ? "border-danger" : ""}>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Class I">Class I (Special)</SelectItem>
                          <SelectItem value="Class II">Class II (High)</SelectItem>
                          <SelectItem value="Class III">Class III (Medium)</SelectItem>
                          <SelectItem value="Class IIII">Class IIII (Ordinary)</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.accuracyClass && <p className="text-xs text-danger">{form.formState.errors.accuracyClass.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Year of Purchase <span className="text-red-500">*</span></Label>
                      <Input placeholder="YYYY" maxLength={4} {...form.register("purchaseYear")} className={form.formState.errors.purchaseYear ? "border-danger" : ""} />
                      {form.formState.errors.purchaseYear && <p className="text-xs text-danger">{form.formState.errors.purchaseYear.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Capacity / Range <span className="text-red-500">*</span></Label>
                      <Input placeholder="E.g., 0-100 kg, Max 500L" {...form.register("capacity")} className={form.formState.errors.capacity ? "border-danger" : ""} />
                      {form.formState.errors.capacity && <p className="text-xs text-danger">{form.formState.errors.capacity.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Place of Use / Location</h3>
                  <div className="space-y-2">
                    <Label>Address Line 1 <span className="text-red-500">*</span></Label>
                    <Input placeholder="Flat/House No, Building, Street" {...form.register("address1")} className={form.formState.errors.address1 ? "border-danger" : ""} />
                    {form.formState.errors.address1 && <p className="text-xs text-danger">{form.formState.errors.address1.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Address Line 2</Label>
                    <Input placeholder="Locality, Area (Optional)" {...form.register("address2")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>State <span className="text-red-500">*</span></Label>
                      <Select onValueChange={(val) => { form.setValue("state", val); form.setValue("district", ""); }} defaultValue={form.watch("state")}>
                        <SelectTrigger className={form.formState.errors.state ? "border-danger" : ""}>
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockStates.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.state && <p className="text-xs text-danger">{form.formState.errors.state.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>District <span className="text-red-500">*</span></Label>
                      <Select disabled={!selectedState} onValueChange={(val) => form.setValue("district", val)} value={form.watch("district")}>
                        <SelectTrigger className={form.formState.errors.district ? "border-danger" : ""}>
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedState && mockDistricts[selectedState]?.map(dst => <SelectItem key={dst} value={dst}>{dst}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.district && <p className="text-xs text-danger">{form.formState.errors.district.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label>Pincode <span className="text-red-500">*</span></Label>
                      <Input placeholder="6-digit pincode" maxLength={6} {...form.register("pincode")} className={form.formState.errors.pincode ? "border-danger" : ""} />
                      {form.formState.errors.pincode && <p className="text-xs text-danger">{form.formState.errors.pincode.message}</p>}
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold border-b pb-2">Documents</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <UploadCloud className="h-10 w-10 text-primary mb-3" />
                    <p className="font-semibold text-gray-900">Click to upload Invoice/Purchase Document</p>
                    <p className="text-sm text-gray-500 mt-1">Accepts PDF, JPG, PNG (Max 5MB)</p>
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={onNext} className="w-full sm:w-auto min-w-[150px]">
                    Next Step &rarr;
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">

                <Alert className="bg-amber-50 border-amber-200 text-amber-900">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertDescription>
                    After registration, you can apply for verification. Your instrument will need to be verified within the applicable period as per the Legal Metrology General Rules, 2011.
                  </AlertDescription>
                </Alert>

                <div className="bg-slate-50 border rounded-lg p-6 space-y-6">
                  <h3 className="text-lg font-bold border-b pb-2">Review Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                    <div><span className="text-gray-500 block mb-1">Category</span><span className="font-semibold">{form.getValues("category")}</span></div>
                    <div><span className="text-gray-500 block mb-1">Make/Manufacturer</span><span className="font-semibold">{form.getValues("manufacturer")}</span></div>

                    <div><span className="text-gray-500 block mb-1">Model</span><span className="font-semibold">{form.getValues("model")}</span></div>
                    <div><span className="text-gray-500 block mb-1">Serial Number</span><span className="font-semibold font-mono">{form.getValues("serialNo")}</span></div>

                    <div><span className="text-gray-500 block mb-1">Accuracy Class</span><span className="font-semibold">{form.getValues("accuracyClass")}</span></div>
                    <div><span className="text-gray-500 block mb-1">Capacity</span><span className="font-semibold">{form.getValues("capacity")}</span></div>

                    <div className="md:col-span-2 mt-4 pt-4 border-t"><span className="text-gray-500 block mb-1">Location of Use</span><span className="font-semibold">{form.getValues("address1")}, {form.getValues("district")}, {form.getValues("state")} - {form.getValues("pincode")}</span></div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>
                    &larr; Back to Edit
                  </Button>
                  <Button type="submit" className="bg-secondary hover:bg-secondary/90 text-white min-w-[150px]">
                    Register Instrument
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
