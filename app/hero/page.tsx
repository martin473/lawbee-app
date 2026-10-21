'use client';
import { Button } from "@/components/ui/button";
import { HeroTrackButton } from "@/components/ui/heroTrackButton";
import { Label } from "@/components/ui/label";
import Search from "@/components/ui/search";
import { Input } from "@/components/ui/input";
import { NavBar } from "@/components/ui/navbar-unified";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function HeroPage() {
  return(
    /*Fullscreen bounding box*/
    <div className="flex flex-col justify-content">
      <NavBar />
      <div className="w-dvw h-auto flex flex-col justify-center items-center">
        
        {/*Centered smaller bounding box*/}
        <div className="w-3/5 flex justify-center items-center flex-col space-y-8">
        
          {/*Seach Bar*/}
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight justify-start">
              Find Bills in current State or Federal government.
            </h3>
            <p className="text-muted-foreground text-sm justify-start">
              USA
            </p>
          </div>
          <div className="w-full relative justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute top-0 bottom-0 w-6 h-6 my-auto text-gray-500 left-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Field className="pl-12 pr-4" >
                <Input className='bg-white' id="email" name="email" type="email" placeholder="Reproductive Rights Rhode Island" />
            </Field>
          </div>
          {/*Fake Bill*/}
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight justify-start">
            Keep track of important Bills.
          </h3>
          <div className="flex space-x-4 w-full relative justify-center items-center">
            <HeroTrackButton/>
            <Label className="font-small">S480</Label>
            <Label>Housing Policy Update Regarding...</Label>
            <Label className="font-small">Introduced, Awaiting Hearing</Label>
          </div>
          {/*Results Table*/}
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight justify-start">
            Share up to date information with anyone on your own personalized page
          </h3>
          <div className="border-1 rounded-lg">
            <TableDemo></TableDemo>
          </div>
          <div className="justify-start">
          <p className="text-muted-foreground text-sm">
            This website is currently in beta! We appreciate your patience while we work out the kinks.
          </p>
          <p className="text-muted-foreground text-sm">
            All tracking is currently working. Pages viewable to the public coming soon.
          </p>
          <p className="text-muted-foreground text-sm">
            Rhode Island is currently the only state available in searches. Nationwide search coming soon.
          </p>
          </div>
          
        </div>
      </div>
    </div>
  )
}



const bills = [
  {
    id: "S480",
    title: "Housing Policy Update Regarding...",
    status: "Introduced, Awaiting Hearing",
    link: "dummy",
  },
  {
    id: "H208",
    title: "Transit Authority Overhaul Including...",
    status: "Transit Committee Hearing Scheduled Feb 14",
    link: "dummy",
  },
  {
    id: "S303",
    title: "Weapons Registration Requirement With....",
    status: "Passed",
    link: "dummy",
  },
  {
    id: "H808",
    title: "Labor Rights Inclusion Of...",
    status: "Reintroduced Next Session",
    link: "dummy",
  },
]

export function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bill Number</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Link to Bill</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bills) => (
          <TableRow key={bills.id}>
            <TableCell>{bills.id}</TableCell>
            <TableCell className="font-medium">{bills.title}</TableCell>
            <TableCell>{bills.status}</TableCell>
            <TableCell><u>Link</u></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

