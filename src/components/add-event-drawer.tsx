import {useState} from "react";
import {useStore} from "../store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Plus} from "lucide-react";

function toLocalDatetimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AddEventDrawer() {
  const addEvent = useStore(s => s.addEvent);
  const eventTypes = useStore(s => s.eventTypes); // Fetch dynamic types

  // Initialize with the first available type from store
  const [type, setType] = useState(eventTypes[0]?.id || "");
  const [datetime, setDatetime] = useState(toLocalDatetimeValue(new Date()));
  const [description, setDescription] = useState("");

  function handleSubmit() {
    addEvent({type, datetime: new Date(datetime).toISOString(), description});

    // Reset form
    const firstId = eventTypes[0]?.id || "";
    setType(firstId);
    setDatetime(toLocalDatetimeValue(new Date()));
    setDescription("");
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          className="rounded-2xl h-14 px-8 text-base font-medium shadow-lg self-center">
          <Plus size={20} className="mr-2" />
          Log event
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-lg mx-auto">
        <DrawerHeader>
          <DrawerTitle>Log event</DrawerTitle>
        </DrawerHeader>

        <div className="p-4 grid gap-6 overflow-y-auto max-h-[80vh]">
          {/* Event Type */}
          <div className="grid gap-1.5">
            <Label className="text-xs uppercase tracking-wide">
              Event type
            </Label>
            <Select
              value={type}
              onValueChange={setType}
              disabled={eventTypes.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{background: t.color}}
                      />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {eventTypes.length === 0 && (
              <p className="text-xs text-destructive">
                No event types defined. Please add some in settings.
              </p>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid gap-1.5">
            <Label className="text-xs uppercase tracking-wide">
              Date & time
            </Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-1.5">
            <Label className="text-xs uppercase tracking-wide">
              Description{" "}
              <span className="normal-case opacity-70">(optional)</span>
            </Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Any notes..."
              rows={3}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={eventTypes.length === 0}>
              <Plus size={16} className="mr-2" />
              Log event
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
