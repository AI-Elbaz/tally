import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {Check, Palette} from "lucide-react";
import {THEMES} from "@/configs";
import {Button} from "./ui/button";
import {useTheme} from "next-themes";

export function ThemeDrawer() {
  const {theme, setTheme} = useTheme();

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          aria-label="Change theme">
          <Palette size={16} />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-w-3xl mx-auto">
        <DrawerHeader>
          <DrawerTitle>Choose a theme</DrawerTitle>
        </DrawerHeader>

        <div className="grid grid-cols-2 gap-3 p-2 max-h-[70vh] overflow-y-auto">
          {THEMES.map(themeItem => {
            const isActive = theme === themeItem.id;

            return (
              <DrawerClose
                asChild
                key={themeItem.id}
                onClick={() => setTheme(themeItem.id)}>
                <button
                  className={`
                  w-full snap-start shrink-0 flex flex-col rounded-2xl overflow-hidden 
                  transition-all active:scale-95 text-left relative group
                  ${isActive ? "ring-2 ring-offset-2" : ""}
                `}
                  style={{
                    backgroundColor: themeItem.previewBg,
                    color: themeItem.previewFg,
                    outlineColor: isActive
                      ? themeItem.previewFg
                      : "transparent",
                    outlineOffset: 2,
                  }}>
                  <div
                    className="w-full flex flex-col p-3 gap-2"
                    style={{
                      height: 110,
                      backgroundColor: themeItem.previewBg,
                    }}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1.5">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: isActive
                              ? themeItem.previewFg
                              : "rgba(0,0,0,0.1)",
                          }}
                        />
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: themeItem.previewFg,
                            opacity: 0.4,
                          }}
                        />
                      </div>
                      {isActive && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                          style={{backgroundColor: themeItem.previewFg}}>
                          <Check
                            size={11}
                            style={{color: themeItem.previewBg}}
                          />
                        </div>
                      )}
                    </div>
                    <div className="mt-auto flex flex-col gap-1">
                      <div
                        className="h-1.5 rounded-full w-10"
                        style={{
                          backgroundColor: themeItem.previewFg,
                          opacity: 0.35,
                        }}
                      />
                      <div
                        className="h-1.5 rounded-full w-14"
                        style={{
                          backgroundColor: themeItem.previewFg,
                          opacity: 0.18,
                        }}
                      />
                      <div
                        className="h-1.5 rounded-full w-8"
                        style={{
                          backgroundColor: themeItem.previewFg,
                          opacity: 0.18,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2.5 border-t"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.5)",
                      borderColor: "rgba(0,0,0,0.05)",
                      color: themeItem.previewFg,
                    }}>
                    <p className="text-xs font-medium leading-tight">
                      {themeItem.name}
                    </p>
                    <p className="text-[10px] mt-0.5 opacity-70">
                      {themeItem.description}
                    </p>
                  </div>
                </button>
              </DrawerClose>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
