import { blacklist } from "@/types";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import { AddBlacklistModal } from "./AddBlacklistModal";

const BlacklistTable = () => {
  const [search, setSearch] = useState<string>("");
  const [blacklist, setBlacklist] = useState<blacklist[]>([]);
  const [modal, setModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch("api/blacklist")
      .then((res) => res.json())
      .then((data) => setBlacklist(data.blacklist));
  }, []);

  const handleDelete = (id: string) => {
    fetch(`api/blacklist/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => setBlacklist(data.blacklist));
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by IP or Reason..."
          className="my-5"
        />
        <Button onClick={() => setModal(true)}>Add to blacklist</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {blacklist.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center font-bold">
                Nothing found
              </TableCell>
            </TableRow>
          ) : (
            blacklist
              .filter(
                (item) =>
                  item.ip.toLowerCase().includes(search.toLowerCase()) ||
                  item.reason.toLowerCase().includes(search.toLowerCase()),
              )
              .map((item, index) => (
                <TableRow key={item._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.ip}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{moment(item.timestamp).fromNow()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(item._id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">{blacklist.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <AddBlacklistModal
        open={modal}
        onClose={() => setModal(false)}
        onSuccess={(data) => {
          setBlacklist(data);
          setModal(false);
        }}
      />
    </>
  );
};

export default BlacklistTable;
