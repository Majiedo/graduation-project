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
import { Input } from "@/components/ui/input";
import moment from "moment";
import { logs } from "@/types";
import useDebounce from "@/hooks/useDebounce";

const LogsTable = () => {
  const [prompt, setPrompt] = useState<string>("");
  const debounceValue = useDebounce(prompt, 400);
  const [logs, setLogs] = useState<logs[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchLogs = async (prompt?: string) => {
    setLoading(true);
    const res = await fetch(
      `/api/logs${prompt?.length ? `?prompt=${prompt}` : ""}`,
    ).finally(() => setLoading(false));
    const data = await res.json();
    setLogs(data.logs ?? []);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (debounceValue) {
      fetchLogs(debounceValue);
    } else {
      fetchLogs();
    }
  }, [debounceValue]);

  return (
    <>
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Search using ( AI )..."
        className="my-5"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Server ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>IP</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Flag</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center font-bold">
                Nothing found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>{log.serverID}</TableCell>
                <TableCell>{log.type}</TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>{log.attacker.ip}</TableCell>
                <TableCell>{log.attacker.country ?? ""}</TableCell>
                <TableCell>{log.attacker.city ?? ""}</TableCell>
                <TableCell>{log.attacker.flag ?? ""}</TableCell>
                <TableCell>{moment(log.timestamp).fromNow()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>Total</TableCell>
            <TableCell className="text-right">{logs.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default LogsTable;
