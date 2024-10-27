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

const LogsTable = () => {
  const [logs, setLogs] = useState<logs[]>([]);

  useEffect(() => {
    fetch("api/logs")
      .then((res) => res.json())
      .then((data) => setLogs(data.logs));
  }, []);

  return (
    <>
      <Input placeholder="Search..." className="my-5" />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Number</TableHead>
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
          {logs.map((log, index) => (
            <TableRow key={log._id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.message}</TableCell>
              <TableCell>{log.attacker.ip}</TableCell>
              <TableCell>{log.attacker.country}</TableCell>
              <TableCell>{log.attacker.city}</TableCell>
              <TableCell>🇸🇦</TableCell>
              <TableCell>{moment(log.timestamp).fromNow()}</TableCell>
            </TableRow>
          ))}
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
