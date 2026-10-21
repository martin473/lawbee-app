import { searchBills } from "@/lib/legiscan";

// Server component: calls LegiScan through the server-only client.
export default async function Results ({ query }:{query: string}){
    const result = await searchBills("RI", query);
    const bills = await result.searchresult;
    const headers = await Object.keys(bills[0]);

    return(
    <table className=" w-full table-auto">
      <caption className="caption-top">
        RI
      </caption>
      <thead className="bg-gray-700 text-left border border-collapse border-gray-700 border-1">
        <tr>
          {headers.map((header) => (<th className="px-2.5 py-2 text-start font-medium" key={header}>{header}</th>))}
        </tr>
      </thead>
      <tbody className="">
        {Object.values(bills).map( (item, index) => {
          const billItem = item as Record<string, unknown>;
          return (
            <tr className="bg-gray-900 border border-collapse border-gray-700 " key={index}>
              {headers.map((header) => (
                <td className="p-3" key={header}>{String(billItem[header] ?? '')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
    )
}