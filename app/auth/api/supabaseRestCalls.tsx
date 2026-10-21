import supabaseRestConfig from "./supabaseRestConfig";
import { createClient } from '@/utils/supabase/client'

export async function UpsertBill(billId: number, tracked: boolean) {
  const supabase = await createClient() //make connection
  const { data, error } = await supabase //make request
    .from(supabaseRestConfig.table) //from main table
    .upsert({                       //upsert to supabase with legiscan api retrieved data
      bill_id: billId,
      is_stored: tracked, })
    .select()                       //return upserted data from supabase
  if (error) throw error;
  return data[0]['is_stored']      //return stored state (true false) of bill
};



export async function SelectBills() {
  const supabase = await createClient() //Make connection
  const { data, error } = await supabase //make request
    .from(supabaseRestConfig.table) //from main table
    .select()
    .eq('is_stored', true)                       //select all results that match userid and is_stored is true (config on returned data inside supabase)
  if (error) throw error;
  
  const trackedBills = data.map((row) => row['bill_id']);
  return trackedBills
}

export async function isBillStored(id: number) {
  const supabase = await createClient() //Make connection
  const { data, error } = await supabase //make request
    .from(supabaseRestConfig.table) //from main table
    .select()
    .eq('bill_id', id)                       //select all results that match userid and is_stored is true (config on returned data inside supabase)
  if (error) throw error;
  
  return data
}

//supabase on the backend and with this page's middleware 
//will automatically submit the authenticated user id
//then supabase will create a new row with the submitted data
//and add the userId and current datetime

//when requesting data from supabase
//it will use user auth to select only rows that match the current
//user's id