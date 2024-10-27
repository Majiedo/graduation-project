import LogsTable from "@/components/LogsTable";
import BlacklistTable from "@/components/BlacklistTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Logs = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-y-5 pt-10 font-mono">
      <Tabs defaultValue="logs" className="w-2/3">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
        </TabsList>
        <TabsContent value="logs">
          <LogsTable />
        </TabsContent>
        <TabsContent value="blacklist">
          <BlacklistTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Logs;
