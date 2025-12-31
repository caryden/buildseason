import { useState } from "react";
import { Check, ChevronsUpDown, Calendar, Archive, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface Season {
  id: string;
  seasonYear: string;
  seasonName: string;
  isActive: boolean;
  isArchived: boolean;
}

interface SeasonSelectorProps {
  seasons: Season[];
  activeSeasonId?: string | null;
  onSeasonChange?: (seasonId: string) => void;
  onCreateSeason?: () => void;
  className?: string;
  disabled?: boolean;
}

export function SeasonSelector({
  seasons,
  activeSeasonId,
  onSeasonChange,
  onCreateSeason,
  className,
  disabled = false,
}: SeasonSelectorProps) {
  const [open, setOpen] = useState(false);

  const activeSeason = seasons.find((s) => s.id === activeSeasonId);
  const activeSeasons = seasons.filter((s) => !s.isArchived);
  const archivedSeasons = seasons.filter((s) => s.isArchived);

  const handleSeasonChange = (season: Season) => {
    setOpen(false);
    if (onSeasonChange && season.id !== activeSeasonId) {
      onSeasonChange(season.id);
    }
  };

  if (seasons.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onCreateSeason}
        className={cn("gap-2", className)}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Create Season
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select season"
          className={cn("w-[200px] justify-between", className)}
          disabled={disabled}
        >
          {activeSeason ? (
            <span className="flex items-center gap-2 truncate">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {activeSeason.seasonYear} {activeSeason.seasonName}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select season...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No seasons found.</CommandEmpty>
            {activeSeasons.length > 0 && (
              <CommandGroup heading="Active Seasons">
                {activeSeasons.map((season) => (
                  <CommandItem
                    key={season.id}
                    value={`${season.seasonYear} ${season.seasonName}`}
                    onSelect={() => handleSeasonChange(season)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        activeSeasonId === season.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{season.seasonYear}</span>
                        <span className="text-xs text-muted-foreground">
                          {season.seasonName}
                        </span>
                      </div>
                      {season.isActive && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {archivedSeasons.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Archived">
                  {archivedSeasons.map((season) => (
                    <CommandItem
                      key={season.id}
                      value={`${season.seasonYear} ${season.seasonName}`}
                      onSelect={() => handleSeasonChange(season)}
                      className="cursor-pointer opacity-60"
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{season.seasonYear}</span>
                        <span className="text-xs text-muted-foreground">
                          {season.seasonName}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
            {onCreateSeason && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateSeason();
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new season
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
