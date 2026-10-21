import { Button } from "@/components/ui/button";
import Link from "next/link";

export function NavBar() {
  return (
    <div className="flex justify-center"> {/*globally center nav bar*/}
      <div className="w-9/10 p-2 h-10 flex content-center justify-between"> {/*allign items within nav bar*/}
        <div>LawBee</div>
        <div className="flex space-x-2"> {/*button group & spacing*/}
          <a href={`/login`}>
          <Button size="sm" variant="default">
            Sign In
          </Button>
          </a>
          <a href={`/signup`}>
          <Button size="sm" variant="outline">
            Sign Up
          </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
