import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays } from "lucide-react";
import React, { useState } from "react";

export default function RequestDataDialog({
  open,
  onOpenChange,
  onSubmit,
  emailId,
  loadingAction,
  selectedTypes,
  setSelectedTypes,
  note,
  setNote
}) {
  const [deadline, setDeadline] = useState("");

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = () => {
    const requestData = {
      emailId, // 👈 Include the target email
      type: selectedTypes,
      note,
    };
    onSubmit(requestData);
    setSelectedTypes([]);
    setNote("");
    // loadingAction == "" && onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
            Request Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the type of data you would like to request:
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[
              "Pitch DECK",
              "MIS",
              "Historicals",
              "Financial Projections",
              "Market Research",
              "User co-horts",
              "Roadmap",
            ].map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Additional Data
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any specific instructions or details..."
              className="text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleSubmit}
          >
            {loadingAction === "request_data"
              ? "Requesting..."
              : "Request Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
