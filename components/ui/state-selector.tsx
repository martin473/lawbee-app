'use client';

import { LEGISCAN_STATES } from '@/lib/legiscan-states';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface StateSelectorProps {
  selectedState: string;
  onStateChange: (state: string) => void;
}

export function StateSelector({ selectedState, onStateChange }: StateSelectorProps) {
  const selectedStateName = LEGISCAN_STATES.find(s => s.code === selectedState)?.name || selectedState;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[180px] justify-between">
          <span>{selectedStateName}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
        {LEGISCAN_STATES.map((state) => (
          <DropdownMenuItem
            key={state.code}
            onClick={() => onStateChange(state.code)}
            className={selectedState === state.code ? 'bg-accent' : ''}
          >
            <span className="font-medium w-8">{state.code}</span>
            <span className="ml-2">{state.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
