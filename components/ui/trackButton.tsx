import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { isBillStored, UpsertBill } from "@/app/auth/api/supabaseRestCalls";

export default function TrackButton({ id }: { id: number }) {

  const [tracked, setTracked] = useState<boolean | null>(null);
  /*
  const searchUserBills = (db, id) => {
    var inDb; //stores iterative data temporarily?
    //iterate through db keys, if bill id is in the db, return in db
    return inDb;
  }
  */
  
  const initButton = async() => {
    try {
      const result = await isBillStored(id);
      // Check if result exists and has at least one item
      if (result && Array.isArray(result) && result.length > 0 && result[0]) {
        return result[0]["is_stored"] || false;
      }
      return false; // Bill not stored yet
    } catch (error) {
      console.error("Error checking if bill is stored:", error);
      return false;
    }
  };
 
  useEffect(() => {
    if (tracked === null) //all buttons initialize as null
      initButton().then(data => setTracked(data)).catch(error => {
        console.error("Error initializing button:", error);
        setTracked(false);
      }); //async promise .then waits for it to resolve and passes const from resolved promise
  }, [id]);


  const handleClick = async () => {
    setTracked(await UpsertBill(id, !tracked));  //if item in user db set as tracked and add, else set as untracked and remove
    ; //ideally setTracked(upsert > returned value from promise) 
        //the external table submits id as an object {'id': data} 
        //using object notation after the data query returns an empty object
        //so we use it here
        //id is not id from the input variable name, but is actually a generic identifier
        //it puts on every row item when passing it as data
  }; 
  
  return (
    <Button onClick={handleClick}  variant={tracked? "default": "outline"}>
      {tracked? "Tracked":"Track Bill"}
    </Button>
  );
}