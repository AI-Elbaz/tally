import {useState} from "react";
import {Plus, Settings, Trash2} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import {Button} from "./ui/button";
import {Input} from "./ui/input";
import {useStore} from "../store";

const COLORS = [
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#eab308", // Yellow
  "#10b981", // Green
  "#8b5cf6", // Purple
  "#f472b6", // Pink
];

export function ManageEventsDrawer() {
  const {eventTypes, addEventType, removeEventType} = useStore();

  // Form state
  const [label, setLabel] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAdd = () => {
    if (!label.trim()) return;
    addEventType({label, color: selectedColor});
    setLabel("");
    // Keep the same color or reset? Let's keep it for speed.
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon-lg"
          className="rounded-xl"
          aria-label="Manage Event Types">
          <Settings />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-md mx-auto flex flex-col max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle>Manage Event Types</DrawerTitle>
          <p className="text-sm text-muted-foreground">
            Add or remove categories for your events.
          </p>
        </DrawerHeader>

        <div className="overflow-y-auto flex-1 px-4 pb-4 flex flex-col gap-6">
          {/* Add New Type */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Add New
            </h3>

            <Input
              placeholder="Event name (e.g. Workout)"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />

            {/* Color Picker */}
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color
                      ? "ring-2 ring-offset-2 ring-black dark:ring-white"
                      : ""
                  }`}
                  style={{backgroundColor: color}}
                />
              ))}
            </div>

            <Button onClick={handleAdd} className="w-full">
              <Plus size={16} className="mr-2" />
              Add Type
            </Button>
          </div>

          {/* List Existing Types */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Current Types
            </h3>
            <div className="flex flex-col gap-2">
              {eventTypes.map(type => (
                <div
                  key={type.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{backgroundColor: type.color}}
                    />
                    <span className="font-medium text-sm">{type.label}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEventType(type.id)}
                    className="text-muted-foreground hover:text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              {eventTypes.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  No types added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
