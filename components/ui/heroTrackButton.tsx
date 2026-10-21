import { useState } from 'react';
import { Button } from "@/components/ui/button";

export function HeroTrackButton() {

  const [tracked, setTracked] = useState(true); 

  const handleClick = async () => {
    setTracked(!tracked);
  }; 
  
  return (
    <Button onClick={handleClick}  variant={tracked? "default": "outline"}>
      {tracked? "Track Bills":"Untrack Bills"}
    </Button>
  );
}
